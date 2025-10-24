import React, { useState, useMemo } from 'react';
import { StudentAttendance, AttendanceStatus } from '../types';

interface MsReportProps {
  students: StudentAttendance[];
  allDates: string[];
}

const MsReport: React.FC<MsReportProps> = ({ students, allDates }) => {
  const [threshold, setThreshold] = useState<number>(80);

  const studentsWithMs = useMemo(() => {
    const reportData = students.map(student => {
      const firstAttendanceDate = student.attendance.reduce((earliest, record) => {
        return !earliest || record.date < earliest ? record.date : earliest;
      }, '');

      const attendanceMap = new Map(student.attendance.map(r => [r.date, r.status]));
      let presentCount = 0;
      let sickLeaveCount = 0;
      let activityCount = 0;
      let absentCount = 0;
      let totalCheckedDays = 0;

      allDates.forEach(date => {
        if (firstAttendanceDate && date >= firstAttendanceDate) {
          totalCheckedDays++;
          const status = attendanceMap.get(date);
          switch (status) {
            case AttendanceStatus.PRESENT: presentCount++; break;
            case AttendanceStatus.SICK_LEAVE: sickLeaveCount++; break;
            case AttendanceStatus.ACTIVITY: activityCount++; break;
            case AttendanceStatus.ABSENT: 
              absentCount++; 
              break;
            default: // No record counts as absent
              absentCount++;
              break;
          }
        }
      });

      const validAttendanceCount = presentCount + sickLeaveCount + activityCount;
      const percentage = totalCheckedDays > 0 ? (validAttendanceCount / totalCheckedDays) * 100 : 0;

      return {
        ...student,
        percentage,
        absentCount,
        presentCount,
      };
    });

    return reportData
      .filter(student => student.percentage < threshold)
      .sort((a, b) => {
        if (a.classroom !== b.classroom) return a.classroom - b.classroom;
        return a.studentNumber - b.studentNumber;
      });
  }, [students, allDates, threshold]);

  return (
    <div className="mt-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <h2 className="text-xl font-bold text-gray-800">รายงานนักเรียนที่ติด มส.</h2>
            <div className="flex items-center space-x-2 p-1 bg-gray-100 rounded-lg">
                <button
                    onClick={() => setThreshold(80)}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                        threshold === 80 ? 'bg-white text-indigo-600 shadow' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    ต่ำกว่า 80%
                </button>
                <button
                    onClick={() => setThreshold(60)}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                        threshold === 60 ? 'bg-white text-red-600 shadow' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    ต่ำกว่า 60%
                </button>
            </div>
        </div>
        {studentsWithMs.length > 0 ? (
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ลำดับ</th>
                        <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ห้อง</th>
                        <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">เลขที่</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัสนักเรียน</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อ-สกุล</th>
                        <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">รวมมา</th>
                        <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">เวลาเรียน (%)</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {studentsWithMs.map((student, index) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-500">{index + 1}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-500">{student.classroom}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-500">{student.studentNumber}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-left text-sm text-gray-500">{student.id}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-left text-sm font-medium text-gray-900">{student.name}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-bold text-green-600">{student.presentCount}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${student.percentage < 60 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {student.percentage.toFixed(0)}%
                            </span>
                        </td>
                    </tr>
                    ))}
                </tbody>
                <tfoot className="bg-gray-100 font-semibold">
                    <tr>
                        <td colSpan={6} className="px-4 py-3 text-right text-sm text-gray-800">
                            รวมจำนวนนักเรียนทั้งหมด
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-800">
                            {studentsWithMs.length} คน
                        </td>
                    </tr>
                </tfoot>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 px-4 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">ไม่มีนักเรียนที่ติด มส. ตามเงื่อนไขที่เลือก</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MsReport;