// lib/api/enrollments.ts

import { apiFetch } from "./client";
import {
  AvailableCourse,
  AttendanceRecord,
  CourseGrades,
  EnrollmentDetails,
} from "./types";

const userId = "3e7df85d-2eac-4c1d-aa7f-87e1ec2b11e6";

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
      Authorization: `Bearer ${STATIC_TOKEN}`,
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
      Authorization: `Bearer ${STATIC_TOKEN}`,
    },
    body: JSON.stringify({ userId }),
  });
}
