
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-start">
        <div className="flex items-center space-x-4">
            <img src="https://img5.pic.in.th/file/secure-sv1/nw_logo-removebg.png" alt="School Logo" className="h-14" />
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">เช็คเวลาเรียน นักเรียน มัธยมศึกษาปีที่ 5 รายวิชา อินโฟกราฟิก โรงเรียนหนองบัวแดงวิทยา</h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
