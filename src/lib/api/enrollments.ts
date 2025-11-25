// lib/api/enrollments.ts

import { apiFetch } from "./client";
import {
  AvailableCourse,
  AttendanceRecord,
  CourseGrades,
  EnrollmentDetails,
} from "./types";

const STATIC_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhM2I1ZjZkNC05YzI4LTRiNDEtYmI5MC05ZDM2YTkyZjRiMTciLCJlbWFpbCI6ImdyZWdvcmlvY2FycmFuemFAaG90bWFpbC5jb20iLCJuYW1lIjoiR3JlZ29yaW8iLCJyb2xlIjoiQUxVTU5PIiwiY2FyZWVyIjp7InV1aWQiOiJlZGI1YTc1NC02NTE5LTQ4OTUtODQ2NC1iNzcwN2U3Nzc5NjMiLCJuYW1lIjoiTGljZW5jaWF0dXJhIGVuIFNpc3RlbWFzIGRlIEluZm9ybWFjacOzbiJ9LCJpYXQiOjE3NjM1ODkwMjAsImV4cCI6MTc2MzU5ODAyMH0.k6A0wlKVQTQhywjQCyYtyU6W5juXDbYKbBhje8cPx84";

const userId = "09109e49-e243-4db8-b3b8-291e1f997bda";

export async function getEnrollmentsByUser() {
  return apiFetch(`/enrollments?userId=${userId}`);
}

export async function getAcademicHistoryByUser() {
  return apiFetch(`/academic-history/${userId}`);
}

export async function getEnrollmentDetailsByid(
  comissionid: string
): Promise<EnrollmentDetails> {
  return apiFetch<EnrollmentDetails>(
    `/enrollments/${comissionid}?userId=${userId}`
  );
}

export async function getAtendencessByUserID(
  comissionid: string
): Promise<AttendanceRecord[]> {
  return apiFetch<AttendanceRecord[]>(
    `/commissions/${comissionid}/attendances/${userId}/`
  );
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

export async function getAvailableCoursesByUserId(): Promise<AvailableCourse[]> {
  return apiFetch<AvailableCourse[]>(
    `/courses?status=available&userId=${userId}`
  );
}

export async function getCoursesGradesByCommissionID(
  commissionId: string
): Promise<CourseGrades | null> {
  return apiFetch<CourseGrades | null>(
    `/grades/user/${userId}/commission/${commissionId}`
  );
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
