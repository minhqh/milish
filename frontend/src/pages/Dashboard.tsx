import { useNavigate } from 'react-router-dom';
import MistakeBank from '../components/MistakeBank';

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('access_token');
    window.location.href = '/auth'; // Reset toàn bộ state
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Navbar đơn giản */}
      <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-black text-blue-600">milish.</h1>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/test')}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-md"
          >
            Start Practice Test
          </button>
          <button 
            onClick={handleLogout}
            className="text-gray-500 hover:text-gray-800 font-medium px-4"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Gọi Component Lịch sử lỗi vào đây */}
      <MistakeBank />
    </div>
  );
}