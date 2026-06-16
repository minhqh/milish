import { useState } from "react";
import type { ClipboardEvent } from "react";

interface GrammarMistake {
  original: string;
  corrected: string;
}

interface GradingResult {
  total_score: number;
  grammar_mistakes: GrammarMistake[];
  suggested_vocab: string[];
}

interface WritingWorkspaceProps {
  question: string;
}

export default function WritingWorkspace({ question }: WritingWorkspaceProps) {
    const [text, setText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<GradingResult | null>(null);

    // Chặn gian lận (copy/paste)
    const handlePreventAction = (e: ClipboardEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
    };

    // Logic đếm từ
    const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;

    // Gọi API chấm bài
    const handleSubmit = async () => {
      const apiKey = localStorage.getItem('gemini_api_key');
      if (!apiKey) {
        alert("Bạn chưa nhập API Key! Vui lòng tải lại trang để nhập.");
        return;
      }

      if (wordCount < 10) {
        alert("Bài viết quá ngắn. Vui lòng viết thêm!");
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:8000/api/writing/grade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: apiKey,
            question: question,
            user_response: text
          })
        });

        if (!response.ok) {
          throw new Error("Lỗi từ server: " + response.statusText);
        }

        const data = await response.json();
        setResult(data);
      } catch (error) {
        console.error(error);
        alert("Có lỗi xảy ra khi chấm bài. Vui lòng thử lại!");
      } finally {
        setIsLoading(false);
      }
    };

    return (
    <div className="w-full flex flex-col gap-4 mt-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-end">
        <h3 className="font-semibold text-gray-700 text-lg">Your Response:</h3>
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
        disabled={isLoading || result !== null}
        className="w-full h-[300px] p-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-lg leading-relaxed text-gray-800 shadow-sm disabled:bg-gray-50"
        placeholder="Type your essay here..."
      />

      
      {!result && (
        <div className="flex justify-end mt-2">
          <button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-8 py-3 bg-blue-600 text-white font-bold rounded shadow-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center gap-2"
          >
            {isLoading ? '🤖 AI is grading...' : 'Submit Essay'}
          </button>
        </div>
      )}

      
      {result && (
        <div className="mt-8 bg-white border border-gray-200 rounded-xl p-6 shadow-sm animate-fade-in">
          <div className="flex items-center gap-4 mb-6 border-b pb-4">
            <div className="bg-blue-100 text-blue-700 text-3xl font-black px-4 py-2 rounded-lg">
              {result.total_score} / 5
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-800">AI Feedback</h4>
              <p className="text-gray-500 text-sm">Graded by Gemini 2.5 Flash</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div>
              <h5 className="font-bold text-red-600 mb-3 flex items-center gap-2">
                ✍️ Grammar Corrections
              </h5>
              <ul className="space-y-3">
                {result.grammar_mistakes.map((mistake, index) => (
                  <li key={index} className="bg-red-50 p-3 rounded border border-red-100 text-sm">
                    <div className="line-through text-red-400 mb-1">{mistake.original}</div>
                    <div className="text-green-700 font-medium">{mistake.corrected}</div>
                  </li>
                ))}
              </ul>
            </div>

            
            <div>
              <h5 className="font-bold text-blue-600 mb-3 flex items-center gap-2">
                💡 Suggested Vocabulary
              </h5>
              <div className="flex flex-wrap gap-2">
                {result.suggested_vocab.map((vocab, index) => (
                  <span key={index} className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-full text-sm font-medium">
                    {vocab}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
             <button 
                onClick={() => {setResult(null); setText('');}}
                className="text-gray-500 hover:text-gray-800 font-medium underline"
             >
                Try Again
             </button>
          </div>
        </div>
      )}
    </div>
  );
}
