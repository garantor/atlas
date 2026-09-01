import { useAtlas } from '@/state/useAtlas';

const STATES = [
  { id: 'macro' as const,        icon: '🗺',  label: 'Macro View' },
  { id: 'subterranean' as const, icon: '🔬',  label: 'Subterranean' },
  { id: 'cycles' as const,       icon: '⚡',  label: 'Flow Cycles' },
] as const;

export function ViewStateSelector() {
  const { viewState, setViewState } = useAtlas();

  return (
    <div className="view-state-selector" role="tablist" aria-label="View mode">
      {STATES.map(s => (
        <button
          key={s.id}
          id={`view-state-${s.id}`}
          role="tab"
          aria-selected={viewState === s.id}
          className={`view-state-btn ${viewState === s.id ? 'active' : ''}`}
          onClick={() => setViewState(s.id)}
        >
          <span className="view-state-icon">{s.icon}</span>
          <span>{s.label}</span>
        </button>
      ))}
    </div>
  );
}
