import { useState, useContext, useEffect, useRef, useCallback, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { Trash2, Plus, Minus, RefreshCw, Copy, Save } from 'lucide-react';
import PixelGridBoard from './PixelGridBoard';
import ColorPaletteManager from './ColorPaletteManager';
import { PALETTES, getCustomMergedPalette } from '../utils/nyanRenderer';

const DEFAULT_EDITOR_COLORS = {
  1: '#000000',
  2: '#999999',
  3: '#777777',
  4: '#dd8855',
  5: '#ff99cc',
  6: '#ff3399',
  7: '#ffffff',
  8: '#ff9999'
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
    deleteCustomPalette,
    defaultSprites
  } = useContext(AppContext);

  const isReadOnly = !!(editingPartKey && defaultSprites[editingPartKey] && !customParts[editingPartKey]);

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
  const [isAnimationFrameOnly, setIsAnimationFrameOnly] = useState(false);

  const uniquePackages = useMemo(() => Array.from(
    new Set([
      ...Object.values(customParts).map((p) => p.package || 'My Custom'),
      ...(loadedPackages || [])
    ])
  ).filter((p) => p !== 'Nyan Cat'), [customParts, loadedPackages]);

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
  const isDrawingRef = useRef(false);
  const [presetTemplate, setPresetTemplate] = useState(() => {
    return Object.keys(defaultSprites || {})[0] || 'HEAD_OPEN';
  });

  const lastLoadedKeyRef = useRef(Symbol('initial'));

  const loadTemplate = useCallback((templateKey) => {
    const preset = getDefaultSpriteData(templateKey);
    setGridWidth(preset.width);
    setGridHeight(preset.height);
    setGridData(preset.data);
    setPartName(`custom_${templateKey.toLowerCase()}`);
    setIsAnimationFrameOnly(false);

    // Load template colors first, then fill missing gaps with DEFAULT_EDITOR_COLORS
    const sprite = defaultSprites[templateKey];
    const spriteColors = sprite && sprite.colors ? sprite.colors : {};
    setLocalColors({
      ...DEFAULT_EDITOR_COLORS,
      ...spriteColors
    });
    setSelectedPaletteName('default');
  }, [getDefaultSpriteData, defaultSprites]);

  const [localColors, setLocalColors] = useState(DEFAULT_EDITOR_COLORS);

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
        setGridData(JSON.parse(JSON.stringify(part.matrix || part.data || [])));
        setPackageName(part.package || 'My Custom');
        setIsCreatingNewPackage(false);
        setIsAnimationFrameOnly(!!part.isAnimationFrameOnly);

        if (part.colors || part.palette) {
          const colorData = part.colors || part.palette;
          setLocalColors({
            ...DEFAULT_EDITOR_COLORS,
            ...JSON.parse(JSON.stringify(colorData))
          });
          const paletteName = part.paletteName || `${part.name} Palette`;
          importCustomPalette(paletteName, colorData, part.colorLabels || {});
        } else {
          setLocalColors(DEFAULT_EDITOR_COLORS);
        }
        setSelectedPaletteName('default');
      } else if (defaultSprites[editingPartKey]) {
        // Load default template sprite data
        const preset = getDefaultSpriteData(editingPartKey);
        setGridWidth(preset.width);
        setGridHeight(preset.height);
        setGridData(preset.data);
        setPartName(editingPartKey);
        setPackageName('Nyan Cat');
        setIsCreatingNewPackage(false);
        setIsAnimationFrameOnly(false);

        const sprite = defaultSprites[editingPartKey];
        const spriteColors = sprite.colors || {};

        setLocalColors({
          ...DEFAULT_EDITOR_COLORS,
          ...spriteColors
        });
        setSelectedPaletteName('default');
      }
    } else {
      // New part
      const firstTemplateKey = Object.keys(defaultSprites || {})[0] || 'HEAD_OPEN';
      loadTemplate(firstTemplateKey);
      setPackageName('My Custom');
      setIsCreatingNewPackage(false);
      setIsAnimationFrameOnly(false);

      setLocalColors(DEFAULT_EDITOR_COLORS);
      setSelectedPaletteName('default');
    }
  }, [editingPartKey, customParts, settings, loadTemplate, getDefaultSpriteData, importCustomPalette]);

  const currentTemplateColors = useMemo(() => {
    return selectedPaletteName !== 'default' && customPalettes[selectedPaletteName]
      ? (customPalettes[selectedPaletteName].colors || customPalettes[selectedPaletteName])
      : DEFAULT_EDITOR_COLORS;
  }, [selectedPaletteName, customPalettes]);

  const mergePalette = useCallback((colorsToMerge) => {
    setLocalColors((prevColors) => {
      const nextColors = { ...prevColors };

      Object.keys(colorsToMerge).forEach((k) => {
        const hex = colorsToMerge[k];

        const existingIdx = Object.keys(nextColors).find(
          (idx) => nextColors[idx].toLowerCase() === hex.toLowerCase()
        );

        if (!existingIdx) {
          const nextIdx = Math.max(0, ...Object.keys(nextColors).map(Number)) + 1;
          nextColors[nextIdx] = hex;
        }
      });
      return nextColors;
    });
  }, []);

  const baseColorMap = useMemo(() => {
    const skin = PALETTES.skins[settings.skinStyle] || PALETTES.skins.classic;
    const pop = PALETTES.poptarts[settings.poptartStyle] || PALETTES.poptarts.strawberry;
    return {
      1: '#000000',
      2: settings.customSkinColor || skin.fill,
      3: settings.customSkinShadow || skin.shadow,
      4: settings.customCrustColor || pop.crust,
      5: settings.customFrostingColor || pop.frosting,
      6: settings.customSprinkleColor || pop.sprinkle,
      7: '#ffffff',
      8: '#ff9999'
    };
  }, [settings]);

  const displayColors = useMemo(() => {
    return getCustomMergedPalette(localColors, baseColorMap);
  }, [localColors, baseColorMap]);

  const colorMap = useMemo(() => ({
    0: t('pixelEditor.transparent'),
    ...displayColors
  }), [displayColors, t]);

  // Handle grid size adjustment (preserving existing pixels)
  const handleGridResize = (dimension, amount) => {
    if (isReadOnly) return;
    if (dimension === 'width') {
      const nextW = Math.max(3, Math.min(40, gridWidth + amount));
      const nextGrid = gridData.map((row) => {
        if (amount > 0) {
          return [...row, ...Array(amount).fill(0)];
        } else {
          return row.slice(0, nextW);
        }
      });
      setGridWidth(nextW);
      setGridData(nextGrid);
    } else if (dimension === 'height') {
      const nextH = Math.max(3, Math.min(40, gridHeight + amount));
      let nextGrid;
      if (amount > 0) {
        nextGrid = [
          ...gridData,
          ...Array(amount).fill().map(() => Array(gridWidth).fill(0))
        ];
      } else {
        nextGrid = gridData.slice(0, nextH);
      }
      setGridHeight(nextH);
      setGridData(nextGrid);
    }
  };

  const activeColorRef = useRef(activeColor);
  activeColorRef.current = activeColor;

  // Highly optimized path-copying draw logic
  const drawPixel = useCallback((r, c) => {
    if (isReadOnly) return;
    setGridData((prevGrid) => {
      const color = activeColorRef.current;
      // Short-circuit to avoid re-renders if identical
      if (prevGrid[r][c] === color) return prevGrid;

      const nextGrid = [...prevGrid];
      nextGrid[r] = [...nextGrid[r]];
      nextGrid[r][c] = color;
      return nextGrid;
    });
  }, [isReadOnly]);

  const handleMouseDown = useCallback((e, r, c) => {
    if (isReadOnly) return;
    isDrawingRef.current = true;
    drawPixel(r, c);
  }, [isReadOnly, drawPixel]);

  const handleMouseEnter = useCallback((e, r, c) => {
    if (isReadOnly) return;
    if (isDrawingRef.current) {
      drawPixel(r, c);
    }
  }, [isReadOnly, drawPixel]);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isDrawingRef.current = false;
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  // Save the custom part
  const handleSave = () => {
    if (isReadOnly) return;
    if (!partName.trim()) {
      setToastMessage(t('pixelEditor.errors.missingName'));
      return;
    }

    const finalPackage = isCreatingNewPackage ? newPackageName.trim() : packageName;
    if (isCreatingNewPackage && !finalPackage) {
      setToastMessage(t('pixelEditor.errors.missingPackageName'));
      return;
    }

    const activeColors = { ...localColors };

    saveCustomPart(
      partName,
      gridWidth,
      gridHeight,
      gridData,
      finalPackage || 'My Custom',
      activeColors,
      null,
      isAnimationFrameOnly
    );

    setToastMessage(t('pixelEditor.toasts.savedToLibrary', { name: partName }));
  };

  // Delete part
  const handleDelete = () => {
    if (isReadOnly || !editingPartKey || !customParts[editingPartKey]) return;
    const part = customParts[editingPartKey];
    if (window.confirm(t('pixelEditor.confirm.deletePart', { name: part.name }))) {
      deleteCustomPart(editingPartKey);
      setToastMessage(t('pixelEditor.toasts.deleted', { name: part.name }));
      if (onClose) onClose();
    }
  };

  // Reset current grid to transparent
  const handleClear = () => {
    if (isReadOnly) return;
    if (window.confirm(t('pixelEditor.confirm.clearGrid'))) {
      setGridData(Array(gridHeight).fill().map(() => Array(gridWidth).fill(0)));
    }
  };

  // Generate Javascript object code representation (Memoized!)
  const gridCode = useMemo(() => {
    const varName = partName.toUpperCase().replace(/[^A-Z0-9]/g, '_');
    const colorsStr = JSON.stringify(localColors, null, 4).replace(/"/g, '"');
    const formattedRows = gridData.map(row => `    [${row.join(',')}]`).join(',\n');
    return `const ${varName} = {\n  colors: ${colorsStr.replace(/\n/g, '\n  ')},\n  matrix: [\n${formattedRows}\n  ]\n};`;
  }, [gridData, partName, localColors]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(gridCode);
    setToastMessage(t('pixelEditor.toasts.copiedCode'));
  };

  return (
    <div className="editor-tab-layout">
      {/* Editor Main Canvas Workspace */}
      <div className="editor-canvas-container glass-card">
        <div className="editor-card-header">
          <div className="header-meta">
            <span className="card-tag">
              {isReadOnly ? `🔒 ${t('pixelEditor.readOnlyTag')}` : t('pixelEditor.canvasTag')}
            </span>
            <h2>
              {isReadOnly
                ? `${partName} (${t('pixelEditor.readOnlyLabel')})`
                : (t('pixelEditor.canvasTitle', { w: gridWidth, h: gridHeight }))
              }
            </h2>
          </div>
          {!isReadOnly && (
            <div className="header-actions">
              <div className="preset-selector">
                <span className="label-text">{t('pixelEditor.loadTemplate')}</span>
                <select
                  className="select-custom"
                  value={presetTemplate}
                  onChange={(e) => {
                    setPresetTemplate(e.target.value);
                    loadTemplate(e.target.value);
                  }}
                >
                  {Object.keys(defaultSprites || {}).map((key) => (
                    <option key={key} value={key}>
                      {t(`slots.${key}`) || key}
                    </option>
                  ))}
                </select>
              </div>
              <button className="btn btn-secondary btn-small" onClick={handleClear}>
                <RefreshCw size={14} /> {t('pixelEditor.btnClear')}
              </button>
            </div>
          )}
        </div>

        {/* The Grid Board */}
        <PixelGridBoard
          gridData={gridData}
          gridWidth={gridWidth}
          gridHeight={gridHeight}
          colorMap={colorMap}
          isReadOnly={isReadOnly}
          handleMouseDown={handleMouseDown}
          handleMouseEnter={handleMouseEnter}
        />

        <div className="drag-hint font-sans">
          {isReadOnly
            ? `🔒 ${t('pixelEditor.readOnlyGridHint')}`
            : `💡 ${t('pixelEditor.dragHint')}`
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
            borderSecondaryRadius: '8px',
            borderRadius: '8px',
            marginBottom: '16px',
            boxShadow: '0 4px 15px rgba(0, 229, 255, 0.05)'
          }}>
            <h3 style={{ color: 'var(--color-primary-glow, #00e5ff)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0, marginBottom: '10px', fontSize: '14px' }}>
              <span>🔒</span> {t('pixelEditor.readOnlyTitle')}
            </h3>
            <p style={{ fontSize: '12px', color: '#a0aab5', lineHeight: '1.6', margin: '0 0 10px 0' }}>
              {t('pixelEditor.readOnlyNotice')}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--color-primary-glow, #00e5ff)', fontWeight: 'bold', margin: 0 }}>
              {t('pixelEditor.readOnlyCopyTip')}
            </p>
          </div>
        ) : (
          <div className="panel-section">
            <h3>1. {t('pixelEditor.sectionSaveTitle')}</h3>
            <div className="input-group">
              <label>{t('pixelEditor.partNameLabel')}</label>
              <input
                type="text"
                className="input-text"
                value={partName}
                onChange={(e) => setPartName(e.target.value)}
                placeholder="e.g. laser_head_style"
              />
            </div>

            <div className="input-group" style={{ marginTop: '12px' }}>
              <label>{t('pixelEditor.packageLabel')}</label>
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
                <option value="__NEW__">➕ {t('pixelEditor.newPackageOption')}</option>
              </select>
            </div>

            {isCreatingNewPackage && (
              <div className="input-group animate-slide-down" style={{ marginTop: '8px' }}>
                <label>{t('pixelEditor.newPackagePlaceholder')}</label>
                <input
                  type="text"
                  className="input-text"
                  value={newPackageName}
                  onChange={(e) => setNewPackageName(e.target.value)}
                  placeholder={t('pixelEditor.newPackageInputPlaceholder')}
                />
              </div>
            )}

            {/* Animation Frame Only Checkbox */}
            <div className="input-group" style={{ marginTop: '10px', flexDirection: 'row', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                id="isAnimationFrameOnly"
                checked={isAnimationFrameOnly}
                onChange={(e) => setIsAnimationFrameOnly(e.target.checked)}
                style={{ cursor: 'pointer', width: '16px', height: '16px' }}
              />
              <label htmlFor="isAnimationFrameOnly" style={{ fontSize: '11px', color: '#aaa', cursor: 'pointer', margin: 0, userSelect: 'none' }}>
                {t('pixelEditor.isAnimationFrameOnlyLabel')}
              </label>
            </div>

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
                <Save size={16} style={{ marginRight: 6 }} /> {t('pixelEditor.btnSave')}
              </button>
              {editingPartKey && customParts[editingPartKey] && (
                <button
                  className="btn btn-secondary"
                  style={{ background: 'rgba(255, 0, 85, 0.1)', border: '1px solid rgba(255, 0, 85, 0.5)', color: '#ff3366', padding: '0 12px' }}
                  onClick={handleDelete}
                  title={t('pixelEditor.btnDelete')}
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
            <h3>2. {t('pixelEditor.sectionPaletteTitle')}</h3>
            <ColorPaletteManager
              localColors={localColors}
              setLocalColors={setLocalColors}
              baseColorMap={baseColorMap}
              displayColors={displayColors}
              activeColor={activeColor}
              setActiveColor={setActiveColor}
              selectedPaletteName={selectedPaletteName}
              setSelectedPaletteName={setSelectedPaletteName}
              currentTemplateColors={currentTemplateColors}
              currentTemplateLabels={{}}
              mergePalette={mergePalette}
            />
          </div>
        )}

        {/* Live Matrix Exporter */}
        <div className="panel-section">
          <div className="section-header-compact">
            <h3>4. {t('pixelEditor.sectionExportTitle')}</h3>
            <button className="btn-icon-link" onClick={copyToClipboard} title="Copy code">
              <Copy size={14} /> {t('pixelEditor.btnCopy')}
            </button>
          </div>
          <textarea className="textarea-code" readOnly value={gridCode} />
        </div>
      </div>
    </div>
  );
}
