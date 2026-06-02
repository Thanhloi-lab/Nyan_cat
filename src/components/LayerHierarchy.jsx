import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import {
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2
} from "lucide-react";
import MiniCanvasPreview from "./MiniCanvasPreview";
import { DEFAULT_SPRITES, getSpriteMatrix } from "../utils/nyanRenderer";

const LayerHierarchy = React.memo(({
  activeLayerId,
  setActiveLayerId,
  updateLayer,
  deleteLayer,
  duplicateLayer,
  reorderLayer
}) => {
  const {
    layers,
    setLayers,
    customParts,
    t
  } = useContext(AppContext);

  const [draggedLayerId, setDraggedLayerId] = useState(null);
  const [dragOverLayerId, setDragOverLayerId] = useState(null);

  const sortedLayers = [...layers].sort((a, b) => b.zIndex - a.zIndex);

  const handleLayerDrop = (targetId) => {
    if (!draggedLayerId || draggedLayerId === targetId) return;
    const sorted = [...layers].sort((a, b) => b.zIndex - a.zIndex);
    const dragIdx = sorted.findIndex((l) => l.id === draggedLayerId);
    const targetIdx = sorted.findIndex((l) => l.id === targetId);
    if (dragIdx === -1 || targetIdx === -1) return;
    const [movedLayer] = sorted.splice(dragIdx, 1);
    sorted.splice(targetIdx, 0, movedLayer);
    const updatedLayers = sorted.map((layer, idx) => ({
      ...layer,
      zIndex: sorted.length - idx,
    }));
    setLayers(updatedLayers);
    setDraggedLayerId(null);
    setDragOverLayerId(null);
  };

  return (
    <div className="panel-section font-sans">
      <h3 style={{ margin: "0 0 12px 0" }}>
        🥞 {t("modelAssembler.layers.stackTitle") || "Cấu Trúc Các Tầng Layer (Stack)"}
      </h3>
      {sortedLayers.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "20px 0",
            border: "1px dashed rgba(255,255,255,0.06)",
            borderRadius: "6px",
            color: "var(--color-text-secondary)",
            fontSize: "12px",
          }}
        >
          {t("modelAssembler.layers.emptyStack") || "⚠️ Không tìm thấy layer nào trên sân khấu."}
        </div>
      ) : (
        <div
          className="assembler-layers-hierarchy-list"
          style={{ display: "flex", flexDirection: "column", gap: "8px" }}
        >
          {sortedLayers.map((layer) => {
            const isSelected = activeLayerId === layer.id;
            let partData;
            let w = 0, h = 0;
            let palette = null;
            
            const part = customParts[layer.partName];
            if (part) {
              partData = part.matrix || part.data;
              w = part.width;
              h = part.height;
              palette = part.colors || part.palette;
            } else if (DEFAULT_SPRITES[layer.partName]) {
              const sprite = DEFAULT_SPRITES[layer.partName];
              partData = getSpriteMatrix(sprite);
              palette = sprite && !Array.isArray(sprite) ? sprite.colors : null;
              h = partData ? partData.length : 0;
              w = partData && partData[0] ? partData[0].length : 0;
            }

            return (
              <div
                key={layer.id}
                draggable
                onDragStart={() => setDraggedLayerId(layer.id)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverLayerId(layer.id);
                }}
                onDragEnd={() => {
                  setDraggedLayerId(null);
                  setDragOverLayerId(null);
                }}
                onDrop={() => handleLayerDrop(layer.id)}
                className={`assembler-layer-hierarchy-card ${isSelected ? "active" : ""} ${
                  dragOverLayerId === layer.id ? "drag-over" : ""
                }`}
                onClick={() => setActiveLayerId(layer.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 12px",
                  background: isSelected ? "rgba(0, 242, 254, 0.08)" : "rgba(255,255,255,0.02)",
                  border: isSelected
                    ? "1px solid var(--color-neon-cyan)"
                    : dragOverLayerId === layer.id
                    ? "1px dashed var(--color-neon-cyan)"
                    : "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  gap: "10px",
                }}
              >
                {/* Drag handle dots */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                    cursor: "grab",
                    color: "rgba(255,255,255,0.2)",
                  }}
                  title="Kéo thả để sắp thứ tự z-index"
                >
                  <div style={{ width: "3px", height: "3px", background: "currentColor", borderRadius: "50%" }} />
                  <div style={{ width: "3px", height: "3px", background: "currentColor", borderRadius: "50%" }} />
                  <div style={{ width: "3px", height: "3px", background: "currentColor", borderRadius: "50%" }} />
                </div>

                {/* Layer Thumbnail Canvas */}
                <div style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)", borderRadius: "4px", overflow: "hidden" }}>
                  {partData ? (
                    <MiniCanvasPreview grid={partData} width={w} height={h} palette={palette} colors={palette} partName={layer.partName} />
                  ) : (
                    <span style={{ fontSize: "8px" }}>None</span>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: "#fff",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {layer.partName}
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    X:{layer.x} Y:{layer.y} | Z:{layer.zIndex} {layer.isAnimated ? "🔄" : ""}
                  </span>
                </div>

                {/* Card Actions Segment */}
                <div
                  style={{
                    display: "flex",
                    gap: "4px",
                    alignItems: "center",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => updateLayer(layer.id, { visible: !layer.visible })}
                    style={{
                      background: "none",
                      border: "none",
                      color: layer.visible ? "#fff" : "#666",
                      cursor: "pointer",
                      padding: "4px",
                    }}
                    title={layer.visible ? "Ẩn Layer" : "Hiện Layer"}
                  >
                    {layer.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                  </button>

                  <button
                    onClick={() => reorderLayer(layer.id, "up")}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#fff",
                      cursor: "pointer",
                      padding: "4px",
                    }}
                    title="Đẩy lên trước"
                  >
                    <ArrowUp size={13} />
                  </button>

                  <button
                    onClick={() => reorderLayer(layer.id, "down")}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#fff",
                      cursor: "pointer",
                      padding: "4px",
                    }}
                    title="Đẩy xuống sau"
                  >
                    <ArrowDown size={13} />
                  </button>

                  <button
                    onClick={() => duplicateLayer(layer.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#fff",
                      cursor: "pointer",
                      padding: "4px",
                    }}
                    title="Nhân bản layer"
                  >
                    <Copy size={13} />
                  </button>

                  <button
                    onClick={() => deleteLayer(layer.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ff3366",
                      cursor: "pointer",
                      padding: "4px",
                    }}
                    title="Xóa Layer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

LayerHierarchy.displayName = "LayerHierarchy";

export default LayerHierarchy;
