import { useState, useRef } from 'react';

interface SpeakingWorkspaceProps {
  question: string;
}

export default function SpeakingWorkspace({ question }: SpeakingWorkspaceProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Ref để giữ instance của MediaRecorder mà không làm re-render component
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  // Hàm bắt đầu ghi âm
  const startRecording = async () => {
    try {
      // Xin quyền truy cập Micro
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Gom các mảnh âm thanh lại thành 1 file hoàn chỉnh
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        
        // Tắt micro để phần cứng không bị treo
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setAudioUrl(null); // Xóa file cũ nếu thu lại
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Không thể truy cập Micro. Vui lòng kiểm tra quyền trên trình duyệt!");
    }
  };

  // Hàm dừng ghi âm
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Hàm (tạm) để gọi API nộp bài sau này
  const handleSubmit = async () => {
    if (!audioBlob) return;
    setIsLoading(true);
    console.log("Chuẩn bị gửi file Audio lên Backend...", audioBlob);
    // Tạm thời fake delay, sẽ ghép API vào bài sau
    setTimeout(() => {
      alert("Chức năng nộp bài đang được xây dựng!");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="w-full flex flex-col gap-6 mt-8 max-w-3xl mx-auto items-center">
      
      {/* Khu vực trạng thái & Nút thu âm */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full shadow-sm flex flex-col items-center gap-6">
        
        {/* Hiệu ứng sóng âm khi đang thu */}
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

        {/* Cụm Nút bấm */}
        <div className="flex gap-4">
          {!isRecording ? (
            <button 
              onClick={startRecording}
              className="px-8 py-3 bg-red-50 text-red-600 border border-red-200 font-bold rounded-full hover:bg-red-100 transition flex items-center gap-2"
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

        {/* Trình phát lại âm thanh */}
        {audioUrl && !isRecording && (
          <div className="w-full mt-4 bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col gap-3 items-center">
            <span className="text-sm font-medium text-gray-600">Review your answer:</span>
            <audio src={audioUrl} controls className="w-full max-w-md" />
          </div>
        )}
      </div>

      {/* Nút Submit */}
      {audioUrl && !isRecording && (
         <button 
           onClick={handleSubmit}
           disabled={isLoading}
           className="px-10 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors w-full sm:w-auto"
         >
           {isLoading ? '🤖 Uploading & Grading...' : 'Submit Speaking Audio'}
         </button>
      )}

    </div>
  );
}