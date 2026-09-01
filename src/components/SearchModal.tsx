import { useState, useEffect, useRef } from 'react';
import { useAtlas } from '@/state/useAtlas';
import { CROPS } from '@/data/cropsDatabase';
import { LIVESTOCK } from '@/data/livestockDatabase';
import { FARMS } from '@/data/farms/index';
import '@/styles/cards.css';

interface SearchResult {
  id: string;
  name: string;
  icon: string;
  type: 'crop' | 'livestock' | 'farm';
  sub: string;
}

function buildResults(q: string): SearchResult[] {
  if (!q.trim()) return [];
  const lower = q.toLowerCase();

  const crops: SearchResult[] = CROPS
    .filter(c => c.name.toLowerCase().includes(lower) || c.localName.toLowerCase().includes(lower) || c.scientificName.toLowerCase().includes(lower))
    .slice(0, 5)
    .map(c => ({ id: c.id, name: c.name, icon: c.icon, type: 'crop', sub: c.scientificName }));

  const livestock: SearchResult[] = LIVESTOCK
    .filter(l => l.name.toLowerCase().includes(lower) || l.localName.toLowerCase().includes(lower))
    .slice(0, 3)
    .map(l => ({ id: l.id, name: l.name, icon: l.icon, type: 'livestock', sub: l.scientificName }));

  const farms: SearchResult[] = FARMS
    .filter(f => f.name.toLowerCase().includes(lower) || f.region.toLowerCase().includes(lower))
    .slice(0, 3)
    .map(f => ({ id: f.id, name: f.name, icon: f.icon, type: 'farm', sub: f.region }));

  return [...farms, ...crops, ...livestock];
}

export function SearchModal() {
  const { searchOpen, setSearchOpen, selectFarm } = useAtlas();
  const [query, setQuery] = useState('');
  const [focusIdx, setFocusIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = buildResults(query);

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
    setQuery('');
    setFocusIdx(0);
  }, [searchOpen]);

  // ⌘K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [searchOpen]);

  // Arrow key navigation
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setFocusIdx(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      setFocusIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[focusIdx]) {
      handleSelect(results[focusIdx]);
    }
  };

  const handleSelect = (r: SearchResult) => {
    if (r.type === 'farm') {
      selectFarm(r.id);
    }
    setSearchOpen(false);
  };

  if (!searchOpen) return null;

  return (
    <div className="search-modal" role="dialog" aria-label="Search" aria-modal>
      <div
        className="modal-backdrop"
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
        onClick={() => setSearchOpen(false)}
      />
      <div className="search-box" role="search">
        <div className="search-input-row">
          <span className="search-icon">🔍</span>
          <input
            ref={inputRef}
            id="search-input"
            className="search-input"
            placeholder="Search crops, farms, species…"
            value={query}
            onChange={e => { setQuery(e.target.value); setFocusIdx(0); }}
            onKeyDown={handleKey}
            autoComplete="off"
            aria-autocomplete="list"
            aria-controls="search-results"
          />
          <kbd className="search-kbd">Esc</kbd>
        </div>

        <div id="search-results" className="search-results" role="listbox">
          {results.length === 0 && query.trim() && (
            <div className="search-empty">
              No results for "<strong>{query}</strong>"
            </div>
          )}
          {results.length === 0 && !query.trim() && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '12px 0' }}>
              <div className="search-group-label">Quick access</div>
              {FARMS.slice(0, 4).map(f => (
                <button
                  key={f.id}
                  className="search-result-item"
                  onClick={() => { selectFarm(f.id); setSearchOpen(false); }}
                >
                  <span className="search-result-icon">{f.icon}</span>
                  <div className="search-result-info">
                    <div className="search-result-name">{f.name}</div>
                    <div className="search-result-type">{f.region}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {results.length > 0 && (
            <>
              {/* Group by type */}
              {['farm', 'crop', 'livestock'].map(type => {
                const group = results.filter(r => r.type === type);
                if (group.length === 0) return null;
                const labels: Record<string, string> = { farm: 'Farms', crop: 'Crops', livestock: 'Fauna' };
                return (
                  <div key={type}>
                    <div className="search-group-label">{labels[type]}</div>
                    {group.map((r, i) => {
                      const isFocused = results.indexOf(r) === focusIdx;
                      return (
                        <button
                          key={r.id}
                          className={`search-result-item ${isFocused ? 'focused' : ''}`}
                          onClick={() => handleSelect(r)}
                          role="option"
                          aria-selected={isFocused}
                        >
                          <span className="search-result-icon">{r.icon}</span>
                          <div className="search-result-info">
                            <div className="search-result-name">{r.name}</div>
                            <div className="search-result-type">{r.sub}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
