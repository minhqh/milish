import { useState, useRef, useEffect } from 'react';

interface SpeakingWorkspaceProps {
  testId: string;
  questionId: string;
  savedAudio?: string; // Dữ liệu base64 lấy từ giỏ hàng (nếu user quay lại câu cũ)
  onSaveAnswer: (base64Str: string) => void;
}

export default function SpeakingWorkspace({
  savedAudio,
  onSaveAnswer
}: SpeakingWorkspaceProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  // Nếu user back lại câu cũ, load lại file ghi âm từ Base64 lên thẻ <audio> để nghe
  useEffect(() => {
    if (savedAudio && !audioUrl) {
      setAudioUrl(savedAudio);
    }
  }, [savedAudio, audioUrl]);

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
        
        // 1. Tạo URL cục bộ để user nghe lại ngay lập tức
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // 2. Ép Blob thành chuỗi Base64 và nhét vào "Giỏ hàng" của Component Cha
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64String = reader.result as string;
          onSaveAnswer(base64String); 
        };

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setAudioUrl(null); 
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

  return (
    <div className="w-full flex flex-col gap-6 mt-8 max-w-3xl mx-auto items-center">
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

        {audioUrl && !isRecording && (
          <div className="w-full mt-4 bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col gap-3 items-center">
            <span className="text-sm font-medium text-gray-600">Review your answer:</span>
            {/* Đọc trực tiếp Base64 hoặc ObjectURL cực mượt */}
            <audio src={audioUrl} controls className="w-full max-w-md" />
          </div>
        )}

      </div>
    </div>
  );
}