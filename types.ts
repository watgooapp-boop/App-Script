export interface Student {
  id: string; // รหัสนักเรียน (5 digits)
  studentNumber: number; // เลขที่
  name: string;
  grade: string; // e.g., 'ม.5'
  classroom: number; // e.g., 1-13
}

export enum AttendanceStatus {
  PRESENT = 'มา',
  SICK_LEAVE = 'ลา',
  ABSENT = 'ขาด',
  ACTIVITY = 'กิจกรรม',
  NOT_RECORDED = 'ยังไม่เช็คชื่อ',
}

export interface AttendanceRecord {
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
}

export interface StudentAttendance extends Student {
  attendance: AttendanceRecord[];
}
