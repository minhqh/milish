import { useState } from 'react';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // States cho Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  // States cho luồng xử lý
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // State quản lý OTP
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  // 1. Hàm Xử lý Đăng Ký / Đăng Nhập
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      if (activeTab === 'register') {
        if (password !== confirmPassword) throw new Error('Mật khẩu nhập lại không khớp!');
        
        // CẬP NHẬT: Thay đổi URL trỏ tới BE mới
        const res = await fetch('http://localhost:8000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, full_name: fullName })
        });
        
        if (!res.ok) {
           const errData = await res.json();
           throw new Error(errData.detail || 'Lỗi đăng ký');
        }
        
        setIsOtpSent(true);
        
      } else {
        // CẬP NHẬT: Thay đổi URL trỏ tới BE mới
        const res = await fetch('http://localhost:8000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        
        if (!res.ok) {
           const errData = await res.json();
           throw new Error(errData.detail || 'Sai email hoặc mật khẩu!');
        }
        
        const data = await res.json();
        
        // CẬP NHẬT: Lưu user_id thay vì session_id
        localStorage.setItem('user_id', data.user_id);
        localStorage.setItem('access_token', data.access_token);
        
        alert('Đăng nhập thành công!');
        window.location.href = '/'; // Hoặc đường dẫn Dashboard của cậu
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Hàm Xác thực OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      if (!res.ok) {
         const errData = await res.json();
         throw new Error(errData.detail || 'Mã OTP không hợp lệ!');
      }

      const data = await res.json();
      
      // CẬP NHẬT: Lưu user_id thay vì session_id
      localStorage.setItem('user_id', data.user_id);
      localStorage.setItem('access_token', data.access_token);
      
      alert('Xác thực thành công! Chào mừng tới Milish.');
      window.location.href = '/';
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Giao diện nhập OTP (Thay thế form chính nếu đã gửi OTP)
  if (isOtpSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <form onSubmit={handleVerifyOTP} className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center space-y-5">
          <h2 className="text-2xl font-black text-gray-800">Xác thực Email</h2>
          <p className="text-gray-500 text-sm">Chúng tớ đã gửi mã OTP gồm 6 chữ số tới <strong className="text-gray-800">{email}</strong>.</p>
          
          {errorMsg && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium">{errorMsg}</div>}
          
          <input 
            type="text" 
            maxLength={8}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full text-center tracking-[0.5em] text-2xl px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="000000"
            required
          />
          
          <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400">
            {isLoading ? 'Đang kiểm tra...' : 'Xác thực OTP'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        
        {/* Header Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'login' 
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setActiveTab('register'); setErrorMsg(''); }}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'register' 
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}
          >
            Sign Up
          </button>
        </div>

        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-gray-800 mb-2">milish.</h2>
            <p className="text-gray-500 text-sm">
              {activeTab === 'login' ? 'Welcome back! Ready to ace that test?' : 'Join us and track your TOEIC progress.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Hiển thị lỗi nếu có */}
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-center font-medium">
                {errorMsg}
              </div>
            )}

            {activeTab === 'register' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all bg-gray-50 focus:bg-white"
                  placeholder="John Doe"
                  required={activeTab === 'register'}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all bg-gray-50 focus:bg-white"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all bg-gray-50 focus:bg-white"
                placeholder="••••••••"
                required
              />
            </div>

            {activeTab === 'register' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all bg-gray-50 focus:bg-white"
                  placeholder="••••••••"
                  required={activeTab === 'register'}
                />
              </div>
            )}

            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-lg hover:bg-blue-700 transition-colors shadow-md mt-4"
            >
              {activeTab === 'login' ? 'Sign In to Workspace' : 'Create Account'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}