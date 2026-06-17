# milish. (TOEIC S/W CBT Simulator)

📌 Tổng quan dự án (Overview)
Milish là ứng dụng Web mô phỏng phòng thi thật TOEIC Speaking & Writing (Computer-Based Test). Dự án được thiết kế với mục tiêu tối thượng: tự động chấm điểm, phân tích lỗi sai và đề xuất từ vựng nâng cao để chinh phục cột mốc 200+ TOEIC Speaking & Writing.

Điểm đặc biệt của Milish là mô hình hoạt động BYOK (Bring Your Own Key). Người dùng tự cung cấp Google Gemini API Key, giúp chi phí vận hành hệ thống phần lõi AI luôn ở mức 0đ.

✨ Tính năng cốt lõi (Key Features)
Mô phỏng CBT Chuẩn xác: Giao diện thi đếm ngược thời gian, chặn các thao tác gian lận (Copy/Paste/Cut), tắt spellcheck, đếm từ realtime.

Chấm điểm đa phương thức (Multi-modal AI): Tích hợp Gemini 2.5 Flash xử lý trực tiếp file ghi âm Audio (.webm) và văn bản Text để đánh giá phát âm, ngữ pháp và từ vựng.

Mistake Bank (Ngân hàng lỗi): Bảng điều khiển cá nhân lưu trữ toàn bộ lịch sử thi. Hiển thị lại đoạn văn đã gõ hoặc phát lại file ghi âm, đối chiếu trực tiếp với các lỗi sai và từ vựng AI gợi ý.

Xác thực an toàn (OTP Auth): Hệ thống đăng ký/đăng nhập sử dụng Email OTP (thông qua Supabase & Resend), bảo vệ API bằng JWT (JSON Web Tokens).

🛠 Tech Stack
Frontend: React, TypeScript, Vite, Tailwind CSS v4, React Router DOM.

Backend: FastAPI (Python), PyJWT, Clean Architecture (Router/Service/Schema/Util).

Database & Storage: Supabase (PostgreSQL), Supabase Storage.

AI Engine: Google Gemini 2.5 Flash API.

DevOps: Docker Compose (Hot-reload development environment).

🚀 Kiến trúc hệ thống (Clean Architecture)
Backend được tổ chức chặt chẽ để dễ dàng mở rộng:

api/endpoints/: Các Router đóng vai trò "người gác cổng", xác thực JWT và tiếp nhận Request.

services/: Xử lý logic nghiệp vụ lõi (Tương tác Supabase DB, Storage, Gemini AI, Auth).

schemas/: Pydantic models chuẩn hóa cấu trúc dữ liệu đầu vào và đầu ra.

utils/: Các hàm hỗ trợ dùng chung (validate file, xử lý chuỗi).

Tác giả: Milynx
