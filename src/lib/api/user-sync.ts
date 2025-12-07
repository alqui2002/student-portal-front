import { apiFetch } from "@/lib/api/client";
import { jwtDecode } from "jwt-decode";

// Definimos la estructura del Token del Core
interface CoreTokenPayload {
  sub: string;
  name: string;
  email: string;
  role: string;
  exp: number;
}

// Definimos lo que espera el Backend (según el DTO que me pasaste)
interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export async function syncUserWithBackend() {
  // 1. Obtenemos el token del navegador
  const token = document.cookie
    .split("; ")
    .find(row => row.startsWith("JWT="))
    ?.split("=")[1];

  if (!token) return;

  try {
    // 2. Decodificamos el token para sacar los datos
    const decoded = jwtDecode<CoreTokenPayload>(token);

    // 3. Preparamos los datos para el Backend
    // El Core manda "name": "Juan Perez", el backend quiere separado.
    const nameParts = decoded.name.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || "Estudiante"; // Por si no tiene apellido

    const payload: CreateUserDto = {
      firstName: firstName,
      lastName: lastName,
      email: decoded.email,
      // GENERAMOS PASSWORD FICTICIA
      // El backend la exige por el DTO, pero el usuario usa Login Core.
      // Ponemos una cadena larga y segura que nadie usará.
      password: `CoreAuth_${decoded.sub}_Secure`,
    };

    // 4. Llamamos al endpoint POST /users
    // Nota: Usamos fetch directo o apiFetch ignorando errores de "ya existe"
    console.log("Sincronizando usuario...", payload.email);

    await apiFetch("/users", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    console.log("Usuario sincronizado correctamente.");
  } catch (error) {
    // Si el error es que ya existe, lo ignoramos (es lo esperado)
    console.log("El usuario ya existe o hubo un error de sync:", error);
  }
}
