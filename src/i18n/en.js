const en = {
  lang: {
    vi: 'Vietnamese',
    en: 'English'
  },
  app: {
    brand: 'NYAN CAT STUDIO',
    widescreenEdition: 'WIDESCREEN EDITION',
    assemblerStudio: 'ASSEMBLER STUDIO',
    customModelCreator: 'CUSTOM MODEL CREATOR',
    resolutionTag: 'PC CASE MONITOR COMPATIBLE (1920 × 462 NATIVE)',
    assemblerResolutionTag: 'FREE ASSEMBLY & LAYER Z-INDEX COMPOSITOR',
    backToDashboard: '⬅️ Back to Dashboard',
    goAssembler: '🚀 Custom Model Assembler',
    tabs: {
      editor: '1. PIXEL ART CREATOR',
      export: '2. CAPTURE TO VIDEO'
    }
  },
  settings: {
    language: 'Language'
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
    noProfilesHint: 'No profiles yet. Create one in Assembler Studio!',
    chooseProfile: '-- Select profile --',
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
    motionBindingsDesc: 'Bind your custom sprites (My Custom Sprites) into Nyan Cat motion slots.',
    defaultSprite: 'Default Sprite (Default)',
    paletteTitle: 'Palette Manager',
    paletteDesc: 'Load custom color palette packages from external JSON files.',
    btnImportPalette: 'Import Palette JSON',
    btnCreatePalette: '➕ Create Palette',
    paletteCreatorTitle: 'Design New Color Palette',
    btnAddColor: '➕ Add Color',
    btnSaveAndExport: '💾 Save & Get JSON',
    tooltipExportPalette: 'Download palette JSON to computer',
    loadedPalettes: 'Loaded palettes'
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
      missingName: 'Please enter part name!',
      saveFailed: 'Save failed: {error}',
      invalidPalette: '⚠️ Invalid JSON! Must contain keys 1-8 pointing to hex color codes.',
      paletteParseError: '❌ Error parsing custom palette JSON!',
      missingPaletteName: '⚠️ Please enter a palette name!'
    },
    confirm: {
      deletePart: 'Delete part "{name}" from library? This also removes it from layers/animations using it.',
      clearGrid: 'Clear current drawing grid?',
      deletePalette: 'Do you want to unload custom palette "{name}" from the list?'
    },
    toasts: {
      savedAndBound: '💾 Saved "{name}" and auto-bound to motion slot!',
      savedToLibrary: '💾 Saved "{name}" to library!',
      deleted: '🗑️ Deleted "{name}".',
      copiedCode: '📋 Copied 2D matrix code to clipboard!',
      paletteLoaded: '🎨 Loaded custom palette "{name}" successfully!',
      paletteExported: '📤 Exported custom palette successfully!',
      paletteDeleted: '🗑️ Unloaded custom palette "{name}".',
      paletteSaved: '🎨 Saved palette "{name}" to library!',
      colorSelected: '🎨 Selected color brush #{index}',
      colorAdded: '🎨 Added new color brush #{index}!'
    },
    colors: {
      0: 'Eraser (Transparent)',
      1: 'Outline (Black)',
      2: 'Cat Skin (Grey/Theme)',
      3: 'Cat Dark Skin (Shadow)',
      4: 'Toast Crust',
      5: 'Frosting (Pink/Flavor)',
      6: 'Sprinkles (Hot Pink)',
      7: 'Eye White',
      8: 'Cheek Pink'
    },
    loadTemplateLabel: 'Load Template:',
    templateOptions: {
      headOpen: 'Cat Head (Open)',
      headBlink: 'Cat Head (Blink)',
      poptart: 'Pop-Tart Toast Body',
      tailUp: 'Tail (Upward)',
      tailMid: 'Tail (Horizontal)',
      tailDown: 'Tail (Downward)',
      legDown: 'Leg (Straight)',
      legFront: 'Leg (Kick Front)',
      legBack: 'Leg (Kick Back)'
    },
    btnResetClear: 'Reset Clear',
    canvasHint: '💡 Left-click to draw. Hold left-click and drag to paint multiple pixels quickly.',
    section1Title: '1. Save Part Details',
    labelName: 'Name (English Keys Recommended)',
    namePlaceholder: 'e.g. laser_head_style',
    labelWidth: 'Width',
    labelHeight: 'Height',
    motionSlotLabel: '🎬 Motion Slot Binding',
    motionSlot: {
      none: '❌ Do not bind to motion',
      headGroup: '🐱 CAT HEAD (HEAD)',
      headAll: '🌟 All Head States (Open & Blink)',
      headOpen: '👁️ Eyes Open (HEAD_OPEN)',
      headBlink: '😑 Eyes Closed (HEAD_BLINK)',
      bodyGroup: '🥞 TOAST BODY (BODY)',
      poptart: '🍪 Pop-Tart Toast Body (POPTART)',
      tailGroup: '🐕 CAT TAIL (TAIL)',
      tailAll: '🌟 All Tail States (Up/Mid/Down)',
      tailUp: '⬆️ Tail Upward (TAIL_UP)',
      tailMid: '➡️ Tail Horizontal (TAIL_MID)',
      tailDown: '⬇️ Tail Downward (TAIL_DOWN)',
      legGroup: '🦵 CAT LEGS (LEGS)',
      legAll: '🌟 All Legs (Straight/Front/Back)',
      legDown: '⬇️ Leg Straight Down (LEG_DOWN)',
      legFront: '↗️ Leg Kick Front (LEG_FRONT)',
      legBack: '↖️ Leg Kick Back (LEG_BACK)'
    },
    freeModelCard: {
      title: '💡 For Free-Assembly Models (Dog, Robot, Bird...)',
      intro: 'Choose "Do not bind to motion" when drawing components for free-assembly models. After saving, you will configure its custom animations in the Assembler studio:',
      workflowTitle: 'Workflow for pixel translations & part swaps:',
      step1: 'Draw the different part states (e.g. draw eyes open dog_head_open and eyes closed dog_head_blink) and save them.',
      step2: 'Click the 🚀 Custom Model Assembler button on the top header to open the assembly workspace.',
      step3: 'Create a new Profile (e.g. "DOG PROFILE").',
      step4: 'Add the base component (e.g. dog_head_open) to the Canvas as a Layer.',
      step5: 'In the right adjustment panel, check ENABLE under 🎭 Custom Motion & Animation.',
      step6: 'Configure frame-by-frame: For each Frame, translate coordinates (dx, dy) or swap the active sprite (Part Swap, e.g. switch to dog_head_blink on Frame 2 to make it blink).',
      step7: 'Turn on ▶️ Preview Animation at the top of the workspace to watch the model animate in real-time at 6 FPS!'
    },
    overrideCard: {
      title: '⚡ Override Default Nyan Cat Animation',
      body: 'This part will automatically replace the corresponding default sprite of Nyan Cat at the {slot} slot.',
      note: '💡 The Nyan Cat on the Dashboard will automatically animate and stretch this custom part using the default bobbing rhythm!'
    },
    btnSave: 'Save to My Library',
    btnDelete: 'Delete Part',
    sectionPaletteTitle: 'Custom Color Palette',
    defaultPalette: 'Default Nyan Theme (Dynamic)',
    btnExportPalette: 'Export Palette JSON',
    btnDeletePalette: 'Unload Palette',
    btnImportPalette: 'Import Palette (.json)',
    btnSavePalette: 'Save Palette',
    savePalettePlaceholder: 'Palette package name...',
    templateColorsLabel: 'Template Palette Colors (Click to add):',
    btnApplyPalette: 'Apply All',
    btnAddBrush: 'Add New Color Brush',
    sectionBrushTitle: 'Select Paint Brush',
    brushHint: '💡 Click the color box of any brush to edit with a custom color!',
    tooltipColorPicker: 'Click to select custom color',
    sectionExportTitle: 'Live Export Array Code',
    btnCopy: 'Copy'
  },
  exportPanel: {
    importSuccess: 'Project imported successfully!',
    importError: 'Error: invalid file format. {error}',
    alert: {
      zipSuccess: 'Sprites ZIP PNG frames package downloaded successfully!',
      zipError: 'ZIP export failed: {message}',
      noCanvas: 'Live Canvas recorder stream not found!'
    },
    record: {
      statusInit: 'Initializing Canvas Stream...',
      statusCompressing: 'Compressing WebM video...',
      statusRecording: 'Recording canvas frames...',
      durationLabel: 'Duration:',
      duration5s: '5 Seconds (Light)',
      duration10s: '10 Seconds (Recommended)',
      duration20s: '20 Seconds (High Quality)',
      btnRecord: 'Record WebM Video'
    },
    tags: {
      projectRestore: 'PROJECT / RESTORE',
      pngPack: 'PNG PACK',
      video: 'VIDEO'
    },
    card1Title: 'Save & Load Project File',
    card1Desc: 'Export or import all drawing data, assembled layers (z-index), and motion bindings into a single JSON file (English keys). Safe and easy to share.',
    exportJson: 'Export JSON Project',
    importJson: 'Import JSON Project',
    card2Title: 'Export Custom PNG Frames',
    card2Desc: 'Download each animation frame as transparent PNG files bundled in a single ZIP.',
    downloadZip: 'Download Sprite ZIP',
    card3Title: 'Record Lossless WebM',
    card3Desc: 'Record the Canvas preview at 1920x462, 24 FPS, high-quality 6 Mbps. Works for both Nyan Cat and assembled layer scenes.',
    paletteTitle: 'Palette Manager',
    paletteDesc: 'Load custom color palette packages from JSON files to design parts with unified theme colors.',
    btnImportPalette: 'Import Palette JSON',
    loadedPalettes: 'Loaded palettes',
    ffmpeg: {
      title: '💡 Looping MP4 Conversion Pipeline for Aida64 / Wallpaper Engine',
      intro: 'Due to hardware acceleration and browser licensing limits on H.264 MP4 exports, the canvas recorder outputs high-fidelity Lossless WebM files. You can convert it to a looping MP4 file using two methods:',
      method1Badge: 'Method 1',
      method1Title: 'Use the included Batch Script:',
      method1Body: 'Move the downloaded nyan_cat_custom_1920x462.webm into this project directory, then double-click convert_mp4.bat. It will convert it to a high-quality MP4 immediately.',
      method2Badge: 'Method 2',
      method2Title: 'PowerShell / Command Prompt (If FFmpeg is installed):',
      method2Body: 'Open PowerShell in the download directory and run this command:'
    }
  },
  modelAssembler: {
    toast: {
      exportProfileSuccess: 'Downloaded profile "{name}" successfully!',
      driveDisconnected: 'Disconnected Google Drive.',
      driveConnected: 'Connected to Drive ({email})!',
      driveBackupSuccess: 'Backed up all profiles to Google Drive!',
      syncSuccess: 'Synced assembled coordinates & parts to animated model!'
    },
    alert: {
      importProfileSuccess:
        'Profile imported!\n- Added {count} custom parts into your library.',
      importProfileError: 'Unable to import profile: {error}',
      jsonSyntaxError: 'JSON syntax error: {message}',
      noProfileToBackup: 'No profiles to back up to Google Drive!',
      noCloudFileSelected: 'Please select a cloud backup file!',
      cloudRestoreSuccess:
        'Loaded "{filename}" from Google Drive!\nNew profile "{profileName}" restored to local.'
    },
    confirm: {
      disconnectDrive: 'Disconnect Google Drive account?',
      deleteProfile: 'Delete profile "{name}"?'
    },
    prompt: {
      enterWidth: 'Enter width:',
      enterHeight: 'Enter height:'
    },
    toolbar: {
      switchProfile: 'Switch profile:',
      sizeLabel: 'Size:',
      btnPlayPreviewTitle:
        'Preview animations and part swapping directly on the drag-and-drop canvas',
      btnStopPreview: '⏸️ Stop Preview',
      btnPlayPreview: '▶️ Preview Animation',
      btnManageProfileTitle: 'Back to profile manager',
      btnManageProfile: '📂 Manage Profiles',
      btnApplyTitle: 'Sync this assembly structure to the running Nyan Cat animated model',
      btnApply: 'Apply',
      btnSaveTitle: 'Save changes to the current profile',
      btnSave: 'Save Profile'
    },
    canvas: {
      hintDragDrop:
        '💡 Move parts: **Drag & drop** or **Click a part + use arrow keys** (hold Shift to move faster).'
    },
    customParts: {
      btnDraw: '🎨 Draw New Part',
      empty: 'No custom parts in your Library yet.',
      btnDrawNow: '🎨 Draw a Part Now',
      btnEditTitle: 'Edit this part drawing',
      btnEdit: 'Edit'
    },
    defaultSprites: {
      btnEditTitle: 'Edit this default sprite',
      btnEdit: 'Edit',
      btnViewTitle: 'View original matrix source code',
      btnView: 'View/Code'
    },
    motion: {
      heading: '🎭 Custom Motion & Animation',
      toggleOn: 'ENABLE',
      toggleOff: 'OFF',
      fpsHint:
        'The animation loops infinitely at 6 FPS (Bobbing rhythm). You can change the sprite and pixel offsets for each frame.',
      frameTitle: '⚡ FRAME {{index}}',
      labelDx: 'Horizontal offset dx (pixels)',
      labelDy: 'Vertical offset dy (pixels)',
      labelPartSwap: 'Part swap',
      optgroupCustom: 'Drawing library (Custom Parts)',
      optgroupDefault: 'Default sprites (Default)',
      btnAddFrame: '➕ Add Frame',
      btnDeleteLastFrame: '➖ Delete Last Frame'
    },
    layers: {
      emptyHint:
        'No parts on the Canvas yet. Click a part above to add it to the Canvas!',
      btnMoveUpTitle: 'Move forward (increase z-index)',
      btnMoveDownTitle: 'Move backward (decrease z-index)',
      btnHideTitle: 'Hide layer',
      btnShowTitle: 'Show layer',
      btnDuplicateTitle: 'Duplicate layer',
      btnDeleteTitle: 'Delete layer'
    },
    unsavedModal: {
      title: '⚠️ UNSAVED CHANGES',
      body:
        'You have unsaved changes in profile "{{name}}". What would you like to do before continuing?',
      btnSaveAndContinue: '💾 Save changes & Continue',
      btnDiscard: '🗑️ Discard changes',
      btnCancel: '❌ Go back to editing (Cancel)'
    },
    pixelEditor: {
      btnClose: 'Close / Back'
    },
    authModal: {
      title: 'Sign in with Google',
      subtitle: 'to continue syncing Nyan Studio',
      addAccount: '➕ Use another account',
      btnCancel: 'Cancel'
    },
    drivePicker: {
      title: '📁 Google Picker - Select backup file (.json)',
      searchPlaceholder: 'Search backup files on Drive...',
      fileUpdatedAt: 'Updated: {{date}} | {{size}}',
      btnCancel: 'Cancel',
      btnRestore: '📥 Restore record'
    },
    searchPlaceholder: 'Search parts...',
    packageManager: {
      title: 'Package Manager',
      system: 'System',
      unload: 'Unload',
      load: 'Load',
      noCustom: 'No custom packages found',
      confirmDelete: 'Permanently delete package "{name}" and all parts inside?',
      colorsTitle: 'Color Palette Packages',
      noPalettes: 'No custom palettes loaded'
    },
    search: {
      noResults: 'No matching parts found.',
      customMatch: 'Custom Sprites Matches',
      defaultMatch: 'Default Sprites Matches'
    },
    package: {
      empty: 'No parts in this package.',
      noLoaded: 'Please load at least one package to view parts.'
    }
  },
  toasts: {
    profileSaved: 'Profile saved!',
    profileImported: 'Imported profile "{name}"!',
  },
  dialogs: {
    resetConfirm: 'Reset entire studio back to default sample project?',
    resetSuccess: 'Restored Cyberpunk Neon sample project!',
    resetFailEmpty: 'Cleared project to blank state.'
  }
};

export default en;
