import { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../context/AppContext";
import {
  NyanCatModel,
  SparkleStarfield,
  RainbowTrail,
  PALETTES,
  DEFAULT_SPRITES,
  getSpriteMatrix,
  getSpriteColors,
} from "../utils/nyanRenderer";
import { Play, Pause } from "lucide-react";

export default function CanvasPreview() {
  const {
    settings,
    layers,
    background,
    customParts,
    getActiveRenderPartsMapping,
    liveEditingPartRef,
    bindings,
  } = useContext(AppContext);

  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const simulationTimeRef = useRef(null);

  // Keep rendering loop parameters synced using refs to avoid recreate loops
  const renderStateRef = useRef({
    isPlaying: true,
    secondsElapsed: 0,
    lastTime: 0,
    frameInterval: 1000 / settings.fps,
  });

  useEffect(() => {
    renderStateRef.current.isPlaying = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    renderStateRef.current.frameInterval = 1000 / settings.fps;
  }, [settings.fps]);

  useEffect(() => {
    // Instantiate background entities
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationId = null;

    // Simulation entities
    const starfield = new SparkleStarfield(1920, 462, settings.starDensity);
    const rainbowTrail = new RainbowTrail();

    // Derived Initial position for cat
    const initialY = Math.round((462 - 13 * settings.scale) / 2);
    const nyanCat = new NyanCatModel({
      scale: settings.scale,
      x:
        settings.movementMode === "crosser"
          ? -200
          : Math.round(960 - 10.5 * settings.scale),
      y: initialY,
      skinStyle: settings.skinStyle,
      poptartStyle: settings.poptartStyle,
      headDx: settings.headDx,
      headDy: settings.headDy,
      customParts,
      bindings,
    });

    renderStateRef.current.lastTime = performance.now();

    const loop = (currentTime) => {
      animationId = requestAnimationFrame(loop);

      const state = renderStateRef.current;
      const delta = currentTime - state.lastTime;

      if (delta >= state.frameInterval) {
        state.lastTime = currentTime - (delta % state.frameInterval);

        // Core Drawing Step
        ctx.clearRect(0, 0, 1920, 462);

        // Unconditionally update simulation time/secondsElapsed if playing
        if (state.isPlaying) {
          state.secondsElapsed += state.frameInterval / 1000;
          if (simulationTimeRef.current) {
            simulationTimeRef.current.textContent = state.secondsElapsed.toFixed(1) + "s";
          }
        }

        // 1. Draw Widescreen Background based on configuration
        if (background.type === "color") {
          ctx.fillStyle = background.value;
          ctx.fillRect(0, 0, 1920, 462);
        } else if (background.type === "image") {
          // If image background is set, let canvas draw background image
          const bgImg = new Image();
          bgImg.src = background.value;
          if (bgImg.complete) {
            ctx.drawImage(bgImg, 0, 0, 1920, 462);
          } else {
            bgImg.onload = () => ctx.drawImage(bgImg, 0, 0, 1920, 462);
            // Draw dark backdrop fallback while loading
            ctx.fillStyle = "#0f0f1b";
            ctx.fillRect(0, 0, 1920, 462);
          }
        } else {
          // Transparent / Checkerboard representation
          ctx.fillStyle = "#000000"; // Pure black for screen decoration defaults
          ctx.fillRect(0, 0, 1920, 462);
        }

        // --- MODE A: NYAN CAT ANIMATION SIMULATOR ---
        if (settings.movementMode !== "assembler") {
          // Sync customization properties

          nyanCat.skinStyle = settings.skinStyle;
          nyanCat.poptartStyle = settings.poptartStyle;
          nyanCat.scale = settings.scale;
          nyanCat.headDx = settings.headDx;
          nyanCat.headDy = settings.headDy;

          // Carry custom color picker values if 'custom' is active
          if (settings.poptartStyle === "custom") {
            nyanCat.customFrostingColor = settings.customFrostingColor;
            nyanCat.customCrustColor = settings.customCrustColor;
            nyanCat.customSprinkleColor = settings.customSprinkleColor;
          } else {
            nyanCat.customFrostingColor = null;
            nyanCat.customCrustColor = null;
            nyanCat.customSprinkleColor = null;
          }

          // Fetch user-drawn custom mappings
          nyanCat.customPartsMapping = getActiveRenderPartsMapping();
          nyanCat.customParts = customParts;
          nyanCat.bindings = bindings;
          if (liveEditingPartRef.current && liveEditingPartRef.current.palette) {
            nyanCat.liveEditingPalette = {
              key: liveEditingPartRef.current.key,
              palette: liveEditingPartRef.current.palette
            };
          } else {
            nyanCat.liveEditingPalette = null;
          }

          // Advance model timeline states
          if (state.isPlaying) {
            starfield.maxStars = settings.starDensity;
            starfield.update(settings.movementMode === "crosser" ? 2 : 4);

            if (settings.movementMode === "crosser") {
              nyanCat.x += 4.5;
              if (nyanCat.x > 1920 + 100) {
                nyanCat.x = -200;
              }
            } else {
              nyanCat.x = Math.round(960 - 10.5 * settings.scale);
            }
            nyanCat.y = Math.round((462 - 13 * settings.scale) / 2);
            nyanCat.update();
          }

          // Render space stars (only in Nyan Cat modes, not static scene assembler)
          starfield.draw(ctx, 4);

          // Render rainbow trails
          const rainbowY = nyanCat.y + nyanCat.currentBob;
          rainbowTrail.draw(
            ctx,
            nyanCat.x,
            rainbowY,
            Math.floor(state.secondsElapsed * settings.fps),
            settings.scale,
            settings.rainbowStyle,
          );

          // Draw the cat model
          nyanCat.draw(ctx);
        }

        // --- MODE B: LAYERS ASSEMBLER VIEWER ---
        else {
          // Render space dust effect backdrop
          ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
          // Render absolute layers onto stage in order of zIndex
          const sorted = [...layers].sort((a, b) => a.zIndex - b.zIndex);
          sorted.forEach((layer) => {
            if (!layer.visible) return;

            // Determine active partName and offsets for frame-by-frame custom motion
            let partName = layer.partName;
            let dx = 0;
            let dy = 0;

            if (layer.isAnimated && Array.isArray(layer.motionFrames) && layer.motionFrames.length > 0) {
              const frameIndex = Math.floor(state.secondsElapsed * 6) % layer.motionFrames.length;
              const currentFrame = layer.motionFrames[frameIndex];
              if (currentFrame) {
                partName = currentFrame.partName || layer.partName;
                dx = currentFrame.dx || 0;
                dy = currentFrame.dy || 0;
              }
            }

            // Retrieve grid details
            let partGrid;
            let partColors = null;
            let width = 0;
            let height = 0;

            if (liveEditingPartRef.current && liveEditingPartRef.current.key === partName && liveEditingPartRef.current.data) {
              partGrid = liveEditingPartRef.current.data;
              partColors = liveEditingPartRef.current.palette;
              width = partGrid[0] ? partGrid[0].length : 0;
              height = partGrid.length;
            } else {
              const custom = customParts[partName];
              if (custom) {
                partGrid = custom.matrix || custom.data;
                partColors = custom.colors || custom.palette;
                width = custom.width;
                height = custom.height;
              } else if (DEFAULT_SPRITES[partName]) {
                const sprite = DEFAULT_SPRITES[partName];
                partGrid = getSpriteMatrix(sprite);
                partColors = sprite && !Array.isArray(sprite) ? sprite.colors : null;
                height = partGrid ? partGrid.length : 0;
                width = partGrid && partGrid[0] ? partGrid[0].length : 0;
              }
            }

            if (!partGrid) return;

            // Build color map: part's own colors take priority, then global settings fallback
            const skin =
              PALETTES.skins[settings.skinStyle] || PALETTES.skins.classic;
            const pop =
              PALETTES.poptarts[settings.poptartStyle] ||
              PALETTES.poptarts.strawberry;

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

            const isSystemSprite = DEFAULT_SPRITES[partName] !== undefined;
            const colorMap = (partColors && !isSystemSprite)
              ? { ...baseColorMap, ...partColors }
              : baseColorMap;

            const s = settings.scale;

            // Render absolute pixels (factoring in frame translation dx/dy)
            for (let r = 0; r < height; r++) {
              const row = partGrid[r];
              if (!row) continue;
              for (let c = 0; c < width; c++) {
                const val = row[c];
                if (val === 0) continue;
                const hexColor = colorMap[val];
                if (!hexColor) continue;
                ctx.fillStyle = hexColor;
                ctx.fillRect(
                  layer.x + dx * s + c * s,
                  layer.y + dy * s + r * s,
                  s + 5,
                  s + 5,
                );
              }
            }
          });
        }
      }
    };

    // Kickoff Loop
    animationId = requestAnimationFrame(loop);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [settings, background, layers, customParts, bindings, getActiveRenderPartsMapping, liveEditingPartRef]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const getModeLabel = () => {
    if (settings.movementMode === "crosser") return "SCREEN CROSSER";
    if (settings.movementMode === "stationary") return "INFINITE HOVER";
    return "CUSTOM SCENE ASSEMBLER";
  };

  return (
    <div className="preview-card-wrapper glass-card">
      <div className="card-header border-glow">
        <div className="card-indicator">
          <div className="dot red" />
          <div className="dot yellow" />
          <div className="dot green" />
          <span className="card-title font-sans">
            LIVE MONITOR PREVIEW (1920×462 Native Viewport)
          </span>
        </div>

        <button
          className="btn-icon-only cursor-pointer"
          onClick={togglePlayPause}
          title={isPlaying ? "Tạm dừng hoạt ảnh" : "Chạy tiếp hoạt ảnh"}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
        </button>
      </div>

      <div className="canvas-frame-container">
        {/* Aspect constrained native canvas */}
        <canvas
          ref={canvasRef}
          id="nyanCanvas"
          width="1920"
          height="462"
          className="canvas-pixel-display"
        />
      </div>

      <div className="canvas-status-bar font-sans">
        <div className="status-segment">
          <span
            className={`status-signal-dot ${isPlaying ? "active" : "paused"}`}
          />
          <span>
            FPS: <strong className="text-cyan">{settings.fps}</strong>
          </span>
        </div>
        <div className="status-segment">
          <span>
            Mode: <strong className="text-magenta">{getModeLabel()}</strong>
          </span>
        </div>
        <div className="status-segment">
          <span>
            Simulation Time:{" "}
            <strong className="text-yellow" ref={simulationTimeRef}>
              0.0s
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
}
