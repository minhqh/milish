import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';

// ... (Giữ nguyên các interface ResultDetail và TestResult như cũ) ...
interface ResultDetail {
  detail_id: string;
  question_index: number;
  skill: 'speaking' | 'writing';
  part_type: string;
  question_content: string;
  question_media: string | null;
  user_answer_text: string | null;
  user_audio_url: string | null;
  ai_feedback: any | null; 
}

interface TestResult {
  history_id: string;
  test_name: string;
  session_id: string;
  created_at: string;
  results: ResultDetail[];
}

export default function ResultPage() {
  const { historyId } = useParams<{ historyId: string }>();
  const navigate = useNavigate();

  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // States quản lý tiến trình chấm bài
  const [gradingQueue, setGradingQueue] = useState<Set<string>>(new Set());
  const [isGradingAll, setIsGradingAll] = useState(false);

  // Lấy API Key từ LocalStorage
  const apiKey = localStorage.getItem('gemini_api_key');

  useEffect(() => {
    // ... (Hàm fetchResult giữ nguyên y hệt chặng 2) ...
    const fetchResult = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return navigate('/login');
      try {
        const response = await fetch(`${API_BASE_URL}/api/tests/results/${historyId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.status === 401) return navigate('/login');
        if (!response.ok) throw new Error("Lỗi tải kết quả");
        const json = await response.json();
        setTestResult(json.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchResult();
  }, [historyId, navigate]);

  // --- HÀM CHẤM 1 CÂU ---
  const handleGradeSingle = async (detailId: string) => {
    if (!apiKey) {
      alert("Vui lòng nhập Gemini API Key để sử dụng tính năng chấm điểm!");
      return;
    }
    const token = localStorage.getItem('access_token');
    
    // Đưa vào hàng đợi để hiện trạng thái "Đang chấm..."
    setGradingQueue(prev => new Set(prev).add(detailId));

    try {
      const response = await fetch(`${API_BASE_URL}/api/tests/results/${detailId}/grade`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ api_key: apiKey })
      });

      if (!response.ok) throw new Error("Lỗi chấm bài");
      const json = await response.json();

      // Cập nhật ngay kết quả vào State để giao diện hiển thị không cần F5
      setTestResult(prev => {
        if (!prev) return prev;
        const newResults = prev.results.map(item => 
          item.detail_id === detailId ? { ...item, ai_feedback: json.data } : item
        );
        return { ...prev, results: newResults };
      });
      
    } catch (error) {
      console.error(error);
      alert("Có lỗi khi chấm câu hỏi này!");
    } finally {
      // Xóa khỏi hàng đợi
      setGradingQueue(prev => {
        const newSet = new Set(prev);
        newSet.delete(detailId);
        return newSet;
      });
    }
  };

  // --- HÀM CHẤM TOÀN BỘ CÁC CÂU CHƯA CÓ ĐIỂM ---
  const handleGradeAll = async () => {
    if (!testResult) return;
    
    const unGradedItems = testResult.results.filter(item => !item.ai_feedback);
    if (unGradedItems.length === 0) {
      alert("Tất cả các câu đều đã được chấm điểm!");
      return;
    }

    setIsGradingAll(true);

    // Chạy vòng lặp gọi API tuần tự (tránh gọi 1 lúc chục request làm Gemini API sập rate limit)
    for (const item of unGradedItems) {
      await handleGradeSingle(item.detail_id);
    }

    setIsGradingAll(false);
    alert("🎉 Đã chấm xong toàn bộ bài làm!");
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-xl font-bold text-blue-600">Đang tải kết quả bài làm...</div>;
  if (!testResult) return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold text-xl">Không tìm thấy dữ liệu bài thi!</div>;

  const submitDate = new Date(testResult.created_at).toLocaleString('vi-VN', {
    hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
  });

  const unGradedCount = testResult.results.filter(item => !item.ai_feedback).length;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-800 mb-2">{testResult.test_name}</h1>
            <div className="flex gap-4 text-sm font-medium text-gray-500">
              <span>📅 {submitDate}</span>
              <span>🏷️ {testResult.session_id}</span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Link to="/" className="px-6 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors">
              Trở về Hub
            </Link>
            
            {/* NÚT CHẤM TOÀN BỘ */}
            <button 
              onClick={handleGradeAll}
              disabled={isGradingAll || unGradedCount === 0}
              className={`px-6 py-2.5 font-bold rounded-lg text-white shadow-md transition-all flex items-center gap-2
                ${unGradedCount === 0 ? 'bg-green-500 cursor-default' : 'bg-blue-600 hover:bg-blue-700'}
                ${isGradingAll ? 'opacity-75 cursor-wait' : ''}
              `}
            >
              {isGradingAll ? '⏳ Đang chấm toàn bộ...' : unGradedCount === 0 ? '✨ Đã chấm xong tất cả' : `🤖 Chấm toàn bộ (${unGradedCount} câu)`}
            </button>
          </div>
        </div>

        {/* LIST CÂU HỎI */}
        <div className="space-y-8">
          {testResult.results.map((item, index) => {
            const isGradingThis = gradingQueue.has(item.detail_id);
            const feedback = item.ai_feedback;

            return (
            <div key={item.detail_id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-blue-50 border-b border-gray-200 p-4 px-6 flex justify-between items-center">
                <h3 className="font-bold text-blue-800 text-lg capitalize">Part: {item.part_type.replace('_', ' ')} (Câu {index + 1})</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${item.skill === 'speaking' ? 'bg-red-500' : 'bg-green-500'}`}>
                  {item.skill.toUpperCase()}
                </span>
              </div>

              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="flex flex-col gap-4">
                  <h4 className="font-bold text-gray-700 border-b pb-2">Đề bài</h4>
                  {item.question_media && <img src={item.question_media} alt="Question" className="rounded-lg border border-gray-200 max-h-48 object-cover self-start" />}
                  <p className="text-gray-700 whitespace-pre-wrap">{item.question_content}</p>
                </div>

                <div className="flex flex-col gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h4 className="font-bold text-gray-700 border-b border-gray-200 pb-2">Bài làm của bạn</h4>
                  {item.skill === 'speaking' ? (
                    item.user_audio_url ? <audio src={item.user_audio_url} controls className="w-full mt-2" /> : <p className="text-gray-400 italic">Trống</p>
                  ) : (
                    <p className="text-gray-800 whitespace-pre-wrap font-medium">{item.user_answer_text || <span className="text-gray-400 italic">Bỏ trống</span>}</p>
                  )}
                </div>
              </div>

              {/* VÙNG FEEDBACK CHÍNH THỨC */}
              <div className="bg-indigo-50/50 border-t border-indigo-100 p-6">
                {!feedback ? (
                  <div className="flex justify-center">
                    <button 
                      onClick={() => handleGradeSingle(item.detail_id)}
                      disabled={isGradingThis || isGradingAll}
                      className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors flex items-center gap-2"
                    >
                      {isGradingThis ? '🤖 Đang phân tích...' : '✨ Yêu cầu AI chấm câu này'}
                    </button>
                  </div>
                ) : (
                  <div className="animate-fade-in-up">
                    <div className="flex items-center gap-4 mb-4 border-b border-indigo-100 pb-4">
                      <div className="bg-white border-2 border-indigo-200 text-indigo-700 text-2xl font-black px-4 py-1.5 rounded-lg">
                        {feedback.total_score} / 5
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-800">Đánh giá từ AI</h4>
                        {feedback.note && <p className="text-orange-500 text-sm">{feedback.note}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-bold text-red-600 mb-2">Lỗi & Sửa lỗi</h5>
                        {feedback.grammar_mistakes?.length > 0 ? (
                          <ul className="space-y-2">
                            {feedback.grammar_mistakes.map((m: any, i: number) => (
                              <li key={i} className="bg-white p-2 rounded border border-red-100 text-sm shadow-sm">
                                <div className="line-through text-red-400">{m.original}</div>
                                <div className="text-green-700 font-medium">{m.corrected}</div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500 italic">Không phát hiện lỗi đáng kể.</p>
                        )}
                      </div>

                      <div>
                        <h5 className="font-bold text-blue-600 mb-2">Từ vựng đề xuất</h5>
                        <div className="flex flex-wrap gap-2">
                          {feedback.suggested_vocab?.map((v: string, i: number) => (
                            <span key={i} className="bg-white text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                              {v}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}