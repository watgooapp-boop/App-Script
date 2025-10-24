
import React from 'react';
import { StudentAttendance, AttendanceStatus } from '../types';

declare var Swal: any;

interface StudentListProps {
  students: StudentAttendance[];
  currentDate: string;
  onUpdateAttendance: (studentId: string, date: string, status: AttendanceStatus) => void;
  selectedClassroom: string;
  onClassroomChange: (classroomId: string) => void;
  uniqueClassrooms: (string | number)[];
  onSaveChanges: () => void;
  isSaving: boolean;
}

const statusConfig = {
    [AttendanceStatus.PRESENT]: { text: 'มา', color: 'bg-green-500', hover: 'hover:bg-green-600' },
    [AttendanceStatus.SICK_LEAVE]: { text: 'ลา', color: 'bg-blue-500', hover: 'hover:bg-blue-600' },
    [AttendanceStatus.ABSENT]: { text: 'ขาด', color: 'bg-red-500', hover: 'hover:bg-red-600' },
    [AttendanceStatus.ACTIVITY]: { text: 'กิจกรรม', color: 'bg-purple-500', hover: 'hover:bg-purple-600' },
};

const AttendanceButton: React.FC<{
    status: AttendanceStatus;
    onClick: () => void;
    isActive: boolean;
}> = ({ status, onClick, isActive }) => {
    const config = statusConfig[status];
    if (!config) return null;

    const activeClasses = `${config.color} text-white`;
    const inactiveClasses = 'bg-gray-200 text-gray-600 hover:bg-gray-300';

    return (
        <button
            onClick={onClick}
            className={`px-3 py-1 text-sm font-medium rounded-full transition-colors duration-200 ${isActive ? activeClasses : inactiveClasses}`}
        >
            {config.text}
        </button>
    );
};

const StudentRow: React.FC<{
  student: StudentAttendance;
  currentDate: string;
  onUpdateAttendance: (studentId: string, date: string, status: AttendanceStatus) => void;
}> = ({ student, currentDate, onUpdateAttendance }) => {
  const attendanceRecord = student.attendance.find(record => record.date === currentDate);
  const currentStatus = attendanceRecord?.status ?? AttendanceStatus.NOT_RECORDED;
  
  const statusDisplayConfig = {
    [AttendanceStatus.PRESENT]: { text: 'มา', color: 'text-green-600' },
    [AttendanceStatus.SICK_LEAVE]: { text: 'ลา', color: 'text-blue-600' },
    [AttendanceStatus.ABSENT]: { text: 'ขาด', color: 'text-red-600' },
    [AttendanceStatus.ACTIVITY]: { text: 'กิจกรรม', color: 'text-purple-600' },
    [AttendanceStatus.NOT_RECORDED]: { text: 'ยังไม่เช็คชื่อ', color: 'text-gray-500' },
  };

  return (
    <li className="bg-white p-4 rounded-lg shadow transition-shadow hover:shadow-md">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div>
          <p className="font-semibold text-gray-800">{student.name}</p>
          <p className="text-sm text-gray-500">
            เลขที่: {student.studentNumber} &bull; รหัส: {student.id} &bull; ห้อง: {student.grade}/{student.classroom}
          </p>
        </div>
        <div className="mt-3 sm:mt-0 flex items-center flex-wrap gap-2">
            <AttendanceButton 
                status={AttendanceStatus.PRESENT}
                onClick={() => onUpdateAttendance(student.id, currentDate, AttendanceStatus.PRESENT)}
                isActive={currentStatus === AttendanceStatus.PRESENT}
            />
            <AttendanceButton 
                status={AttendanceStatus.SICK_LEAVE}
                onClick={() => onUpdateAttendance(student.id, currentDate, AttendanceStatus.SICK_LEAVE)}
                isActive={currentStatus === AttendanceStatus.SICK_LEAVE}
            />
            <AttendanceButton 
                status={AttendanceStatus.ABSENT}
                onClick={() => onUpdateAttendance(student.id, currentDate, AttendanceStatus.ABSENT)}
                isActive={currentStatus === AttendanceStatus.ABSENT}
            />
            <AttendanceButton 
                status={AttendanceStatus.ACTIVITY}
                onClick={() => onUpdateAttendance(student.id, currentDate, AttendanceStatus.ACTIVITY)}
                isActive={currentStatus === AttendanceStatus.ACTIVITY}
            />
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-sm">
            สถานะวันนี้: <span className={`font-medium ${statusDisplayConfig[currentStatus]?.color || 'text-gray-500'}`}>{statusDisplayConfig[currentStatus]?.text || 'N/A'}</span>
        </p>
      </div>
    </li>
  );
};


const StudentList: React.FC<StudentListProps> = ({ students, currentDate, onUpdateAttendance, selectedClassroom, onClassroomChange, uniqueClassrooms, onSaveChanges, isSaving }) => {
  
  const filteredStudents = students.filter(student => student.classroom.toString() === selectedClassroom);

  const handleSaveClick = () => {
    Swal.fire({
      title: 'ยืนยันการบันทึกข้อมูล',
      text: `คุณต้องการบันทึกข้อมูลไปยัง Google Sheet ใช่หรือไม่?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'ใช่, บันทึก',
      cancelButtonText: 'ยกเลิก'
    }).then((result: { isConfirmed: boolean }) => {
      if (result.isConfirmed) {
        onSaveChanges();
      }
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h2 className="text-xl font-bold text-gray-800 whitespace-nowrap">รายชื่อนักเรียน</h2>
         {uniqueClassrooms.length > 0 && (
            <div>
              <label htmlFor="classroom-select" className="sr-only">เลือกห้อง</label>
              <select
                  id="classroom-select"
                  value={selectedClassroom}
                  onChange={(e) => onClassroomChange(e.target.value)}
                  className="w-full sm:w-auto mt-1 block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                  {uniqueClassrooms.map(room => (
                      <option key={room} value={room}>
                          ม.5/{room}
                      </option>
                  ))}
              </select>
            </div>
         )}
      </div>

      {filteredStudents.length > 0 ? (
        <>
            <ul className="space-y-3 max-h-[55vh] overflow-y-auto pr-2">
            {filteredStudents.map(student => (
                <StudentRow 
                key={student.id} 
                student={student} 
                currentDate={currentDate}
                onUpdateAttendance={onUpdateAttendance}
                />
            ))}
            </ul>
            <div className="mt-6">
                <button
                    onClick={handleSaveClick}
                    disabled={isSaving}
                    className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isSaving ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            กำลังบันทึก...
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            บันทึกข้อมูลการเช็คชื่อ
                        </>
                    )}
                </button>
            </div>
        </>
      ) : (
        <div className="text-center py-10 px-4 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">{students.length === 0 ? "ไม่มีข้อมูลนักเรียน" : "ไม่มีนักเรียนในห้องที่เลือก"}</p>
            <p className="text-sm text-gray-400 mt-1">{students.length === 0 ? "กรุณาเพิ่มนักเรียน" : "กรุณาเลือกห้องอื่น"}</p>
        </div>
      )}
    </div>
  );
};

export default StudentList;