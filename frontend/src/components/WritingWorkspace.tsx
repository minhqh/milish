import type { ClipboardEvent } from "react";

interface WritingWorkspaceProps {
  testId: string;
  questionId: string;
  savedText: string;
  onSaveAnswer: (text: string) => void;
}

export default function WritingWorkspace({ 
  savedText, 
  onSaveAnswer
}: WritingWorkspaceProps) {
    
    // Chặn gian lận (copy/paste)
    const handlePreventAction = (e: ClipboardEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
    };

    // Logic đếm từ (Lấy trực tiếp từ savedText cha truyền xuống)
    const currentText = savedText || '';
    const wordCount = currentText.trim() === '' ? 0 : currentText.trim().split(/\s+/).length;

    return (
    <div className="w-full flex flex-col gap-4 mt-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-end">
        <h3 className="font-semibold text-gray-700 text-lg">Your Response:</h3>
        <span className="text-sm font-medium text-gray-600 bg-gray-200 px-3 py-1 rounded-md shadow-inner">
          Word count: <strong className={wordCount >= 300 ? "text-green-600" : "text-orange-500"}>{wordCount}</strong>
        </span>
      </div>
      
      <textarea
        value={currentText}
        onChange={(e) => onSaveAnswer(e.target.value)}
        onCopy={handlePreventAction}
        onPaste={handlePreventAction}
        onCut={handlePreventAction}
        spellCheck={false}
        className="w-full h-[300px] p-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-lg leading-relaxed text-gray-800 shadow-sm"
        placeholder="Type your essay here..."
      />
    </div>
  );
}