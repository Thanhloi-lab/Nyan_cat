import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Sliders, Paintbrush, Link2 } from 'lucide-react';

const DYNAMIC_SLOTS = [
  { id: 'HEAD_OPEN', label: 'Cat Head (Eyes Open)' },
  { id: 'HEAD_BLINK', label: 'Cat Head (Blinking)' },
  { id: 'POPTART', label: 'Pop-Tart Toast Body' },
  { id: 'TAIL_UP', label: 'Tail (Upward wave)' },
  { id: 'TAIL_MID', label: 'Tail (Horizontal wave)' },
  { id: 'TAIL_DOWN', label: 'Tail (Downward wave)' },
  { id: 'LEG_DOWN', label: 'Leg (Straight down)' },
  { id: 'LEG_FRONT', label: 'Leg (Kick front)' },
  { id: 'LEG_BACK', label: 'Leg (Kick back)' }
];

export default function ControlSidebar() {
  const {
    settings,
    updateSetting,
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
          <h3>DYNAMIC SYSTEM CONTROLS</h3>
        </div>

        {/* Movement Mode */}
        <div className="control-group">
          <label className="control-label">Movement Mode</label>
          <div className="btn-toggle-group" style={{ display: 'flex', gap: '2px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--color-border-glow)', borderRadius: '6px', padding: '2px' }}>
            <button
              className={`toggle-btn ${settings.movementMode === 'crosser' ? 'active' : ''}`}
              onClick={() => updateSetting('movementMode', 'crosser')}
              style={{ flex: 1, fontSize: '10px', padding: '6px 2px', whiteSpace: 'nowrap' }}
            >
              Crosser
            </button>
            <button
              className={`toggle-btn ${settings.movementMode === 'stationary' ? 'active' : ''}`}
              onClick={() => updateSetting('movementMode', 'stationary')}
              style={{ flex: 1, fontSize: '10px', padding: '6px 2px', whiteSpace: 'nowrap' }}
            >
              Hover
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
              Custom Model
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
                Không có profile nào. Hãy tạo mới ở trang Assembler Studio!
              </div>
            ) : (
              <select
                className="select-custom"
                value={activeProfileId || ''}
                onChange={(e) => loadProfile(e.target.value)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--color-border-glow)', color: '#fff', borderRadius: '4px', padding: '6px', outline: 'none' }}
              >
                <option value="" disabled>-- Chọn profile --</option>
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
            <label className="control-label">Pixel Art Scale</label>
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
            <label className="control-label">Running Speed (FPS)</label>
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
              <label className="control-label">Space Stars Density</label>
              <span className="slider-val text-cyan">{settings.starDensity} stars</span>
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
          <h3>CUSTOMIZE SPRITE</h3>
        </div>

        {/* Skin Selector */}
        <div className="control-group">
          <label className="control-label">Cat Skin Color</label>
          <select
            className="select-custom"
            value={settings.skinStyle}
            onChange={(e) => updateSetting('skinStyle', e.target.value)}
          >
            <option value="classic">Classic Grey</option>
            <option value="tabby">Orange Tabby</option>
            <option value="siamese">Siamese Cream</option>
            <option value="void">Void Black</option>
            <option value="albino">Albino White</option>
          </select>
        </div>

        {/* Poptart selector */}
        <div className="control-group">
          <label className="control-label">Pop-Tart Flavor Theme</label>
          <select
            className="select-custom"
            value={settings.poptartStyle}
            onChange={(e) => updateSetting('poptartStyle', e.target.value)}
          >
            <option value="strawberry">Strawberry Pink</option>
            <option value="blueberry">Blueberry Blue</option>
            <option value="chocolate">Chocolate Fudge</option>
            <option value="custom">Custom Theme</option>
          </select>
        </div>

        {/* Custom Poptart color picker */}
        {settings.poptartStyle === 'custom' && (
          <div className="custom-colors-picker-box font-sans">
            <div className="picker-row">
              <div className="picker-col">
                <label>Frosting</label>
                <input
                  type="color"
                  value={settings.customFrostingColor}
                  onChange={(e) => updateSetting('customFrostingColor', e.target.value)}
                />
              </div>
              <div className="picker-col">
                <label>Crust</label>
                <input
                  type="color"
                  value={settings.customCrustColor}
                  onChange={(e) => updateSetting('customCrustColor', e.target.value)}
                />
              </div>
              <div className="picker-col">
                <label>Sprinkles</label>
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
            <h4 className="sub-title">Head Placement Fine-Tuning</h4>
            <div className="slider-row">
              <label>Horizontal (HEAD_DX)</label>
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
              <label>Vertical (HEAD_DY)</label>
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
            <label className="control-label">Rainbow Trail Wave Style</label>
            <select
              className="select-custom"
              value={settings.rainbowStyle}
              onChange={(e) => updateSetting('rainbowStyle', e.target.value)}
            >
              <option value="classic">Classic Rainbow</option>
              <option value="neon">Cyberpunk Neon</option>
              <option value="pastel">Pastel Dreams</option>
              <option value="monochrome">Monochrome Wave</option>
            </select>
          </div>
        )}
      </div>

      {/* Block 3: Dynamic Motion Slot Bindings */}
      {settings.movementMode !== 'assembler' && (
        <div className="sidebar-card glass-card">
          <div className="sidebar-header">
            <Link2 size={16} className="text-cyan" />
            <h3>MOTION SLOT BINDINGS</h3>
          </div>
          <p className="binding-desc font-sans">
            Gán các bộ phận vẽ tùy chỉnh (My Custom Sprites) của bạn vào các khớp chuyển động nhấp nhô của Nyan Cat.
          </p>
          
          <div className="bindings-slots-list font-sans">
            {DYNAMIC_SLOTS.map((slot) => {
              return (
                <div key={slot.id} className="binding-slot-row">
                  <span className="slot-title">{slot.label}</span>
                  <select
                    className="select-custom select-compact"
                    value={bindings[slot.id] || 'default'}
                    onChange={(e) => bindPartToSlot(slot.id, e.target.value)}
                  >
                    <option value="default">Default Sprite (Mặc định)</option>
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
