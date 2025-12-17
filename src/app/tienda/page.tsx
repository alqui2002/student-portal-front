"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PanelLeft, Plus, X } from "lucide-react";
import { jwtDecode } from "jwt-decode";

import {
  getBalance,
  getPurchaseHistory,
  syncWallet,
  getWalletTransactions,
} from "@/lib/api/tienda";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

type Compra = {
  id: string;
  date: string;
  total: number;
  product: {
    name: string;
    description: string;
    quantity: number;
    subtotal: number;
  }[];
};

type WalletTransfer = {
  uuid: string;
  from_wallet_uuid: string;
  to_wallet_uuid: string;
  amount: string;
  description?: string;
  created_at: string;
  type: "TRANSFER" | "RESERVA" | "SANCION" | "INSCRIPCION_EVENTO";
};

export default function StorePage() {
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Compra | null>(null);
  type FilterType =
    | "ALL"
    | "PURCHASES"
    | "TRANSFERS"
    | "DINNING"
    | "SANCION"
    | "EVENTO";

  const [filter, setFilter] = useState<FilterType>("ALL");

  const [spentThisMonth, setSpentThisMonth] = useState(0);
  const [loadedThisMonth, setLoadedThisMonth] = useState(0);

  const token =
    typeof document !== "undefined"
      ? document.cookie
          .split("; ")
          .find(r => r.startsWith("JWT="))
          ?.split("=")[1]
      : null;

  const decoded: any = token ? jwtDecode(token) : null;
  const myWalletId: string | undefined = decoded?.wallet?.[0];

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      await syncWallet().catch(() => {});

      let purchases: Compra[] = [];
      let transfers: Compra[] = [];

      try {
        const rawPurchases = await getPurchaseHistory();
        purchases = rawPurchases.map((p: any) => ({
          id: p.id,
          date: p.date,
          total: Number(p.total),
          product: p.product.map((x: any) => ({
            name: x.name,
            description: x.description ?? "",
            quantity: Number(x.quantity ?? 1),
            subtotal: Number(x.subtotal),
          })),
        }));
      } catch {}

      try {
        const rawTransfers =
          (await getWalletTransactions()) as WalletTransfer[];

        transfers = rawTransfers
          .filter(
            t =>
              t.to_wallet_uuid === myWalletId ||
              t.from_wallet_uuid === myWalletId
          )
          .map(t => {
            const amount = Number(t.amount);

            if (t.type === "RESERVA") {
              return {
                id: t.uuid,
                date: t.created_at,
                total: -amount,
                product: [
                  {
                    name: "RESERVA",
                    description: t.description ?? "Pago de reserva",
                    quantity: 1,
                    subtotal: amount,
                  },
                ],
              };
            }

            if (t.type === "SANCION") {
              return {
                id: t.uuid,
                date: t.created_at,
                total: -amount,
                product: [
                  {
                    name: "SANCION",
                    description: t.description ?? "Sanción aplicada",
                    quantity: 1,
                    subtotal: amount,
                  },
                ],
              };
            }

            if (t.type === "INSCRIPCION_EVENTO") {
              return {
                id: t.uuid,
                date: t.created_at,
                total: -amount,
                product: [
                  {
                    name: "INSCRIPCION_EVENTO",
                    description: t.description ?? "Inscripción a evento",
                    quantity: 1,
                    subtotal: amount,
                  },
                ],
              };
            }

            const incoming = t.to_wallet_uuid === myWalletId;
            const signed = incoming ? amount : -amount;

            return {
              id: t.uuid,
              date: t.created_at,
              total: signed,
              product: [
                {
                  name: incoming
                    ? "Transferencia recibida"
                    : "Transferencia enviada",
                  description: t.description ?? "",
                  quantity: 1,
                  subtotal: signed,
                },
              ],
            };
          });
      } catch {}

      const unified = [...purchases, ...transfers].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setHistory(unified);

      const now = new Date();
      const m = now.getMonth();
      const y = now.getFullYear();

      let spent = 0;
      let loaded = 0;

      unified.forEach(h => {
        const d = new Date(h.date);
        if (d.getMonth() !== m || d.getFullYear() !== y) return;

        const isTransfer =
          h.product.length === 1 &&
          h.product[0].name.startsWith("Transferencia");

        if (!isTransfer && h.total > 0) spent += h.total;
        if (isTransfer && h.total > 0) loaded += h.total;
      });

      setSpentThisMonth(spent);
      setLoadedThisMonth(loaded);

      try {
        const b = await getBalance();
        setBalance(Number(b.balance));
      } catch {}

      setLoading(false);
    };

    load();
  }, [myWalletId]);

  const isTransfer = (c: Compra) =>
    c.product.length === 1 && c.product[0].name.startsWith("Transferencia");

  const isDinningReservation = (c: Compra) =>
    c.product.some(p => p.name === "RESERVA");

  const isSanction = (c: Compra) => c.product.some(p => p.name === "SANCION");

  const isEventEnrollment = (c: Compra) =>
    c.product.some(p => p.name === "INSCRIPCION_EVENTO");

  const isStorePurchase = (c: Compra) =>
    !isTransfer(c) &&
    !isDinningReservation(c) &&
    !isSanction(c) &&
    !isEventEnrollment(c);

  const formatMoney = (n: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(n);

  const filteredHistory = history.filter(h => {
    if (filter === "ALL") return true;
    if (filter === "PURCHASES") return isStorePurchase(h);
    if (filter === "TRANSFERS") return isTransfer(h);
    if (filter === "DINNING") return isDinningReservation(h);
    if (filter === "SANCION") return isSanction(h);
    if (filter === "EVENTO") return isEventEnrollment(h);

    return true;
  });

  return (
    <main className="w-full flex flex-col bg-white">
      <div className="pt-9 pb-9 pl-8 flex items-center gap-4 border-b">
        <PanelLeft size={15} />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Tienda</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="p-8 flex-grow overflow-auto space-y-8">
        <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Saldo institucional</h1>

            <Link href="/tienda/cargarSaldo">
              <Button className="bg-[#6F97F0] hover:bg-[#5a81d4] cursor-pointer">
                <Plus className="mr-2 h-4 w-4" />
                Cargar saldo
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-100 rounded-lg p-6 flex flex-col gap-2">
              <span className="text-2xl font-bold text-gray-800">
                {formatMoney(balance)}
              </span>
              <span className="text-sm text-gray-500">Saldo disponible</span>
            </div>

            <div className="bg-gray-100 rounded-lg p-6 flex flex-col gap-2">
              <span className="text-2xl font-bold text-gray-800">
                {formatMoney(spentThisMonth)}
              </span>
              <span className="text-sm text-gray-500">Gastado este mes</span>
            </div>

            <div className="bg-gray-100 rounded-lg p-6 flex flex-col gap-2">
              <span className="text-2xl font-bold text-gray-800">
                {formatMoney(loadedThisMonth)}
              </span>
              <span className="text-sm text-gray-500">Total cargado</span>
            </div>
          </div>
        </section>
      </div>

      <div className="flex gap-2 mb-4 ml-8">
        <Button
          variant={filter === "ALL" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("ALL")}
        >
          Todos
        </Button>

        <Button
          variant={filter === "PURCHASES" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("PURCHASES")}
        >
          Compras
        </Button>

        <Button
          variant={filter === "TRANSFERS" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("TRANSFERS")}
        >
          Transferencias
        </Button>

        <Button
          variant={filter === "DINNING" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("DINNING")}
        >
          Reservas de comedor
        </Button>
        <Button
          variant={filter === "SANCION" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("SANCION")}
        >
          Pagos de sanciones
        </Button>
        <Button
          variant={filter === "EVENTO" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("EVENTO")}
        >
          Inscripción a eventos
        </Button>
      </div>

      <section className="border rounded-2xl p-6 ml-8 mr-8">
        <h2 className="text-2xl font-bold mb-4">Historial de movimientos</h2>

        <div className="space-y-4">
          {filteredHistory.map(h => (
            <div
              key={h.id}
              className="border rounded-xl p-4 flex justify-between cursor-pointer hover:bg-gray-50"
              onClick={() => !isTransfer(h) && setSelected(h)}
            >
              <div>
                <p className="font-semibold">
                  {isTransfer(h)
                    ? h.product[0].name
                    : isDinningReservation(h)
                      ? "Reserva de comedor"
                      : isSanction(h)
                        ? "Sanción"
                        : isEventEnrollment(h)
                          ? "Inscripción a evento"
                          : "Compra de tienda"}
                </p>

                <p className="text-sm text-gray-500">
                  {new Date(h.date).toLocaleDateString("es-AR")}
                </p>
              </div>

              <p
                className={`font-bold ${
                  h.total < 0 ? "text-red-600" : "text-green-600"
                }`}
              >
                {h.total < 0 ? "-" : "+"}
                {formatMoney(Math.abs(h.total))}
              </p>
            </div>
          ))}
        </div>
      </section>

      <AlertDialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-2xl font-bold pt-4">
              Resumen de compra
            </AlertDialogTitle>

            <button
              onClick={() => setSelected(null)}
              className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </AlertDialogHeader>

          <AlertDialogDescription asChild>
            <VisuallyHidden>
              Detalles completos de la compra seleccionada, incluyendo fecha,
              entidad, lista de productos y montos totales.
            </VisuallyHidden>
          </AlertDialogDescription>

          <Separator />

          <div className="py-2 space-y-3">
            <div className="text-base">
              <span className="font-bold text-gray-900">Fecha: </span>
              <span className="text-gray-600">
                {selected &&
                  new Date(selected.date).toLocaleDateString("es-AR")}
              </span>
            </div>

            <div className="text-base">
              <span className="font-bold text-gray-900">Entidad: </span>
              <span className="text-gray-600">Tienda</span>
            </div>
          </div>

          <Separator />

          <div className="py-2 space-y-4">
            <h3 className="text-lg font-bold">Detalles de pago</h3>

            <div className="space-y-3">
              {selected?.product.map((prod, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {prod.name} x{prod.quantity}
                  </span>
                  <span className="font-medium text-gray-900">
                    {formatMoney(prod.subtotal)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="py-2 flex justify-between">
            <span className="text-lg font-bold">Total</span>
            <span className="text-lg font-bold">
              {formatMoney(Math.abs(selected?.total ?? 0))}
            </span>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
