import { apiFetch } from "@/lib/api/client";
import { jwtDecode } from "jwt-decode";

interface CoreTokenPayload {
  sub: string;
  email: string;
  name: string;
  role: string;
  subrol: string | null;
  career: {
    uuid: string;
    name: string;
  };
  wallet: any[];
  iat: number;
  exp: number;
}

interface SyncUserDto {
  uuid: string;
  email: string;
  name: string;
  careerId: string;
}

export async function syncUserWithBackend() {
  const token = document.cookie
    .split("; ")
    .find(row => row.startsWith("JWT="))
    ?.split("=")[1];

  if (!token) {
    return;
  }

  try {
    const decoded = jwtDecode<CoreTokenPayload>(token);

    const payload: SyncUserDto = {
      uuid: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      careerId: decoded.career.uuid,
    };

    await apiFetch("/users", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.log("El usuario ya existe o hubo un error de sync:", error);
  }
}
