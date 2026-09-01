import { useAtlas } from '@/state/useAtlas';
import type { Hotspot } from '@/data/types';

interface Props {
  hotspots: Hotspot[];
  positions: Map<string, { x: number; y: number; visible: boolean }>;
}

export function HotspotCallouts({ hotspots, positions }: Props) {
  const { activeHotspotId, setActiveHotspot } = useAtlas();

  return (
    <div className="hotspot-overlay" aria-label="Farm hotspots">
      {hotspots.map(hs => {
        const pos = positions.get(hs.id);
        if (!pos || !pos.visible) return null;

        const isActive = activeHotspotId === hs.id;

        return (
          <div
            key={hs.id}
            id={`hotspot-${hs.id}`}
            className="hotspot-marker"
            style={{ left: pos.x, top: pos.y }}
            onClick={() => setActiveHotspot(isActive ? null : hs.id)}
            role="button"
            aria-label={hs.label}
            aria-expanded={isActive}
          >
            <div
              className="hotspot-dot"
              style={hs.color ? { background: hs.color } : {}}
            />

            {isActive && (
              <div className="hotspot-callout" role="tooltip">
                <h4>{hs.label}</h4>
                {hs.scientificName && (
                  <p className="sci-name">{hs.scientificName}</p>
                )}
                <p>{hs.description}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
