import React, { useContext, useEffect, useRef } from "react";
import { AppContext } from "../context/AppContext";
import { PALETTES, isClassicSystemSpriteColors, getCustomMergedPalette } from "../utils/nyanRenderer";

const MiniCanvasPreview = React.memo(({ grid, width, height, palette = null, colors = null, style = {}, partName = null }) => {
  const { settings, defaultSprites } = useContext(AppContext);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !grid) return;
    const ctx = canvas.getContext("2d");
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const skin = PALETTES.skins[settings.skinStyle] || PALETTES.skins.classic;
    const pop = PALETTES.poptarts[settings.poptartStyle] || PALETTES.poptarts.strawberry;
    const baseColorMap = {
      0: "transparent",
      1: "#000000",
      2: settings.customSkinColor || skin.fill,
      3: settings.customSkinShadow || skin.shadow,
      4: settings.customCrustColor || pop.crust,
      5: settings.customFrostingColor || pop.frosting,
      6: settings.customSprinkleColor || pop.sprinkle,
      7: "#ffffff",
      8: "#ff9999",
    };
    // Priority: colors (new format) > palette (legacy) > baseColorMap (global settings fallback)
    const partColors = colors || palette;
    const isSystemSprite = partName && defaultSprites && defaultSprites[partName] !== undefined;
    let finalColorMap;
    if (partColors) {
      if (isSystemSprite) {
        const shouldTheme = isClassicSystemSpriteColors(partName, partColors);
        finalColorMap = shouldTheme ? baseColorMap : getCustomMergedPalette(partColors, baseColorMap);
      } else {
        finalColorMap = getCustomMergedPalette(partColors, baseColorMap);
      }
    } else {
      finalColorMap = baseColorMap;
    }

    const cellW = canvas.width / width;
    const cellH = canvas.height / height;

    for (let r = 0; r < height; r++) {
      const row = grid[r];
      if (!row) continue;
      for (let c = 0; c < width; c++) {
        const val = row[c];
        if (val === 0 || val === undefined) continue;
        const color = finalColorMap[val];
        if (color && color !== "transparent") {
          ctx.fillStyle = color;
          ctx.fillRect(c * cellW, r * cellH, cellW, cellH);
        }
      }
    }
  }, [grid, width, height, palette, colors, settings]);

  return (
    <canvas
      ref={canvasRef}
      width={width * 2}
      height={height * 2}
      className="mini-preview-canvas"
      style={{
        width: `${width * 2}px`,
        height: `${height * 2}px`,
        imageRendering: "pixelated",
        display: "block",
        ...style
      }}
    />
  );
});

MiniCanvasPreview.displayName = "MiniCanvasPreview";

export default MiniCanvasPreview;
