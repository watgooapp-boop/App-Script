import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { StudentAttendance, AttendanceStatus } from './types';
import Header from './components/Header';
import StudentList from './components/StudentList';
import AttendanceReport from './components/AttendanceReport';
import ControlPanel from './components/ControlPanel';
import MsReport from './components/MsReport';
import { getSheetData, saveSheetData } from './services/sheetService';

const App: React.FC = () => {
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    setIsLoading(true);
    setError(null);
    getSheetData()
      .then(data => {
        setStudents(data);
      })
      .catch(err => {
        console.error("Failed to load data from Google Sheet:", err);
        setError(`ไม่สามารถโหลดข้อมูลจาก Google Sheet ได้: ${err.message}. กรุณาตรวจสอบการตั้งค่า Deployment ของสคริปต์และลองรีเฟรชหน้าเว็บ`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  const uniqueClassrooms = useMemo(() => {
    const classrooms = new Set(students.map(s => s.classroom));
    return Array.from(classrooms).sort((a, b) => Number(a) - Number(b));
  }, [students]);

  const [selectedClassroomForCheck, setSelectedClassroomForCheck] = useState<string>('');

  useEffect(() => {
    // Set the default selected classroom when classrooms are loaded or if the selection becomes invalid
    if (uniqueClassrooms.length > 0) {
      const isSelectionValid = uniqueClassrooms.some(c => c.toString() === selectedClassroomForCheck);
      if (!isSelectionValid) {
        setSelectedClassroomForCheck(uniqueClassrooms[0].toString());
      }
    }
  }, [uniqueClassrooms, selectedClassroomForCheck]);

  useEffect(() => {
    // When date changes or students load, set default status to PRESENT for all students for that date
    // if no record exists. This avoids an infinite loop by checking if an update is needed first.
    const needsUpdate = students.length > 0 && students.some(student =>
      !student.attendance.some(record => record.date === currentDate)
    );

    if (needsUpdate) {
      setStudents(prevStudents =>
        prevStudents.map(student => {
          const hasRecord = student.attendance.some(record => record.date === currentDate);
          if (!hasRecord) {
            return {
              ...student,
              attendance: [...student.attendance, { date: currentDate, status: AttendanceStatus.PRESENT }],
            };
          }
          return student;
        })
      );
    }
  }, [currentDate, students]);


  const handleUpdateAttendance = useCallback((studentId: string, date: string, status: AttendanceStatus) => {
    setStudents(prevStudents =>
      prevStudents.map(student => {
        if (student.id === studentId) {
          const attendance = [...student.attendance];
          const recordIndex = attendance.findIndex(record => record.date === date);
          if (recordIndex > -1) {
            attendance[recordIndex] = { ...attendance[recordIndex], status };
          } else {
            attendance.push({ date, status });
          }
          return { ...student, attendance };
        }
        return student;
      })
    );
  }, []);

  const handleSaveChanges = useCallback(() => {
    setIsSaving(true);
    // @ts-ignore
    Swal.fire({
        title: 'กำลังบันทึก...',
        text: 'กรุณารอสักครู่ ระบบกำลังบันทึกข้อมูลไปยัง Google Sheet',
        allowOutsideClick: false,
        didOpen: () => {
            // @ts-ignore
            Swal.showLoading();
        }
    });

    saveSheetData(students)
      .then((response) => {
        // @ts-ignore
        Swal.fire('บันทึกสำเร็จ!', response.message || 'ข้อมูลถูกบันทึกไปยัง Google Sheet เรียบร้อยแล้ว', 'success');
      })
      .catch(err => {
        console.error("Failed to save data to Google Sheet:", err);
        // @ts-ignore
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด!',
            html: `${err.message || 'ไม่สามารถบันทึกข้อมูลได้'}<br><br><small><b>คำแนะนำ:</b> กรุณาตรวจสอบชีท <b>DebugLogs</b> ใน Google Sheet ของคุณสำหรับข้อมูลเพิ่มเติม</small>`,
        });
      })
      .finally(() => {
        setIsSaving(false);
      });
  }, [students]);

  const uniqueDates = useMemo(() => {
    const allDates = new Set<string>();
    students.forEach(student => {
      student.attendance.forEach(record => {
        allDates.add(record.date);
      });
    });
    return Array.from(allDates).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [students]);

  if (isLoading && students.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-indigo-600 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-lg font-semibold text-gray-700">กำลังโหลดข้อมูลจาก Google Sheet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      <Header />
      <main className="container mx-auto p-4 md:p-8 flex-grow">
        {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                <p className="font-bold">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
                <p>{error}</p>
            </div>
        )}
        <ControlPanel
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          onRefresh={fetchData}
          isRefreshing={isLoading}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <StudentList
            students={students}
            currentDate={currentDate}
            onUpdateAttendance={handleUpdateAttendance}
            selectedClassroom={selectedClassroomForCheck}
            onClassroomChange={setSelectedClassroomForCheck}
            uniqueClassrooms={uniqueClassrooms}
            onSaveChanges={handleSaveChanges}
            isSaving={isSaving}
          />
          <AttendanceReport students={students} allDates={uniqueDates} />
        </div>
        <MsReport students={students} allDates={uniqueDates} />
      </main>
      <footer className="text-center py-4 text-sm text-gray-500 bg-white shadow-inner mt-8">
        <p>Copyright 2025 โดย นายวัชรินทร์ ไมตรีแพน ครูผู้สอน โรงเรียนหนองบัวแดงวิทยา</p>
      </footer>
    </div>
  );
};

export default App;