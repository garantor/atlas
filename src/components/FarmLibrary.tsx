import { useState } from 'react';
import { useAtlas } from '@/state/useAtlas';
import { FARMS } from '@/data/farms/index';
import type { BiomeZone } from '@/data/types';

export function FarmLibrary() {
  const {
    selectedFarmId, selectFarm, biomeFilter, leftPanelOpen, toggleLeftPanel,
    savedFarmConfigs, loadSavedFarmConfig, deleteSavedFarmConfig, setSaveModalOpen
  } = useAtlas();

  const [activeTab, setActiveTab] = useState<'presets' | 'saved'>('presets');

  const filtered = biomeFilter === 'all'
    ? FARMS
    : FARMS.filter(f => f.biome === biomeFilter);

  return (
    <aside
      className={`farm-library ${!leftPanelOpen ? 'closed' : ''}`}
      aria-label="Farm library"
      aria-hidden={!leftPanelOpen}
    >
      <div className="farm-library-inner">
        {/* Header */}
        <div className="library-header">
          <div className="library-header-title">
            <h3>{activeTab === 'presets' ? 'Farm Ecosystems' : 'Saved Estates'}</h3>
            <span className="library-count">
              {activeTab === 'presets' ? `${filtered.length} of ${FARMS.length}` : `${savedFarmConfigs.length} saved`}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => setSaveModalOpen(true)}
              className="library-save-btn"
              title="Save current farm configuration"
            >
              <span>💾</span>
              <span>Save</span>
            </button>
            <button
              className="panel-close-btn"
              onClick={toggleLeftPanel}
              title="Close Farm Library ( [ )"
              aria-label="Close Farm Library"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Switcher: Presets vs Saved */}
        <div className="library-nav-tabs">
          <button
            className={`library-nav-tab ${activeTab === 'presets' ? 'active' : ''}`}
            onClick={() => setActiveTab('presets')}
          >
            🏛️ Presets ({FARMS.length})
          </button>
          <button
            className={`library-nav-tab ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            ⭐ My Saved ({savedFarmConfigs.length})
          </button>
        </div>

        {/* Tab 1: Standard Preset Farms */}
        {activeTab === 'presets' && (
          <div className="library-list" role="listbox" aria-label="Farm selection">
            {filtered.map(farm => (
              <button
                key={farm.id}
                id={`farm-card-${farm.id}`}
                className={`farm-card ${selectedFarmId === farm.id ? 'active' : ''}`}
                onClick={() => selectFarm(farm.id)}
                role="option"
                aria-selected={selectedFarmId === farm.id}
              >
                {/* Accent bar */}
                <div
                  className="farm-card-accent"
                  style={{
                    background: `linear-gradient(90deg, ${farm.accentColor}, ${farm.accentColor2})`,
                  }}
                />

                <div className="farm-card-body">
                  <div className="farm-card-top">
                    <div>
                      <div className="farm-card-name">{farm.icon} {farm.name}</div>
                      <div className="farm-card-biome">{farm.region}</div>
                    </div>
                    <span className="ler-badge">LER {farm.lerBaseline.toFixed(2)}</span>
                  </div>

                  {/* Crop icon strip */}
                  <div className="farm-card-icons" aria-label="Crops in this farm">
                    {farm.cropIds.slice(0, 8).map(id => {
                      const crop = { id, icon: getCropIcon(id) };
                      return (
                        <span
                          key={id}
                          className="farm-card-crop-icon"
                          title={id.replace(/-/g, ' ')}
                          role="img"
                          aria-label={id.replace(/-/g, ' ')}
                        >
                          {crop.icon}
                        </span>
                      );
                    })}
                  </div>

                  <div className="farm-card-footer">
                    <span className="farm-card-crops-count">
                      {farm.cropIds.length} crops · {farm.livestockIds.length} fauna
                    </span>
                    <span className="tag tag-green">{biomeLabel(farm.biome)}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Tab 2: User Saved Farm Configurations */}
        {activeTab === 'saved' && (
          <div className="library-list" role="listbox" aria-label="Saved farm configurations">
            {savedFarmConfigs.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                background: 'var(--surface-raised)',
                borderRadius: '16px',
                border: '1px dashed var(--border)',
                margin: '12px 0',
              }}>
                <span style={{ fontSize: '38px', filter: 'drop-shadow(0 2px 8px var(--green-glow))' }}>🏡</span>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink-strong)' }}>
                  No Saved Farms Yet
                </div>
                <p style={{ fontSize: '11px', color: 'var(--muted)', maxWidth: '220px', lineHeight: 1.5, margin: 0 }}>
                  Customize your acreage, facilities, crops, and layout, then save your custom estate design here.
                </p>
                <button
                  onClick={() => setSaveModalOpen(true)}
                  className="library-save-btn"
                  style={{ padding: '8px 18px', fontSize: '12px', marginTop: '6px' }}
                >
                  + Save Current Farm
                </button>
              </div>
            ) : (
              savedFarmConfigs.map((config) => {
                const activeInfraCount = Object.values(config.infrastructure).filter(Boolean).length;
                const formattedDate = new Date(config.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <div
                    key={config.id}
                    className="farm-card"
                    style={{ position: 'relative' }}
                  >
                    {/* Accent bar */}
                    <div
                      className="farm-card-accent"
                      style={{
                        background: 'linear-gradient(90deg, #10b981, #059669)',
                      }}
                    />

                    <div className="farm-card-body">
                      <div className="farm-card-top">
                        <div style={{ flex: 1, paddingRight: '8px' }}>
                          <div className="farm-card-name" style={{ color: 'var(--green-light)' }}>
                            ⭐ {config.name}
                          </div>
                          <div className="farm-card-biome">
                            Saved {formattedDate} · {config.farmShape === 'circle' ? 'Circular' : 'Square'}
                          </div>
                        </div>
                        <span
                          className="ler-badge"
                          style={{
                            background: 'var(--green-wash)',
                            borderColor: 'var(--green-glow)',
                            color: 'var(--green-light)',
                          }}
                        >
                          {config.farmAcreage >= 1000
                            ? `${(config.farmAcreage / 1000).toLocaleString()}k ac`
                            : `${config.farmAcreage} ac`}
                        </span>
                      </div>

                      {config.description && (
                        <p style={{ fontSize: '11px', color: 'var(--ink-body)', margin: '2px 0 4px', lineHeight: 1.4 }}>
                          {config.description}
                        </p>
                      )}

                      {/* Crop icon preview */}
                      <div className="farm-card-icons">
                        {config.cropIds.slice(0, 8).map(id => (
                          <span key={id} className="farm-card-crop-icon" title={id.replace(/-/g, ' ')}>
                            {getCropIcon(id)}
                          </span>
                        ))}
                      </div>

                      {/* Footer & Actions */}
                      <div className="farm-card-footer" style={{ marginTop: '4px' }}>
                        <span className="farm-card-crops-count">
                          {config.cropIds.length} crops · {activeInfraCount} infra
                        </span>

                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Delete "${config.name}"?`)) {
                                deleteSavedFarmConfig(config.id);
                              }
                            }}
                            title="Delete saved configuration"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              fontSize: '12px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            🗑️
                          </button>
                          <button
                            onClick={() => loadSavedFarmConfig(config.id)}
                            style={{
                              background: 'var(--brand-primary)',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '4px 10px',
                              fontSize: '10px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              boxShadow: '0 2px 6px var(--green-glow)',
                            }}
                          >
                            Load 3D ↗
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

function biomeLabel(biome: BiomeZone): string {
  const map: Record<BiomeZone, string> = {
    'rainforest': 'Rainforest',
    'derived-savanna': 'Savanna',
    'swamp-forest': 'Swamp',
    'guinea-savanna': 'Guinea',
    'aquatic': 'Aquatic',
  };
  return map[biome] || biome;
}

// Quick icon lookup without importing whole DB
function getCropIcon(id: string): string {
  const icons: Record<string, string> = {
    cassava: '🌿', 'white-yam': '🥔', 'water-yam': '🥔', 'sweet-potato': '🍠',
    cocoyam: '🌱', maize: '🌽', 'ofada-rice': '🌾', sorghum: '🌾', 'pearl-millet': '🌾',
    cowpea: '🫘', 'pigeon-pea': '🫘', 'african-yam-bean': '🫘', soybean: '🌱',
    groundnut: '🥜', 'bambara-groundnut': '🥜', cocoa: '🍫', 'oil-palm': '🌴',
    'kola-nut': '🌰', cashew: '🥜', plantain: '🍌', pineapple: '🍍',
    pawpaw: '🍈', mango: '🥭', 'hot-pepper': '🌶️', tomato: '🍅',
    okra: '🫛', egusi: '🍈', pumpkin: '🎃', waterleaf: '🌿',
    'scent-leaf': '🌿', 'bitter-leaf': '🌿', ginger: '🫚',
    'wad-goats': '🐐', 'wad-sheep': '🐑', chickens: '🐔', 'guinea-fowl': '🐦',
    catfish: '🐟', tilapia: '🐠', 'land-snail': '🐌', honeybee: '🐝',
  };
  return icons[id] || '🌱';
}
