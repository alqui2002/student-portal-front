"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  PanelLeft,
  FolderOpen,
  UserCheck,
  Check,
  X,
  Loader2,
  CombineIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Loader from "@/components/ui/loader";

import { Button } from "@/components/ui/button";
import {
  getEnrollmentDetailsByid,
  getAtendencessByUserID,
  deleteEnrollmentById,
  getCoursesGradesByCommissionID,
} from "@/lib/api/enrollments";
import {
  AttendanceRecord,
  CourseGrades,
  EnrollmentDetails,
} from "@/lib/api/types";

export default function CursoDetallePage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();

  const courseId = params.id;
  const commissionId = searchParams.get("commissionId");

  const [courseDetails, setCourseDetails] = useState<EnrollmentDetails | null>(
    null
  );
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [grades, setGrades] = useState<CourseGrades | null>(null);

  const [loading, setLoading] = useState(true);

  const [popUpBaja, setPopUpBaja] = useState(false);
  const [bajaConfirmada, setBajaConfirmada] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        if (!commissionId) return;
        setLoading(true);

        const [courseData, auxAttendance, auxgrades] = await Promise.all([
          getEnrollmentDetailsByid(commissionId),
          getAtendencessByUserID(commissionId),
          getCoursesGradesByCommissionID(commissionId),
        ]);

        console.log(courseData);

        setCourseDetails(courseData);
        setAttendances(auxAttendance);
        setGrades(auxgrades);
      } catch (err) {
        console.error("❌ Error al traer datos del curso:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [commissionId]);

  async function handleCourseDelete() {
    try {
      if (!commissionId) {
        return;
      }
      await deleteEnrollmentById(courseId, commissionId);

      setPopUpBaja(false);
      setBajaConfirmada(true);

      console.log("✅ Curso dado de baja correctamente");
    } catch (error) {
      console.error("❌ Error al dar de baja:", error);
      alert("Ocurrió un error al intentar darte de baja del curso.");
    }
  }

  if (loading) {
    return <Loader message="Cargando detalles del curso..." />;
  }

  if (!courseDetails) {
    return (
      <main className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-600">No se encontraron detalles del curso.</p>
        <Link href="/misCursos">
          <Button className="mt-4">Volver a Mis Cursos</Button>
        </Link>
      </main>
    );
  }

  const firstExamValue = grades?.firstExam;
  const secondExamValue = grades?.secondExam;
  const recuExamValue = grades?.recuExam;
  const finalExamValue = grades?.finalExam;

  return (
    <main className="w-full flex flex-col gap-8 bg-white mb-5">
      <div className="pt-9.5 pb-9.5 pl-8 flex gap-4 items-center border-b h-[53px] text-sm text-muted-foreground">
        <PanelLeft size={15} />
        <span className="text-muted-foreground">|</span>

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink>Portal Estudiante</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/misCursos">Mis Cursos</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {courseDetails?.course?.name || "Cargando..."}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="pl-8 pr-8">
        {/* Header */}
        <div className="flex flex-row justify-between items-center pb-6 pt-4">
          <h1 className="text-2xl font-medium">
            {courseDetails?.course?.name}
          </h1>

          <Badge
            variant="deBaja"
            className="font-light pr-6 pl-6 hover:cursor-pointer shadow-md transition-shadow duration-300"
            onClick={() => setPopUpBaja(true)}
          >
            Dar de baja
          </Badge>
        </div>

        <AlertDialog open={popUpBaja} onOpenChange={setPopUpBaja}>
          <AlertDialogContent className="text-center w-[500px]">
            <AlertDialogHeader>
              <AlertDialogTitle>
                ¿Seguro que quieres darte de baja de este curso?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede revertir. El último mes cursado debe ser
                abonado.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="justify-center space-x-4">
              <AlertDialogCancel onClick={() => setPopUpBaja(false)}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setPopUpBaja(false);
                  setBajaConfirmada(true);
                  handleCourseDelete();
                }}
              >
                Confirmar baja
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={bajaConfirmada} onOpenChange={setBajaConfirmada}>
          <AlertDialogContent className="text-center w-[500px]">
            <AlertDialogHeader>
              <div className="flex justify-end">
                <Link
                  href="/misCursos"
                  onClick={() => setBajaConfirmada(false)}
                >
                  <X color="black" />
                </Link>
              </div>
              <AlertDialogTitle>Baja confirmada</AlertDialogTitle>
              <AlertDialogDescription>
                El curso ya no se encuentra en tus inscripciones.
              </AlertDialogDescription>
            </AlertDialogHeader>
          </AlertDialogContent>
        </AlertDialog>

        <div className="flex flex-row pl-4 items-start gap-6">
          <div className="border rounded-xl bg-white w-[370px] mr-8 flex flex-col">
            <div className="flex items-center p-4 pr-6 rounded-t-xl bg-[#6F97F0]">
              <FolderOpen size={18} />
              <span className="pl-5 text-base font-medium">
                Información general
              </span>
            </div>

            <div className="flex justify-between items-center p-4 pb-2 pr-6">
              <span className="text-sm text-[#8C8C8C] font-light">
                Profesor:
              </span>
              <span className="text-sm">
                {courseDetails?.commission?.professorName || "—"}
              </span>
            </div>

            <div className="flex justify-between items-center p-4 pb-2 pr-6">
              <span className="text-sm text-[#8C8C8C] font-light">
                Horario:
              </span>
              <span className="text-sm">
                {courseDetails?.commission?.days || "—"}{" "}
                {courseDetails?.commission?.startTime
                  ? `${courseDetails.commission.startTime}–${courseDetails.commission.endTime}`
                  : ""}
              </span>
            </div>

            <div className="flex justify-between items-center p-4 pb-5 pr-6">
              <span className="text-sm text-[#8C8C8C] font-light">Aula:</span>
              <span className="text-sm">
                {courseDetails?.commission?.classroom || "—"}
              </span>
            </div>
          </div>

          <div className="border rounded-xl bg-white w-[370px] flex flex-col">
            <div className="flex items-center p-4 pr-6 rounded-t-xl bg-[#6F97F0]">
              <UserCheck size={18} />
              <span className="pl-5 text-base font-medium">Asistencias</span>
            </div>

            <div className="flex justify-between items-center p-4 pb-2 pr-6">
              <span className="text-sm text-[#8C8C8C] font-light">
                Total de clases:
              </span>
              <span className="text-sm">{attendances.length}</span>
            </div>

            <div className="flex justify-between items-center p-4 pb-2 pr-6">
              <span className="text-sm text-[#8C8C8C] font-light">
                Asistencias:
              </span>
              <span className="text-sm">
                {attendances.filter(a => a.present).length}
              </span>
            </div>

            <div className="flex justify-between items-center p-4 pb-5 pr-6 border-b">
              <span className="text-sm text-[#8C8C8C] font-light">Faltas:</span>
              <span className="text-sm">
                {attendances.filter(a => !a.present).length}
              </span>
            </div>

            <div className="flex justify-between items-center p-4 pb-5 pr-6">
              <span className="text-sm text-[#8C8C8C] font-light">
                Porcentaje:
              </span>
              <span className="text-sm">
                {attendances.length > 0
                  ? `${Math.round(
                      (attendances.filter(a => a.present).length /
                        attendances.length) *
                        100
                    )}%`
                  : "—"}
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-auto pl-4 pt-12">
          <h1 className="text-xl font-medium pb-5">Calificaciones</h1>

          <table className="w-full border-collapse text-sm text-left rounded-md overflow-hidden pr-6 ">
            <thead className="bg-gray-100">
              <tr className="border-l border-r border-b font-medium">
                <th className="p-2 pl-8 font-normal text-[#595959]">
                  Evaluación
                </th>
                <th className="p-2 font-normal text-[#595959]">Calificación</th>
                <th className="p-2 font-normal text-[#595959]">Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-l border-r border-b">
                <td className="p-2 pl-8">Primer Parcial</td>

                <td className="p-2">{firstExamValue ?? "—"}</td>
                <td className="p-2">
                  {firstExamValue !== null && firstExamValue !== undefined && (
                    <Badge
                      variant="secondary"
                      className={`font-light ${
                        firstExamValue < 4
                          ? "border border-red-500 text-red-700"
                          : ""
                      }`}
                    >
                      {firstExamValue >= 4 ? "Aprobado" : "Desaprobado"}
                    </Badge>
                  )}
                </td>
              </tr>
              <tr className="border-l border-r border-b">
                <td className="p-2 pl-8">Segundo Parcial</td>

                <td className="p-2">{secondExamValue ?? "—"}</td>
                <td className="p-2">
                  {secondExamValue !== null &&
                    secondExamValue !== undefined && (
                      <Badge
                        variant="secondary"
                        className={`font-light ${
                          secondExamValue < 4
                            ? "border border-red-500 text-red-700"
                            : ""
                        }`}
                      >
                        {secondExamValue >= 4 ? "Aprobado" : "Desaprobado"}
                      </Badge>
                    )}
                </td>
              </tr>
              <tr className="border-l border-r border-b">
                <td className="p-2 pl-8">Recuperatorio</td>

                <td className="p-2">{recuExamValue ?? "—"}</td>
                <td className="p-2">
                  {recuExamValue !== null && recuExamValue !== undefined && (
                    <Badge
                      variant="secondary"
                      className={`font-light ${
                        recuExamValue < 4
                          ? "border border-red-500 text-red-700"
                          : ""
                      }`}
                    >
                      {recuExamValue >= 4 ? "Aprobado" : "Desaprobado"}
                    </Badge>
                  )}
                </td>
              </tr>
              <tr className="border-l border-r border-b">
                <td className="p-2 pl-8">Final</td>

                <td className="p-2">{finalExamValue ?? "—"}</td>
                <td className="p-2">
                  {finalExamValue !== null && finalExamValue !== undefined && (
                    <Badge
                      variant="secondary"
                      className={`font-light ${
                        finalExamValue < 4
                          ? "border border-red-500 text-red-700"
                          : ""
                      }`}
                    >
                      {finalExamValue >= 4 ? "Aprobado" : "Desaprobado"}
                    </Badge>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="overflow-auto pl-4 pt-12">
          <h1 className="text-xl font-medium pb-5">Asistencias</h1>

          <div className="grid grid-cols-4 gap-5 pl-4">
            {attendances.length === 0 ? (
              <div className="text-sm text-gray-500 italic py-6">
                No hay asistencias registradas aún.
              </div>
            ) : (
              attendances.map(attendance => {
                const fecha = new Date(attendance.date);
                const dia = fecha.toLocaleDateString("es-ES", {
                  weekday: "short",
                  day: "2-digit",
                  month: "short",
                });
                const hora = fecha.toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={attendance.id}
                    className="bg-gray-100 w-[290px] h-[90px] flex flex-row justify-between p-2 rounded-lg"
                  >
                    <div className="flex flex-col justify-between p-4 gap-1 pr-6">
                      <span className="text-sm">{dia}</span>
                      <span className="text-sm">{hora}</span>
                    </div>

                    <div className="pr-4 justify-center items-center flex">
                      {attendance.present ? (
                        <Check size={30} color="#6D9C66" />
                      ) : (
                        <X size={30} color="#D9534F" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
