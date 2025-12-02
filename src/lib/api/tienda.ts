import { apiFetch } from "./client";
import { Saldo, Compra } from "./types";

const userId = "3e7df85d-2eac-4c1d-aa7f-87e1ec2b11e6";

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

  return apiFetch<any>(`/account/${userId}/transactions`, {
    method: "POST",
    body: JSON.stringify(apiRequestBody),
  });
}
