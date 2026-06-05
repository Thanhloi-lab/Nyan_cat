/* eslint-disable react-hooks/refs */
import { useContext, useState, useRef, useEffect, useCallback, useMemo } from "react";
import { AppContext } from "../context/AppContext";
import { getSpriteMatrix } from "../utils/nyanRenderer";
import {
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Upload,
  Save,
  RefreshCw,
  Edit2,
} from "lucide-react";
import PixelEditor from "./PixelEditor";
import MiniCanvasPreview from "./MiniCanvasPreview";
import ProfileManager from "./ProfileManager";
import LayerControls from "./LayerControls";
import LayerHierarchy from "./LayerHierarchy";

export default function ModelAssembler() {
  const {
    customParts,
    layers,
    setLayers,
    background,
    addLayer,
    updateLayer,
    deleteLayer,
    duplicateLayer,
    reorderLayer,
    setBackground,
    settings,
    bindPartToSlot,
    setToastMessage,
    liveEditingPartRef,
    updateSetting,
    profiles,
    activeProfileId,
    cloneProfile,
    resolution,
    setResolution,
    loadProfile,
    saveProfile,
    deleteProfile,
    t,
    saveCustomPart,
    loadedPackages,
    loadPackage,
    unloadPackage,
    deletePackage,
    checkHasUnsavedChanges,
    closeActiveProfile,
    defaultSprites
  } = useContext(AppContext);

  const isReadOnly = activeProfileId === "system_default";

  const [searchQuery, setSearchQuery] = useState("");
  const [activeLayerId, setActiveLayerId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDrawingModalOpen, setIsDrawingModalOpen] = useState(false);
  const [editingPartKey, setEditingPartKey] = useState(null);

  const dragStartPos = useRef({ x: 0, y: 0 });
  const layerStartPos = useRef({ x: 0, y: 0 });
  const canvasContainerRef = useRef(null);
  const [scaleFactor, setScaleFactor] = useState(1);

  // Animation Play Preview State for workspace
  const [isPlayPreviewActive, setIsPlayPreviewActive] = useState(false);
  const [previewSecondsElapsed, setPreviewSecondsElapsed] = useState(0);

  // Unsaved Warning Modal State
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // { type: 'switch', data: id } | { type: 'close' }

  useEffect(() => {
    if (!isPlayPreviewActive) return;
    let animId;
    let lastTime = performance.now();
    const tick = (now) => {
      animId = requestAnimationFrame(tick);
      const delta = now - lastTime;
      if (delta >= 1000 / 6) {
        lastTime = now - (delta % (1000 / 6));
        setPreviewSecondsElapsed((prev) => prev + 1 / 6);
      }
    };
    animId = requestAnimationFrame(tick);
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isPlayPreviewActive]);

  // Automatically monitor workspace width to scale the active resolution viewport
  useEffect(() => {
    const handleResize = () => {
      if (canvasContainerRef.current && resolution) {
        const width = canvasContainerRef.current.clientWidth;
        setScaleFactor(width / resolution.width);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    const timer = setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, [resolution]);

  const handleProfileSwitch = useCallback((nextId) => {
    if (checkHasUnsavedChanges()) {
      setPendingAction({ type: "switch", data: nextId });
      setShowUnsavedModal(true);
    } else {
      loadProfile(nextId);
    }
  }, [checkHasUnsavedChanges, loadProfile]);

  const handleCloseProfileClick = useCallback(() => {
    if (checkHasUnsavedChanges()) {
      setPendingAction({ type: "close" });
      setShowUnsavedModal(true);
    } else {
      closeActiveProfile();
    }
  }, [checkHasUnsavedChanges, closeActiveProfile]);

  const executePendingAction = (saveBefore) => {
    if (saveBefore) {
      saveProfile();
    }

    if (pendingAction.type === "switch") {
      loadProfile(pendingAction.data);
    } else if (pendingAction.type === "close") {
      closeActiveProfile();
    }

    setShowUnsavedModal(false);
    setPendingAction(null);
  };

  // Sync assembler positions back to animated simulation settings
  const applyAssemblerToAnimation = () => {
    const headLayer = layers.find(
      (l) =>
        l.partName === "HEAD_OPEN" ||
        l.partName.toLowerCase().includes("head"),
    );
    const bodyLayer = layers.find(
      (l) =>
        l.partName === "POPTART" ||
        l.partName.toLowerCase().includes("cookie") ||
        l.partName.toLowerCase().includes("poptart"),
    );

    if (!headLayer || !bodyLayer) {
      alert(
        "Để áp dụng mô hình động, bối cảnh lắp ráp phải có ít nhất 1 Layer Đầu mèo (Head) và 1 Layer Thân bánh (Cookie/Poptart)!",
      );
      return;
    }

    const scale = settings.scale || 8;
    const dxPixels = headLayer.x - bodyLayer.x;
    const dyPixels = headLayer.y - bodyLayer.y;

    const headDx = Math.round(dxPixels / scale);

    let headHeight = 13;
    const customHead = customParts[headLayer.partName];
    if (customHead) {
      headHeight = customHead.height;
    } else if (defaultSprites && defaultSprites[headLayer.partName]) {
      const headMatrix = getSpriteMatrix(defaultSprites[headLayer.partName]);
      headHeight = headMatrix ? headMatrix.length : 13;
    }
    const headDy = Math.round(dyPixels / scale) - (18 - headHeight);

    updateSetting("headDx", headDx);
    updateSetting("headDy", headDy);

    if (headLayer.partName && headLayer.partName !== "default") {
      bindPartToSlot("HEAD_OPEN", headLayer.partName);
    }
    if (bodyLayer.partName && bodyLayer.partName !== "default") {
      bindPartToSlot("POPTART", bodyLayer.partName);
    }

    layers.forEach((layer) => {
      if (layer.partName && layer.partName !== "default") {
        const isCustom = customParts[layer.partName] !== undefined;
        const isSystem = defaultSprites && defaultSprites[layer.partName] !== undefined;
        if (isCustom || isSystem) {
          const nameLower = layer.partName.toLowerCase();
          if (nameLower.includes("tail")) {
            bindPartToSlot("TAIL_UP", layer.partName);
            bindPartToSlot("TAIL_MID", layer.partName);
            bindPartToSlot("TAIL_DOWN", layer.partName);
          } else if (nameLower.includes("leg")) {
            bindPartToSlot("LEG_DOWN", layer.partName);
            bindPartToSlot("LEG_FRONT", layer.partName);
            bindPartToSlot("LEG_BACK", layer.partName);
          } else if (
            layer.isProceduralTrail ||
            (layer.isProceduralTrail === undefined && (
              nameLower.includes("trail") ||
              nameLower.includes("rainbow") ||
              nameLower.includes("stripe")
            ))
          ) {
            bindPartToSlot("TRAIL", layer.partName);
          }
        }
      }
    });

    setToastMessage(t("modelAssembler.toast.syncSuccess") || "🔄 Đã đồng bộ cấu hình lắp ráp sang mô phỏng động!");
  };

  const handleBackgroundUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBackground({ type: "image", value: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePackageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const payload = JSON.parse(event.target.result);
        
        let importedParts = {};
        let targetPackageName = "Imported Package";

        // Format 1: Standalone package json with { packageName, parts: { ... } }
        if (payload.packageName && payload.parts) {
          targetPackageName = payload.packageName;
          importedParts = payload.parts;
        } 
        // Format 2: Full project json containing { customParts, ... }
        else if (payload.customParts) {
          importedParts = payload.customParts;
          const firstPart = Object.values(payload.customParts)[0];
          targetPackageName = (firstPart && firstPart.package) || "Imported Project";
        }
        // Format 3: Simple key-value of parts
        else if (typeof payload === "object" && !Array.isArray(payload)) {
          const keys = Object.keys(payload);
          const looksLikeParts = keys.every(k => payload[k] && (payload[k].matrix || payload[k].data));
          if (looksLikeParts) {
            importedParts = payload;
            const firstPart = Object.values(payload)[0];
            targetPackageName = (firstPart && firstPart.package) || "Imported Package";
          } else {
            throw new Error("Invalid format");
          }
        } else {
          throw new Error("Invalid format");
        }

        let count = 0;
        Object.keys(importedParts).forEach((k) => {
          const part = importedParts[k];
          const matrix = part.matrix || part.data;
          if (matrix) {
            const width = part.width || (matrix[0] ? matrix[0].length : 0);
            const height = part.height || matrix.length;
            const pkg = part.package || targetPackageName;
            
            saveCustomPart(
              part.name || k,
              width,
              height,
              matrix,
              pkg,
              part.colors || part.palette || null,
              part.colorLabels || null,
              part.isAnimationFrameOnly || false
            );
            count++;
          }
        });

        const successMsg = t("modelAssembler.packageManager.importSuccess", { count, name: targetPackageName }) 
          || `📥 Đã nạp thành công package "${targetPackageName}" (${count} linh kiện)!`;
        setToastMessage(successMsg);
      } catch (err) {
        console.error(err);
        const errMsg = t("modelAssembler.packageManager.importError", { error: err.message })
          || `❌ Lỗi khi nạp package: ${err.message}`;
        alert(errMsg);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Drag interaction logic
  const handleMouseDown = (e, id, currentX, currentY) => {
    e.stopPropagation();
    setActiveLayerId(id);
    if (isReadOnly) return;
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    layerStartPos.current = { x: currentX, y: currentY };
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !activeLayerId) return;
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;

    updateLayer(activeLayerId, {
      x: Math.round(layerStartPos.current.x + dx / scaleFactor),
      y: Math.round(layerStartPos.current.y + dy / scaleFactor),
    });
  }, [isDragging, activeLayerId, scaleFactor, updateLayer]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const onGlobalMouseMove = (e) => {
      handleMouseMove(e);
    };

    const onGlobalMouseUp = () => {
      handleMouseUp();
    };

    window.addEventListener("mousemove", onGlobalMouseMove);
    window.addEventListener("mouseup", onGlobalMouseUp);
    return () => {
      window.removeEventListener("mousemove", onGlobalMouseMove);
      window.removeEventListener("mouseup", onGlobalMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const sortedLayers = useMemo(() => {
    return [...layers].sort((a, b) => a.zIndex - b.zIndex);
  }, [layers]);

  const activeLayer = useMemo(() => {
    return layers.find((l) => l.id === activeLayerId) || null;
  }, [layers, activeLayerId]);

  // If no profile is active, show widescreen dashboard ProfileManager
  if (!activeProfileId) {
    return <ProfileManager handleProfileSwitch={handleProfileSwitch} />;
  }

  // Load custom loaded packages sources
  const customPackages = Array.from(
    new Set(Object.values(customParts).map((p) => p.package || "My Custom"))
  ).filter((pkg) => pkg !== "Nyan Cat");

  return (
    <div className="assembler-tab-layout">
      {/* Visual Canvas Board Area */}
      <div className="assembler-canvas-container glass-card">
        {isReadOnly && (
          <div
            className="system-profile-warning-banner"
            style={{
              background: "rgba(255, 0, 127, 0.1)",
              borderBottom: "1px solid rgba(255, 0, 127, 0.25)",
              padding: "10px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              color: "#ff007f",
              fontSize: "12px",
              fontWeight: "500",
              borderRadius: "8px 8px 0 0"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span>⚠️</span>
              <span>{t("modelAssembler.systemProfile.readOnlyWarning") || "Bạn đang xem Hồ sơ Hệ thống (Chỉ đọc). Hãy Nhân bản hồ sơ này để chỉnh sửa."}</span>
            </div>
            <button
              className="btn btn-primary btn-small"
              onClick={() => {
                const name = prompt(t("modelAssembler.systemProfile.cloneNamePrompt") || "Nhập tên cho hồ sơ nhân bản:", `${profiles[activeProfileId]?.name} (Copy)`);
                if (name) {
                  const newId = cloneProfile(activeProfileId, name);
                  if (newId) {
                    alert(t("modelAssembler.systemProfile.cloneSuccess") || "Đã nhân bản hồ sơ hệ thống thành công!");
                  }
                }
              }}
              style={{
                background: "linear-gradient(135deg, #ff007f 0%, #7928ca 100%)",
                border: "none",
                color: "#fff",
                fontWeight: "bold",
                padding: "4px 10px",
                borderRadius: "4px",
                cursor: "pointer",
                boxShadow: "0 0 8px rgba(255,0,127,0.3)",
              }}
            >
              ➕ {t("modelAssembler.systemProfile.btnCloneAction") || "Nhân bản"}
            </button>
          </div>
        )}
        <div className="editor-card-header">
          <div className="header-meta">
            <span className="card-tag">STUDIO</span>
            <h2
              className="font-sans"
              style={{ fontSize: "15px", fontWeight: "bold" }}
            >
              📟 {profiles[activeProfileId]?.name} ({resolution.width} ×{" "}
              {resolution.height})
            </h2>
          </div>

          <div
            className="header-actions"
            style={{
              display: "flex",
              gap: "16px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {/* Quick Switch Dropdown */}
            {Object.keys(profiles).length > 1 && (
              <div
                className="quick-switch font-sans"
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {t("modelAssembler.toolbar.switchProfile") || "Chuyển hồ sơ:"}
                </span>
                <select
                  className="select-custom select-compact"
                  value={activeProfileId}
                  onChange={(e) => handleProfileSwitch(e.target.value)}
                  style={{
                    padding: "4px 8px",
                    fontSize: "11px",
                    background: "rgba(0,0,0,0.4)",
                    border: "1px solid var(--color-border-glow)",
                    borderRadius: "4px",
                    color: "#fff",
                  }}
                >
                  {Object.keys(profiles).map((id) => (
                    <option key={id} value={id}>
                      {profiles[id].name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Dynamic Resolution Changer on the Fly */}
            <div
              className="resolution-selector font-sans"
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <span
                style={{
                  fontSize: "11px",
                  color: "var(--color-text-secondary)",
                }}
              >
                {t("modelAssembler.toolbar.sizeLabel") || "Kích thước:"}
              </span>
              <select
                className="select-custom select-compact"
                value={`${resolution.width}x${resolution.height}`}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "custom") {
                    const w = prompt(
                      t("modelAssembler.prompt.enterWidth") || "Nhập chiều rộng (px):",
                      resolution.width,
                    );
                    const h = prompt(
                      t("modelAssembler.prompt.enterHeight") || "Nhập chiều cao (px):",
                      resolution.height,
                    );
                    if (w && h) {
                      setResolution({
                        width: parseInt(w) || 1920,
                        height: parseInt(h) || 462,
                      });
                    }
                  } else {
                    const [w, h] = val.split("x").map(Number);
                    setResolution({ width: w, height: h });
                  }
                }}
                style={{
                  padding: "4px 8px",
                  fontSize: "11px",
                  background: "rgba(0,0,0,0.4)",
                  border: "1px solid var(--color-border-glow)",
                  borderRadius: "4px",
                  color: "#fff",
                }}
              >
                <option value="1920x462">1920 × 462 (Standard)</option>
                <option value="1920x515">1920 × 515 (Wide)</option>
                <option value="1920x1080">1920 × 1080 (FHD)</option>
                <option value="1280x720">1280 × 720 (HD)</option>
                <option value="custom">Custom...</option>
              </select>
            </div>

            {/* Quick Action Sync Buttons */}
            <div
              className="quick-actions"
              style={{ display: "flex", gap: "8px" }}
            >
              <button
                className="btn btn-secondary btn-small flex items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPlayPreviewActive(!isPlayPreviewActive);
                }}
                style={{
                  background: isPlayPreviewActive
                    ? "rgba(0, 229, 255, 0.2)"
                    : "rgba(255, 255, 255, 0.05)",
                  borderColor: isPlayPreviewActive
                    ? "#00e5ff"
                    : "rgba(255, 255, 255, 0.15)",
                  color: isPlayPreviewActive ? "#00e5ff" : "#fff",
                  fontSize: "11px",
                  padding: "6px 12px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
                title={t("modelAssembler.toolbar.btnPlayPreviewTitle") || "Xem thử timeline động"}
              >
                {isPlayPreviewActive
                  ? (t("modelAssembler.toolbar.btnStopPreview") || "Dừng timeline")
                  : (t("modelAssembler.toolbar.btnPlayPreview") || "Chạy thử")}
              </button>

              <button
                className="btn btn-secondary btn-small flex items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseProfileClick();
                }}
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  borderColor: "rgba(255,255,255,0.15)",
                  color: "#fff",
                  fontSize: "11px",
                  padding: "6px 12px",
                }}
                title={t("modelAssembler.toolbar.btnManageProfileTitle") || "Quay lại trang quản lý hồ sơ"}
              >
                {t("modelAssembler.toolbar.btnManageProfile") || "Quản lý hồ sơ"}
              </button>

              <button
                className="btn btn-primary btn-small flex items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  applyAssemblerToAnimation();
                }}
                style={{
                  background:
                    "linear-gradient(135deg, #ff007f 0%, #7928ca 100%)",
                  borderColor: "rgba(255,0,127,0.3)",
                  color: "#fff",
                  fontSize: "11px",
                  padding: "6px 12px",
                }}
                title={t("modelAssembler.toolbar.btnApplyTitle") || "Đồng bộ mô hình hiện tại sang mô phỏng động"}
              >
                <RefreshCw size={11} style={{ marginRight: 4 }} /> {t("modelAssembler.toolbar.btnApply") || "Đồng bộ động"}
              </button>

              {isReadOnly ? (
                <button
                  className="btn btn-primary btn-small flex items-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    const name = prompt(t("modelAssembler.systemProfile.cloneNamePrompt") || "Nhập tên cho hồ sơ nhân bản:", `${profiles[activeProfileId]?.name} (Copy)`);
                    if (name) {
                      const newId = cloneProfile(activeProfileId, name);
                      if (newId) {
                        alert(t("modelAssembler.systemProfile.cloneSuccess") || "Đã nhân bản hồ sơ hệ thống thành công!");
                      }
                    }
                  }}
                  style={{
                    background:
                      "linear-gradient(135deg, #ff007f 0%, #7928ca 100%)",
                    borderColor: "rgba(255,0,127,0.3)",
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: "11px",
                    padding: "6px 12px",
                  }}
                  title={t("modelAssembler.systemProfile.btnCloneActionTitle") || "Nhân bản hồ sơ để chỉnh sửa"}
                >
                  <Copy size={11} style={{ marginRight: 4 }} /> {t("modelAssembler.systemProfile.btnCloneAction") || "Nhân bản"}
                </button>
              ) : (
                <button
                  className="btn btn-primary btn-small flex items-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    saveProfile();
                  }}
                  style={{
                    background:
                      "linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)",
                    borderColor: "rgba(0,242,254,0.3)",
                    color: "#000",
                    fontWeight: "bold",
                    fontSize: "11px",
                    padding: "6px 12px",
                  }}
                  title={t("modelAssembler.toolbar.btnSaveTitle") || "Lưu hồ sơ và tầng layer hiện tại"}
                >
                  <Save size={11} style={{ marginRight: 4 }} /> {t("modelAssembler.toolbar.btnSave") || "Lưu hồ sơ"}
                </button>
              )}
            </div>

            {/* Background Style Switcher */}
            <div className="bg-options" style={{ display: "flex", gap: "4px" }}>
              <button
                className={`btn btn-secondary btn-small ${background.type === "transparent" ? "active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setBackground({ type: "transparent", value: "" });
                }}
                style={{ fontSize: "10px", padding: "4px 8px" }}
              >
                Checker
              </button>
              <button
                className={`btn btn-secondary btn-small ${background.type === "color" ? "active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setBackground({ type: "color", value: "#0f0f1b" });
                }}
                style={{ fontSize: "10px", padding: "4px 8px" }}
              >
                Space Blue
              </button>
              <button
                className={`btn btn-secondary btn-small ${background.type === "starfield" ? "active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setBackground({ type: "starfield", value: "" });
                }}
                style={{ fontSize: "10px", padding: "4px 8px" }}
              >
                🌌 Starfield
              </button>

              <label
                className="btn btn-secondary btn-small cursor-pointer flex items-center"
                style={{ fontSize: "10px", padding: "4px 8px" }}
              >
                <Upload size={10} style={{ marginRight: 2 }} /> Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBackgroundUpload}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Dynamic Scaled Working Board Wrapper */}
        <div
          className="assembler-stage-wrapper"
          ref={canvasContainerRef}
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget ||
              e.target.classList.contains("assembler-stage-board") ||
              e.target.classList.contains("transparent-grid-overlay") ||
              e.target.classList.contains("assembler-bg-space-dust")
            ) {
              setActiveLayerId(null);
            }
          }}
          style={{
            width: "100%",
            height: `${resolution.height * scaleFactor}px`,
            position: "relative",
            overflow: "hidden",
            border: "1px solid var(--color-border-glow)",
            borderRadius: "8px",
          }}
        >
          <div
            className="assembler-stage-board"
            style={{
              width: `${resolution.width}px`,
              height: `${resolution.height}px`,
              backgroundColor:
                background.type === "color" ? background.value : "transparent",
              backgroundImage:
                background.type === "image"
                  ? `url(${background.value})`
                  : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "absolute",
              top: 0,
              left: 0,
              transform: `scale(${scaleFactor})`,
              transformOrigin: "left top",
              overflow: "hidden",
            }}
          >
            {background.type === "transparent" && (
              <div className="transparent-grid-overlay" />
            )}

            <div className="assembler-bg-space-dust" />

            {/* Render Layers */}
            {sortedLayers.map((layer) => {
              if (!layer.visible) return null;

              let partName = layer.partName;
              let dx = 0;
              let dy = 0;

              if (
                isPlayPreviewActive &&
                layer.isAnimated &&
                Array.isArray(layer.motionFrames) &&
                layer.motionFrames.length > 0
              ) {
                const frameIndex =
                  Math.floor(previewSecondsElapsed * 6) %
                  layer.motionFrames.length;
                const currentFrame = layer.motionFrames[frameIndex];
                if (currentFrame) {
                  partName = currentFrame.partName || layer.partName;
                  dx = currentFrame.dx || 0;
                  dy = currentFrame.dy || 0;
                }
              }

              // Find the data (custom library, live editor draft, or defaults)
              let partData;
              let width = 0;
              let height = 0;
              let partPalette = null;

              const live = liveEditingPartRef.current;
              if (live && live.key === partName && live.data) {
                partData = live.data;
                width = partData[0] ? partData[0].length : 0;
                height = partData.length;
                partPalette = live.palette;
              } else {
                const custom = customParts[partName];
                if (custom) {
                  partData = custom.matrix || custom.data;
                  width = custom.width;
                  height = custom.height;
                  partPalette = custom.colors || custom.palette;
                } else if (defaultSprites && defaultSprites[partName]) {
                  partData = getSpriteMatrix(defaultSprites[partName]);
                  height = partData ? partData.length : 0;
                  width = partData && partData[0] ? partData[0].length : 0;
                  partPalette = defaultSprites[partName].colors || null;
                }
              }

              if (!partData) return null;

              const s = settings.scale; // Pixel art scaling unit

              return (
                <div
                  key={layer.id}
                  className={`assembler-layer-node ${activeLayerId === layer.id ? "active" : ""}`}
                  style={{
                    position: "absolute",
                    left: `${layer.x + dx * s}px`,
                    top: `${layer.y + dy * s}px`,
                    width: `${width * s}px`,
                    height: `${height * s}px`,
                    zIndex: layer.zIndex,
                    cursor: isDragging && activeLayerId === layer.id ? "grabbing" : "grab",
                  }}
                  onMouseDown={(e) =>
                    handleMouseDown(e, layer.id, layer.x, layer.y)
                  }
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* High-Performance Canvas-based Stage Rendering */}
                  <MiniCanvasPreview
                    grid={partData}
                    width={width}
                    height={height}
                    palette={partPalette}
                    colors={partPalette}
                    style={{
                      width: `${width * s}px`,
                      height: `${height * s}px`
                    }}
                    partName={partName}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="stage-controls-bar">
          <span>
            {t("modelAssembler.canvas.hintDragDrop") || "💡 Chọn layer và rê chuột để sắp xếp vị trí hoặc dùng phím mũi tên để di chuyển tinh tế."}
          </span>
        </div>
      </div>

      {/* Layer stack / Custom Items Sidebar */}
      <div className="assembler-control-panel glass-card">
        {/* Segment 1: Library catalog */}
        <div className="panel-section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{ margin: 0 }}>1. Drag / Add Items to Stage</h3>
            <div style={{ display: "flex", gap: "6px" }}>
              <label 
                className="btn btn-secondary btn-small cursor-pointer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  padding: "4px 10px",
                  gap: "4px",
                  margin: 0,
                  height: "26px",
                  boxSizing: "border-box",
                  opacity: isReadOnly ? 0.5 : 1,
                  cursor: isReadOnly ? "not-allowed" : "pointer",
                  pointerEvents: isReadOnly ? "none" : "auto"
                }}
              >
                <Upload size={12} /> {t("modelAssembler.packageManager.import") || "Nạp Package"}
                <input
                  type="file"
                  accept=".json"
                  onChange={handlePackageUpload}
                  style={{ display: "none" }}
                  disabled={isReadOnly}
                />
              </label>
              <button
                className="btn btn-primary btn-small"
                onClick={() => {
                  if (isReadOnly) return;
                  setEditingPartKey(null);
                  setIsDrawingModalOpen(true);
                }}
                disabled={isReadOnly}
                style={{
                  background: isReadOnly ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #ff007f 0%, #7928ca 100%)",
                  border: isReadOnly ? "1px solid rgba(255,255,255,0.1)" : "none",
                  color: isReadOnly ? "#666" : "#fff",
                  padding: "4px 10px",
                  borderRadius: "4px",
                  fontSize: "11px",
                  fontWeight: "bold",
                  cursor: isReadOnly ? "not-allowed" : "pointer",
                  boxShadow: isReadOnly ? "none" : "0 0 8px rgba(255,0,127,0.3)",
                  height: "26px",
                  boxSizing: "border-box"
                }}
              >
                {t("modelAssembler.customParts.btnDraw") || "Draw"}
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="search-bar-container" style={{ marginBottom: "12px" }}>
            <input
              type="text"
              className="input-text font-sans"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("modelAssembler.searchPlaceholder") || "Tìm kiếm linh kiện..."}
              style={{
                width: "100%",
                padding: "8px 12px",
                background: "rgba(0, 0, 0, 0.4)",
                border: "1px solid var(--color-border-glow)",
                borderRadius: "6px",
                color: "#fff",
                fontSize: "12px",
                boxSizing: "border-box"
              }}
            />
          </div>

          <div className="assembler-parts-source font-sans" style={{ maxHeight: "250px", overflowY: "auto" }}>
            {(() => {
              const isSearchActive = searchQuery.trim() !== "";

              if (isSearchActive) {
                const filteredCustomKeys = Object.keys(customParts).filter((key) => {
                  const part = customParts[key];
                  if (part.isAnimationFrameOnly) return false;
                  const nameMatch = part.name.toLowerCase().includes(searchQuery.toLowerCase());
                  const keyMatch = key.toLowerCase().includes(searchQuery.toLowerCase());
                  const pkgMatch = (part.package || "").toLowerCase().includes(searchQuery.toLowerCase());
                  return nameMatch || keyMatch || pkgMatch;
                });

                const filteredDefaultKeys = Object.keys(defaultSprites || {}).filter((key) => {
                  const keyMatch = key.toLowerCase().includes(searchQuery.toLowerCase());
                  const nameMatch = key.toLowerCase().replace(/_/g, " ").includes(searchQuery.toLowerCase());
                  return keyMatch || nameMatch;
                });

                return (
                  <div className="search-results-section">
                    {filteredCustomKeys.length === 0 && filteredDefaultKeys.length === 0 ? (
                      <div style={{ textAlign: "center", color: "#666", padding: "20px 0" }}>
                        {t("modelAssembler.search.noResults") || "Không tìm thấy linh kiện phù hợp."}
                      </div>
                    ) : (
                      <>
                        {filteredCustomKeys.length > 0 && (
                          <div className="source-category" style={{ marginBottom: "16px" }}>
                            <h4>📦 Custom Sprites</h4>
                            <div className="source-parts-grid">
                              {filteredCustomKeys.map((key) => {
                                const part = customParts[key];
                                return (
                                  <div key={key} className="part-add-card" style={{ display: "flex", flexDirection: "column" }}>
                                    <div
                                      className="part-card-preview-area"
                                      onClick={() => {
                                        const newId = addLayer(key);
                                        if (newId) setActiveLayerId(newId);
                                      }}
                                      style={{ width: "100%", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", height: "45px" }}
                                    >
                                      <MiniCanvasPreview grid={part.matrix || part.data} width={part.width} height={part.height} palette={part.colors || part.palette} colors={part.colors || part.palette} partName={key} />
                                    </div>
                                    <span
                                      className="add-title"
                                      style={{ textAlign: "center", margin: "4px 0", fontSize: "10px", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}
                                    >
                                      {part.name}
                                    </span>
                                    <div style={{ display: "flex", gap: "2px", width: "100%", padding: "4px" }}>
                                      <button
                                        className="btn btn-secondary btn-small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingPartKey(key);
                                          setIsDrawingModalOpen(true);
                                        }}
                                        style={{ flex: 1, fontSize: "9px", padding: "2px 0" }}
                                      >
                                        Edit
                                      </button>
                                      <button
                                        className="add-layer-btn"
                                        onClick={() => {
                                          const newId = addLayer(key);
                                          if (newId) setActiveLayerId(newId);
                                        }}
                                        style={{ flex: 1.5, fontSize: "9px", padding: "2px 0" }}
                                      >
                                        + Add
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {filteredDefaultKeys.length > 0 && (
                          <div className="source-category" style={{ marginBottom: "16px" }}>
                            <h4>🐱 System Sprites</h4>
                            <div className="source-parts-grid">
                              {filteredDefaultKeys.map((key) => {
                                const grid = defaultSprites[key];
                                const matrix = getSpriteMatrix(grid);
                                const defColors = grid && !Array.isArray(grid) ? grid.colors : null;
                                return (
                                  <div key={key} className="part-add-card" style={{ display: "flex", flexDirection: "column" }}>
                                    <div
                                      className="part-card-preview-area"
                                      onClick={() => {
                                        const newId = addLayer(key);
                                        if (newId) setActiveLayerId(newId);
                                      }}
                                      style={{ width: "100%", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", height: "45px" }}
                                    >
                                      <MiniCanvasPreview grid={matrix} width={matrix ? matrix[0].length : 0} height={matrix ? matrix.length : 0} colors={defColors} palette={defColors} partName={key} />
                                    </div>
                                    <span
                                      className="add-title"
                                      style={{ textAlign: "center", margin: "4px 0", fontSize: "10px", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}
                                    >
                                      {key.toLowerCase().replace(/_/g, " ")}
                                    </span>
                                    <div style={{ display: "flex", gap: "2px", width: "100%", padding: "4px" }}>
                                      <button
                                        className="btn btn-secondary btn-small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingPartKey(key);
                                          setIsDrawingModalOpen(true);
                                        }}
                                        style={{ flex: 1, fontSize: "9px", padding: "2px 0" }}
                                      >
                                        View
                                      </button>
                                      <button
                                        className="add-layer-btn"
                                        onClick={() => {
                                          const newId = addLayer(key);
                                          if (newId) setActiveLayerId(newId);
                                        }}
                                        style={{ flex: 1.5, fontSize: "9px", padding: "2px 0" }}
                                      >
                                        + Add
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              }

              // Grouped packages section
              return (
                <div className="grouped-packages-section">
                  {loadedPackages.includes("Nyan Cat") && (
                    <div className="source-category" style={{ marginBottom: "16px" }}>
                      <h4 style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "0 0 8px 0" }}>
                        <span>🐱 Nyan Cat</span>
                        <span className="card-tag">SYSTEM</span>
                      </h4>
                      <div className="source-parts-grid">
                        {Object.keys(defaultSprites || {}).map((key) => {
                          let sprite = defaultSprites[key];
                          let matrix = getSpriteMatrix(sprite);
                          let defColors = sprite && !Array.isArray(sprite) ? sprite.colors : null;
                          if (key === 'RAINBOW_STRIPES') {
                            console.log(sprite)
                            console.log(matrix)
                            console.log(defColors)
                          }
                          return (
                            <div key={key} className="part-add-card" style={{ display: "flex", flexDirection: "column" }}>
                              <div
                                className="part-card-preview-area"
                                onClick={() => {
                                  let newId = addLayer(key);
                                  if (newId) setActiveLayerId(newId);
                                }}
                                style={{ width: "100%", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", height: "45px" }}
                              >
                                <MiniCanvasPreview grid={matrix} width={matrix ? matrix[0].length : 0} height={matrix ? matrix.length : 0} colors={defColors} palette={defColors} partName={key} />
                              </div>
                              <span
                                className="add-title"
                                style={{ textAlign: "center", margin: "4px 0", fontSize: "10px", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}
                              >
                                {key.toLowerCase().replace(/_/g, " ")}
                              </span>
                              <div style={{ display: "flex", gap: "2px", width: "100%", padding: "4px" }}>
                                <button
                                  className="btn btn-secondary btn-small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingPartKey(key);
                                    setIsDrawingModalOpen(true);
                                  }}
                                  style={{ flex: 1, fontSize: "9px", padding: "2px 0" }}
                                >
                                  View
                                </button>
                                <button
                                  className="add-layer-btn"
                                  onClick={() => {
                                    const newId = addLayer(key);
                                    if (newId) setActiveLayerId(newId);
                                  }}
                                  style={{ flex: 1.5, fontSize: "9px", padding: "2px 0" }}
                                >
                                  + Add
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {loadedPackages.filter(p => p !== "Nyan Cat").map((pkg) => {
                    const partsInPkgKeys = Object.keys(customParts).filter(k => (customParts[k].package || "My Custom") === pkg && !customParts[k].isAnimationFrameOnly);
                    return (
                      <div key={pkg} className="source-category" style={{ marginBottom: "16px" }}>
                        <h4 style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "0 0 8px 0" }}>
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, marginRight: "8px" }}>📦 {pkg}</span>
                          <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                            <button
                              className="btn btn-secondary btn-small"
                              onClick={() => unloadPackage(pkg)}
                              style={{ padding: "1px 6px", fontSize: "9px", height: "18px", display: "flex", alignItems: "center" }}
                              title={t("modelAssembler.packageManager.unload") || "Unload"}
                            >
                              {t("modelAssembler.packageManager.unload") || "Unload"}
                            </button>
                            <button
                              className="btn btn-danger btn-small"
                              onClick={() => {
                                if (window.confirm(t("modelAssembler.packageManager.confirmDelete", { name: pkg }) || `Xóa vĩnh viễn package "${pkg}" và tất cả linh kiện bên trong?`)) {
                                  deletePackage(pkg);
                                }
                              }}
                              style={{ padding: "1px 6px", fontSize: "9px", height: "18px", background: "#ff0055", border: "none", color: "#fff", display: "flex", alignItems: "center" }}
                              title="Delete package"
                            >
                              ✕
                            </button>
                          </div>
                        </h4>
                        {partsInPkgKeys.length === 0 ? (
                          <div style={{ fontSize: "10px", color: "#666", textAlign: "center", padding: "8px 0" }}>
                            Empty Package
                          </div>
                        ) : (
                          <div className="source-parts-grid">
                            {partsInPkgKeys.map((key) => {
                              const part = customParts[key];
                              return (
                                <div key={key} className="part-add-card" style={{ display: "flex", flexDirection: "column" }}>
                                  <div
                                    className="part-card-preview-area"
                                    onClick={() => {
                                      const newId = addLayer(key);
                                      if (newId) setActiveLayerId(newId);
                                    }}
                                    style={{ width: "100%", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", height: "45px" }}
                                  >
                                    <MiniCanvasPreview grid={part.matrix || part.data} width={part.width} height={part.height} palette={part.colors || part.palette} colors={part.colors || part.palette} partName={key} />
                                  </div>
                                  <span
                                    className="add-title"
                                    style={{ textAlign: "center", margin: "4px 0", fontSize: "10px", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}
                                  >
                                    {part.name}
                                  </span>
                                  <div style={{ display: "flex", gap: "2px", width: "100%", padding: "4px" }}>
                                    <button
                                      className="btn btn-secondary btn-small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingPartKey(key);
                                        setIsDrawingModalOpen(true);
                                      }}
                                      style={{ flex: 1, fontSize: "9px", padding: "2px 0" }}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      className="add-layer-btn"
                                      onClick={() => {
                                        const newId = addLayer(key);
                                        if (newId) setActiveLayerId(newId);
                                      }}
                                      style={{ flex: 1.5, fontSize: "9px", padding: "2px 0" }}
                                    >
                                      + Add
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {(() => {
                    const allCustomPackages = Array.from(
                      new Set(Object.values(customParts).map((p) => p.package || "My Custom"))
                    );
                    const unloadedCustomPackages = allCustomPackages.filter(
                      (pkg) => !loadedPackages.includes(pkg)
                    );
                    if (unloadedCustomPackages.length === 0) return null;
                    return (
                      <div style={{ marginTop: "16px", borderTop: "1px dashed rgba(255,255,255,0.1)", paddingTop: "12px" }}>
                        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: "8px" }}>
                          {t("modelAssembler.packageManager.title") || "Quản Lý Packages"} - Unloaded:
                        </span>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          {unloadedCustomPackages.map((pkg) => (
                            <button
                              key={pkg}
                              className="btn btn-secondary btn-small"
                              onClick={() => loadPackage(pkg)}
                              style={{ fontSize: "10px", padding: "4px 8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", cursor: "pointer" }}
                            >
                              ➕ {pkg}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Segment 2: Coordinates spinners & Motion timeline editor */}
        <LayerControls
          activeLayer={activeLayer}
          activeLayerId={activeLayerId}
          resolution={resolution}
          updateLayer={updateLayer}
          activeProfileId={activeProfileId}
        />

        {/* Segment 3: Layers stack hierarchy */}
        <LayerHierarchy
          activeLayerId={activeLayerId}
          setActiveLayerId={setActiveLayerId}
          updateLayer={updateLayer}
          deleteLayer={deleteLayer}
          duplicateLayer={duplicateLayer}
          reorderLayer={reorderLayer}
          activeProfileId={activeProfileId}
        />
      </div>

      {/* Floating Pixel Drawing Canvas Modal */}
      {isDrawingModalOpen && (
        <div className="editor-modal-backdrop font-sans" style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.85)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 99999,
          padding: "20px",
          boxSizing: "border-box"
        }}>
          <div className="editor-modal-wrapper" style={{
            position: "relative",
            width: "100%",
            maxWidth: "1400px",
            height: "90%",
            background: "#161622",
            border: "1px solid var(--color-border-glow)",
            borderRadius: "12px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}>
            <div style={{
              display: "flex", 'flex-direction': 'row-reverse',
              'margin': '8px'
            }}>
              <button
                onClick={() => setIsDrawingModalOpen(false)}
                style={{
                  background: "rgba(255, 68, 68, 0.1)",
                  border: "1px solid rgba(255, 68, 68, 0.4)",
                  color: "#ff4444",
                  fontWeight: "bold",
                  borderRadius: "4px",
                  padding: "6px 14px",
                  cursor: "pointer",
                  zIndex: 99,
                  fontSize: "12px"
                }}
              >
                ✕ Close Editor
              </button>
            </div>

            <div style={{ flex: 1, padding: "20px", overflow: "auto" }}>
              <PixelEditor
                editingPartKey={editingPartKey}
                onClose={() => setIsDrawingModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Exit Unsaved Profile Warning Modal */}
      {showUnsavedModal && (
        <div className="modal-backdrop font-sans" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999
        }}>
          <div className="modal-content glass-card" style={{
            background: '#1a1a24',
            border: '1px solid var(--color-border-glow)',
            borderRadius: '12px',
            padding: '30px',
            width: '450px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#ff007f', fontSize: '18px' }}>⚠️ {t("dialogs.unsavedTitle") || "Hồ sơ có thay đổi chưa lưu!"}</h3>
            <p style={{ color: '#aaa', fontSize: '13px', lineHeight: '1.6', margin: '0 0 24px 0' }}>
              {t("dialogs.unsavedMessage") || "Bạn có muốn lưu các chỉnh sửa hiện tại trước khi rời khỏi không?"}
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                className="btn btn-primary"
                onClick={() => executePendingAction(true)}
                style={{ padding: '8px 16px', fontSize: '12px' }}
              >
                {t("dialogs.btnSaveExit") || "Lưu & Rời đi"}
              </button>
              <button
                className="btn btn-secondary"
                style={{ borderColor: "#ff4444", color: "#ff4444", padding: '8px 16px', fontSize: '12px' }}
                onClick={() => executePendingAction(false)}
              >
                {t("dialogs.btnDiscardExit") || "Không lưu, rời đi"}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowUnsavedModal(false);
                  setPendingAction(null);
                }}
                style={{ padding: '8px 16px', fontSize: '12px' }}
              >
                {t("dialogs.btnCancel") || "Hủy bỏ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
