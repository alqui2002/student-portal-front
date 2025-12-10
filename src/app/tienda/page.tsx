"use client";

import React, { useState, useEffect, ReactNode } from "react";
import Link from "next/link";
import { PanelLeft, Plus, X } from "lucide-react";
import { AlertDialogDescription } from "@/components/ui/alert-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import {
  getBalance,
  getPurchaseHistory,
  syncPurchases,
  syncWallet,
} from "@/lib/api/tienda";
import { Saldo } from "@/lib/api/types";
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
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import Loader from "@/components/ui/loader";

export default function StorePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Compra | null>(null);
  const [balance, setBalance] = useState<Saldo | null>(null);
  const [purchaseHistory, setPurchaseHistory] = useState<Compra[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [spentThisMonth, setSpentThisMonth] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        const balanceData = await getBalance();
        setBalance(balanceData);
      } catch (error: any) {}

      try {
        const historyData = await getPurchaseHistory();
        const transformedHistory = historyData.map(item => {
          const products = Array.isArray(item.product)
            ? item.product
            : [item.product];

          return {
            ...item,
            product: products.map(prod => ({
              name:
                typeof prod === "object" && "name" in prod
                  ? (prod.name ?? "Producto sin nombre")
                  : "Producto sin nombre",
              description: prod.description ?? "",
              quantity:
                typeof prod === "object" && "quantity" in prod
                  ? prod.quantity || 0
                  : 0,
              subtotal:
                typeof prod === "object" && "subtotal" in prod
                  ? Number(prod.subtotal) || 0
                  : 0,
            })),
          };
        });

        setPurchaseHistory(transformedHistory);
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const totalSpent = transformedHistory
          .filter(p => {
            const date = new Date(p.date);

            const isTransfer =
              p.product.length === 1 &&
              p.product[0].name === "Transferencia recibida";

            return (
              !isTransfer &&
              date.getMonth() === currentMonth &&
              date.getFullYear() === currentYear
            );
          })
          .reduce((sum, p) => sum + Number(p.total), 0);

        setSpentThisMonth(totalSpent);
      } catch (error: any) {
        console.error("Purchase history not found", error.message);
        setPurchaseHistory([]);
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    const options: Intl.NumberFormatOptions = {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    };
    return new Intl.NumberFormat("es-AR", options).format(amount);
  };

  const formatHistoryAmount = (amount: number) => {
    const formattedAmount = new Intl.NumberFormat("es-AR", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

    return `$${formattedAmount}`;
  };

  const handlePurchaseClick = (purchase: Compra) => {
    const isTransfer =
      purchase.product.length === 1 &&
      purchase.product[0].name === "Transferencia recibida";

    if (isTransfer) {
      console.log("No se abre modal porque es transferencia");
      return;
    }

    setSelectedPurchase(purchase);
    setIsModalOpen(true);
  };

  const formatPopupDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getEntidad = (purchase: Compra | null) => {
    if (!purchase) return "";
    const first = purchase.product?.[0];
    if (!first) return "Tienda General";

    if (first.description.includes("Biblioteca")) return "Biblioteca";
    if (first.description.includes("Cafetería")) return "Cafetería";
    return "Tienda General";
  };

  const getTituloCompra = (purchase: Compra) => {
    const p = purchase.product;

    if (p.length === 1 && p[0].name === "Transferencia recibida") {
      return "Transferencia";
    }

    if (p.length === 1) {
      return "Compra en tienda";
    }

    return `${p.length} productos`;
  };

  if (isLoading) return <Loader message="Cargando tienda..." />;

  return (
    <main className="w-full flex flex-col bg-white">
      {/* HEADER */}
      <div className="pt-9.5 pb-9.5 pl-8 flex gap-4 items-center space-x-2 text-sm text-muted-foreground border-b h-[53px] shrink-0 bg-white">
        <PanelLeft size={15} />
        <span className="text-muted-foreground">|</span>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Tienda</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="p-8 flex-grow overflow-auto">
        {/* SALDO SECTION */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Saldo institucional</h1>
            <Link href="/tienda/cargarSaldo" passHref>
              <Button className="bg-[#6F97F0] hover:bg-[#5a81d4] cursor-pointer">
                <Plus className="mr-2 h-4 w-4" /> Cargar Saldo
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <>
              <div className="bg-gray-100 rounded-lg p-6 flex flex-col gap-2">
                <span className="text-2xl font-bold text-gray-800">
                  {formatCurrency(balance?.balance ?? 0)}
                </span>
                <span className="text-sm text-gray-500">Saldo disponible</span>
              </div>
              <div className="bg-gray-100 rounded-lg p-6 flex flex-col gap-2">
                <span className="text-2xl font-bold text-gray-800">
                  {formatCurrency(spentThisMonth)}
                </span>
                <span className="text-sm text-gray-500">Gastado este mes</span>
              </div>
              <div className="bg-gray-100 rounded-lg p-6 flex flex-col gap-2">
                <span className="text-2xl font-bold text-gray-800">
                  {formatCurrency(0)}
                </span>
                <span className="text-sm text-gray-500">Total cargado</span>
              </div>
            </>
          </div>
        </section>

        {/* HISTORIAL SECTION */}
        <section className="mt-8 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold mb-6">Historial de compras</h2>

          <div className="space-y-4">
            {purchaseHistory.length > 0 ? (
              purchaseHistory.map(purchase => (
                <div
                  key={purchase.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handlePurchaseClick(purchase)}
                >
                  <div>
                    <p className="font-semibold text-gray-800 text-lg">
                      {getTituloCompra(purchase)}
                    </p>

                    <p className="text-sm text-gray-500">
                      {new Date(purchase.date).toLocaleDateString("es-ES")}
                    </p>
                  </div>

                  <p className="font-semibold text-gray-900 text-lg">
                    {formatHistoryAmount(Number(purchase.total))}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No hay compras en tu historial.</p>
            )}
          </div>
        </section>

        {/* MODAL */}

        <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-center text-2xl font-bold pt-4">
                Resumen de compra
              </AlertDialogTitle>

              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </AlertDialogHeader>

            {/* 🔥 DESCRIPCIÓN OBLIGATORIA PERO OCULTA */}
            <AlertDialogDescription asChild>
              <VisuallyHidden>
                Detalles completos de la compra seleccionada, incluyendo fecha,
                entidad, lista de productos y montos totales.
              </VisuallyHidden>
            </AlertDialogDescription>

            <Separator />

            {/* FECHA Y ENTIDAD */}
            <div className="py-2 space-y-3">
              <div className="text-base">
                <span className="font-bold text-gray-900">Fecha: </span>
                <span className="text-gray-600">
                  {formatPopupDate(selectedPurchase?.date)}
                </span>
              </div>

              <div className="text-base">
                <span className="font-bold text-gray-900">Entidad: </span>
                <span className="text-gray-600">
                  {getEntidad(selectedPurchase)}
                </span>
              </div>
            </div>

            <Separator />

            {/* LISTA DE PRODUCTOS */}
            <div className="py-2 space-y-4">
              <h3 className="text-lg font-bold">Detalles de Pago</h3>

              <div className="space-y-3">
                {selectedPurchase?.product.map(
                  (
                    prod: {
                      name:
                        | string
                        | number
                        | bigint
                        | boolean
                        | React.ReactElement<
                            unknown,
                            string | React.JSXElementConstructor<any>
                          >
                        | Iterable<React.ReactNode>
                        | React.ReactPortal
                        | Promise<
                            | string
                            | number
                            | bigint
                            | boolean
                            | React.ReactPortal
                            | React.ReactElement<
                                unknown,
                                string | React.JSXElementConstructor<any>
                              >
                            | Iterable<React.ReactNode>
                            | null
                            | undefined
                          >
                        | null
                        | undefined;
                      quantity:
                        | string
                        | number
                        | bigint
                        | boolean
                        | React.ReactElement<
                            unknown,
                            string | React.JSXElementConstructor<any>
                          >
                        | Iterable<React.ReactNode>
                        | React.ReactPortal
                        | Promise<
                            | string
                            | number
                            | bigint
                            | boolean
                            | React.ReactPortal
                            | React.ReactElement<
                                unknown,
                                string | React.JSXElementConstructor<any>
                              >
                            | Iterable<React.ReactNode>
                            | null
                            | undefined
                          >
                        | null
                        | undefined;
                      subtotal: any;
                    },
                    idx: React.Key | null | undefined
                  ) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {prod.name} x{prod.quantity}
                      </span>
                      <span className="font-medium text-gray-900">
                        ${Number(prod.subtotal).toLocaleString("es-AR")}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            <Separator />

            {/* TOTAL */}
            <div className="py-2 flex justify-between">
              <span className="text-lg font-bold">Total</span>
              <span className="text-lg font-bold">
                ${Number(selectedPurchase?.total ?? 0).toLocaleString("es-AR")}
              </span>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </main>
  );
}
