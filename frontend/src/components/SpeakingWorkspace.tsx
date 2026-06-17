import { useState, useRef } from 'react';

// Định nghĩa Interface dữ liệu
interface GrammarMistake {
  original: string;
  corrected: string;
}

interface GradingResult {
  total_score: number;
  grammar_mistakes: GrammarMistake[];
  suggested_vocab: string[];
}

interface SpeakingWorkspaceProps {
  question: string;
  testId: string;
  questionIndex: number;
}

export default function SpeakingWorkspace({
  question, 
  testId, 
  questionIndex
}: SpeakingWorkspaceProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GradingResult | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setAudioUrl(null);
      setResult(null); // Reset kết quả cũ nếu thu âm lại
    } catch (error) {
      console.error(error);
      alert("Không thể truy cập Micro. Vui lòng kiểm tra quyền trên trình duyệt!");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = async () => {
    if (!audioBlob) return;

    const apiKey = localStorage.getItem('gemini_api_key');
    const token = localStorage.getItem('access_token');
    if (!apiKey) {
      alert("Bạn chưa nhập API Key! Vui lòng tải lại trang để nhập.");
      return;
    }
    if (!token) {
      alert("Lỗi xác thực: Vui lòng đăng nhập lại!");
      return;
    }

    setIsLoading(true);
    try {
      // Vì gửi file nên phải dùng FormData thay vì JSON
      const formData = new FormData();
      formData.append('api_key', apiKey);
      formData.append('question', question);

      formData.append('test_id', testId);
      formData.append('question_index', questionIndex.toString());
      // Trình duyệt tự sinh Blob, ta cần gán tên file để Backend nhận diện dạng UploadFile
      formData.append('file', audioBlob, 'speaking_record.webm');

      // Fetch API tự động cấu hình Content-Type là multipart/form-data khi nhận FormData
      const response = await fetch('http://localhost:8000/api/speaking/grade', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}` // Bơm JWT vào
            // Lưu ý: Tuyệt đối KHÔNG set 'Content-Type' cho FormData, trình duyệt sẽ tự gán boundary
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Lỗi từ server: " + response.statusText);
      }

      const data = await response.json();
      setResult(data.feedback);
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra khi chấm bài. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 mt-8 max-w-3xl mx-auto items-center">
      
      {/* Vùng ghi âm */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full shadow-sm flex flex-col items-center gap-6">
        <div className={`h-24 flex items-center justify-center ${isRecording ? 'animate-pulse' : ''}`}>
          {isRecording ? (
            <div className="flex items-center gap-2">
              <span className="w-3 h-12 bg-red-500 rounded-full animate-bounce"></span>
              <span className="w-3 h-16 bg-red-500 rounded-full animate-bounce delay-75"></span>
              <span className="w-3 h-10 bg-red-500 rounded-full animate-bounce delay-150"></span>
              <span className="text-red-500 font-bold ml-4 animate-pulse">Recording...</span>
            </div>
          ) : (
            <div className="text-gray-400 font-medium">Microphone is ready</div>
          )}
        </div>

        <div className="flex gap-4">
          {!isRecording ? (
            <button 
              onClick={startRecording}
              disabled={isLoading}
              className="px-8 py-3 bg-red-50 text-red-600 border border-red-200 font-bold rounded-full hover:bg-red-100 disabled:opacity-50 transition flex items-center gap-2"
            >
              🔴 Start Recording
            </button>
          ) : (
            <button 
              onClick={stopRecording}
              className="px-8 py-3 bg-red-600 text-white font-bold rounded-full shadow-md hover:bg-red-700 transition flex items-center gap-2"
            >
              ⏹ Stop
            </button>
          )}
        </div>

        {audioUrl && !isRecording && (
          <div className="w-full mt-4 bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col gap-3 items-center">
            <span className="text-sm font-medium text-gray-600">Review your answer:</span>
            <audio src={audioUrl} controls className="w-full max-w-md" />
          </div>
        )}
      </div>

      {/* Nút Nộp Bài */}
      {audioUrl && !isRecording && !result && (
         <button 
           onClick={handleSubmit}
           disabled={isLoading}
           className="px-10 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors w-full sm:w-auto"
         >
           {isLoading ? '🤖 Uploading & Grading...' : 'Submit Speaking Audio'}
         </button>
      )}

      {/* Khung kết quả AI Feedback */}
      {result && (
        <div className="mt-4 bg-white border border-gray-200 rounded-xl p-6 shadow-sm animate-fade-in w-full">
          <div className="flex items-center gap-4 mb-6 border-b pb-4">
            <div className="bg-blue-100 text-blue-700 text-3xl font-black px-4 py-2 rounded-lg">
              {result.total_score} / 5
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-800">AI Feedback</h4>
              <p className="text-gray-500 text-sm">Graded by Gemini 2.5 Flash Audio Model</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h5 className="font-bold text-red-600 mb-3 flex items-center gap-2">
                🎤 Pronunciation & Grammar Issues
              </h5>
              <ul className="space-y-3">
                {result.grammar_mistakes.map((mistake, index) => (
                  <li key={index} className="bg-red-50 p-3 rounded border border-red-100 text-sm">
                    <div className="line-through text-red-400 mb-1">{mistake.original}</div>
                    <div className="text-green-700 font-medium">{mistake.corrected}</div>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-blue-600 mb-3 flex items-center gap-2">
                💡 Suggested Expressions
              </h5>
              <div className="flex flex-wrap gap-2">
                {result.suggested_vocab.map((vocab, index) => (
                  <span key={index} className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-full text-sm font-medium">
                    {vocab}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}