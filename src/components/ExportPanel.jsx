import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { NyanCatModel } from '../utils/nyanRenderer';
import JSZip from 'jszip';
import { Download, Upload, Video, Archive, FileText } from 'lucide-react';

export default function ExportPanel() {
  const {
    settings,
    exportProjectJson,
    importProjectJson,
    getActiveRenderPartsMapping
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
        headDy: settings.headDy
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
        setImportStatus({ type: 'success', message: 'Đã nhập (Import) dự án thành công!' });
        setTimeout(() => setImportStatus({ type: '', message: '' }), 4000);
      } else {
        setImportStatus({ type: 'error', message: 'Lỗi: Tệp tin không đúng định dạng. ' + result.error });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="export-panel-layout font-sans">
      {/* Upper Pipeline Grid: GIF, PNG, Record Video */}
      <div className="export-pipeline-grid">
        {/* Card 1: JSON Save Backup */}
        <div className="pipeline-card highlighted glass-card">
          <div className="pipeline-header">
            <div className="icon-wrapper bg-magenta"><FileText size={20} /></div>
            <span className="card-tag">PROJECT RESTORE</span>
          </div>
          <h3>1. Save & Load Project File</h3>
          <p>Xuất hoặc nhập toàn bộ dữ liệu vẽ, các lớp layer lắp ráp z-index và gán hoạt ảnh vào 1 tệp JSON (Key tiếng Anh). An toàn và dễ chia sẻ.</p>
          
          <div className="json-action-row">
            <button className="btn btn-primary btn-glow" onClick={handleExportJson}>
              <Download size={14} style={{ marginRight: 6 }} /> Export JSON Project
            </button>

            <label className="btn btn-secondary cursor-pointer">
              <Upload size={14} style={{ marginRight: 6 }} /> Import JSON Project
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
            <span className="card-tag">PNG SPRITE PACK</span>
          </div>
          <h3>2. Export Custom PNG Frames</h3>
          <p>Tải xuống chuỗi 4 khung hình động (PNG nền trong suốt) của chú mèo Nyan Cat đã custom. Hoàn hảo để thiết kế overlays, stream widgets hoặc edit video.</p>
          <button className="btn btn-secondary btn-glow btn-full-width" onClick={handleExportZip}>
            <Download size={14} style={{ marginRight: 6 }} /> Download Sprite ZIP
          </button>
        </div>

        {/* Card 3: Canvas Recorder */}
        <div className="pipeline-card glass-card">
          <div className="pipeline-header">
            <div className="icon-wrapper bg-yellow"><Video size={20} /></div>
            <span className="card-tag">VIDEO PIPELINE</span>
          </div>
          <h3>3. Record Lossless WebM</h3>
          <p>Ghi hình trực tiếp màn hình Canvas preview 1920x462 ở tốc độ 24 FPS với chất lượng nén cao 6 Mbps. Thích hợp cho cả Nyan Cat và cảnh lắp ráp layers!</p>
          
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
