import { useState, useEffect } from "react";

interface CountdownTimerProps {
    initialSeconds: number;
    onTimeUp?: () => void;
}

export default function CountdownTimer({ initialSeconds, onTimeUp }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState(initialSeconds)

    useEffect(() => {
        // Reset neu thoi gian initialSeconds thay doi (chuyen cau)
        setTimeLeft(initialSeconds);
    }, [initialSeconds]);

    useEffect(() => {
        //Neu het gio thi dung va goi onTimeUp
        if (timeLeft <= 0) {
            if (onTimeUp) onTimeUp();
            return;
        }

        //Dem nguoc moi giay
        const timerId =setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        // Cleanup function: Xóa interval khi component unmount hoặc re-render
        return () => clearInterval(timerId);
    }, [timeLeft, onTimeUp]);

    //Format giay thanh mm:ss
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    //Doi mau do khi gan het gio (<10)
    const isWarning = timeLeft <= 10 && timeLeft > 0;

    return (
        <div
          className={`px-6 py-1 rounded-md font-bold text-xl tracking-widest shadow-inner transition-colors duration-300 border
            ${isWarning 
            ? 'bg-red-100 text-red-600 border-red-300 animate-pulse' 
            : 'bg-blue-50 text-blue-700 border-blue-200'
            }
        `}
        >
            {formatTime(timeLeft)}
        </div>
    );
}