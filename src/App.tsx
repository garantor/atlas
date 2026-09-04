import { useEffect } from 'react';
import { useAtlas } from './state/useAtlas';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { FarmLibrary } from './components/FarmLibrary';
import { FarmViewer } from './components/FarmViewer';
import { DetailPanel } from './components/DetailPanel';
import { SearchModal } from './components/SearchModal';
import { CardDetailModal, LessonModal, QuizModal } from './components/Modals';
import './styles/global.css';
import './styles/viewer.css';
import './styles/simulation.css';
import './styles/cards.css';
import './styles/library.css';

function App() {
  const { leftPanelOpen, rightPanelOpen, toggleLeftPanel, toggleRightPanel } = useAtlas();

  // Keyboard shortcuts: '[' to toggle Left Library, ']' to toggle Right Details
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === '[') {
        e.preventDefault();
        toggleLeftPanel();
      } else if (e.key === ']') {
        e.preventDefault();
        toggleRightPanel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleLeftPanel, toggleRightPanel]);

  return (
    <ErrorBoundary>
      <div className="atlas-root">
        {/* Top navigation */}
        <Header />

        {/* Three-column layout */}
        <main className="atlas-main">
          {/* Left: Farm library */}
          <FarmLibrary />

          {/* Floating reopen button for left sidebar */}
          {!leftPanelOpen && (
            <button
              id="reopen-left-tab"
              className="panel-reopen-tab reopen-left"
              onClick={toggleLeftPanel}
              title="Open Farm Library ( [ )"
              aria-label="Open Farm Library"
            >
              <span className="reopen-icon">🌾</span>
              <span className="reopen-label">Farms</span>
              <span className="reopen-arrow">›</span>
            </button>
          )}

          {/* Centre: 3D viewer */}
          <div className="viewer-column">
            <FarmViewer />
          </div>

          {/* Floating reopen button for right sidebar */}
          {!rightPanelOpen && (
            <button
              id="reopen-right-tab"
              className="panel-reopen-tab reopen-right"
              onClick={toggleRightPanel}
              title="Open Details & Simulation ( ] )"
              aria-label="Open Details & Simulation"
            >
              <span className="reopen-arrow">‹</span>
              <span className="reopen-icon">📊</span>
              <span className="reopen-label">Details</span>
            </button>
          )}

          {/* Right: Detail + simulation */}
          <DetailPanel />
        </main>

        {/* Global modals */}
        <SearchModal />
        <CardDetailModal />
        <LessonModal />
        <QuizModal />
      </div>
    </ErrorBoundary>
  );
}

export default App;
