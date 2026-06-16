import type { ReactNode } from 'react';

interface TestLayoutProps {
  children: ReactNode;
}

export default function TestLayout({ children }: TestLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      {/* Header: Thông tin kỳ thi và Đồng hồ */}
      <header className="bg-white border-b border-gray-300 h-16 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="font-bold text-xl text-blue-800">Milish.</h1>
          <span className="text-gray-500 font-medium hidden sm:inline">| TOEIC Speaking & Writing</span>
        </div>
        
        {/* Placeholder Đồng hồ đếm ngược */}
        <div className="bg-blue-50 border border-blue-200 px-6 py-1 rounded-md text-blue-700 font-bold text-xl tracking-widest shadow-inner">
          00:45
        </div>

        <div className="text-sm font-medium text-gray-600">
          Candidate: <span className="font-bold text-gray-900 uppercase">Milynx</span>
        </div>
      </header>

      {/* Main Workspace: Khu vực hiển thị câu hỏi */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center items-start">
        <div className="w-full max-w-5xl bg-white shadow-sm border border-gray-200 rounded-lg p-6 sm:p-10 min-h-[60vh]">
          {children}
        </div>
      </main>
      
      {/* Footer: Điều hướng */}
      <footer className="bg-white border-t border-gray-300 h-16 flex items-center justify-end px-6 shrink-0 gap-4">
        <button className="px-6 py-2 bg-gray-100 text-gray-700 font-semibold rounded hover:bg-gray-200 transition-colors">
          Back
        </button>
        <button className="px-8 py-2 bg-blue-600 text-white font-semibold rounded shadow-md hover:bg-blue-700 transition-colors">
          Next
        </button>
      </footer>
    </div>
  );
}