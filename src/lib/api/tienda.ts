import { apiFetch } from "./client";
import { Saldo, Compra } from "./types";

const userId = "00debe32-abd2-45a8-bece-3d3b752fa140";

interface ApiBalanceResponse {
  balance: string;
}

export interface CardDetails {
  cardNumber: string;
  expiration: string;
  cvv: string;
  amount: number;
}

export async function getBalance(): Promise<Saldo> {
  const apiData = await apiFetch<ApiBalanceResponse>(
    `/account/${userId}/balance`
  );
  return {
    balance: parseFloat(apiData.balance),
  };
}

export async function getPurchaseHistory(): Promise<Compra[]> {
  return apiFetch<Compra[]>(`/users/${userId}/purchases`);
}

export async function loadBalance(depositData: CardDetails) {
  const apiRequestBody = {
    cardNumber: depositData.cardNumber,
    expiration: depositData.expiration,
    cvv: depositData.cvv,
    amount: String(depositData.amount),
  };
}

export async function syncPurchases(): Promise<any> {
  return apiFetch<any>(`/users/${userId}/purchases/store/sync`, {
    method: "GET",
  });
}
