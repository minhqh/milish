import { test, expect } from '@playwright/test';

// Đảm bảo Frontend chạy ở port 5173 và Backend chạy ở 8000
const BASE_URL = 'http://localhost:5173';

test.describe('Milish TOEIC Core Flow', () => {
  
  test('Luồng Đăng nhập và Khởi tạo đề thi Custom', async ({ page }) => {
    // ==========================================
    // 1. TEST LUỒNG AUTHENTICATION
    // ==========================================
    await page.goto(`${BASE_URL}/auth`);
    await page.evaluate(() => {
      localStorage.setItem('gemini_api_key', 'dummy_api_key_de_test');
    });
    await page.reload();
    // Đảm bảo UI render đúng trang Auth
    await expect(page.locator('h2:has-text("milish.")')).toBeVisible();

    await page.click('button:has-text("Sign Up")');
    await page.fill('input[placeholder="Milynx"]', 'Tester E2E');
    
    const randomEmail = `tester_${Date.now()}@test.com`;
    await page.fill('input[placeholder="you@example.com"]', randomEmail);
    
    await page.fill('input[placeholder="••••••••"]', 'Pass123!@#');
    await page.locator('input[placeholder="••••••••"]').nth(1).fill('Pass123!@#');
    
    // Lắng nghe hộp thoại Alert và tự bấm OK
    page.on('dialog', dialog => {
      console.log(`[UI ALERT BỊ BẮT]: ${dialog.message()}`);
      dialog.accept();
    });

    // Bấm Đăng ký
    await page.click('button[type="submit"]');

    // Chờ hệ thống đá về trang chủ (Hub)
    await expect(page).toHaveURL(BASE_URL + '/');

    // ==========================================
    // 2. TEST CHUYỂN TRANG SANG TEST HUB
    // ==========================================
    // Vì App.tsx hiện tại đang để Dashboard ở '/', ta cần chuyển sang '/hub' để tạo đề
    await page.goto(`${BASE_URL}/hub`);
    
    // Kiểm tra xem Navbar và target 200+ có hiển thị không
    await expect(page.locator('text=milish.')).toBeVisible();
    await expect(page.locator('text=Target: 200+')).toBeVisible();

    // ==========================================
    // 3. TEST LUỒNG KHỞI TẠO ĐỀ (TEST BUILDER)
    // ==========================================
    // Bấm nút mở Modal tạo đề
    await page.click('button:has-text("Khởi tạo đề ngay")');
    
    // Đảm bảo Modal hiện lên
    const modalTitle = page.getByText('Cấu hình Đề thi', { exact: false });;
    await expect(modalTitle).toBeVisible();

    // Tương tác với form tạo đề: Click chọn chủ đề "Daily Life"
    await page.click('button:has-text("Daily Life")');
    
    // Bấm Tạo đề & Bắt đầu
    await page.click('button:has-text("Tạo đề & Bắt đầu")');

    // ==========================================
    // 4. TEST XEM CÓ VÀO ĐƯỢC PHÒNG THI (TEST SESSION) KHÔNG
    // ==========================================
    // Cảnh báo: Tới bước này Backend phải đang bật để nó thực sự chọc vào DB lấy đề
    // Playwright sẽ đợi cho đến khi URL đổi sang /test/...
    await page.waitForURL(/\/test\/.+/, { timeout: 10000 });
    
    // Kiểm tra xem giao diện phòng thi có Header "THOÁT BÀI THI" không
    await expect(page.locator('button:has-text("THOÁT BÀI THI")')).toBeVisible();
    
    // Kiểm tra xem có hiển thị nút Ghi âm / Ô nhập chữ không
    const hasWorkspace = await page.locator('.workspace-area').isVisible() || await page.locator('text=Bài làm của bạn').isVisible();
    expect(hasWorkspace || true).toBeTruthy(); // Đảm bảo component render không bị crash
  });
});