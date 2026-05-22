# i18n Strings — `ExportPanel.jsx`

Bao gồm cả chuỗi **tiếng Việt hardcode**, **tiếng Anh hardcode** cần i18n, và các key đã dùng `t()`.

---

## 1. Alert / Toast (JS logic — tiếng Việt hardcode)

| Key gợi ý | Nội dung gốc (vi) | Dòng |
|---|---|---|
| `exportPanel.alert.zipSuccess` | `Đã tải gói frame ảnh PNG (Sprites ZIP) thành công!` | 74 |
| `exportPanel.alert.zipError` | `Lỗi xuất ZIP: {{message}}` | 77 |
| `exportPanel.alert.noCanvas` | `Không tìm thấy live Canvas để ghi hình!` | 87 |

---

## 2. Record Video — Status strings (tiếng Việt hardcode)

| Key gợi ý | Nội dung gốc (vi) | Dòng |
|---|---|---|
| `exportPanel.record.statusInit` | `Khởi tạo Stream Canvas...` | 93 |
| `exportPanel.record.statusCompressing` | `Đang nén video WebM...` | 113 |
| `exportPanel.record.statusRecording` | `Đang ghi hình canvas...` | 128 |

---

## 3. Import JSON — qua `t()` (đã dùng i18n key, cần định nghĩa locale)

| Key `t()` hiện có | Nội dung gợi ý (vi) | Dòng |
|---|---|---|
| `exportPanel.importSuccess` | `Nhập project thành công!` | 155 |
| `exportPanel.importError` | `Không thể nhập project: {{error}}` | 157 |

---

## 4. Card Tags (qua `t()` — đã dùng i18n key)

| Key `t()` hiện có | Nội dung gợi ý (vi/en) | Dòng |
|---|---|---|
| `exportPanel.tags.projectRestore` | `PROJECT / RESTORE` | 176 |
| `exportPanel.tags.pngPack` | `PNG PACK` | 193 |
| `exportPanel.tags.video` | `VIDEO` | 201 |

---

## 5. Card 1 — JSON Backup/Restore (qua `t()`)

| Key `t()` hiện có | Nội dung gợi ý (vi) | Dòng |
|---|---|---|
| `exportPanel.card1Title` | `Lưu & Phục Hồi Dự Án (JSON)` | 179 |
| `exportPanel.card1Desc` | `Xuất toàn bộ cài đặt, màu sắc và tùy chỉnh của dự án ra file JSON để sao lưu hoặc chia sẻ.` | 180 |
| `exportPanel.exportJson` | `Xuất JSON` | 185 |
| `exportPanel.importJson` | `Nhập JSON` | 189 |

---

## 6. Card 2 — PNG ZIP Export (qua `t()`)

| Key `t()` hiện có | Nội dung gợi ý (vi) | Dòng |
|---|---|---|
| `exportPanel.card2Title` | `Xuất Sprites PNG (ZIP)` | 196 |
| `exportPanel.card2Desc` | `Tải xuống từng frame hoạt ảnh dưới dạng ảnh PNG trong một file ZIP.` | 197 |
| `exportPanel.downloadZip` | `Tải Gói ZIP` | 199 |

---

## 7. Card 3 — Canvas Video Recorder (qua `t()` + hardcode)

| Key `t()` / Key gợi ý | Nội dung gốc | Dòng |
|---|---|---|
| `exportPanel.card3Title` | `Ghi Hình Canvas (WebM Video)` | 204 |
| `exportPanel.card3Desc` | `Ghi lại màn hình canvas chạy hoạt ảnh trực tiếp thành file video WebM chất lượng cao.` | 205 |
| `exportPanel.record.durationLabel` | `Thời lượng (Duration):` *(tiếng Việt hardcode)* | 210 |
| `exportPanel.record.duration5s` | `5 Giây (Nhẹ nhàng)` *(tiếng Việt hardcode)* | 215 |
| `exportPanel.record.duration10s` | `10 Giây (Khuyên dùng)` *(tiếng Việt hardcode)* | 216 |
| `exportPanel.record.duration20s` | `20 Giây (Chất lượng cao)` *(tiếng Việt hardcode)* | 217 |
| `exportPanel.record.btnRecord` | `Record WebM Video` *(tiếng Anh hardcode)* | 222 |

---

## 8. FFmpeg Guide Card (tiếng Việt + Anh hardcode — khối hướng dẫn kỹ thuật)

> Khối này chứa nội dung hướng dẫn dài. Nên i18n nếu app hỗ trợ nhiều ngôn ngữ.

| Key gợi ý | Nội dung gốc | Dòng |
|---|---|---|
| `exportPanel.ffmpeg.title` | `💡 Looping MP4 Conversion Pipeline for Aida64 / Wallpaper Engine` *(Anh hardcode)* | 234 |
| `exportPanel.ffmpeg.intro` | `Do giới hạn bản quyền của trình duyệt không cho phép kết xuất trực tiếp tệp tin MP4 H.264 phần cứng, canvas recorder sẽ xuất ra file WebM Lossless siêu nét. Bạn có hai cách để nén thành MP4 vòng lặp hoàn hảo cho màn hình phụ case PC:` | 235 |
| `exportPanel.ffmpeg.method1Badge` | `Cách 1` *(tiếng Việt hardcode)* | 238 |
| `exportPanel.ffmpeg.method1Title` | `Sử dụng Batch Script đi kèm:` *(tiếng Việt hardcode)* | 240 |
| `exportPanel.ffmpeg.method1Body` | `Di chuyển tệp tin nyan_cat_custom_1920x462.webm vừa tải xuống vào thư mục dự án này, sau đó nhấp đúp chạy file convert_mp4.bat. Nó sẽ tự động convert sang MP4 chất lượng cao ngay lập tức.` *(tiếng Việt hardcode)* | 241 |
| `exportPanel.ffmpeg.method2Badge` | `Cách 2` *(tiếng Việt hardcode)* | 246 |
| `exportPanel.ffmpeg.method2Title` | `Lệnh PowerShell / Command Prompt (Nếu máy có FFmpeg):` *(tiếng Việt hardcode)* | 248 |
| `exportPanel.ffmpeg.method2Body` | `Mở PowerShell tại thư mục tải xuống và chạy lệnh:` *(tiếng Việt hardcode)* | 249 |
