import { useEffect, useRef, useState } from 'react';
import { useAtlas, useSelectedFarm } from '@/state/useAtlas';
import { FarmScene } from '@/three/FarmScene';
import type { WalkState } from '@/three/FirstPersonController';
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
  const {
    viewState, season, timeOfDay, theme, layerFilters,
    activeDisplayMode, sandboxCropIds, sandboxLivestockIds, farmShape,
    setDisplayMode, setActiveHotspot, toggleLayer, setFarmShape
  } = useAtlas();

  const [loading, setLoading] = useState(true);
  const [isWalkMode, setIsWalkMode] = useState(false);
  const [walkState, setWalkState] = useState<WalkState>({
    isWalking: false,
    isSprinting: false,
    activeTarget: null,
    coordinates: { x: 0, z: 0 },
  });
  const [hotspotPositions, setHotspotPositions] = useState<Map<string, { x: number; y: number; visible: boolean }>>(new Map());

  // Initialise Three.js scene once
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new FarmScene(canvasRef.current, {
      onHotspotClick: (id) => setActiveHotspot(id),
      onHotspotPositions: (positions) => setHotspotPositions(new Map(positions)),
      onWalkStateChange: (state) => setWalkState(state),
    });
    sceneRef.current = scene;
    scene.setFarmShape(farmShape);
    setLoading(false);

    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  // Update 3D display whenever active display mode or farm or sandbox changes
  useEffect(() => {
    if (!sceneRef.current) return;
    setLoading(true);

    if (activeDisplayMode === 'sandbox') {
      sceneRef.current.loadCustomConfiguration(sandboxCropIds, sandboxLivestockIds, theme);
    } else if (farm) {
      sceneRef.current.loadFarm(farm, theme);
    }

    const timer = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(timer);
  }, [activeDisplayMode, farm?.id, sandboxCropIds.length, sandboxLivestockIds.length, theme]);

  // Sync farm shape (Square 1-Ha Plot vs Circular Diorama)
  useEffect(() => {
    sceneRef.current?.setFarmShape(farmShape);
  }, [farmShape]);

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

  const handleToggleWalkMode = () => {
    if (!sceneRef.current) return;
    const nowWalk = sceneRef.current.toggleWalkMode();
    setIsWalkMode(nowWalk);
  };

  return (
    <div className="farm-viewer-wrap">
      {/* Three.js Canvas */}
      <canvas
        ref={canvasRef}
        className="farm-viewer-canvas"
        id="farm-viewer-canvas"
        style={{ width: '100%', height: '100%', cursor: isWalkMode ? 'crosshair' : 'grab' }}
      />

      {/* Loading overlay */}
      {loading && (
        <div className="viewer-loading" role="status" aria-label="Loading farm">
          <span className="viewer-loading-icon">🌿</span>
          <p>
            {activeDisplayMode === 'sandbox'
              ? 'Rendering configured polyculture in 3D…'
              : 'Generating 3D agro-ecosystem…'}
          </p>
        </div>
      )}

      {/* ─── First-Person Walk Mode Overlay & Crosshair ─── */}
      {isWalkMode && (
        <>
          {/* Center Crosshair Reticle */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 15,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.9)',
              boxShadow: '0 0 8px rgba(0, 0, 0, 0.6)',
            }} />
          </div>

          {/* First-Person HUD (Bottom Center) */}
          <div style={{
            position: 'absolute',
            bottom: 'var(--space-6)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            pointerEvents: 'auto',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(6, 12, 8, 0.85)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 'var(--r-lg)',
              padding: '10px 18px',
              color: '#f8fafc',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5)',
              fontSize: '12px',
            }}>
              <span style={{ fontSize: '16px' }}>🚶</span>
              <div>
                <strong>Farmer Eye-Level Walk (1.65m)</strong>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                  Use <kbd style={{ padding: '2px 4px', background: '#334155', borderRadius: '3px' }}>W</kbd>{' '}
                  <kbd style={{ padding: '2px 4px', background: '#334155', borderRadius: '3px' }}>A</kbd>{' '}
                  <kbd style={{ padding: '2px 4px', background: '#334155', borderRadius: '3px' }}>S</kbd>{' '}
                  <kbd style={{ padding: '2px 4px', background: '#334155', borderRadius: '3px' }}>D</kbd> or Arrows + Drag Mouse to Look
                </div>
              </div>

              <div style={{
                borderLeft: '1px solid #334155',
                paddingLeft: '12px',
                fontSize: '11px',
                color: '#38bdf8',
                fontFamily: 'var(--font-mono)',
              }}>
                X: {walkState.coordinates.x > 0 ? `+${walkState.coordinates.x}` : walkState.coordinates.x}m
                <br />
                Z: {walkState.coordinates.z > 0 ? `+${walkState.coordinates.z}` : walkState.coordinates.z}m
              </div>

              <button
                onClick={handleToggleWalkMode}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--r-md)',
                  background: '#ef4444',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                Exit Walk ✕
              </button>
            </div>
          </div>
        </>
      )}

      {/* Active Mode Badge & Controls (Top Left) */}
      <div style={{
        position: 'absolute',
        top: 'var(--space-4)',
        left: 'var(--space-4)',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <div className="viewer-mode-badge" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--glass)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--r-full)',
          padding: '5px 12px',
          boxShadow: 'var(--shadow-card)',
          fontSize: '11px',
          fontWeight: 600,
        }}>
          <span style={{ fontSize: '13px' }}>
            {activeDisplayMode === 'sandbox' ? '🧪' : '🌿'}
          </span>
          <span style={{ color: 'var(--ink-strong)' }}>
            {activeDisplayMode === 'sandbox'
              ? `Sandbox (${sandboxCropIds.length + sandboxLivestockIds.length} Species)`
              : (farm?.name || 'Agroforest')}
          </span>
          {activeDisplayMode === 'sandbox' && (
            <button
              onClick={() => setDisplayMode('farm')}
              style={{
                marginLeft: '4px',
                fontSize: '10px',
                padding: '2px 8px',
                borderRadius: 'var(--r-full)',
                background: 'var(--surface-raised)',
                border: '1px solid var(--border)',
                color: 'var(--muted)',
                cursor: 'pointer',
              }}
              title="Switch back to standard farm preset"
            >
              Reset ↺
            </button>
          )}
        </div>

        {/* Plot Cadastral Shape Toggle (Square / Circle) */}
        <button
          onClick={() => setFarmShape(farmShape === 'square' ? 'circle' : 'square')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: 'var(--glass)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--r-full)',
            padding: '5px 10px',
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--ink-strong)',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-card)',
          }}
          title={farmShape === 'square' ? 'Switch to Circular Diorama' : 'Switch to 1-Hectare Square Plot'}
        >
          <span>{farmShape === 'square' ? '⏹ 1-Ha Square Plot' : '⏺ Circular Diorama'}</span>
        </button>

        {/* Walkable First-Person View Toggle Button */}
        <button
          onClick={handleToggleWalkMode}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: isWalkMode ? 'var(--status-good)' : 'var(--glass)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--r-full)',
            padding: '5px 12px',
            fontSize: '11px',
            fontWeight: 700,
            color: isWalkMode ? '#ffffff' : 'var(--ink-strong)',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-card)',
            transition: 'all 0.2s ease',
          }}
          title="Enter 1st Person Farmer Walk Mode"
        >
          <span>🚶</span>
          <span>{isWalkMode ? 'Walking Farm' : 'Walk Farm (1st Person)'}</span>
        </button>
      </div>

      {/* View state selector (top center) */}
      {!isWalkMode && <ViewStateSelector />}

      {/* Layer filter chips (top right) */}
      {!isWalkMode && (
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
      )}

      {/* Camera angle presets (bottom right) */}
      {!isWalkMode && (
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
      )}

      {/* Hotspot overlay (visible in farm preset mode when not in FPV) */}
      {!isWalkMode && farm && activeDisplayMode === 'farm' && (
        <HotspotCallouts
          hotspots={farm.hotspots}
          positions={hotspotPositions}
        />
      )}
    </div>
  );
}
