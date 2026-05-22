# i18n Strings — `PixelEditor.jsx`

Bao gồm cả chuỗi **tiếng Việt hardcode** và chuỗi **tiếng Anh hardcode** cần đưa vào i18n.
Các key đã dùng `t()` được ghi chú riêng.

---

## 1. Toast / Confirm / Alert (qua `t()` — đã dùng i18n key)

Các key này **đã được gọi bằng `t()`** trong code nhưng chưa có bản dịch định nghĩa. Cần bổ sung vào file locale.

| Key `t()` hiện có | Nội dung gợi ý (vi) | Dòng |
|---|---|---|
| `pixelEditor.errors.missingName` | `Vui lòng nhập tên cho linh kiện trước khi lưu.` | 237 |
| `pixelEditor.toasts.savedAndBound` | `Đã lưu "{{name}}" và gán vào chuyển động thành công!` | 266 |
| `pixelEditor.toasts.savedToLibrary` | `Đã lưu "{{name}}" vào thư viện của bạn.` | 273 |
| `pixelEditor.errors.saveFailed` | `Lỗi khi lưu: {{error}}` | 282 |
| `pixelEditor.confirm.deletePart` | `Bạn có chắc muốn xóa linh kiện "{{name}}" không?` | 297 |
| `pixelEditor.toasts.deleted` | `Đã xóa linh kiện "{{name}}".` | 302 |
| `pixelEditor.confirm.clearGrid` | `Bạn có chắc muốn xóa toàn bộ khung vẽ hiện tại không?` | 319 |
| `pixelEditor.toasts.copiedCode` | `Đã sao chép mã nguồn vào clipboard!` | 338 |
| `pixelEditor.canvasTag` | `PIXEL ART EDITOR` *(hoặc tùy chỉnh)* | 347 |
| `pixelEditor.canvasTitle` | `Canvas {{w}} × {{h}} px` | 349 |

---

## 2. Color Brush Labels (tiếng Anh hardcode — object `COLOR_LABELS`)

Hiển thị tên màu trong bảng màu. Cần i18n nếu muốn đa ngôn ngữ.

| Key gợi ý | Nội dung gốc (en) | Dòng |
|---|---|---|
| `pixelEditor.colors.0` | `Eraser (Transparent)` | 14 |
| `pixelEditor.colors.1` | `Outline (Black)` | 15 |
| `pixelEditor.colors.2` | `Cat Skin (Grey/Theme)` | 16 |
| `pixelEditor.colors.3` | `Cat Dark Skin (Shadow)` | 17 |
| `pixelEditor.colors.4` | `Toast Crust` | 18 |
| `pixelEditor.colors.5` | `Frosting (Pink/Flavor)` | 19 |
| `pixelEditor.colors.6` | `Sprinkles (Hot Pink)` | 20 |
| `pixelEditor.colors.7` | `Eye White` | 21 |
| `pixelEditor.colors.8` | `Cheek Pink` | 22 |

---

## 3. Canvas Header — tiếng Anh hardcode

| Key gợi ý | Nội dung gốc (en) | Dòng |
|---|---|---|
| `pixelEditor.loadTemplateLabel` | `Load Template:` | 354 |
| `pixelEditor.templateOptions.headOpen` | `Cat Head (Open)` | 363 |
| `pixelEditor.templateOptions.headBlink` | `Cat Head (Blink)` | 364 |
| `pixelEditor.templateOptions.poptart` | `Pop-Tart Toast Body` | 365 |
| `pixelEditor.templateOptions.tailUp` | `Tail (Upward)` | 366 |
| `pixelEditor.templateOptions.tailMid` | `Tail (Horizontal)` | 367 |
| `pixelEditor.templateOptions.tailDown` | `Tail (Downward)` | 368 |
| `pixelEditor.templateOptions.legDown` | `Leg (Straight)` | 369 |
| `pixelEditor.templateOptions.legFront` | `Leg (Kick Front)` | 370 |
| `pixelEditor.templateOptions.legBack` | `Leg (Kick Back)` | 371 |
| `pixelEditor.btnResetClear` | `Reset Clear` | 378 |

---

## 4. Canvas Hint Bar — tiếng Việt hardcode

| Key gợi ý | Nội dung gốc (vi) | Dòng |
|---|---|---|
| `pixelEditor.canvasHint` | `💡 Click chuột trái để tô màu. Nhấn giữ chuột trái và rê vẽ để tô hàng loạt nhanh chóng.` | 414–416 |

---

## 5. Sidebar — Section 1: Save Part Details (tiếng Anh hardcode)

| Key gợi ý | Nội dung gốc (en) | Dòng |
|---|---|---|
| `pixelEditor.section1Title` | `1. Save Part Details` | 422 |
| `pixelEditor.labelName` | `Name (English Keys Recommended)` | 424 |
| `pixelEditor.namePlaceholder` | `e.g. laser_head_style` | 430 |
| `pixelEditor.labelWidth` | `Width` | 436 |
| `pixelEditor.labelHeight` | `Height` | 453 |

---

## 6. Sidebar — Motion Slot Selector (tiếng Việt hardcode)

| Key gợi ý | Nội dung gốc (vi) | Dòng |
|---|---|---|
| `pixelEditor.motionSlotLabel` | `🎬 Gán Chuyển Động (Motion Slot)` | 487 |
| `pixelEditor.motionSlot.none` | `❌ Không gán chuyển động` | 504 |
| `pixelEditor.motionSlot.headGroup` | `🐱 ĐẦU MÈO (HEAD)` | 505 |
| `pixelEditor.motionSlot.headAll` | `🌟 Tất cả trạng thái Đầu (Mở & Nhắm)` | 507 |
| `pixelEditor.motionSlot.headOpen` | `👁️ Mắt Mở (HEAD_OPEN)` | 509 |
| `pixelEditor.motionSlot.headBlink` | `😑 Mắt Nhắm (HEAD_BLINK)` | 510 |
| `pixelEditor.motionSlot.bodyGroup` | `🥞 THÂN BÁNH (BODY)` | 512 |
| `pixelEditor.motionSlot.poptart` | `🍪 Thân bánh Pop-Tart (POPTART)` | 513 |
| `pixelEditor.motionSlot.tailGroup` | `🐕 ĐUÔI MÈO (TAIL)` | 515 |
| `pixelEditor.motionSlot.tailAll` | `🌟 Tất cả trạng thái Đuôi (Lên/Ngang/Xuống)` | 517 |
| `pixelEditor.motionSlot.tailUp` | `⬆️ Đuôi hướng lên (TAIL_UP)` | 519 |
| `pixelEditor.motionSlot.tailMid` | `➡️ Đuôi nằm ngang (TAIL_MID)` | 520 |
| `pixelEditor.motionSlot.tailDown` | `⬇️ Đuôi hướng xuống (TAIL_DOWN)` | 521–523 |
| `pixelEditor.motionSlot.legGroup` | `🦵 CHÂN MÈO (LEGS)` | 525 |
| `pixelEditor.motionSlot.legAll` | `🌟 Tất cả các Chân (Đứng/Trước/Sau)` | 526–527 |
| `pixelEditor.motionSlot.legDown` | `⬇️ Chân thẳng đứng (LEG_DOWN)` | 529 |
| `pixelEditor.motionSlot.legFront` | `↗️ Chân co trước (LEG_FRONT)` | 530 |
| `pixelEditor.motionSlot.legBack` | `↖️ Chân co sau (LEG_BACK)` | 531 |

---

## 7. Info Card — Không gán chuyển động (tiếng Việt hardcode)

| Key gợi ý | Nội dung gốc (vi) | Dòng |
|---|---|---|
| `pixelEditor.freeModelCard.title` | `💡 Dành Cho Mô Hình Tự Do (Dog, Robot, Chim...)` | 564 |
| `pixelEditor.freeModelCard.intro` | `Chọn "Không gán chuyển động" khi vẽ linh kiện của các mô hình tự do. Sau khi lưu, bạn sẽ thiết lập chuyển động riêng cho nó ở trang Assembler:` | 566–569 |
| `pixelEditor.freeModelCard.workflowTitle` | `Luồng tạo chuyển động tịnh tiến & hoán đổi part:` | 585 |
| `pixelEditor.freeModelCard.step1` | `Vẽ các trạng thái linh kiện (ví dụ: vẽ mắt mở dog_head_open và mắt nhắm dog_head_blink) rồi lưu lại.` | 597–599 |
| `pixelEditor.freeModelCard.step2` | `Click nút 🚀 Custom Model Assembler ở thanh tiêu đề trên cùng để mở Studio lắp ráp.` | 602–603 |
| `pixelEditor.freeModelCard.step3` | `Tạo mới Profile (ví dụ: "DOG PROFILE").` | 605 |
| `pixelEditor.freeModelCard.step4` | `Thêm linh kiện chính (ví dụ: dog_head_open) vào Canvas dưới dạng một Layer.` | 607–608 |
| `pixelEditor.freeModelCard.step5` | `Tại cột điều chỉnh bên phải, tích chọn KÍCH HOẠT ở mục 🎭 Hoạt Ảnh & Chuyển Động Riêng.` | 611–613 |
| `pixelEditor.freeModelCard.step6` | `Thiết lập frame-by-frame: Ở mỗi Frame, tùy ý tịnh tiến tọa độ (dx, dy) hoặc hoán đổi linh kiện hiển thị (Part Swap, ví dụ đổi sang dog_head_blink ở Frame 2 để nhắm mắt).` | 616–619 |
| `pixelEditor.freeModelCard.step7` | `Bật ▶️ Chạy Thử Hoạt Ảnh ở góc trên Workspace để xem mô hình chuyển động thời gian thực ở tốc độ 6 FPS!` | 622–624 |

---

## 8. Info Card — Ghi đè chuyển động Nyan Cat (tiếng Việt hardcode)

| Key gợi ý | Nội dung gốc (vi) | Dòng |
|---|---|---|
| `pixelEditor.overrideCard.title` | `⚡ Ghi Đè Chuyển Động Mặc Định Nyan Cat` | 656 |
| `pixelEditor.overrideCard.body` | `Linh kiện này sẽ tự động thay thế bộ phận mặc định tương ứng của chú mèo Nyan Cat ở vị trí {{slot}}.` | 659–660 |
| `pixelEditor.overrideCard.note` | `💡 Chú mèo Nyan Cat trên Dashboard sẽ tự động co duỗi và chuyển động linh kiện mới này theo đúng quỹ đạo nhún nhảy mặc định!` | 663–664 |

---

## 9. Sidebar — Save / Delete Buttons (tiếng Anh hardcode)

| Key gợi ý | Nội dung gốc (en) | Dòng |
|---|---|---|
| `pixelEditor.btnSave` | `Save to My Library` | 675 |
| `pixelEditor.btnDelete` | `Delete Part` | 695 |

---

## 10. Sidebar — Section 2 & 3 Headers (tiếng Anh hardcode)

| Key gợi ý | Nội dung gốc (en) | Dòng |
|---|---|---|
| `pixelEditor.section2Title` | `2. Select Paint Brush` | 703 |
| `pixelEditor.section3Title` | `3. Live Export Array Code` | 734 |
| `pixelEditor.btnCopy` | `Copy` | 740 |
