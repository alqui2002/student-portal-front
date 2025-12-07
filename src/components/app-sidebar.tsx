"use client";
import { useEffect } from "react";
import { syncUserWithBackend } from "@/lib/api/user-sync";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  BookOpen,
  SquareTerminal,
  CalendarDays,
  ShoppingBag,
  BellRing,
} from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"; // Fíjate que esto importa del MOTOR (el de 700 líneas)
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Función para ver si el link está activo
const isActive = (pathname: string, href: string) =>
  pathname === href || (href !== "/" && pathname.startsWith(href));

export function AppSidebar() {
  // AGREGAR ESTO: Sincronización de usuario al montar el componente
  useEffect(() => {
    syncUserWithBackend();
  }, []); // El [] vacío asegura que solo corra 1 vez al entrar
  const pathname = usePathname();

  // Configuración de items del menú
  const menuItems = [
    { title: "Mis Cursos", url: "/misCursos", icon: BookOpen },
    { title: "Inscripciones", url: "/inscripciones", icon: SquareTerminal },
    { title: "Calendario", url: "/eventos", icon: CalendarDays },
    { title: "Tienda", url: "/tienda", icon: ShoppingBag },
  ];

  return (
    <Sidebar className="bg-[#FAFAFA]">
      <SidebarHeader>
        <div className="flex items-center gap-7 px-3 mb-2 h-[53px]">
          <Image src="/logoUADE.png" alt="Logo" width={80} height={80} />
          <span className="px-5 py-1 bg-[#193167] text-white text-sm font-bold rounded-2xl">
            CONNECT
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="border-t">
        <SidebarGroup>
          <SidebarGroupLabel>Portal Estudiante</SidebarGroupLabel>
          <SidebarMenu>
            {menuItems.map(item => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(pathname, item.url)}
                  className="h-12 data-[active=true]:text-[#6F97F0] data-[active=true]:font-bold"
                >
                  <Link href={item.url}>
                    <item.icon />
                    <span className="text-base">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="flex flex-row justify-between items-center p-4 border-t">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src="user.jpg" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-semibold">Example</span>
            <span className="text-[11px] text-gray-500">m@example.com</span>
          </div>
        </div>
        <Link
          href="/notificaciones"
          className="p-1.5 rounded-full text-gray-600 hover:text-[#6F97F0] hover:bg-[#E8F0FF]/40"
        >
          <BellRing size={18} />
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
