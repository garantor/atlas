import { useAtlas } from '@/state/useAtlas';
import { FARMS } from '@/data/farms/index';

const BIOMES = [
  { id: 'all' as const, label: 'All' },
  { id: 'rainforest' as const, label: 'Rainforest' },
  { id: 'derived-savanna' as const, label: 'Savanna' },
  { id: 'swamp-forest' as const, label: 'Swamp' },
  { id: 'guinea-savanna' as const, label: 'Guinea' },
  { id: 'aquatic' as const, label: 'Aquatic' },
];

export function Header() {
  const {
    theme, toggleTheme, setSearchOpen, season, setSeason,
    biomeFilter, setBiomeFilter,
    leftPanelOpen, toggleLeftPanel,
    rightPanelOpen, toggleRightPanel,
  } = useAtlas();

  return (
    <header className="atlas-header">
      {/* Brand & Left Sidebar Toggle */}
      <div className="header-brand-group">
        <button
          id="toggle-left-panel"
          className={`btn-icon panel-toggle-btn ${leftPanelOpen ? 'active' : ''}`}
          onClick={toggleLeftPanel}
          title={leftPanelOpen ? 'Close Farm Library ( [ )' : 'Open Farm Library ( [ )'}
          aria-label={leftPanelOpen ? 'Close Farm Library' : 'Open Farm Library'}
          aria-pressed={leftPanelOpen}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="3" />
            <path d="M9 3v18" />
            {leftPanelOpen ? (
              <path d="m14 9-3 3 3 3" />
            ) : (
              <path d="m11 9 3 3-3 3" />
            )}
          </svg>
        </button>

        <div className="header-brand">
          <span className="header-brand-icon">🌿</span>
          <div className="header-brand-text">
            <span className="header-brand-title">Farm Atlas</span>
            <span className="header-brand-sub">Tropical Agro-Ecosystems</span>
          </div>
        </div>
      </div>

      {/* Biome tabs */}
      <nav className="header-biome-tabs" aria-label="Biome filter">
        {BIOMES.map(b => (
          <button
            key={b.id}
            id={`biome-tab-${b.id}`}
            className={`biome-tab ${biomeFilter === b.id ? 'active' : ''}`}
            onClick={() => setBiomeFilter(b.id)}
          >
            {b.label}
          </button>
        ))}
      </nav>

      {/* Right controls */}
      <div className="header-controls">
        {/* Season toggle */}
        <button
          id="season-toggle"
          className={`btn btn-ghost season-btn ${season === 'wet' ? 'season-wet' : 'season-dry'}`}
          onClick={() => setSeason(season === 'wet' ? 'dry' : 'wet')}
          title="Toggle season"
        >
          <span>{season === 'wet' ? '🌧' : '☀️'}</span>
          <span>{season === 'wet' ? 'Wet' : 'Harmattan'}</span>
        </button>

        {/* Search */}
        <button
          id="search-trigger"
          className="btn btn-ghost search-trigger"
          onClick={() => setSearchOpen(true)}
          title="Search (⌘K)"
        >
          <span>🔍</span>
          <span className="search-hint">Search</span>
          <kbd className="search-kbd">⌘K</kbd>
        </button>

        {/* Theme toggle */}
        <button
          id="theme-toggle"
          className="btn-icon"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* Right Panel Toggle */}
        <button
          id="toggle-right-panel"
          className={`btn-icon panel-toggle-btn ${rightPanelOpen ? 'active' : ''}`}
          onClick={toggleRightPanel}
          title={rightPanelOpen ? 'Close Details & Simulation ( ] )' : 'Open Details & Simulation ( ] )'}
          aria-label={rightPanelOpen ? 'Close Details Panel' : 'Open Details Panel'}
          aria-pressed={rightPanelOpen}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="3" />
            <path d="M15 3v18" />
            {rightPanelOpen ? (
              <path d="m10 9 3 3-3 3" />
            ) : (
              <path d="m13 9-3 3 3 3" />
            )}
          </svg>
        </button>
      </div>
    </header>
  );
}
