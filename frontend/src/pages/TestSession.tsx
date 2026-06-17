import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TestLayout from '../layouts/TestLayout';
import SpeakingWorkspace from '../components/SpeakingWorkspace';
import WritingWorkspace from '../components/WritingWorkspace';

// 1. Định nghĩa cấu trúc dữ liệu hứng từ Backend
interface Question {
  index: number;
  skill: 'speaking' | 'writing';
  title: string;
  directions: string;
  content: string;
  prep_time: number;
  resp_time: number;
  media_url: string | null;
}

interface TestData {
  id: string;
  title: string;
  content: {
    duration: number;
    questions: Question[];
  };
}

export default function TestSession() {
  // Tạm giữ cái ID này của cậu, nhưng hãy đảm bảo cậu đã insert data cho ID này trong Supabase nhé!
  const { testId } = useParams<{ testId: string }>(); 

  // 2. Khai báo States quản lý luồng
  const [testData, setTestData] = useState<TestData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  if (!testId) {
    return <div className="p-10 text-center text-red-500 font-bold mt-20 text-xl">Lỗi: Không tìm thấy ID bài thi trên URL!</div>;
  }
  // 3. Fetch dữ liệu bài test khi vừa vào trang
  useEffect(() => {
    const fetchTest = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
        window.location.href = '/login'; // Đổi thành route login của cậu
        return;
      }
      try {
        const response = await fetch(`http://localhost:8000/api/tests/${testId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.status === 401) {
            localStorage.removeItem('access_token'); // Xóa token rác
            alert("Token đã hết hạn! Vui lòng đăng nhập lại.");
            window.location.href = '/login';
            return;
        }
        if (!response.ok) throw new Error("Lỗi lấy đề thi");
        const json = await response.json();
        setTestData(json.data);
      } catch (error) {
        console.error(error);
        alert("Không thể tải đề thi! Hãy check lại API Backend.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTest();
  }, [testId]);

  // 4. Xử lý UI lúc đang tải hoặc lỗi
  if (isLoading) return <div className="p-10 text-center font-bold text-gray-500 mt-20 text-xl">Đang nạp dữ liệu đề thi...</div>;
  if (!testData || !testData.content.questions) return <div className="p-10 text-center text-red-500 mt-20 text-xl font-bold">Dữ liệu đề thi bị lỗi hoặc không tồn tại!</div>;

  // 5. Logic tính toán vị trí câu hỏi
  const questions = testData.content.questions;
  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleNext = () => {
    if (!isLastQuestion) setCurrentIndex(prev => prev + 1);
    else {
        alert("🎉 Đã hoàn thành bài thi! Chuyển hướng về Dashboard...");
        window.location.href = '/'; // Đá về trang chủ
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  // 6. Giao diện chính thức
  return (
    <TestLayout 
      onNext={handleNext} 
      onBack={handleBack} 
      isFirst={currentIndex === 0} 
      isLast={isLastQuestion}
      timeLimit={currentQuestion.resp_time} 
      onTimeUp={!isLastQuestion ? handleNext : () => alert('Đã hết giờ toàn bộ bài thi!')}
    >
      <div className="flex flex-col items-center justify-start h-full pt-4 w-full pb-20">
        
        {/* KHUNG HIỂN THỊ ĐỀ BÀI (Render động theo currentQuestion) */}
        <div className="w-full max-w-3xl bg-blue-50 border-l-4 border-blue-600 p-6 rounded mb-2 shadow-sm transition-all">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {currentQuestion.title}
          </h2>
          <p className="text-gray-700 text-base mb-4 font-medium italic">
            {currentQuestion.directions}
          </p>
          
          <div className="w-full flex justify-center bg-white p-6 rounded border border-gray-200 text-lg font-medium text-gray-800">
             {currentQuestion.media_url ? (
               <img src={currentQuestion.media_url} alt="Question media" className="rounded max-h-64 object-cover" />
             ) : (
               <p className="leading-relaxed whitespace-pre-wrap">{currentQuestion.content}</p>
             )}
          </div>
        </div>
        
        {/* WORKSPACE AREA: Tự động đổi form dựa vào thuộc tính "skill" */}
        {currentQuestion.skill === 'speaking' ? (
          <SpeakingWorkspace 
            key={`speak-${currentQuestion.index}`} // key bắt buộc để ép React reset component
            question={currentQuestion.content}
            testId={testId}
            questionIndex={currentQuestion.index} 
          />
        ) : (
          <WritingWorkspace
            key={`write-${currentQuestion.index}`}
            question={currentQuestion.content}
            testId={testId}
            questionIndex={currentQuestion.index} 
          />
        )}

      </div>
    </TestLayout>
  );
}