"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PanelLeft, Plus, X } from "lucide-react";

import { getBalance, getPurchaseHistory } from "@/lib/api/tienda";
import { Saldo, Compra } from "@/lib/api/types";

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

export default function StorePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Compra | null>(null);
  const [balance, setBalance] = useState<Saldo | null>(null);
  const [purchaseHistory, setPurchaseHistory] = useState<Compra[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const balanceData = await getBalance();
        setBalance(balanceData);
      } catch (error: any) {
        console.error("Balance account not found", error.message);
        setBalance({ balance: 0 });
      }

      try {
        const historyData = await getPurchaseHistory();
        setPurchaseHistory(historyData);
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
    const options: Intl.NumberFormatOptions = {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    };
    const formattedAmount = new Intl.NumberFormat("es-AR", options).format(
      amount
    );
    return `$${formattedAmount}`;
  };

  const handlePurchaseClick = (purchase: Compra) => {
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

  return (
    <main className="w-full flex flex-col bg-white">
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
            {isLoading ? (
              <p>Cargando saldo...</p>
            ) : (
              <>
                <div className="bg-gray-100 rounded-lg p-6 flex flex-col gap-2">
                  <span className="text-2xl font-bold text-gray-800">
                    {formatCurrency(balance?.balance ?? 0)}
                  </span>
                  <span className="text-sm text-gray-500">
                    Saldo disponible
                  </span>
                </div>
                <div className="bg-gray-100 rounded-lg p-6 flex flex-col gap-2">
                  <span className="text-2xl font-bold text-gray-800">
                    {formatCurrency(0)}
                  </span>
                  <span className="text-sm text-gray-500">
                    Gastado este mes
                  </span>
                </div>
                <div className="bg-gray-100 rounded-lg p-6 flex flex-col gap-2">
                  <span className="text-2xl font-bold text-gray-800">
                    {formatCurrency(0)}
                  </span>
                  <span className="text-sm text-gray-500">Total cargado</span>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="mt-8 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold mb-6">Historial de compras</h2>
          <div className="space-y-4">
            {isLoading ? (
              <p>Cargando historial...</p>
            ) : purchaseHistory.length > 0 ? (
              purchaseHistory.map(purchase => (
                <div
                  key={purchase.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handlePurchaseClick(purchase)}
                >
                  <div>
                    <p className="font-semibold text-gray-800 text-lg">
                      {purchase.product.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(purchase.date).toLocaleDateString("es-ES")}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900 text-lg">
                    {formatHistoryAmount(purchase.total)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No hay compras en tu historial.</p>
            )}
          </div>
        </section>

        <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-center text-2xl font-bold pt-4">
                Resumen de compra
              </AlertDialogTitle>
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Cerrar</span>
              </button>
            </AlertDialogHeader>

            <Separator />

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
                  {selectedPurchase?.product.description.includes("Biblioteca")
                    ? "Biblioteca"
                    : selectedPurchase?.product.description.includes(
                          "Cafetería"
                        )
                      ? "Cafetería"
                      : "Tienda General"}
                </span>
              </div>
            </div>

            <Separator />

            <div className="py-2 space-y-4">
              <h3 className="text-lg font-bold">Detalles de Pago</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {selectedPurchase?.product.description}
                  </span>
                  <span className="font-medium text-gray-900">
                    {formatHistoryAmount(selectedPurchase?.total ?? 0)}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="py-2 flex justify-between">
              <span className="text-lg font-bold">Total</span>
              <span className="text-lg font-bold">
                {formatHistoryAmount(selectedPurchase?.total ?? 0)}
              </span>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </main>
  );
}
