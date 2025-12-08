export interface Saldo {
  balance: number;
}

export interface Compra {
  id: string;
  product: {
    map(
      arg0: (prod: {
        name: string;
        description: any;
        quantity: any;
        subtotal: any;
      }) => { description: any; quantity: any; subtotal: any }
    ): any;
    length: number;
    description: string;
  };
  date: string;
  total: number;
}

export interface CardDetails {
  cardNumber: string;
  expiration: string;
  cvv: string;
  amount: number;
}

export interface CourseCorrelative {
  id: string;
  name: string;
}

export interface CourseCommission {
  id: string;
  days: string;
  startTime: string;
  endTime: string;
  classRoom: string;
  mode: string;
  availableSpots: number;
  totalSpots: number;
}

export interface AvailableCourse {
  id: string | number;
  name: string;
  code: string;
  correlatives?: CourseCorrelative[];
  commissions?: CourseCommission[];
}

export interface CourseInfo {
  id?: string | number;
  name?: string;
  code?: string;
}

export interface CommissionInfo {
  id?: string | number;
  professorName?: string;
  days?: string;
  startTime?: string;
  endTime?: string;
  classroom?: string;
}

export interface EnrollmentDetails {
  id?: string | number;
  course?: CourseInfo;
  commission?: CommissionInfo;
}

export interface AttendanceRecord {
  id: string | number;
  date: string;
  present: boolean;
}

export interface CourseGrades {
  firstExam?: number | null;
  secondExam?: number | null;
  finalExam?: number | null;
}

export interface NotificationData {
  id: string;
  type: "exam" | "examen" | "sancion" | "evento";
  title: string;
  message?: string;
  description?: string;
  date?: string;
  context?: string;
  contextLink?: string;
}

export interface SyncWalletResponse {
  success: boolean;
  balance: string;
}
