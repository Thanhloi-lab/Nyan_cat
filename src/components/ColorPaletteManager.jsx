import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { Trash2 } from 'lucide-react';
import ColorPicker from './ColorPicker';

const ColorPaletteManager = React.memo(({
  localColors,
  setLocalColors,
  baseColorMap = null,
  displayColors = null,
  activeColor,
  setActiveColor,
  selectedPaletteName,
  setSelectedPaletteName,
  currentTemplateColors,
  currentTemplateLabels,
  mergePalette
}) => {
  const {
    customPalettes,
    importCustomPalette,
    deleteCustomPalette,
    setToastMessage,
    t
  } = useContext(AppContext);

  const [paletteSaveName, setPaletteSaveName] = useState('');
  const [newBrushColor, setNewBrushColor] = useState('#ffffff');
  const resolvedColors = displayColors || localColors;

  // --- Opacity helpers (store color as #rrggbbaa, 8-digit hex) ---
  const hexToRgba = (hex) => {
    const h = hex.replace('#', '');
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
    return `rgba(${r},${g},${b},${a.toFixed(3)})`;
  };

  // Returns base 6-digit hex from 8-digit
  const getBaseHex = (hex) => (hex && hex.length >= 7 ? hex.slice(0, 7) : (hex || '#000000'));

  // Build new 8-digit hex from base hex + opacity 0-100
  const buildHex = (baseHex, opacity) => {
    const alpha = Math.round((opacity / 100) * 255).toString(16).padStart(2, '0');
    return `${baseHex.slice(0, 7)}${alpha}`;
  };

  const colorMap = useMemo(() => ({
    0: 'transparent',
    ...Object.fromEntries(
      Object.entries(resolvedColors).map(([k, v]) => [k, hexToRgba(v)])
    )
  }), [resolvedColors]);

  const handleSelectTemplateColor = (hex) => {
    const base = hex.slice(0, 7).toLowerCase();
    const existingIdx = Object.keys(localColors).find(
      (k) => getBaseHex(localColors[k]).toLowerCase() === base
    );
    if (existingIdx) {
      setActiveColor(parseInt(existingIdx));
      setToastMessage(t('pixelEditor.toasts.colorSelected', { index: existingIdx }));
    } else {
      const nextIdx = Math.max(0, ...Object.keys(localColors).map(Number)) + 1;
      setLocalColors((prev) => ({
        ...prev,
        [nextIdx]: buildHex(hex.slice(0, 7), 100)
      }));
      setActiveColor(nextIdx);
      setToastMessage(t('pixelEditor.toasts.colorAdded', { index: nextIdx }));
    }
  };

  const handleSavePalettePackage = () => {
    const name = paletteSaveName.trim();
    if (!name) {
      alert(t('pixelEditor.errors.missingPaletteName'));
      return;
    }
    importCustomPalette(name, { ...localColors });
    setSelectedPaletteName(name);
    setPaletteSaveName('');
    setToastMessage(t('pixelEditor.toasts.paletteSaved', { name }));
  };

  const handleColorChange = (idx, hex) => {
    setLocalColors(prev => ({ ...prev, [idx]: hex }));
  };

  const handleColorCommit = (idx, hex, originalHex) => {
    const base = getBaseHex(hex).toLowerCase();
    const duplicate = Object.keys(localColors).find(
      (k) => Number(k) !== Number(idx) && getBaseHex(localColors[k]).toLowerCase() === base
    );
    if (duplicate) {
      setToastMessage(t('pixelEditor.toasts.colorDuplicated', { base: base.toUpperCase(), duplicate }));
      setLocalColors(prev => ({ ...prev, [idx]: originalHex }));
    }
  };

  const handleRemoveBrush = (idx) => {
    setLocalColors((prev) => {
      const copy = { ...prev };
      delete copy[idx];
      return copy;
    });
    if (activeColor === idx) {
      setActiveColor(0);
    }
  };

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
          alert(t('pixelEditor.errors.invalidPalette'));
          return;
        }
        importCustomPalette(name, colors, labels);
        setSelectedPaletteName(name);
        mergePalette(colors, labels);
        setToastMessage(t('pixelEditor.toasts.paletteLoaded', { name }));
      } catch (err) {
        console.error(err);
        alert(t('pixelEditor.errors.paletteParseError'));
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
    setToastMessage(t('pixelEditor.toasts.paletteExported'));
  };

  const handlePaletteDelete = () => {
    if (selectedPaletteName === 'default') return;
    if (window.confirm(t('pixelEditor.confirm.deletePalette', { name: selectedPaletteName }))) {
      const name = selectedPaletteName;
      setSelectedPaletteName('default');
      deleteCustomPalette(name);
      setToastMessage(t('pixelEditor.toasts.paletteDeleted', { name }));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Select template palette */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <select
          className="select-custom"
          style={{ flex: 1 }}
          value={selectedPaletteName}
          onChange={(e) => setSelectedPaletteName(e.target.value)}
        >
          <option value="default">{t('pixelEditor.defaultPalette')}</option>
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
            if (window.confirm(t('pixelEditor.confirm.applyPalette'))) {
              mergePalette(currentTemplateColors, currentTemplateLabels);
              setToastMessage(t('pixelEditor.toasts.paletteApplied'));
            }
          }}
          title={t('pixelEditor.tooltipApplyPalette')}
        >
          {t('pixelEditor.btnApplyPalette')}
        </button>
      </div>

      {/* Clickable Template Color Bubbles */}
      <div className="template-colors-bubbles font-sans" style={{ marginTop: '2px' }}>
        <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {t('pixelEditor.templateColorsLabel')}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', padding: '8px' }}>
          {Object.keys(currentTemplateColors).map((k) => {
            const hex = currentTemplateColors[k];
            const displayHex = baseColorMap && baseColorMap[k] ? baseColorMap[k] : hex;
            return (
              <div
                key={k}
                onClick={() => handleSelectTemplateColor(hex)}
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '4px',
                  backgroundColor: displayHex,
                  cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.15)',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                  transition: 'transform 0.1s ease',
                }}
                className="template-color-bubble"
                title={displayHex}
              />
            );
          })}
        </div>
      </div>

      {/* Color Brushes List */}
      <div style={{ borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: '10px', marginTop: '4px' }}>
        <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          🎨 {t('pixelEditor.sectionBrushTitle')}:
        </div>
        <p style={{ margin: '0 0 10px 0', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
          {t('pixelEditor.brushHint')}
        </p>
        <div className="brushes-grid">
          {[0, ...Object.keys(localColors).map(Number).sort((a, b) => a - b)].map((idx, gridIdx) => {
            const label = idx === 0 ? 'Transparent' : (resolvedColors[idx] || '#000000');
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
                    title={t('pixelEditor.tooltipDeleteBrush')}
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
                {idx > 0 ? (
                  <ColorPicker
                    className={`brush-color-preview-box color-${idx}`}
                    color={resolvedColors[idx] || '#ffffff'}
                    onChange={(newHex) => handleColorChange(idx, newHex)}
                    onCommit={(newHex, originalHex) => handleColorCommit(idx, newHex, originalHex)}
                    title={t('pixelEditor.tooltipColorPicker')}
                    align={gridIdx % 2 === 0 ? 'left' : 'right'}
                  />
                ) : (
                  <div
                    className={`brush-color-preview-box color-${idx}`}
                    style={{
                      backgroundColor: 'transparent',
                      backgroundImage: 'repeating-conic-gradient(#333 0% 25%, #555 0% 50%)',
                      backgroundSize: '8px 8px',
                      border: '1px dashed #ffffff44',
                    }}
                  />
                )}
                <div className="brush-meta">
                  <span className="brush-number">#{idx}</span>
                  {idx === 0 ? (
                    <span className="brush-label">{label}</span>
                  ) : (
                    <span
                      className="brush-label"
                      style={{
                        background: 'none',
                        border: 'none',
                        borderBottom: '1px dashed rgba(255,255,255,0.15)',
                        color: '#ffffffff',
                        fontSize: '10px',
                        fontFamily: 'monospace',
                        padding: '2px 0',
                        width: '100%',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >{getBaseHex(resolvedColors[idx]).toUpperCase()}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '6px', marginTop: '8px', alignItems: 'center' }}>
          {/* Color preview + picker for new brush */}
          <ColorPicker
            color={newBrushColor}
            onChange={(newHex) => setNewBrushColor(newHex)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
            }}
            title={t('pixelEditor.tooltipColorPicker')}
          />
          <span className="brush-label">
            {newBrushColor.toUpperCase()}
          </span>
          <button
            className="btn btn-secondary btn-small"
            style={{ flex: 1, border: '1px dashed rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.02)', color: '#00ffff' }}
            onClick={() => {
              const base = newBrushColor.slice(0, 7).toLowerCase();
              const duplicate = Object.keys(localColors).find(
                (k) => getBaseHex(localColors[k]).toLowerCase() === base
              );
              if (duplicate) {
                setActiveColor(parseInt(duplicate));
                setToastMessage(`⚠️ Màu ${newBrushColor.toUpperCase()} đã có ở cọ vẽ #${duplicate}!`);
                return;
              }
              const nextIdx = Math.max(0, ...Object.keys(localColors).map(Number)) + 1;
              setLocalColors(prev => ({ ...prev, [nextIdx]: buildHex(newBrushColor.slice(0, 7), 100) }));
              setActiveColor(nextIdx);
              setToastMessage(t('pixelEditor.toasts.colorAdded', { index: nextIdx }));
            }}
          >
            ➕ {t('pixelEditor.btnAddBrush')}
          </button>
        </div>
      </div>

      {/* Save current brushes as a reusable package */}
      <div className="save-palette-package-box font-sans" style={{ borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: '10px', marginTop: '4px' }}>
        <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          💾 {t('pixelEditor.savePaletteTitle')}
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <input
            type="text"
            className="input-text"
            style={{ flex: 1, fontSize: '11px', padding: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--color-border-glow)', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
            value={paletteSaveName}
            onChange={(e) => setPaletteSaveName(e.target.value)}
            placeholder={t('pixelEditor.savePalettePlaceholder')}
          />
          <button
            className="btn btn-primary btn-small"
            style={{ padding: '0 10px', fontSize: '11px' }}
            onClick={handleSavePalettePackage}
          >
            {t('pixelEditor.btnSavePalette')}
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
          📥 {t('pixelEditor.btnImportPalette')}
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
              title={t('pixelEditor.btnExportPalette')}
            >
              📤
            </button>
            <button
              className="btn btn-secondary btn-small"
              style={{ padding: '6px 10px', background: 'rgba(255,0,85,0.05)', color: '#ff3366', border: '1px solid rgba(255,0,85,0.2)', fontSize: '11px' }}
              onClick={handlePaletteDelete}
              title={t('pixelEditor.btnDeletePalette')}
            >
              <Trash2 size={12} />
            </button>
          </>
        )}
      </div>
    </div>
  );
});

ColorPaletteManager.displayName = 'ColorPaletteManager';

export default ColorPaletteManager;
