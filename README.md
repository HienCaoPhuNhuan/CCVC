# CCVC · THPT Phú Nhuận

Bản chiếu Hội nghị CCVC, xem trực tiếp bằng `index.html`. Dùng cuộn hoặc các phím mũi tên, Page Up/Down, Home/End. Ảnh cùng chủ đề tự chuyển; không dùng voice hay nội dung từ bộ CMHS cũ.

- Nguồn nội dung: `BÁO CÁO NH 25-26-PHƯƠNG HƯỚNG-26-27-rut gon.docx` trong thư mục CCVC.
- `photo-map.json` ghi nguồn ảnh theo slide. Chỉ các ảnh được dùng mới được đưa vào repo.
- `build.ps1` trích nội dung Word và ghép ảnh từ bộ thử nghiệm cũ. Truyền `-Source` và `-OldSlides` để dùng đường dẫn khác. `data.js` được tạo sẵn nên không cần Word hoặc Node để trình chiếu.
- Dòng ghi chú đặt ảnh/bố cục không đưa lên slide; mục khen thưởng Tháng Thanh niên trùng nguyên văn chỉ hiện một lần.

## Các điểm cần xác nhận với người phụ trách báo cáo

- Đã chốt theo xác nhận ngày 23/11/2026: 1.619 học sinh Xuất sắc/Giỏi, gồm 371 Xuất sắc và 1.248 Giỏi; không hiện ghi chú sai lệch 1.691 trên slide.
- Slide 6–8 có bảng và biểu đồ tổng hợp. Phạm vi 2.387 học sinh và mốc cao nhất/thấp nhất 28,00/15,1 điểm được bổ sung từ bản đầy đủ, mục II.5.1. Bản đầy đủ còn có số liệu chi tiết từng khối và danh hiệu (371 Xuất sắc, 1.248 Giỏi). Chưa vẽ biểu đồ rèn luyện theo khối vì khối 11 ghi 834/835 học sinh mức Tốt, nhưng tỷ lệ in là 99,65%.
- Tổng quy mô nhân sự năm mới theo bản rút gọn là 138, chỉ tiêu Lao động tiên tiến là 141/141. Cần xác nhận phạm vi thống kê.
- Tiếng Anh với giáo viên nước ngoài: bản rút gọn ghi khối 10, bản đầy đủ ghi khối 10 và 11 theo điều kiện đăng ký. Slide lấy theo bản rút gọn.
- Chỉ tiêu Công đoàn năm 2026–2027: Hoàn thành xuất sắc nhiệm vụ theo xác nhận ngày 23/11/2026. Kết quả 2025–2026 vẫn giữ Hoàn thành tốt nhiệm vụ.

## Chế độ chuẩn bị clip 10 phút

Mở `tu-chay-10-phut.html` (chuyển tới `index.html?autoplay=1`) để tự chạy 35 slide trong 600 giây. Có thể tiếp tục dùng `index.html` để trình chiếu thủ công. Mở đầu 5 giây, trang kết 8 giây; các trang còn lại được chia theo lượng chữ và số ảnh. `timeline.json` có mốc và thời lượng từng trang, được tạo lại bởi `build.ps1`. Chuyển trang nằm trong lịch 600 giây, không cộng dồn thời gian chuyển cảnh. Khi ẩn cửa sổ/tab, đồng hồ tạm dừng; dùng phím điều hướng sẽ tiếp tục lịch từ trang vừa chọn. Đây là lịch hình, chưa có voice mới hoặc MP4 10 phút.

Website CMHS và các bản MP4 cũ không thay đổi.
