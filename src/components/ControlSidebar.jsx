import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Sliders, Paintbrush, Link2, Upload, Trash2 } from 'lucide-react';

const DYNAMIC_SLOT_IDS = [
  'HEAD_OPEN',
  'HEAD_BLINK',
  'POPTART',
  'TAIL_UP',
  'TAIL_MID',
  'TAIL_DOWN',
  'LEG_DOWN',
  'LEG_FRONT',
  'LEG_BACK'
];

export default function ControlSidebar() {
  const {
    settings,
    updateSetting,
    t,
    customParts,
    bindings,
    bindPartToSlot,
    profiles,
    activeProfileId,
    loadProfile,
    customPalettes,
    importCustomPalette,
    deleteCustomPalette,
    setToastMessage
  } = useContext(AppContext);

  const [isCreatingPalette, setIsCreatingPalette] = useState(false);
  const [newPaletteName, setNewPaletteName] = useState('');
  const [newPaletteColors, setNewPaletteColors] = useState({
    1: '#ff0000',
    2: '#00ff00',
    3: '#0000ff',
    4: '#ffff00'
  });

  const handleNewPaletteColorChange = (idx, hex) => {
    setNewPaletteColors(prev => ({ ...prev, [idx]: hex }));
  };

  const handleAddNewPaletteColor = () => {
    const nextIdx = Math.max(0, ...Object.keys(newPaletteColors).map(Number)) + 1;
    setNewPaletteColors(prev => ({ ...prev, [nextIdx]: '#ffffff' }));
  };

  const handleRemoveNewPaletteColor = (idx) => {
    setNewPaletteColors(prev => {
      const copy = { ...prev };
      delete copy[idx];
      // Re-key sequentially to make it clean
      const keys = Object.keys(copy).map(Number).sort((a, b) => a - b);
      const rekeyed = {};
      keys.forEach((k, i) => {
        rekeyed[i + 1] = copy[k];
      });
      return rekeyed;
    });
  };

  const handleSaveAndExportPalette = () => {
    const name = newPaletteName.trim();
    if (!name) {
      alert(t('pixelEditor.errors.missingPaletteName') || '⚠️ Vui lòng nhập tên gói màu!');
      return;
    }
    if (Object.keys(newPaletteColors).length === 0) {
      alert('⚠️ Gói màu phải có ít nhất 1 màu!');
      return;
    }

    // 1. Save to global library
    importCustomPalette(name, newPaletteColors);

    // 2. Download JSON file
    const payload = {
      paletteName: name,
      colors: newPaletteColors
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name.replace(/\s+/g, '_').toLowerCase()}_palette.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // 3. Reset state & notify
    setIsCreatingPalette(false);
    setNewPaletteName('');
    setNewPaletteColors({ 1: '#ff0000', 2: '#00ff00', 3: '#0000ff', 4: '#ffff00' });
    if (setToastMessage) {
      setToastMessage(t('pixelEditor.toasts.paletteSaved', { name }) || `🎨 Đã lưu gói màu "${name}" vào thư viện!`);
    }
  };

  const handleExportPaletteGlobal = (name) => {
    const palette = customPalettes[name];
    if (!palette) return;
    const colors = palette.colors || palette;
    const labels = palette.labels || {};
    const payload = {
      paletteName: name,
      colors,
      labels
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name.replace(/\s+/g, '_').toLowerCase()}_palette.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    if (setToastMessage) {
      setToastMessage(t('pixelEditor.toasts.paletteExported') || '📤 Đã xuất gói màu thành công!');
    }
  };

  const handlePaletteUploadGlobal = (e) => {
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
        if (setToastMessage) {
          setToastMessage(t('pixelEditor.toasts.paletteLoaded', { name }) || `🎨 Đã nạp gói màu "${name}" thành công!`);
        }
      } catch (err) {
        console.error(err);
        alert(t('pixelEditor.errors.paletteParseError') || '❌ Lỗi khi đọc file JSON gói màu!');
      }
    };
    reader.readAsText(file);
  };

  const handlePaletteDeleteGlobal = (name) => {
    if (window.confirm(t('pixelEditor.confirm.deletePalette', { name }) || `Gỡ bỏ gói màu "${name}" khỏi danh sách?`)) {
      deleteCustomPalette(name);
      if (setToastMessage) {
        setToastMessage(t('pixelEditor.toasts.paletteDeleted', { name }) || `🗑️ Đã gỡ gói màu "${name}".`);
      }
    }
  };

  return (
    <aside className="sidebar-container font-sans">
      {/* Block 1: Running parameters */}
      <div className="sidebar-card glass-card">
        <div className="sidebar-header">
          <Sliders size={16} className="text-magenta" />
          <h3>{t('sidebar.dynamicControls')}</h3>
        </div>

        {/* Language */}
        <div className="control-group">
          <label className="control-label">{t ? t('settings.language') : 'Language'}</label>
          <select
            className="select-custom"
            value={settings.language || 'vi'}
            onChange={(e) => updateSetting('language', e.target.value)}
          >
            <option value="vi">{t ? t('lang.vi') : 'Vietnamese'}</option>
            <option value="en">{t ? t('lang.en') : 'English'}</option>
          </select>
        </div>

        {/* Movement Mode */}
        <div className="control-group">
          <label className="control-label">{t('sidebar.movementMode')}</label>
          <div className="btn-toggle-group" style={{ display: 'flex', gap: '2px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--color-border-glow)', borderRadius: '6px', padding: '2px' }}>
            <button
              className={`toggle-btn ${settings.movementMode === 'crosser' ? 'active' : ''}`}
              onClick={() => updateSetting('movementMode', 'crosser')}
              style={{ flex: 1, fontSize: '10px', padding: '6px 2px', whiteSpace: 'nowrap' }}
            >
              {t('movement.crosser')}
            </button>
            <button
              className={`toggle-btn ${settings.movementMode === 'stationary' ? 'active' : ''}`}
              onClick={() => updateSetting('movementMode', 'stationary')}
              style={{ flex: 1, fontSize: '10px', padding: '6px 2px', whiteSpace: 'nowrap' }}
            >
              {t('movement.stationary')}
            </button>
            <button
              className={`toggle-btn ${settings.movementMode === 'assembler' ? 'active' : ''}`}
              onClick={() => {
                updateSetting('movementMode', 'assembler');
                if (!activeProfileId && Object.keys(profiles).length > 0) {
                  loadProfile(Object.keys(profiles)[0]);
                }
              }}
              style={{ flex: 1, fontSize: '10px', padding: '6px 2px', whiteSpace: 'nowrap' }}
            >
              {t('movement.assembler')}
            </button>
          </div>
        </div>

        {/* Active Custom Model Selector (Only visible in assembler mode) */}
        {settings.movementMode === 'assembler' && (
          <div className="control-group animate-fade-in" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '10px', marginTop: '10px' }}>
            <label className="control-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Active Custom Profile</span>
              <span className="card-tag font-sans" style={{ fontSize: '9px', padding: '2px 4px', background: 'rgba(0, 229, 255, 0.1)', color: '#00e5ff' }}>MODE B</span>
            </label>
            {Object.keys(profiles).length === 0 ? (
              <div style={{ fontSize: '11px', color: '#888', fontStyle: 'italic', padding: '4px 0' }}>
                {t('sidebar.noProfilesHint')}
              </div>
            ) : (
              <select
                className="select-custom"
                value={activeProfileId || ''}
                onChange={(e) => loadProfile(e.target.value)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--color-border-glow)', color: '#fff', borderRadius: '4px', padding: '6px', outline: 'none' }}
              >
                <option value="" disabled>{t('sidebar.chooseProfile')}</option>
                {Object.keys(profiles).map((id) => (
                  <option key={id} value={id}>{profiles[id].name}</option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Pixel Art Scale */}
        <div className="control-group">
          <div className="slider-row">
            <label className="control-label">{t('sidebar.pixelScale')}</label>
            <span className="slider-val text-cyan">{settings.scale}x</span>
          </div>
          <input
            type="range"
            min="3"
            max="10"
            value={settings.scale}
            onChange={(e) => updateSetting('scale', parseInt(e.target.value))}
            className="custom-slider"
          />
        </div>

        {/* Speed FPS */}
        <div className="control-group">
          <div className="slider-row">
            <label className="control-label">{t('sidebar.fps')}</label>
            <span className="slider-val text-cyan">{settings.fps} FPS</span>
          </div>
          <input
            type="range"
            min="10"
            max="60"
            value={settings.fps}
            onChange={(e) => updateSetting('fps', parseInt(e.target.value))}
            className="custom-slider"
          />
        </div>

        {/* Space Star Density */}
        {settings.movementMode !== 'assembler' && (
          <div className="control-group">
            <div className="slider-row">
              <label className="control-label">{t('sidebar.starDensity')}</label>
              <span className="slider-val text-cyan">{t('sidebar.starCount', { count: settings.starDensity })}</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={settings.starDensity}
              onChange={(e) => updateSetting('starDensity', parseInt(e.target.value))}
              className="custom-slider"
            />
          </div>
        )}
      </div>

      {/* Block 2: Sprite Customize & Color Picking */}
      <div className="sidebar-card glass-card">
        <div className="sidebar-header">
          <Paintbrush size={16} className="text-yellow" />
          <h3>{t('sidebar.customizeSprite')}</h3>
        </div>

        {/* Skin Selector */}
        <div className="control-group">
          <label className="control-label">{t('sidebar.skinStyle')}</label>
          <select
            className="select-custom"
            value={settings.skinStyle}
            onChange={(e) => updateSetting('skinStyle', e.target.value)}
          >
            <option value="classic">{t('skin.classic')}</option>
            <option value="tabby">{t('skin.tabby')}</option>
            <option value="siamese">{t('skin.siamese')}</option>
            <option value="void">{t('skin.void')}</option>
            <option value="albino">{t('skin.albino')}</option>
          </select>
        </div>

        {/* Poptart selector */}
        <div className="control-group">
          <label className="control-label">{t('sidebar.poptartStyle')}</label>
          <select
            className="select-custom"
            value={settings.poptartStyle}
            onChange={(e) => updateSetting('poptartStyle', e.target.value)}
          >
            <option value="strawberry">{t('poptart.strawberry')}</option>
            <option value="blueberry">{t('poptart.blueberry')}</option>
            <option value="chocolate">{t('poptart.chocolate')}</option>
            <option value="custom">{t('poptart.custom')}</option>
          </select>
        </div>

        {/* Custom Poptart color picker */}
        {settings.poptartStyle === 'custom' && (
          <div className="custom-colors-picker-box font-sans">
            <div className="picker-row">
              <div className="picker-col">
                <label>{t('sidebar.frosting')}</label>
                <input
                  type="color"
                  value={settings.customFrostingColor}
                  onChange={(e) => updateSetting('customFrostingColor', e.target.value)}
                />
              </div>
              <div className="picker-col">
                <label>{t('sidebar.crust')}</label>
                <input
                  type="color"
                  value={settings.customCrustColor}
                  onChange={(e) => updateSetting('customCrustColor', e.target.value)}
                />
              </div>
              <div className="picker-col">
                <label>{t('sidebar.sprinkles')}</label>
                <input
                  type="color"
                  value={settings.customSprinkleColor}
                  onChange={(e) => updateSetting('customSprinkleColor', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Head position offsets (visible only in dynamic animations) */}
        {settings.movementMode !== 'assembler' && (
          <div className="head-offsets-box font-sans">
            <h4 className="sub-title">{t('sidebar.headFineTune')}</h4>
            <div className="slider-row">
              <label>{t('sidebar.headDx')}</label>
              <span className="text-cyan">{settings.headDx} px</span>
            </div>
            <input
              type="range"
              min="8"
              max="25"
              value={settings.headDx}
              onChange={(e) => updateSetting('headDx', parseInt(e.target.value))}
              className="custom-slider"
            />
            <div className="slider-row" style={{ marginTop: 8 }}>
              <label>{t('sidebar.headDy')}</label>
              <span className="text-cyan">{settings.headDy} px</span>
            </div>
            <input
              type="range"
              min="-8"
              max="8"
              value={settings.headDy}
              onChange={(e) => updateSetting('headDy', parseInt(e.target.value))}
              className="custom-slider"
            />
          </div>
        )}

        {/* Rainbow Style selector */}
        {settings.movementMode !== 'assembler' && (
          <div className="control-group" style={{ marginTop: 12 }}>
            <label className="control-label">{t('sidebar.rainbowStyle')}</label>
            <select
              className="select-custom"
              value={settings.rainbowStyle}
              onChange={(e) => updateSetting('rainbowStyle', e.target.value)}
            >
              <option value="classic">{t('rainbow.classic')}</option>
              <option value="neon">{t('rainbow.neon')}</option>
              <option value="pastel">{t('rainbow.pastel')}</option>
              <option value="monochrome">{t('rainbow.monochrome')}</option>
            </select>
          </div>
        )}
      </div>

      {/* Block 2.5: Custom Palette Package Manager */}
      <div className="sidebar-card glass-card">
        <div className="sidebar-header">
          <Paintbrush size={16} className="text-magenta" />
          <h3>{t('sidebar.paletteTitle') || 'QUẢN LÝ GÓI MÀU'}</h3>
        </div>
        <p className="binding-desc font-sans">
          {t('sidebar.paletteDesc') || 'Nạp các gói bảng màu tùy chỉnh từ tệp JSON bên ngoài.'}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
          
          <div style={{ display: 'flex', gap: '6px' }}>
            <label className="btn btn-secondary cursor-pointer" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', padding: '6px 8px', gap: '4px', height: '26px' }}>
              <Upload size={12} /> {t('sidebar.btnImportPalette') || 'Nạp Gói Màu'}
              <input
                type="file"
                accept=".json"
                onChange={handlePaletteUploadGlobal}
                style={{ display: 'none' }}
              />
            </label>
            <button
              className="btn btn-primary"
              style={{ flex: 1, fontSize: '10px', padding: '6px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', height: '26px' }}
              onClick={() => setIsCreatingPalette(!isCreatingPalette)}
            >
              {t('sidebar.btnCreatePalette') || '➕ Tạo Gói Màu'}
            </button>
          </div>

          {/* Collapsible Palette Creator Panel */}
          {isCreatingPalette && (
            <div className="palette-creator-panel font-sans animate-slide-down" style={{
              background: 'rgba(255,0,127,0.03)',
              border: '1px dashed rgba(255,0,127,0.25)',
              borderRadius: '8px',
              padding: '10px',
              marginTop: '4px',
              fontSize: '11px'
            }}>
              <div style={{ color: '#ff007f', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                🎨 {t('sidebar.paletteCreatorTitle') || 'Thiết Kế Gói Màu Mới'}:
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  type="text"
                  className="input-text"
                  style={{ fontSize: '11px', padding: '6px' }}
                  value={newPaletteName}
                  onChange={(e) => setNewPaletteName(e.target.value)}
                  placeholder={t('pixelEditor.savePalettePlaceholder') || 'Tên gói màu mới...'}
                />

                {/* Color bubbles list */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', padding: '8px' }}>
                  {Object.keys(newPaletteColors).map((k) => {
                    const idx = parseInt(k);
                    const hex = newPaletteColors[k];
                    return (
                      <div
                        key={k}
                        style={{
                          position: 'relative',
                          width: '24px',
                          height: '24px',
                          borderRadius: '4px',
                          backgroundColor: hex,
                          border: '1px solid rgba(255,255,255,0.15)',
                          cursor: 'pointer'
                        }}
                        title={`Màu #${idx}: ${hex}`}
                      >
                        <input
                          type="color"
                          value={hex}
                          onChange={(e) => handleNewPaletteColorChange(idx, e.target.value)}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            opacity: 0,
                            cursor: 'pointer'
                          }}
                        />
                        {/* Remove bubble button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveNewPaletteColor(idx);
                          }}
                          style={{
                            position: 'absolute',
                            top: '-6px',
                            right: '-6px',
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: '#ff3366',
                            border: 'none',
                            color: '#fff',
                            fontSize: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    className="btn btn-secondary btn-small"
                    style={{ flex: 1, fontSize: '10px', padding: '6px 0' }}
                    onClick={handleAddNewPaletteColor}
                  >
                    {t('sidebar.btnAddColor') || '➕ Thêm Màu'}
                  </button>
                  <button
                    className="btn btn-primary btn-glow"
                    style={{ flex: 1.2, fontSize: '10px', padding: '6px 0', background: 'linear-gradient(135deg, #7928ca 0%, #ff007f 100%)' }}
                    onClick={handleSaveAndExportPalette}
                  >
                    {t('sidebar.btnSaveAndExport') || '💾 Lưu & Tải JSON'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {customPalettes && Object.keys(customPalettes).length > 0 && (
            <div className="palette-loaded-list animate-fade-in" style={{ 
              background: 'rgba(0,0,0,0.3)', 
              borderRadius: '8px', 
              padding: '10px', 
              maxHeight: '130px', 
              overflowY: 'auto',
              border: '1px solid rgba(255,255,255,0.05)',
              fontSize: '11px',
              textAlign: 'left'
            }}>
              <div style={{ color: '#ff007f', fontWeight: 'bold', marginBottom: '6px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {t('sidebar.loadedPalettes') || 'Các gói màu đã nạp'}:
              </div>
              {Object.keys(customPalettes).map((name) => (
                <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <span style={{ color: '#00ffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '110px' }} title={name}>
                    🎨 {name}
                  </span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => handleExportPaletteGlobal(name)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#00ffff',
                        cursor: 'pointer',
                        padding: '2px 4px',
                        fontSize: '11px'
                      }}
                      title={t('sidebar.tooltipExportPalette') || "Tải tệp JSON gói màu về máy"}
                    >
                      📤
                    </button>
                    <button
                      onClick={() => handlePaletteDeleteGlobal(name)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ff3366',
                        cursor: 'pointer',
                        padding: '2px 4px',
                        fontSize: '11px'
                      }}
                      title="Gỡ gói màu"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Block 3: Dynamic Motion Slot Bindings */}
      {settings.movementMode !== 'assembler' && (
        <div className="sidebar-card glass-card">
          <div className="sidebar-header">
            <Link2 size={16} className="text-cyan" />
            <h3>{t('sidebar.motionBindings')}</h3>
          </div>
          <p className="binding-desc font-sans">
            {t('sidebar.motionBindingsDesc')}
          </p>
          
          <div className="bindings-slots-list font-sans">
            {DYNAMIC_SLOT_IDS.map((slotId) => {
              return (
                <div key={slotId} className="binding-slot-row">
                  <span className="slot-title">{t(`slots.${slotId}`)}</span>
                  <select
                    className="select-custom select-compact"
                    value={bindings[slotId] || 'default'}
                    onChange={(e) => bindPartToSlot(slotId, e.target.value)}
                  >
                    <option value="default">{t('sidebar.defaultSprite')}</option>
                    {Object.keys(customParts).map((key) => (
                      <option key={key} value={key}>
                        {customParts[key].name} ({customParts[key].width}x{customParts[key].height})
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}
