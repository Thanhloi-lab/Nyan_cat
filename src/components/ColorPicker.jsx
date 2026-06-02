import React, { useState, useEffect, useRef, useMemo } from 'react';

// --- Color Helpers ---
function parseHex(hex) {
  let c = hex.trim().replace(/^#/, '');
  if (c.length === 3) {
    c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  }
  if (c.length === 4) {
    c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2] + c[3] + c[3];
  }
  let r = 255, g = 255, b = 255, a = 1;
  if (c.length === 6) {
    r = parseInt(c.slice(0, 2), 16);
    g = parseInt(c.slice(2, 4), 16);
    b = parseInt(c.slice(4, 6), 16);
  } else if (c.length === 8) {
    r = parseInt(c.slice(0, 2), 16);
    g = parseInt(c.slice(2, 4), 16);
    b = parseInt(c.slice(4, 6), 16);
    a = parseInt(c.slice(6, 8), 16) / 255;
  }
  return { r, g, b, a };
}

function rgbaToHex(r, g, b, a) {
  const toHexStr = (val) => Math.round(val).toString(16).padStart(2, '0');
  const alpha = Math.round(a * 255);
  return `#${toHexStr(r)}${toHexStr(g)}${toHexStr(b)}${toHexStr(alpha)}`;
}

function rgbaToHsva({ r, g, b, a }) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : (d / max) * 100;
  const v = max * 100;

  if (d !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / d) % 6;
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s, v, a };
}

function hsvaToRgba({ h, s, v, a }) {
  s /= 100;
  v /= 100;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r_ = 0, g_ = 0, b_ = 0;

  if (h >= 0 && h < 60) {
    r_ = c; g_ = x; b_ = 0;
  } else if (h >= 60 && h < 120) {
    r_ = x; g_ = c; b_ = 0;
  } else if (h >= 120 && h < 180) {
    r_ = 0; g_ = c; b_ = x;
  } else if (h >= 180 && h < 240) {
    r_ = 0; g_ = x; b_ = c;
  } else if (h >= 240 && h < 300) {
    r_ = x; g_ = 0; b_ = c;
  } else if (h >= 300 && h <= 360) {
    r_ = c; g_ = 0; b_ = x;
  }

  return {
    r: Math.round((r_ + m) * 255),
    g: Math.round((g_ + m) * 255),
    b: Math.round((b_ + m) * 255),
    a
  };
}

const ColorPicker = React.memo(({ color, onChange, onCommit, className, style, title, align = 'left' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const svBoxRef = useRef(null);
  const originalColorRef = useRef(color);
  const latestColorRef = useRef(color);

  // Sync latestColorRef when color prop updates
  useEffect(() => {
    latestColorRef.current = color;
  }, [color]);

  const commitColor = (hexVal) => {
    if (onCommit) {
      onCommit(hexVal, originalColorRef.current);
    }
  };

  // Parse color input
  const hsva = useMemo(() => {
    const rgba = parseHex(color || '#ffffff');
    return rgbaToHsva(rgba);
  }, [color]);

  const [localH, setLocalH] = useState(hsva.h);
  const [localS, setLocalS] = useState(hsva.s);
  const [localV, setLocalV] = useState(hsva.v);
  const [localA, setLocalA] = useState(hsva.a);
  const [textInputVal, setTextInputVal] = useState(color);

  // Sync state if color prop changes externally (e.g. reverted by parent due to duplicate validation)
  useEffect(() => {
    const propNormalized = color.toUpperCase();
    const localNormalized = latestColorRef.current.toUpperCase();
    if (propNormalized !== localNormalized) {
      const rgba = parseHex(color || '#ffffff');
      const incomingHsva = rgbaToHsva(rgba);
      setLocalH(incomingHsva.h);
      setLocalS(incomingHsva.s);
      setLocalV(incomingHsva.v);
      setLocalA(incomingHsva.a);
      setTextInputVal(propNormalized);
    }
  }, [color]);

  // Sync text value and original color when popover opens
  useEffect(() => {
    if (isOpen) {
      originalColorRef.current = color;
      setTextInputVal(color.toUpperCase());
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        commitColor(latestColorRef.current);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const updateColor = (newVal, updateText = true) => {
    const h = newVal.h !== undefined ? newVal.h : localH;
    const s = newVal.s !== undefined ? newVal.s : localS;
    const v = newVal.v !== undefined ? newVal.v : localV;
    const a = newVal.a !== undefined ? newVal.a : localA;

    if (newVal.h !== undefined) setLocalH(h);
    if (newVal.s !== undefined) setLocalS(s);
    if (newVal.v !== undefined) setLocalV(v);
    if (newVal.a !== undefined) setLocalA(a);

    const rgba = hsvaToRgba({ h, s, v, a });
    const hex = rgbaToHex(rgba.r, rgba.g, rgba.b, rgba.a);
    
    if (updateText) {
      setTextInputVal(hex.toUpperCase());
    }
    
    if (onChange) {
      onChange(hex);
    }
  };

  // SV Box Drag handlers
  const handleSvMove = (clientX, clientY) => {
    if (!svBoxRef.current) return;
    const rect = svBoxRef.current.getBoundingClientRect();
    let x = (clientX - rect.left) / rect.width;
    let y = (clientY - rect.top) / rect.height;
    x = Math.max(0, Math.min(1, x));
    y = Math.max(0, Math.min(1, y));

    updateColor({ s: x * 100, v: (1 - y) * 100 });
  };

  const handleSvMouseDown = (e) => {
    e.preventDefault();
    handleSvMove(e.clientX, e.clientY);

    const handleMouseMove = (e) => {
      handleSvMove(e.clientX, e.clientY);
    };
    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      commitColor(latestColorRef.current);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleSvTouchStart = (e) => {
    handleSvMove(e.touches[0].clientX, e.touches[0].clientY);

    const handleTouchMove = (e) => {
      handleSvMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const handleTouchEnd = () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      commitColor(latestColorRef.current);
    };

    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
  };

  // Text inputs
  const currentRgba = useMemo(() => {
    return hsvaToRgba({ h: localH, s: localS, v: localV, a: localA });
  }, [localH, localS, localV, localA]);

  const handleHexInputChange = (e) => {
    const val = e.target.value;
    setTextInputVal(val);

    let cleanVal = val.trim();
    if (cleanVal && !cleanVal.startsWith('#')) {
      cleanVal = '#' + cleanVal;
    }

    if (/^#[0-9A-F]{3}$/i.test(cleanVal) || 
        /^#[0-9A-F]{4}$/i.test(cleanVal) || 
        /^#[0-9A-F]{6}$/i.test(cleanVal) || 
        /^#[0-9A-F]{8}$/i.test(cleanVal)) {
      const parsed = parseHex(cleanVal);
      const hsva = rgbaToHsva(parsed);
      setLocalH(hsva.h);
      setLocalS(hsva.s);
      setLocalV(hsva.v);
      setLocalA(hsva.a);
      const hex = rgbaToHex(parsed.r, parsed.g, parsed.b, parsed.a);
      if (onChange) onChange(hex);
    }
  };

  const handleHexInputBlur = () => {
    let cleanVal = textInputVal.trim();
    if (cleanVal && !cleanVal.startsWith('#')) {
      cleanVal = '#' + cleanVal;
    }

    const isValid = /^#[0-9A-F]{3}$/i.test(cleanVal) || 
                    /^#[0-9A-F]{4}$/i.test(cleanVal) || 
                    /^#[0-9A-F]{6}$/i.test(cleanVal) || 
                    /^#[0-9A-F]{8}$/i.test(cleanVal);

    if (isValid) {
      const parsed = parseHex(cleanVal);
      const normalizedHex = rgbaToHex(parsed.r, parsed.g, parsed.b, parsed.a).toUpperCase();
      setTextInputVal(normalizedHex);
      if (onChange) onChange(normalizedHex);
    } else {
      // Reset to original color
      const orig = originalColorRef.current || color;
      setTextInputVal(orig.toUpperCase());
      const parsed = parseHex(orig);
      const hsva = rgbaToHsva(parsed);
      setLocalH(hsva.h);
      setLocalS(hsva.s);
      setLocalV(hsva.v);
      setLocalA(hsva.a);
      if (onChange) onChange(orig);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleHexInputBlur();
    }
  };

  // HSL representation for pure hue back color
  const pureHueColor = `hsl(${localH}, 100%, 50%)`;
  const rgbaStr = `rgba(${currentRgba.r}, ${currentRgba.g}, ${currentRgba.b}, ${currentRgba.a.toFixed(2)})`;

  return (
    <div className="vscode-color-picker-container" ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Swatch Trigger */}
      <div
        className={className || 'brush-color-preview-box'}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          ...style,
          cursor: 'pointer',
          position: 'relative',
          backgroundColor: color,
          backgroundImage: 'repeating-conic-gradient(#333 0% 25%, #555 0% 50%)',
          backgroundSize: '8px 8px',
          backgroundBlendMode: 'normal',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
        }}
        title={title || `Màu: ${color}`}
      >
        {/* Solid color preview on top of checkerboard */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: color,
          borderRadius: 'inherit'
        }} />
      </div>

      {/* VS Code Popover */}
      {isOpen && (
        <div className={`vscode-color-picker-popover align-${align}`}>
          {/* SV Gradient Square */}
          <div
            ref={svBoxRef}
            className="vscode-cp-sv-box"
            style={{ backgroundColor: pureHueColor }}
            onMouseDown={handleSvMouseDown}
            onTouchStart={handleSvTouchStart}
          >
            {/* White overlay */}
            <div className="vscode-cp-sv-white" />
            {/* Black overlay */}
            <div className="vscode-cp-sv-black" />
            {/* Selector Pointer */}
            <div
              className="vscode-cp-sv-pointer"
              style={{
                left: `${localS}%`,
                top: `${100 - localV}%`
              }}
            />
          </div>

          {/* Sliders and Info Row */}
          <div className="vscode-cp-controls">
            {/* Swatches previews (Current & Original) */}
            <div className="vscode-cp-previews">
              <div
                className="vscode-cp-preview-current"
                style={{
                  backgroundColor: color,
                  backgroundImage: 'repeating-conic-gradient(#333 0% 25%, #555 0% 50%)',
                  backgroundSize: '6px 6px',
                  backgroundBlendMode: 'normal',
                }}
              >
                <div style={{ width: '100%', height: '100%', backgroundColor: color }} />
              </div>
            </div>

            {/* Sliders stack */}
            <div className="vscode-cp-sliders">
              {/* Hue Slider */}
              <div className="vscode-cp-slider-wrapper">
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={Math.round(localH)}
                  onChange={(e) => updateColor({ h: parseFloat(e.target.value) })}
                  onMouseUp={() => commitColor(latestColorRef.current)}
                  onTouchEnd={() => commitColor(latestColorRef.current)}
                  className="vscode-cp-hue-slider"
                />
              </div>

              {/* Opacity Slider */}
              <div className="vscode-cp-slider-wrapper">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(localA * 100)}
                  onChange={(e) => updateColor({ a: parseFloat(e.target.value) / 100 })}
                  onMouseUp={() => commitColor(latestColorRef.current)}
                  onTouchEnd={() => commitColor(latestColorRef.current)}
                  className="vscode-cp-alpha-slider"
                  style={{
                    '--alpha-track-color': `linear-gradient(to right, rgba(${currentRgba.r}, ${currentRgba.g}, ${currentRgba.b}, 0), rgb(${currentRgba.r}, ${currentRgba.g}, ${currentRgba.b}))`
                  }}
                />
              </div>
            </div>
          </div>

          {/* Formats and text fields */}
          <div className="vscode-cp-value-display">
            <div className="vscode-cp-input-group">
              <span className="vscode-cp-input-label">HEX</span>
              <input
                type="text"
                value={textInputVal}
                onChange={handleHexInputChange}
                onBlur={handleHexInputBlur}
                onKeyDown={handleKeyDown}
                className="vscode-cp-text-input"
              />
            </div>
            <div className="vscode-cp-input-group">
              <span className="vscode-cp-input-label">RGBA</span>
              <span className="vscode-cp-text-readonly" title={rgbaStr}>
                {rgbaStr}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

ColorPicker.displayName = 'ColorPicker';

export default ColorPicker;
