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

  const apiData = await apiFetch<ApiBalanceResponse>(
    `/account/${userId}/balance`,
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
  return apiFetch<Compra[]>(`/users/${userId}/purchases`);
}

export async function loadBalance(depositData: CardDetails) {
  const userId = getUserIdFromToken();

  const apiRequestBody = {
    cardNumber: depositData.cardNumber.replace(/\s/g, ""),
    expiration: depositData.expiration,
    cvv: depositData.cvv,
    amount: String(depositData.amount),
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
