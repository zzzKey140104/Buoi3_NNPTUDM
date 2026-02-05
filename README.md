# Buoi3_NNPTUDM

Nguyễn Khánh Hưng - 2280601305

## Products Dashboard (Bài tập)

Dự án này là một dashboard dùng API https://api.escuelajs.co/api/v1/products với các yêu cầu:

- Hiển thị các cột: `id`, `title`, `price`, `category`, `images` (dùng Bootstrap để style)
- `description` hiển thị khi di chuột lên hàng tương ứng (tooltip)
- Tìm kiếm theo `title` (live, thay đổi khi nhập)
- Phân trang, chọn số phần tử 5 / 10 / 20 mỗi trang
- Nút sắp xếp theo `price` và `title`
- Xuất dữ liệu ở view hiện tại ra CSV
- Modal xem chi tiết item (kèm nút Edit để gọi API PUT để cập nhật)
- Modal tạo item mới (gọi API POST)

> Lưu ý nộp bài: push các file `index.html`, `app.js` (và code liên quan) lên GitHub; chụp màn hình sau khi hoàn thiện mỗi chức năng và chèn vào một file Word (file Word không nộp lên GitHub).

## Hướng dẫn chạy

1. Cài deps: `npm install`
2. Chạy server: `npm run dev` (hoặc `npm start`)
3. Mở trình duyệt: `http://localhost:3000`

Server có proxy (`server.js`) để chuyển tiếp yêu cầu tới `https://api.escuelajs.co/api/v1/products` (tránh CORS và minh họa Node.js usage).

Chúc bạn hoàn thành bài tốt! (📸: nhớ chụp ảnh màn hình mỗi chức năng và đưa vào file Word để nộp).
