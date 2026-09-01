import { useState } from 'react';
import { useAtlas } from '@/state/useAtlas';
import { CROPS } from '@/data/cropsDatabase';
import { LIVESTOCK } from '@/data/livestockDatabase';
import '@/styles/simulation.css';

const CROP_CATEGORIES = [
  { id: 'tuber', label: 'Tubers' },
  { id: 'cereal', label: 'Cereals' },
  { id: 'legume', label: 'Legumes' },
  { id: 'tree-cash', label: 'Trees' },
  { id: 'fruit', label: 'Fruits' },
  { id: 'vegetable', label: 'Vegetables' },
  { id: 'spice', label: 'Spices' },
] as const;

const MAX_PLOT_CELLS = 16;

export function IntercroppingSandbox() {
  const {
    sandboxCropIds, sandboxLivestockIds,
    addSandboxCrop, removeSandboxCrop,
    addSandboxLivestock, removeSandboxLivestock,
    clearSandbox, loadFarmIntoSandbox,
    simulationResult,
  } = useAtlas();

  const [activeCat, setActiveCat] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'crops' | 'livestock'>('crops');

  const filteredCrops = activeCat === 'all'
    ? CROPS
    : CROPS.filter(c => c.category === activeCat);

  const plotItems = [
    ...sandboxCropIds.map(id => {
      const c = CROPS.find(x => x.id === id);
      return c ? { id: c.id, icon: c.icon, name: c.name, type: 'crop' as const } : null;
    }).filter(Boolean),
    ...sandboxLivestockIds.map(id => {
      const l = LIVESTOCK.find(x => x.id === id);
      return l ? { id: l.id, icon: l.icon, name: l.name, type: 'livestock' as const } : null;
    }).filter(Boolean),
  ].filter(Boolean);

  return (
    <div className="sandbox-wrap">
      <div className="sandbox-header">
        <h3>🧪 Intercropping Sandbox</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-ghost btn-sm" onClick={loadFarmIntoSandbox} id="load-farm-btn">
            Load Farm
          </button>
          <button className="btn btn-ghost btn-sm" onClick={clearSandbox} id="clear-sandbox-btn">
            Clear
          </button>
        </div>
      </div>

      {/* Field visualisation */}
      <div className="sandbox-field" aria-label="Farm plot grid">
        {Array.from({ length: MAX_PLOT_CELLS }).map((_, idx) => {
          const item = plotItems[idx];
          if (item) {
            return (
              <div key={idx} className="sandbox-plot occupied" title={item.name}>
                <span className="sandbox-plot-icon">{item.icon}</span>
                <span className="sandbox-plot-name">{item.name.split(' ')[0]}</span>
                <button
                  className="sandbox-plot-remove"
                  onClick={() => item.type === 'crop' ? removeSandboxCrop(item.id) : removeSandboxLivestock(item.id)}
                  aria-label={`Remove ${item.name}`}
                >
                  ×
                </button>
              </div>
            );
          }
          return (
            <div key={idx} className="sandbox-plot" aria-label="Empty plot cell">
              <span style={{ fontSize: '18px', opacity: 0.3 }}>+</span>
              <span style={{ fontSize: '9px', opacity: 0.3 }}>Add crop</span>
            </div>
          );
        })}
      </div>

      {/* Compatibility feedback */}
      {simulationResult.compatibilityWarnings.length > 0 && (
        <div className="compat-warning">
          <span>⚠</span>
          <span style={{ fontSize: '11px' }}>
            {simulationResult.compatibilityWarnings[0].replace('⚠ ', '')}
          </span>
        </div>
      )}
      {simulationResult.synergies.length > 0 && simulationResult.compatibilityWarnings.length === 0 && (
        <div className="compat-success">
          <span>✓</span>
          <span style={{ fontSize: '11px' }}>
            {simulationResult.synergies[0].replace('✓ ', '')}
          </span>
        </div>
      )}

      {/* Tabs: Crops / Livestock */}
      <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
        <button
          id="tab-crops"
          className={`biome-tab ${activeTab === 'crops' ? 'active' : ''}`}
          style={{ flex: 1 }}
          onClick={() => setActiveTab('crops')}
        >
          🌱 Crops
        </button>
        <button
          id="tab-livestock"
          className={`biome-tab ${activeTab === 'livestock' ? 'active' : ''}`}
          style={{ flex: 1 }}
          onClick={() => setActiveTab('livestock')}
        >
          🐐 Fauna
        </button>
      </div>

      {/* Crop palette */}
      {activeTab === 'crops' && (
        <div className="crop-palette">
          {/* Category filter */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '4px' }}>
            <button
              className={`biome-tab ${activeCat === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCat('all')}
            >
              All
            </button>
            {CROP_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                className={`biome-tab ${activeCat === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCat(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="crop-chips">
            {filteredCrops.map(crop => {
              const isSelected = sandboxCropIds.includes(crop.id);
              return (
                <button
                  key={crop.id}
                  id={`crop-chip-${crop.id}`}
                  className={`crop-chip ${isSelected ? 'selected' : ''}`}
                  onClick={() => isSelected ? removeSandboxCrop(crop.id) : addSandboxCrop(crop.id)}
                  title={crop.scientificName}
                  aria-pressed={isSelected}
                >
                  <span className="crop-chip-icon">{crop.icon}</span>
                  <span>{crop.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Livestock palette */}
      {activeTab === 'livestock' && (
        <div className="crop-palette">
          <div className="crop-chips">
            {LIVESTOCK.map(animal => {
              const isSelected = sandboxLivestockIds.includes(animal.id);
              return (
                <button
                  key={animal.id}
                  id={`livestock-chip-${animal.id}`}
                  className={`crop-chip ${isSelected ? 'selected' : ''}`}
                  onClick={() => isSelected ? removeSandboxLivestock(animal.id) : addSandboxLivestock(animal.id)}
                  title={animal.scientificName}
                  aria-pressed={isSelected}
                >
                  <span className="crop-chip-icon">{animal.icon}</span>
                  <span>{animal.name.split(' ').slice(0, 2).join(' ')}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
