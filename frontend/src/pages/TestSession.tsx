import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TestLayout from '../layouts/TestLayout';
import SpeakingWorkspace from '../components/SpeakingWorkspace';
import WritingWorkspace from '../components/WritingWorkspace';

// 1. Cấu trúc dữ liệu mới phẳng và khớp chuẩn với Backend
interface Question {
  question_id: string;
  skill: 'speaking' | 'writing';
  part_type: string;
  order_idx: number;
  text?: string;       
  image_url?: string; 
  prep_time: number;
  resp_time: number;
  keywords?: string[];
}

interface TestData {
  id: string;
  name: string;       
  duration: string;
  is_static: boolean;
  questions: Question[]; 
}

export default function TestSession() {
  const { testId } = useParams<{ testId: string }>(); 

  // States quản lý luồng
  const [testData, setTestData] = useState<TestData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  if (!testId) {
    return <div className="p-10 text-center text-red-500 font-bold mt-20 text-xl">Lỗi: Không tìm thấy ID bài thi trên URL!</div>;
  }

  // Fetch dữ liệu bài test khi vừa vào trang
  useEffect(() => {
    const fetchTest = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
        window.location.href = '/login';
        return;
      }
      try {
        const response = await fetch(`http://localhost:8000/api/tests/${testId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.status === 401) {
            localStorage.removeItem('access_token');
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

  // Xử lý UI lúc đang tải hoặc lỗi
  if (isLoading) return <div className="p-10 text-center font-bold text-gray-500 mt-20 text-xl">Đang nạp dữ liệu đề thi...</div>;
  
  if (!testData || !testData.questions || testData.questions.length === 0) {
    return <div className="p-10 text-center text-red-500 mt-20 text-xl font-bold">Dữ liệu đề thi bị lỗi hoặc không tồn tại!</div>;
  }

  // Logic tính toán vị trí câu hỏi theo cấu trúc mới
  const questions = testData.questions;
  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleNext = () => {
    if (!isLastQuestion) setCurrentIndex(prev => prev + 1);
    else {
        alert("🎉 Đã hoàn thành bài thi! Chuyển hướng về Dashboard...");
        window.location.href = '/';
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  return (
    <TestLayout 
      testName={testData.name} 
      onNext={handleNext} 
      onBack={handleBack} 
      isFirst={currentIndex === 0} 
      isLast={isLastQuestion}
      timeLimit={currentQuestion.resp_time} 
      onTimeUp={!isLastQuestion ? handleNext : () => alert('Đã hết giờ toàn bộ bài thi!')}
    >
      <div className="flex flex-col items-center justify-start h-full pt-4 w-full pb-20">
        
        {/* KHUNG HIỂN THỊ ĐỀ BÀI */}
        <div className="w-full max-w-3xl bg-blue-50 border-l-4 border-blue-600 p-6 rounded mb-2 shadow-sm transition-all">
          <h2 className="text-xl font-bold text-gray-800 mb-2 capitalize">
            Part: {currentQuestion.part_type.replace('_', ' ')}
          </h2>
          <p className="text-gray-700 text-base mb-4 font-medium italic">
            Hãy trả lời câu hỏi dựa trên yêu cầu của phần thi.
          </p>
          
          <div className="w-full flex justify-center bg-white p-6 rounded border border-gray-200 text-lg font-medium text-gray-800">
             {/* Đổi từ media_url sang image_url và content sang text */}
             {currentQuestion.image_url ? (
               <img src={currentQuestion.image_url} alt="Question media" className="rounded max-h-64 object-cover" />
             ) : (
               <p className="leading-relaxed whitespace-pre-wrap">{currentQuestion.text}</p>
             )}
          </div>
        </div>
        
        {/* WORKSPACE AREA */}
        {currentQuestion.skill === 'speaking' ? (
          <SpeakingWorkspace 
            key={`speak-${currentQuestion.order_idx}`} 
            question={currentQuestion.text || ''}
            testId={testId}
            questionIndex={currentQuestion.order_idx} 
          />
        ) : (
          <WritingWorkspace
            key={`write-${currentQuestion.order_idx}`} 
            question={currentQuestion.text || ''}
            testId={testId}
            questionIndex={currentQuestion.order_idx} 
          />
        )}

      </div>
    </TestLayout>
  );
}