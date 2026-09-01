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
  const { theme, toggleTheme, setSearchOpen, season, setSeason, biomeFilter, setBiomeFilter } = useAtlas();

  return (
    <header className="atlas-header">
      {/* Brand */}
      <div className="header-brand">
        <span className="header-brand-icon">🌿</span>
        <div className="header-brand-text">
          <span className="header-brand-title">Farm Atlas</span>
          <span className="header-brand-sub">Tropical Agro-Ecosystems</span>
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
      </div>
    </header>
  );
}
