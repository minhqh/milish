import { useState } from "react";
import type { ClipboardEvent } from "react";

export default function WritingWorkspace() {
    const [text, setText] = useState('');

    // Chặn gian lận (copy/paste)
    const handlePreventAction = (e: ClipboardEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
    };

    // Logic đếm từ
    const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;

    return (
    <div className="w-full flex flex-col gap-4 mt-8 w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-end">
        <h3 className="font-semibold text-gray-700 text-lg">Your Response:</h3>
        
        {/* Bộ đếm từ: Sẽ hiện màu cam nếu dưới 300 từ (yêu cầu tối thiểu của bài Essay), màu xanh nếu đủ */}
        <span className="text-sm font-medium text-gray-600 bg-gray-200 px-3 py-1 rounded-md shadow-inner">
          Word count: <strong className={wordCount >= 300 ? "text-green-600" : "text-orange-500"}>{wordCount}</strong>
        </span>
      </div>
      
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onCopy={handlePreventAction}
        onPaste={handlePreventAction}
        onCut={handlePreventAction}
        spellCheck={false}
        autoComplete="off"
        className="w-full h-[400px] p-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-lg leading-relaxed text-gray-800 shadow-sm"
        placeholder="Type your essay here..."
      />
    </div>
  );
}
