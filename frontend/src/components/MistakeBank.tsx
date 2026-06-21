import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

// Định nghĩa kiểu dữ liệu phẳng để dễ render
interface GrammarCard {
  original: string;
  corrected: string;
  testName: string;
}

interface VocabCard {
  word: string;
  testName: string;
}

export default function MistakeBank() {
  const [grammarList, setGrammarList] = useState<GrammarCard[]>([]);
  const [vocabList, setVocabList] = useState<VocabCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'grammar' | 'vocab'>('grammar');

  useEffect(() => {
    const fetchMistakes = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      try {
        const response = await fetch(`${API_BASE_URL}/api/mistakes`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error("Lỗi tải dữ liệu");
        const json = await response.json();
        
        // Bóc tách dữ liệu AI Feedback thành 2 mảng phẳng
        const newGrammar: GrammarCard[] = [];
        const newVocab: VocabCard[] = [];

        json.data.forEach((history: any) => {
          history.detailed_results.forEach((detail: any) => {
            const feedback = detail.ai_feedback;
            if (feedback) {
              if (feedback.grammar_mistakes) {
                feedback.grammar_mistakes.forEach((m: any) => {
                  newGrammar.push({ ...m, testName: history.test_name });
                });
              }
              if (feedback.suggested_vocab) {
                feedback.suggested_vocab.forEach((v: string) => {
                  newVocab.push({ word: v, testName: history.test_name });
                });
              }
            }
          });
        });

        setGrammarList(newGrammar);
        setVocabList(newVocab);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMistakes();
  }, []);

  if (isLoading) return <div className="p-10 text-center text-blue-600 font-bold">Đang lục tìm sổ tay lỗi sai...</div>;

  return (
    <div className="max-w-5xl mx-auto mt-8 px-4">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-gray-800 mb-2">Sổ tay cá nhân 📓</h2>
        <p className="text-gray-500">Toàn bộ từ vựng và lỗi sai đã được AI phân tích từ các bài thi của bạn.</p>
      </div>

      {/* TABS */}
      <div className="flex gap-4 mb-6 border-b border-gray-200 pb-2">
        <button 
          onClick={() => setActiveTab('grammar')}
          className={`pb-2 px-4 font-bold text-lg transition-all border-b-4 ${activeTab === 'grammar' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          Lỗi Ngữ Pháp & Phát Âm ({grammarList.length})
        </button>
        <button 
          onClick={() => setActiveTab('vocab')}
          className={`pb-2 px-4 font-bold text-lg transition-all border-b-4 ${activeTab === 'vocab' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          Kho Từ Vựng Gợi Ý ({vocabList.length})
        </button>
      </div>

      {/* NỘI DUNG TABS */}
      {activeTab === 'grammar' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {grammarList.length === 0 ? <p className="text-gray-400 italic">Chưa có lỗi sai nào được ghi nhận.</p> : null}
          {grammarList.map((item, idx) => (
            <div key={idx} className="bg-white p-5 rounded-xl border border-red-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-400 group-hover:bg-red-500 transition-colors"></div>
              <div className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">{item.testName}</div>
              <div className="line-through text-red-400 mb-2">{item.original}</div>
              <div className="text-green-600 font-bold text-lg">👉 {item.corrected}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'vocab' && (
        <div className="flex flex-wrap gap-3">
          {vocabList.length === 0 ? <p className="text-gray-400 italic">Chưa có từ vựng nào được gợi ý.</p> : null}
          {vocabList.map((item, idx) => (
            <div key={idx} className="bg-white px-5 py-3 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-all flex flex-col items-start cursor-help title" title={`Gợi ý từ: ${item.testName}`}>
              <span className="text-blue-700 font-bold text-lg">{item.word}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}