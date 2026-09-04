import { useAtlas, useSelectedFarm } from '@/state/useAtlas';
import { getCropsByIds } from '@/data/cropsDatabase';
import { getLivestockByIds } from '@/data/livestockDatabase';
import { IntercroppingSandbox } from './IntercroppingSandbox';
import { SimulationPanel } from './SimulationPanel';
import { EducationalCards } from './EducationalCards';

export function DetailPanel() {
  const farm = useSelectedFarm();
  const { timeOfDay, setTimeOfDay, rightPanelOpen, toggleRightPanel } = useAtlas();

  if (!farm) {
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
            <p>Choose a farm ecosystem from the library to explore it in 3D.</p>
          </div>
        </div>
      </aside>
    );
  }

  const crops = getCropsByIds(farm.cropIds);
  const livestock = getLivestockByIds(farm.livestockIds);

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
              background: `linear-gradient(135deg, ${farm.accentColor}22, ${farm.accentColor2}22)`,
              borderBottom: `3px solid ${farm.accentColor}`,
            }}
          >
            <div className="detail-farm-icon">{farm.icon}</div>
            <div className="detail-farm-info">
              <h2 className="detail-farm-name">{farm.name}</h2>
              <p className="detail-farm-sub">{farm.subtitle}</p>
              <div className="detail-farm-meta">
                <span className="tag tag-green">{farm.region}</span>
                <span className="tag tag-amber">LER {farm.lerBaseline.toFixed(2)}</span>
              </div>
            </div>
            <button
              className="panel-close-btn detail-close-btn"
              onClick={toggleRightPanel}
              title="Close Details ( ] )"
              aria-label="Close Details"
            >
              ✕
            </button>
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
          <p className="detail-description">{farm.description}</p>
        </section>

        {/* Highlights */}
        <section className="detail-section">
          <h3 className="section-title">🎯 Scene Highlights</h3>
          <ul className="highlight-list">
            {farm.highlights.map((h, i) => (
              <li key={i} className="highlight-item">
                <span className="highlight-dot" />
                {h}
              </li>
            ))}
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
        <section className="detail-section">
          <EducationalCards />
        </section>
      </div>
      </div>
    </aside>
  );
}

function formatHour(h: number): string {
  const hour = Math.floor(h);
  const min = Math.round((h - hour) * 60);
  const period = hour < 12 ? 'AM' : 'PM';
  const displayH = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayH}:${min.toString().padStart(2, '0')} ${period}`;
}
