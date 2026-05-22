# i18n Strings — `ModelAssembler.jsx`

Danh sách toàn bộ chuỗi tiếng Việt hiển thị trên giao diện, nhóm theo khu vực/chức năng.
Mỗi mục gồm: **key gợi ý** · **nội dung gốc** · **dòng tham chiếu**.

---

## 1. Toast / Alert / Confirm (JS logic — không render trực tiếp trong JSX)

| Key gợi ý | Nội dung gốc (vi) | Dòng |
|---|---|---|
| `toast.exportProfileSuccess` | `Đã tải xuống profile "{{name}}" thành công!` | 219 |
| `alert.importProfileSuccess` | `Nhập profile thành công!\n- Đã nạp thêm {{count}} bộ phận tự vẽ vào thư viện của bạn.` | 241 |
| `alert.importProfileError` | `Không thể nhập profile: {{error}}` | 244 |
| `alert.jsonSyntaxError` | `Lỗi cú pháp tệp JSON: {{message}}` | 247 |
| `confirm.disconnectDrive` | `Bạn muốn ngắt kết nối tài khoản Google Drive?` | 322 |
| `toast.driveDisconnected` | `Đã ngắt kết nối Google Drive.` | 325 |
| `toast.driveConnected` | `Đã kết nối thành công với Drive ({{email}})!` | 339 |
| `alert.noProfileToBackup` | `Không có profile nào để backup lên Google Drive!` | 346 |
| `toast.driveBackupSuccess` | `Đã sao lưu toàn bộ profiles lên Google Drive thành công!` | 371 |
| `alert.noCloudFileSelected` | `Vui lòng chọn 1 tệp sao lưu trên đám mây!` | 388 |
| `alert.cloudRestoreSuccess` | `Nạp tệp "{{filename}}" từ Google Drive thành công!\nProfile mới "{{profileName}}" đã được tải về local.` | 439–441 |
| `toast.syncSuccess` | `Đã đồng bộ tọa độ & linh kiện lắp ráp thành công sang Mô hình Động!` | 574 |
| `confirm.deleteProfile` | `Bạn có chắc chắn muốn xóa profile "{{name}}" không?` | 1166 |
| `prompt.enterWidth` | `Nhập chiều rộng (Width):` | 1729 |
| `prompt.enterHeight` | `Nhập chiều cao (Height):` | 1733 |

---

## 2. Profile Manager — Thanh bộ nhớ (Storage Bar)

| Key gợi ý | Nội dung gốc (vi) | Dòng |
|---|---|---|
| `storage.title` | `💾 DUNG LƯỢNG BỘ NHỚ TRÌNH DUYỆT (LOCAL STORAGE CAP)` | 777 |
| `storage.warning.title` | `Cảnh báo dung lượng:` | 836 |
| `storage.warning.body` | `Bộ nhớ đệm của bạn đã đạt trên 80%. Vui lòng xuất (.json) bớt các profile cũ ra máy hoặc đồng bộ lên Google Drive Cloud để tránh mất mát dữ liệu vẽ!` | 837–839 |

---

## 3. Profile Manager — Tạo Profile Mới (Left Panel)

| Key gợi ý | Nội dung gốc (vi) | Dòng |
|---|---|---|
| `createProfile.heading` | `✨ TẠO PROFILE MỚI` | 865 |
| `createProfile.description` | `Thiết kế một mô hình hoạt ảnh Nyan Cat độc lập với khung vẽ trống theo đúng độ phân giải tùy chọn của bạn.` | 875–877 |
| `createProfile.labelName` | `Tên Profile` | 892 |
| `createProfile.labelResolution` | `Độ Phân Giải Preset` | 921 |
| `createProfile.resolutionCustomOption` | `Tùy Chỉnh Kích Thước...` | 942 |
| `createProfile.labelWidth` | `Rộng (Width)` | 957 |
| `createProfile.labelHeight` | `Cao (Height)` | 987 |
| `createProfile.btnCreate` | `🚀 Tạo Profile mới` | 1033 |
| `createProfile.btnImport` | `Nhập .JSON` | 1057 |

---

## 4. Profile Manager — Danh Sách Profile Đã Lưu (Right Panel)

| Key gợi ý | Nội dung gốc (vi) | Dòng |
|---|---|---|
| `savedProfiles.heading` | `📂 PROFILE ĐÃ LƯU ({{count}})` | 1074 |
| `savedProfiles.description` | `Chọn một thiết kế bạn đang làm dở từ danh sách dưới đây để tiếp tục chỉnh sửa.` | 1084–1085 |
| `savedProfiles.empty` | `Chưa có profile nào được lưu. Hãy nhập hoặc tạo mới để bắt đầu!` | 1099 |
| `savedProfiles.btnLoad` | `Tải` | 1138 |
| `savedProfiles.btnExportTitle` | `Xuất profile ra máy tính (.json)` | 1156 |
| `savedProfiles.btnDelete` | `Xóa` | 1182 |

---

## 5. Google Drive Sync Center

| Key gợi ý | Nội dung gốc (vi) | Dòng |
|---|---|---|
| `drive.heading` | `☁️ TRUNG TÂM ĐỒNG BỘ ĐÁM MÂY (GOOGLE DRIVE SYNC)` | 1248 |
| `drive.statusConnected` | `🟢 ĐÃ KẾT NỐI DRIVE` | 1263 |
| `drive.statusDisconnected` | `⚪ CHƯA KẾT NỐI` | 1277 |
| `drive.connectDescription` | `Bảo vệ các tác phẩm của bạn khỏi rủi ro dọn bộ nhớ cache hoặc đổi thiết bị. Hãy kết nối tài khoản Google Drive để tự động lưu trữ, chia sẻ và đồng bộ hóa các Profile Nyan Cat đa dạng của bạn ở mọi nơi.` | 1294–1297 |
| `drive.btnConnectLoading` | `Đang mở Google OAuth2...` | 1325–1326 |
| `drive.btnConnect` | `🔌 Kết Nối Với Google Drive` | 1329 |
| `drive.connectedAccount` | `Tài khoản được kết nối:` | 1352 |
| `drive.connectedDescription` | `Toàn bộ profiles có thể được mã hóa và tải lên thư mục riêng biệt của Nyan Studio trên đám mây của bạn.` | 1363–1365 |
| `drive.btnBackup` | `Sao Lưu Lên Drive` | 1394 |
| `drive.btnRestore` | `Khôi Phục Từ Drive` | 1414 |
| `drive.btnDisconnect` | `Ngắt Kết Nối` | 1431 |
| `drive.progressBackup` | `📤 Đang tải sao lưu lên Google Drive...` | 1463 |
| `drive.progressRestore` | `📥 Đang nạp tệp từ Google Drive...` | 1464 |
| `drive.backupListTitle` | `☁️ TỆP SAO LƯU HIỆN CÓ TRÊN DRIVE ({{count}})` | 1517 |
| `drive.fileUpdatedAt` | `Ngày lưu: {{date}} \| Dung lượng: {{size}}` | 1564 |
| `drive.btnLoadNow` | `Nạp ngay` | 1584 |

---

## 6. Workspace Toolbar (Assembler đang mở)

| Key gợi ý | Nội dung gốc (vi) | Dòng |
|---|---|---|
| `toolbar.sizeLabel` | `Kích thước:` | 1720 |
| `toolbar.btnPlayPreviewTitle` | `Chạy thử các hoạt ảnh và part-swapping của linh kiện trực tiếp trên canvas kéo thả` | 1788 |
| `toolbar.btnStopPreview` | `⏸️ Dừng Thử` | 1790 |
| `toolbar.btnPlayPreview` | `▶️ Chạy Thử Hoạt Ảnh` | 1790 |
| `toolbar.btnManageProfileTitle` | `Quay lại danh sách quản lý Profile` | 1806 |
| `toolbar.btnManageProfile` | `📂 Quản Lý Profile` | 1808 |
| `toolbar.btnApplyTitle` | `Đồng bộ cấu trúc lắp ráp này sang mô hình hoạt ảnh Nyan Cat đang chạy` | 1825 |
| `toolbar.btnApply` | `Áp Dụng` | 1827 |
| `toolbar.btnSaveTitle` | `Lưu các thay đổi của profile hiện tại` | 1845 |
| `toolbar.btnSave` | `Lưu Profile` | 1847 |

---

## 7. Canvas Hint Bar

| Key gợi ý | Nội dung gốc (vi) | Dòng |
|---|---|---|
| `canvas.hintDragDrop` | `💡 Di chuyển linh kiện: **Kéo thả chuột** hoặc **Click chọn linh kiện + Dùng phím mũi tên bàn phím** (giữ Shift để dịch chuyển nhanh).` | 2047–2050 |

---

## 8. Sidebar — Custom Sprites Panel

| Key gợi ý | Nội dung gốc (vi) | Dòng |
|---|---|---|
| `customParts.btnDraw` | `🎨 Vẽ Part Mới` | 2092 |
| `customParts.empty` | `Chưa có linh kiện vẽ nào trong Thư viện.` | 2109 |
| `customParts.btnDrawNow` | `🎨 Vẽ Linh Kiện Ngay` | 2130 |
| `customParts.btnEditTitle` | `Sửa hình vẽ linh kiện này` | 2217 |
| `customParts.btnEdit` | `Sửa` | 2219 |
| `defaultSprites.btnEditTitle` | `Sửa hình vẽ mặc định này` | 2341 |
| `defaultSprites.btnEdit` | `Sửa` | 2342 |

---

## 9. Sidebar — Motion & Animation Panel

| Key gợi ý | Nội dung gốc (vi) | Dòng |
|---|---|---|
| `motion.heading` | `🎭 Hoạt Ảnh & Chuyển Động Riêng` | 2612 |
| `motion.toggleOn` | `KÍCH HOẠT` | 2657 |
| `motion.toggleOff` | `TẮT` | 2657 |
| `motion.fpsHint` | `Hoạt ảnh chạy lặp vô tận ở tốc độ 6 FPS (khớp nhịp Bobbing). Bạn có thể đổi hình vẽ và tịnh tiến pixel cho mỗi frame.` | 2678–2679 |
| `motion.frameTitle` | `⚡ KHUNG HÌNH (FRAME) {{index}}` | 2723 |
| `motion.labelDx` | `Dịch ngang dx (pixels)` | 2743 |
| `motion.labelDy` | `Dịch dọc dy (pixels)` | 2780 |
| `motion.labelPartSwap` | `Hoán đổi linh kiện (Part Swap)` | 2819 |
| `motion.optgroupCustom` | `Thư viện vẽ (Custom Parts)` | 2844 |
| `motion.optgroupDefault` | `Linh kiện mặc định (Default)` | 2851 |
| `motion.btnAddFrame` | `➕ Thêm Frame` | 2897 |
| `motion.btnDeleteLastFrame` | `➖ Xóa Frame Cuối` | 2924 |

---

## 10. Sidebar — Layer Stack Panel

| Key gợi ý | Nội dung gốc (vi) | Dòng |
|---|---|---|
| `layers.emptyHint` | `Chưa có linh kiện nào trên Canvas. Click chọn linh kiện ở trên để đưa vào Canvas!` | 2948–2949 |
| `layers.btnMoveUpTitle` | `Đẩy lên trước (Tăng z-index)` | 2980 |
| `layers.btnMoveDownTitle` | `Đẩy ra sau (Giảm z-index)` | 2990 |
| `layers.btnHideTitle` | `Ẩn layer` | 3000 |
| `layers.btnShowTitle` | `Hiện layer` | 3000 |
| `layers.btnDuplicateTitle` | `Nhân bản layer (Duplicate)` | 3014 |
| `layers.btnDeleteTitle` | `Xóa layer` | 3024 |

---

## 11. Modal — Unsaved Changes Warning

| Key gợi ý | Nội dung gốc (vi) | Dòng |
|---|---|---|
| `unsavedModal.title` | `⚠️ CẢNH BÁO THAY ĐỔI CHƯA LƯU` | 3050 |
| `unsavedModal.body` | `Bạn đang có thay đổi chưa lưu trong profile "{{name}}". Bạn muốn làm gì trước khi tiếp tục?` | 3060–3062 |
| `unsavedModal.btnSaveAndContinue` | `💾 Lưu thay đổi & Tiếp tục` | 3083 |
| `unsavedModal.btnDiscard` | `🗑️ Bỏ qua thay đổi` | 3099 |
| `unsavedModal.btnCancel` | `❌ Quay lại chỉnh sửa (Hủy)` | 3117 |

---

## 12. Modal — Pixel Art Creator

| Key gợi ý | Nội dung gốc (vi) | Dòng |
|---|---|---|
| `pixelEditor.btnClose` | `Đóng / Quay lại` | 3162 |

---

## 13. Modal — Google OAuth Account Picker

| Key gợi ý | Nội dung gốc (vi) | Dòng |
|---|---|---|
| `authModal.title` | `Đăng nhập với Google` | 3211 |
| `authModal.subtitle` | `để tiếp tục đồng bộ Nyan Studio` | 3220 |
| `authModal.addAccount` | `➕ Sử dụng một tài khoản khác` | 3317 |
| `authModal.btnCancel` | `Hủy bỏ` | 3334 |

---

## 14. Modal — Google Drive File Picker

| Key gợi ý | Nội dung gốc (vi) | Dòng |
|---|---|---|
| `drivePicker.title` | `📁 Google Picker - Chọn tệp sao lưu (.json)` | 3373 |
| `drivePicker.searchPlaceholder` | `Tìm kiếm tệp sao lưu trên Drive...` | 3392 |
| `drivePicker.fileUpdatedAt` | `Cập nhật: {{date}} \| {{size}}` | 3479 |
| `drivePicker.btnCancel` | `Hủy bỏ` | 3530 |
| `drivePicker.btnRestore` | `📥 Khôi phục bản ghi` | 3549 |
