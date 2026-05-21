# 🌌 BẢN ĐỊNH NGHĨA & BẢO TOÀN NGỮ CẢNH DỰ ÁN (PROJECT & CONTEXT DEFINITION)
> **Tệp tin này lưu trữ toàn bộ kiến trúc, luồng hoạt động, cấu trúc dữ liệu và tiến trình phát triển của dự án để khôi phục ngữ cảnh làm việc bất kỳ lúc nào.**

---

## 1. Tổng Quan Dự Án (Project Overview)
**Nyan Cat Widescreen Studio** là một ứng dụng web cao cấp, kết hợp phong cách Cyberpunk và nghệ thuật Pixel Art, được thiết kế chuyên biệt để tạo, lắp ráp và trình chiếu các mô hình hoạt ảnh retro chuyển động thời gian thực trên màn hình phụ máy tính siêu rộng (kích thước gốc **1920 × 462** và các tùy chọn kích thước tùy chỉnh khác).

### Các Tính Năng Cốt Lõi:
1. **Live Monitor Preview**: Màn hình mô phỏng Canvas thời gian thực (đầy đủ hiệu ứng dải cầu vồng chuyển động, sao băng lấp lánh và nhịp nhún nhảy Bobbing sinh động của Nyan Cat).
2. **Pixel Art Creator**: Bộ công cụ tự vẽ linh kiện/pixel art độ phân giải cao trực quan, hỗ trợ gán trực tiếp linh kiện mới vẽ vào các phân đoạn chuyển động của Nyan Cat (Motion Slots) chỉ với 1 click.
3. **Custom Model Assembler**: Trang lắp ráp mô hình độc lập chuyên nghiệp. Cho phép người dùng tạo các Profile lắp ráp khác nhau, thay đổi độ phân giải linh hoạt, kéo thả các layer linh kiện tự do, xếp chồng lớp (Z-Index) để tạo nên các tác phẩm hoàn toàn khác biệt (ví dụ: mô hình Chó, Chim, Robot...).
4. **Local/Cloud Profile Management & Drive Sync**: 
   - Quản lý bộ nhớ Local Storage trình duyệt kèm theo thanh cảnh báo dung lượng Cyberpunk Neon.
   - Nhập/Xuất Profile độc lập dạng file `.json` tự động đóng gói các custom parts đi kèm.
   - Trực quan hóa trung tâm đồng bộ đám mây **Google Drive Sync Center** với giao diện đăng nhập Auth cực kỳ chi tiết, làm nền tảng kết nối API chính thức trong tương lai.
5. **Capture to Video**: Công cụ ghi lại hoạt ảnh trực tiếp để xuất ra tệp tin video phục vụ mục đích trang trí hệ thống.

---

## 2. Kiến Trúc Kỹ Thuật (Technical Architecture)

Dự án được xây dựng trên bộ khung công nghệ hiện đại, hiệu năng cao và linh hoạt:
- **Core Framework**: React (Vite) + Javascript (ES6+).
- **Styling System**: Vanilla CSS với hệ thống biến màu sắc HSL sống động, hiệu ứng kính mờ (Glassmorphism), viền phát sáng (Glow border) và chuyển động vi lượng (Micro-animations) đậm chất Cyberpunk.
- **Rendering Engine**: Bản vẽ Canvas HTML5 2D thời gian thực, tối ưu hóa chu kỳ render bằng `requestAnimationFrame` và cơ chế caching tham số thông qua React `useRef`.

### Sơ Đồ Cấu Trúc Các Tệp Tin Chính:
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
│       ├── ModelAssembler.jsx  # Trang Assembler tự do kéo thả layer & Đồng bộ Drive giả lập
│       ├── ControlSidebar.jsx  # Bảng cấu hình chỉ số mô phỏng (FPS, Zoom Scale, Skin, Rainbow)
│       └── ExportPanel.jsx     # Panel xuất video ghi lại hoạt ảnh
└── studio_context.md           # Tệp tin bảo toàn ngữ cảnh này
```

---

## 3. Cấu Trúc Luồng Hoạt Động (Application Flow)

### Luồng 1: Dashboard (Màn hình chính)
- **Cột Trái**: 
  - **Màn hình Live Monitor Preview**: Luôn hiển thị trên cùng để người dùng thấy trực tiếp hoạt ảnh đang chạy (FPS, thời gian mô phỏng). Nút Play/Pause cho phép dừng/chạy hoạt ảnh.
  - **Khu vực Tương Tác Tab**: Gồm 2 tab:
    1. *Pixel Art Creator*: Vẽ linh kiện, điền thông tin và chọn **Motion Slot** để gán trực tiếp bộ phận mới vẽ vào thân, đầu hay chân mèo Nyan.
    2. *Capture to Video*: Nút ghi hình và tải video xuất ra máy tính.
- **Cột Phải**: 
  - **Control Sidebar**: Thay đổi các thông số lõi như Tốc độ khung hình (FPS), Tỉ lệ (Scale), Mật độ sao bay (Star Density), Phong cách da (Skin Style), Kiểu poptart (Poptart Style), Màu sắc Custom và Dải cầu vồng.
  - **Nút Chuyển Trang**: Bấm nút **"🚀 Custom Model Assembler"** trên Header để chuyển hẳn sang trang Lắp Ráp Mô Hình Tự Do (vào trang này, chế độ chuyển động chính sẽ đổi sang `assembler`).

### Luồng 2: Custom Model Assembler (Studio Lắp Ráp Mô Hình)
- Khi bấm chuyển trang, ứng dụng sẽ chuyển sang layout fullscreen chuyên nghiệp dành riêng cho chế độ thiết kế.
- **Khởi đầu**: Trang Assembler sẽ hiển thị màn hình trống thay vì mèo Nyan mặc định, kích thích người dùng tải Profile hoặc tạo mới.
- **Quản lý Profile**:
  - Gồm hộp thoại tạo Profile mới (nhập tên, thiết lập resolution).
  - Danh sách Profile đã lưu trong Local Storage. Kèm theo thanh Neon chỉ thị phần trăm bộ nhớ đã dùng (`💾 Bộ Nhớ Trình Duyệt: ...%`).
  - Hỗ trợ nút **Nhập Profile (.json)** và **Xuất Profile (.json)** độc lập.
  - Hộp thoại **Google Drive Cloud Sync Center** cực xịn để sao lưu đám mây giả lập.
- **Bàn làm việc Drag-and-Drop**:
  - Khi đã chọn Profile, màn hình canvas thiết kế sẽ xuất hiện theo đúng độ phân giải đã chọn.
  - Người dùng chọn linh kiện từ thư viện (gồm linh kiện tự vẽ và linh kiện mặc định) để add vào Canvas dưới dạng một **Layer**.
  - Các layer có thể được **kéo thả tự do bằng chuột** hoặc **dịch chuyển mịn bằng phím mũi tên bàn phím** (phím mũi tên di chuyển 1px, giữ `Shift` di chuyển 10px).
- **Tinh chỉnh Layer & Trình Biên Tập Hoạt Ảnh Chuyển Động (Active Plan)**:
  - Khi click vào bất kỳ Layer nào, thanh tinh chỉnh bên phải sẽ xuất hiện giúp thay đổi tọa độ X, Y chính xác từng pixel và quản lý thứ tự xếp chồng Z-Index (Lên trên/Xuống dưới).
  - Tích hợp công cụ gán chuyển động riêng biệt cho layer đó (Hỗ trợ đổi linh kiện và dịch chuyển pixel theo từng frame).

---

## 4. Mô Hình Cấu Trúc Dữ Liệu Lõi (Core Data Models)

Để ứng dụng lưu giữ và hoạt động nhất quán, State toàn cục trong `AppContext.jsx` quản lý các cấu trúc dữ liệu chính sau:

### 1. Custom Parts Library (`customParts`)
Thư viện chứa các hình vẽ pixel của người dùng.
```typescript
interface CustomParts {
  [partKey: string]: {
    name: string;      // Tên hiển thị do người dùng đặt
    width: number;     // Chiều rộng lưới pixel (ví dụ: 11)
    height: number;    // Chiều cao lưới pixel
    data: number[][];  // Mảng 2 chiều chứa chỉ số màu pixel [row][col] (0: transparent, 1-8: mã màu)
  }
}
```

### 2. Layer Object (`layers`)
Các phần tử nằm trên canvas thiết kế của Assembler.
```typescript
interface Layer {
  id: string;          // Khóa duy nhất ngẫu nhiên (sinh bằng timestamp + random)
  partName: string;    // Tên key liên kết sang customParts hoặc DEFAULT_SPRITES
  x: number;           // Tọa độ ngang tuyệt đối trên canvas
  y: number;           // Tọa độ dọc tuyệt đối trên canvas
  zIndex: number;      // Độ sâu hiển thị để xếp chồng layer
  visible: boolean;    // Trạng thái hiển thị (True/False)
  
  // Thuộc tính phục vụ hoạt ảnh riêng (Xem mục 5)
  isAnimated?: boolean; 
  motionFrames?: MotionFrame[];
}
```

### 3. Motion Frame Object (`MotionFrame`)
Mô tả hành vi của một layer tại một khung hình chuyển động cụ thể.
```typescript
interface MotionFrame {
  partName: string;    // Linh kiện hiển thị cho frame này (Part Switching)
  dx: number;          // Độ lệch pixel ngang (Pixel translation trục X)
  dy: number;          // Độ lệch pixel dọc (Pixel translation trục Y)
}
```

### 4. Assembler Profiles Dictionary (`profiles`)
Chứa tất cả cấu trúc mô hình lắp ráp đã lưu.
```typescript
interface Profile {
  id: string;          // Khóa duy nhất (profile_timestamp)
  name: string;        // Tên mô hình (ví dụ: "DOG MODEL V1")
  resolution: {
    width: number;     // Chiều rộng canvas (mặc định 1920)
    height: number;    // Chiều cao canvas (mặc định 462)
  };
  background: {
    type: 'transparent' | 'color' | 'image';
    value: string;     // Mã màu hex hoặc URL ảnh nền nền
  };
  layers: Layer[];     // Danh sách các layer linh kiện thuộc mô hình này
}
```

---

## 5. Hướng Dẫn Tải & Khôi Phục Ngữ Cảnh (For AI Assistant)

Nếu bạn là AI Assistant mới tiếp quản dự án này sau khi bị mất lịch sử chat, hãy thực hiện các bước sau để tiếp tục làm việc ngay lập tức:

### Bước 1: Đọc và nắm chắc kiến trúc
1. Đọc tệp tin này `studio_context.md` để nắm cấu trúc dữ liệu và logic.
2. Kiểm tra tệp tin [AppContext.jsx](file:///c:/PersonalProject/NyanCat/src/context/AppContext.jsx) để xác nhận các phương thức state toàn cục hiện tại.
3. Kiểm tra tệp tin [CanvasPreview.jsx](file:///c:/PersonalProject/NyanCat/src/components/CanvasPreview.jsx) và [ModelAssembler.jsx](file:///c:/PersonalProject/NyanCat/src/components/ModelAssembler.jsx).

### Bước 2: Trạng Thế Hiện Tại (Current Project State)
- **Nhiệm vụ đã hoàn thành**: Triển khai trọn vẹn và tích hợp **Hệ thống chuyển động động riêng biệt cho từng Layer/Part (Part-Level Custom Motion System)** trên cả Dashboard và Assembler:
  - **Hướng dẫn Luồng vẽ & Tạo hoạt ảnh riêng (`PixelEditor.jsx`)**: Bổ sung thẻ hướng dẫn **Cyberpunk Dynamic Motion Info Card** trực quan ngay dưới mục "Gán chuyển động". Khi chọn "Không gán chuyển động" (vẽ Dog, Robot, Chim...), người dùng sẽ nhận được luồng hướng dẫn chi tiết từng bước cách thiết kế nhiều frame, sang Assembler lắp ráp, kích hoạt chuyển động riêng và tịnh tiến/hoán đổi part. Khi chọn slot Nyan Cat, người dùng nhận được thông báo ghi đè tự động nhún nhảy.
  - **Tối ưu hóa Trải nghiệm người dùng (UX Editor)**: Loại bỏ hoàn toàn các hộp thoại chặn trình duyệt `alert()` lỗi thời trong Pixel Workspace, thay thế bằng hệ thống thông báo Fading Toast Cyberpunk Neon mượt mà 3 giây của AppContext khi Lưu linh kiện hoặc Sao chép mã mảng 2D.
  - **Hệ thống Workspace Preview (`ModelAssembler.jsx`)**: Tích hợp nút **"▶️ Chạy Thử Hoạt Ảnh" (Play Preview)** trong bộ điều khiển của Studio. Khi kích hoạt, bàn làm việc drag-and-drop sẽ chạy hoạt ảnh giả lập ở tốc độ 6 FPS, tự động hoán đổi linh kiện (Part Switching) và tịnh tiến tọa độ (`dx * s`, `dy * s`) trực quan theo thời gian thực để người dùng xem trực tiếp kết quả chuyển động.
  - **Tích hợp Dashboard & Sidebar (`ControlSidebar.jsx` & `App.jsx`)**: Bổ sung chế độ **"Custom Model"** bên cạnh "Screen Crosser" và "Infinite Hover". Khi chọn chế độ này, người dùng có thể lựa chọn bất kỳ Profile đã lưu nào thông qua dropdown **"Active Custom Profile"** để trình chiếu trực tiếp trên Canvas chính của Dashboard.
  - **Hệ thống rendering (`CanvasPreview.jsx`)**: Tương thích hoàn toàn với chế độ Custom Model mới, tự động render chuẩn xác chiều sâu zIndex, hình nền tùy chỉnh, và chạy mượt mà chuyển động lặp vô tận của từng layer theo dữ liệu được nạp. Nút Play/Pause hoạt động nhất quán.
  - **Ghi hình & Xuất Video (`ExportPanel.jsx`)**: Công cụ WebM Canvas Recorder bắt trọn từng khung hình chuyển động của mô hình custom (như Chó, Chim, Robot...) với chất lượng 6 Mbps cực nét, sẵn sàng xuất bản ra file WebM và chuyển đổi MP4.
- **Trạng thái biên dịch**: Biên dịch thành công 100% bằng lệnh `npm run build` với thời gian cực nhanh (3.11s) và không phát sinh bất kỳ cảnh báo/lỗi linting nào.

