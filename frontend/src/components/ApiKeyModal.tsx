import { useState, useEffect } from "react";

export default function ApiKeyModel() {
    const [isOpen, setIsOpen] = useState(false)
    const [apiKey, setApiKey] = useState('')

    //Kiem tra key khi load web
    useEffect(() => {
        const savedKey = localStorage.getItem('gemini_api_key');
        if (!savedKey) {
            setIsOpen(true);
        }
    }, []);

    const handleSave = () => {
        if (apiKey.trim().length < 20) {
            alert("Key không đúng định dang. Vui lòng kiểm tra lại!");
            return;
        }
        localStorage.setItem('gemini_api_key', apiKey.trim())
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 max-w-md w-full border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Cấu hình AI 🤖</h2>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Milish hoạt động theo mô hình BYOK (Bring Your Own Key) để miễn phí hoàn toàn. 
            Vui lòng nhập <span className="font-semibold text-blue-600">Google Gemini API Key</span> của bạn để tiếp tục. 
            Key chỉ được lưu trên trình duyệt máy bạn.
            </p>
            
            <input
            type="password"
            placeholder="AIzaSyB..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full border border-gray-300 rounded p-3 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
            
            <div className="flex justify-end gap-3">
            <button 
                onClick={() => window.open('https://aistudio.google.com/app/apikey', '_blank')}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
                Lấy Key miễn phí ↗
            </button>
            <button 
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded shadow hover:bg-blue-700 transition-colors"
            >
                Lưu & Bắt đầu
            </button>
            </div>
        </div>
        </div>
    );
}