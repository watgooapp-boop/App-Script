import React, { useState, useMemo, Fragment } from 'react';
import { StudentAttendance, AttendanceStatus } from '../types';

interface AttendanceReportProps {
  students: StudentAttendance[];
  allDates: string[];
}

const getPercentageColor = (percentage: number) => {
  if (percentage < 60) {
    return 'bg-red-100 text-red-800';
  }
  if (percentage < 80) {
    return 'bg-yellow-100 text-yellow-800';
  }
  return 'bg-green-100 text-green-800';
};

const AttendanceReport: React.FC<AttendanceReportProps> = ({ students, allDates }) => {
    const [selectedClassroom, setSelectedClassroom] = useState<string>('all');
    const [expandedStudentIds, setExpandedStudentIds] = useState<Set<string>>(new Set());

    const toggleRow = (studentId: string) => {
        setExpandedStudentIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(studentId)) {
                newSet.delete(studentId);
            } else {
                newSet.add(studentId);
            }
            return newSet;
        });
    };

    const uniqueClassrooms = useMemo(() => {
        const classrooms = new Set(students.map(s => s.classroom));
        return Array.from(classrooms).sort((a, b) => Number(a) - Number(b));
    }, [students]);

    const reportData = useMemo(() => {
        const filteredStudents = students.filter(student => 
            selectedClassroom === 'all' || student.classroom === parseInt(selectedClassroom, 10)
        );

        return filteredStudents.map(student => {
            const firstAttendanceDate = student.attendance.reduce((earliest, record) => {
                return !earliest || record.date < earliest ? record.date : earliest;
            }, '');

            const attendanceMap = new Map(student.attendance.map(r => [r.date, r.status]));
            let presentCount = 0;
            let sickLeaveCount = 0;
            let activityCount = 0;
            let absentCount = 0;
            let totalCheckedDays = 0;
            const sickLeaveDates: string[] = [];
            const absentDates: string[] = [];

            allDates.forEach(date => {
                if (firstAttendanceDate && date >= firstAttendanceDate) {
                    totalCheckedDays++;
                    const status = attendanceMap.get(date);
                    switch (status) {
                        case AttendanceStatus.PRESENT: presentCount++; break;
                        case AttendanceStatus.SICK_LEAVE: 
                            sickLeaveCount++;
                            sickLeaveDates.push(date);
                            break;
                        case AttendanceStatus.ACTIVITY: activityCount++; break;
                        case AttendanceStatus.ABSENT: 
                            absentCount++;
                            absentDates.push(date);
                            break;
                        default:
                          absentCount++;
                          absentDates.push(date);
                          break;
                    }
                }
            });

            const validAttendanceCount = presentCount + sickLeaveCount + activityCount;
            const percentage = totalCheckedDays > 0 ? (validAttendanceCount / totalCheckedDays) * 100 : 0;
            
            return {
                ...student,
                presentCount,
                sickLeaveCount,
                activityCount,
                absentCount,
                percentage,
                totalDays: totalCheckedDays,
                sickLeaveDates,
                absentDates,
            };
        }).sort((a,b) => a.studentNumber - b.studentNumber);
    }, [students, allDates, selectedClassroom]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h2 className="text-xl font-bold text-gray-800 whitespace-nowrap">รายงานการเข้าเรียน</h2>
        <div>
          <label htmlFor="classroom-filter" className="sr-only">
            เลือกห้อง
          </label>
          <select
            id="classroom-filter"
            value={selectedClassroom}
            onChange={(e) => setSelectedClassroom(e.target.value)}
            className="w-full sm:w-auto mt-1 block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="all">ทุกห้อง</option>
            {uniqueClassrooms.map(room => (
              <option key={room} value={room}>
                ม.5/{room}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        {reportData.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อ-สกุล</th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">มา</th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ลา</th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">กิจกรรม</th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ขาด</th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">รวม</th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">% เข้าเรียน</th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">มส.</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.map(student => (
                <Fragment key={student.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap cursor-pointer" onClick={() => toggleRow(student.id)}>
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 text-gray-400 transition-transform duration-200 ${expandedStudentIds.has(student.id) ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">เลขที่: {student.studentNumber} &bull; รหัส: {student.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-500">{student.presentCount}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-500">{student.sickLeaveCount}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-500">{student.activityCount}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-500">{student.absentCount}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-semibold text-gray-600">{student.totalDays}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPercentageColor(student.percentage)}`}>
                        {student.percentage.toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm">
                        {student.percentage < 80 && (
                            <span className="text-red-600 font-bold">มส.</span>
                        )}
                    </td>
                  </tr>
                  {expandedStudentIds.has(student.id) && (
                     <tr className="bg-indigo-50">
                        <td colSpan={8} className="px-8 py-3">
                           <div className="p-2">
                                <h4 className="font-semibold text-sm text-gray-800 mb-2">รายละเอียดการขาด/ลา:</h4>
                                {student.sickLeaveDates.length > 0 && (
                                    <div className="mb-1">
                                        <strong className="text-blue-600 text-sm">วันลา ({student.sickLeaveDates.length} วัน):</strong>
                                        <p className="text-xs text-gray-600 mt-1">{student.sickLeaveDates.join(', ')}</p>
                                    </div>
                                )}
                                {student.absentDates.length > 0 && (
                                    <div className="mt-2">
                                        <strong className="text-red-600 text-sm">วันขาด ({student.absentDates.length} วัน):</strong>
                                        <p className="text-xs text-gray-600 mt-1">{student.absentDates.join(', ')}</p>
                                    </div>
                                )}
                                {student.sickLeaveDates.length === 0 && student.absentDates.length === 0 && (
                                    <p className="text-xs text-gray-500">ไม่มีประวัติการขาดหรือลา</p>
                                )}
                           </div>
                        </td>
                     </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        ) : (
            <div className="text-center py-10 px-4 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500">ไม่มีข้อมูลสำหรับห้องที่เลือก</p>
                <p className="text-sm text-gray-400 mt-1">กรุณาเลือกห้องอื่นหรือเพิ่มข้อมูลนักเรียน</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceReport;