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
    console.log("No hay JWT en cookies, no se sincroniza usuario.");
    return;
  }

  try {
    const decoded = jwtDecode<CoreTokenPayload>(token);

    const payload: SyncUserDto = {
      uuid: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      careerId: "9934e1b7-dd30-4fd7-a59f-b6f320d1a4c7",
    };

    console.log("Sincronizando usuario con backend...", payload);

    await apiFetch("/users", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    console.log("Usuario sincronizado correctamente.");
  } catch (error) {
    console.log("El usuario ya existe o hubo un error de sync:", error);
  }
}
