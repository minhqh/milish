import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// --- INTERFACES ---
interface TestItem {
  id: string;
  name: string;
  duration: string;
}

interface Collection {
  id: string;
  title: string;
  description: string;
  tags: string[];
  tests: TestItem[];
}

export default function TestHub() {
  const navigate = useNavigate();
  
  // --- STATES BỘ ĐỀ TĨNH ---
  const [collections, setCollections] = useState<Collection[]>([]);
  const [expandedCol, setExpandedCol] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATES CHO TÍNH NĂNG TẠO ĐỀ (TEST BUILDER) ---
  const [showBuilder, setShowBuilder] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [builderForm, setBuilderForm] = useState({
    skills: ['speaking'] as string[], // Mặc định chọn Speaking
    topics: [] as string[],
    count: 5
  });

  const AVAILABLE_TOPICS = ['Daily Life', 'Workplace', 'Technology', 'Travel'];

  // --- FETCH DỮ LIỆU BỘ ĐỀ TĨNH ---
  useEffect(() => {
    const fetchCollections = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return navigate('/login');

      try {
        const response = await fetch('http://localhost:8000/api/tests/collections/all', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.status === 401) {
          localStorage.removeItem('access_token');
          return navigate('/login');
        }

        if (!response.ok) throw new Error("Lỗi tải thư viện đề");
        
        const json = await response.json();
        setCollections(json.data);
        if (json.data && json.data.length > 0) setExpandedCol(json.data[0].id);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCollections();
  }, [navigate]);

  // --- HÀM GỌI API TẠO ĐỀ ĐỘNG ---
  const handleGenerateTest = async () => {
    if (builderForm.skills.length === 0) {
      alert("Vui lòng chọn ít nhất 1 kỹ năng (Speaking hoặc Writing)!");
      return;
    }

    setIsGenerating(true);
    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch('http://localhost:8000/api/tests/generate', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          skills: builderForm.skills,
          topics: builderForm.topics.length > 0 ? builderForm.topics : null,
          question_count: builderForm.count
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Không thể tạo đề thi lúc này");
      }

      // Tắt modal và bay thẳng vào phòng thi mới
      setShowBuilder(false);
      navigate(`/test/${data.data.test_id}`);

    } catch (error: any) {
      alert(`❌ Lỗi: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // --- HÀM XỬ LÝ CHECKBOX ---
  const toggleSkill = (skill: string) => {
    setBuilderForm(prev => ({
      ...prev,
      skills: prev.skills.includes(skill) 
        ? prev.skills.filter(s => s !== skill) 
        : [...prev.skills, skill]
    }));
  };

  const toggleTopic = (topic: string) => {
    setBuilderForm(prev => ({
      ...prev,
      topics: prev.topics.includes(topic) 
        ? prev.topics.filter(t => t !== topic) 
        : [...prev.topics, topic]
    }));
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-xl font-bold text-blue-600">Đang tải thư viện đề thi...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-5xl mx-auto">
        
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black text-blue-600 mb-4">milish.</h1>
          <p className="text-gray-600 text-lg">Chọn bộ đề hoặc tự tạo đề thi theo nhu cầu của bạn</p>
        </div>

        {/* --- CARD: TỰ TẠO ĐỀ THI (CUSTOM PRACTICE) --- */}
        <div className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg overflow-hidden text-white p-8 flex flex-col md:flex-row items-center justify-between gap-6 transform transition hover:-translate-y-1 hover:shadow-xl">
          <div>
            <div className="flex gap-2 mb-3">
              <span className="px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full">AI Powered</span>
              <span className="px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full">Custom</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Build Your Own Test</h2>
            <p className="text-blue-100 max-w-xl">Hệ thống sẽ bốc ngẫu nhiên các câu hỏi từ ngân hàng dựa trên kỹ năng và chủ đề bạn muốn luyện tập để tạo ra một đề thi độc nhất.</p>
          </div>
          <button 
            onClick={() => setShowBuilder(true)}
            className="bg-white text-blue-600 font-bold text-lg px-8 py-4 rounded-xl shadow-md hover:bg-blue-50 transition-colors shrink-0"
          >
            🚀 Tạo đề ngay
          </button>
        </div>

        {/* --- DANH SÁCH BỘ ĐỀ TĨNH --- */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">Thư viện Đề thi Chuẩn</h3>
          {collections.map((col) => (
            <div key={col.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
              <div 
                className="p-6 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                onClick={() => setExpandedCol(expandedCol === col.id ? null : col.id)}
              >
                <div>
                  <div className="flex gap-2 mb-2">
                    {col.tags && col.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">{tag}</span>
                    ))}
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">{col.title}</h2>
                  <p className="text-gray-500 text-sm mt-1">{col.description}</p>
                </div>
                <button className="text-blue-500 font-semibold text-sm bg-blue-50 px-4 py-2 rounded-lg shrink-0">
                  {expandedCol === col.id ? 'Ẩn danh sách' : 'Xem đề thi'}
                </button>
              </div>

              {expandedCol === col.id && (
                <div className="bg-gray-50 p-6 border-t border-gray-100">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {col.tests && col.tests.length > 0 ? (
                      col.tests.map((test, index) => (
                        <div key={test.id} className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between group hover:border-blue-400 hover:shadow-sm transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">{index + 1}</div>
                            <div>
                              <h3 className="font-semibold text-gray-700 group-hover:text-blue-600 transition-colors line-clamp-1">{test.name}</h3>
                              <p className="text-xs text-gray-400">Thời gian: {test.duration}</p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/test/${test.id}`); }}
                            className="px-4 py-2 bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-600 text-sm font-bold rounded-lg transition-colors shrink-0 ml-2"
                          >
                            Start
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-4 text-gray-400 italic">Bộ đề này chưa có bài thi.</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* --- MODAL TẠO ĐỀ (TEST BUILDER) --- */}
      {showBuilder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
            <div className="bg-blue-600 p-6 text-white text-center">
              <h2 className="text-2xl font-bold">Cấu hình Đề thi</h2>
              <p className="text-blue-100 text-sm mt-1">Chọn các thông số để AI lấy đề cho bạn</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Chọn Kỹ năng */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Kỹ năng muốn luyện tập *</label>
                <div className="flex gap-4">
                  <button 
                    onClick={() => toggleSkill('speaking')}
                    className={`flex-1 py-3 rounded-lg border-2 font-bold transition-all ${builderForm.skills.includes('speaking') ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                  >
                    🎤 Speaking
                  </button>
                  <button 
                    onClick={() => toggleSkill('writing')}
                    className={`flex-1 py-3 rounded-lg border-2 font-bold transition-all ${builderForm.skills.includes('writing') ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                  >
                    ✍️ Writing
                  </button>
                </div>
              </div>

              {/* Chọn Chủ đề */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Chủ đề (Để trống = Ngẫu nhiên)</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_TOPICS.map(topic => (
                    <button
                      key={topic}
                      onClick={() => toggleTopic(topic)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${builderForm.topics.includes(topic) ? 'bg-indigo-100 border-indigo-300 text-indigo-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Số lượng câu */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Số lượng câu hỏi: {builderForm.count}</label>
                <input 
                  type="range" 
                  min="1" 
                  max="20" 
                  value={builderForm.count}
                  onChange={(e) => setBuilderForm(prev => ({ ...prev, count: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
                  <span>1 câu</span>
                  <span>10 câu</span>
                  <span>20 câu</span>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setShowBuilder(false)}
                className="px-6 py-2.5 rounded-lg font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                disabled={isGenerating}
              >
                Hủy
              </button>
              <button 
                onClick={handleGenerateTest}
                disabled={isGenerating}
                className="px-6 py-2.5 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md disabled:opacity-70 disabled:cursor-wait flex items-center gap-2"
              >
                {isGenerating ? 'Đang tạo đề...' : 'Tạo đề & Bắt đầu'}
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}