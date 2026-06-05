# 🌌 BẢN ĐỊNH NGHĨA & BẢO TOÀN NGỮ CẢNH DỰ ÁN (PROJECT & CONTEXT DEFINITION)
> **Tệp tin này lưu trữ toàn bộ kiến trúc, luồng hoạt động, cấu trúc dữ liệu và tiến trình phát triển của dự án để khôi phục ngữ cảnh làm việc bất kỳ lúc nào.**

---

## 1. Tổng Quan Dự Án (Project Overview)
**Nyan Cat Widescreen Studio** là một ứng dụng web cao cấp, kết hợp phong cách Cyberpunk và nghệ thuật Pixel Art, được thiết kế chuyên biệt để tạo, lắp ráp và trình chiếu các mô hình hoạt ảnh retro chuyển động thời gian thực trên màn hình phụ máy tính siêu rộng (kích thước gốc **1920 × 462** và các tùy chọn kích thước tùy chỉnh khác).

---

## 2. Kiến Trúc Kỹ Thuật & Phân Chia Component (Technical Architecture & Components)

Dự án được xây dựng trên bộ khung công nghệ hiện đại, hiệu năng cao và linh hoạt:
- **Core Framework**: React (Vite) + Javascript (ES6+).
- **Styling System**: Vanilla CSS với hệ thống biến màu sắc HSL sống động, hiệu ứng kính mờ (Glassmorphism), viền phát sáng (Glow border) và chuyển động vi lượng (Micro-animations) đậm chất Cyberpunk.
- **Rendering Engine**: Bản vẽ Canvas HTML5 2D thời gian thực, tối ưu hóa chu kỳ render bằng `requestAnimationFrame` và cơ chế caching tham số thông qua React `useRef`.

### 2.1 Sơ Đồ Cấu Trúc Các Tệp Tin Chính:
```
NyanCat/
├── src/
│   ├── App.jsx                 # Điều hướng trang (Dashboard <-> Custom Model Assembler)
│   ├── main.jsx                # Điểm khởi chạy ứng dụng
│   ├── index.css               # Hệ thống design tokens, UI Cyberpunk & hiệu ứng toàn cục
│   ├── context/
│   │   └── AppContext.jsx      # Quản lý State toàn cục (Custom parts, layers, bindings, profiles)
│   ├── utils/
│   │   └── nyanRenderer.js     # Chứa dữ liệu linh kiện mặc định và động cơ dựng Canvas 2D
│   └── components/
│       ├── CanvasPreview.jsx   # Màn hình Live Monitor Preview (Canvas 2D thời gian thực)
│       ├── PixelEditor.jsx     # Trình vẽ Pixel Art & Gán Motion Slot trực tiếp
│       ├── ModelAssembler.jsx  # Trang Assembler tự do kéo thả layer & Quản lý Packages
│       ├── ControlSidebar.jsx  # Bảng cấu hình chỉ số mô phỏng (FPS, Zoom Scale, Skin, Rainbow)
│       ├── ExportPanel.jsx     # Panel xuất video ghi lại hoạt ảnh
│       ├── ProfileManager.jsx  # Quản lý các Profile, Import/Export JSON và hiển thị bộ nhớ
│       ├── LayerControls.jsx   # Điều khiển tọa độ layer (clamping), Z-Index, và Motion Timeline
│       ├── LayerHierarchy.jsx  # Hiển thị cây thư mục các layer đang có trên canvas kéo thả
│       ├── DriveSyncPanel.jsx  # Mockup đồng bộ đám mây và lưu trữ sao lưu Google Drive
│       ├── ColorPaletteManager.jsx # Quản lý bảng màu vẽ tùy biến của Pixel Editor
│       └── MiniCanvasPreview.jsx   # Component canvas siêu nhẹ để hiển thị nhanh các pixel art
```

### 2.2 Chi Tiết Nhiệm Vụ Của Từng Component:

#### 1. Core & State Flow Components:
*   **[App.jsx](file:///c:/PersonalProject/NyanCat/src/App.jsx)**: Component gốc kiểm soát bố cục (Layout Switcher) chính của ứng dụng. Điều khiển việc chuyển đổi hiển thị giữa trang **Dashboard chính** (chế độ mô phỏng động) và trang **Model Assembler** (chế độ studio thiết kế).
*   **[AppContext.jsx](file:///c:/PersonalProject/NyanCat/src/context/AppContext.jsx)**: Trái tim quản lý State toàn cục của ứng dụng. Đóng gói các logic đồng bộ trực tiếp xuống `localStorage`, quản lý thư viện linh kiện người dùng vẽ (`customParts`), cấu trúc layer (`layers`), liên kết khe chuyển động (`bindings`), danh sách gói linh kiện được nạp (`loadedPackages`), bảng màu tùy biến (`customPalettes`), và các cấu hình thiết lập mô phỏng (`settings`).

#### 2. Simulation & Rendering Components:
*   **[CanvasPreview.jsx](file:///c:/PersonalProject/NyanCat/src/components/CanvasPreview.jsx)**: Quản lý chu trình chạy hoạt ảnh thời gian thực trên màn hình Monitor của Dashboard. Sử dụng động cơ dựng hình của `NyanCatModel` để vẽ mèo Nyan nhún nhảy, tạo các vì sao bay lượn trên nền không gian và kết hợp với hệ thống **Vệt đuôi lượn sóng (Procedural Trail)** lặp vô hạn.
*   **[nyanRenderer.js](file:///c:/PersonalProject/NyanCat/src/utils/nyanRenderer.js)**: Chứa định nghĩa cốt lõi của mô hình động Nyan Cat (`NyanCatModel`). Thực hiện các thuật toán vẽ ma trận điểm pixel lên Canvas 2D, dịch chuyển tọa độ các bộ phận (Bobbing/Kicking) theo từng frame, và tính toán đường cong hình Sin / sóng vuông cho Procedural Trail.

#### 3. Pixel Designer Components:
*   **[PixelEditor.jsx](file:///c:/PersonalProject/NyanCat/src/components/PixelEditor.jsx)**: Trình thiết kế Pixel Art tích hợp. Cho phép vẽ tự do trên lưới grid độ phân giải tùy chọn, tẩy xóa, tăng giảm kích thước grid, xuất mã nguồn mảng 2D, và gán trực tiếp linh kiện vào các Motion Slot hoặc lưu vào Packages riêng.
*   **[ColorPaletteManager.jsx](file:///c:/PersonalProject/NyanCat/src/components/ColorPaletteManager.jsx)**: Quản lý bảng cọ vẽ màu sắc của trình vẽ pixel. Cho phép nạp gói màu JSON tùy biến, tạo gói màu mới, thay đổi mã màu cọ vẽ bằng bảng Color Picker, và trích xuất màu tự động từ các tệp tin linh kiện.
*   **[MiniCanvasPreview.jsx](file:///c:/PersonalProject/NyanCat/src/components/MiniCanvasPreview.jsx)**: Thành phần canvas kết xuất siêu nhẹ được dùng để hiển thị ảnh thu nhỏ (preview) của các part trong thư viện, trong danh sách layer, và trong sidebar chọn linh kiện.

#### 4. Widescreen Assembly Components:
*   **[ModelAssembler.jsx](file:///c:/PersonalProject/NyanCat/src/components/ModelAssembler.jsx)**: Sân khấu kéo thả full-screen chuyên nghiệp. Quản lý catalog linh kiện bên trái, canvas lắp ráp chính ở giữa và thanh điều khiển bên phải. Hỗ trợ thao tác kéo thả bằng chuột mượt mà cấp độ `window` và phím mũi tên để dịch chuyển layer (giữ `Shift` di chuyển nhanh 10px).
*   **[ProfileManager.jsx](file:///c:/PersonalProject/NyanCat/src/components/ProfileManager.jsx)**: Bảng kiểm soát lưu trữ dự án, hiển thị dung lượng sử dụng của Local Storage kèm thanh Cyberpunk Neon, cho phép nạp/xuất Profile dạng JSON, và quản lý các thiết lập đồng bộ Google Drive.
*   **[LayerHierarchy.jsx](file:///c:/PersonalProject/NyanCat/src/components/LayerHierarchy.jsx)**: Sidebar hiển thị cây cấu trúc layer dạng danh sách phân cấp. Cho phép chọn nhanh layer, ẩn/hiện, thay đổi thứ tự z-index hiển thị trước/sau và xóa bỏ layer khỏi canvas lắp ráp.
*   **[LayerControls.jsx](file:///c:/PersonalProject/NyanCat/src/components/LayerControls.jsx)**: Bảng cấu hình chi tiết layer đang chọn. Hỗ trợ thay đổi tọa độ X, Y thủ công với cơ chế tự động clamp giá trị nhập vào, nhân bản layer và quan trọng nhất là **Trình chỉnh sửa hoạt ảnh riêng biệt (Custom Motion Timeline)** giúp thiết kế chuyển động độc lập cho từng layer.

---

## 3. Luồng Hoạt Động & Cơ Chế Xử Lý Lõi (Core Application Logic)

### 3.1 Luồng Đồng Bộ Màu Sắc Động & Sửa Lỗi Lệch Màu (Theming & Color Pipeline)

Một phần đặc biệt quan trọng trong hệ thống hiển thị là sự cân bằng giữa **Màu sắc chủ đề động (Dynamic Skin/Poptart Themes)** và **Màu sắc tùy chỉnh của linh kiện tự thiết kế (Custom Colored Parts)**:

1.  **Hệ Thống Màu Chủ Đề (Dynamic Themes)**: Nyan Cat hỗ trợ thay đổi phong cách da (Classic Grey, Siamese, Albino...) và bánh poptart (Strawberry, Chocolate...) trực tiếp từ cài đặt. Các bộ phận mặc định sẽ sử dụng các chỉ số từ `1` đến `8` đại diện cho các slot màu động (2: da mèo, 3: bóng da, 4: viền bánh, 5: kem bánh, 6: kẹo cốm...).
2.  **Linh Kiện Tự Vẽ (Custom Parts)**: Khi người dùng tự thiết kế linh kiện, họ gán mã màu cụ thể (ví dụ: da người sáng, áo thun trắng) vào các chỉ số màu. Khi kết xuất, các linh kiện này cần bỏ qua màu chủ đề động để giữ lại màu sắc gốc của mình.
3.  **Linh Kiện Hệ Thống Được Tùy Biến (Customized System Sprites)**: Nếu người dùng thay đổi dữ liệu mặc định (như sửa `HEAD_BLINK` trong file `defaultSprites.json` để vẽ nhân vật mới), linh kiện này tuy vẫn thuộc nhóm hệ thống nhưng đã mang bảng màu riêng.
4.  **Cơ Chế Giải Quyết Conflict Màu Sắc (`isClassicSystemSpriteColors`)**:
    *   Hàm kiểm tra `isClassicSystemSpriteColors` trong `nyanRenderer.js` sẽ so sánh bảng màu của linh kiện hệ thống với bảng màu nguyên bản. 
    *   Nếu phát hiện màu sắc của chỉ số da (chỉ số 2) hoặc kem bánh (chỉ số 5) bị thay đổi so với classic, hệ thống sẽ nhận diện đây là linh kiện đã được tùy biến.
    *   Trong `nyanRenderer.js` (`getColorsForSlot`), `CanvasPreview.jsx`, và `MiniCanvasPreview.jsx`, khi vẽ các linh kiện được tùy biến hoặc linh kiện custom, cơ chế sẽ ghép bảng màu gốc của linh kiện đè lên trên `baseColorMap` (bảng màu chủ đề), ngăn cản màu chủ đề động ghi đè và làm sai lệch màu sắc thiết kế.
    *   Khi nạp các template mặc định (như `RAINBOW_STRIPES`) trong Pixel Editor, hàm `loadTemplate` sẽ nạp màu sắc riêng của template trước để giữ nguyên sắc cầu vồng, sau đó tự động điền các màu mặc định vào những ô còn thiếu để bảo toàn bộ cọ vẽ của trình sửa.

### 3.2 Cơ Chế Quản Lý Gói Linh Kiện (Custom Packages Import/Export)

Hệ thống quản lý package trong Model Assembler cho phép đóng gói các linh kiện pixel thành các nhóm tái sử dụng (`package` tag):
- **Cơ chế Import (Nạp Package)**: Khi bấm nút "Nạp Package", hệ thống hỗ trợ phân tích cấu trúc tệp tin JSON tải lên một cách mềm dẻo:
  1. *Định dạng Standalone Package*: Có dạng `{ packageName: "Tên gói", parts: { ... } }`.
  2. *Định dạng Project JSON*: Có dạng chứa thuộc tính `{ customParts: { ... } }` (tự động giải nén linh kiện và lấy tên package từ linh kiện đầu tiên).
  3. *Định dạng Danh sách linh kiện đơn thuần*: Mảng chứa các đối tượng có thuộc tính `matrix`/`data`.
  Các linh kiện hợp lệ sẽ được tự động lưu vào state `customParts` và package đó sẽ được tự động đưa vào danh sách `loadedPackages`.
- **Cơ chế Unload & Delete**:
  - Người dùng có thể nhấn **Unload** trên đầu mỗi Package tùy chọn để ẩn tạm thời toàn bộ linh kiện của package đó khỏi danh mục lựa chọn (tiết kiệm không gian hiển thị). Các package bị unload sẽ nằm trong mục "Unloaded Packages" ở chân danh mục để dễ dàng nạp lại bất kỳ lúc nào.
  - Người dùng có thể nhấn nút **Delete (✕)** để xóa vĩnh viễn package cùng toàn bộ linh kiện bên trong ra khỏi thư viện, hệ thống sẽ tự động gỡ bỏ các layer tương ứng đang nằm trên bàn làm việc và phục hồi slot bindings về default.

---

## 4. Mô Hình Cấu Trúc Dữ Liệu Lõi (Core Data Models)

### 1. Custom Parts Library (`customParts`)
```typescript
interface CustomParts {
  [partKey: string]: {
    name: string;             // Tên hiển thị linh kiện
    width: number;            // Chiều rộng ma trận
    height: number;           // Chiều cao ma trận
    matrix: number[][];       // Mảng ma trận điểm pixel 2D (giá trị 0-9)
    package: string;          // Gói linh kiện (Ví dụ: "My Custom", "Space Pack")
    isAnimationFrameOnly: boolean; // Ẩn khỏi danh sách lắp ráp, chỉ dùng làm frame hoạt ảnh
    colors?: {                // Bảng màu riêng đính kèm linh kiện
      [colorIndex: string]: string; // Ví dụ: { "1": "#000000", "2": "#ff0000" }
    };
    colorLabels?: {           // Nhãn mô tả cho từng màu
      [colorIndex: string]: string;
    };
  }
}
```

### 2. Layer Object (`layers`)
```typescript
interface Layer {
  id: string;                 // Mã layer duy nhất ngẫu nhiên
  partName: string;           // Tên key liên kết sang customParts hoặc defaultSprites
  x: number;                  // Tọa độ X trên canvas
  y: number;                  // Tọa độ Y trên canvas
  zIndex: number;             // Thứ tự hiển thị lớp
  visible: boolean;           // Ẩn/hiện layer
  isAnimated?: boolean;       // Kích hoạt hoạt ảnh tùy biến riêng
  motionFrames?: MotionFrame[]; // Chuỗi khung hình hoạt ảnh của layer này
}
```

### 3. Motion Frame Object (`MotionFrame`)
```typescript
interface MotionFrame {
  partName: string;           // Key linh kiện hoán đổi tại frame này (Part Swap)
  dx: number;                 // Dịch chuyển X của riêng frame này (Pixel translation)
  dy: number;                 // Dịch chuyển Y của riêng frame này
}
```

### 4. Profiles Dictionary (`profiles`)
```typescript
interface Profile {
  id: string;                 // Mã định danh profile (profile_timestamp)
  name: string;               // Tên của Profile lắp ráp
  resolution: {
    width: number;            // Chiều rộng canvas lắp ráp
    height: number;           // Chiều cao canvas lắp ráp
  };
  background: {
    type: 'transparent' | 'color' | 'image';
    value: string;            // Mã màu HEX hoặc URL base64 hình nền
  };
  layers: Layer[];            // Cấu trúc các lớp linh kiện đã xếp
}
```

---

## 5. Hướng Dẫn AI Agent Khôi Phục Ngữ Cảnh Nhanh (Context Recovery Checklist)

Khi bắt đầu phiên làm việc mới hoặc tiếp quản dự án:
1.  **Kiểm tra State**: Đọc [AppContext.jsx](file:///c:/PersonalProject/NyanCat/src/context/AppContext.jsx) để nắm được các action cập nhật state đang được cung cấp.
2.  **Đọc tệp tin renderer**: Đọc kỹ cấu trúc vẽ trong [nyanRenderer.js](file:///c:/PersonalProject/NyanCat/src/utils/nyanRenderer.js) để hiểu cách ma trận pixel được vẽ và cách vệt đuôi được tính toán.
3.  **Hệ màu**: Ghi nhớ cơ chế bypass dynamic themes cho các linh kiện có bảng màu tùy biến (chỉ theme linh kiện hệ thống nếu chúng giữ nguyên bộ màu classic).
4.  **Kiểm tra Build**: Luôn chạy `npm run build` để đảm bảo không có lỗi cú pháp hoặc import sau khi thực hiện chỉnh sửa.
