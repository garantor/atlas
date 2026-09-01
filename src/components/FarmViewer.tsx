import { useEffect, useRef, useState } from 'react';
import { useAtlas, useSelectedFarm } from '@/state/useAtlas';
import { FarmScene } from '@/three/FarmScene';
import { HotspotCallouts } from './HotspotCallouts';
import { ViewStateSelector } from './ViewStateSelector';
import '@/styles/viewer.css';

const LAYERS = [
  { id: 'canopy',     label: 'Canopy',     color: '#22c55e' },
  { id: 'shrub',      label: 'Shrub',      color: '#16a34a' },
  { id: 'herbaceous', label: 'Crops',      color: '#84cc16' },
  { id: 'roots',      label: 'Roots',      color: '#d97706' },
  { id: 'fauna',      label: 'Fauna',      color: '#f59e0b' },
  { id: 'particles',  label: 'Cycles',     color: '#a855f7' },
] as const;

const CAMERA_PRESETS = [
  { id: 'overview',     label: 'Overview',   icon: '🎯' },
  { id: 'ground-layer', label: 'Ground',     icon: '🌿' },
  { id: 'top-down',     label: 'Top-Down',   icon: '📐' },
  { id: 'cocoa-closeup',label: 'Close-Up',   icon: '🔍' },
] as const;

export function FarmViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<FarmScene | null>(null);
  const farm = useSelectedFarm();
  const { viewState, season, timeOfDay, theme, layerFilters, setActiveHotspot, toggleLayer } = useAtlas();

  const [loading, setLoading] = useState(true);
  const [hotspotPositions, setHotspotPositions] = useState<Map<string, { x: number; y: number; visible: boolean }>>(new Map());

  // Initialise Three.js scene once
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new FarmScene(canvasRef.current, {
      onHotspotClick: (id) => setActiveHotspot(id),
      onHotspotPositions: (positions) => setHotspotPositions(new Map(positions)),
    });
    sceneRef.current = scene;
    setLoading(false);

    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  // Load farm when selection changes
  useEffect(() => {
    if (!sceneRef.current || !farm) return;
    setLoading(true);
    sceneRef.current.loadFarm(farm, theme);
    setTimeout(() => setLoading(false), 250);
  }, [farm?.id]);

  // Sync view state
  useEffect(() => {
    sceneRef.current?.setViewState(viewState, theme);
  }, [viewState]);

  // Sync season
  useEffect(() => {
    sceneRef.current?.setSeason(season);
  }, [season]);

  // Sync time of day
  useEffect(() => {
    sceneRef.current?.setTimeOfDay(timeOfDay);
  }, [timeOfDay]);

  // Sync theme
  useEffect(() => {
    sceneRef.current?.setTheme(theme);
  }, [theme]);

  // Sync layer visibility
  useEffect(() => {
    if (!sceneRef.current) return;
    Object.entries(layerFilters).forEach(([layer, visible]) => {
      sceneRef.current!.setLayerVisible(layer, visible);
    });
  }, [layerFilters]);

  return (
    <div className="farm-viewer-wrap">
      {/* Three.js Canvas */}
      <canvas
        ref={canvasRef}
        className="farm-viewer-canvas"
        id="farm-viewer-canvas"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Loading overlay */}
      {loading && (
        <div className="viewer-loading" role="status" aria-label="Loading farm">
          <span className="viewer-loading-icon">🌿</span>
          <p>Generating 3D agro-ecosystem…</p>
        </div>
      )}

      {/* View state selector (top center) */}
      <ViewStateSelector />

      {/* Layer filter chips (top right) */}
      <div className="layer-filters" aria-label="Scene layer filters">
        {LAYERS.map(layer => (
          <button
            key={layer.id}
            id={`layer-${layer.id}`}
            className={`layer-chip ${layerFilters[layer.id] ? 'on' : ''}`}
            onClick={() => toggleLayer(layer.id)}
            aria-pressed={layerFilters[layer.id]}
          >
            <span
              className="layer-chip-dot"
              style={{ background: layer.color, color: layer.color }}
            />
            {layer.label}
          </button>
        ))}
      </div>

      {/* Camera angle presets (bottom right) */}
      <div className="viewer-controls" aria-label="Camera presets">
        <div className="viewer-controls-row">
          {CAMERA_PRESETS.map(preset => (
            <button
              key={preset.id}
              id={`camera-${preset.id}`}
              className="btn-icon"
              title={`${preset.label} view`}
              onClick={() => sceneRef.current?.flyToPreset(preset.id)}
            >
              {preset.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Hotspot overlay */}
      {farm && (
        <HotspotCallouts
          hotspots={farm.hotspots}
          positions={hotspotPositions}
        />
      )}
    </div>
  );
}
