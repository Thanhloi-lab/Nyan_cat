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

### Bước 2: Trạng Thái Hiện Tại (Current Project State)
- **Nhiệm vụ đã hoàn thành**:
  - **Nút Xóa Linh Kiện Custom Hiện Tại & Loại Bỏ Danh Sách Thư Viện Trong Editor (Delete Part Button & Library List Clean-up)**:
    1. Tích hợp nút **"Delete Part"** (hiển thị gradient Cyberpunk đỏ/hồng ấn tượng) kế bên nút "Save to My Library" khi người dùng nhấn Sửa (`editingPartKey` hợp lệ) một linh kiện tự vẽ.
    2. Cung cấp hộp thoại xác nhận tường minh (`window.confirm`) trước khi thực hiện xóa linh kiện, cảnh báo rằng nó sẽ xóa sạch layer liên quan trên canvas lắp ráp và các motion slot bindings.
    3. Hỗ trợ sự kiện callback `onClose` để tự động đóng Modal vẽ của Assembler khi xóa thành công, hoặc tự động reset về mẫu vẽ đầu mèo `HEAD_OPEN` mặc định nếu đang ở tab Editor độc lập.
    4. Loại bỏ hoàn toàn vùng hiển thị danh sách *"4. My Custom Parts Library"* bên dưới chân sidebar của trình vẽ Pixel Art, giúp tối giản hóa giao diện, tăng tính tập trung cao độ khi sáng tạo linh kiện.
  - **Tự Động Clamping Tọa Độ Trên Input (On-change Coordinate Clamping)**: Cải tiến spinner điều khiển tọa độ X/Y của Active Layer trong `ModelAssembler.jsx` để tự động giới hạn và clamp tức thì khi người dùng gõ số: vượt quá độ phân giải canvas (X > `resolution.width` hoặc Y > `resolution.height`) sẽ tự động giới hạn về giá trị lớn nhất, nhỏ hơn `0` (như `-30` hay `-50`) sẽ tự động giới hạn về `0`. Cơ chế xử lý chuỗi thông minh cho phép người dùng thoải mái xóa trống hoặc gõ dấu âm `-` trước khi gõ số mà không gây lag hay lỗi hiển thị.
  - **Hệ thống chuyển động động riêng biệt cho từng Layer/Part (Part-Level Custom Motion System)**: Triển khai trọn vẹn và tích hợp trên cả Dashboard và Assembler.
  - **Sửa lỗi Phản Hồi Lưu Thư Viện (Pixel Editor)**: Khắc phục triệt để lỗi click "Save to My Library" không có thông báo bằng cách loại bỏ các cuộc gọi `window.alert()` gây lỗi bảo mật `SecurityError` trong môi trường sandbox trình duyệt. Giờ đây toàn bộ phản hồi lưu thành công hoặc báo lỗi đều sử dụng hệ thống Toast notification Cyberpunk Neon mượt mà, an toàn tuyệt đối.
  - **Sửa lỗi Kéo Thả và Mất Chọn Layer (Model Assembler)**: Khắc phục hoàn toàn lỗi khi kéo thả linh kiện (drag-and-drop) on canvas rồi thả chuột ra bị mất trạng thái chọn (deselect layer).
  - **Giao Diện Thư Viện Mặc Định Dual-Action (Default Sprites Edit & Add)**: Bổ sung nút **"Sửa" (Edit)** cho thư viện Standard Default Sprites để tự động nạp sprite mặc định vào Pixel Art Creator vẽ lại dưới dạng Custom Part cá nhân, kết hợp nút **"Add"** để nhanh chóng chèn trực tiếp layer mặc định lên canvas lắp ráp.
  - **Tối Ưu Sự Kiện Kéo Thả & Trống Canvas**: Đăng ký di chuyển chuột mượt mà cấp độ `window` (`mousemove`/`mouseup`) và triển khai sự kiện click trên nền trống canvas (`onMouseDown`) để bỏ chọn (unselect) layer tinh gọn, tự nhiên.
  - **Nâng Cấp Z-Index Toast Notification**: Điều chỉnh lớp hiển thị `.toast-notification` lên `20000` trong `index.css` để bảo đảm các cảnh báo/toast luôn nổi bật vượt trội lên trên tất cả các lớp Modal vẽ pixel.
- **Trạng thái biên dịch**: Biên dịch thành công 100% bằng lệnh `npm run build` với thời gian cực nhanh (~2.75s) và không phát sinh bất kỳ cảnh báo/lỗi nào.

