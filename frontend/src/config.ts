// Nếu không tìm thấy biến môi trường, nó sẽ tự động fallback về localhost cho an toàn
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';