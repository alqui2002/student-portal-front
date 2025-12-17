"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  PanelLeft,
  X,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import Loader from "@/components/ui/loader";

// --- IMPORTS DE APIs ---
import { getEventsByUser, syncEvents } from "@/lib/api/calendar";
import { getUserDiningReservations } from "@/lib/api/dining"; // ✅ Nuevo import
import { DiningReservation } from "@/lib/api/types"; // ✅ Nuevo import

const PAGE_TITLE = "Calendario Académico";

type EventType = "examen" | "evento" | "extracurricular" | "holiday" | "class";
type UniEvent = {
  id: string;
  type: EventType;
  title: string;
  date: string;
  time?: string;
  meta?: string;
  description?: string;
};

type DiningSlot = { label: string; from: string; to: string };
const dotColors: Record<string, string> = {
  examen: "bg-blue-500",
  evento: "bg-amber-600",
  extracurricular: "bg-green-600",
  holiday: "bg-purple-500",
  class: "bg-gray-500",
};

const TZ = "America/Argentina/Buenos_Aires" as const;
const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

const fmtMonth = new Intl.DateTimeFormat("es-AR", {
  month: "long",
  timeZone: TZ,
});
const fmtLong = new Intl.DateTimeFormat("es-AR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: TZ,
});
const fmtEvent = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: TZ,
});
const fmtMonthOnly = new Intl.DateTimeFormat("es-AR", {
  month: "long",
  timeZone: TZ,
});

function monthHeader(year: number, monthIndex: number) {
  return `${cap(fmtMonth.format(new Date(year, monthIndex, 1)))} ${year}`;
}
function toDateOnly(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addMonths(d: Date, n: number) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}
function daysGrid(year: number, monthIndex: number) {
  const first = new Date(year, monthIndex, 1);
  const start = (first.getDay() + 6) % 7;
  const last = new Date(year, monthIndex + 1, 0).getDate();
  const cells: { date: Date; inMonth: boolean }[] = [];
  for (let i = start; i > 0; i--)
    cells.push({ date: new Date(year, monthIndex, 1 - i), inMonth: false });
  for (let d = 1; d <= last; d++)
    cells.push({ date: new Date(year, monthIndex, d), inMonth: true });
  while (cells.length % 7 !== 0)
    cells.push({
      date: new Date(year, monthIndex + 1, cells.length - (start + last) + 1),
      inMonth: false,
    });
  while (cells.length < 42)
    cells.push({
      date: new Date(year, monthIndex + 1, cells.length - (start + last) + 1),
      inMonth: false,
    });
  return cells;
}

const DINING_SLOTS: DiningSlot[] = [
  { label: "Desayuno", from: "07:00", to: "12:00" },
  { label: "Almuerzo", from: "12:00", to: "16:00" },
  { label: "Merienda", from: "16:00", to: "20:00" },
];

// Mapeo de valores del backend (mayúsculas) a labels del frontend
const MEAL_TIME_MAP: Record<string, string> = {
  DESAYUNO: "Desayuno",
  ALMUERZO: "Almuerzo",
  MERIENDA: "Merienda",
};

export default function EventosPage() {
  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState(new Date());

  const [events, setEvents] = useState<UniEvent[]>([]);
  // ✅ 1. Estado para guardar reservas del comedor
  const [reservations, setReservations] = useState<DiningReservation[]>([]);

  const [loading, setLoading] = useState(true);
  const [openEventDlg, setOpenEventDlg] = useState(false);
  const [activeEvent, setActiveEvent] = useState<UniEvent | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // ✅ 2. Llamada en paralelo a Eventos y Comedor
        const [eventsData, diningData] = await Promise.all([
          getEventsByUser(),
          getUserDiningReservations(),
        ]);

        console.log("📅 Eventos crudos:", eventsData);
        console.log("🍽️ Reservas Comedor:", diningData);

        // Normalizar Eventos
        const fixed = (eventsData as any[]).map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          date: item.date?.slice(0, 10),
          time: new Date(item.startDateTime).toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          type: (item.eventType?.toLowerCase?.() ?? "event") as EventType,
        }));

        setEvents(fixed);

        // ✅ 3. Guardar Reservas (validando que sea array)
        setReservations(Array.isArray(diningData) ? diningData : []);
      } catch (err) {
        console.error("❌ Error al traer datos:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, UniEvent[]>();
    events.forEach(ev => {
      const dateKey = ev.date.slice(0, 10);
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(ev);
    });
    return map;
  }, [events]);

  const selectedKey = toDateOnly(selected);
  const selectedEvents = eventsByDay.get(selectedKey) ?? [];

  const nextEvents = useMemo(() => {
    const threshold = new Date(selectedKey);
    return events
      .filter(e => new Date(e.date) > threshold)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  }, [selectedKey, events]);

  if (loading) return <Loader message="Cargando eventos..." />;

  return (
    <main>
      <div className="bg-[#f5f7fb] text-gray-900 min-h-[calc(100vh-64px)]">
        {/* ENCABEZADO */}
        <div className="pt-9.5 pb-9.5 pl-8 flex gap-4 items-center space-x-2 text-sm text-muted-foreground border-b h-[53px] bg-white">
          <PanelLeft size={15} />
          <span className="text-muted-foreground">|</span>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Eventos</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="mx-auto max-w-[1200px] px-6 py-8">
          <h1 className="text-[28px] leading-[36px] font-semibold mb-4">
            {PAGE_TITLE}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-[14px] mb-4">
            {[...new Set(events.map(ev => ev.type))].map(type => (
              <span key={type} className="inline-flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded ${
                    dotColors[type] || "bg-gray-400"
                  }`}
                />
                {cap(type)}
              </span>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <div className="space-y-6">
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 pt-4">
                  <button
                    onClick={() => setCursor(addMonths(cursor, -1))}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setCursor(addMonths(cursor, 1))}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-5 pb-5">
                  {[0, 1].map(i => {
                    const base = addMonths(cursor, i);
                    const y = base.getFullYear();
                    const m = base.getMonth();
                    const cells = daysGrid(y, m);
                    return (
                      <div key={i} className="pt-1">
                        <div className="text-center text-[14px] font-medium text-gray-700 mb-2">
                          {monthHeader(y, m)}
                        </div>

                        <div className="grid grid-cols-7 text-center text-[12px] text-gray-500 px-1">
                          {["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"].map(d => (
                            <div key={d} className="py-2">
                              {d}
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1 px-1">
                          {cells.map(({ date, inMonth }, idx) => {
                            const key = toDateOnly(date);
                            const day = date.getDate();
                            const evs = eventsByDay.get(key) ?? [];
                            const isSel = key === selectedKey;

                            return (
                              <button
                                key={idx}
                                onClick={() => setSelected(date)}
                                className={[
                                  "relative h-10 rounded-md text-[13px] transition",
                                  inMonth ? "text-gray-800" : "text-gray-400",
                                  isSel
                                    ? "bg-amber-700 text-white shadow-sm"
                                    : "hover:bg-gray-50",
                                ].join(" ")}
                              >
                                <span className="absolute left-2 top-1.5 font-medium">
                                  {day}
                                </span>
                                {evs.length > 0 && (
                                  <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 inline-flex gap-1">
                                    {evs.map(e => (
                                      <span
                                        key={e.id}
                                        className={`w-1.5 h-1.5 rounded-full ${
                                          dotColors[e.type] || "bg-gray-400"
                                        }`}
                                      />
                                    ))}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECCIÓN COMEDOR DINÁMICA - CORREGIDA CON NOMBRES DE BACKEND */}
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="px-5 py-4 border-b">
                  <h3 className="text-[15px] font-semibold text-gray-700">
                    Reservas comedor –{" "}
                    {cap(
                      new Intl.DateTimeFormat("es-AR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        timeZone: TZ,
                      }).format(selected)
                    )}
                  </h3>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {DINING_SLOTS.map(slot => {
                    // 1. Fecha seleccionada en string YYYY-MM-DD
                    const selectedDateString = toDateOnly(selected);

                    // 2. BUSCAR RESERVA (LÓGICA ACTUALIZADA)
                    const reserva = reservations.find(r => {
                      // El backend devuelve algo como "2025-12-15T00:00:00.000Z"
                      // Cortamos los primeros 10 caracteres para obtener "2025-12-15"
                      const backendDate = String(r.reservationDate).slice(
                        0,
                        10
                      );

                      // Convertir mealTime del backend (mayúsculas) al label del frontend
                      const normalizedMealTime =
                        MEAL_TIME_MAP[r.mealTime] || r.mealTime;

                      // Comparamos fecha Y turno (normalizando mealTime del backend)
                      return (
                        backendDate === selectedDateString &&
                        normalizedMealTime === slot.label
                      );
                    });

                    const tieneReserva = !!reserva;

                    return (
                      <div
                        key={slot.label}
                        className={`rounded-xl border p-4 text-center transition-all ${
                          tieneReserva
                            ? "border-green-200 bg-green-50 shadow-sm"
                            : "border-gray-200 bg-gray-50 opacity-60"
                        }`}
                      >
                        <div
                          className={`font-medium ${tieneReserva ? "text-green-800" : "text-gray-700"}`}
                        >
                          {slot.label}
                        </div>
                        <div className="text-[13px] text-gray-600 mt-1">
                          {slot.from} - {slot.to}
                        </div>

                        {/* Indicador visual */}
                        <div
                          className={`text-xs font-bold mt-2 ${tieneReserva ? "text-green-600" : "text-gray-400"}`}
                        >
                          {tieneReserva ? "RESERVADO ✅" : "Sin reserva"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="px-5 py-4 border-b">
                  <h3 className="text-[15px] font-semibold text-gray-700">
                    {cap(fmtLong.format(selected))}
                  </h3>
                </div>
                <div className="p-5">
                  {selectedEvents.length === 0 ? (
                    <div className="rounded-xl border border-gray-200 bg-gray-50 text-gray-600 text-sm py-6 text-center">
                      No hay eventos para este día.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedEvents.map(ev => (
                        <EventItemButton
                          key={ev.id}
                          ev={ev}
                          onOpen={e => {
                            setActiveEvent(e);
                            setOpenEventDlg(true);
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="px-5 py-4 border-b">
                  <h3 className="text-[15px] font-semibold text-gray-700">
                    Próximos eventos
                  </h3>
                </div>
                <div className="p-5">
                  {nextEvents.length === 0 ? (
                    <div className="rounded-xl border border-gray-200 bg-gray-50 text-gray-600 text-sm py-6 text-center">
                      Sin próximos eventos.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {nextEvents.map(ev => (
                        <EventItemButton
                          key={ev.id}
                          ev={ev}
                          onOpen={e => {
                            setActiveEvent(e);
                            setOpenEventDlg(true);
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={openEventDlg} onOpenChange={setOpenEventDlg}>
        <AlertDialogContent className="w-[520px]">
          <div className="flex justify-end">
            <AlertDialogCancel className="h-7 w-7 p-0 rounded-full bg-gray-100 hover:bg-gray-200">
              <X className="h-4 w-4" />
            </AlertDialogCancel>
          </div>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold">
              {activeEvent?.title}
            </AlertDialogTitle>

            <div className="mt-3">
              {activeEvent?.type && (
                <Badge
                  className={
                    activeEvent.type === "examen"
                      ? "bg-blue-500 text-white"
                      : activeEvent.type === "evento"
                        ? "bg-amber-600/90 text-white"
                        : activeEvent.type === "extracurricular"
                          ? "bg-green-600 text-white"
                          : activeEvent.type === "holiday"
                            ? "bg-purple-500 text-white"
                            : "bg-gray-400 text-white"
                  }
                >
                  {activeEvent.type === "examen"
                    ? "examen" // Corregido typo anterior "examenen"
                    : activeEvent.type === "evento"
                      ? "Evento"
                      : activeEvent.type === "extracurricular"
                        ? "Actividad extracurricular"
                        : activeEvent.type === "holiday"
                          ? "Feriado"
                          : cap(activeEvent.type)}
                </Badge>
              )}
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium min-w-[64px]">Horario</span>
                <span className="text-gray-700">
                  {activeEvent?.time ?? "—"}
                </span>
              </div>

              <div>
                <div className="font-medium mb-1">Descripción</div>
                <AlertDialogDescription className="text-gray-700">
                  {activeEvent?.description ?? "Sin descripción."}
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

function EventCard({ ev }: { ev: UniEvent }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <span
        className={`px-2 py-0.5 text-[11px] font-medium rounded-full text-white ${
          dotColors[ev.type] || "bg-gray-400"
        }`}
      >
        {cap(ev.type)}
      </span>
      <div className="text-sm font-medium text-gray-800">{ev.title}</div>
    </div>
  );
}

function EventItemButton({
  ev,
  onOpen,
}: {
  ev: UniEvent;
  onOpen: (ev: UniEvent) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(ev)}
      className="w-full text-left hover:shadow transition rounded-xl"
    >
      <EventCard ev={ev} />
    </button>
  );
}