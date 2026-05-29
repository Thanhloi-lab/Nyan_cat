import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { NyanCatModel } from '../utils/nyanRenderer';
import JSZip from 'jszip';
import { Download, Upload, Video, Archive, FileText, Paintbrush } from 'lucide-react';

export default function ExportPanel() {
  const {
    settings,
    exportProjectJson,
    importProjectJson,
    getActiveRenderPartsMapping,
    customParts,
    bindings,
    t,
    customPalettes,
    importCustomPalette,
    deleteCustomPalette,
    setToastMessage
  } = useContext(AppContext);

  // Video recording states
  const [recDuration, setRecDuration] = useState(10);
  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);
  const [recordStatus, setRecordStatus] = useState('');

  // Project Import error/success states
  const [importStatus, setImportStatus] = useState({ type: '', message: '' });

  // Handle Export PNG Frame Bundle in ZIP
  const handleExportZip = async () => {
    try {
      const zip = new JSZip();
      
      // Isolated temporary canvas to draw transparent frame sprites
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      
      const s = settings.scale;
      tempCanvas.width = 34 * s;
      tempCanvas.height = 17 * s;

      const tempCat = new NyanCatModel({
        scale: s,
        x: 6 * s, // offset centering
        y: 2 * s,
        skinStyle: settings.skinStyle,
        poptartStyle: settings.poptartStyle,
        headDx: settings.headDx,
        headDy: settings.headDy,
        customParts,
        bindings
      });

      // Pass custom color variables
      if (settings.poptartStyle === 'custom') {
        tempCat.customFrostingColor = settings.customFrostingColor;
        tempCat.customCrustColor = settings.customCrustColor;
        tempCat.customSprinkleColor = settings.customSprinkleColor;
      }

      // Load active customized components mappings
      tempCat.customPartsMapping = getActiveRenderPartsMapping();

      // Write each frame to the ZIP
      for (let f = 0; f < 4; f++) {
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCat.currentFrame = f;
        tempCat.draw(tempCtx);
        
        const dataUrl = tempCanvas.toDataURL('image/png');
        const base64Data = dataUrl.split(',')[1];
        zip.file(`nyan_frame_${f + 1}.png`, base64Data, { base64: true });
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = 'nyan_cat_custom_sprites.zip';
      link.click();
      alert('Đã tải gói frame ảnh PNG (Sprites ZIP) thành công!');
    } catch (err) {
      console.error(err);
      alert('Lỗi xuất ZIP: ' + err.message);
    }
  };

  // Canvas WebM Video Recorder (6 Mbps high retention bitrate)
  const handleRecordVideo = () => {
    if (isRecording) return;
    
    const canvas = document.getElementById('nyanCanvas');
    if (!canvas) {
      alert('Không tìm thấy live Canvas để ghi hình!');
      return;
    }

    setIsRecording(true);
    setRecordProgress(0);
    setRecordStatus('Khởi tạo Stream Canvas...');

    const recordedChunks = [];
    const stream = canvas.captureStream(24); // 24 fps capture rate

    let mediaRecorder;
    const options = { 
      mimeType: 'video/webm;codecs=vp9', 
      videoBitsPerSecond: 6000000 // 6 Mbps for lossless crisp pixel retention
    };
    
    try {
      mediaRecorder = new MediaRecorder(stream, options);
    } catch {
      // Fallback for Safari/iOS
      mediaRecorder = new MediaRecorder(stream, { 
        mimeType: 'video/webm', 
        videoBitsPerSecond: 6000000 
      });
    }

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      setRecordStatus('Đang nén video WebM...');
      setRecordProgress(100);

      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'nyan_cat_custom_1920x462.webm';
      link.click();

      setTimeout(() => {
        setIsRecording(false);
        setRecordProgress(0);
      }, 1500);
    };

    mediaRecorder.start(100);
    setRecordStatus('Đang ghi hình canvas...');

    const durationMs = recDuration * 1000;
    let elapsedMs = 0;
    const intervalMs = 250;

    const progressInterval = setInterval(() => {
      elapsedMs += intervalMs;
      const percent = Math.min((elapsedMs / durationMs) * 100, 99);
      setRecordProgress(Math.floor(percent));
      
      if (elapsedMs >= durationMs) {
        clearInterval(progressInterval);
        mediaRecorder.stop();
      }
    }, intervalMs);
  };

  // Export entire layout project as JSON file
  const handleExportJson = () => {
    const jsonString = exportProjectJson();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'nyan_studio_project.json';
    link.click();
  };

  // Import JSON project data
  const handleImportJson = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = importProjectJson(event.target.result);
      if (result.success) {
        setImportStatus({ type: 'success', message: t('exportPanel.importSuccess') });
        setTimeout(() => setImportStatus({ type: '', message: '' }), 4000);
      } else {
        setImportStatus({ type: 'error', message: t('exportPanel.importError', { error: result.error }) });
      }
    };
    reader.readAsText(file);
  };

  // Global Palette upload & delete handlers
  const handlePaletteUploadGlobal = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const name = parsed.paletteName || file.name.replace('.json', '');
        const colors = parsed.colors || parsed;
        const labels = parsed.labels || {};
        const keys = Object.keys(colors);
        const isValid = keys.length > 0 && keys.every(k => typeof colors[k] === 'string' && colors[k].startsWith('#'));
        if (!isValid) {
          alert(t('pixelEditor.errors.invalidPalette') || '⚠️ File JSON không hợp lệ! Phải chứa các key trỏ tới mã màu HEX.');
          return;
        }
        importCustomPalette(name, colors, labels);
        if (setToastMessage) {
          setToastMessage(t('pixelEditor.toasts.paletteLoaded', { name }) || `🎨 Đã nạp gói màu "${name}" thành công!`);
        }
      } catch (err) {
        console.error(err);
        alert(t('pixelEditor.errors.paletteParseError') || '❌ Lỗi khi đọc file JSON gói màu!');
      }
    };
    reader.readAsText(file);
  };

  const handlePaletteDeleteGlobal = (name) => {
    if (window.confirm(t('pixelEditor.confirm.deletePalette', { name }) || `Gỡ bỏ gói màu "${name}" khỏi danh sách?`)) {
      deleteCustomPalette(name);
      if (setToastMessage) {
        setToastMessage(t('pixelEditor.toasts.paletteDeleted', { name }) || `🗑️ Đã gỡ gói màu "${name}".`);
      }
    }
  };

  return (
    <div className="export-panel-layout font-sans">
      {/* Upper Pipeline Grid: GIF, PNG, Record Video */}
      <div className="export-pipeline-grid">
        {/* Card 1: JSON Save Backup */}
        <div className="pipeline-card highlighted glass-card">
          <div className="pipeline-header">
            <div className="icon-wrapper bg-magenta"><FileText size={20} /></div>
          <span className="card-tag">{t('exportPanel.tags.projectRestore')}</span>
          </div>
          <h3>{t('exportPanel.card1Title')}</h3>
          <p>{t('exportPanel.card1Desc')}</p>
          
          <div className="json-action-row">
            <button className="btn btn-primary btn-glow" onClick={handleExportJson}>
              <Download size={14} style={{ marginRight: 6 }} /> {t('exportPanel.exportJson')}
            </button>

            <label className="btn btn-secondary cursor-pointer">
              <Upload size={14} style={{ marginRight: 6 }} /> {t('exportPanel.importJson')}
              <input
                type="file"
                accept=".json"
                onChange={handleImportJson}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          {importStatus.message && (
            <div className={`import-alert ${importStatus.type}`}>
              {importStatus.message}
            </div>
          )}
        </div>

        {/* Card 2: PNG Export */}
        <div className="pipeline-card glass-card">
          <div className="pipeline-header">
            <div className="icon-wrapper bg-cyan"><Archive size={20} /></div>
            <span className="card-tag">{t('exportPanel.tags.pngPack')}</span>
          </div>
          <h3>{t('exportPanel.card2Title')}</h3>
          <p>{t('exportPanel.card2Desc')}</p>
          <button className="btn btn-secondary btn-glow btn-full-width" onClick={handleExportZip}>
            <Download size={14} style={{ marginRight: 6 }} /> {t('exportPanel.downloadZip')}
          </button>
        </div>

        {/* Card 3: Canvas Recorder */}
        <div className="pipeline-card glass-card">
          <div className="pipeline-header">
            <div className="icon-wrapper bg-yellow"><Video size={20} /></div>
            <span className="card-tag">{t('exportPanel.tags.video')}</span>
          </div>
          <h3>{t('exportPanel.card3Title')}</h3>
          <p>{t('exportPanel.card3Desc')}</p>
          
          <div className="recording-controls">
            <div className="select-container">
              <label>Thời lượng (Duration):</label>
              <select
                className="select-custom"
                value={recDuration}
                onChange={(e) => setRecDuration(parseInt(e.target.value))}
                disabled={isRecording}
              >
                <option value={5}>5 Giây (Nhẹ nhàng)</option>
                <option value={10}>10 Giây (Khuyên dùng)</option>
                <option value={20}>20 Giây (Chất lượng cao)</option>
              </select>
            </div>

            <button
              className={`btn btn-primary btn-glow btn-full-width ${isRecording ? 'disabled' : ''}`}
              onClick={handleRecordVideo}
              disabled={isRecording}
            >
              <Video size={14} style={{ marginRight: 6 }} /> Record WebM Video
            </button>
          </div>

          {isRecording && (
            <div className="recording-progress font-sans">
              <div className="progress-info">
                <span>{recordStatus}</span>
                <span>{recordProgress}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-bar" style={{ width: `${recordProgress}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Card 4: Palette Package Manager */}
        <div className="pipeline-card glass-card">
          <div className="pipeline-header">
            <div className="icon-wrapper bg-magenta" style={{ background: 'linear-gradient(135deg, #7928ca 0%, #ff007f 100%)' }}>
              <Paintbrush size={20} style={{ color: '#fff' }} />
            </div>
            <span className="card-tag">PALETTE</span>
          </div>
          <h3>{t('exportPanel.paletteTitle') || 'Quản Lý Gói Màu (Palette Manager)'}</h3>
          <p>{t('exportPanel.paletteDesc') || 'Nạp gói màu sắc tùy chỉnh từ tệp tin JSON để sử dụng rộng rãi khi thiết kế linh kiện.'}</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '12px' }}>
            <label className="btn btn-primary btn-glow cursor-pointer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
              <Upload size={14} style={{ marginRight: 6 }} /> {t('exportPanel.btnImportPalette') || '📥 Nạp Gói Màu JSON'}
              <input
                type="file"
                accept=".json"
                onChange={handlePaletteUploadGlobal}
                style={{ display: 'none' }}
              />
            </label>

            {Object.keys(customPalettes).length > 0 && (
              <div className="palette-loaded-list animate-fade-in" style={{ 
                background: 'rgba(0,0,0,0.3)', 
                borderRadius: '8px', 
                padding: '10px', 
                maxHeight: '120px', 
                overflowY: 'auto',
                border: '1px solid rgba(255,255,255,0.05)',
                fontSize: '11px',
                textAlign: 'left'
              }}>
                <div style={{ color: '#ff007f', fontWeight: 'bold', marginBottom: '6px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {t('exportPanel.loadedPalettes') || 'Các gói màu đã nạp'}:
                </div>
                {Object.keys(customPalettes).map((name) => (
                  <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ color: '#00ffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                      🎨 {name}
                    </span>
                    <button
                      onClick={() => handlePaletteDeleteGlobal(name)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ff3366',
                        cursor: 'pointer',
                        padding: '2px 6px',
                        fontSize: '11px'
                      }}
                      title="Gỡ gói màu"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conversion Terminal Code Guide (FFmpeg) */}
      <div className="ffmpeg-guide-card glass-card">
        <h3>💡 Looping MP4 Conversion Pipeline for Aida64 / Wallpaper Engine</h3>
        <p>Do giới hạn bản quyền của trình duyệt không cho phép kết xuất trực tiếp tệp tin MP4 H.264 phần cứng, canvas recorder sẽ xuất ra file WebM Lossless siêu nét. Bạn có hai cách để nén thành MP4 vòng lặp hoàn hảo cho màn hình phụ case PC:</p>
        
        <div className="ffmpeg-steps">
          <div className="ffmpeg-step">
            <div className="step-badge">Cách 1</div>
            <div className="step-content">
              <strong>Sử dụng Batch Script đi kèm:</strong>
              <p>Di chuyển tệp tin `nyan_cat_custom_1920x462.webm` vừa tải xuống vào thư mục dự án này, sau đó nhấp đúp chạy file <code className="code-highlight">convert_mp4.bat</code>. Nó sẽ tự động convert sang MP4 chất lượng cao ngay lập tức.</p>
            </div>
          </div>
          <div className="ffmpeg-step">
            <div className="step-badge">Cách 2</div>
            <div className="step-content">
              <strong>Lệnh PowerShell / Command Prompt (Nếu máy có FFmpeg):</strong>
              <p>Mở PowerShell tại thư mục tải xuống và chạy lệnh:</p>
              <pre className="terminal-box">
                <code>ffmpeg -i nyan_cat_custom_1920x462.webm -c:v libx264 -pix_fmt yuv420p -b:v 4M nyan_cat_custom_1920x462.mp4</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
