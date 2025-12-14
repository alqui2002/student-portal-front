"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PanelLeft, WalletMinimal, X } from "lucide-react";

import { getBalance, loadBalance, CardDetails } from "@/lib/api/tienda";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { cn } from "@/lib/utils";

type FormErrors = {
  cardNumber?: string;
  expiration?: string;
  cvv?: string;
  amount?: string;
  general?: string;
};

export default function LoadBalancePage() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isBalanceConfirmed, setIsBalanceConfirmed] = useState(false);
  const [currentBalance, setCurrentBalance] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiration, setExpiration] = useState("");
  const [cvv, setCvv] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});

  const router = useRouter();

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    });
  };

  useEffect(() => {
    const fetchBalance = async () => {
      setIsLoading(true);
      try {
        const data = await getBalance();
        setCurrentBalance(data.balance);
      } catch (error: any) {
        console.error("Could not fetch balance:", error.message);
        setCurrentBalance(0);
      }
      setIsLoading(false);
    };

    fetchBalance();
  }, []);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    setSelectedAmount(null);
    if (errors.amount) setErrors(prev => ({ ...prev, amount: undefined }));
    if (errors.general) setErrors(prev => ({ ...prev, general: undefined }));
  };

  const handleSelectAmount = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount(String(amount));
    if (errors.amount) setErrors(prev => ({ ...prev, amount: undefined }));
    if (errors.general) setErrors(prev => ({ ...prev, general: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const amountAsNumber = parseFloat(customAmount);

    if (isNaN(amountAsNumber) || amountAsNumber <= 0) {
      newErrors.amount = "El monto a cargar debe ser mayor a 0.";
    }
    if (cardNumber.replace(/\D/g, "").length !== 16) {
      newErrors.cardNumber = "El número de tarjeta debe tener 16 dígitos.";
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiration)) {
      newErrors.expiration = "El formato de vencimiento debe ser MM/YY.";
    }
    if (!/^\d{3,4}$/.test(cvv)) {
      newErrors.cvv = "El CVV debe tener 3 o 4 dígitos.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoadBalance = async () => {
    setErrors(prev => ({ ...prev, general: undefined }));

    if (!validateForm()) {
      return;
    }

    const amountAsNumber = parseFloat(customAmount);

    const depositData: CardDetails = {
      cardNumber,
      expiration,
      cvv,
      amount: amountAsNumber,
    };

    try {
      await loadBalance(depositData);
      setIsBalanceConfirmed(true);
      setCurrentBalance(prev => (prev || 0) + amountAsNumber);

      setCustomAmount("");
      setCardNumber("");
      setCardName("");
      setExpiration("");
      setCvv("");
      setSelectedAmount(null);
      setErrors({});
    } catch (error: any) {
      console.error("Network error loading balance:", error.message);

      let errorMessage = "Error al cargar el saldo. Intente de nuevo.";
      try {
        const errorObj = JSON.parse(error.message);
        if (errorObj.message && Array.isArray(errorObj.message)) {
          errorMessage = errorObj.message.join(", ");
        } else if (errorObj.message) {
          errorMessage = errorObj.message;
        }
      } catch (e) {
        errorMessage = error.message || "Unknown error";
      }

      setErrors(prev => ({ ...prev, general: errorMessage }));
    }
  };

  return (
    <main className="w-full flex flex-col gap-8 bg-white">
      <div className="pt-9.5 pb-9.5 pl-8 flex gap-4 items-center space-x-2 text-sm text-muted-foreground border-b h-[53px]">
        <PanelLeft size={15} />
        <span className="text-muted-foreground">|</span>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Portal Estudiante</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/tienda">Tienda</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Cargar Saldo</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div>
        <div className="border rounded-xl flex flex-row justify-between m-8 mt-4 p-5 pl-6 pt-8 pr-10">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold">Saldo Actual</h2>
            <h3 className="text-xl text-[#404040] font-bold">
              {isLoading
                ? "Cargando..."
                : formatCurrency(currentBalance ?? 0.0)}
            </h3>
          </div>
          <div className="bg-[#D9D9D9] rounded-full p-3 fit-content h-12">
            <WalletMinimal color="#757575"></WalletMinimal>
          </div>
        </div>

        <div className="border rounded-xl m-8 mt-4 pt-8 ">
          <div className="pb-3 border-b">
            <h4 className="text-base font-bold pl-6 pb-5 ">
              Tarjeta de Débito/Crédito
            </h4>
          </div>
          <div className=" border-b">
            <div className="grid grid-cols-2 pt-8 ml-6 pb-8 gap-x-8 gap-y-3 mr-8">
              <div className="space-y-1">
                <span className="font-light text-sm">Número de la tarjeta</span>
                <Input
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChange={e => {
                    setCardNumber(e.target.value);
                    if (errors.cardNumber)
                      setErrors(prev => ({ ...prev, cardNumber: undefined }));
                  }}
                  className={cn(errors.cardNumber && "border-red-500")}
                />
                {errors.cardNumber && (
                  <p className="text-red-500 text-xs">{errors.cardNumber}</p>
                )}
              </div>

              <div className="space-y-1">
                <span className="font-light text-sm">
                  Nombre y apellido que aparece en la tarjeta
                </span>
                <Input
                  placeholder="Juan Perez"
                  value={cardName}
                  onChange={e => setCardName(e.target.value)}
                />
              </div>

              <div className="space-y-1 pt-4">
                <span className="font-light text-sm">Fecha de Vencimiento</span>
                <Input
                  placeholder="MM/YY"
                  value={expiration}
                  onChange={e => {
                    setExpiration(e.target.value);
                    if (errors.expiration)
                      setErrors(prev => ({ ...prev, expiration: undefined }));
                  }}
                  className={cn(errors.expiration && "border-red-500")}
                />
                {errors.expiration && (
                  <p className="text-red-500 text-xs">{errors.expiration}</p>
                )}
              </div>

              <div className="space-y-1 pt-4">
                <span className="font-light text-sm">CVV</span>
                <Input
                  placeholder="123"
                  value={cvv}
                  onChange={e => {
                    setCvv(e.target.value);
                    if (errors.cvv)
                      setErrors(prev => ({ ...prev, cvv: undefined }));
                  }}
                  className={cn(errors.cvv && "border-red-500")}
                />
                {errors.cvv && (
                  <p className="text-red-500 text-xs">{errors.cvv}</p>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            <h3 className="font-light">Monto a cargar</h3>
            <div
              className={cn(
                "flex items-center border border-input rounded-full px-3 mt-5 py-2 w-full bg-white text-sm",
                errors.amount && "border-red-500"
              )}
            >
              <span className="text-gray-500 mr-2">$</span>
              <input
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                className="bg-transparent outline-none flex-1 text-black placeholder:text-muted-foreground"
                value={customAmount}
                onChange={handleAmountChange}
              />
            </div>
            {errors.amount && (
              <p className="text-red-500 text-xs pl-2 mt-1">{errors.amount}</p>
            )}
          </div>

          <div className="grid grid-cols-4 gap-4 justify-between pl-5 pr-5">
            {[5000, 7000, 10000, 20000].map(amount => (
              <div key={amount} className="w-[100%] justify-between">
                <Button
                  onClick={() => handleSelectAmount(amount)}
                  className={`w-full border border-gray text-black ${
                    selectedAmount === amount ? "bg-gray-200" : "bg-white"
                  } hover:bg-gray-100 cursor-pointer`}
                >
                  ${amount.toLocaleString("es-AR")}
                </Button>
              </div>
            ))}
          </div>

          <div className="p-5 slign-center justify-self-center align-content-center">
            {errors.general && (
              <p className="text-red-500 text-sm text-center mb-4">
                {errors.general}
              </p>
            )}
            <Button
              className="w-[350px] cursor-pointer"
              onClick={handleLoadBalance}
            >
              Confirmar Saldo Tarjeta
            </Button>
          </div>
        </div>

        <AlertDialog
          open={isBalanceConfirmed}
          onOpenChange={setIsBalanceConfirmed}
        >
          <AlertDialogContent className="text-center w-[500px]">
            <AlertDialogHeader>
              <div
                className="justify-start cursor-pointer"
                onClick={() => {
                  setIsBalanceConfirmed(false);
                  window.location.href = "/tienda";
                }}
              >
                <X color={"black"} className="justify-start" />
              </div>

              <AlertDialogTitle className="text-center">
                Confirmación de saldo{" "}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                Ya podes encontrar tu nueva carga en la Tienda
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="justify-center"></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </main>
  );
}
