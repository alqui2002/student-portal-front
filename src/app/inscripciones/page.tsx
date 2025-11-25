"use client";

import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { PanelLeft, FunnelPlus, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  getAvailableCoursesByUserId,
  enrollUserInCourseIdAndCommissionId,
} from "@/lib/api/enrollments";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Loader from "@/components/ui/loader";

export default function InscripcionesPage() {
  const [selectedCommissions, setSelectedCommissions] = useState<
    Record<string, string>
  >({});
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [insConfirmada, setinsConfirmada] = useState(false);
  const [selectedCourseFilter, setSelectedCourseFilter] =
    useState<string>("todas");
  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await getAvailableCoursesByUserId();
        setAvailableCourses((data as any[]) || []);
        setFilteredCourses((data as any[]) || []);

      } catch (err) {
        console.error("❌ Error al traer datos del curso:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleFilterChange = (value: string) => {
    setSelectedCourseFilter(value);
    if (value === "todas") {
      setFilteredCourses(availableCourses);
    } else {
      const filtered = availableCourses.filter(
        course => String(course.id) === value
      );
      setFilteredCourses(filtered);
    }
  };

  const handleCursoClick = (courseId: string, commissionId: string) => {
    setSelectedCommissions(prev => ({
      ...prev,
      [courseId]: prev[courseId] === commissionId ? "" : commissionId,
    }));
  };

  const enrollInCourse = async () => {
    try {
      const selectedEntries = Object.entries(selectedCommissions).filter(
        ([_, val]) => val
      );
      async function fetchData() {
        try {
          for (const [courseId, commissionId] of selectedEntries) {
            await enrollUserInCourseIdAndCommissionId(
              String(courseId),
              String(commissionId)
            );
            console.log(
              `✅ Inscripción creada: curso ${courseId}, comisión ${commissionId}`
            );
          }
        } catch (err) {
          console.error("❌ Error al traer datos del curso:", err);
        } finally {
          setLoading(false);
        }
      }
      fetchData();
      setinsConfirmada(true);
    } catch (err: any) {
      console.error("❌ Error al inscribirse:", err.message);
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) return <Loader message="Cargando inscripciones..." />;

  const totalSeleccionadas =
    Object.values(selectedCommissions).filter(Boolean).length;

  return (
    <main className="w-full flex flex-col gap-8 bg-white">
      {/* === Breadcrumb === */}
      <div className="pt-9.5 pb-9.5 pl-8 flex gap-4 items-center border-b h-[53px] text-sm text-muted-foreground">
        <PanelLeft size={15} />
        <span>|</span>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink>Portal Estudiante</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Inscripciones</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* === Contenido === */}
      <div className="pl-8 pr-8">
        <h1 className="text-2xl font-medium pb-3">Inscripción Materias</h1>
        <span className="text-sm text-[#737373]">
          Selecciona las materias y cursos para el período
        </span>

        <div className="grid grid-cols-3 gap-5 pt-5">
          {/* === Filtros === */}
          <div>
            <div className="border rounded-xl p-4">
              <div className="flex flex-row gap-2 items-center p-2">
                <FunnelPlus size={16} />
                <span className="font-bold">Filtros</span>
              </div>

              <div className="flex flex-col pr-3">
                <span className="text-sm p-2">Materias</span>
                <Select
                  value={selectedCourseFilter}
                  onValueChange={handleFilterChange}
                >
                  <SelectTrigger className="w-full shadow-none text-sm text-black">
                    <SelectValue placeholder="Seleccionar materia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas las materias</SelectItem>
                    {availableCourses.length > 0 ? (
                      availableCourses.map(course => (
                        <SelectItem key={course.id} value={String(course.id)}>
                          {course.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No hay materias disponibles
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* === Resumen === */}
            <div className="border rounded-xl p-5 mt-5">
              <span className="font-bold">Resumen de inscripción</span>
              <div className="flex justify-between mt-6">
                <span className="text-sm font-light">
                  Materias seleccionadas
                </span>
                <span className="text-sm font-light">{totalSeleccionadas}</span>
              </div>
              <div className="flex justify-between mt-6">
                <span className="text-sm font-light">Total compra</span>
                <span className="text-sm font-light">
                  {totalSeleccionadas > 0
                    ? `${totalSeleccionadas * 320000}$`
                    : "-"}
                </span>
              </div>
              <button
                disabled={totalSeleccionadas === 0}
                className="text-base font-light text-white bg-[#6F97F0] w-full mt-5 p-2 rounded-sm disabled:opacity-50"
                onClick={() => {
                  setinsConfirmada(true);
                  enrollInCourse();
                  console.log(selectedCommissions);
                }}
              >
                Confirmar inscripción
              </button>
            </div>
          </div>

          {/* === Cursos disponibles === */}
          <div className="border rounded-xl ml-4 col-span-2">
            <div className="p-8 pb-2 border-b">
              <h2 className="text-lg font-light">Materias Disponibles</h2>
              <h3 className="text-sm font-light mt-3 pb-5">
                Selecciona materias y turnos deseados
              </h3>
            </div>

            {filteredCourses.map(curso => {
              const commissions = Array.isArray(curso.commissions)
                ? curso.commissions
                : [];
              const hasOpenCommission = commissions.some(
                (com: any) => Number(com.availableSpots) > 0
              );

              return (
                <div
                  key={curso.id}
                  className={`border-b ${
                    hasOpenCommission
                      ? "cursor-pointer"
                      : "opacity-40 pointer-events-none"
                  }`}
                >
                  <div className="flex flex-row justify-between pl-8 pr-8 pt-8 pb-0">
                    <span className="text-base font-light">{curso.name}</span>
                    <Badge variant="secondary">
                      {hasOpenCommission ? "Disponible" : "Sin cupos"}
                    </Badge>
                  </div>

                  <span className="font-light text-sm p-8 pt-3 block">
                    Código: {curso.code}{" "}
                    {curso.correlatives?.length
                      ? `- Correlativas: ${curso.correlatives.map(c => c.name).join(", ")}`
                      : "- Correlativas: Ninguna"}
                  </span>

                  {commissions.length > 0 && (
                    <div className="items-center gap-4 ml-6 mr-6 p-4 pl-8 mb-5">
                      <RadioGroup
                        value={selectedCommissions[curso.id] || ""}
                        onValueChange={val =>
                          handleCursoClick(curso.id.toString(), val)
                        }
                      >
                        {commissions.map((com: any) => {
                          const isFull = Number(com.availableSpots) === 0;
                          const isSelected =
                            selectedCommissions[curso.id] === com.id.toString();

                          return (
                            <div
                              key={com.id}
                              onClick={e => {
                                if (isFull) return;
                                e.stopPropagation();
                                handleCursoClick(
                                  curso.id.toString(),
                                  com.id.toString()
                                );
                              }}
                              className={`border rounded-xl pl-3 pr-3 mb-2 ${
                                isSelected ? "border-[#6F97F0]" : ""
                              } ${isFull ? "opacity-40 pointer-events-none" : "cursor-pointer"}`}
                            >
                              <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 p-2 pl-4">
                                <RadioGroupItem
                                  value={com.id.toString()}
                                  disabled={isFull}
                                  className="mt-1"
                                />

                                <div className="flex flex-col text-sm gap-1">
                                  <span className="font-base">
                                    {com.days} ({com.startTime} - {com.endTime})
                                  </span>
                                  <span className="text-[#737373]">
                                    Clase: {com.classRoom}
                                  </span>
                                  <span className="text-[#737373]">
                                    Modalidad: {com.mode}
                                  </span>
                                </div>

                                <div className="text-sm text-right text-[#737373] pr-6">
                                  {com.availableSpots}/{com.totalSpots} cupos
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </RadioGroup>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* === Modal confirmación === */}
        <AlertDialog open={insConfirmada} onOpenChange={setinsConfirmada}>
          <AlertDialogContent className="text-center w-[500px]">
            <AlertDialogHeader>
              <div className="justify-start">
                <Link
                  href={"/misCursos"}
                  onClick={() => setinsConfirmada(false)}
                >
                  <X color={"black"} />
                </Link>
              </div>
              <AlertDialogTitle>Inscripción confirmada</AlertDialogTitle>
              <AlertDialogDescription>
                Tus inscripciones fueron confirmadas. Verás el resumen en la
                tienda.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="justify-center"></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </main>
  );
}
