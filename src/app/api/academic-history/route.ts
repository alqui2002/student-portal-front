import { NextResponse } from "next/server";
import { getServerToken } from "@/lib/server-token";

const API = process.env.NEXT_PUBLIC_API_URL;

export async function GET(req: Request) {
  const token = getServerToken();
  const { searchParams } = new URL(req.url);

  const userId = searchParams.get("userId");

  const res = await fetch(`${API}/academic-history/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return NextResponse.json(await res.json());
}
