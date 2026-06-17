import { useState, useEffect } from "react";

interface MistakeBankData {
    id: string;
    test_id: string;
    total_score: number;
    created_at: string;
    detailed_results: {
        question_index: number;
        user_audio_url: string | null;
        user_answer_text: string | null;
        ai_feedback: {
            total_score: number;
            grammar_mistakes: { original: string; corrected: string }[];
            suggested_vocab: string[];
        };
    }[];
}

export default function MistakeBank() {
    const [history, setHistory] = useState<MistakeBankData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            // Lấy Token từ LocalStorage thay vì sessionId
            const token = localStorage.getItem('access_token'); 
            
            try {
                // Đổi URL thành root endpoint, Backend sẽ tự dịch Token ra user_id
                const response = await fetch(`http://localhost:8000/api/mistake-bank`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}` // Bơm JWT vào Header
                    }
                });
                if (!response.ok) throw new Error("Failed to fetch data");
                const json = await response.json();
                setHistory(json.data);
            } catch (error) {
                console.error("Lỗi kéo dữ liệu:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (isLoading) return <div className="text-center mt-10 animate-pulse text-gray-500">Đang tải ngân hàng lỗi...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <h2 className="text-3xl font-black text-gray-800 mb-6 flex items-center gap-3">
        📚 Mistake Bank Dashboard
      </h2>
      
      <div className="flex flex-col gap-4">
        {history.length === 0 ? (
          <div className="text-center text-gray-500 bg-gray-50 p-10 rounded-2xl border border-gray-200">
            Cậu chưa làm bài test nào. Hãy bắt đầu luyện tập nhé!
          </div>
        ) : (
          history.map((record) => (
            <div key={record.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all">
              {/* Header của từng bài test */}
              <div 
                className="p-5 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
              >
                <div>
                  <h3 className="font-bold text-lg text-gray-800">Test ID: {record.test_id.substring(0,8)}...</h3>
                  <p className="text-sm text-gray-500">Ngày làm bài: {new Date(record.created_at).toLocaleString('vi-VN')}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-lg">
                    Score: {record.total_score}
                  </span>
                  <span className="text-gray-400">{expandedId === record.id ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Chi tiết lỗi (Chỉ hiện khi Click mở ra) */}
              {expandedId === record.id && (
                <div className="p-5 bg-gray-50 border-t border-gray-100 flex flex-col gap-6">
                  {record.detailed_results.map((detail, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-gray-700">Câu hỏi #{detail.question_index}</h4>
                                        {/* Hiển thị Audio nếu là bài Speaking */}
                        {detail.user_audio_url && (
                            <audio src={detail.user_audio_url} controls className="h-10 w-full md:w-72" />
                        )}
                        </div>

                        {/* Hiển thị Text nếu là bài Writing */}
                        {detail.user_answer_text && (
                        <div className="mb-6 p-4 bg-blue-50/50 rounded-lg border-l-4 border-blue-400 text-gray-700 italic leading-relaxed text-sm md:text-base shadow-inner">
                            "{detail.user_answer_text}"
                        </div>
                        )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Cột Ngữ Pháp */}
                        <div>
                          <h5 className="font-semibold text-red-600 mb-2">Lỗi Ngữ pháp / Phát âm</h5>
                          <ul className="space-y-2">
                            {detail.ai_feedback?.grammar_mistakes?.map((mistake, mIdx) => (
                              <li key={mIdx} className="text-sm">
                                <span className="line-through text-red-400 mr-2">{mistake.original}</span>
                                <span className="text-green-600 font-medium">➔ {mistake.corrected}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        {/* Cột Từ Vựng */}
                        <div>
                          <h5 className="font-semibold text-blue-600 mb-2">Từ vựng gợi ý</h5>
                          <div className="flex flex-wrap gap-2">
                            {detail.ai_feedback?.suggested_vocab?.map((vocab, vIdx) => (
                              <span key={vIdx} className="bg-blue-50 text-blue-600 border border-blue-200 px-2 py-1 rounded text-xs font-medium">
                                {vocab}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}