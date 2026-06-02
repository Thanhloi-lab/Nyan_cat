import React, { useContext, useState, useEffect, useRef } from "react";
import { AppContext } from "../context/AppContext";
import { FileJson, Download } from "lucide-react";
import DriveSyncPanel from "./DriveSyncPanel";

const ProfileManager = React.memo(({ handleProfileSwitch }) => {
  const {
    profiles,
    customParts,
    createProfile,
    deleteProfile,
    importIndividualProfile,
    t,
    setToastMessage
  } = useContext(AppContext);

  const fileInputRef = useRef(null);
  const [storageUsage, setStorageUsage] = useState(0);

  const [newProfileName, setNewProfileName] = useState("My Custom Nyan");
  const [resolutionPreset, setResolutionPreset] = useState("1920x462");
  const [customWidth, setCustomWidth] = useState("1920");
  const [customHeight, setCustomHeight] = useState("462");

  // Recalculate local storage size used
  useEffect(() => {
    async function updateStorageUsage() {
      let totalBytes = 0;
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            const val = localStorage.getItem(key);
            totalBytes += key.length + (val ? val.length : 0);
          }
        }
      } catch (e) {
        console.error(e);
      }
      setStorageUsage(totalBytes);
    }
    updateStorageUsage();
  }, [profiles, customParts]);

  const handleCreateProfileSubmit = (e) => {
    e.preventDefault();
    let w;
    let h;
    if (resolutionPreset === "custom") {
      w = parseInt(customWidth) || 1920;
      h = parseInt(customHeight) || 462;
    } else {
      const [parsedW, parsedH] = resolutionPreset.split("x").map(Number);
      w = parsedW;
      h = parsedH;
    }
    createProfile(newProfileName, w, h);
    setNewProfileName("My Custom Nyan");
  };

  const handleImportProfileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleProfileFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const payload = JSON.parse(event.target.result);
        const res = importIndividualProfile(payload);
        if (res.success) {
          alert(
            t("modelAssembler.alert.importProfileSuccess", { count: res.mergedPartsCount }) ||
            `🎉 Đã nhập thành công hồ sơ và đồng bộ thêm ${res.mergedPartsCount} linh kiện tự thiết kế vào thư viện!`
          );
        } else {
          alert(t("modelAssembler.alert.importProfileError", { error: res.error }) || `❌ Lỗi khi nạp hồ sơ: ${res.error}`);
        }
      } catch (err) {
        alert(t("modelAssembler.alert.jsonSyntaxError", { message: err.message }) || `❌ File JSON không hợp lệ hoặc sai cú pháp: ${err.message}`);
      }
      e.target.value = "";
    };
    reader.readAsText(file);
  };

  const exportIndividualProfile = (id) => {
    const p = profiles[id];
    if (!p) return;

    const usedCustomParts = {};
    if (p.layers) {
      p.layers.forEach((layer) => {
        if (layer.partName && customParts[layer.partName]) {
          usedCustomParts[layer.partName] = customParts[layer.partName];
        }
        if (layer.isAnimated && Array.isArray(layer.motionFrames)) {
          layer.motionFrames.forEach((frame) => {
            if (frame.partName && customParts[frame.partName]) {
              usedCustomParts[frame.partName] = customParts[frame.partName];
            }
          });
        }
      });
    }

    const payload = {
      type: "nyan_studio_profile",
      version: "1.0",
      profile: p,
      customParts: usedCustomParts,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `nyan_profile_${p.name.toLowerCase().replace(/\s+/g, "_")}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToastMessage(t("modelAssembler.toast.exportProfileSuccess", { name: p.name }) || `📤 Đã xuất hồ sơ lắp ráp "${p.name}" thành công!`);
  };

  const storagePercent = Math.min((storageUsage / 5242880) * 100, 100);
  const isQuotaWarning = storagePercent > 80;

  return (
    <div
      className="profile-manager-workspace font-sans"
      style={{
        maxWidth: "1100px",
        margin: "40px auto",
        padding: "0 20px",
        animation: "fadeIn 0.5s ease-out",
      }}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleProfileFileChange}
        accept=".json"
        style={{ display: "none" }}
      />

      {/* Storage meter */}
      <div
        className="glass-card"
        style={{
          padding: "20px 24px",
          marginBottom: "32px",
          borderRadius: "12px",
          border: "1px solid var(--color-border-glow)",
          background: "rgba(15, 15, 27, 0.65)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <span
            style={{
              fontSize: "13px",
              fontWeight: "bold",
              color: "var(--color-neon-cyan)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {t("modelAssembler.storage.title") || "Dung lượng bộ nhớ lưu trữ LocalStorage"}
          </span>
          <span
            style={{
              fontSize: "12px",
              fontWeight: "bold",
              color: isQuotaWarning ? "#ff4444" : "var(--color-text-secondary)",
            }}
          >
            {parseFloat((storageUsage / 1024).toFixed(2))} KB / 5,120.00 KB ({storagePercent.toFixed(2)}%)
          </span>
        </div>

        <div
          style={{
            width: "100%",
            height: "8px",
            background: "rgba(0,0,0,0.4)",
            borderRadius: "4px",
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.05)",
            position: "relative",
          }}
        >
          <div
            style={{
              width: `${storagePercent}%`,
              height: "100%",
              background: isQuotaWarning
                ? "linear-gradient(90deg, #ff007f 0%, #ff4444 100%)"
                : "linear-gradient(90deg, #00f2fe 0%, #4facfe 100%)",
              boxShadow: isQuotaWarning
                ? "0 0 10px rgba(255,0,127,0.8)"
                : "0 0 10px rgba(0,242,254,0.8)",
              borderRadius: "4px",
              transition: "width 0.4s ease-out",
            }}
          />
        </div>

        {isQuotaWarning && (
          <div
            style={{
              marginTop: "12px",
              display: "flex",
              gap: "8px",
              padding: "10px 14px",
              borderRadius: "6px",
              background: "rgba(255, 68, 68, 0.1)",
              border: "1px solid rgba(255, 68, 68, 0.25)",
              color: "#ff8888",
              fontSize: "12px",
            }}
          >
            <span>⚠️</span>
            <span>
              <strong>{t("modelAssembler.storage.warningTitle") || "Cảnh báo đầy dung lượng!"}</strong>{" "}
              {t("modelAssembler.storage.warningBody") || "LocalStorage sắp hết chỗ trống. Vui lòng xuất tệp tin sao lưu JSON hoặc kết nối Google Drive để dọn bớt linh kiện tự vẽ cũ."}
            </span>
          </div>
        )}
      </div>

      {/* Main split grid */}
      <div
        className="profile-manager-container"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "32px",
          margin: "0 auto 32px",
        }}
      >
        {/* Left Side: Create */}
        <div className="profile-card font-sans">
          <h2
            className="text-rainbow"
            style={{
              fontSize: "20px",
              marginBottom: "16px",
              letterSpacing: "1px",
              fontWeight: "bold",
            }}
          >
            {t("modelAssembler.createProfile.heading") || "Thiết Lập Hồ Sơ Lắp Ráp Mới"}
          </h2>
          <p
            style={{
              color: "var(--color-text-secondary)",
              fontSize: "13px",
              marginBottom: "24px",
              lineHeight: "140%",
            }}
          >
            {t("modelAssembler.createProfile.description") || "Tạo một không gian lắp ráp độc lập với độ phân giải tùy biến để sắp đặt linh kiện và làm hoạt ảnh riêng biệt."}
          </p>

          <form
            onSubmit={handleCreateProfileSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <div className="control-group">
              <label
                className="control-label"
                style={{
                  marginBottom: "8px",
                  display: "block",
                  fontWeight: "600",
                }}
              >
                {t("modelAssembler.createProfile.labelName") || "Tên hồ sơ (Ví dụ: cyberpunk_cat)"}
              </label>
              <input
                type="text"
                className="select-custom"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  boxSizing: "border-box",
                  background: "rgba(0,0,0,0.4)",
                  border: "1px solid var(--color-border-glow)",
                  borderRadius: "6px",
                  color: "#fff",
                }}
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                required
              />
            </div>

            <div className="control-group">
              <label
                className="control-label"
                style={{
                  marginBottom: "8px",
                  display: "block",
                  fontWeight: "600",
                }}
              >
                {t("modelAssembler.createProfile.labelResolution") || "Độ phân giải hiển thị (Resolution)"}
              </label>
              <select
                className="select-custom"
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "rgba(0,0,0,0.4)",
                  border: "1px solid var(--color-border-glow)",
                  borderRadius: "6px",
                  color: "#fff",
                }}
                value={resolutionPreset}
                onChange={(e) => setResolutionPreset(e.target.value)}
              >
                <option value="1920x462">Widescreen 1920 × 462 (Native Monitor)</option>
                <option value="1920x515">Wide 1920 × 515</option>
                <option value="1920x1080">Full HD 1920 × 1080</option>
                <option value="1280x720">HD 1280 × 720</option>
                <option value="custom">{t("modelAssembler.createProfile.resolutionCustomOption") || "Tùy chọn kích thước riêng..."}</option>
              </select>
            </div>

            {resolutionPreset === "custom" && (
              <div style={{ display: "flex", gap: "16px" }}>
                <div className="control-group" style={{ flex: 1 }}>
                  <label
                    className="control-label"
                    style={{
                      marginBottom: "6px",
                      display: "block",
                      fontSize: "12px",
                    }}
                  >
                    {t("modelAssembler.createProfile.labelWidth") || "Chiều rộng (Width px)"}
                  </label>
                  <input
                    type="number"
                    className="select-custom"
                    style={{
                      width: "100%",
                      padding: "10px",
                      boxSizing: "border-box",
                      background: "rgba(0,0,0,0.4)",
                      border: "1px solid var(--color-border-glow)",
                      borderRadius: "6px",
                      color: "#fff",
                    }}
                    value={customWidth}
                    onChange={(e) => setCustomWidth(e.target.value)}
                    min="100"
                    max="3840"
                    required
                  />
                </div>
                <div className="control-group" style={{ flex: 1 }}>
                  <label
                    className="control-label"
                    style={{
                      marginBottom: "6px",
                      display: "block",
                      fontSize: "12px",
                    }}
                  >
                    {t("modelAssembler.createProfile.labelHeight") || "Chiều cao (Height px)"}
                  </label>
                  <input
                    type="number"
                    className="select-custom"
                    style={{
                      width: "100%",
                      padding: "10px",
                      boxSizing: "border-box",
                      background: "rgba(0,0,0,0.4)",
                      border: "1px solid var(--color-border-glow)",
                      borderRadius: "6px",
                      color: "#fff",
                    }}
                    value={customHeight}
                    onChange={(e) => setCustomHeight(e.target.value)}
                    min="100"
                    max="2160"
                    required
                  />
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  flex: 2,
                  padding: "12px",
                  background: "linear-gradient(135deg, #ff007f 0%, #7928ca 100%)",
                  border: "none",
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: "bold",
                  borderRadius: "6px",
                  cursor: "pointer",
                  boxShadow: "0 0 12px rgba(255,0,127,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                {t("modelAssembler.createProfile.btnCreate") || "Tạo Không Gian Lắp Ráp"}
              </button>

              <button
                type="button"
                onClick={handleImportProfileClick}
                className="btn btn-secondary"
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid var(--color-neon-cyan)",
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: "bold",
                  borderRadius: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  transition: "all 0.2s",
                }}
              >
                <FileJson size={16} /> {t("modelAssembler.createProfile.btnImport") || "Nạp tệp JSON"}
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Select */}
        <div className="profile-card font-sans">
          <h2
            className="text-rainbow"
            style={{
              fontSize: "20px",
              marginBottom: "16px",
              letterSpacing: "1px",
              fontWeight: "bold",
            }}
          >
            {t("modelAssembler.savedProfiles.heading", { count: Object.keys(profiles).length }) || `Hồ sơ đã lưu trữ (${Object.keys(profiles).length})`}
          </h2>
          <p
            style={{
              color: "var(--color-text-secondary)",
              fontSize: "13px",
              marginBottom: "24px",
              lineHeight: "140%",
            }}
          >
            {t("modelAssembler.savedProfiles.description") || "Chọn một không gian lắp ráp đã tạo trước đây từ trình duyệt để bắt đầu tiếp tục công việc vẽ và tinh chỉnh."}
          </p>

          {Object.keys(profiles).length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 0",
                border: "1px dashed rgba(255,255,255,0.08)",
                borderRadius: "8px",
                color: "var(--color-text-secondary)",
                fontSize: "13px",
              }}
            >
              {t("modelAssembler.savedProfiles.empty") || "⚠️ Không tìm thấy hồ sơ nào lưu trong máy. Hãy nhập tệp JSON hoặc tạo hồ sơ mới."}
            </div>
          ) : (
            <div className="profile-list">
              {Object.keys(profiles).map((id) => {
                const p = profiles[id];
                return (
                  <div key={id} className="profile-item">
                    <div className="profile-info">
                      <span
                        className="profile-name"
                        style={{ fontWeight: "bold", color: "#fff" }}
                      >
                        {p.name}
                      </span>
                      <span className="profile-meta-text">
                        📐 {p.resolution?.width}x{p.resolution?.height} px | 🥞 {p.layers?.length || 0} Layers
                      </span>
                    </div>
                    <div
                      className="profile-item-actions"
                      style={{ display: "flex", gap: "8px" }}
                    >
                      <button
                        className="btn btn-primary btn-small"
                        onClick={() => handleProfileSwitch(id)}
                        style={{
                          background: "linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)",
                          color: "#000",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: "4px",
                          fontWeight: "bold",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        {t("modelAssembler.savedProfiles.btnLoad") || "Mở Không Gian"}
                      </button>

                      <button
                        className="btn btn-secondary btn-small"
                        onClick={() => exportIndividualProfile(id)}
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.15)",
                          color: "var(--color-neon-cyan)",
                          padding: "5px 10px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                        title={t("modelAssembler.savedProfiles.btnExportTitle") || "Xuất hồ sơ JSON và nén linh kiện dùng kèm"}
                      >
                        <Download size={13} />
                      </button>

                      <button
                        className="btn btn-secondary btn-small"
                        onClick={() => {
                          if (
                            window.confirm(
                              t("modelAssembler.confirm.deleteProfile", { name: p.name }) ||
                              `Xóa hoàn toàn hồ sơ "${p.name}"? Thao tác này không thể hoàn tác.`
                            )
                          ) {
                            deleteProfile(id);
                          }
                        }}
                        style={{
                          background: "rgba(255,255,255,0.02)",
                          border: "1px solid rgba(255,0,0,0.3)",
                          color: "#ff4444",
                          padding: "5px 10px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        {t("modelAssembler.savedProfiles.btnDelete") || "Xóa"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cloud Sync Panel */}
      <DriveSyncPanel />
    </div>
  );
});

ProfileManager.displayName = "ProfileManager";

export default ProfileManager;
