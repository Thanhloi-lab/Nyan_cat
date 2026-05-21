import { useState, useContext } from 'react';
import { AppProvider, AppContext } from './context/AppContext';
import CanvasPreview from './components/CanvasPreview';
import PixelEditor from './components/PixelEditor';
import ModelAssembler from './components/ModelAssembler';
import ExportPanel from './components/ExportPanel';
import ControlSidebar from './components/ControlSidebar';
import { Sparkles } from 'lucide-react';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('dashboard'); // 'dashboard' | 'assembler'
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'export'
  const { settings, updateSetting, toastMessage } = useContext(AppContext);
  const [previousMoveMode, setPreviousMoveMode] = useState('crosser');

  // Page-level transition handler
  const handlePageChange = (page) => {
    setCurrentPage(page);
    
    if (page === 'assembler') {
      // Backup the exact current movement mode before entering assembler page
      setPreviousMoveMode(settings.movementMode);
      updateSetting('movementMode', 'assembler');
    } else {
      // Restore the exact previous movement mode
      updateSetting('movementMode', previousMoveMode);
    }
  };

  if (currentPage === 'assembler') {
    return (
      <div className="app-container fullscreen-assembler-view">
        {/* Standalone Brand Header for Assembler */}
        <header className="app-header">
          <div className="logo-area">
            <Sparkles className="text-yellow" size={20} />
            <span className="retro-brand-title text-rainbow">ASSEMBLER STUDIO</span>
            <span className="logo-badge">CUSTOM MODEL CREATOR</span>
          </div>
          <button className="btn-neon-back" onClick={() => handlePageChange('dashboard')}>
            ⬅️ Quay lại Dashboard
          </button>
          <div className="resolution-tag">FREE ASSEMBLY & LAYER Z-INDEX COMPOSITOR</div>
        </header>

        <main style={{ padding: '24px 32px' }}>
          <ModelAssembler />
        </main>

        {toastMessage && (
          <div className="toast-notification">
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Brand Header with Redirect Button */}
      <header className="app-header">
        <div className="logo-area">
          <Sparkles className="text-yellow" size={20} />
          <span className="retro-brand-title text-rainbow">NYAN CAT STUDIO</span>
          <span className="logo-badge">WIDESCREEN EDITION</span>
        </div>
        
        {/* Dynamic Navigation to Standalone Custom Assembler Page */}
        <button className="btn-neon-action" onClick={() => handlePageChange('assembler')}>
          🚀 Custom Model Assembler
        </button>

        <div className="resolution-tag">PC CASE MONITOR COMPATIBLE (1920 × 462 NATIVE)</div>
      </header>

      {/* Main Grid Columns Workspace */}
      <main className="app-main-layout">
        {/* Left main content columns */}
        <div className="content-stage-area">
          {/* Top segment: Live Widescreen Canvas Viewer */}
          <CanvasPreview />

          {/* Lower segment: Action Tab Panel */}
          <div className="tab-navigation-card glass-card">
            {/* Tabs Headers (Now only 2 options) */}
            <div className="tab-navigation-panel">
              <button
                className={`tab-nav-btn ${activeTab === 'editor' ? 'active' : ''}`}
                onClick={() => setActiveTab('editor')}
              >
                1. PIXEL ART CREATOR
              </button>
              <button
                className={`tab-nav-btn ${activeTab === 'export' ? 'active' : ''}`}
                onClick={() => setActiveTab('export')}
              >
                2. CAPTURE TO VIDEO
              </button>
            </div>

            {/* Tab Bodies */}
            <div className="tab-body-container">
              {activeTab === 'editor' && <PixelEditor />}
              {activeTab === 'export' && <ExportPanel />}
            </div>
          </div>
        </div>

        {/* Right side parameters columns */}
        <ControlSidebar />
      </main>
      {toastMessage && (
        <div className="toast-notification">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
