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
  return (
    <ErrorBoundary>
      <div className="atlas-root">
        {/* Top navigation */}
        <Header />

        {/* Three-column layout */}
        <main className="atlas-main">
          {/* Left: Farm library */}
          <FarmLibrary />

          {/* Centre: 3D viewer */}
          <div className="viewer-column">
            <FarmViewer />
          </div>

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
