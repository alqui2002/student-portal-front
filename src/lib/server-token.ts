import { cookies } from "next/headers";

export function getServerToken() {
  const store = cookies();
  return store.get("JWT")?.value ?? null;
}
