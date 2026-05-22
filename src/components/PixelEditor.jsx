import { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import { PALETTES, DEFAULT_SPRITES } from '../utils/nyanRenderer';
import { Trash2, Plus, Minus, RefreshCw, Copy, Save } from 'lucide-react';

const COLOR_LABELS = {
  0: 'Eraser (Transparent)',
  1: 'Outline (Black)',
  2: 'Cat Skin (Grey/Theme)',
  3: 'Cat Dark Skin (Shadow)',
  4: 'Toast Crust',
  5: 'Frosting (Pink/Flavor)',
  6: 'Sprinkles (Hot Pink)',
  7: 'Eye White',
  8: 'Cheek Pink'
};

export default function PixelEditor({ editingPartKey, onClose }) {
  const { 
    customParts, 
    saveCustomPart, 
    deleteCustomPart, 
    getDefaultSpriteData, 
    settings, 
    liveEditingPartRef,
    bindPartToSlot,
    bindings,
    setToastMessage,
    loadedPackages,
    t
  } = useContext(AppContext);

  const isReadOnly = !!(editingPartKey && DEFAULT_SPRITES[editingPartKey] && !customParts[editingPartKey]);

  // Editor states
  const [partName, setPartName] = useState('My_Custom_Part');
  const [gridWidth, setGridWidth] = useState(16);
  const [gridHeight, setGridHeight] = useState(13);
  const [gridData, setGridData] = useState(() =>
    Array(13).fill().map(() => Array(16).fill(0))
  );
  const [selectedSlot, setSelectedSlot] = useState('none');

  const [packageName, setPackageName] = useState('My Custom');
  const [isCreatingNewPackage, setIsCreatingNewPackage] = useState(false);
  const [newPackageName, setNewPackageName] = useState('');

  const uniquePackages = Array.from(
    new Set([
      ...Object.values(customParts).map((p) => p.package || 'My Custom'),
      ...(loadedPackages || [])
    ])
  ).filter((p) => p !== 'Nyan Cat');

  // Sync the currently editing grid with AppContext's liveEditingPartRef in real-time
  useEffect(() => {
    if (liveEditingPartRef) {
      const key = partName.trim().replace(/\s+/g, '_').toLowerCase();
      liveEditingPartRef.current = { key, data: gridData };
    }
  }, [partName, gridData, liveEditingPartRef]);
  
  const [activeColor, setActiveColor] = useState(1); // Default to black outline
  const [isDrawing, setIsDrawing] = useState(false);
  const [presetTemplate, setPresetTemplate] = useState('HEAD_OPEN');

  const gridContainerRef = useRef(null);

  // Apply a template to the editor grid
  const loadTemplate = useCallback((templateKey) => {
    const preset = getDefaultSpriteData(templateKey);
    setGridWidth(preset.width);
    setGridHeight(preset.height);
    setGridData(preset.data);
    setPartName(`custom_${templateKey.toLowerCase()}`);
  }, [getDefaultSpriteData]);

  // Run on mount or when editingPartKey changes to load either template, custom part, or default template sprite
  useEffect(() => {
    if (editingPartKey) {
      const part = customParts[editingPartKey];
      if (part) {
        setPartName(part.name);
        setGridWidth(part.width);
        setGridHeight(part.height);
        setGridData(JSON.parse(JSON.stringify(part.data)));
        setPackageName(part.package || 'My Custom');
        setIsCreatingNewPackage(false);
        
        // Auto-detect if this part is bound to any slot
        let foundSlot = 'none';
        const isHeadOpen = bindings.HEAD_OPEN === editingPartKey;
        const isHeadBlink = bindings.HEAD_BLINK === editingPartKey;
        const isTailUp = bindings.TAIL_UP === editingPartKey;
        const isTailMid = bindings.TAIL_MID === editingPartKey;
        const isTailDown = bindings.TAIL_DOWN === editingPartKey;
        const isLegDown = bindings.LEG_DOWN === editingPartKey;
        const isLegFront = bindings.LEG_FRONT === editingPartKey;
        const isLegBack = bindings.LEG_BACK === editingPartKey;

        if (isHeadOpen && isHeadBlink) foundSlot = 'HEAD_ALL';
        else if (isTailUp && isTailMid && isTailDown) foundSlot = 'TAIL_ALL';
        else if (isLegDown && isLegFront && isLegBack) foundSlot = 'LEG_ALL';
        else if (isHeadOpen) foundSlot = 'HEAD_OPEN';
        else if (isHeadBlink) foundSlot = 'HEAD_BLINK';
        else if (bindings.POPTART === editingPartKey) foundSlot = 'POPTART';
        else if (isTailUp) foundSlot = 'TAIL_UP';
        else if (isTailMid) foundSlot = 'TAIL_MID';
        else if (isTailDown) foundSlot = 'TAIL_DOWN';
        else if (isLegDown) foundSlot = 'LEG_DOWN';
        else if (isLegFront) foundSlot = 'LEG_FRONT';
        else if (isLegBack) foundSlot = 'LEG_BACK';
        
        setSelectedSlot(foundSlot);
      } else if (DEFAULT_SPRITES[editingPartKey]) {
        // Load default template sprite data
        const preset = getDefaultSpriteData(editingPartKey);
        setGridWidth(preset.width);
        setGridHeight(preset.height);
        setGridData(preset.data);
        setPartName(editingPartKey);
        setPackageName('Nyan Cat');
        setIsCreatingNewPackage(false);

        // Pre-select slot if name matches exactly
        let foundSlot = 'none';
        if (bindings[editingPartKey] !== undefined || editingPartKey === 'POPTART') {
          foundSlot = editingPartKey;
        }
        setSelectedSlot(foundSlot);
      }
    } else {
      loadTemplate('HEAD_OPEN');
      setPackageName('My Custom');
      setIsCreatingNewPackage(false);
    }
  }, [editingPartKey, customParts, bindings, loadTemplate, getDefaultSpriteData]);

  // Get current palette color values for display
  const skin = PALETTES.skins[settings.skinStyle] || PALETTES.skins.classic;
  const pop  = PALETTES.poptarts[settings.poptartStyle] || PALETTES.poptarts.strawberry;

  const colorMap = {
    0: 'transparent',
    1: '#000000',
    2: settings.customSkinColor || skin.fill,
    3: settings.customSkinShadow || skin.shadow,
    4: settings.customCrustColor || pop.crust,
    5: settings.customFrostingColor || pop.frosting,
    6: settings.customSprinkleColor || pop.sprinkle,
    7: '#ffffff',
    8: '#ff9999'
  };

  // Handle grid size adjustment (preserving existing pixels)
  const handleGridResize = (dimension, amount) => {
    if (isReadOnly) return;
    if (dimension === 'width') {
      const nextW = Math.max(3, Math.min(40, gridWidth + amount));
      const nextGrid = gridData.map((row) => {
        if (amount > 0) {
          // Pad with 0s
          return [...row, ...Array(amount).fill(0)];
        } else {
          // Crop
          return row.slice(0, nextW);
        }
      });
      setGridWidth(nextW);
      setGridData(nextGrid);
    } else if (dimension === 'height') {
      const nextH = Math.max(3, Math.min(40, gridHeight + amount));
      let nextGrid;
      if (amount > 0) {
        // Pad rows with 0s
        nextGrid = [
          ...gridData,
          ...Array(amount).fill().map(() => Array(gridWidth).fill(0))
        ];
      } else {
        // Crop rows
        nextGrid = gridData.slice(0, nextH);
      }
      setGridHeight(nextH);
      setGridData(nextGrid);
    }
  };

  // Draw pixel logic
  const drawPixel = (r, c) => {
    if (isReadOnly) return;
    const nextGrid = gridData.map((row, ri) =>
      row.map((val, ci) => (ri === r && ci === c ? activeColor : val))
    );
    setGridData(nextGrid);
  };

  const handleMouseDown = (r, c) => {
    if (isReadOnly) return;
    setIsDrawing(true);
    drawPixel(r, c);
  };

  const handleMouseEnter = (r, c) => {
    if (isReadOnly) return;
    if (isDrawing) {
      drawPixel(r, c);
    }
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDrawing(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  // Save the custom part
  const handleSave = () => {
    if (isReadOnly) return;
    if (!partName.trim()) {
      setToastMessage(t('pixelEditor.errors.missingName') || '⚠️ Vui lòng nhập tên bộ phận!');
      return;
    }

    const finalPackage = isCreatingNewPackage ? newPackageName.trim() : packageName;
    if (isCreatingNewPackage && !finalPackage) {
      setToastMessage(t('pixelEditor.errors.missingPackageName') || '⚠️ Vui lòng nhập tên package mới!');
      return;
    }

    const key = saveCustomPart(partName, gridWidth, gridHeight, gridData, finalPackage || 'My Custom');
    
    // Auto-bind to selected motion slot
    if (selectedSlot !== 'none') {
      if (selectedSlot === 'HEAD_ALL') {
        bindPartToSlot('HEAD_OPEN', key);
        bindPartToSlot('HEAD_BLINK', key);
      } else if (selectedSlot === 'TAIL_ALL') {
        bindPartToSlot('TAIL_UP', key);
        bindPartToSlot('TAIL_MID', key);
        bindPartToSlot('TAIL_DOWN', key);
      } else if (selectedSlot === 'LEG_ALL') {
        bindPartToSlot('LEG_DOWN', key);
        bindPartToSlot('LEG_FRONT', key);
        bindPartToSlot('LEG_BACK', key);
      } else {
        bindPartToSlot(selectedSlot, key);
      }
      setToastMessage(t('pixelEditor.toasts.savedAndBound', { name: partName }) || `💾 Đã lưu "${partName}" và tự động gán vào chuyển động!`);
    } else {
      setToastMessage(t('pixelEditor.toasts.savedToLibrary', { name: partName }) || `💾 Đã lưu "${partName}" vào thư viện linh kiện thành công!`);
    }
  };

  // Delete part
  const handleDelete = () => {
    if (isReadOnly || !editingPartKey || !customParts[editingPartKey]) return;
    const part = customParts[editingPartKey];
    if (window.confirm(t('pixelEditor.confirm.deletePart', { name: part.name }) || `Xóa bộ phận "${part.name}" khỏi thư viện?`)) {
      deleteCustomPart(editingPartKey);
      setToastMessage(t('pixelEditor.toasts.deleted', { name: part.name }) || `❌ Đã xóa bộ phận "${part.name}" khỏi thư viện.`);
      if (onClose) onClose();
    }
  };

  // Reset current grid to transparent
  const handleClear = () => {
    if (isReadOnly) return;
    if (window.confirm(t('pixelEditor.confirm.clearGrid') || 'Xóa sạch lưới vẽ hiện tại?')) {
      setGridData(Array(gridHeight).fill().map(() => Array(gridWidth).fill(0)));
    }
  };

  // Generate Javascript array code representation
  const getGridCode = () => {
    const formattedRows = gridData.map(row => `  [${row.join(',')}]`).join(',\n');
    return `const ${partName.toUpperCase().replace(/[^A-Z0-9]/g, '_')} = [\n${formattedRows}\n];`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getGridCode());
    setToastMessage(t('pixelEditor.toasts.copiedCode') || '📋 Đã copy mã ma trận 2D vào Clipboard!');
  };

  return (
    <div className="editor-tab-layout">
      {/* Editor Main Canvas Workspace */}
      <div className="editor-canvas-container glass-card">
        <div className="editor-card-header">
          <div className="header-meta">
            <span className="card-tag">
              {isReadOnly ? `🔒 ${t('pixelEditor.readOnlyTag') || 'MẪU MẶC ĐỊNH - CHỈ XEM'}` : t('pixelEditor.canvasTag') || 'CANVAS'}
            </span>
            <h2>
              {isReadOnly 
                ? `${partName} (${t('pixelEditor.readOnlyLabel') || 'Chế độ chỉ xem'})` 
                : (t('pixelEditor.canvasTitle', { w: gridWidth, h: gridHeight }) || `Pixel Workspace (${gridWidth} × {gridHeight})`)
              }
            </h2>
          </div>
          {!isReadOnly && (
            <div className="header-actions">
              <div className="preset-selector">
                <span className="label-text">{t('pixelEditor.loadTemplate') || 'Load Template:'}</span>
                <select
                  className="select-custom"
                  value={presetTemplate}
                  onChange={(e) => {
                    setPresetTemplate(e.target.value);
                    loadTemplate(e.target.value);
                  }}
                >
                  <option value="HEAD_OPEN">Cat Head (Open)</option>
                  <option value="HEAD_BLINK">Cat Head (Blink)</option>
                  <option value="POPTART">Pop-Tart Toast Body</option>
                  <option value="TAIL_UP">Tail (Upward)</option>
                  <option value="TAIL_MID">Tail (Horizontal)</option>
                  <option value="TAIL_DOWN">Tail (Downward)</option>
                  <option value="LEG_DOWN">Leg (Straight)</option>
                  <option value="LEG_FRONT">Leg (Kick Front)</option>
                  <option value="LEG_BACK">Leg (Kick Back)</option>
                </select>
              </div>
              <button className="btn btn-secondary btn-small" onClick={handleClear}>
                <RefreshCw size={14} /> {t('pixelEditor.btnClear') || 'Reset Clear'}
              </button>
            </div>
          )}
        </div>

        {/* The Grid Board */}
        <div className="workspace-scroll-area">
          <div
            className="pixel-art-grid-board"
            ref={gridContainerRef}
            style={{
              '--cols': gridWidth,
              '--rows': gridHeight,
              pointerEvents: isReadOnly ? 'none' : 'auto'
            }}
          >
            {gridData.map((row, r) =>
              row.map((val, c) => (
                <div
                  key={`${r}-${c}`}
                  className="pixel-cell"
                  style={{
                    backgroundColor: val === 0 ? 'transparent' : colorMap[val],
                    boxShadow: val === 0 ? 'inset 0 0 0 1px rgba(255,255,255,0.06)' : 'none'
                  }}
                  onMouseDown={() => handleMouseDown(r, c)}
                  onMouseEnter={() => handleMouseEnter(r, c)}
                />
              ))
            )}
          </div>
        </div>

        <div className="drag-hint font-sans">
          {isReadOnly 
            ? `🔒 ${t('pixelEditor.readOnlyGridHint') || 'Sprite mặc định ở chế độ chỉ đọc. Sử dụng bảng live export code bên phải để copy matrix.'}`
            : `💡 ${t('pixelEditor.dragHint') || 'Click chuột trái để tô màu. Nhấn giữ chuột trái và rê vẽ để tô hàng loạt nhanh chóng.'}`
          }
        </div>
      </div>

      {/* Editor Customizer Sidebar Panel */}
      <div className="editor-control-panel glass-card">
        {isReadOnly ? (
          <div className="panel-section font-sans" style={{
            padding: '16px',
            background: 'rgba(0, 229, 255, 0.03)',
            border: '1px solid rgba(0, 229, 255, 0.15)',
            borderRadius: '8px',
            marginBottom: '16px',
            boxShadow: '0 4px 15px rgba(0, 229, 255, 0.05)'
          }}>
            <h3 style={{ color: 'var(--color-primary-glow, #00e5ff)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0, marginBottom: '10px', fontSize: '14px' }}>
              <span>🔒</span> {t('pixelEditor.readOnlyTitle') || 'Sprite Mặc Định - Chỉ Xem & Copy Matrix'}
            </h3>
            <p style={{ fontSize: '12px', color: '#a0aab5', lineHeight: '1.6', margin: '0 0 10px 0' }}>
              {t('pixelEditor.readOnlyNotice') || 'Đây là linh kiện hệ thống mặc định của Nyan Cat. Bạn không thể chỉnh sửa, lưu đè hay xóa linh kiện này.'}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--color-primary-glow, #00e5ff)', fontWeight: 'bold', margin: 0 }}>
              {t('pixelEditor.readOnlyCopyTip') || '💡 Bạn có thể copy mã nguồn ma trận 2D ở dưới để sử dụng hoặc tạo biến thể riêng!'}
            </p>
          </div>
        ) : (
          <div className="panel-section">
            <h3>1. {t('pixelEditor.sectionSaveTitle') || 'Save Part Details'}</h3>
            <div className="input-group">
              <label>{t('pixelEditor.partNameLabel') || 'Name (English Keys Recommended)'}</label>
              <input
                type="text"
                className="input-text"
                value={partName}
                onChange={(e) => setPartName(e.target.value)}
                placeholder="e.g. laser_head_style"
              />
            </div>

            {/* Gói linh kiện (Package) selection */}
            <div className="input-group" style={{ marginTop: '12px' }}>
              <label>{t('pixelEditor.packageLabel') || 'Gói linh kiện (Package)'}</label>
              <select
                className="select-custom"
                value={isCreatingNewPackage ? "__NEW__" : packageName}
                onChange={(e) => {
                  if (e.target.value === "__NEW__") {
                    setIsCreatingNewPackage(true);
                  } else {
                    setIsCreatingNewPackage(false);
                    setPackageName(e.target.value);
                  }
                }}
                style={{ width: '100%', boxSizing: 'border-box' }}
              >
                {uniquePackages.map((pkg) => (
                  <option key={pkg} value={pkg}>📦 {pkg}</option>
                ))}
                <option value="__NEW__">➕ {t('pixelEditor.newPackageOption') || 'Tạo Package Mới...'}</option>
              </select>
            </div>

            {isCreatingNewPackage && (
              <div className="input-group animate-slide-down" style={{ marginTop: '8px' }}>
                <label>{t('pixelEditor.newPackagePlaceholder') || 'Tên Package Mới'}</label>
                <input
                  type="text"
                  className="input-text"
                  value={newPackageName}
                  onChange={(e) => setNewPackageName(e.target.value)}
                  placeholder={t('pixelEditor.newPackageInputPlaceholder') || 'Ví dụ: dog, robot, sword...'}
                />
              </div>
            )}

            <div className="grid-resizers">
              <div className="resize-box">
                <span className="resize-title">{t('pixelEditor.width') || 'Width'}</span>
                <div className="spinner-controls">
                  <button className="spinner-btn" onClick={() => handleGridResize('width', -1)}>
                    <Minus size={14} />
                  </button>
                  <span className="spinner-val">{gridWidth}</span>
                  <button className="spinner-btn" onClick={() => handleGridResize('width', 1)}>
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              <div className="resize-box">
                <span className="resize-title">{t('pixelEditor.height') || 'Height'}</span>
                <div className="spinner-controls">
                  <button className="spinner-btn" onClick={() => handleGridResize('height', -1)}>
                    <Minus size={14} />
                  </button>
                  <span className="spinner-val">{gridHeight}</span>
                  <button className="spinner-btn" onClick={() => handleGridResize('height', 1)}>
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>

            <div className="input-group" style={{ marginTop: '14px', marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                🎬 {t('pixelEditor.motionSlotLabel') || 'Gán Chuyển Động (Motion Slot)'}
              </label>
              <select
                className="select-custom"
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--color-border-glow)', borderRadius: '4px', color: '#fff', padding: '8px 10px', fontSize: '12px' }}
              >
                <option value="none">❌ {t('pixelEditor.motionNone') || 'Không gán chuyển động'}</option>
                <optgroup label="🐱 ĐẦU MÈO (HEAD)">
                  <option value="HEAD_ALL">🌟 {t('pixelEditor.motionHeadAll') || 'Tất cả trạng thái Đầu (Mở & Nhắm)'}</option>
                  <option value="HEAD_OPEN">👁️ {t('pixelEditor.motionHeadOpen') || 'Mắt Mở (HEAD_OPEN)'}</option>
                  <option value="HEAD_BLINK">😑 {t('pixelEditor.motionHeadBlink') || 'Mắt Nhắm (HEAD_BLINK)'}</option>
                </optgroup>
                <optgroup label="🥞 THÂN BÁNH (BODY)">
                  <option value="POPTART">🍪 {t('pixelEditor.motionPoptart') || 'Thân bánh Pop-Tart (POPTART)'}</option>
                </optgroup>
                <optgroup label="🐕 ĐUÔI MÈO (TAIL)">
                  <option value="TAIL_ALL">🌟 {t('pixelEditor.motionTailAll') || 'Tất cả trạng thái Đuôi (Lên/Ngang/Xuống)'}</option>
                  <option value="TAIL_UP">⬆️ {t('pixelEditor.motionTailUp') || 'Đuôi hướng lên (TAIL_UP)'}</option>
                  <option value="TAIL_MID">➡️ {t('pixelEditor.motionTailMid') || 'Đuôi nằm ngang (TAIL_MID)'}</option>
                  <option value="TAIL_DOWN">⬇️ {t('pixelEditor.motionTailDown') || 'Đuôi hướng xuống (TAIL_DOWN)'}</option>
                </optgroup>
                <optgroup label="🦵 CHÂN MÈO (LEGS)">
                  <option value="LEG_ALL">🌟 {t('pixelEditor.motionLegAll') || 'Tất cả các Chân (Đứng/Trước/Sau)'}</option>
                  <option value="LEG_DOWN">⬇️ {t('pixelEditor.motionLegDown') || 'Chân thẳng đứng (LEG_DOWN)'}</option>
                  <option value="LEG_FRONT">↗️ {t('pixelEditor.motionLegFront') || 'Chân co trước (LEG_FRONT)'}</option>
                  <option value="LEG_BACK">↖️ {t('pixelEditor.motionLegBack') || 'Chân co sau (LEG_BACK)'}</option>
                </optgroup>
              </select>
            </div>

            {/* Cyberpunk Dynamic Motion Info Card */}
            {selectedSlot === 'none' ? (
              <div className="custom-motion-info-card font-sans" style={{
                marginBottom: '16px',
                padding: '12px',
                background: 'rgba(0, 229, 255, 0.05)',
                border: '1px solid rgba(0, 229, 255, 0.2)',
                borderRadius: '8px',
                fontSize: '11px',
                lineHeight: '1.6',
                color: '#d0d9e0',
                boxShadow: '0 4px 15px rgba(0, 229, 255, 0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00e5ff', fontWeight: 'bold', marginBottom: '6px', fontSize: '12px' }}>
                  <span>💡</span>
                  <span>{t('pixelEditor.motionFreeTitle') || 'Dành Cho Mô Hình Tự Do (Dog, Robot, Chim...)'}</span>
                </div>
                <p style={{ margin: '0 0 8px 0', color: '#a0aab5' }}>
                  {t('pixelEditor.motionFreeDesc1') || 'Chọn "Không gán chuyển động" khi vẽ linh kiện của các mô hình tự do. Sau khi lưu, bạn sẽ thiết lập chuyển động riêng cho nó ở trang Assembler:'}
                </p>
                <div style={{ borderTop: '1px dashed rgba(0, 229, 255, 0.15)', paddingTop: '8px', marginTop: '4px' }}>
                  <strong style={{ color: '#00e5ff', display: 'block', marginBottom: '6px' }}>{t('pixelEditor.motionFreeStepTitle') || 'Luồng tạo chuyển động tịnh tiến & hoán đổi part:'}</strong>
                  <ol style={{ margin: 0, paddingLeft: '14px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <li>{t('pixelEditor.motionFreeStep1') || 'Vẽ các trạng thái linh kiện (ví dụ: vẽ mắt mở dog_head_open và mắt nhắm dog_head_blink) rồi lưu lại.'}</li>
                    <li>{t('pixelEditor.motionFreeStep2') || 'Click nút 🚀 Custom Model Assembler ở thanh tiêu đề trên cùng để mở Studio lắp ráp.'}</li>
                    <li>{t('pixelEditor.motionFreeStep3') || 'Tạo mới Profile (ví dụ: "DOG PROFILE").'}</li>
                    <li>{t('pixelEditor.motionFreeStep4') || 'Thêm linh kiện chính (ví dụ: dog_head_open) vào Canvas dưới dạng một Layer.'}</li>
                    <li>{t('pixelEditor.motionFreeStep5') || 'Tại cột điều chỉnh bên phải, tích chọn KÍCH HOẠT ở mục 🎭 Hoạt Ảnh & Chuyển Động Riêng.'}</li>
                    <li>{t('pixelEditor.motionFreeStep6') || 'Thiết lập frame-by-frame: Ở mỗi Frame, tùy ý tịnh tiến tọa độ (dx, dy) hoặc hoán đổi linh kiện hiển thị (Part Swap, ví dụ đổi sang dog_head_blink ở Frame 2 để nhắm mắt).'}</li>
                    <li>{t('pixelEditor.motionFreeStep7') || 'Bật ▶️ Chạy Thử Hoạt Ảnh ở góc trên Workspace để xem mô hình chuyển động thời gian thực ở tốc độ 6 FPS!'}</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="custom-motion-info-card font-sans" style={{
                marginBottom: '16px',
                padding: '12px',
                background: 'rgba(255, 0, 127, 0.05)',
                border: '1px solid rgba(255, 0, 127, 0.15)',
                borderRadius: '8px',
                fontSize: '11px',
                lineHeight: '1.6',
                color: '#f0d0e0',
                boxShadow: '0 4px 15px rgba(255, 0, 127, 0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ff007f', fontWeight: 'bold', marginBottom: '6px', fontSize: '12px' }}>
                  <span>⚡</span>
                  <span>{t('pixelEditor.motionOverrideTitle') || 'Ghi Đè Chuyển Động Mặc Định Nyan Cat'}</span>
                </div>
                <p style={{ margin: '0 0 6px 0', color: '#d0a5bd' }}>
                  {t('pixelEditor.motionOverrideDesc1', { slot: selectedSlot }) || `Linh kiện này sẽ tự động thay thế bộ phận mặc định tương ứng của chú mèo Nyan Cat ở vị trí ${selectedSlot}.`}
                </p>
                <p style={{ margin: 0, color: '#ff007f', fontWeight: 'bold' }}>
                  {t('pixelEditor.motionOverrideDesc2') || '💡 Chú mèo Nyan Cat trên Dashboard sẽ tự động co duỗi và chuyển động linh kiện mới này theo đúng quỹ đạo nhún nhảy mặc định!'}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave}>
                <Save size={16} style={{ marginRight: 6 }} /> {t('pixelEditor.btnSave') || 'Save to My Library'}
              </button>
              {editingPartKey && customParts[editingPartKey] && (
                <button 
                  className="btn btn-secondary" 
                  style={{ background: 'rgba(255, 0, 85, 0.1)', border: '1px solid rgba(255, 0, 85, 0.5)', color: '#ff3366', padding: '0 12px' }} 
                  onClick={handleDelete}
                  title={t('pixelEditor.btnDelete') || 'Xóa bộ phận này'}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Color Brushes List */}
        {!isReadOnly && (
          <div className="panel-section">
            <h3>2. {t('pixelEditor.sectionBrushTitle') || 'Select Paint Brush'}</h3>
            <div className="brushes-grid">
              {Object.keys(COLOR_LABELS).map((colorIdxStr) => {
                const idx = parseInt(colorIdxStr);
                return (
                  <div
                    key={idx}
                    className={`brush-item-card ${activeColor === idx ? 'active' : ''}`}
                    onClick={() => setActiveColor(idx)}
                  >
                    <div
                      className={`brush-color-preview-box color-${idx}`}
                      style={{
                        backgroundColor: idx === 0 ? 'transparent' : colorMap[idx],
                        border: idx === 0 ? '1px dashed #ffffff44' : 'none'
                      }}
                    />
                    <div className="brush-meta">
                      <span className="brush-number">#{idx}</span>
                      <span className="brush-label">{COLOR_LABELS[idx]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Live Matrix Exporter */}
        <div className="panel-section">
          <div className="section-header-compact">
            <h3>3. {t('pixelEditor.sectionExportTitle') || 'Live Export Array Code'}</h3>
            <button className="btn-icon-link" onClick={copyToClipboard} title="Copy code">
              <Copy size={14} /> {t('pixelEditor.btnCopy') || 'Copy'}
            </button>
          </div>
          <textarea className="textarea-code" readOnly value={getGridCode()} />
        </div>
      </div>
    </div>
  );
}
