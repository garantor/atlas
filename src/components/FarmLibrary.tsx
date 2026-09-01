import { useAtlas } from '@/state/useAtlas';
import { FARMS } from '@/data/farms/index';
import type { BiomeZone } from '@/data/types';

export function FarmLibrary() {
  const { selectedFarmId, selectFarm, biomeFilter } = useAtlas();

  const filtered = biomeFilter === 'all'
    ? FARMS
    : FARMS.filter(f => f.biome === biomeFilter);

  return (
    <aside className="farm-library" aria-label="Farm library">
      <div className="library-header">
        <h3>Farm Ecosystems</h3>
        <span className="library-count">{filtered.length} of {FARMS.length}</span>
      </div>

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
