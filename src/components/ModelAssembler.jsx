/* eslint-disable react-hooks/refs */
import { useContext, useState, useRef, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { DEFAULT_SPRITES, PALETTES } from '../utils/nyanRenderer';
import { Plus, Trash2, Copy, Eye, EyeOff, ArrowUp, ArrowDown, Upload, Layers, Save, RefreshCw, Download, Cloud, CloudDownload, CloudUpload, FileJson, Check } from 'lucide-react';
import PixelEditor from './PixelEditor';


export default function ModelAssembler() {
  const {
    customParts,
    layers,
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
    bindings,
    updateSetting,
    profiles,
    activeProfileId,
    resolution,
    setResolution,
    createProfile,
    loadProfile,
    saveProfile,
    deleteProfile,
    importIndividualProfile,
    closeActiveProfile,
    checkHasUnsavedChanges
  } = useContext(AppContext);

  const [activeLayerId, setActiveLayerId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDrawingModalOpen, setIsDrawingModalOpen] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const layerStartPos = useRef({ x: 0, y: 0 });

  const canvasContainerRef = useRef(null);
  const [scaleFactor, setScaleFactor] = useState(1);

  // Animation Play Preview State for workspace
  const [isPlayPreviewActive, setIsPlayPreviewActive] = useState(false);
  const [previewSecondsElapsed, setPreviewSecondsElapsed] = useState(0);

  useEffect(() => {
    if (!isPlayPreviewActive) return;
    let animId;
    let lastTime = performance.now();
    const tick = (now) => {
      animId = requestAnimationFrame(tick);
      const delta = now - lastTime;
      if (delta >= 1000 / 6) { // 6 FPS matching custom animation rate
        lastTime = now - (delta % (1000 / 6));
        setPreviewSecondsElapsed(prev => prev + 1 / 6);
      }
    };
    animId = requestAnimationFrame(tick);
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isPlayPreviewActive]);

  // Profile Manager state
  const [newProfileName, setNewProfileName] = useState('My Custom Nyan');
  const [resolutionPreset, setResolutionPreset] = useState('1920x462');
  const [customWidth, setCustomWidth] = useState('1920');
  const [customHeight, setCustomHeight] = useState('462');

  // Unsaved Warning Modal State
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // { type: 'switch', data: id } | { type: 'close' }

  // Local File and Google Drive Sync States
  const fileInputRef = useRef(null);
  const [storageUsage, setStorageUsage] = useState(0);

  // Google Drive Simulation States
  const [isDriveConnected, setIsDriveConnected] = useState(() => {
    return localStorage.getItem('nyan_drive_connected') === 'true';
  });
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDrivePicker, setShowDrivePicker] = useState(false);
  const [selectedCloudFile, setSelectedCloudFile] = useState(null);
  const [backupProgress, setBackupProgress] = useState(-1); // percentage 0-100, or -1 if inactive
  const [backupAction, setBackupAction] = useState(null); // 'backup' | 'restore'

  // Simulated files in Google Drive
  const [driveFiles, setDriveFiles] = useState([
    { id: 'cloud_1', name: 'nyan_profile_galaxy_cyber.json', date: '2026-05-20 18:30', size: '24.5 KB' },
    { id: 'cloud_2', name: 'nyan_profile_vaporwave_sunset.json', date: '2026-05-21 02:15', size: '42.1 KB' },
    { id: 'cloud_3', name: 'nyan_profile_rainbow_overdrive.json', date: '2026-05-21 14:02', size: '18.9 KB' }
  ]);

  // Recalculate storage size
  const updateStorageUsage = () => {
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
  };

  useEffect(() => {
    updateStorageUsage();
  }, [profiles, activeProfileId, customParts]);

  // Automatically monitor workspace width to scale the active resolution viewport
  useEffect(() => {
    const handleResize = () => {
      if (canvasContainerRef.current && resolution) {
        const width = canvasContainerRef.current.clientWidth;
        setScaleFactor(width / resolution.width);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    const timer = setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [resolution]);

  // 1. Export an individual profile
  const exportIndividualProfile = (id) => {
    const p = profiles[id];
    if (!p) return;
    
    // Find all custom parts used in this profile's layers (including inside motion frames)
    const usedCustomParts = {};
    if (p.layers) {
      p.layers.forEach(layer => {
        if (layer.partName && customParts[layer.partName]) {
          usedCustomParts[layer.partName] = customParts[layer.partName];
        }
        if (layer.isAnimated && Array.isArray(layer.motionFrames)) {
          layer.motionFrames.forEach(frame => {
            if (frame.partName && customParts[frame.partName]) {
              usedCustomParts[frame.partName] = customParts[frame.partName];
            }
          });
        }
      });
    }

    const payload = {
      type: 'nyan_studio_profile',
      version: '1.0',
      profile: p,
      customParts: usedCustomParts
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nyan_profile_${p.name.toLowerCase().replace(/\s+/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToastMessage(`Đã tải xuống profile "${p.name}" thành công!`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // 2. Handle file import trigger
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
          alert(`Nhập profile thành công!\n- Đã nạp thêm ${res.mergedPartsCount} bộ phận tự vẽ vào thư viện của bạn.`);
        } else {
          alert(`Không thể nhập profile: ${res.error}`);
        }
      } catch (err) {
        alert(`Lỗi cú pháp tệp JSON: ${err.message}`);
      }
      e.target.value = ''; // clear input
    };
    reader.readAsText(file);
  };

  // 3. Google Drive Simulation Handlers
  /* 
   * ==========================================
   * GOOGLE DRIVE PRODUCTION API REFERENCE:
   * ==========================================
   * To connect this workspace with the REAL Google Drive API, follow these steps:
   * 
   * A. GOOGLE DEVELOPER CONSOLE SETUP:
   *    1. Create a project at https://console.cloud.google.com
   *    2. Enable "Google Drive API" and "Google Picker API".
   *    3. Configure your OAuth Consent Screen with standard user scopes:
   *       - 'https://www.googleapis.com/auth/drive.file' (gives read/write access to files created by this app)
   *       - 'https://www.googleapis.com/auth/drive.install'
   *    4. Create an OAuth 2.0 Client ID (Web Application) and set authorized Javascript Origins to your dev/prod URLs.
   *    5. Create an API Key for Picker API authorization.
   * 
   * B. ON-DEMAND SCRIPT INJECTION:
   *    Add the Google API scripts dynamically to the DOM:
   *    - https://accounts.google.com/gsi/client (Google Identity Services for Authorization)
   *    - https://apis.google.com/js/api.js (Google API Client for Picker)
   * 
   * C. CLIENT INITIALIZATION PATTERN:
   *    const client = google.accounts.oauth2.initTokenClient({
   *      client_id: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
   *      scope: 'https://www.googleapis.com/auth/drive.file',
   *      callback: (tokenResponse) => {
   *        if (tokenResponse.access_token) {
   *          // Save access token, mark connected, and instantiate Picker
   *          setAccessToken(tokenResponse.access_token);
   *        }
   *      },
   *    });
   *    
   * D. REAL PROFILE EXPORT TO DRIVE:
   *    await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
   *      method: 'POST',
   *      headers: {
   *        Authorization: `Bearer ${access_token}`,
   *        'Content-Type': 'multipart/related; boundary=foo_bar_boundary'
   *      },
   *      body: `--foo_bar_boundary\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
   *            JSON.stringify({ name: 'nyan_profile.json', parents: ['appDataFolder'] || [] }) +
   *            `\r\n--foo_bar_boundary\r\nContent-Type: application/json\r\n\r\n` +
   *            JSON.stringify(payload) + `\r\n--foo_bar_boundary--`
   *    });
   * 
   * E. TRIGGER REAL GOOGLE PICKER:
   *    const picker = new google.picker.PickerBuilder()
   *      .addView(new google.picker.DocsView(google.picker.ViewId.FOLDERS))
   *      .setOAuthToken(access_token)
   *      .setDeveloperKey(API_KEY)
   *      .setCallback((data) => {
   *        if (data.action === google.picker.Action.PICKED) {
   *          const fileId = data.docs[0].id;
   *          // fetch data and import...
   *        }
   *      }).build();
   *    picker.setVisible(true);
   */
  const handleGoogleDriveConnect = () => {
    setIsAuthLoading(true);
    setTimeout(() => {
      setIsAuthLoading(false);
      setShowAuthModal(true);
    }, 1200);
  };

  const handleGoogleDriveDisconnect = () => {
    if (window.confirm('Bạn muốn ngắt kết nối tài khoản Google Drive?')) {
      setIsDriveConnected(false);
      localStorage.removeItem('nyan_drive_connected');
      setToastMessage('Đã ngắt kết nối Google Drive.');
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  const selectGoogleAccount = (email) => {
    setShowAuthModal(false);
    setIsAuthLoading(true);
    
    // Simulate connection check
    setTimeout(() => {
      setIsAuthLoading(false);
      setIsDriveConnected(true);
      localStorage.setItem('nyan_drive_connected', 'true');
      setToastMessage(`Đã kết nối thành công với Drive (${email})!`);
      setTimeout(() => setToastMessage(''), 3000);
    }, 1500);
  };

  const handleCloudBackup = () => {
    if (Object.keys(profiles).length === 0) {
      alert('Không có profile nào để backup lên Google Drive!');
      return;
    }
    setBackupAction('backup');
    setBackupProgress(0);
    
    // Simulated upload progress bar
    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setBackupProgress(-1);
            setBackupAction(null);
            
            // Add new item to mock file list
            const newMockFile = {
              id: 'cloud_' + Date.now(),
              name: `nyan_profiles_backup_${new Date().toISOString().slice(0,10)}.json`,
              date: new Date().toISOString().replace('T', ' ').slice(0, 16),
              size: `${(Math.random() * 30 + 10).toFixed(1)} KB`
            };
            setDriveFiles(prevFiles => [newMockFile, ...prevFiles]);
            
            setToastMessage('Đã sao lưu toàn bộ profiles lên Google Drive thành công!');
            setTimeout(() => setToastMessage(''), 3000);
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
      alert('Vui lòng chọn 1 tệp sao lưu trên đám mây!');
      return;
    }
    setShowDrivePicker(false);
    setBackupAction('restore');
    setBackupProgress(0);

    // Simulated download progress bar
    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setBackupProgress(-1);
            setBackupAction(null);
            
            // Mock loaded data into state
            const mockLoadedProfileId = 'profile_cloud_' + Date.now();
            const mockLoadedProfile = {
              id: mockLoadedProfileId,
              name: 'Cloud Galaxy Nyan (Restored)',
              resolution: { width: 1920, height: 462 },
              background: { type: 'transparent', value: '' },
              layers: [
                { id: 'l1', partName: 'HEAD_OPEN', x: 420, y: 180, zIndex: 2, visible: true },
                { id: 'l2', partName: 'POPTART', x: 300, y: 190, zIndex: 1, visible: true }
              ]
            };

            const mockPayload = {
              type: 'nyan_studio_profile',
              version: '1.0',
              profile: mockLoadedProfile,
              customParts: {}
            };
            importIndividualProfile(mockPayload);
            
            alert(`Nạp tệp "${selectedCloudFile}" từ Google Drive thành công!\nProfile mới "Cloud Galaxy Nyan (Restored)" đã được tải về local.`);
          }, 600);
          return 100;
        }
        return prev + 25;
      });
    }, 120);
  };

  // Profile Event Handlers
  const handleCreateProfileSubmit = (e) => {
    e.preventDefault();
    let w = 1920;
    let h = 462;
    if (resolutionPreset === 'custom') {
      w = parseInt(customWidth) || 1920;
      h = parseInt(customHeight) || 462;
    } else {
      const [parsedW, parsedH] = resolutionPreset.split('x').map(Number);
      w = parsedW;
      h = parsedH;
    }
    createProfile(newProfileName, w, h);
    setNewProfileName('My Custom Nyan');
  };

  const handleProfileSwitch = (nextId) => {
    if (checkHasUnsavedChanges()) {
      setPendingAction({ type: 'switch', data: nextId });
      setShowUnsavedModal(true);
    } else {
      loadProfile(nextId);
    }
  };

  const handleCloseProfileClick = () => {
    if (checkHasUnsavedChanges()) {
      setPendingAction({ type: 'close' });
      setShowUnsavedModal(true);
    } else {
      closeActiveProfile();
    }
  };

  const executePendingAction = (saveBefore) => {
    if (saveBefore) {
      saveProfile();
    }
    
    if (pendingAction.type === 'switch') {
      loadProfile(pendingAction.data);
    } else if (pendingAction.type === 'close') {
      closeActiveProfile();
    }
    
    setShowUnsavedModal(false);
    setPendingAction(null);
  };

  // Sync assembler positions back to animated simulation settings
  const applyAssemblerToAnimation = () => {
    // Find layers representing head and poptart
    const headLayer = layers.find(l => 
      l.partName === 'HEAD_OPEN' || 
      l.partName === 'HEAD_BLINK' || 
      l.partName.toLowerCase().includes('head')
    );
    const bodyLayer = layers.find(l => 
      l.partName === 'POPTART' || 
      l.partName.toLowerCase().includes('cookie') || 
      l.partName.toLowerCase().includes('poptart')
    );

    if (!headLayer || !bodyLayer) {
      alert('Để áp dụng mô hình động, bối cảnh lắp ráp phải có ít nhất 1 Layer Đầu mèo (Head) và 1 Layer Thân bánh (Cookie/Poptart)!');
      return;
    }

    const scale = settings.scale || 8;
    const dxPixels = headLayer.x - bodyLayer.x;
    const dyPixels = headLayer.y - bodyLayer.y;

    // Relative DX in unscaled sprite pixels
    const headDx = Math.round(dxPixels / scale);
    
    // Relative DY (accounts for Pop-Tart dimensions & visible head height)
    let headHeight = 13;
    const customHead = customParts[headLayer.partName];
    if (customHead) {
      headHeight = customHead.height;
    } else if (DEFAULT_SPRITES[headLayer.partName]) {
      headHeight = DEFAULT_SPRITES[headLayer.partName].length;
    }
    const headDy = Math.round(dyPixels / scale) - (18 - headHeight);

    // Apply relative offsets to animated settings
    updateSetting('headDx', headDx);
    updateSetting('headDy', headDy);

    // Auto-bind parts from the assembler to dynamic slots
    if (headLayer.partName && headLayer.partName !== 'default') {
      bindPartToSlot('HEAD_OPEN', headLayer.partName);
      bindPartToSlot('HEAD_BLINK', headLayer.partName);
    }
    if (bodyLayer.partName && bodyLayer.partName !== 'default') {
      bindPartToSlot('POPTART', bodyLayer.partName);
    }

    // Auto-bind legs and tail if custom parts were used
    layers.forEach(layer => {
      if (layer.partName && layer.partName !== 'default' && customParts[layer.partName]) {
        if (layer.partName.toLowerCase().includes('tail')) {
          bindPartToSlot('TAIL_UP', layer.partName);
          bindPartToSlot('TAIL_MID', layer.partName);
          bindPartToSlot('TAIL_DOWN', layer.partName);
        }
        if (layer.partName.toLowerCase().includes('leg')) {
          bindPartToSlot('LEG_DOWN', layer.partName);
          bindPartToSlot('LEG_FRONT', layer.partName);
          bindPartToSlot('LEG_BACK', layer.partName);
        }
      }
    });

    setToastMessage('Đã đồng bộ tọa độ & linh kiện lắp ráp thành công sang Mô hình Động!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Force-save to localStorage explicitly and trigger toast
  const handleSaveProject = () => {
    const projectData = {
      customParts,
      layers,
      background,
      bindings,
      settings
    };
    try {
      localStorage.setItem('nyan_studio_project_data', JSON.stringify(projectData));
      setToastMessage('Đã lưu cấu hình dự án hiện tại vào trình duyệt thành công!');
      setTimeout(() => setToastMessage(''), 3000);
    } catch (e) {
      console.error(e);
      alert('Có lỗi xảy ra khi lưu dự án: ' + e.message);
    }
  };

  // Load color map for drawing preview thumbnails in options
  const skin = PALETTES.skins[settings.skinStyle] || PALETTES.skins.classic;
  const pop  = PALETTES.poptarts[settings.poptartStyle] || PALETTES.poptarts.strawberry;
  const colorMap = {
    0: 'transparent',
    1: '#000000',
    2: settings.customSkinColor || skin.fill,
    3: settings.customSkinShadow || skin.shadow,
    4: settings.customCrustColor || pop.crust,
    5: settings.customFrostingColor || pop.frosting,
    6: settings.customSprinkleColor || pop.sprinkle,
    7: '#ffffff',
    8: '#ff9999'
  };

  // File Upload helper for background image
  const handleBackgroundUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBackground({ type: 'image', value: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Draw 2D array representation onto a miniature HTML structure for previews
  const renderMiniPartPreview = (grid, cols, rows) => {
    return (
      <div
        className="mini-preview-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 2px)`,
          gridTemplateRows: `repeat(${rows}, 2px)`,
          gap: '0px',
          width: `${cols * 2}px`,
          height: `${rows * 2}px`
        }}
      >
        {grid.map((row, r) =>
          row.map((val, c) => (
            <div
              key={`${r}-${c}`}
              style={{
                backgroundColor: val === 0 ? 'transparent' : colorMap[val]
              }}
            />
          ))
        )}
      </div>
    );
  };

  // Drag interaction logic
  const handleMouseDown = (e, id, currentX, currentY) => {
    e.stopPropagation();
    setActiveLayerId(id);
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    layerStartPos.current = { x: currentX, y: currentY };
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !activeLayerId) return;
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    
    // Scale movement to fit canvas scaling ratio based on the scaled element width
    updateLayer(activeLayerId, {
      x: Math.round(layerStartPos.current.x + dx / scaleFactor),
      y: Math.round(layerStartPos.current.y + dy / scaleFactor)
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Keyboard nudge offsets for active layer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!activeLayerId) return;
      const step = e.shiftKey ? 10 : 1;
      const targetLayer = layers.find(l => l.id === activeLayerId);
      if (!targetLayer) return;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        updateLayer(activeLayerId, { y: targetLayer.y - step });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        updateLayer(activeLayerId, { y: targetLayer.y + step });
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        updateLayer(activeLayerId, { x: targetLayer.x - step });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        updateLayer(activeLayerId, { x: targetLayer.x + step });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLayerId, layers, updateLayer]);

  if (!activeProfileId) {
    const storagePercent = Math.min((storageUsage / 5242880) * 100, 100);
    const isQuotaWarning = storagePercent > 80;

    return (
      <div className="profile-manager-workspace font-sans" style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px', animation: 'fadeIn 0.5s ease-out' }}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleProfileFileChange}
          accept=".json"
          style={{ display: 'none' }}
        />

        {/* 1. TOP NEON STORAGE BAR & QUOTA BANNER */}
        <div className="glass-card" style={{ padding: '20px 24px', marginBottom: '32px', borderRadius: '12px', border: '1px solid var(--color-border-glow)', background: 'rgba(15, 15, 27, 0.65)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-neon-cyan)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              💾 DUNG LƯỢNG BỘ NHỚ TRÌNH DUYỆT (LOCAL STORAGE CAP)
            </span>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: isQuotaWarning ? '#ff4444' : 'var(--color-text-secondary)' }}>
              {parseFloat((storageUsage / 1024).toFixed(2))} KB / 5,120.00 KB ({storagePercent.toFixed(2)}%)
            </span>
          </div>
          
          <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.4)', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
            <div style={{
              width: `${storagePercent}%`,
              height: '100%',
              background: isQuotaWarning 
                ? 'linear-gradient(90deg, #ff007f 0%, #ff4444 100%)' 
                : 'linear-gradient(90deg, #00f2fe 0%, #4facfe 100%)',
              boxShadow: isQuotaWarning 
                ? '0 0 10px rgba(255,0,127,0.8)' 
                : '0 0 10px rgba(0,242,254,0.8)',
              borderRadius: '4px',
              transition: 'width 0.4s ease-out'
            }} />
          </div>

          {isQuotaWarning && (
            <div style={{ marginTop: '12px', display: 'flex', gap: '8px', padding: '10px 14px', borderRadius: '6px', background: 'rgba(255, 68, 68, 0.1)', border: '1px solid rgba(255, 68, 68, 0.25)', color: '#ff8888', fontSize: '12px' }}>
              <span>⚠️</span>
              <span><strong>Cảnh báo dung lượng:</strong> Bộ nhớ đệm của bạn đã đạt trên 80%. Vui lòng xuất (.json) bớt các profile cũ ra máy hoặc đồng bộ lên Google Drive Cloud để tránh mất mát dữ liệu vẽ!</span>
            </div>
          )}
        </div>

        {/* 2. MAIN SPLIT GRID (CREATE VS LIST) */}
        <div className="profile-manager-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', margin: '0 auto 32px' }}>
          
          {/* Left Side: Create New Profile */}
          <div className="profile-card font-sans">
            <h2 className="text-rainbow" style={{ fontSize: '20px', marginBottom: '16px', letterSpacing: '1px', fontWeight: 'bold' }}>
              ✨ TẠO PROFILE MỚI
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '24px', lineHeight: '140%' }}>
              Thiết kế một mô hình hoạt ảnh Nyan Cat độc lập với khung vẽ trống theo đúng độ phân giải tùy chọn của bạn.
            </p>
            
            <form onSubmit={handleCreateProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="control-group">
                <label className="control-label" style={{ marginBottom: '8px', display: 'block', fontWeight: '600' }}>Tên Profile</label>
                <input
                  type="text"
                  className="select-custom"
                  style={{ width: '100%', padding: '10px 14px', boxSizing: 'border-box', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--color-border-glow)', borderRadius: '6px', color: '#fff' }}
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  required
                />
              </div>
              
              <div className="control-group">
                <label className="control-label" style={{ marginBottom: '8px', display: 'block', fontWeight: '600' }}>Độ Phân Giải Preset</label>
                <select
                  className="select-custom"
                  style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--color-border-glow)', borderRadius: '6px', color: '#fff' }}
                  value={resolutionPreset}
                  onChange={(e) => setResolutionPreset(e.target.value)}
                >
                  <option value="1920x462">Widescreen 1920 × 462 (Native Monitor)</option>
                  <option value="1920x515">Wide 1920 × 515</option>
                  <option value="1920x1080">Full HD 1920 × 1080</option>
                  <option value="1280x720">HD 1280 × 720</option>
                  <option value="custom">Tùy Chỉnh Kích Thước...</option>
                </select>
              </div>
              
              {resolutionPreset === 'custom' && (
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div className="control-group" style={{ flex: 1 }}>
                    <label className="control-label" style={{ marginBottom: '6px', display: 'block', fontSize: '12px' }}>Rộng (Width)</label>
                    <input
                      type="number"
                      className="select-custom"
                      style={{ width: '100%', padding: '10px', boxSizing: 'border-box', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--color-border-glow)', borderRadius: '6px', color: '#fff' }}
                      value={customWidth}
                      onChange={(e) => setCustomWidth(e.target.value)}
                      min="100"
                      max="3840"
                      required
                    />
                  </div>
                  <div className="control-group" style={{ flex: 1 }}>
                    <label className="control-label" style={{ marginBottom: '6px', display: 'block', fontSize: '12px' }}>Cao (Height)</label>
                    <input
                      type="number"
                      className="select-custom"
                      style={{ width: '100%', padding: '10px', boxSizing: 'border-box', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--color-border-glow)', borderRadius: '6px', color: '#fff' }}
                      value={customHeight}
                      onChange={(e) => setCustomHeight(e.target.value)}
                      min="100"
                      max="2160"
                      required
                    />
                  </div>
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    flex: 2,
                    padding: '12px',
                    background: 'linear-gradient(135deg, #ff007f 0%, #7928ca 100%)',
                    border: 'none',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    boxShadow: '0 0 12px rgba(255,0,127,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  🚀 Tạo Profile mới
                </button>

                <button
                  type="button"
                  onClick={handleImportProfileClick}
                  className="btn btn-secondary"
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--color-neon-cyan)',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s'
                  }}
                >
                  <FileJson size={16} /> Nhập .JSON
                </button>
              </div>
            </form>
          </div>
          
          {/* Right Side: Select Profile */}
          <div className="profile-card font-sans">
            <h2 className="text-rainbow" style={{ fontSize: '20px', marginBottom: '16px', letterSpacing: '1px', fontWeight: 'bold' }}>
              📂 PROFILE ĐÃ LƯU ({Object.keys(profiles).length})
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '24px', lineHeight: '140%' }}>
              Chọn một thiết kế bạn đang làm dở từ danh sách dưới đây để tiếp tục chỉnh sửa.
            </p>
            
            {Object.keys(profiles).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '8px', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                Chưa có profile nào được lưu. Hãy nhập hoặc tạo mới để bắt đầu!
              </div>
            ) : (
              <div className="profile-list">
                {Object.keys(profiles).map((id) => {
                  const p = profiles[id];
                  return (
                    <div key={id} className="profile-item">
                      <div className="profile-info">
                        <span className="profile-name" style={{ fontWeight: 'bold', color: '#fff' }}>{p.name}</span>
                        <span className="profile-meta-text">
                          📐 {p.resolution?.width}x{p.resolution?.height} px | 🥞 {p.layers?.length || 0} Layers
                        </span>
                      </div>
                      <div className="profile-item-actions" style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn btn-primary btn-small"
                          onClick={() => handleProfileSwitch(id)}
                          style={{
                            background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
                            color: '#000',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Tải
                        </button>
                        
                        <button
                          className="btn btn-secondary btn-small"
                          onClick={() => exportIndividualProfile(id)}
                          style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            color: 'var(--color-neon-cyan)',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="Xuất profile ra máy tính (.json)"
                        >
                          <Download size={13} />
                        </button>

                        <button
                          className="btn btn-secondary btn-small"
                          onClick={() => {
                            if (window.confirm(`Bạn có chắc chắn muốn xóa profile "${p.name}" không?`)) {
                              deleteProfile(id);
                            }
                          }}
                          style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,0,0,0.3)',
                            color: '#ff4444',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 3. GOOGLE DRIVE CLOUD SYNC CENTER */}
        <div className="glass-card" style={{
          padding: '30px',
          borderRadius: '12px',
          border: '1px solid var(--color-border-glow)',
          background: 'linear-gradient(135deg, rgba(15, 15, 27, 0.8) 0%, rgba(20, 20, 45, 0.8) 100%)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Neon background light effect */}
          <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(0,242,254,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-neon-cyan)' }}>
              <Cloud size={22} style={{ filter: 'drop-shadow(0 0 5px var(--color-neon-cyan))' }} /> ☁️ TRUNG TÂM ĐỒNG BỘ ĐÁM MÂY (GOOGLE DRIVE SYNC)
            </h3>
            
            {isDriveConnected ? (
              <span style={{ fontSize: '12px', background: 'rgba(0,242,254,0.1)', color: 'var(--color-neon-cyan)', border: '1px solid rgba(0,242,254,0.2)', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold' }}>
                🟢 ĐÃ KẾT NỐI DRIVE
              </span>
            ) : (
              <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-secondary)', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold' }}>
                ⚪ CHƯA KẾT NỐI
              </span>
            )}
          </div>

          {!isDriveConnected ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '24px', maxWidth: '600px', margin: '0 auto 24px', lineHeight: '150%' }}>
                Bảo vệ các tác phẩm của bạn khỏi rủi ro dọn bộ nhớ cache hoặc đổi thiết bị. Hãy kết nối tài khoản Google Drive để tự động lưu trữ, chia sẻ và đồng bộ hóa các Profile Nyan Cat đa dạng của bạn ở mọi nơi.
              </p>
              
              <button
                type="button"
                onClick={handleGoogleDriveConnect}
                disabled={isAuthLoading}
                className="btn btn-primary"
                style={{
                  padding: '12px 28px',
                  background: 'linear-gradient(135deg, #4285F4 0%, #357AE8 100%)',
                  border: 'none',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  boxShadow: '0 0 15px rgba(66,133,244,0.4)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: isAuthLoading ? 0.7 : 1,
                  pointerEvents: isAuthLoading ? 'none' : 'auto'
                }}
              >
                {isAuthLoading ? (
                  <>
                    <RefreshCw className="animate-spin" size={16} /> Đang mở Google OAuth2...
                  </>
                ) : (
                  <>
                    🔌 Kết Nối Với Google Drive
                  </>
                )}
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', marginBottom: '24px' }}>
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <p style={{ margin: '0 0 8px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                    Tài khoản được kết nối: <strong>nyan_master@gmail.com</strong>
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: '140%' }}>
                    Toàn bộ profiles có thể được mã hóa và tải lên thư mục riêng biệt của Nyan Studio trên đám mây của bạn.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleCloudBackup}
                    className="btn btn-primary"
                    style={{
                      background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
                      color: '#000',
                      border: 'none',
                      padding: '10px 18px',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <CloudUpload size={16} /> Sao Lưu Lên Drive
                  </button>

                  <button
                    onClick={handleCloudRestoreClick}
                    className="btn btn-secondary"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#fff',
                      padding: '10px 18px',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <CloudDownload size={16} /> Khôi Phục Từ Drive
                  </button>

                  <button
                    onClick={handleGoogleDriveDisconnect}
                    className="btn"
                    style={{
                      background: 'rgba(255, 68, 68, 0.15)',
                      border: '1px solid rgba(255, 68, 68, 0.3)',
                      color: '#ff8888',
                      padding: '9px 14px',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    Ngắt Kết Nối
                  </button>
                </div>
              </div>

              {/* Simulated Cloud Actions Status & Progress */}
              {backupProgress >= 0 && (
                <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-neon-cyan)' }}>
                      {backupAction === 'backup' ? '📤 Đang tải sao lưu lên Google Drive...' : '📥 Đang nạp tệp từ Google Drive...'}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>
                      {backupProgress}%
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.5)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${backupProgress}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #00f2fe 0%, #7928ca 100%)',
                      boxShadow: '0 0 8px rgba(0, 242, 254, 0.6)',
                      transition: 'width 0.1s linear'
                    }} />
                  </div>
                </div>
              )}

              {/* Display mock backups list on cloud */}
              <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '8px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '13px', color: '#fff', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                  ☁️ TỆP SAO LƯU HIỆN CÓ TRÊN DRIVE ({driveFiles.length})
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                  {driveFiles.map((file) => (
                    <div key={file.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '12px', color: '#fff', fontWeight: '500' }}>{file.name}</span>
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
                          Ngày lưu: {file.date} | Dung lượng: {file.size}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedCloudFile(file.name);
                          handleCloudRestoreConfirm();
                        }}
                        style={{
                          background: 'rgba(0,242,254,0.1)',
                          border: '1px solid rgba(0,242,254,0.25)',
                          color: 'var(--color-neon-cyan)',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        Nạp ngay
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Sort layers by zIndex to render properly
  const sortedLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex);
  const activeLayer = layers.find(l => l.id === activeLayerId);

  return (
    <div className="assembler-tab-layout" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      {/* Visual Canvas Board Area */}
      <div className="assembler-canvas-container glass-card" onClick={() => setActiveLayerId(null)}>
        <div className="editor-card-header">
          <div className="header-meta">
            <span className="card-tag">STUDIO</span>
            <h2 className="font-sans" style={{ fontSize: '15px', fontWeight: 'bold' }}>
              📟 {profiles[activeProfileId]?.name} ({resolution.width} × {resolution.height})
            </h2>
          </div>
          
          <div className="header-actions" style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Quick Switch Dropdown */}
            {Object.keys(profiles).length > 1 && (
              <div className="quick-switch font-sans" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Đổi profile:</span>
                <select
                  className="select-custom select-compact"
                  value={activeProfileId}
                  onChange={(e) => handleProfileSwitch(e.target.value)}
                  style={{ padding: '4px 8px', fontSize: '11px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--color-border-glow)', borderRadius: '4px', color: '#fff' }}
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
            <div className="resolution-selector font-sans" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Kích thước:</span>
              <select
                className="select-custom select-compact"
                value={`${resolution.width}x${resolution.height}`}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'custom') {
                    const w = prompt('Nhập chiều rộng (Width):', resolution.width);
                    const h = prompt('Nhập chiều cao (Height):', resolution.height);
                    if (w && h) {
                      setResolution({ width: parseInt(w) || 1920, height: parseInt(h) || 462 });
                    }
                  } else {
                    const [w, h] = val.split('x').map(Number);
                    setResolution({ width: w, height: h });
                  }
                }}
                style={{ padding: '4px 8px', fontSize: '11px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--color-border-glow)', borderRadius: '4px', color: '#fff' }}
              >
                <option value="1920x462">1920 × 462 (Standard)</option>
                <option value="1920x515">1920 × 515 (Wide)</option>
                <option value="1920x1080">1920 × 1080 (FHD)</option>
                <option value="1280x720">1280 × 720 (HD)</option>
                <option value="custom">Custom...</option>
              </select>
            </div>

            {/* Quick Action Sync Buttons */}
            <div className="quick-actions" style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-secondary btn-small flex items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPlayPreviewActive(!isPlayPreviewActive);
                }}
                style={{
                  background: isPlayPreviewActive ? 'rgba(0, 229, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  borderColor: isPlayPreviewActive ? '#00e5ff' : 'rgba(255, 255, 255, 0.15)',
                  color: isPlayPreviewActive ? '#00e5ff' : '#fff',
                  fontSize: '11px',
                  padding: '6px 12px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
                title="Chạy thử các hoạt ảnh và part-swapping của linh kiện trực tiếp trên canvas kéo thả"
              >
                {isPlayPreviewActive ? '⏸️ Dừng Thử' : '▶️ Chạy Thử Hoạt Ảnh'}
              </button>

              <button
                className="btn btn-secondary btn-small flex items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseProfileClick();
                }}
                style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: '11px', padding: '6px 12px' }}
                title="Quay lại danh sách quản lý Profile"
              >
                📂 Quản Lý Profile
              </button>
              
              <button
                className="btn btn-primary btn-small flex items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  applyAssemblerToAnimation();
                }}
                style={{ background: 'linear-gradient(135deg, #ff007f 0%, #7928ca 100%)', borderColor: 'rgba(255,0,127,0.3)', color: '#fff', fontSize: '11px', padding: '6px 12px' }}
                title="Đồng bộ cấu trúc lắp ráp này sang mô hình hoạt ảnh Nyan Cat đang chạy"
              >
                <RefreshCw size={11} style={{ marginRight: 4 }} /> Áp Dụng
              </button>
              
              <button
                className="btn btn-primary btn-small flex items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  saveProfile();
                }}
                style={{ background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)', borderColor: 'rgba(0,242,254,0.3)', color: '#000', fontWeight: 'bold', fontSize: '11px', padding: '6px 12px' }}
                title="Lưu các thay đổi của profile hiện tại"
              >
                <Save size={11} style={{ marginRight: 4 }} /> Lưu Profile
              </button>
            </div>

            {/* Background Style Switcher */}
            <div className="bg-options" style={{ display: 'flex', gap: '4px' }}>
              <button
                className={`btn btn-secondary btn-small ${background.type === 'transparent' ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setBackground({ type: 'transparent', value: '' });
                }}
                style={{ fontSize: '10px', padding: '4px 8px' }}
              >
                Checker
              </button>
              <button
                className={`btn btn-secondary btn-small ${background.type === 'color' ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setBackground({ type: 'color', value: '#0f0f1b' });
                }}
                style={{ fontSize: '10px', padding: '4px 8px' }}
              >
                Space Blue
              </button>
              
              <label className="btn btn-secondary btn-small cursor-pointer flex items-center" style={{ fontSize: '10px', padding: '4px 8px' }}>
                <Upload size={10} style={{ marginRight: 2 }} /> Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBackgroundUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>
        </div>
 
        {/* Dynamic Scaled Working Board Wrapper */}
        <div 
          className="assembler-stage-wrapper" 
          ref={canvasContainerRef} 
          style={{ 
            width: '100%', 
            height: `${resolution.height * scaleFactor}px`, 
            position: 'relative', 
            overflow: 'hidden',
            border: '1px solid var(--color-border-glow)',
            borderRadius: '8px'
          }}
        >
          <div
            className="assembler-stage-board"
            style={{
              width: `${resolution.width}px`,
              height: `${resolution.height}px`,
              backgroundColor: background.type === 'color' ? background.value : 'transparent',
              backgroundImage: background.type === 'image' ? `url(${background.value})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'absolute',
              top: 0,
              left: 0,
              transform: `scale(${scaleFactor})`,
              transformOrigin: 'left top',
              overflow: 'hidden'
            }}
          >
            {/* Render checkered background only if transparent background is set */}
            {background.type === 'transparent' && <div className="transparent-grid-overlay" />}
 
            {/* Starfield simulation preview rendering under layers (for context depth) */}
            <div className="assembler-bg-space-dust" />
 
            {/* Render Layers */}
            {sortedLayers.map((layer) => {
              if (!layer.visible) return null;
 
              // Determine active partName and offsets for frame-by-frame custom motion
              let partName = layer.partName;
              let dx = 0;
              let dy = 0;

              if (isPlayPreviewActive && layer.isAnimated && Array.isArray(layer.motionFrames) && layer.motionFrames.length > 0) {
                const frameIndex = Math.floor(previewSecondsElapsed * 6) % layer.motionFrames.length;
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
 
              const live = liveEditingPartRef.current;
              if (live && live.key === partName && live.data) {
                partData = live.data;
                width = partData[0] ? partData[0].length : 0;
                height = partData.length;
              } else {
                const custom = customParts[partName];
                if (custom) {
                  partData = custom.data;
                  width = custom.width;
                  height = custom.height;
                } else if (DEFAULT_SPRITES[partName]) {
                  partData = DEFAULT_SPRITES[partName];
                  height = partData.length;
                  width = partData[0].length;
                }
              }
 
              if (!partData) return null;
 
              const s = settings.scale; // Pixel art scaling unit
 
              return (
                <div
                  key={layer.id}
                  className={`assembler-layer-node ${activeLayerId === layer.id ? 'active' : ''}`}
                  style={{
                    position: 'absolute',
                    left: `${layer.x + dx * s}px`,
                    top: `${layer.y + dy * s}px`,
                    width: `${width * s}px`,
                    height: `${height * s}px`,
                    zIndex: layer.zIndex,
                    cursor: isDragging && activeLayerId === layer.id ? 'grabbing' : 'grab'
                  }}
                  onMouseDown={(e) => handleMouseDown(e, layer.id, layer.x, layer.y)}
                >
                  {/* Miniature canvas grid render */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${width}, ${s}px)`,
                      gridTemplateRows: `repeat(${height}, ${s}px)`,
                      width: '100%',
                      height: '100%'
                    }}
                  >
                    {partData.map((row, r) =>
                      row.map((val, c) => (
                        <div
                          key={`${r}-${c}`}
                          style={{
                            backgroundColor: val === 0 ? 'transparent' : colorMap[val]
                          }}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
 
        <div className="stage-controls-bar">
          <span>💡 Di chuyển linh kiện: **Kéo thả chuột** hoặc **Click chọn linh kiện + Dùng phím mũi tên bàn phím** (giữ Shift để dịch chuyển nhanh).</span>
        </div>
      </div>
 
      {/* Layer stack / Custom Items Sidebar */}
      <div className="assembler-control-panel glass-card">
        {/* Top Segment: Add Library Parts */}
        <div className="panel-section">
          <h3>1. Drag / Add Items to Stage</h3>
          <div className="assembler-parts-source font-sans">
            {/* Custom parts */}
            <div className="source-category">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h4 style={{ margin: 0 }}>My Custom Sprites ({Object.keys(customParts).length})</h4>
                <button
                  className="btn btn-primary btn-small"
                  onClick={() => setIsDrawingModalOpen(true)}
                  style={{
                    background: 'linear-gradient(135deg, #ff007f 0%, #7928ca 100%)',
                    border: 'none',
                    color: '#fff',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 0 8px rgba(255,0,127,0.3)'
                  }}
                >
                  🎨 Vẽ Part Mới
                </button>
              </div>
              {Object.keys(customParts).length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', padding: '16px 0' }}>
                  <div className="hint-empty" style={{ textAlign: 'center', fontSize: '12px' }}>Chưa có linh kiện vẽ nào trong Thư viện.</div>
                  <button
                    className="btn btn-primary btn-small"
                    onClick={() => setIsDrawingModalOpen(true)}
                    style={{
                      background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
                      border: 'none',
                      color: '#000',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      boxShadow: '0 0 8px rgba(0,242,254,0.3)'
                    }}
                  >
                    🎨 Vẽ Linh Kiện Ngay
                  </button>
                </div>
              ) : (
                <div className="source-parts-grid">
                  {Object.keys(customParts).map((key) => {
                    const part = customParts[key];
                    return (
                      <div key={key} className="part-add-card" onClick={() => addLayer(key)}>
                        {renderMiniPartPreview(part.data, part.width, part.height)}
                        <span className="add-title">{part.name}</span>
                        <button className="add-layer-btn">
                          <Plus size={12} /> Add
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
 
            {/* Standard Defaults */}
            <div className="source-category">
              <h4>Standard Default Sprites</h4>
              <div className="source-parts-grid">
                {Object.keys(DEFAULT_SPRITES).map((key) => {
                  const grid = DEFAULT_SPRITES[key];
                  const height = grid.length;
                  const width = grid[0].length;
                  return (
                    <div key={key} className="part-add-card" onClick={() => addLayer(key)}>
                      {renderMiniPartPreview(grid, width, height)}
                      <span className="add-title">{key.toLowerCase().replace('_', ' ')}</span>
                      <button className="add-layer-btn">
                        <Plus size={12} /> Add
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
 
        {/* Precise Coordinate Offset controls */}
        {activeLayer && (
          <>
            <div className="panel-section highlight">
              <h3>2. Fine-tune Active Layer Coordinates</h3>
              <div className="active-coordinate-sliders">
                <span className="active-title font-sans">Selected: <strong>{activeLayer.partName}</strong></span>
                <div className="slider-box font-sans">
                  <div className="slider-meta">
                    <label>X Position (Horizontal)</label>
                    <span>{activeLayer.x} px</span>
                  </div>
                  <input
                    type="range"
                    min="-200"
                    max={resolution.width}
                    value={activeLayer.x}
                    onChange={(e) => updateLayer(activeLayer.id, { x: parseInt(e.target.value) })}
                    className="custom-slider"
                  />
                </div>
                <div className="slider-box font-sans">
                  <div className="slider-meta">
                    <label>Y Position (Vertical)</label>
                    <span>{activeLayer.y} px</span>
                  </div>
                  <input
                    type="range"
                    min="-200"
                    max={resolution.height}
                    value={activeLayer.y}
                    onChange={(e) => updateLayer(activeLayer.id, { y: parseInt(e.target.value) })}
                    className="custom-slider"
                  />
                </div>
              </div>
            </div>

            {/* Custom Layer Motion System */}
            <div className="panel-section highlight font-sans" style={{ borderTop: '2px solid rgba(255, 0, 127, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '13px', display: 'flex', alignItems: 'center', color: '#ff007f' }}>
                  🎭 Hoạt Ảnh & Chuyển Động Riêng
                </h3>
                <label className="cyber-switch-label" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '12px' }}>
                  <input
                    type="checkbox"
                    checked={!!activeLayer.isAnimated}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      const updates = { isAnimated: checked };
                      if (checked && (!activeLayer.motionFrames || activeLayer.motionFrames.length === 0)) {
                        // Initialize with 4 default frames matching current part
                        updates.motionFrames = Array(4).fill(null).map(() => ({
                          partName: activeLayer.partName,
                          dx: 0,
                          dy: 0
                        }));
                      }
                      updateLayer(activeLayer.id, updates);
                    }}
                    style={{ marginRight: '6px', width: '14px', height: '14px', accentColor: '#ff007f' }}
                  />
                  <strong style={{ color: activeLayer.isAnimated ? '#ff007f' : '#888' }}>
                    {activeLayer.isAnimated ? 'KÍCH HOẠT' : 'TẮT'}
                  </strong>
                </label>
              </div>

              {activeLayer.isAnimated && activeLayer.motionFrames && (
                <div className="motion-frames-editor" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span style={{ fontSize: '11px', color: '#888', display: 'block' }}>
                    Hoạt ảnh chạy lặp vô tận ở tốc độ 6 FPS (khớp nhịp Bobbing). Bạn có thể đổi hình vẽ và tịnh tiến pixel cho mỗi frame.
                  </span>

                  <div className="frames-list-scrollable" style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
                    {activeLayer.motionFrames.map((frame, index) => {
                      return (
                        <div 
                          key={index} 
                          className="glass-card" 
                          style={{ 
                            background: 'rgba(255, 255, 255, 0.02)', 
                            padding: '10px', 
                            borderRadius: '6px', 
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', color: '#00e5ff', fontWeight: 'bold', letterSpacing: '1px' }}>
                              ⚡ KHUNG HÌNH (FRAME) {index + 1}
                            </span>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <div>
                              <label style={{ fontSize: '10px', color: '#888', display: 'block', marginBottom: '4px' }}>Dịch ngang dx (pixels)</label>
                              <input
                                type="number"
                                value={frame.dx}
                                onChange={(e) => {
                                  const newFrames = [...activeLayer.motionFrames];
                                  newFrames[index] = { ...frame, dx: parseInt(e.target.value) || 0 };
                                  updateLayer(activeLayer.id, { motionFrames: newFrames });
                                }}
                                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px', borderRadius: '4px', fontSize: '11px' }}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '10px', color: '#888', display: 'block', marginBottom: '4px' }}>Dịch dọc dy (pixels)</label>
                              <input
                                type="number"
                                value={frame.dy}
                                onChange={(e) => {
                                  const newFrames = [...activeLayer.motionFrames];
                                  newFrames[index] = { ...frame, dy: parseInt(e.target.value) || 0 };
                                  updateLayer(activeLayer.id, { motionFrames: newFrames });
                                }}
                                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px', borderRadius: '4px', fontSize: '11px' }}
                              />
                            </div>
                          </div>

                          <div>
                            <label style={{ fontSize: '10px', color: '#888', display: 'block', marginBottom: '4px' }}>Hoán đổi linh kiện (Part Swap)</label>
                            <select
                              value={frame.partName}
                              onChange={(e) => {
                                const newFrames = [...activeLayer.motionFrames];
                                newFrames[index] = { ...frame, partName: e.target.value };
                                updateLayer(activeLayer.id, { motionFrames: newFrames });
                              }}
                              style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px', borderRadius: '4px', fontSize: '11px', outline: 'none' }}
                            >
                              <optgroup label="Thư viện vẽ (Custom Parts)">
                                {Object.keys(customParts).map((name) => (
                                  <option key={name} value={name}>{customParts[name].name || name}</option>
                                ))}
                              </optgroup>
                              <optgroup label="Linh kiện mặc định (Default)">
                                {Object.keys(DEFAULT_SPRITES).map((name) => (
                                  <option key={name} value={name}>{name.toLowerCase().replace('_', ' ')}</option>
                                ))}
                              </optgroup>
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        const newFrames = [...activeLayer.motionFrames, {
                          partName: activeLayer.motionFrames[activeLayer.motionFrames.length - 1]?.partName || activeLayer.partName,
                          dx: 0,
                          dy: 0
                        }];
                        updateLayer(activeLayer.id, { motionFrames: newFrames });
                      }}
                      style={{ flex: 1, padding: '8px', background: 'rgba(0, 229, 255, 0.1)', border: '1px solid #00e5ff', color: '#00e5ff', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', transition: 'all 0.2s' }}
                    >
                      ➕ Thêm Frame
                    </button>
                    {activeLayer.motionFrames.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newFrames = activeLayer.motionFrames.slice(0, -1);
                          updateLayer(activeLayer.id, { motionFrames: newFrames });
                        }}
                        style={{ flex: 1, padding: '8px', background: 'rgba(255, 0, 127, 0.1)', border: '1px solid #ff007f', color: '#ff007f', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', transition: 'all 0.2s' }}
                      >
                        ➖ Xóa Frame Cuối
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
 
        {/* Bottom Segment: Layer Stack Manager */}
        <div className="panel-section">
          <div className="section-header-compact">
            <h3><Layers size={14} style={{ marginRight: 6 }} /> 3. Layers & z-index order ({layers.length})</h3>
            <span className="card-tag">STACK</span>
          </div>
          {layers.length === 0 ? (
            <div className="empty-library font-sans" style={{ textAlign: 'center', padding: '20px' }}>
              Chưa có linh kiện nào trên Canvas. Click chọn linh kiện ở trên để đưa vào Canvas!
            </div>
          ) : (
            <div className="assembler-layer-stack-list font-sans">
              {/* Show layer stack in descending order (highest z-index on top) */}
              {[...layers]
                .sort((a, b) => b.zIndex - a.zIndex)
                .map((layer) => {
                  return (
                    <div
                      key={layer.id}
                      className={`layer-stack-item ${activeLayerId === layer.id ? 'selected' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveLayerId(layer.id);
                      }}
                    >
                      <div className="layer-item-meta">
                        <span className="layer-badge">z-index: {layer.zIndex}</span>
                        <span className="layer-name">{layer.partName}</span>
                      </div>
                      
                      <div className="layer-item-actions">
                        <button
                          className="btn-layer-action"
                          onClick={(e) => {
                            e.stopPropagation();
                            reorderLayer(layer.id, 'up');
                          }}
                          title="Đẩy lên trước (Tăng z-index)"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          className="btn-layer-action"
                          onClick={(e) => {
                            e.stopPropagation();
                            reorderLayer(layer.id, 'down');
                          }}
                          title="Đẩy ra sau (Giảm z-index)"
                        >
                          <ArrowDown size={12} />
                        </button>
                        <button
                          className="btn-layer-action"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateLayer(layer.id, { visible: !layer.visible });
                          }}
                          title={layer.visible ? 'Ẩn layer' : 'Hiện layer'}
                        >
                          {layer.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                        </button>
                        <button
                          className="btn-layer-action"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateLayer(layer.id);
                          }}
                          title="Nhân bản layer (Duplicate)"
                        >
                          <Copy size={12} />
                        </button>
                        <button
                          className="btn-layer-action delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteLayer(layer.id);
                          }}
                          title="Xóa layer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Unsaved warning custom modal */}
      {showUnsavedModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-content glass-card font-sans">
            <h3 className="modal-title text-rainbow" style={{ color: 'var(--color-neon-magenta)', marginBottom: '12px', fontSize: '18px', fontWeight: 'bold' }}>
              ⚠️ CẢNH BÁO THAY ĐỔI CHƯA LƯU
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '20px', lineHeight: '140%' }}>
              Bạn đang có thay đổi chưa lưu trong profile <strong>"{profiles[activeProfileId]?.name}"</strong>. Bạn muốn làm gì trước khi tiếp tục?
            </p>
            <div className="modal-actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                className="btn btn-primary"
                onClick={() => executePendingAction(true)}
                style={{
                  background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
                  color: '#000',
                  fontWeight: 'bold',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                💾 Lưu thay đổi & Tiếp tục
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => executePendingAction(false)}
                style={{
                  background: 'rgba(255, 0, 127, 0.15)',
                  border: '1px solid var(--color-neon-magenta)',
                  color: '#fff',
                  fontWeight: 'bold',
                  padding: '12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                🗑️ Bỏ qua thay đổi
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowUnsavedModal(false);
                  setPendingAction(null);
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  padding: '12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                ❌ Quay lại chỉnh sửa (Hủy)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Pixel Art Creator Modal */}
      {isDrawingModalOpen && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-content editor-modal-content glass-card font-sans">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
              <h3 className="modal-title text-rainbow" style={{ color: 'var(--color-neon-cyan)', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
                🎨 PIXEL ART CREATOR STUDIO
              </h3>
              <button
                className="btn btn-secondary btn-small"
                onClick={() => setIsDrawingModalOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  padding: '6px 14px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Đóng / Quay lại
              </button>
            </div>
            <div className="modal-editor-body">
              <PixelEditor />
            </div>
          </div>
        </div>
      )}

      {/* Google OAuth2 Account Selection Modal */}
      {showAuthModal && (
        <div className="custom-modal-overlay" style={{ zIndex: 1100 }}>
          <div className="custom-modal-content glass-card font-sans" style={{ maxWidth: '400px', padding: '28px', border: '1px solid var(--color-neon-cyan)', boxShadow: '0 0 30px rgba(0, 242, 254, 0.2)' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(66, 133, 244, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Cloud size={24} color="#4285F4" />
              </div>
              <h3 className="modal-title" style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', margin: '0 0 6px' }}>Đăng nhập với Google</h3>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>để tiếp tục đồng bộ Nyan Studio</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {[
                { name: 'Thanh Loi LAK', email: 'loilak.dev@gmail.com', avatarBg: '#ff007f' },
                { name: 'Nyan Cat Creator', email: 'nyancat.studio@gmail.com', avatarBg: '#00f2fe' }
              ].map((acc) => (
                <div 
                  key={acc.email}
                  onClick={() => selectGoogleAccount(acc.email)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  className="google-account-item"
                >
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: acc.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold', fontSize: '13px' }}>
                    {acc.name[0]}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>{acc.name}</span>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{acc.email}</span>
                  </div>
                </div>
              ))}

              <div 
                onClick={() => selectGoogleAccount('custom_user@gmail.com')}
                style={{
                  textAlign: 'center',
                  padding: '10px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.01)',
                  border: '1px dashed rgba(255,255,255,0.15)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: 'var(--color-text-secondary)'
                }}
              >
                ➕ Sử dụng một tài khoản khác
              </div>
            </div>

            <button
              onClick={() => setShowAuthModal(false)}
              style={{
                width: '100%',
                padding: '10px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Hủy bỏ
            </button>
          </div>
        </div>
      )}

      {/* Google Drive Simulated File Picker Modal */}
      {showDrivePicker && (
        <div className="custom-modal-overlay" style={{ zIndex: 1100 }}>
          <div className="custom-modal-content glass-card font-sans" style={{ maxWidth: '520px', padding: '24px', border: '1px solid var(--color-neon-cyan)', boxShadow: '0 0 35px rgba(0, 242, 254, 0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '6px', color: '#fff' }}>
                📁 Google Picker - Chọn tệp sao lưu (.json)
              </h3>
              <button 
                onClick={() => setShowDrivePicker(false)}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '18px', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input 
                type="text" 
                placeholder="Tìm kiếm tệp sao lưu trên Drive..." 
                className="select-custom" 
                style={{ flex: 1, padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#fff', fontSize: '13px' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto', paddingRight: '4px', marginBottom: '20px' }}>
              {driveFiles.map((file) => {
                const isSelected = selectedCloudFile === file.name;
                return (
                  <div 
                    key={file.id}
                    onClick={() => setSelectedCloudFile(file.name)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '6px',
                      background: isSelected ? 'rgba(0, 242, 254, 0.08)' : 'rgba(255,255,255,0.01)',
                      border: isSelected ? '1px solid var(--color-neon-cyan)' : '1px solid rgba(255,255,255,0.05)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ color: isSelected ? 'var(--color-neon-cyan)' : 'rgba(255,255,255,0.4)' }}>
                        <FileJson size={20} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: isSelected ? 'var(--color-neon-cyan)' : '#fff' }}>{file.name}</span>
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
                          Cập nhật: {file.date} | {file.size}
                        </span>
                      </div>
                    </div>

                    <div style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      border: '2px solid',
                      borderColor: isSelected ? 'var(--color-neon-cyan)' : 'rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isSelected ? 'var(--color-neon-cyan)' : 'transparent'
                    }}>
                      {isSelected && <Check size={10} color="#000" strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowDrivePicker(false)}
                style={{
                  padding: '10px 16px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                Hủy bỏ
              </button>
              
              <button
                onClick={handleCloudRestoreConfirm}
                disabled={!selectedCloudFile}
                style={{
                  padding: '10px 20px',
                  background: selectedCloudFile ? 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)' : 'rgba(255,255,255,0.05)',
                  border: 'none',
                  color: selectedCloudFile ? '#000' : 'rgba(255,255,255,0.3)',
                  borderRadius: '6px',
                  cursor: selectedCloudFile ? 'pointer' : 'not-allowed',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                📥 Khôi phục bản ghi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
