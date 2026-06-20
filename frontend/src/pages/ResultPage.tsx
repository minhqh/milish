import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

// --- INTERFACES ---
interface ResultDetail {
  detail_id: string;
  question_index: number;
  skill: 'speaking' | 'writing';
  part_type: string;
  question_content: string;
  question_media: string | null;
  user_answer_text: string | null;
  user_audio_url: string | null;
  ai_feedback: any | null; // Tạm để any, chặng 3 mình sẽ định nghĩa
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

    // --- FETCH DỮ LIỆU ---
  useEffect(() => {
    const fetchResult = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return navigate('/login');

      try {
        const response = await fetch(`http://localhost:8000/api/tests/results/${historyId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.status === 401) {
          localStorage.removeItem('access_token');
          return navigate('/login');
        }

        if (!response.ok) throw new Error("Lỗi tải kết quả bài thi");
        
        const json = await response.json();
        setTestResult(json.data);
      } catch (error) {
        console.error(error);
        alert("Không thể tải kết quả. Vui lòng thử lại!");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResult();
  }, [historyId, navigate]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-xl font-bold text-blue-600">Đang tải kết quả bài làm...</div>;
  }

  if (!testResult) {
    return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold text-xl">Không tìm thấy dữ liệu bài thi!</div>;
  }

  // Format ngày tháng cho đẹp
  const submitDate = new Date(testResult.created_at).toLocaleString('vi-VN', {
    hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* --- HEADER KẾT QUẢ --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-800 mb-2">{testResult.test_name}</h1>
            <div className="flex gap-4 text-sm font-medium text-gray-500">
              <span className="flex items-center gap-1">📅 Ngày nộp: {submitDate}</span>
              <span className="flex items-center gap-1">🏷️ Session: {testResult.session_id}</span>
            </div>
          </div>
          <Link 
            to="/" 
            className="px-6 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors"
          >
            Về trang chủ
          </Link>
        </div>

        {/* --- DANH SÁCH BÀI LÀM TỪNG CÂU --- */}
        <div className="space-y-8">
          {testResult.results.map((item, index) => (
            <div key={item.detail_id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              
              {/* Tiêu đề câu hỏi */}
              <div className="bg-blue-50 border-b border-gray-200 p-4 px-6 flex justify-between items-center">
                <h3 className="font-bold text-blue-800 text-lg capitalize">
                  Part: {item.part_type.replace('_', ' ')} (Câu {index + 1})
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${item.skill === 'speaking' ? 'bg-red-500' : 'bg-green-500'}`}>
                  {item.skill.toUpperCase()}
                </span>
              </div>

              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Cột trái: Đề bài */}
                <div className="flex flex-col gap-4">
                  <h4 className="font-bold text-gray-700 border-b pb-2">Đề bài</h4>
                  {item.question_media && (
                    <img src={item.question_media} alt="Question" className="rounded-lg border border-gray-200 max-h-48 object-cover self-start" />
                  )}
                  <p className="text-gray-700 whitespace-pre-wrap">{item.question_content}</p>
                </div>

                {/* Cột phải: Bài làm của User */}
                <div className="flex flex-col gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h4 className="font-bold text-gray-700 border-b border-gray-200 pb-2">Bài làm của bạn</h4>
                  
                  {item.skill === 'speaking' ? (
                    item.user_audio_url ? (
                      <div className="mt-2">
                        <audio src={item.user_audio_url} controls className="w-full" />
                      </div>
                    ) : (
                      <p className="text-gray-400 italic">Không có dữ liệu ghi âm.</p>
                    )
                  ) : (
                    <p className="text-gray-800 whitespace-pre-wrap font-medium">
                      {item.user_answer_text || <span className="text-gray-400 italic">Bỏ trống</span>}
                    </p>
                  )}
                </div>

              </div>

              {/* DÀNH CHO CHẶNG 3: VÙNG AI FEEDBACK */}
              <div className="bg-indigo-50 border-t border-indigo-100 p-6 flex flex-col items-center justify-center gap-4">
                {item.ai_feedback ? (
                  <div className="w-full text-left">
                    {/* Chỗ này chặng 3 mình sẽ bung UI chấm điểm ra */}
                    <pre className="text-xs text-gray-600">{JSON.stringify(item.ai_feedback, null, 2)}</pre>
                  </div>
                ) : (
                  <>
                    <p className="text-indigo-600 font-medium">AI chưa chấm điểm câu hỏi này.</p>
                    <button className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 transition-colors flex items-center gap-2">
                      ✨ Chấm điểm bằng Gemini AI
                    </button>
                  </>
                )}
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}