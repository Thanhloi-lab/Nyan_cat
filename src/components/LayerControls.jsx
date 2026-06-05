import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { Eye, EyeOff } from "lucide-react";
import MiniCanvasPreview from "./MiniCanvasPreview";
import { getSpriteMatrix } from "../utils/nyanRenderer";

const LayerControls = React.memo(({
  activeLayer,
  activeLayerId,
  resolution,
  updateLayer,
  activeProfileId
}) => {
  const {
    customParts,
    t,
    defaultSprites,
    settings,
    updateSetting
  } = useContext(AppContext);

  const isReadOnly = activeProfileId === "system_default";

  const [tempX, setTempX] = useState("");
  const [tempY, setTempY] = useState("");
  const [activeFrameIndex, setActiveFrameIndex] = useState(0);

  // Sync inputs with active layer coordinates
  useEffect(() => {
    if (activeLayer) {
      setTempX(activeLayer.x.toString());
      setTempY(activeLayer.y.toString());
    } else {
      setTempX("");
      setTempY("");
    }
  }, [activeLayerId, activeLayer]);

  // Keyboard nudge offsets
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!activeLayerId || !activeLayer || isReadOnly) return;

      // If user is typing in an input field, do not trigger coordinate nudging!
      if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA") {
        return;
      }

      const step = e.shiftKey ? 10 : 1;

      if (e.key === "ArrowUp") {
        e.preventDefault();
        updateLayer(activeLayerId, { y: activeLayer.y - step });
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        updateLayer(activeLayerId, { y: activeLayer.y + step });
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        updateLayer(activeLayerId, { x: activeLayer.x - step });
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        updateLayer(activeLayerId, { x: activeLayer.x + step });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeLayerId, activeLayer, updateLayer, isReadOnly]);

  if (!activeLayer) return null;

  const handleSpinnerChange = (coord, val) => {
    if (isReadOnly) return;
    const maxLimit = coord === "x" ? resolution.width : resolution.height;
    const setTemp = coord === "x" ? setTempX : setTempY;

    if (coord === "x") setTempX(val);
    else setTempY(val);

    if (val === "" || val === "-") {
      return;
    }

    const parsed = parseInt(val);
    if (!isNaN(parsed)) {
      const clamped = Math.max(0, Math.min(maxLimit, parsed));
      updateLayer(activeLayerId, { [coord]: clamped });
    }
  };

  const handleSpinnerBlur = (coord) => {
    if (isReadOnly) return;
    const val = coord === "x" ? tempX : tempY;
    const maxLimit = coord === "x" ? resolution.width : resolution.height;
    let parsed = parseInt(val);

    if (isNaN(parsed)) {
      parsed = activeLayer[coord];
    }

    const clamped = Math.max(0, Math.min(maxLimit, parsed));
    updateLayer(activeLayerId, { [coord]: clamped });

    if (coord === "x") {
      setTempX(clamped.toString());
    } else {
      setTempY(clamped.toString());
    }
  };

  const handleSpinnerClick = (coord, step) => {
    if (isReadOnly) return;
    const currentVal = activeLayer[coord];
    const maxLimit = coord === "x" ? resolution.width : resolution.height;
    const newVal = Math.max(0, Math.min(maxLimit, currentVal + step));
    updateLayer(activeLayerId, { [coord]: newVal });
  };

  const partNameLower = (activeLayer.partName || "").toLowerCase();
  const isTrailLayer = activeLayer.isProceduralTrail !== undefined
    ? activeLayer.isProceduralTrail
    : (partNameLower.includes("trail") ||
       partNameLower.includes("rainbow") ||
       partNameLower.includes("stripe"));

  const trailSettings = settings?.trail || {
    enabled: true,
    spacing: 6,
    waveType: "blocky",
    waveAmplitude: 1,
    animationDivisor: 4,
  };

  const handleTrailSettingChange = (field, val) => {
    if (isReadOnly) return;
    updateSetting("trail", {
      ...trailSettings,
      [field]: val,
    });
  };

  // Motion frames actions
  const handleUpdateFrameField = (index, key, val) => {
    if (isReadOnly) return;
    const frames = [...(activeLayer.motionFrames || [])];
    if (!frames[index]) return;
    frames[index] = { ...frames[index], [key]: val };
    updateLayer(activeLayerId, { motionFrames: frames });
  };

  const handleAddFrame = () => {
    if (isReadOnly) return;
    const frames = [...(activeLayer.motionFrames || [])];
    frames.push({
      partName: activeLayer.partName,
      dx: 0,
      dy: 0,
    });
    updateLayer(activeLayerId, { motionFrames: frames });
    setActiveFrameIndex(frames.length - 1);
  };

  const handleRemoveFrame = (index) => {
    if (isReadOnly) return;
    const frames = (activeLayer.motionFrames || []).filter((_, idx) => idx !== index);
    updateLayer(activeLayerId, { motionFrames: frames });
    setActiveFrameIndex(Math.max(0, index - 1));
  };

  const activeFrames = activeLayer.motionFrames || [];
  const currentFrame = activeFrames[activeFrameIndex];

  return (
    <>
      {/* Precise Coordinate Offset controls */}
      <div className="panel-section highlight">
        <h3>2. Fine-tune Active Layer Coordinates</h3>
        <div className="active-coordinate-sliders">
          <span className="active-title font-sans">
            Selected: <strong>{activeLayer.partName}</strong>
          </span>

          {/* X coordinate slider */}
          <div className="slider-box font-sans">
            <div className="slider-meta">
              <label>X Position (Horizontal)</label>
              <span>{activeLayer.x} px</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="range"
                min="0"
                max={resolution.width}
                value={activeLayer.x}
                onChange={(e) =>
                  updateLayer(activeLayerId, {
                    x: parseInt(e.target.value) || 0,
                  })
                }
                className="custom-slider"
                style={{ flex: 1, opacity: isReadOnly ? 0.5 : 1, cursor: isReadOnly ? "not-allowed" : "pointer" }}
                disabled={isReadOnly}
              />
              <div
                className="cyber-spinner-wrapper"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "2px",
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "4px",
                  padding: "2px",
                  opacity: isReadOnly ? 0.6 : 1
                }}
              >
                <button
                  onClick={() => handleSpinnerClick("x", -1)}
                  disabled={isReadOnly}
                  style={{
                    background: "none",
                    border: "none",
                    color: isReadOnly ? "#666" : "var(--color-neon-cyan)",
                    width: "20px",
                    height: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: isReadOnly ? "not-allowed" : "pointer",
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                >
                  -
                </button>
                <input
                  type="text"
                  value={tempX}
                  onChange={(e) => handleSpinnerChange("x", e.target.value)}
                  onBlur={() => handleSpinnerBlur("x")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSpinnerBlur("x");
                  }}
                  disabled={isReadOnly}
                  style={{
                    width: "45px",
                    height: "20px",
                    background: "rgba(0, 0, 0, 0.5)",
                    border: isReadOnly ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid rgba(0, 242, 254, 0.3)",
                    borderRadius: "3px",
                    color: isReadOnly ? "#888" : "#fff",
                    textAlign: "center",
                    fontSize: "11px",
                    outline: "none",
                    fontFamily: "monospace",
                    cursor: isReadOnly ? "not-allowed" : "text"
                  }}
                />
                <button
                  onClick={() => handleSpinnerClick("x", 1)}
                  disabled={isReadOnly}
                  style={{
                    background: "none",
                    border: "none",
                    color: isReadOnly ? "#666" : "var(--color-neon-cyan)",
                    width: "20px",
                    height: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: isReadOnly ? "not-allowed" : "pointer",
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                >
                  +
                </button>
              </div>
            </div>
          </div>
 
          {/* Y coordinate slider */}
          <div className="slider-box font-sans">
            <div className="slider-meta">
              <label>Y Position (Vertical)</label>
              <span>{activeLayer.y} px</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="range"
                min="0"
                max={resolution.height}
                value={activeLayer.y}
                onChange={(e) =>
                  updateLayer(activeLayerId, {
                    y: parseInt(e.target.value) || 0,
                  })
                }
                className="custom-slider"
                style={{ flex: 1, opacity: isReadOnly ? 0.5 : 1, cursor: isReadOnly ? "not-allowed" : "pointer" }}
                disabled={isReadOnly}
              />
              <div
                className="cyber-spinner-wrapper"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "2px",
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "4px",
                  padding: "2px",
                  opacity: isReadOnly ? 0.6 : 1
                }}
              >
                <button
                  onClick={() => handleSpinnerClick("y", -1)}
                  disabled={isReadOnly}
                  style={{
                    background: "none",
                    border: "none",
                    color: isReadOnly ? "#666" : "var(--color-neon-pink, #ff007f)",
                    width: "20px",
                    height: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: isReadOnly ? "not-allowed" : "pointer",
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                >
                  -
                </button>
                <input
                  type="text"
                  value={tempY}
                  onChange={(e) => handleSpinnerChange("y", e.target.value)}
                  onBlur={() => handleSpinnerBlur("y")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSpinnerBlur("y");
                  }}
                  disabled={isReadOnly}
                  style={{
                    width: "45px",
                    height: "20px",
                    background: "rgba(0, 0, 0, 0.5)",
                    border: isReadOnly ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid rgba(255, 0, 127, 0.3)",
                    borderRadius: "3px",
                    color: isReadOnly ? "#888" : "#fff",
                    textAlign: "center",
                    fontSize: "11px",
                    outline: "none",
                    fontFamily: "monospace",
                    cursor: isReadOnly ? "not-allowed" : "text"
                  }}
                />
                <button
                  onClick={() => handleSpinnerClick("y", 1)}
                  disabled={isReadOnly}
                  style={{
                    background: "none",
                    border: "none",
                    color: isReadOnly ? "#666" : "var(--color-neon-pink, #ff007f)",
                    width: "20px",
                    height: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: isReadOnly ? "not-allowed" : "pointer",
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                >
                  +
                </button>
              </div>
            </div>
          </div>
          
          {/* Checkbox to force/toggle procedural trail mode */}
          <div className="control-group font-sans" style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <label
              className="cyber-switch-label"
              style={{
                display: "flex",
                alignItems: "center",
                cursor: isReadOnly ? "not-allowed" : "pointer",
                fontSize: "12px",
                opacity: isReadOnly ? 0.6 : 1
              }}
            >
              <input
                type="checkbox"
                checked={isTrailLayer}
                onChange={(e) => {
                  updateLayer(activeLayerId, { isProceduralTrail: e.target.checked });
                }}
                disabled={isReadOnly}
                style={{
                  marginRight: "6px",
                  width: "14px",
                  height: "14px",
                  accentColor: "var(--color-neon-cyan, #00f2fe)",
                  cursor: isReadOnly ? "not-allowed" : "pointer",
                }}
              />
              <span
                style={{
                  color: isTrailLayer ? "var(--color-neon-cyan, #00f2fe)" : "#888",
                  fontWeight: isTrailLayer ? "bold" : "normal",
                }}
              >
                {t("modelAssembler.layers.isProceduralTrail") || "Dùng làm Vệt đuôi chạy sóng (Procedural Trail)"}
              </span>
            </label>
          </div>
        </div>
      </div>

      {isTrailLayer ? (
        /* Trail Procedural Animation Controls */
        <div
          className="panel-section highlight font-sans"
          style={{ borderTop: "2px solid var(--color-neon-cyan, #00f2fe)" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "12px",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                color: "var(--color-neon-cyan, #00f2fe)",
              }}
            >
              {t("modelAssembler.trail.heading") || "Cấu Hình Hiệu Ứng Sóng Vệt Đuôi"}
            </h3>
            <label
              className="cyber-switch-label"
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              <input
                type="checkbox"
                checked={!!trailSettings.enabled}
                onChange={(e) => handleTrailSettingChange("enabled", e.target.checked)}
                style={{
                  marginRight: "6px",
                  width: "14px",
                  height: "14px",
                  accentColor: "var(--color-neon-cyan, #00f2fe)",
                }}
              />
              <strong
                style={{
                  color: trailSettings.enabled ? "var(--color-neon-cyan, #00f2fe)" : "#888",
                }}
              >
                {trailSettings.enabled ? "ENABLE" : "OFF"}
              </strong>
            </label>
          </div>

          {trailSettings.enabled && (
            <div className="motion-editor-panel animate-slide-down" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Spacing Slider */}
              <div className="slider-box font-sans" style={{ padding: 0, background: 'none', border: 'none' }}>
                <div className="slider-meta" style={{ marginBottom: '4px' }}>
                  <label style={{ fontSize: '11px', color: '#a0aab5' }}>
                    {t("modelAssembler.trail.spacing") || "Khoảng cách đốt đuôi (Spacing):"}
                  </label>
                  <span style={{ fontSize: '11px', color: '#fff', fontWeight: 'bold' }}>{trailSettings.spacing} px</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={trailSettings.spacing}
                  onChange={(e) => handleTrailSettingChange("spacing", parseInt(e.target.value) || 6)}
                  className="custom-slider"
                  style={{ width: "100%" }}
                />
              </div>

              {/* Wave Amplitude Slider */}
              <div className="slider-box font-sans" style={{ padding: 0, background: 'none', border: 'none' }}>
                <div className="slider-meta" style={{ marginBottom: '4px' }}>
                  <label style={{ fontSize: '11px', color: '#a0aab5' }}>
                    {t("modelAssembler.trail.amplitude") || "Biên độ dao động (Amplitude):"}
                  </label>
                  <span style={{ fontSize: '11px', color: '#fff', fontWeight: 'bold' }}>{trailSettings.waveAmplitude} px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={trailSettings.waveAmplitude}
                  onChange={(e) => handleTrailSettingChange("waveAmplitude", parseFloat(e.target.value) || 0)}
                  className="custom-slider"
                  style={{ width: "100%" }}
                />
              </div>

              {/* Animation Speed Divisor Slider */}
              <div className="slider-box font-sans" style={{ padding: 0, background: 'none', border: 'none' }}>
                <div className="slider-meta" style={{ marginBottom: '4px' }}>
                  <label style={{ fontSize: '11px', color: '#a0aab5' }}>
                    {t("modelAssembler.trail.speedDivisor") || "Tốc độ sóng (Divisor - Số chia giảm tốc):"}
                  </label>
                  <span style={{ fontSize: '11px', color: '#fff', fontWeight: 'bold' }}>
                    {trailSettings.animationDivisor} ({trailSettings.animationDivisor === 1 ? "Nhanh nhất" : trailSettings.animationDivisor === 12 ? "Chậm nhất" : "Thường"})
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  step="1"
                  value={trailSettings.animationDivisor}
                  onChange={(e) => handleTrailSettingChange("animationDivisor", parseInt(e.target.value) || 4)}
                  className="custom-slider"
                  style={{ width: "100%" }}
                />
              </div>

              {/* Wave Type Select */}
              <div className="control-group" style={{ marginBottom: '4px' }}>
                <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#a0aab5' }}>
                  {t("modelAssembler.trail.waveType") || "Kiểu hình dáng sóng (Wave Type):"}
                </label>
                <select
                  className="select-custom select-compact"
                  value={trailSettings.waveType}
                  onChange={(e) => handleTrailSettingChange("waveType", e.target.value)}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}
                >
                  <option value="blocky">{t("modelAssembler.trail.typeBlocky") || "Sóng gãy khúc (Blocky)"}</option>
                  <option value="sine">{t("modelAssembler.trail.typeSine") || "Sóng mềm mại (Sine)"}</option>
                </select>
              </div>

              <p style={{ margin: 0, fontSize: '10px', color: '#666', fontStyle: 'italic', lineHeight: '1.4' }}>
                {t("modelAssembler.trail.hint") || "* Hiệu ứng vệt đuôi được tự động tính toán trên Mô hình Động khi có vệt đuôi (RAINBOW_STRIPES)."}
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Custom Layer Motion System */
        <div
          className="panel-section highlight font-sans"
          style={{ borderTop: "2px solid rgba(255, 0, 127, 0.2)" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "12px",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                color: "#ff007f",
              }}
            >
              {t("modelAssembler.motion.heading") || "Động cơ chuyển động Layer (Timeline)"}
            </h3>
            <label
              className="cyber-switch-label"
              style={{
                display: "flex",
                alignItems: "center",
                cursor: isReadOnly ? "not-allowed" : "pointer",
                fontSize: "12px",
                opacity: isReadOnly ? 0.6 : 1
              }}
            >
              <input
                type="checkbox"
                checked={!!activeLayer.isAnimated}
                onChange={(e) => {
                  if (isReadOnly) return;
                  const checked = e.target.checked;
                  const updates = { isAnimated: checked };
                  if (
                    checked &&
                    (!activeLayer.motionFrames ||
                      activeLayer.motionFrames.length === 0)
                  ) {
                    // Initialize with 4 default frames matching current part
                    updates.motionFrames = Array(4)
                      .fill(null)
                      .map(() => ({
                        partName: activeLayer.partName,
                        dx: 0,
                        dy: 0,
                      }));
                  }
                  updateLayer(activeLayerId, updates);
                }}
                disabled={isReadOnly}
                style={{
                  marginRight: "6px",
                  width: "14px",
                  height: "14px",
                  accentColor: "#ff007f",
                  cursor: isReadOnly ? "not-allowed" : "pointer",
                }}
              />
              <strong
                style={{
                  color: activeLayer.isAnimated ? "#ff007f" : "#888",
                }}
              >
                {activeLayer.isAnimated
                  ? (t("modelAssembler.motion.toggleOn") || "Timeline Bật")
                  : (t("modelAssembler.motion.toggleOff") || "Timeline Tắt")}
              </strong>
            </label>
          </div>

          {activeLayer.isAnimated && (
            <div className="motion-editor-panel animate-slide-down">
              {/* Timeline slots selector */}
              <div className="frames-row" style={{ display: 'flex', gap: '6px', overflowX: 'auto', padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '12px' }}>
                {activeFrames.map((frame, index) => {
                  const isSelected = index === activeFrameIndex;
                  let framePartData;
                  let w = 0, h = 0;
                  let palette = null;
                  const part = customParts[frame.partName];
                  if (part) {
                    framePartData = part.matrix || part.data;
                    w = part.width;
                    h = part.height;
                    palette = part.colors || part.palette;
                  } else if (defaultSprites && defaultSprites[frame.partName]) {
                    const sprite = defaultSprites[frame.partName];
                    framePartData = getSpriteMatrix(sprite);
                    palette = sprite && !Array.isArray(sprite) ? sprite.colors : null;
                    h = framePartData ? framePartData.length : 0;
                    w = framePartData && framePartData[0] ? framePartData[0].length : 0;
                  }

                  return (
                    <div
                      key={index}
                      onClick={() => setActiveFrameIndex(index)}
                      className={`frame-slot ${isSelected ? 'active' : ''}`}
                      style={{
                        border: isSelected ? '1px solid #ff007f' : '1px solid rgba(255,255,255,0.1)',
                        background: isSelected ? 'rgba(255,0,127,0.1)' : 'rgba(0,0,0,0.3)',
                        borderRadius: '4px',
                        padding: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        minWidth: '40px',
                        position: 'relative'
                      }}
                    >
                      <span style={{ fontSize: '9px', color: isSelected ? '#ff007f' : '#888', marginBottom: '2px' }}>F{index + 1}</span>
                      <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {framePartData ? (
                           <MiniCanvasPreview grid={framePartData} width={w} height={h} palette={palette} colors={palette} partName={frame.partName || activeLayer.partName} />
                        ) : (
                          <span style={{ fontSize: '7px' }}>None</span>
                        )}
                      </div>
                      {!isReadOnly && activeFrames.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFrame(index);
                          }}
                          style={{
                            position: 'absolute',
                            top: '-4px',
                            right: '-4px',
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: '#ff3366',
                            color: '#fff',
                            border: 'none',
                            fontSize: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0,
                            cursor: 'pointer'
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  );
                })}
                <button
                  className="btn btn-secondary btn-small"
                  onClick={handleAddFrame}
                  disabled={isReadOnly}
                  style={{ height: '38px', minWidth: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', opacity: isReadOnly ? 0.5 : 1, cursor: isReadOnly ? "not-allowed" : "pointer" }}
                >
                  +
                </button>
              </div>

              {/* Selected Frame parameters details */}
              {currentFrame && (
                <div className="active-frame-details font-sans" style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '6px', padding: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--color-neon-cyan)', fontWeight: 'bold' }}>Frame {activeFrameIndex + 1} Settings:</span>
                    <span style={{ fontSize: '10px', color: '#666' }}>Offsets are relative in pixels</span>
                  </div>

                  {/* Part selector for frame */}
                  <div className="control-group" style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '10px', display: 'block', marginBottom: '4px', color: '#a0aab5' }}>Sprite Part for Frame:</label>
                    <select
                      className="select-custom select-compact"
                      value={currentFrame.partName || activeLayer.partName}
                      onChange={(e) => handleUpdateFrameField(activeFrameIndex, "partName", e.target.value)}
                      disabled={isReadOnly}
                      style={{ width: '100%', cursor: isReadOnly ? "not-allowed" : "pointer" }}
                    >
                      <option value={activeLayer.partName}>{activeLayer.partName} (Base Part)</option>
                      
                      <optgroup label="System / Default Parts">
                        {Object.keys(defaultSprites || {}).map((key) => (
                          <option key={key} value={key}>
                            🐱 {key.replace(/_/g, " ")}
                          </option>
                        ))}
                      </optgroup>

                      {Object.keys(customParts).length > 0 && (
                        <optgroup label="Custom Parts (All)">
                          {Object.keys(customParts).map((key) => (
                            <option key={key} value={key}>
                              📦 {customParts[key].name} ({customParts[key].width}x{customParts[key].height})
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>

                  {/* Relative Coordinate Shifts (Spinners) */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div className="resize-box" style={{ flex: 1, border: 'none', background: 'rgba(255,255,255,0.02)', padding: '6px', borderRadius: '4px', opacity: isReadOnly ? 0.6 : 1 }}>
                      <span className="resize-title" style={{ fontSize: '10px', color: '#a0aab5' }}>Shift dx (X offset)</span>
                      <div className="cyber-spinner-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '22px', marginTop: '4px', gap: '8px' }}>
                        <button className="spinner-btn" disabled={isReadOnly} onClick={() => handleUpdateFrameField(activeFrameIndex, "dx", currentFrame.dx - 1)} style={{ cursor: isReadOnly ? "not-allowed" : "pointer" }}>-</button>
                        <span className="spinner-val" style={{ fontSize: '11px' }}>{currentFrame.dx}</span>
                        <button className="spinner-btn" disabled={isReadOnly} onClick={() => handleUpdateFrameField(activeFrameIndex, "dx", currentFrame.dx + 1)} style={{ cursor: isReadOnly ? "not-allowed" : "pointer" }}>+</button>
                      </div>
                    </div>
                    <div className="resize-box" style={{ flex: 1, border: 'none', background: 'rgba(255,255,255,0.02)', padding: '6px', borderRadius: '4px', opacity: isReadOnly ? 0.6 : 1 }}>
                      <span className="resize-title" style={{ fontSize: '10px', color: '#a0aab5' }}>Shift dy (Y offset)</span>
                      <div className="cyber-spinner-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '22px', marginTop: '4px', gap: '8px' }}>
                        <button className="spinner-btn" disabled={isReadOnly} onClick={() => handleUpdateFrameField(activeFrameIndex, "dy", currentFrame.dy - 1)} style={{ cursor: isReadOnly ? "not-allowed" : "pointer" }}>-</button>
                        <span className="spinner-val" style={{ fontSize: '11px' }}>{currentFrame.dy}</span>
                        <button className="spinner-btn" disabled={isReadOnly} onClick={() => handleUpdateFrameField(activeFrameIndex, "dy", currentFrame.dy + 1)} style={{ cursor: isReadOnly ? "not-allowed" : "pointer" }}>+</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
});

LayerControls.displayName = "LayerControls";

export default LayerControls;
