import { StudentAttendance } from '../types';

// The user's final, correct Google Apps Script URL has been placed here.
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbznALmA9ytFrTJE47Xft0oljUAacfBshAoo9rqjFZWL86bSwAmmktapMaAGm8ozw5QF/exec';

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response from Google Apps Script:", errorText);
        throw new Error(`ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ (HTTP ${response.status}). กรุณาตรวจสอบการตั้งค่า Deployment ของ Google Apps Script`);
    }

    const responseText = await response.text();
    try {
        const data = JSON.parse(responseText);
        // If the script returns an error status, throw it
        if (data.status === 'error') {
            throw new Error(data.message || 'เกิดข้อผิดพลาดที่ไม่รู้จักฝั่งเซิร์ฟเวอร์');
        }
        return data;
    } catch (e) {
        console.error("Failed to parse JSON response from Google Apps Script:", responseText);
        throw new Error("ได้รับข้อมูลที่ไม่ถูกต้องจากเซิร์ฟเวอร์ กรุณาตรวจสอบ Log ใน Google Apps Script");
    }
};


export const getSheetData = async (): Promise<StudentAttendance[]> => {
  const response = await fetch(SCRIPT_URL);
  const data = await handleResponse(response);
  
  // Ensure attendance is always an array and format dates correctly
  return data.map((student: any) => ({
      ...student,
      attendance: (student.attendance || []).map((att: any) => ({
          ...att,
          date: new Date(att.date).toISOString().split('T')[0]
      }))
  }));
};

export const saveSheetData = async (students: StudentAttendance[]): Promise<any> => {
    const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain;charset=utf-8', // Use text/plain for Apps Script POST body
        },
        body: JSON.stringify(students),
    });

    return handleResponse(response);
};
