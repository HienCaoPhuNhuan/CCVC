# CCVC · THPT Phú Nhuận

Bản chiếu Hội nghị CCVC, xem trực tiếp bằng `index.html`. Dùng cuộn hoặc các phím mũi tên, Page Up/Down, Home/End. Bản tự chạy có lời đọc riêng cho 35 slide, dùng giọng Ngọc Huyền; không lấy lời đọc cũ của CMHS.

- Thư mục làm việc: `C:\Users\rongl\OneDrive\2026 - 2027\Cô Tâm\CCVC\website`. Hai file Word nguồn và folder ảnh kiểm duyệt ở thư mục CCVC phía trên, không bị ghi đè.
- Nguồn nội dung: `../BÁO CÁO NH 25-26-PHƯƠNG HƯỚNG-26-27-rut gon.docx`.
- `photo-map.json` ghi nguồn ảnh theo slide. Chỉ các ảnh được dùng mới được đưa vào repo.
- Nguồn ảnh đã chuyển sang 35 folder trong `../Anh-kiem-duyet-CCVC`. `review-media.json` chứa ảnh theo đúng số slide. Folder trống nghĩa là slide không dùng ảnh. Ảnh gốc không bị sửa; các bản tối ưu nằm trong `assets/media`.
- `build.ps1` trích nội dung Word và ghép ảnh đã kiểm duyệt trong `review-media.json`. `-OldSlides` chỉ là nguồn dự phòng nếu chưa có danh sách ảnh kiểm duyệt. `data.js` được tạo sẵn nên không cần Word hoặc Node để trình chiếu.
- Dòng ghi chú đặt ảnh/bố cục không đưa lên slide; mục khen thưởng Tháng Thanh niên trùng nguyên văn chỉ hiện một lần.

## Các điểm cần xác nhận với người phụ trách báo cáo

- Đã chốt theo xác nhận ngày 23/11/2026: 1.619 học sinh Xuất sắc/Giỏi, gồm 371 Xuất sắc và 1.248 Giỏi; không hiện ghi chú sai lệch 1.691 trên slide.
- Slide 6–8 có bảng và biểu đồ tổng hợp. Phạm vi 2.387 học sinh và mốc cao nhất/thấp nhất 28,00/15,1 điểm được bổ sung từ bản đầy đủ, mục II.5.1. Bản đầy đủ còn có số liệu chi tiết từng khối và danh hiệu (371 Xuất sắc, 1.248 Giỏi). Chưa vẽ biểu đồ rèn luyện theo khối vì khối 11 ghi 834/835 học sinh mức Tốt, nhưng tỷ lệ in là 99,65%.
- Tổng quy mô nhân sự năm mới theo bản rút gọn là 138, chỉ tiêu Lao động tiên tiến là 141/141. Cần xác nhận phạm vi thống kê.
- Tiếng Anh với giáo viên nước ngoài: bản rút gọn ghi khối 10, bản đầy đủ ghi khối 10 và 11 theo điều kiện đăng ký. Slide lấy theo bản rút gọn.
- Chỉ tiêu Công đoàn năm 2026–2027: Hoàn thành xuất sắc nhiệm vụ theo xác nhận ngày 23/11/2026. Kết quả 2025–2026 vẫn giữ Hoàn thành tốt nhiệm vụ.

## Chế độ chuẩn bị clip 10 phút

Mở `tu-chay-10-phut.html` (chuyển tới `index.html?autoplay=1`) để tự chạy cùng lời đọc. Nếu trình duyệt chặn tự phát âm thanh, bấm “Bật tiếng và bắt đầu”; trang không tự chuyển trong lúc chờ cấp quyền. `index.html` không có tham số dùng để kiểm tra thủ công, không phát tiếng.

35 lời đọc dài tổng cộng 486,95 giây; lịch trình chiếu đúng 600 giây (10 phút), chia theo độ dài voice và lượng ảnh. Mỗi trang giữ ít nhất hết lời đọc và 0,5 giây đệm; ảnh bắt đầu sau 4 giây, thời gian còn lại chia đều cho số ảnh của trang (ít nhất 1,8 giây/ảnh). Hai trang nền mở đầu và kết thúc không chạy lớp ảnh. Phần thời gian dư được chia theo độ dài lời đọc, làm tròn theo phần dư lớn nhất để giữ tổng chính xác 600 giây. Build sẽ báo lỗi nếu voice và số ảnh tối thiểu không thể nằm trong 10 phút. Không tăng tốc lời đọc. Đồng hồ dùng vị trí phát audio, nên chờ tải âm thanh không cắt mất lời. Khi ẩn tab, âm thanh và thời gian xem ảnh cùng tạm dừng. Chuyển trang thủ công sẽ dừng voice cũ và phát đúng voice của trang mới.

`timeline.json` có mốc, thời lượng từng trang, số ảnh và số giây mỗi ảnh, được tạo lại bởi `build.ps1`. Đây là bản web đã ghép lời, chưa xuất MP4 mới. Thời gian chờ quyền phát âm thanh, tải dữ liệu hoặc tạm dừng tab không tính vào 10 phút trình chiếu.

## Cập nhật ảnh và lời đọc

1. Thay ảnh trong `../Anh-kiem-duyet-CCVC`, giữ đủ 35 folder. Chạy `scripts/import-review-media.py` bằng Python. Thư viện ảnh và FFmpeg đã được sao chép vào `.local-tools/media-tools` của website, không còn phụ thuộc thư mục công cụ của bản CMHS; không đưa các thư viện này vào Git.
2. Sửa lời đọc trong `voice/scripts.json` nếu cần. Chạy `scripts/generate-voice.py` bằng Python TTS local tại `C:\Users\rongl\Documents\Codex\2026-10-05\kie\work\vieneu-venv\Scripts\python.exe`. Có thể dùng `--slides 12 21` để chỉ tạo lại các trang đó. WAV nằm trong `voice/rendered`, không đưa vào Git; MP3 tối ưu và manifest được đưa vào repo riêng tư.
3. Chạy `build.ps1` để ghép ảnh, voice và tính lại lịch. Script giữ các xác nhận của người dùng, không sửa file Word gốc.

Ngày 27/11/2026: sửa “đồng bào” ở slide 12; chủ đề slide 21 có ba dòng chữ lớn; slide 31 có hai bảng Học tập/Rèn luyện song song; các nội dung liệt kê được tách dòng và đánh dấu đầu dòng.

Ảnh ở các trang nội dung được mở trên nền toàn màn hình sau 4 giây, giữ trọn ảnh bằng `object-fit: contain`, không cắt mép. Kích thước hiển thị không vượt ảnh gốc, chiều cao không vượt màn hình, chiều rộng tự cân theo tỷ lệ ảnh. Quy tắc này áp dụng cho cả bản tự chạy có voice và bản xem thủ công. Khi chuyển slide, ảnh toàn màn hình được đóng ngay. Trang mở đầu và trang kết giữ ảnh nền, không mở thêm lớp ảnh.

Chủ đề slide 21 nhấn sáng nhẹ liên tục trong lúc hiện trên màn hình, tạm ngừng hiệu ứng khi chuyển khỏi trang. Slide 35 thêm tiêu đề năm học phía trên, giữ ba dòng chủ đề canh giữa. Voice kết dùng câu “Xin trân trọng cảm ơn quý đại biểu cùng toàn thể hội đồng sư phạm đã chú ý lắng nghe”.

Chỉnh tiếp ngày 27/11: sửa đầu câu và bỏ các nhãn thừa ở slide 4, 5, 27, 33, 34; bỏ số thứ tự dư ở slide 30. Trang chủ đề hiện là slide 21, giữ slide 19 là Danh hiệu tập thể sư phạm theo xác nhận. Slide 35 trình bày ba dòng chủ đề canh giữa, có hiệu ứng phóng to. Chỉ tạo lại voice 3, 9, 35; voice kết dẫn kết thúc và cảm ơn, không đọc lại chủ đề.

Website CMHS và các bản MP4 cũ không thay đổi.

Ngày 27/11/2026: đồng bộ lại toàn bộ 35 folder ảnh (118 lượt ảnh); bỏ chỉ tiêu kỳ thi KHKT TP ở slide 32 và tạo lại riêng voice 32. Bản chiếu ưu tiên phần chữ, thu nhỏ thumbnail trước khi ảnh mở toàn màn hình. Chữ nội dung 48–62 px ở Full HD, 64–83 px ở QHD tùy độ dài nội dung; bảng biểu và chú thích cũng tăng cỡ. Slide cuối tăng ba dòng chủ đề lên khoảng 134 px/179 px. Giữ các cụm từ trên cùng dòng và chuyển về khoảng cách tự nhiên ở những đoạn căn đều gây giãn từ quá mức.

## Quy ước trình bày

- Dùng một màu nhấn đỏ trầm cho số liệu, giải thưởng và chỉ tiêu trên nền sáng; ngày tháng, số thứ tự và phần mô tả không tô rời rạc. Nền tối dùng màu vàng để giữ tương phản.
- Slide 6 chỉ hiện Tốt/Khá; slide 7 hiện Tốt/Khá/Chưa đạt. Giữ nguyên tỷ lệ gốc trên thang 0–100%, không tính lại phần trăm sau khi ẩn hàng.
- Slide 8 ghi đơn vị bài cho các bài thi điểm 10; slide 11 viết đầy đủ đơn vị huy chương. Slide 31 có cột nội dung bên trái, chỉ tiêu bên phải.
