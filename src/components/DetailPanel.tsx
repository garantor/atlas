import { useAtlas, useSelectedFarm, useLoadedSavedFarm } from '@/state/useAtlas';
import { getCropsByIds } from '@/data/cropsDatabase';
import { getLivestockByIds } from '@/data/livestockDatabase';
import type { FarmInfrastructure } from '@/data/types';
import { IntercroppingSandbox } from './IntercroppingSandbox';
import { SimulationPanel } from './SimulationPanel';
import { EducationalCards } from './EducationalCards';

export function DetailPanel() {
  const farm = useSelectedFarm();
  const savedFarm = useLoadedSavedFarm();
  const {
    timeOfDay, setTimeOfDay, rightPanelOpen, toggleRightPanel,
    farmAcreage, infrastructure, activeDisplayMode, sandboxCropIds,
    sandboxLivestockIds, simulationResult, setSaveModalOpen
  } = useAtlas();

  // If no farm, no saved farm, and not in sandbox: show empty state
  if (!farm && !savedFarm && activeDisplayMode !== 'sandbox') {
    return (
      <aside
        className={`detail-panel detail-empty ${!rightPanelOpen ? 'closed' : ''}`}
        aria-label="Farm detail"
        aria-hidden={!rightPanelOpen}
      >
        <div className="detail-panel-inner detail-empty-inner">
          <div className="detail-header-bar-empty">
            <button
              className="panel-close-btn detail-close-btn"
              onClick={toggleRightPanel}
              title="Close Details ( ] )"
              aria-label="Close Details"
            >
              ✕
            </button>
          </div>
          <div className="empty-state">
            <div className="empty-icon">🌱</div>
            <h3>Select a Farm</h3>
            <p>Choose a farm ecosystem or load a saved configuration from the library.</p>
          </div>
        </div>
      </aside>
    );
  }

  // Determine active display properties
  const isSaved = !!savedFarm;
  const displayName = savedFarm
    ? savedFarm.name
    : farm
      ? farm.name
      : 'Custom Poly-culture Sandbox';

  const displaySubtitle = savedFarm
    ? (savedFarm.description || `Custom Saved Farm · ${(savedFarm.farmAcreage / 2.471).toFixed(1)} ha`)
    : farm
      ? farm.subtitle
      : `${sandboxCropIds.length} Crops · ${sandboxLivestockIds.length} Fauna Species`;

  const displayIcon = savedFarm ? '⭐' : (farm?.icon || '🧪');
  const accentColor = savedFarm ? '#10b981' : (farm?.accentColor || '#10b981');
  const accentColor2 = savedFarm ? '#059669' : (farm?.accentColor2 || '#047857');
  const regionLabel = savedFarm
    ? (savedFarm.biome ? biomeLabel(savedFarm.biome) : 'Custom Landscape')
    : (farm?.region || 'Sandbox Environment');

  const activeAcreage = savedFarm ? savedFarm.farmAcreage : farmAcreage;
  const activeInfra = savedFarm ? savedFarm.infrastructure : infrastructure;

  const activeCropIds = savedFarm
    ? savedFarm.cropIds
    : activeDisplayMode === 'sandbox'
      ? sandboxCropIds
      : (farm?.cropIds || []);

  const activeLivestockIds = savedFarm
    ? savedFarm.livestockIds
    : activeDisplayMode === 'sandbox'
      ? sandboxLivestockIds
      : (farm?.livestockIds || []);

  const crops = getCropsByIds(activeCropIds);
  const livestock = getLivestockByIds(activeLivestockIds);

  const infraList = [
    { key: 'roads', label: 'Laterite Roads', icon: '🛣️' },
    { key: 'farmhouse', label: 'Operations Hub', icon: '🏡' },
    { key: 'cctv', label: 'CCTV Towers', icon: '📡' },
    { key: 'waterTower', label: 'Water & Irrigation', icon: '💧' },
    { key: 'solarArray', label: 'Solar PV Array', icon: '☀️' },
    { key: 'dryingPatio', label: 'Drying Patio', icon: '🧺' },
    { key: 'perimeterFence', label: 'Security Fence', icon: '🛡️' },
  ] as const;

  const activeInfraCount = Object.values(activeInfra).filter(Boolean).length;
  const currentLER = simulationResult.ler || (farm?.lerBaseline ?? 1.0);

  return (
    <aside
      className={`detail-panel ${!rightPanelOpen ? 'closed' : ''}`}
      aria-label="Farm detail"
      aria-hidden={!rightPanelOpen}
    >
      <div className="detail-panel-inner">
        {/* Farm header */}
        <div className="detail-header">
          <div
            className="detail-hero"
            style={{
              background: `linear-gradient(135deg, ${accentColor}25, ${accentColor2}20)`,
              borderBottom: `3px solid ${accentColor}`,
            }}
          >
            <div className="detail-farm-icon">{displayIcon}</div>
            <div className="detail-farm-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h2 className="detail-farm-name">{displayName}</h2>
                {isSaved && (
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      background: 'var(--green-wash)',
                      color: 'var(--green-light)',
                      border: '1px solid var(--green-glow)',
                      padding: '1px 6px',
                      borderRadius: 'var(--r-full)',
                    }}
                  >
                    Saved
                  </span>
                )}
              </div>
              <p className="detail-farm-sub">{displaySubtitle}</p>
              <div className="detail-farm-meta">
                <span className="tag tag-green">{regionLabel}</span>
                <span className="tag tag-blue" style={{ background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                  {activeAcreage >= 1000 ? `${(activeAcreage / 1000).toLocaleString()}k ac` : `${activeAcreage} ac`}
                </span>
                <span className="tag tag-amber">LER {currentLER.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
              <button
                className="panel-close-btn detail-close-btn"
                onClick={toggleRightPanel}
                title="Close Details ( ] )"
                aria-label="Close Details"
              >
                ✕
              </button>
              <button
                onClick={() => setSaveModalOpen(true)}
                style={{
                  background: 'var(--surface-raised)',
                  border: '1px solid var(--border)',
                  color: 'var(--ink-strong)',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '10px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                title="Save current layout as custom farm"
              >
                <span>💾</span>
                <span>Save</span>
              </button>
            </div>
          </div>

          {/* Time of day slider */}
          <div className="time-slider-row">
            <span className="time-icon" aria-hidden>
              {timeOfDay < 7 || timeOfDay > 18 ? '🌙' : timeOfDay < 10 || timeOfDay > 16 ? '🌅' : '☀️'}
            </span>
            <input
              id="time-of-day-slider"
              type="range"
              min="0"
              max="24"
              step="0.5"
              value={timeOfDay}
              onChange={e => setTimeOfDay(Number(e.target.value))}
              className="time-slider"
              aria-label="Time of day"
            />
            <span className="time-label">{formatHour(timeOfDay)}</span>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="detail-scroll">
          {/* Description */}
          <section className="detail-section">
            <p className="detail-description">
              {savedFarm?.description || farm?.description || 'Custom poly-culture agroforestry ecosystem configured in the interactive sandbox.'}
            </p>
          </section>

          {/* Active Infrastructure Section */}
          <section className="detail-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 className="section-title" style={{ margin: 0 }}>
                🏗️ Infrastructure ({activeInfraCount}/7)
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                {activeInfraCount === 7 ? 'Full Estate Grid' : `${activeInfraCount} Active`}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
              {infraList.map(item => {
                const active = activeInfra[item.key as keyof FarmInfrastructure];
                return (
                  <div
                    key={item.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 8px',
                      borderRadius: '8px',
                      background: active ? 'var(--surface-raised)' : 'var(--surface-sunk)',
                      border: active ? '1px solid var(--border-strong)' : '1px solid var(--border)',
                      opacity: active ? 1 : 0.45,
                      fontSize: '11px',
                      color: active ? 'var(--ink-strong)' : 'var(--muted)',
                    }}
                  >
                    <span style={{ fontSize: '13px' }}>{item.icon}</span>
                    <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.label}
                    </span>
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: active ? '#10b981' : '#64748b',
                      boxShadow: active ? '0 0 6px rgba(16, 185, 129, 0.6)' : 'none',
                    }} />
                  </div>
                );
              })}
            </div>
          </section>

          {/* Scene Highlights */}
          <section className="detail-section">
            <h3 className="section-title">🎯 Scene Highlights</h3>
            <ul className="highlight-list">
              {isSaved ? (
                <>
                  <li className="highlight-item">
                    <span className="highlight-dot" />
                    Custom {activeAcreage >= 1000 ? `${(activeAcreage / 1000).toLocaleString()}k` : activeAcreage}-acre concession with multi-tier agro-ecological master plan
                  </li>
                  <li className="highlight-item">
                    <span className="highlight-dot" />
                    {activeInfraCount} active infrastructure facilities operational
                  </li>
                  <li className="highlight-item">
                    <span className="highlight-dot" />
                    {crops.length} botanical species & {livestock.length} fauna varieties integrated
                  </li>
                  <li className="highlight-item">
                    <span className="highlight-dot" />
                    Saved on {new Date(savedFarm!.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </li>
                </>
              ) : farm ? (
                farm.highlights.map((h, i) => (
                  <li key={i} className="highlight-item">
                    <span className="highlight-dot" />
                    {h}
                  </li>
                ))
              ) : (
                <li className="highlight-item">
                  <span className="highlight-dot" />
                  Custom interactive poly-culture simulation
                </li>
              )}
            </ul>
          </section>

          {/* Crops */}
          <section className="detail-section">
            <h3 className="section-title">🌱 Crops ({crops.length})</h3>
            <div className="species-grid">
              {crops.map(crop => (
                <div key={crop.id} className="species-chip" title={crop.scientificName}>
                  <span className="species-icon">{crop.icon}</span>
                  <div className="species-info">
                    <span className="species-name">{crop.name}</span>
                    <span className="species-sci">{crop.localName}</span>
                  </div>
                  {crop.nitrogenFixation > 0 && (
                    <span className="n2-badge" title={`Fixes ${crop.nitrogenFixation} kg N/ha`}>
                      N₂
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Livestock */}
          {livestock.length > 0 && (
            <section className="detail-section">
              <h3 className="section-title">🐐 Fauna ({livestock.length})</h3>
              <div className="species-grid">
                {livestock.map(animal => (
                  <div key={animal.id} className="species-chip" title={animal.scientificName}>
                    <span className="species-icon">{animal.icon}</span>
                    <div className="species-info">
                      <span className="species-name">{animal.name}</span>
                      <span className="species-sci">{animal.localName}</span>
                    </div>
                    {animal.pollinationScore > 0.8 && (
                      <span className="pollinator-badge" title="Key pollinator">🐝</span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Simulation panel (LER gauges, metrics) */}
          <SimulationPanel />

          {/* Intercropping Sandbox */}
          <section className="detail-section">
            <IntercroppingSandbox />
          </section>

          {/* Educational cards */}
          {farm?.educationalCards && farm.educationalCards.length > 0 && (
            <section className="detail-section">
              <EducationalCards />
            </section>
          )}
        </div>
      </div>
    </aside>
  );
}

function biomeLabel(biome: string): string {
  const map: Record<string, string> = {
    'rainforest': 'Rainforest Zone',
    'derived-savanna': 'Savanna Mosaic',
    'swamp-forest': 'Swamp Forest Belt',
    'guinea-savanna': 'Guinea Savanna',
    'aquatic': 'Wetland & Riparian',
  };
  return map[biome] || biome;
}

function formatHour(h: number): string {
  const hour = Math.floor(h);
  const min = Math.round((h - hour) * 60);
  const period = hour < 12 ? 'AM' : 'PM';
  const displayH = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayH}:${min.toString().padStart(2, '0')} ${period}`;
}
