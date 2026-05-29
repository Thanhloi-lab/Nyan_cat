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
    setToastMessage,
    loadedPackages,
    t,
    customPalettes,
    importCustomPalette,
    deleteCustomPalette
  } = useContext(AppContext);

  const isReadOnly = !!(editingPartKey && DEFAULT_SPRITES[editingPartKey] && !customParts[editingPartKey]);

  const [selectedPaletteName, setSelectedPaletteName] = useState('default');



  // Editor states
  const [partName, setPartName] = useState('My_Custom_Part');
  const [gridWidth, setGridWidth] = useState(16);
  const [gridHeight, setGridHeight] = useState(13);
  const [gridData, setGridData] = useState(() =>
    Array(13).fill().map(() => Array(16).fill(0))
  );

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
      const activePalette = selectedPaletteName !== 'default' && customPalettes[selectedPaletteName]
        ? customPalettes[selectedPaletteName]
        : null;
      liveEditingPartRef.current = { key, data: gridData, palette: activePalette };
    }
  }, [partName, gridData, selectedPaletteName, customPalettes, liveEditingPartRef]);
  
  const [activeColor, setActiveColor] = useState(1); // Default to black outline
  const [isDrawing, setIsDrawing] = useState(false);
  const [presetTemplate, setPresetTemplate] = useState('HEAD_OPEN');

  const gridContainerRef = useRef(null);
  const lastLoadedKeyRef = useRef(Symbol('initial'));

  // Apply a template to the editor grid
  const loadTemplate = useCallback((templateKey) => {
    const preset = getDefaultSpriteData(templateKey);
    setGridWidth(preset.width);
    setGridHeight(preset.height);
    setGridData(preset.data);
    setPartName(`custom_${templateKey.toLowerCase()}`);
  }, [getDefaultSpriteData]);



  const [paletteSaveName, setPaletteSaveName] = useState('');
  const [localColors, setLocalColors] = useState({
    1: '#000000',
    2: '#999999',
    3: '#777777',
    4: '#dd8855',
    5: '#ff99cc',
    6: '#ff3399',
    7: '#ffffff',
    8: '#ff9999'
  });
  const [localColorLabels, setLocalColorLabels] = useState({});

  useEffect(() => {
    // Only load if editingPartKey actually changed
    if (lastLoadedKeyRef.current === editingPartKey) {
      return;
    }
    lastLoadedKeyRef.current = editingPartKey;

    if (editingPartKey) {
      const part = customParts[editingPartKey];
      if (part) {
        setPartName(part.name);
        setGridWidth(part.width);
        setGridHeight(part.height);
        setGridData(JSON.parse(JSON.stringify(part.data)));
        setPackageName(part.package || 'My Custom');
        setIsCreatingNewPackage(false);

        if (part.palette) {
          setLocalColors(JSON.parse(JSON.stringify(part.palette)));
          const paletteName = part.paletteName || `${part.name} Palette`;
          importCustomPalette(paletteName, part.palette, part.colorLabels || {});
        } else {
          const skin = PALETTES.skins[settings.skinStyle] || PALETTES.skins.classic;
          const pop  = PALETTES.poptarts[settings.poptartStyle] || PALETTES.poptarts.strawberry;
          setLocalColors({
            1: '#000000',
            2: settings.customSkinColor || skin.fill,
            3: settings.customSkinShadow || skin.shadow,
            4: settings.customCrustColor || pop.crust,
            5: settings.customFrostingColor || pop.frosting,
            6: settings.customSprinkleColor || pop.sprinkle,
            7: '#ffffff',
            8: '#ff9999'
          });
        }

        if (part.colorLabels) {
          setLocalColorLabels(JSON.parse(JSON.stringify(part.colorLabels)));
        } else {
          setLocalColorLabels({});
        }
        setSelectedPaletteName('default');
      } else if (DEFAULT_SPRITES[editingPartKey]) {
        // Load default template sprite data
        const preset = getDefaultSpriteData(editingPartKey);
        setGridWidth(preset.width);
        setGridHeight(preset.height);
        setGridData(preset.data);
        setPartName(editingPartKey);
        setPackageName('Nyan Cat');
        setIsCreatingNewPackage(false);

        const skin = PALETTES.skins[settings.skinStyle] || PALETTES.skins.classic;
        const pop  = PALETTES.poptarts[settings.poptartStyle] || PALETTES.poptarts.strawberry;
        setLocalColors({
          1: '#000000',
          2: settings.customSkinColor || skin.fill,
          3: settings.customSkinShadow || skin.shadow,
          4: settings.customCrustColor || pop.crust,
          5: settings.customFrostingColor || pop.frosting,
          6: settings.customSprinkleColor || pop.sprinkle,
          7: '#ffffff',
          8: '#ff9999'
        });
        setLocalColorLabels({});
        setSelectedPaletteName('default');
      }
    } else {
      // New part
      loadTemplate('HEAD_OPEN');
      setPackageName('My Custom');
      setIsCreatingNewPackage(false);

      const skin = PALETTES.skins[settings.skinStyle] || PALETTES.skins.classic;
      const pop  = PALETTES.poptarts[settings.poptartStyle] || PALETTES.poptarts.strawberry;
      setLocalColors({
        1: '#000000',
        2: settings.customSkinColor || skin.fill,
        3: settings.customSkinShadow || skin.shadow,
        4: settings.customCrustColor || pop.crust,
        5: settings.customFrostingColor || pop.frosting,
        6: settings.customSprinkleColor || pop.sprinkle,
        7: '#ffffff',
        8: '#ff9999'
      });
      setLocalColorLabels({});
      setSelectedPaletteName('default');
    }
  }, [editingPartKey, customParts, settings, loadTemplate, getDefaultSpriteData, importCustomPalette]);

  const skin = PALETTES.skins[settings.skinStyle] || PALETTES.skins.classic;
  const pop  = PALETTES.poptarts[settings.poptartStyle] || PALETTES.poptarts.strawberry;
  const currentTemplateColors = selectedPaletteName !== 'default' && customPalettes[selectedPaletteName]
    ? (customPalettes[selectedPaletteName].colors || customPalettes[selectedPaletteName])
    : {
        1: '#000000',
        2: settings.customSkinColor || skin.fill,
        3: settings.customSkinShadow || skin.shadow,
        4: settings.customCrustColor || pop.crust,
        5: settings.customFrostingColor || pop.frosting,
        6: settings.customSprinkleColor || pop.sprinkle,
        7: '#ffffff',
        8: '#ff9999'
      };

  const currentTemplateLabels = selectedPaletteName !== 'default' && customPalettes[selectedPaletteName]
    ? (customPalettes[selectedPaletteName].labels || {})
    : {};

  const handleSelectTemplateColor = (hex) => {
    // Check if color is already in localColors
    const existingIdx = Object.keys(localColors).find(
      (k) => localColors[k].toLowerCase() === hex.toLowerCase()
    );
    if (existingIdx) {
      setActiveColor(parseInt(existingIdx));
      setToastMessage(t('pixelEditor.toasts.colorSelected', { index: existingIdx }) || `🎨 Đã chọn cọ màu #${existingIdx}`);
    } else {
      // Add to localColors with next index
      const nextIdx = Math.max(0, ...Object.keys(localColors).map(Number)) + 1;
      setLocalColors((prev) => ({
        ...prev,
        [nextIdx]: hex
      }));
      setActiveColor(nextIdx);
      setToastMessage(t('pixelEditor.toasts.colorAdded', { index: nextIdx }) || `🎨 Đã thêm màu mới vào cọ vẽ #${nextIdx}!`);
    }
  };

  const handleSavePalettePackage = () => {
    const name = paletteSaveName.trim();
    if (!name) {
      alert(t('pixelEditor.errors.missingPaletteName') || '⚠️ Vui lòng nhập tên gói màu!');
      return;
    }
    importCustomPalette(name, { ...localColors }, { ...localColorLabels });
    setSelectedPaletteName(name);
    setPaletteSaveName('');
    setToastMessage(t('pixelEditor.toasts.paletteSaved', { name }) || `🎨 Đã lưu gói màu "${name}" vào thư viện!`);
  };

  const colorMap = {
    0: 'transparent',
    ...localColors
  };

  const handleColorChange = (idx, hex) => {
    setLocalColors(prev => ({ ...prev, [idx]: hex }));
  };

  const handleRemoveBrush = (idx) => {
    setLocalColors((prev) => {
      const copy = { ...prev };
      delete copy[idx];
      return copy;
    });
    setLocalColorLabels((prev) => {
      const copy = { ...prev };
      delete copy[idx];
      return copy;
    });
    if (activeColor === idx) {
      setActiveColor(0);
    }
  };

  const handleUpdateColorLabel = (idx, newLabel) => {
    setLocalColorLabels((prev) => ({
      ...prev,
      [idx]: newLabel
    }));
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

    // Always bake in the active color palette mapping inside the custom part JSON to guarantee color constancy
    const activePalette = { ...localColors };

    saveCustomPart(
      partName,
      gridWidth,
      gridHeight,
      gridData,
      finalPackage || 'My Custom',
      activePalette,
      localColorLabels
    );
    
    setToastMessage(t('pixelEditor.toasts.savedToLibrary', { name: partName }) || `💾 Đã lưu "${partName}" vào thư viện linh kiện thành công!`);
  };

  // Palette package import/export/delete handlers
  const handlePaletteUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const name = parsed.paletteName || file.name.replace('.json', '');
        const colors = parsed.colors || parsed;
        const labels = parsed.labels || {};
        const keys = Object.keys(colors);
        const isValid = keys.length > 0 && keys.every(k => typeof colors[k] === 'string' && colors[k].startsWith('#'));
        if (!isValid) {
          alert(t('pixelEditor.errors.invalidPalette') || '⚠️ File JSON không hợp lệ! Phải chứa các key trỏ tới mã màu HEX.');
          return;
        }
        importCustomPalette(name, colors, labels);
        setSelectedPaletteName(name);
        setLocalColors({ ...colors });
        setLocalColorLabels({ ...labels });
        setToastMessage(t('pixelEditor.toasts.paletteLoaded', { name }) || `🎨 Đã nạp gói màu "${name}" thành công!`);
      } catch (err) {
        console.error(err);
        alert(t('pixelEditor.errors.paletteParseError') || '❌ Lỗi khi đọc file JSON gói màu!');
      }
    };
    reader.readAsText(file);
  };

  const handlePaletteExport = () => {
    if (selectedPaletteName === 'default') return;
    const palette = customPalettes[selectedPaletteName];
    if (!palette) return;
    const colors = palette.colors || palette;
    const labels = palette.labels || {};
    const payload = {
      paletteName: selectedPaletteName,
      colors,
      labels
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedPaletteName.replace(/\s+/g, '_').toLowerCase()}_palette.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setToastMessage(t('pixelEditor.toasts.paletteExported') || '📤 Đã xuất gói màu thành công!');
  };

  const handlePaletteDelete = () => {
    if (selectedPaletteName === 'default') return;
    if (window.confirm(t('pixelEditor.confirm.deletePalette', { name: selectedPaletteName }) || `Gỡ bỏ gói màu "${selectedPaletteName}" khỏi danh sách?`)) {
      const name = selectedPaletteName;
      setSelectedPaletteName('default');
      deleteCustomPalette(name);
      setToastMessage(t('pixelEditor.toasts.paletteDeleted', { name }) || `🗑️ Đã gỡ gói màu "${name}".`);
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

            <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
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

        {/* Unified Color Palette & Brushes Manager */}
        {!isReadOnly && (
          <div className="panel-section">
            <h3>2. {t('pixelEditor.sectionPaletteTitle') || 'Custom Color Palette & Brushes'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
              {/* Select template palette */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  className="select-custom"
                  style={{ flex: 1 }}
                  value={selectedPaletteName}
                  onChange={(e) => setSelectedPaletteName(e.target.value)}
                >
                  <option value="default">{t('pixelEditor.defaultPalette') || 'Default Nyan Theme (Dynamic)'}</option>
                  {Object.keys(customPalettes).map((name) => (
                    <option key={name} value={name}>
                      🎨 {name}
                    </option>
                  ))}
                </select>

                <button 
                  className="btn btn-secondary btn-small"
                  style={{ padding: '0 10px', background: 'rgba(0, 229, 255, 0.1)', border: '1px solid rgba(0, 229, 255, 0.3)', color: '#00e5ff', fontWeight: 'bold' }}
                  onClick={() => {
                    if (window.confirm(t('pixelEditor.confirm.applyPalette') || 'Áp dụng toàn bộ gói màu này làm bảng cọ vẽ hiện tại?')) {
                      setLocalColors({ ...currentTemplateColors });
                      setLocalColorLabels({ ...currentTemplateLabels });
                      setToastMessage(t('pixelEditor.toasts.paletteApplied') || '🎨 Đã áp dụng gói màu vào cọ vẽ.');
                    }
                  }}
                  title={t('pixelEditor.tooltipApplyPalette') || "Áp dụng toàn bộ gói màu làm cọ vẽ"}
                >
                  {t('pixelEditor.btnApplyPalette') || 'Apply All'}
                </button>
              </div>

              {/* Clickable Template Color Bubbles */}
              <div className="template-colors-bubbles font-sans" style={{ marginTop: '2px' }}>
                <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {t('pixelEditor.templateColorsLabel') || 'Bảng Màu Mẫu (Click để lấy màu):'}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', padding: '8px' }}>
                  {Object.keys(currentTemplateColors).map((k) => {
                    const hex = currentTemplateColors[k];
                    return (
                      <div
                        key={k}
                        onClick={() => handleSelectTemplateColor(hex)}
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '4px',
                          backgroundColor: hex,
                          cursor: 'pointer',
                          border: '1px solid rgba(255,255,255,0.15)',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                          transition: 'transform 0.1s ease',
                        }}
                        className="template-color-bubble"
                        title={hex}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Color Brushes List */}
              <div style={{ borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: '10px', marginTop: '4px' }}>
                <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🎨 {t('pixelEditor.sectionBrushTitle') || 'Select Paint Brush'}:
                </div>
                <p style={{ margin: '0 0 10px 0', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                  {t('pixelEditor.brushHint') || '💡 Nhấp vào ô màu của cọ vẽ bất kỳ để sửa màu tùy chọn!'}
                </p>
                <div className="brushes-grid">
                  {[0, ...Object.keys(localColors).map(Number).sort((a, b) => a - b)].map((idx) => {
                    const label = localColorLabels[idx] !== undefined ? localColorLabels[idx] : (COLOR_LABELS[idx] || `Custom Color #${idx}`);
                    return (
                      <div
                        key={idx}
                        className={`brush-item-card ${activeColor === idx ? 'active' : ''}`}
                        onClick={() => setActiveColor(idx)}
                        style={{ position: 'relative' }}
                      >
                        {idx > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveBrush(idx);
                            }}
                            style={{
                              position: 'absolute',
                              top: '2px',
                              right: '2px',
                              width: '14px',
                              height: '14px',
                              borderRadius: '50%',
                              background: 'rgba(255,51,102,0.12)',
                              border: '1px solid rgba(255,51,102,0.25)',
                              color: '#ff3366',
                              fontSize: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              padding: 0,
                              zIndex: 10,
                              transition: 'all 0.15s ease'
                            }}
                            title={t('pixelEditor.tooltipDeleteBrush') || "Xóa cọ vẽ này"}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#ff3366';
                              e.currentTarget.style.color = '#fff';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(255,51,102,0.12)';
                              e.currentTarget.style.color = '#ff3366';
                            }}
                          >
                            ✕
                          </button>
                        )}
                        <div
                          className={`brush-color-preview-box color-${idx}`}
                          style={{
                            backgroundColor: idx === 0 ? 'transparent' : colorMap[idx],
                            border: idx === 0 ? '1px dashed #ffffff44' : 'none',
                            position: 'relative'
                          }}
                        >
                          {idx > 0 && (
                            <input
                              type="color"
                              value={colorMap[idx] || '#000000'}
                              onChange={(e) => handleColorChange(idx, e.target.value)}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveColor(idx);
                              }}
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                opacity: 0,
                                cursor: 'pointer'
                              }}
                              title={t('pixelEditor.tooltipColorPicker') || "Nhấp vào để chọn màu tùy ý"}
                            />
                          )}
                        </div>
                        <div className="brush-meta">
                          <span className="brush-number">#{idx}</span>
                          {idx === 0 ? (
                            <span className="brush-label">{label}</span>
                          ) : (
                            <input
                              type="text"
                              className="brush-label-input"
                              value={label}
                              onChange={(e) => handleUpdateColorLabel(idx, e.target.value)}
                              style={{
                                background: 'none',
                                border: 'none',
                                borderBottom: '1px dashed rgba(255,255,255,0.15)',
                                color: '#fff',
                                fontSize: '11px',
                                padding: '2px 0',
                                width: '100%',
                                outline: 'none',
                                boxSizing: 'border-box'
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <button
                  className="btn btn-secondary btn-small"
                  style={{ width: '100%', marginTop: '8px', border: '1px dashed rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.02)', color: '#00ffff' }}
                  onClick={() => {
                    const nextIdx = Math.max(0, ...Object.keys(localColors).map(Number)) + 1;
                    setLocalColors(prev => ({ ...prev, [nextIdx]: '#ffffff' }));
                    setActiveColor(nextIdx);
                    setToastMessage(t('pixelEditor.toasts.colorAdded', { index: nextIdx }) || `🎨 Đã thêm màu mới vào cọ vẽ #${nextIdx}!`);
                  }}
                >
                  ➕ {t('pixelEditor.btnAddBrush') || 'Thêm Cọ Màu Mới'}
                </button>
              </div>

              {/* Save current brushes as a reusable package */}
              <div className="save-palette-package-box font-sans" style={{ borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: '10px', marginTop: '4px' }}>
                <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  💾 {t('pixelEditor.savePaletteTitle') || 'Lưu cọ vẽ thành gói màu riêng:'}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    className="input-text"
                    style={{ flex: 1, fontSize: '11px', padding: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--color-border-glow)', color: '#fff', borderRadius: '4px' }}
                    value={paletteSaveName}
                    onChange={(e) => setPaletteSaveName(e.target.value)}
                    placeholder={t('pixelEditor.savePalettePlaceholder') || 'Tên gói màu mới...'}
                  />
                  <button
                    className="btn btn-primary btn-small"
                    style={{ padding: '0 10px', fontSize: '11px' }}
                    onClick={handleSavePalettePackage}
                  >
                    {t('pixelEditor.btnSavePalette') || 'Lưu Gói'}
                  </button>
                </div>
              </div>

              {/* Package Load / Export buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <label 
                  className="btn btn-secondary btn-small" 
                  style={{ 
                    flex: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '6px', 
                    cursor: 'pointer', 
                    fontSize: '11px',
                    padding: '6px 12px',
                    background: 'rgba(0, 255, 255, 0.05)',
                    border: '1px solid rgba(0, 255, 255, 0.2)',
                    color: '#00ffff'
                  }}
                >
                  📥 {t('pixelEditor.btnImportPalette') || 'Nạp Gói Màu (.json)'}
                  <input
                    type="file"
                    accept=".json"
                    style={{ display: 'none' }}
                    onChange={handlePaletteUpload}
                  />
                </label>

                {selectedPaletteName !== 'default' && (
                  <>
                    <button 
                      className="btn btn-secondary btn-small"
                      style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.05)', fontSize: '11px' }}
                      onClick={handlePaletteExport}
                      title={t('pixelEditor.btnExportPalette') || "Xuất bảng màu JSON"}
                    >
                      📤
                    </button>
                    <button 
                      className="btn btn-secondary btn-small"
                      style={{ padding: '6px 10px', background: 'rgba(255,0,85,0.05)', color: '#ff3366', border: '1px solid rgba(255,0,85,0.2)', fontSize: '11px' }}
                      onClick={handlePaletteDelete}
                      title={t('pixelEditor.btnDeletePalette') || "Gỡ bảng màu này"}
                    >
                      <Trash2 size={12} />
                    </button>
                  </>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Live Matrix Exporter */}
        <div className="panel-section">
          <div className="section-header-compact">
            <h3>4. {t('pixelEditor.sectionExportTitle') || 'Live Export Array Code'}</h3>
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
