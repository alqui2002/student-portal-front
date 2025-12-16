import { apiFetch } from "./client";
import { jwtDecode } from "jwt-decode";
import { Saldo, Compra } from "./types";

interface ApiBalanceResponse {
  balance: string;
}

export interface CardDetails {
  cardNumber: string;
  expiration: string;
  cvv: string;
  amount: number;
}

function getUserIdFromToken(): string {
  if (typeof document === "undefined") return "";

  const token = document.cookie
    .split("; ")
    .find(row => row.startsWith("JWT="))
    ?.split("=")[1];

  if (!token) throw new Error("No hay sesión activa");

  const decoded: any = jwtDecode(token);
  return decoded.sub;
}

export async function getBalance(): Promise<Saldo> {
  const userId = getUserIdFromToken();
  const timestamp = new Date().getTime();

  const apiData = await apiFetch<ApiBalanceResponse>(
    `/account/${userId}/balance?t=${timestamp}`,
    {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
      },
    }
  );

  return {
    balance: parseFloat(apiData.balance),
  };
}

export async function getPurchaseHistory(): Promise<Compra[]> {
  const userId = getUserIdFromToken();
  const timestamp = new Date().getTime();
  return apiFetch<Compra[]>(`/users/${userId}/purchases?t=${timestamp}`);
}

export async function loadBalance(depositData: CardDetails) {
  const userId = getUserIdFromToken();

  const apiRequestBody = {
    // Datos de la tarjeta (se mantienen igual)
    cardNumber: depositData.cardNumber.replace(/\s/g, ""),
    expiration: depositData.expiration,
    cvv: depositData.cvv,

    // Datos requeridos por el CORE
    amount: depositData.amount, // Enviamos el número directo (ej: 1000) en vez de String
    type: "CARGA_DE_SALDO", // <--- EL CAMBIO IMPORTANTE (Todo mayúsculas)
    description: "Carga de saldo",
    currency: "ARG", // Agregamos la moneda por seguridad según el curl
  };

  return apiFetch(`/account/${userId}/transactions`, {
    method: "POST",
    body: JSON.stringify(apiRequestBody),
  });
}

export async function syncPurchases(): Promise<any> {
  const userId = getUserIdFromToken();
  return apiFetch<any>(`/users/${userId}/purchases/store/sync`, {
    method: "GET",
  });
}

export async function syncWallet(): Promise<any> {
  return apiFetch<any>(`/account/wallet/sync`, {
    method: "GET",
  });
}

export async function getWalletTransactions() {
  return apiFetch("/transactions/wallet");
}
