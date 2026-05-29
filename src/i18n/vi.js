const vi = {
  lang: {
    vi: 'Tiếng Việt',
    en: 'English'
  },
  app: {
    brand: 'NYAN CAT STUDIO',
    widescreenEdition: 'WIDESCREEN EDITION',
    assemblerStudio: 'ASSEMBLER STUDIO',
    customModelCreator: 'CUSTOM MODEL CREATOR',
    resolutionTag: 'PC CASE MONITOR COMPATIBLE (1920 × 462 NATIVE)',
    assemblerResolutionTag: 'FREE ASSEMBLY & LAYER Z-INDEX COMPOSITOR',
    backToDashboard: '⬅️ Quay lại Dashboard',
    goAssembler: '🚀 Custom Model Assembler',
    tabs: {
      editor: '1. PIXEL ART CREATOR',
      export: '2. CAPTURE TO VIDEO'
    }
  },
  settings: {
    language: 'Ngôn ngữ'
  },
  movement: {
    crosser: 'Crosser',
    stationary: 'Hover',
    assembler: 'Custom Model'
  },
  sidebar: {
    dynamicControls: 'DYNAMIC SYSTEM CONTROLS',
    movementMode: 'Movement Mode',
    activeProfile: 'Active Custom Profile',
    noProfilesHint: 'Không có profile nào. Hãy tạo mới ở trang Assembler Studio!',
    chooseProfile: '-- Chọn profile --',
    pixelScale: 'Pixel Art Scale',
    fps: 'Running Speed (FPS)',
    starDensity: 'Space Stars Density',
    starCount: '{count} stars',
    customizeSprite: 'CUSTOMIZE SPRITE',
    skinStyle: 'Cat Skin Color',
    poptartStyle: 'Pop-Tart Flavor Theme',
    frosting: 'Frosting',
    crust: 'Crust',
    sprinkles: 'Sprinkles',
    headFineTune: 'Head Placement Fine-Tuning',
    headDx: 'Horizontal (HEAD_DX)',
    headDy: 'Vertical (HEAD_DY)',
    rainbowStyle: 'Rainbow Trail Wave Style',
    motionBindings: 'MOTION SLOT BINDINGS',
    motionBindingsDesc: 'Gán các bộ phận vẽ tùy chỉnh (My Custom Sprites) của bạn vào các khớp chuyển động nhấp nhô của Nyan Cat.',
    defaultSprite: 'Default Sprite (Mặc định)',
    paletteTitle: 'Quản Lý Gói Màu',
    paletteDesc: 'Nạp các gói bảng màu tùy chỉnh từ tệp JSON bên ngoài.',
    btnImportPalette: 'Nạp Gói Màu JSON',
    btnCreatePalette: '➕ Tạo Gói Màu',
    paletteCreatorTitle: 'Thiết Kế Gói Màu Mới',
    btnAddColor: '➕ Thêm Màu',
    btnSaveAndExport: '💾 Lưu & Tải JSON',
    tooltipExportPalette: 'Tải tệp JSON gói màu về máy',
    loadedPalettes: 'Các gói màu đã nạp'
  },
  skin: {
    classic: 'Classic Grey',
    tabby: 'Orange Tabby',
    siamese: 'Siamese Cream',
    void: 'Void Black',
    albino: 'Albino White'
  },
  poptart: {
    strawberry: 'Strawberry Pink',
    blueberry: 'Blueberry Blue',
    chocolate: 'Chocolate Fudge',
    custom: 'Custom Theme'
  },
  rainbow: {
    classic: 'Classic Rainbow',
    neon: 'Cyberpunk Neon',
    pastel: 'Pastel Dreams',
    monochrome: 'Monochrome Wave'
  },
  slots: {
    HEAD_OPEN: 'Cat Head (Eyes Open)',
    HEAD_BLINK: 'Cat Head (Blinking)',
    POPTART: 'Pop-Tart Toast Body',
    TAIL_UP: 'Tail (Upward wave)',
    TAIL_MID: 'Tail (Horizontal wave)',
    TAIL_DOWN: 'Tail (Downward wave)',
    LEG_DOWN: 'Leg (Straight down)',
    LEG_FRONT: 'Leg (Kick front)',
    LEG_BACK: 'Leg (Kick back)'
  },
  pixelEditor: {
    canvasTag: 'PIXEL ART EDITOR',
    canvasTitle: 'Canvas {w} × {h} px',
    errors: {
      missingName: 'Vui lòng nhập tên cho linh kiện trước khi lưu.',
      saveFailed: 'Lỗi khi lưu: {error}',
      invalidPalette: '⚠️ File JSON không hợp lệ! Phải chứa các key 1-8 trỏ tới mã màu HEX.',
      paletteParseError: '❌ Lỗi khi đọc file JSON gói màu!',
      missingPaletteName: '⚠️ Vui lòng nhập tên gói màu!'
    },
    confirm: {
      deletePart: 'Bạn có chắc muốn xóa linh kiện "{name}" không?',
      clearGrid: 'Bạn có chắc muốn xóa toàn bộ khung vẽ hiện tại không?',
      deletePalette: 'Bạn có chắc muốn gỡ gói màu "{name}" khỏi danh sách?'
    },
    toasts: {
      savedAndBound: '💾 Đã lưu "{name}" và gán vào chuyển động thành công!',
      savedToLibrary: '💾 Đã lưu "{name}" vào thư viện của bạn.',
      deleted: '🗑️ Đã xóa linh kiện "{name}".',
      copiedCode: 'Đã sao chép mã nguồn vào clipboard!',
      paletteLoaded: '🎨 Đã nạp gói màu "{name}" thành công!',
      paletteExported: '📤 Đã xuất gói màu thành công!',
      paletteDeleted: '🗑️ Đã gỡ gói màu "{name}".',
      paletteSaved: '🎨 Đã lưu gói màu "{name}" vào thư viện!',
      colorSelected: '🎨 Đã chọn cọ màu #{index}',
      colorAdded: '🎨 Đã thêm màu mới vào cọ vẽ #{index}!'
    },
    colors: {
      0: 'Tẩy (Không màu)',
      1: 'Viền (Đen)',
      2: 'Da mèo (Xám/Chủ đề)',
      3: 'Da mèo sẫm (Bóng)',
      4: 'Viền bánh nướng',
      5: 'Kem phủ bánh (Hồng/Vị)',
      6: 'Hạt cốm (Hồng đậm)',
      7: 'Lòng trắng mắt',
      8: 'Má hồng'
    },
    loadTemplateLabel: 'Nạp mẫu vẽ:',
    templateOptions: {
      headOpen: 'Đầu mèo (Mở mắt)',
      headBlink: 'Đầu mèo (Nháy mắt)',
      poptart: 'Thân bánh Pop-Tart',
      tailUp: 'Đuôi (Vểnh lên)',
      tailMid: 'Đuôi (Ngang)',
      tailDown: 'Đuôi (Cụp xuống)',
      legDown: 'Chân (Thẳng đứng)',
      legFront: 'Chân (Co trước)',
      legBack: 'Chân (Co sau)'
    },
    btnResetClear: 'Xóa sạch lưới',
    canvasHint: '💡 Click chuột trái để tô màu. Nhấn giữ chuột trái và rê vẽ để tô hàng loạt nhanh chóng.',
    section1Title: '1. Lưu Thông Tin Linh Kiện',
    labelName: 'Tên linh kiện (Khuyên dùng tiếng Anh)',
    namePlaceholder: 'Ví dụ: laser_head_style',
    labelWidth: 'Chiều rộng',
    labelHeight: 'Chiều cao',
    motionSlotLabel: '🎬 Gán Chuyển Động (Motion Slot)',
    motionSlot: {
      none: '❌ Không gán chuyển động',
      headGroup: '🐱 ĐẦU MÈO (HEAD)',
      headAll: '🌟 Tất cả trạng thái Đầu (Mở & Nhắm)',
      headOpen: '👁️ Mắt Mở (HEAD_OPEN)',
      headBlink: '😑 Mắt Nhắm (HEAD_BLINK)',
      bodyGroup: '🥞 THÂN BÁNH (BODY)',
      poptart: '🍪 Thân bánh Pop-Tart (POPTART)',
      tailGroup: '🐕 ĐUÔI MÈO (TAIL)',
      tailAll: '🌟 Tất cả trạng thái Đuôi (Lên/Ngang/Xuống)',
      tailUp: '⬆️ Đuôi hướng lên (TAIL_UP)',
      tailMid: '➡️ Đuôi nằm ngang (TAIL_MID)',
      tailDown: '⬇️ Đuôi hướng xuống (TAIL_DOWN)',
      legGroup: '🦵 CHÂN MÈO (LEGS)',
      legAll: '🌟 Tất cả các Chân (Đứng/Trước/Sau)',
      legDown: '⬇️ Chân thẳng đứng (LEG_DOWN)',
      legFront: '↗️ Chân co trước (LEG_FRONT)',
      legBack: '↖️ Chân co sau (LEG_BACK)'
    },
    freeModelCard: {
      title: '💡 Dành Cho Mô Hình Tự Do (Chó, Robot, Chim...)',
      intro: 'Chọn "Không gán chuyển động" khi vẽ linh kiện của các mô hình tự do. Sau khi lưu, bạn sẽ thiết lập chuyển động riêng cho nó ở trang Assembler:',
      workflowTitle: 'Luồng tạo chuyển động tịnh tiến & hoán đổi part:',
      step1: 'Vẽ các trạng thái linh kiện (ví dụ: vẽ mắt mở dog_head_open và mắt nhắm dog_head_blink) rồi lưu lại.',
      step2: 'Click nút 🚀 Custom Model Assembler ở thanh tiêu đề trên cùng để mở Studio lắp ráp.',
      step3: 'Tạo mới Profile (ví dụ: "DOG PROFILE").',
      step4: 'Thêm linh kiện chính (ví dụ: dog_head_open) vào Canvas dưới dạng một Layer.',
      step5: 'Tại cột điều chỉnh bên phải, tích chọn KÍCH HOẠT ở mục 🎭 Hoạt Ảnh & Chuyển Động Riêng.',
      step6: 'Thiết lập frame-by-frame: Ở mỗi Frame, tùy ý tịnh tiến tọa độ (dx, dy) hoặc hoán đổi linh kiện hiển thị (Part Swap, ví dụ đổi sang dog_head_blink ở Frame 2 để nhắm mắt).',
      step7: 'Bật ▶️ Chạy Thử Hoạt Ảnh ở góc trên Workspace để xem mô hình chuyển động thời gian thực ở tốc độ 6 FPS!'
    },
    overrideCard: {
      title: '⚡ Ghi Đè Chuyển Động Mặc Định Nyan Cat',
      body: 'Linh kiện này sẽ tự động thay thế bộ phận mặc định tương ứng của chú mèo Nyan Cat ở vị trí {slot}.',
      note: '💡 Chú mèo Nyan Cat trên Dashboard sẽ tự động co duỗi và chuyển động linh kiện mới này theo đúng quỹ đạo nhún nhảy mặc định!'
    },
    btnSave: 'Save to My Library',
    btnDelete: 'Delete Part',
    sectionPaletteTitle: 'Bảng Màu Tùy Biến',
    defaultPalette: 'Màu Nyan Mặc Định (Chuyển Động)',
    btnExportPalette: 'Xuất bảng màu JSON',
    btnDeletePalette: 'Gỡ bảng màu này',
    btnImportPalette: 'Nạp Gói Màu (.json)',
    btnSavePalette: 'Lưu Gói',
    savePalettePlaceholder: 'Tên gói màu mới...',
    templateColorsLabel: 'Bảng Màu Mẫu (Click để lấy màu):',
    btnApplyPalette: 'Áp Dụng',
    btnAddBrush: 'Thêm Cọ Màu Mới',
    sectionBrushTitle: 'Chọn Cọ Vẽ',
    brushHint: '💡 Nhấp vào ô màu của cọ vẽ bất kỳ để sửa màu tùy chọn!',
    tooltipColorPicker: 'Nhấp vào để chọn màu tùy ý',
    sectionExportTitle: 'Mã Ma Trận 2D',
    btnCopy: 'Copy'
  },
  exportPanel: {
    importSuccess: 'Nhập project thành công!',
    importError: 'Không thể nhập project: {error}',
    alert: {
      zipSuccess: 'Đã tải gói frame ảnh PNG (Sprites ZIP) thành công!',
      zipError: 'Lỗi xuất ZIP: {message}',
      noCanvas: 'Không tìm thấy live Canvas để ghi hình!'
    },
    record: {
      statusInit: 'Khởi tạo Stream Canvas...',
      statusCompressing: 'Đang nén video WebM...',
      statusRecording: 'Đang ghi hình canvas...',
      durationLabel: 'Thời lượng (Duration):',
      duration5s: '5 Giây (Nhẹ nhàng)',
      duration10s: '10 Giây (Khuyên dùng)',
      duration20s: '20 Giây (Chất lượng cao)',
      btnRecord: 'Record WebM Video'
    },
    tags: {
      projectRestore: 'PROJECT / RESTORE',
      pngPack: 'PNG PACK',
      video: 'VIDEO'
    },
    card1Title: 'Lưu & Phục Hồi Dự Án (JSON)',
    card1Desc: 'Xuất toàn bộ cài đặt, màu sắc và tùy chỉnh của dự án ra file JSON để sao lưu hoặc chia sẻ.',
    exportJson: 'Xuất JSON Project',
    importJson: 'Nhập JSON Project',
    card2Title: 'Xuất Sprites PNG (ZIP)',
    card2Desc: 'Tải xuống từng frame hoạt ảnh dưới dạng ảnh PNG trong một file ZIP.',
    downloadZip: 'Tải Gói ZIP',
    card3Title: 'Ghi Hình Canvas (WebM Video)',
    card3Desc: 'Ghi lại màn hình canvas chạy hoạt ảnh trực tiếp thành file video WebM chất lượng cao.',
    paletteTitle: 'Quản Lý Gói Màu (Palette Manager)',
    paletteDesc: 'Nạp gói màu sắc tùy chỉnh từ tệp tin JSON để sử dụng rộng rãi khi thiết kế linh kiện.',
    btnImportPalette: 'Nạp Gói Màu JSON',
    loadedPalettes: 'Các gói màu đã nạp',
    ffmpeg: {
      title: '💡 Looping MP4 Conversion Pipeline for Aida64 / Wallpaper Engine',
      intro: 'Do giới hạn bản quyền của trình duyệt không cho phép kết xuất trực tiếp tệp tin MP4 H.264 phần cứng, canvas recorder sẽ xuất ra file WebM Lossless siêu nét. Bạn có hai cách để nén thành MP4 vòng lặp hoàn hảo cho màn hình phụ case PC:',
      method1Badge: 'Cách 1',
      method1Title: 'Sử dụng Batch Script đi kèm:',
      method1Body: 'Di chuyển tệp tin nyan_cat_custom_1920x462.webm vừa tải xuống vào thư mục dự án này, sau đó nhấp đúp chạy file convert_mp4.bat. Nó sẽ tự động convert sang MP4 chất lượng cao ngay lập tức.',
      method2Badge: 'Cách 2',
      method2Title: 'Lệnh PowerShell / Command Prompt (Nếu máy có FFmpeg):',
      method2Body: 'Mở PowerShell tại thư mục tải xuống và chạy lệnh:'
    }
  },
  modelAssembler: {
    toast: {
      exportProfileSuccess: 'Đã tải xuống profile "{name}" thành công!',
      driveDisconnected: 'Đã ngắt kết nối Google Drive.',
      driveConnected: 'Đã kết nối thành công với Drive ({email})!',
      driveBackupSuccess: 'Đã sao lưu toàn bộ profiles lên Google Drive thành công!',
      syncSuccess: 'Đã đồng bộ tọa độ & linh kiện lắp ráp thành công sang Mô hình Động!'
    },
    alert: {
      importProfileSuccess:
        'Nhập profile thành công!\n- Đã nạp thêm {count} bộ phận tự vẽ vào thư viện của bạn.',
      importProfileError: 'Không thể nhập profile: {error}',
      jsonSyntaxError: 'Lỗi cú pháp tệp JSON: {message}',
      noProfileToBackup: 'Không có profile nào để backup lên Google Drive!',
      noCloudFileSelected: 'Vui lòng chọn 1 tệp sao lưu trên đám mây!',
      cloudRestoreSuccess:
        'Nạp tệp "{filename}" từ Google Drive thành công!\nProfile mới "{profileName}" đã được tải về local.'
    },
    confirm: {
      disconnectDrive: 'Bạn muốn ngắt kết nối tài khoản Google Drive?',
      deleteProfile: 'Bạn có chắc chắn muốn xóa profile "{name}" không?'
    },
    prompt: {
      enterWidth: 'Nhập chiều rộng (Width):',
      enterHeight: 'Nhập chiều cao (Height):'
    },
    toolbar: {
      switchProfile: 'Chuyển profile:',
      sizeLabel: 'Kích thước:',
      btnPlayPreviewTitle:
        'Chạy thử các hoạt ảnh và part-swapping của linh kiện trực tiếp trên canvas kéo thả',
      btnStopPreview: '⏸️ Dừng Thử',
      btnPlayPreview: '▶️ Chạy Thử Hoạt Ảnh',
      btnManageProfileTitle: 'Quay lại danh sách quản lý Profile',
      btnManageProfile: '📂 Quản Lý Profile',
      btnApplyTitle: 'Đồng bộ cấu trúc lắp ráp này sang mô hình hoạt ảnh Nyan Cat đang chạy',
      btnApply: 'Áp Dụng',
      btnSaveTitle: 'Lưu các thay đổi của profile hiện tại',
      btnSave: 'Lưu Profile'
    },
    canvas: {
      hintDragDrop:
        '💡 Di chuyển linh kiện: **Kéo thả chuột** hoặc **Click chọn linh kiện + Dùng phím mũi tên bàn phím** (giữ Shift để dịch chuyển nhanh).'
    },
    customParts: {
      btnDraw: '🎨 Vẽ Part Mới',
      empty: 'Chưa có linh kiện vẽ nào trong Thư viện.',
      btnDrawNow: '🎨 Vẽ Linh Kiện Ngay',
      btnEditTitle: 'Sửa hình vẽ linh kiện này',
      btnEdit: 'Sửa'
    },
    defaultSprites: {
      btnEditTitle: 'Sửa hình vẽ mặc định này',
      btnEdit: 'Sửa',
      btnViewTitle: 'Xem ma trận mã nguồn',
      btnView: 'View/Code'
    },
    motion: {
      heading: '🎭 Hoạt Ảnh & Chuyển Động Riêng',
      toggleOn: 'KÍCH HOẠT',
      toggleOff: 'TẮT',
      fpsHint:
        'Hoạt ảnh chạy lặp vô tận ở tốc độ 6 FPS (khớp nhịp Bobbing). Bạn có thể đổi hình vẽ và tịnh tiến pixel cho mỗi frame.',
      frameTitle: '⚡ KHUNG HÌNH (FRAME) {{index}}',
      labelDx: 'Dịch ngang dx (pixels)',
      labelDy: 'Dịch dọc dy (pixels)',
      labelPartSwap: 'Hoán đổi linh kiện (Part Swap)',
      optgroupCustom: 'Thư viện vẽ (Custom Parts)',
      optgroupDefault: 'Linh kiện mặc định (Default)',
      btnAddFrame: '➕ Thêm Frame',
      btnDeleteLastFrame: '➖ Xóa Frame Cuối'
    },
    layers: {
      emptyHint:
        'Chưa có linh kiện nào trên Canvas. Click chọn linh kiện ở trên để đưa vào Canvas!',
      btnMoveUpTitle: 'Đẩy lên trước (Tăng z-index)',
      btnMoveDownTitle: 'Đẩy ra sau (Giảm z-index)',
      btnHideTitle: 'Ẩn layer',
      btnShowTitle: 'Hiện layer',
      btnDuplicateTitle: 'Nhân bản layer (Duplicate)',
      btnDeleteTitle: 'Xóa layer'
    },
    unsavedModal: {
      title: '⚠️ CẢNH BÁO THAY ĐỔI CHƯA LƯU',
      body:
        'Bạn đang có thay đổi chưa lưu trong profile "{{name}}". Bạn muốn làm gì trước khi tiếp tục?',
      btnSaveAndContinue: '💾 Lưu thay đổi & Tiếp tục',
      btnDiscard: '🗑️ Bỏ qua thay đổi',
      btnCancel: '❌ Quay lại chỉnh sửa (Hủy)'
    },
    pixelEditor: {
      btnClose: 'Đóng / Quay lại'
    },
    authModal: {
      title: 'Đăng nhập với Google',
      subtitle: 'để tiếp tục đồng bộ Nyan Studio',
      addAccount: '➕ Sử dụng một tài khoản khác',
      btnCancel: 'Hủy bỏ'
    },
    drivePicker: {
      title: '📁 Google Picker - Chọn tệp sao lưu (.json)',
      searchPlaceholder: 'Tìm kiếm tệp sao lưu trên Drive...',
      fileUpdatedAt: 'Cập nhật: {{date}} | {{size}}',
      btnCancel: 'Hủy bỏ',
      btnRestore: '📥 Khôi phục bản ghi'
    },
    searchPlaceholder: 'Tìm kiếm linh kiện...',
    packageManager: {
      title: 'Quản Lý Packages',
      system: 'Hệ thống',
      unload: 'Unload',
      load: 'Load',
      noCustom: 'Chưa có package tự tạo nào',
      confirmDelete: 'Xóa vĩnh viễn package "{name}" và tất cả linh kiện bên trong?',
      colorsTitle: 'Quản Lý Gói Màu (Palettes)',
      noPalettes: 'Chưa có gói màu tùy biến nào'
    },
    search: {
      noResults: 'Không tìm thấy linh kiện phù hợp.',
      customMatch: 'Custom Sprites Trùng Khớp',
      defaultMatch: 'Default Sprites Trùng Khớp'
    },
    package: {
      empty: 'Không có linh kiện nào trong package này.',
      noLoaded: 'Hãy nạp ít nhất một package để xem linh kiện.'
    }
  },
  toasts: {
    profileSaved: 'Đã lưu profile thành công!',
    profileImported: 'Đã nạp thành công profile "{name}"!',
  },
  dialogs: {
    resetConfirm: 'Khôi phục toàn bộ studio về dự án mẫu mặc định?',
    resetSuccess: 'Đã khôi phục về dự án mẫu Cyberpunk Neon thành công!',
    resetFailEmpty: 'Đã xóa sạch toàn bộ dự án về trạng thái trống.'
  }
};

export default vi;
