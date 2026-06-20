import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import thêm useNavigate
import TestLayout from '../layouts/TestLayout';
import SpeakingWorkspace from '../components/SpeakingWorkspace';
import WritingWorkspace from '../components/WritingWorkspace';

interface Question {
  question_id: string;
  skill: 'speaking' | 'writing';
  part_type: string;
  order_idx: number;
  text?: string;
  image_url?: string;
  prep_time: number;
  resp_time: number;
}

interface TestData {
  id: string;
  name: string;
  duration: string;
  questions: Question[];
}

// Interface định dạng câu trả lời lưu trong State của FE
interface UserAnswer {
  question_id: string;
  order_idx: number;
  skill: 'speaking' | 'writing';
  answer_text?: string;   // Chữ của bài viết
  audio_base64?: string;  // Chuỗi âm thanh dạng Base64
}

export default function TestSession() {
  const { testId } = useParams<{ testId: string }>(); 
  const navigate = useNavigate();

  const [testData, setTestData] = useState<TestData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // 🛒 GIỎ HÀNG: Quản lý toàn bộ câu trả lời của user dưới dạng Key-Value (Key là question_id)
  const [answers, setAnswers] = useState<Record<string, UserAnswer>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTest = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return navigate('/login');
      try {
        const response = await fetch(`http://localhost:8000/api/tests/${testId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.status === 401) {
            localStorage.removeItem('access_token');
            return navigate('/login');
        }
        if (!response.ok) throw new Error("Lỗi lấy đề thi");
        const json = await response.json();
        setTestData(json.data);
      } catch (error) {
        console.error(error);
        alert("Không thể tải đề thi!");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTest();
  }, [testId, navigate]);

  if (isLoading) return <div className="p-10 text-center font-bold text-gray-500 mt-20 text-xl">Đang nạp dữ liệu đề thi...</div>;
  if (!testData || !testData.questions || testData.questions.length === 0) {
    return <div className="p-10 text-center text-red-500 mt-20 text-xl font-bold">Dữ liệu đề thi bị lỗi!</div>;
  }

  const questions = testData.questions;
  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  // 🔄 HÀM CẬP NHẬT GIỎ HÀNG: Được gọi từ các Component Con (Workspace)
  const updateAnswer = (questionId: string, data: Partial<UserAnswer>) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        question_id: questionId,
        order_idx: currentQuestion.order_idx,
        skill: currentQuestion.skill,
        ...data
      }
    }));
  };

  // 🚀 HÀM GỌI API NỘP BÀI TỔNG HỢP
  const handleSubmitTest = async () => {
    setIsSubmitting(true);
    const token = localStorage.getItem('access_token');

    // Chuyển Object Giỏ hàng thành một mảng phẳng gửi lên Backend theo đúng Schema
    const answersList = Object.values(answers);

    try {
      const response = await fetch('http://localhost:8000/api/tests/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          test_id: testId,
          answers: answersList
        })
      });

      const json = await response.json();
      if (!response.ok) throw new Error(json.detail || "Lỗi khi nộp bài");

      alert("🎉 Nộp bài thành công rực rỡ!");
      // Sau này làm trang kết quả xong, ta sẽ navigate sang `/result/${json.data.history_id}`
      navigate('/'); 

    } catch (error: any) {
      alert(`❌ Thất bại: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (!isLastQuestion) setCurrentIndex(prev => prev + 1);
    else handleSubmitTest(); // Đang ở câu cuối mà bấm tiếp tục -> Kích hoạt luồng nộp bài
  };

  const handleBack = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  if (isSubmitting) return <div className="p-10 text-center font-bold text-blue-600 mt-20 text-xl animate-pulse">Đang nộp bài thi và tải tệp âm thanh lên hệ thống... Vui lòng đợi trong giây lát!</div>;

  return (
    <TestLayout 
      testName={testData.name}
      onNext={handleNext} 
      onBack={handleBack} 
      isFirst={currentIndex === 0} 
      isLast={isLastQuestion}
      timeLimit={currentQuestion.resp_time} 
      onTimeUp={handleNext}
    >
      <div className="flex flex-col items-center justify-start h-full pt-4 w-full pb-20">
        
        {/* KHUNG HIỂN THỊ ĐỀ BÀI */}
        <div className="w-full max-w-3xl bg-blue-50 border-l-4 border-blue-600 p-6 rounded mb-2 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-2 capitalize">
            Part: {currentQuestion.part_type.replace('_', ' ')} (Câu {currentIndex + 1}/{questions.length})
          </h2>
          <div className="w-full flex justify-center bg-white p-6 rounded border border-gray-200 text-lg font-medium text-gray-800 mt-4">
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
            key={`speak-${currentQuestion.question_id}`}
            testId={testId!}
            questionId={currentQuestion.question_id}
            // Truyền giá trị đã làm trước đó (nếu user back lại câu cũ)
            savedAudio={answers[currentQuestion.question_id]?.audio_base64}
            // Hàm callback để con đẩy data lên cha
            onSaveAnswer={(base64Str) => updateAnswer(currentQuestion.question_id, { audio_base64: base64Str })}
          />
        ) : (
          <WritingWorkspace
            key={`write-${currentQuestion.question_id}`}
            testId={testId!}
            questionId={currentQuestion.question_id}
            // Truyền giá trị đã gõ trước đó
            savedText={answers[currentQuestion.question_id]?.answer_text || ''}
            // Hàm callback để con đẩy chữ lên cha
            onSaveAnswer={(textStr) => updateAnswer(currentQuestion.question_id, { answer_text: textStr })}
          />
        )}

      </div>
    </TestLayout>
  );
}