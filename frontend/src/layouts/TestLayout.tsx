import React from 'react';
import CountdownTimer from '../components/CountdownTimer'; 

interface TestLayoutProps {
  children: React.ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  timeLimit: number;     
  onTimeUp?: () => void; 
  testName?: string;     // Thêm dòng này: Nhận tên bài test từ TestSession
}

export default function TestLayout({ 
  children, 
  onNext, 
  onBack, 
  isFirst = true, 
  isLast = false,
  timeLimit,             
  onTimeUp,              
  testName               // Nhận prop
}: TestLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      
      {/* --- HEADER --- */}
      <header className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
          <div className="text-xl font-black text-blue-700 tracking-tight">
            Milish.
          </div>
          
          {/* Hiển thị tên bài test cực mượt trên Header */}
          {testName && (
            <>
              <div className="w-px h-6 bg-gray-300"></div>
              <h1 className="text-lg font-bold text-gray-700 truncate max-w-md">
                {testName}
              </h1>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-6">
          {/* TRUYỀN PROPS XUỐNG COUNTDOWNTIMER */}
          <CountdownTimer initialSeconds={timeLimit} onTimeUp={onTimeUp} /> 
          
          <button className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md text-sm font-bold hover:bg-red-100 transition-colors">
            THOÁT BÀI THI
          </button>
        </div>
      </header>

      {/* --- MAIN CONTENT & FOOTER GIỮ NGUYÊN --- */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 flex justify-center">
        {children}
      </main>

      <footer className="bg-white border-t px-8 py-4 flex justify-between items-center shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-10">
        <button
          onClick={onBack}
          disabled={isFirst}
          className={`px-6 py-2.5 rounded-md font-semibold transition-all ${
            isFirst 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Quay lại
        </button>

        <button
          onClick={onNext}
          className={`px-8 py-2.5 rounded-md font-semibold text-white transition-all ${
            isLast 
              ? 'bg-green-600 hover:bg-green-700 shadow-md shadow-green-200' 
              : 'bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200'
          }`}
        >
          {isLast ? 'Nộp bài' : 'Câu tiếp theo'}
        </button>
      </footer>
    </div>
  );
}