import { jwtDecode } from "jwt-decode";
import { apiFetch } from "./client";
import {
  AvailableCourse,
  AttendanceRecord,
  CourseGrades,
  EnrollmentDetails,
} from "./types";

const token = getJwtFromCookie();

const userId = getUserIdFromToken();

function getUserIdFromToken(): string {
  if (typeof document === "undefined") return "";

  const token = document.cookie
    .split("; ")
    .find(row => row.startsWith("JWT="))
    ?.split("=")[1];

  if (!token) throw new Error("No hay sesión activa");

  const decoded: any = jwtDecode(token);
  return decoded.sub;
}

export async function getEnrollmentsByUser() {
  return apiFetch(`/enrollments?userId=${userId}`);
}

export async function getAcademicHistoryByUser() {
  return apiFetch(`/academic-history/${userId}`);
}

export async function getEnrollmentDetailsByid(
  comissionid: string
): Promise<EnrollmentDetails> {
  return apiFetch(`/enrollments/${comissionid}?userId=${userId}`);
}

export async function getAtendencessByUserID(
  comissionid: string
): Promise<AttendanceRecord[]> {
  return apiFetch(`/commissions/${comissionid}/attendances/${userId}/`);
}

export async function deleteEnrollmentById(
  courseid: string,
  comissionid: string
) {
  return apiFetch(`/enrollments/${courseid}/commissions/${comissionid}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userId }),
  });
}

export async function getAvailableCoursesByUserId(): Promise<
  AvailableCourse[]
> {
  return apiFetch(`/courses?status=available&userId=${userId}`);
}

export async function getCoursesGradesByCommissionID(
  commissionId: string
): Promise<CourseGrades | null> {
  return apiFetch(`/grades/user/${userId}/commission/${commissionId}`);
}

export async function enrollUserInCourseIdAndCommissionId(
  courseId: string,
  commissionId: string
) {
  return apiFetch(`/enrollments/${courseId}/commissions/${commissionId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userId }),
  });
}

function getJwtFromCookie() {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/JWT=([^;]+)/);
  return match ? match[1] : null;
}
