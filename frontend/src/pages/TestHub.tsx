import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// --- MOCK DATA (Dùng tạm trong lúc chờ Database) ---
const mockCollections = [
  {
    id: 'col_toeic_sw_2026',
    title: 'TOEIC Speaking & Writing 2026',
    tags: ['New Format', 'Target 200+'],
    description: 'Bộ đề bám sát cấu trúc thi mới nhất, tập trung luyện phản xạ trả lời nhanh và kỹ năng viết luận.',
    tests: [
      { id: 'bdb75c46-da1f-470a-aaf2-a5027aee4be9', name: 'Test 01: Warmup & Basic Responses', duration: '60 mins' },
      { id: 'mock_test_02', name: 'Test 02: Advanced Opinion Essays', duration: '60 mins' },
    ]
  },
  {
    id: 'col_ielts_cam_18',
    title: 'Intensive Speaking Practice',
    tags: ['Daily', 'Fluency'],
    description: 'Ngân hàng câu hỏi theo chủ đề (Mistake Bank & Topic-based) để luyện nói mỗi ngày.',
    tests: [
      { id: 'mock_test_03', name: 'Topic: Technology & AI', duration: '30 mins' },
      { id: 'mock_test_04', name: 'Topic: Work & Education', duration: '30 mins' },
    ]
  }
];

export default function TestHub() {
  const navigate = useNavigate();
  const [expandedCol, setExpandedCol] = useState<string | null>(mockCollections[0].id);

  const toggleCollection = (id: string) => {
    setExpandedCol(expandedCol === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black text-blue-600 mb-4">milish.</h1>
          <p className="text-gray-600 text-lg">Chọn bộ đề để bắt đầu quá trình luyện tập của bạn</p>
        </div>

        {/* Danh sách Bộ Đề */}
        <div className="space-y-6">
          {mockCollections.map((col) => (
            <div 
              key={col.id} 
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md"
            >
              {/* Vùng Header của Card Bộ Đề */}
              <div 
                className="p-6 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                onClick={() => toggleCollection(col.id)}
              >
                <div>
                  <div className="flex gap-2 mb-2">
                    {col.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">{col.title}</h2>
                  <p className="text-gray-500 text-sm mt-1">{col.description}</p>
                </div>
                
                <button className="text-blue-500 font-semibold text-sm bg-blue-50 px-4 py-2 rounded-lg shrink-0">
                  {expandedCol === col.id ? 'Ẩn danh sách' : 'Xem đề thi'}
                </button>
              </div>

              {/* Danh sách Đề thi xổ xuống */}
              {expandedCol === col.id && (
                <div className="bg-gray-50 p-6 border-t border-gray-100">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {col.tests.map((test, index) => (
                      <div 
                        key={test.id}
                        className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between group hover:border-blue-400 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                              {test.name}
                            </h3>
                            <p className="text-xs text-gray-400">Thời gian: {test.duration}</p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Ngăn click nhầm vào toggle accordion
                            navigate(`/test/${test.id}`);
                          }}
                          className="px-4 py-2 bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-600 text-sm font-bold rounded-lg transition-colors"
                        >
                          Start
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}