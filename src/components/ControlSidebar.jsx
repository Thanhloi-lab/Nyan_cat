import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Sliders, Paintbrush, Link2 } from 'lucide-react';

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
    loadProfile
  } = useContext(AppContext);

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
