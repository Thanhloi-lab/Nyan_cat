import { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import { PALETTES } from '../utils/nyanRenderer';
import { Trash2, Edit2, Plus, Minus, RefreshCw, Copy, Save } from 'lucide-react';

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

export default function PixelEditor() {
  const { 
    customParts, 
    saveCustomPart, 
    deleteCustomPart, 
    getDefaultSpriteData, 
    settings, 
    liveEditingPartRef,
    bindPartToSlot,
    bindings,
    setToastMessage
  } = useContext(AppContext);

  // Editor states
  const [partName, setPartName] = useState('My_Custom_Part');
  const [gridWidth, setGridWidth] = useState(16);
  const [gridHeight, setGridHeight] = useState(13);
  const [gridData, setGridData] = useState(() =>
    Array(13).fill().map(() => Array(16).fill(0))
  );
  const [selectedSlot, setSelectedSlot] = useState('none');

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

  // Run on mount to initialize with HEAD_OPEN template
  useEffect(() => {
    const timer = setTimeout(() => {
      loadTemplate('HEAD_OPEN');
    }, 0);
    return () => clearTimeout(timer);
  }, [loadTemplate]);

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
    const nextGrid = gridData.map((row, ri) =>
      row.map((val, ci) => (ri === r && ci === c ? activeColor : val))
    );
    setGridData(nextGrid);
  };

  const handleMouseDown = (r, c) => {
    setIsDrawing(true);
    drawPixel(r, c);
  };

  const handleMouseEnter = (r, c) => {
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
    if (!partName.trim()) {
      setToastMessage('⚠️ Vui lòng nhập tên bộ phận!');
      return;
    }
    const key = saveCustomPart(partName, gridWidth, gridHeight, gridData);
    
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
      setToastMessage(`💾 Đã lưu "${partName}" và tự động gán vào chuyển động!`);
    } else {
      setToastMessage(`💾 Đã lưu "${partName}" vào thư viện linh kiện thành công!`);
    }
  };

  // Load a saved custom part back into the editor
  const handleLoadCustom = (key) => {
    const part = customParts[key];
    if (part) {
      setPartName(part.name);
      setGridWidth(part.width);
      setGridHeight(part.height);
      setGridData(JSON.parse(JSON.stringify(part.data)));
      
      // Auto-detect if this part is bound to any slot, if so, set the dropdown!
      let foundSlot = 'none';
      const isHeadOpen = bindings.HEAD_OPEN === key;
      const isHeadBlink = bindings.HEAD_BLINK === key;
      const isTailUp = bindings.TAIL_UP === key;
      const isTailMid = bindings.TAIL_MID === key;
      const isTailDown = bindings.TAIL_DOWN === key;
      const isLegDown = bindings.LEG_DOWN === key;
      const isLegFront = bindings.LEG_FRONT === key;
      const isLegBack = bindings.LEG_BACK === key;

      if (isHeadOpen && isHeadBlink) foundSlot = 'HEAD_ALL';
      else if (isTailUp && isTailMid && isTailDown) foundSlot = 'TAIL_ALL';
      else if (isLegDown && isLegFront && isLegBack) foundSlot = 'LEG_ALL';
      else if (isHeadOpen) foundSlot = 'HEAD_OPEN';
      else if (isHeadBlink) foundSlot = 'HEAD_BLINK';
      else if (bindings.POPTART === key) foundSlot = 'POPTART';
      else if (isTailUp) foundSlot = 'TAIL_UP';
      else if (isTailMid) foundSlot = 'TAIL_MID';
      else if (isTailDown) foundSlot = 'TAIL_DOWN';
      else if (isLegDown) foundSlot = 'LEG_DOWN';
      else if (isLegFront) foundSlot = 'LEG_FRONT';
      else if (isLegBack) foundSlot = 'LEG_BACK';
      
      setSelectedSlot(foundSlot);
    }
  };

  // Reset current grid to transparent
  const handleClear = () => {
    if (window.confirm('Xóa sạch lưới vẽ hiện tại?')) {
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
    setToastMessage('📋 Đã copy mã ma trận 2D vào Clipboard!');
  };

  return (
    <div className="editor-tab-layout">
      {/* Editor Main Canvas Workspace */}
      <div className="editor-canvas-container glass-card">
        <div className="editor-card-header">
          <div className="header-meta">
            <span className="card-tag">CANVAS</span>
            <h2>Pixel Workspace ({gridWidth} × {gridHeight})</h2>
          </div>
          <div className="header-actions">
            <div className="preset-selector">
              <span className="label-text">Load Template:</span>
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
              <RefreshCw size={14} /> Reset Clear
            </button>
          </div>
        </div>

        {/* The Grid Board */}
        <div className="workspace-scroll-area">
          <div
            className="pixel-art-grid-board"
            ref={gridContainerRef}
            style={{
              '--cols': gridWidth,
              '--rows': gridHeight
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
          💡 Click chuột trái để tô màu. Nhấn giữ chuột trái và rê vẽ để tô hàng loạt nhanh chóng.
        </div>
      </div>

      {/* Editor Customizer Sidebar Panel */}
      <div className="editor-control-panel glass-card">
        <div className="panel-section">
          <h3>1. Save Part Details</h3>
          <div className="input-group">
            <label>Name (English Keys Recommended)</label>
            <input
              type="text"
              className="input-text"
              value={partName}
              onChange={(e) => setPartName(e.target.value)}
              placeholder="e.g. laser_head_style"
            />
          </div>

          <div className="grid-resizers">
            <div className="resize-box">
              <span className="resize-title">Width</span>
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
              <span className="resize-title">Height</span>
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
              🎬 Gán Chuyển Động (Motion Slot)
            </label>
            <select
              className="select-custom"
              value={selectedSlot}
              onChange={(e) => setSelectedSlot(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--color-border-glow)', borderRadius: '4px', color: '#fff', padding: '8px 10px', fontSize: '12px' }}
            >
              <option value="none">❌ Không gán chuyển động</option>
              <optgroup label="🐱 ĐẦU MÈO (HEAD)">
                <option value="HEAD_ALL">🌟 Tất cả trạng thái Đầu (Mở & Nhắm)</option>
                <option value="HEAD_OPEN">👁️ Mắt Mở (HEAD_OPEN)</option>
                <option value="HEAD_BLINK">😑 Mắt Nhắm (HEAD_BLINK)</option>
              </optgroup>
              <optgroup label="🥞 THÂN BÁNH (BODY)">
                <option value="POPTART">🍪 Thân bánh Pop-Tart (POPTART)</option>
              </optgroup>
              <optgroup label="🐕 ĐUÔI MÈO (TAIL)">
                <option value="TAIL_ALL">🌟 Tất cả trạng thái Đuôi (Lên/Ngang/Xuống)</option>
                <option value="TAIL_UP">⬆️ Đuôi hướng lên (TAIL_UP)</option>
                <option value="TAIL_MID">➡️ Đuôi nằm ngang (TAIL_MID)</option>
                <option value="TAIL_DOWN">⬇️ Đuôi hướng xuống (TAIL_DOWN)</option>
              </optgroup>
              <optgroup label="🦵 CHÂN MÈO (LEGS)">
                <option value="LEG_ALL">🌟 Tất cả các Chân (Đứng/Trước/Sau)</option>
                <option value="LEG_DOWN">⬇️ Chân thẳng đứng (LEG_DOWN)</option>
                <option value="LEG_FRONT">↗️ Chân co trước (LEG_FRONT)</option>
                <option value="LEG_BACK">↖️ Chân co sau (LEG_BACK)</option>
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
                <span>Dành Cho Mô Hình Tự Do (Dog, Robot, Chim...)</span>
              </div>
              <p style={{ margin: '0 0 8px 0', color: '#a0aab5' }}>
                Chọn <strong>"Không gán chuyển động"</strong> khi vẽ linh kiện của các mô hình tự do. Sau khi lưu, bạn sẽ thiết lập chuyển động riêng cho nó ở trang Assembler:
              </p>
              <div style={{ borderTop: '1px dashed rgba(0, 229, 255, 0.15)', paddingTop: '8px', marginTop: '4px' }}>
                <strong style={{ color: '#00e5ff', display: 'block', marginBottom: '6px' }}>Luồng tạo chuyển động tịnh tiến & hoán đổi part:</strong>
                <ol style={{ margin: 0, paddingLeft: '14px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <li>Vẽ các trạng thái linh kiện (ví dụ: vẽ mắt mở <code>dog_head_open</code> và mắt nhắm <code>dog_head_blink</code>) rồi lưu lại.</li>
                  <li>Click nút <strong>🚀 Custom Model Assembler</strong> ở thanh tiêu đề trên cùng để mở Studio lắp ráp.</li>
                  <li>Tạo mới Profile (ví dụ: "DOG PROFILE").</li>
                  <li>Thêm linh kiện chính (ví dụ: <code>dog_head_open</code>) vào Canvas dưới dạng một Layer.</li>
                  <li>Tại cột điều chỉnh bên phải, tích chọn <strong>KÍCH HOẠT</strong> ở mục <strong>🎭 Hoạt Ảnh & Chuyển Động Riêng</strong>.</li>
                  <li>Thiết lập frame-by-frame: Ở mỗi Frame, tùy ý tịnh tiến tọa độ (<code>dx</code>, <code>dy</code>) hoặc hoán đổi linh kiện hiển thị (Part Swap, ví dụ đổi sang <code>dog_head_blink</code> ở Frame 2 để nhắm mắt).</li>
                  <li>Bật <strong>▶️ Chạy Thử Hoạt Ảnh</strong> ở góc trên Workspace để xem mô hình chuyển động thời gian thực ở tốc độ 6 FPS!</li>
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
                <span>Ghi Đè Chuyển Động Mặc Định Nyan Cat</span>
              </div>
              <p style={{ margin: '0 0 6px 0', color: '#d0a5bd' }}>
                Linh kiện này sẽ tự động thay thế bộ phận mặc định tương ứng của chú mèo Nyan Cat ở vị trí <strong>{selectedSlot}</strong>.
              </p>
              <p style={{ margin: 0, color: '#ff007f', fontWeight: 'bold' }}>
                💡 Chú mèo Nyan Cat trên Dashboard sẽ tự động co duỗi và chuyển động linh kiện mới này theo đúng quỹ đạo nhún nhảy mặc định!
              </p>
            </div>
          )}

          <button className="btn btn-primary btn-full-width" onClick={handleSave}>
            <Save size={16} style={{ marginRight: 6 }} /> Save to My Library
          </button>
        </div>

        {/* Color Brushes List */}
        <div className="panel-section">
          <h3>2. Select Paint Brush</h3>
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

        {/* Live Matrix Exporter */}
        <div className="panel-section">
          <div className="section-header-compact">
            <h3>3. Live Export Array Code</h3>
            <button className="btn-icon-link" onClick={copyToClipboard} title="Copy code">
              <Copy size={14} /> Copy
            </button>
          </div>
          <textarea className="textarea-code" readOnly value={getGridCode()} />
        </div>

        {/* User's Created Library */}
        <div className="panel-section">
          <h3>4. My Custom Parts Library ({Object.keys(customParts).length})</h3>
          {Object.keys(customParts).length === 0 ? (
            <div className="empty-library font-sans">
              Chưa có bộ phận vẽ tùy chỉnh nào. Vẽ và lưu tác phẩm của bạn ở trên!
            </div>
          ) : (
            <div className="custom-parts-library-grid">
              {Object.keys(customParts).map((key) => {
                const part = customParts[key];
                return (
                  <div key={key} className="part-library-card">
                    <div className="part-details">
                      <span className="part-title">{part.name}</span>
                      <span className="part-dims">{part.width}x{part.height} px</span>
                    </div>
                    <div className="part-actions">
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => handleLoadCustom(key)}
                        title="Load vào Workspace vẽ"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => {
                          if (window.confirm(`Xóa bộ phận "${part.name}" khỏi thư viện?`)) {
                            deleteCustomPart(key);
                          }
                        }}
                        title="Xóa bộ phận này"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
