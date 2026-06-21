import { useNavigate } from "react-router-dom";

export default function Navbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_id');
        navigate('/login');
    };

    return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* LOGO */}
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xl">
              m
            </div>
            <span className="font-black text-2xl text-gray-800 tracking-tight">milish.</span>
          </div>

          {/* USER MENU */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">
              <span className="text-xl">🎯</span>
              <span className="text-sm font-bold text-blue-800">Target: 200+ S&W</span>
            </div>
            
            <div className="h-8 w-px bg-gray-200 mx-1"></div>
            
            <button 
              onClick={handleLogout}
              className="text-sm font-bold text-gray-500 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
            >
              Đăng xuất
            </button>
          </div>
          
        </div>
      </div>
    </nav>
  );
}