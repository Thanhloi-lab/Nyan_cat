import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import {
  Cloud,
  CloudUpload,
  CloudDownload,
  RefreshCw
} from "lucide-react";

const DriveSyncPanel = React.memo(() => {
  const {
    profiles,
    activeProfileId,
    importIndividualProfile,
    t,
    setToastMessage
  } = useContext(AppContext);

  // Simulated Google Drive states
  const [isDriveConnected, setIsDriveConnected] = useState(() => {
    return localStorage.getItem("nyan_drive_connected") === "true";
  });
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDrivePicker, setShowDrivePicker] = useState(false);
  const [selectedCloudFile, setSelectedCloudFile] = useState(null);
  const [backupProgress, setBackupProgress] = useState(-1);
  const [backupAction, setBackupAction] = useState(null);

  const [driveFiles, setDriveFiles] = useState([
    {
      id: "cloud_1",
      name: "nyan_profile_galaxy_cyber.json",
      date: "2026-05-20 18:30",
      size: "24.5 KB",
    },
    {
      id: "cloud_2",
      name: "nyan_profile_vaporwave_sunset.json",
      date: "2026-05-21 02:15",
      size: "42.1 KB",
    },
    {
      id: "cloud_3",
      name: "nyan_profile_rainbow_overdrive.json",
      date: "2026-05-21 14:02",
      size: "18.9 KB",
    },
  ]);

  const handleGoogleDriveConnect = () => {
    setIsAuthLoading(true);
    setTimeout(() => {
      setIsAuthLoading(false);
      setShowAuthModal(true);
    }, 1200);
  };

  const handleGoogleDriveDisconnect = () => {
    if (window.confirm(t("modelAssembler.confirm.disconnectDrive") || "Ngắt kết nối tài khoản Google Drive?")) {
      setIsDriveConnected(false);
      localStorage.removeItem("nyan_drive_connected");
      setToastMessage(t("modelAssembler.toast.driveDisconnected") || "🔌 Đã ngắt kết nối Google Drive!");
    }
  };

  const selectGoogleAccount = (email) => {
    setShowAuthModal(false);
    setIsAuthLoading(true);

    setTimeout(() => {
      setIsAuthLoading(false);
      setIsDriveConnected(true);
      localStorage.setItem("nyan_drive_connected", "true");
      setToastMessage(t("modelAssembler.toast.driveConnected", { email }) || `🔌 Đã kết nối với Google Drive qua email ${email}!`);
    }, 1500);
  };

  const handleCloudBackup = () => {
    if (Object.keys(profiles).length === 0) {
      alert(t("modelAssembler.alert.noProfileToBackup") || "⚠️ Không có profile nào để sao lưu!");
      return;
    }
    setBackupAction("backup");
    setBackupProgress(0);

    const interval = setInterval(() => {
      setBackupProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setBackupProgress(-1);
            setBackupAction(null);

            const newMockFile = {
              id: "cloud_" + Date.now(),
              name: `nyan_profiles_backup_${new Date().toISOString().slice(0, 10)}.json`,
              date: new Date().toISOString().replace("T", " ").slice(0, 16),
              size: `${(Math.random() * 30 + 10).toFixed(1)} KB`,
            };
            setDriveFiles((prevFiles) => [newMockFile, ...prevFiles]);

            setToastMessage(t("modelAssembler.toast.driveBackupSuccess") || "☁️ Đã sao lưu tất cả cấu hình lên Google Drive thành công!");
          }, 600);
          return 100;
        }
        return prev + 20;
      });
    }, 150);
  };

  const handleCloudRestoreClick = () => {
    setShowDrivePicker(true);
  };

  const handleCloudRestoreConfirm = () => {
    if (!selectedCloudFile) {
      alert(t("modelAssembler.alert.noCloudFileSelected") || "⚠️ Vui lòng chọn tệp tin sao lưu!");
      return;
    }
    setShowDrivePicker(false);
    setBackupAction("restore");
    setBackupProgress(0);

    const interval = setInterval(() => {
      setBackupProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setBackupProgress(-1);
            setBackupAction(null);

            const mockLoadedProfileId = "profile_cloud_" + Date.now();
            const mockLoadedProfile = {
              id: mockLoadedProfileId,
              name: "Cloud Galaxy Nyan (Restored)",
              resolution: { width: 1920, height: 462 },
              background: { type: "transparent", value: "" },
              layers: [
                {
                  id: "l1",
                  partName: "HEAD_OPEN",
                  x: 420,
                  y: 180,
                  zIndex: 2,
                  visible: true,
                },
                {
                  id: "l2",
                  partName: "POPTART",
                  x: 300,
                  y: 190,
                  zIndex: 1,
                  visible: true,
                },
              ],
            };

            const mockPayload = {
              type: "nyan_studio_profile",
              version: "1.0",
              profile: mockLoadedProfile,
              customParts: {},
            };
            importIndividualProfile(mockPayload);

            alert(
              t("modelAssembler.alert.cloudRestoreSuccess", {
                filename: selectedCloudFile,
                profileName: "Cloud Galaxy Nyan (Restored)",
              }) || `🎉 Đã phục hồi thành công tệp tin "${selectedCloudFile}"! Profile mới "Cloud Galaxy Nyan (Restored)" đã được thêm.`
            );
          }, 600);
          return 100;
        }
        return prev + 25;
      });
    }, 120);
  };

  return (
    <div
      className="glass-card"
      style={{
        padding: "30px",
        borderRadius: "12px",
        border: "1px solid var(--color-border-glow)",
        background:
          "linear-gradient(135deg, rgba(15, 15, 27, 0.8) 0%, rgba(20, 20, 45, 0.8) 100%)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-50px",
          right: "-50px",
          width: "200px",
          height: "200px",
          background:
            "radial-gradient(circle, rgba(0,242,254,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          paddingBottom: "16px",
          marginBottom: "20px",
        }}
      >
        <h3
          style={{
            fontSize: "18px",
            fontWeight: "bold",
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "var(--color-neon-cyan)",
          }}
        >
          <Cloud
            size={22}
            style={{
              filter: "drop-shadow(0 0 5px var(--color-neon-cyan))",
            }}
          />{" "}
          {t("modelAssembler.drive.heading") || "Đồng bộ hóa đám mây (Cloud Sync)"}
        </h3>

        {isDriveConnected ? (
          <span
            style={{
              fontSize: "12px",
              background: "rgba(0,242,254,0.1)",
              color: "var(--color-neon-cyan)",
              border: "1px solid rgba(0,242,254,0.2)",
              padding: "4px 10px",
              borderRadius: "20px",
              fontWeight: "bold",
            }}
          >
            {t("modelAssembler.drive.statusConnected") || "Đã kết nối"}
          </span>
        ) : (
          <span
            style={{
              fontSize: "12px",
              background: "rgba(255,255,255,0.05)",
              color: "var(--color-text-secondary)",
              border: "1px solid rgba(255,255,255,0.1)",
              padding: "4px 10px",
              borderRadius: "20px",
              fontWeight: "bold",
            }}
          >
            {t("modelAssembler.drive.statusDisconnected") || "Chưa kết nối"}
          </span>
        )}
      </div>

      {!isDriveConnected ? (
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <p
            style={{
              color: "var(--color-text-secondary)",
              fontSize: "14px",
              marginBottom: "24px",
              maxWidth: "600px",
              margin: "0 auto 24px",
              lineHeight: "150%",
            }}
          >
            {t("modelAssembler.drive.connectDescription") || "Liên kết ứng dụng với tài khoản Google Drive để tự động đồng bộ tất cả cài đặt, linh kiện tự vẽ và hồ sơ lắp ráp lên đám mây bảo mật."}
          </p>

          <button
            type="button"
            onClick={handleGoogleDriveConnect}
            disabled={isAuthLoading}
            className="btn btn-primary"
            style={{
              padding: "12px 28px",
              background:
                "linear-gradient(135deg, #4285F4 0%, #357AE8 100%)",
              border: "none",
              color: "#fff",
              fontSize: "14px",
              fontWeight: "bold",
              borderRadius: "6px",
              cursor: "pointer",
              boxShadow: "0 0 15px rgba(66,133,244,0.4)",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              opacity: isAuthLoading ? 0.7 : 1,
              pointerEvents: isAuthLoading ? "none" : "auto",
            }}
          >
            {isAuthLoading ? (
              <>
                <RefreshCw className="animate-spin" size={16} />{" "}
                {t("modelAssembler.drive.btnConnectLoading") || "Đang xác thực..."}
              </>
            ) : (
              <>{t("modelAssembler.drive.btnConnect") || "Kết nối Google Drive"}</>
            )}
          </button>
        </div>
      ) : (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "20px",
              marginBottom: "24px",
            }}
          >
            <div style={{ flex: 1, minWidth: "280px" }}>
              <p
                style={{
                  margin: "0 0 8px",
                  fontSize: "13px",
                  color: "var(--color-text-secondary)",
                }}
              >
                {t("modelAssembler.drive.connectedAccount") || "Tài khoản kết nối:"}{" "}
                <strong>nyan_master@gmail.com</strong>
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.4)",
                  lineHeight: "140%",
                }}
              >
                {t("modelAssembler.drive.connectedDescription") || "Dữ liệu được lưu an toàn trong thư mục ứng dụng ẩn của Google Drive. Bạn có thể sao lưu thủ công hoặc khôi phục bất cứ lúc nào."}
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={handleCloudBackup}
                className="btn btn-primary"
                style={{
                  background:
                    "linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)",
                  color: "#000",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: "6px",
                  fontWeight: "bold",
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <CloudUpload size={16} /> {t("modelAssembler.drive.btnBackup") || "Sao lưu đám mây"}
              </button>

              <button
                onClick={handleCloudRestoreClick}
                className="btn btn-secondary"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  padding: "10px 18px",
                  borderRadius: "6px",
                  fontWeight: "bold",
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <CloudDownload size={16} /> {t("modelAssembler.drive.btnRestore") || "Khôi phục từ mây"}
              </button>

              <button
                onClick={handleGoogleDriveDisconnect}
                className="btn"
                style={{
                  background: "rgba(255, 68, 68, 0.15)",
                  border: "1px solid rgba(255, 68, 68, 0.3)",
                  color: "#ff8888",
                  padding: "9px 14px",
                  borderRadius: "6px",
                  fontWeight: "bold",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                {t("modelAssembler.drive.btnDisconnect") || "Đăng xuất"}
              </button>
            </div>
          </div>

          {backupProgress >= 0 && (
            <div
              style={{
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.05)",
                padding: "16px",
                borderRadius: "8px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "bold",
                    color: "var(--color-neon-cyan)",
                  }}
                >
                  {backupAction === "backup"
                    ? (t("modelAssembler.drive.progressBackup") || "Đang tiến hành đồng bộ sao lưu...")
                    : (t("modelAssembler.drive.progressRestore") || "Đang tải dữ liệu từ máy chủ...")}
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "bold",
                    color: "#fff",
                  }}
                >
                  {backupProgress}%
                </span>
              </div>
              <div
                style={{
                  width: "100%",
                  height: "6px",
                  background: "rgba(0,0,0,0.5)",
                  borderRadius: "3px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${backupProgress}%`,
                    height: "100%",
                    background:
                      "linear-gradient(90deg, #00f2fe 0%, #7928ca 100%)",
                    boxShadow: "0 0 8px rgba(0, 242, 254, 0.6)",
                    transition: "width 0.1s linear",
                  }}
                />
              </div>
            </div>
          )}

          {/* Backup files list */}
          <div
            style={{
              background: "rgba(0,0,0,0.2)",
              border: "1px solid rgba(255,255,255,0.03)",
              borderRadius: "8px",
              padding: "16px",
            }}
          >
            <h4
              style={{
                margin: "0 0 12px",
                fontSize: "13px",
                color: "#fff",
                fontWeight: "bold",
                letterSpacing: "0.5px",
              }}
            >
              {t("modelAssembler.drive.backupListTitle", { count: driveFiles.length }) || `Danh sách bản sao lưu trên Cloud (${driveFiles.length})`}
            </h4>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                maxHeight: "180px",
                overflowY: "auto",
              }}
            >
              {driveFiles.map((file) => (
                <div
                  key={file.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "rgba(255,255,255,0.01)",
                    border: "1px solid rgba(255,255,255,0.03)",
                    padding: "10px 14px",
                    borderRadius: "6px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#fff",
                        fontWeight: "500",
                      }}
                    >
                      {file.name}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "rgba(255,255,255,0.3)",
                      }}
                    >
                      {t("modelAssembler.drive.fileUpdatedAt", { date: file.date, size: file.size }) || `Cập nhật: ${file.date} | Dung lượng: ${file.size}`}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedCloudFile(file.name);
                      handleCloudRestoreConfirm();
                    }}
                    style={{
                      background: "rgba(0,242,254,0.1)",
                      border: "1px solid rgba(0,242,254,0.25)",
                      color: "var(--color-neon-cyan)",
                      padding: "4px 10px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    {t("modelAssembler.drive.btnLoadNow") || "Khôi phục ngay"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Simulated Auth Modal */}
      {showAuthModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          fontFamily: 'sans-serif'
        }}>
          <div style={{
            background: '#1a1a24',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '30px',
            width: '400px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.8)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#fff', fontSize: '18px', textAlign: 'center' }}>Sign in with Google</h3>
            <p style={{ color: '#aaa', fontSize: '13px', margin: '0 0 24px 0', textAlign: 'center' }}>Choose an account to continue to Nyan Art Studio</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {['nyan_master@gmail.com', 'loilak.personal@gmail.com'].map((email) => (
                <div 
                  key={email}
                  onClick={() => selectGoogleAccount(email)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    color: '#fff',
                    fontSize: '13px',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                >
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#4285F4',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px',
                    fontWeight: 'bold',
                    fontSize: '11px'
                  }}>{email[0].toUpperCase()}</div>
                  {email}
                </div>
              ))}
            </div>
            <button 
              onClick={() => setShowAuthModal(false)}
              style={{
                width: '100%',
                marginTop: '20px',
                padding: '10px',
                background: 'none',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

DriveSyncPanel.displayName = "DriveSyncPanel";

export default DriveSyncPanel;
