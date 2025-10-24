import React from 'react';

interface ControlPanelProps {
  currentDate: string;
  onDateChange: (date: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  currentDate,
  onDateChange,
  onRefresh,
  isRefreshing,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-grow sm:flex-grow-0">
          <label htmlFor="current-date" className="block text-sm font-medium text-gray-700 mb-1">
            วันที่เช็คชื่อ
          </label>
          <input
            type="date"
            id="current-date"
            value={currentDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isRefreshing ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังอัปเดต...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M15.312 11.224a5.5 5.5 0 01-10.624 0H2.25a.75.75 0 010-1.5h2.438a5.5 5.5 0 0110.624 0h2.438a.75.75 0 010 1.5h-2.438zM14.25 5.25a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H15a.75.75 0 01-.75-.75zM14.25 15.75a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H15a.75.75 0 01-.75-.75zM5.75 5.25a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H6.5a.75.75 0 01-.75-.75zM5.75 15.75a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H6.5a.75.75 0 01-.75-.75zM9.25 3.5a.75.75 0 01.75-.75h1a.75.75 0 010 1.5h-1a.75.75 0 01-.75-.75zM9.25 17.5a.75.75 0 01.75-.75h1a.75.75 0 010 1.5h-1a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                </svg>
                อัปเดตข้อมูล
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;