import { cookies } from "next/headers";

export async function getServerToken() {
  const store = await cookies();
  return store.get("JWT")?.value ?? null;
}
