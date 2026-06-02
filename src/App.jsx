import { useState, useContext } from 'react';
import ReactDOM from 'react-dom';
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
  const { settings, updateSetting, toastMessage, t } = useContext(AppContext);
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
            <span className="retro-brand-title text-rainbow">{t('app.assemblerStudio')}</span>
            <span className="logo-badge">{t('app.customModelCreator')}</span>
          </div>
          <button className="btn-neon-back" onClick={() => handlePageChange('dashboard')}>
            {t('app.backToDashboard')}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="resolution-tag">{t('app.assemblerResolutionTag')}</div>
            <select
              aria-label={t('settings.language')}
              value={settings.language || 'vi'}
              onChange={(e) => updateSetting('language', e.target.value)}
              style={{
                height: 28,
                padding: '0 10px',
                borderRadius: 999,
                background: 'rgba(0,0,0,0.35)',
                border: '1px solid rgba(255,255,255,0.18)',
                color: '#fff',
                fontSize: 12,
                fontWeight: 'bold',
                letterSpacing: '0.5px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="vi">{t('lang.vi')}</option>
              <option value="en">{t('lang.en')}</option>
            </select>
          </div>
        </header>

        <main style={{ padding: '24px 32px' }}>
          <ModelAssembler />
        </main>

        {toastMessage && ReactDOM.createPortal(
          <div className="toast-notification">
            <span>{toastMessage}</span>
          </div>,
          document.body
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
          <span className="retro-brand-title text-rainbow">{t('app.brand')}</span>
          <span className="logo-badge">{t('app.widescreenEdition')}</span>
        </div>
        
        {/* Dynamic Navigation to Standalone Custom Assembler Page */}
        <button className="btn-neon-action" onClick={() => handlePageChange('assembler')}>
          {t('app.goAssembler')}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="resolution-tag">{t('app.resolutionTag')}</div>
          <select
            aria-label={t('settings.language')}
            value={settings.language || 'vi'}
            onChange={(e) => updateSetting('language', e.target.value)}
            style={{
              height: 28,
              padding: '0 10px',
              borderRadius: 999,
              background: 'rgba(0,0,0,0.35)',
              border: '1px solid rgba(255,255,255,0.18)',
              color: '#fff',
              fontSize: 12,
              fontWeight: 'bold',
              letterSpacing: '0.5px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="vi">{t('lang.vi')}</option>
            <option value="en">{t('lang.en')}</option>
          </select>
        </div>
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
                {t('app.tabs.editor')}
              </button>
              <button
                className={`tab-nav-btn ${activeTab === 'export' ? 'active' : ''}`}
                onClick={() => setActiveTab('export')}
              >
                {t('app.tabs.export')}
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
      {toastMessage && ReactDOM.createPortal(
        <div className="toast-notification">
          <span>{toastMessage}</span>
        </div>,
        document.body
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
