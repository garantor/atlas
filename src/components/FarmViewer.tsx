import { useEffect, useRef, useState } from 'react';
import { useAtlas, useSelectedFarm } from '@/state/useAtlas';
import { FarmScene } from '@/three/FarmScene';
import type { WalkState } from '@/three/FirstPersonController';
import type { FarmInfrastructure } from '@/data/types';
import { HotspotCallouts } from './HotspotCallouts';
import { ViewStateSelector } from './ViewStateSelector';
import '@/styles/viewer.css';

const LAYERS = [
  { id: 'canopy',         label: 'Canopy',     color: '#22c55e' },
  { id: 'shrub',          label: 'Shrub',      color: '#16a34a' },
  { id: 'herbaceous',     label: 'Crops',      color: '#84cc16' },
  { id: 'roots',          label: 'Roots',      color: '#d97706' },
  { id: 'fauna',          label: 'Fauna',      color: '#f59e0b' },
  { id: 'infrastructure', label: 'Infra',      color: '#38bdf8' },
  { id: 'particles',      label: 'Cycles',     color: '#a855f7' },
] as const;

const CAMERA_PRESETS = [
  { id: 'overview',     label: 'Plot View',    icon: '🎯' },
  { id: 'estate',       label: 'Estate View',  icon: '🏡' },
  { id: 'landscape',    label: 'Landscape',    icon: '🛰️' },
  { id: 'ground-layer', label: 'Ground',       icon: '🌿' },
  { id: 'top-down',     label: 'Top-Down',     icon: '📐' },
  { id: 'cocoa-closeup',label: 'Close-Up',     icon: '🔍' },
] as const;

const ACREAGE_PRESETS = [
  { label: '1 Ha (2.5 ac)', value: 2.47 },
  { label: '30 Acres',      value: 30 },
  { label: '100 Acres',     value: 100 },
  { label: '500 Acres',     value: 500 },
  { label: '1,000 Acres',   value: 1000 },
  { label: '10,000 Acres',  value: 10000 },
  { label: '1 Million ac',  value: 1000000 },
];

export function FarmViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<FarmScene | null>(null);
  const farm = useSelectedFarm();
  const {
    viewState, season, timeOfDay, theme, layerFilters,
    activeDisplayMode, sandboxCropIds, sandboxLivestockIds, farmShape,
    farmAcreage, infrastructure, leftPanelOpen, rightPanelOpen,
    setDisplayMode, setActiveHotspot, toggleLayer, setFarmShape,
    setFarmAcreage, toggleInfrastructure, setSaveModalOpen
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

  // Modals / popovers
  const [scaleMenuOpen, setScaleMenuOpen] = useState(false);
  const [infraMenuOpen, setInfraMenuOpen] = useState(false);
  const [customAcreInput, setCustomAcreInput] = useState(String(farmAcreage));

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
    scene.setFarmAcreage(farmAcreage);
    scene.setInfrastructure(infrastructure);
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
      sceneRef.current.loadCustomConfiguration(sandboxCropIds, sandboxLivestockIds, theme, farmAcreage, infrastructure);
    } else if (farm) {
      sceneRef.current.loadFarm(farm, theme, farmAcreage, infrastructure);
    }

    const timer = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(timer);
  }, [activeDisplayMode, farm?.id, sandboxCropIds.length, sandboxLivestockIds.length, theme]);

  // Sync farm shape (Square Plot vs Circular Diorama)
  useEffect(() => {
    sceneRef.current?.setFarmShape(farmShape);
  }, [farmShape]);

  // Sync farm acreage
  useEffect(() => {
    sceneRef.current?.setFarmAcreage(farmAcreage);
    setCustomAcreInput(String(farmAcreage));
  }, [farmAcreage]);

  // Sync infrastructure elements
  useEffect(() => {
    sceneRef.current?.setInfrastructure(infrastructure);
  }, [infrastructure]);

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

  const handleCustomAcreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(customAcreInput);
    if (!isNaN(val) && val > 0) {
      setFarmAcreage(val);
      setScaleMenuOpen(false);
    }
  };

  // Trigger Three.js resize whenever panels expand/collapse
  useEffect(() => {
    const handleResize = () => {
      sceneRef.current?.resize();
    };
    handleResize();
    const t1 = setTimeout(handleResize, 80);
    const t2 = setTimeout(handleResize, 280);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [leftPanelOpen, rightPanelOpen]);

  return (
    <div className={`farm-viewer-wrap ${leftPanelOpen && rightPanelOpen ? 'panels-open' : ''}`}>
      {/* Three.js Canvas */}
      <canvas
        ref={canvasRef}
        className="farm-viewer-canvas farm-canvas"
        aria-label="3D Interactive Farm Scene"
      />

      {/* Loading overlay */}
      {loading && (
        <div className="viewer-loading" aria-live="polite">
          <div className="viewer-spinner" />
          <span>Rendering Farm Ecosystem...</span>
        </div>
      )}

      {/* First-Person HUD when walking */}
      {isWalkMode && (
        <div className="fpv-hud-overlay" style={{
          position: 'absolute',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '16px',
          padding: '12px 24px',
          color: '#ffffff',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
          zIndex: 40,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '18px' }}>👨‍🌾</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.02em' }}>
                Farmer Walk Mode — 1.65m Eye Level
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.65)' }}>
                Use <kbd style={{ background: '#334155', padding: '1px 5px', borderRadius: '4px' }}>W</kbd> <kbd style={{ background: '#334155', padding: '1px 5px', borderRadius: '4px' }}>A</kbd> <kbd style={{ background: '#334155', padding: '1px 5px', borderRadius: '4px' }}>S</kbd> <kbd style={{ background: '#334155', padding: '1px 5px', borderRadius: '4px' }}>D</kbd> to walk, <kbd style={{ background: '#334155', padding: '1px 5px', borderRadius: '4px' }}>Shift</kbd> to sprint, mouse to look around
              </div>
            </div>
            <button
              onClick={handleToggleWalkMode}
              style={{
                marginLeft: '12px',
                padding: '6px 14px',
                borderRadius: '8px',
                background: '#ef4444',
                color: '#ffffff',
                border: 'none',
                fontWeight: 600,
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              Exit Walk [F]
            </button>
          </div>
          {walkState.activeTarget && (
            <div style={{
              fontSize: '11px',
              color: '#38bdf8',
              background: 'rgba(56, 189, 248, 0.12)',
              padding: '2px 10px',
              borderRadius: '6px',
            }}>
              Approaching: <strong>{walkState.activeTarget}</strong>
            </div>
          )}
        </div>
      )}

      {/* Floating Unified Top Toolbar */}
      <div className="viewer-top-bar">
        {/* Top-Left Cluster: Context, Scale & Infrastructure */}
        <div className="viewer-top-left">
          {/* Active Farm / Sandbox Badge */}
        <div style={{
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

        {/* Acreage Scale Selector Pill */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setScaleMenuOpen(!scaleMenuOpen);
              setInfraMenuOpen(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--glass)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: scaleMenuOpen ? '1px solid var(--brand-primary)' : '1px solid var(--border-strong)',
              borderRadius: 'var(--r-full)',
              padding: '5px 12px',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--ink-strong)',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-card)',
            }}
            title="Configure Farm Acreage & Landscape Size"
          >
            <span>📐</span>
            <span>
              {farmAcreage >= 1000
                ? `${(farmAcreage / 1000).toLocaleString()}k ac`
                : `${farmAcreage} ac`}
              {' '}
              <span style={{ opacity: 0.65 }}>({(farmAcreage / 2.471).toFixed(1)} ha)</span>
            </span>
            <span style={{ fontSize: '9px', opacity: 0.7 }}>▼</span>
          </button>

          {/* Scale Menu Popover */}
          {scaleMenuOpen && (
            <div style={{
              position: 'absolute',
              top: '110%',
              left: '0',
              width: '280px',
              background: 'var(--surface-overlay)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid var(--border-strong)',
              borderRadius: '14px',
              padding: '12px',
              boxShadow: 'var(--shadow-panel)',
              zIndex: 50,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink-strong)' }}>
                  Farm Acreage & Landscape Scale
                </span>
                <button
                  onClick={() => setScaleMenuOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                {ACREAGE_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => {
                      setFarmAcreage(preset.value);
                      setScaleMenuOpen(false);
                    }}
                    style={{
                      padding: '6px 8px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: farmAcreage === preset.value ? 700 : 500,
                      background: farmAcreage === preset.value ? 'var(--brand-primary)' : 'var(--surface-raised)',
                      color: farmAcreage === preset.value ? '#ffffff' : 'var(--ink-body)',
                      border: '1px solid var(--border)',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Custom numeric input form */}
              <form onSubmit={handleCustomAcreSubmit} style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={customAcreInput}
                  onChange={(e) => setCustomAcreInput(e.target.value)}
                  placeholder="Custom Acres"
                  style={{
                    flex: 1,
                    padding: '5px 8px',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                    color: 'var(--ink-strong)',
                    fontSize: '11px',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    background: 'var(--brand-primary)',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Set
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Infrastructure & Security Config Button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setInfraMenuOpen(!infraMenuOpen);
              setScaleMenuOpen(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--glass)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: infraMenuOpen ? '1px solid var(--brand-primary)' : '1px solid var(--border-strong)',
              borderRadius: 'var(--r-full)',
              padding: '5px 12px',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--ink-strong)',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-card)',
            }}
            title="Configure Farm Infrastructure & Security"
          >
            <span>🏗️</span>
            <span>Infrastructure</span>
            <span style={{ fontSize: '9px', opacity: 0.7 }}>⚙️</span>
          </button>

          {/* Infrastructure Menu Popover */}
          {infraMenuOpen && (
            <div style={{
              position: 'absolute',
              top: '110%',
              left: '0',
              width: '260px',
              background: 'var(--surface-overlay)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid var(--border-strong)',
              borderRadius: '14px',
              padding: '12px',
              boxShadow: 'var(--shadow-panel)',
              zIndex: 50,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink-strong)' }}>
                  Farm Facilities & Security
                </span>
                <button
                  onClick={() => setInfraMenuOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { key: 'roads', label: 'Laterite Access Roads', icon: '🛣️' },
                  { key: 'farmhouse', label: 'Farmstead & Operations Hub', icon: '🏡' },
                  { key: 'cctv', label: 'Solar CCTV Security Towers', icon: '📹' },
                  { key: 'waterTower', label: 'Water Tower & Irrigation', icon: '💧' },
                  { key: 'solarArray', label: 'Solar Power Array', icon: '☀️' },
                  { key: 'dryingPatio', label: 'Solar Drying Patio', icon: '🧺' },
                  { key: 'perimeterFence', label: 'Perimeter Security Fence', icon: '🛡️' },
                ].map((item) => {
                  const k = item.key as keyof FarmInfrastructure;
                  const active = infrastructure[k];
                  return (
                    <button
                      key={item.key}
                      onClick={() => toggleInfrastructure(k)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: 500,
                        background: active ? 'rgba(34, 197, 94, 0.12)' : 'var(--surface-raised)',
                        color: active ? 'var(--status-good)' : 'var(--muted)',
                        border: active ? '1px solid rgba(34, 197, 94, 0.35)' : '1px solid var(--border)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </span>
                      <span style={{ fontWeight: 700, fontSize: '10px' }}>
                        {active ? 'ON' : 'OFF'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        </div>

        {/* Top-Right Cluster: Actions & Controls */}
        <div className="viewer-top-right">
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
            title={farmShape === 'square' ? 'Switch to Circular Diorama' : 'Switch to Square Cadastral Plot'}
          >
            <span>{farmShape === 'square' ? '⏹ Plot' : '⏺ Circle'}</span>
          </button>

          {/* Save Farm Configuration Button */}
          <button
            onClick={() => setSaveModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.22) 0%, rgba(5, 150, 105, 0.18) 100%)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid var(--green-primary)',
              borderRadius: 'var(--r-full)',
              padding: '5px 12px',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--green-light)',
              cursor: 'pointer',
              boxShadow: '0 2px 8px var(--green-glow)',
            }}
            title="Save current farm configuration to SQLite"
          >
            <span>💾</span>
            <span>Save</span>
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
            <span>{isWalkMode ? 'Exit' : 'Walk'}</span>
          </button>
        </div>
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
              className={`layer-chip ${layerFilters[layer.id as keyof typeof layerFilters] ? 'on' : ''}`}
              onClick={() => toggleLayer(layer.id as keyof typeof layerFilters)}
              aria-pressed={layerFilters[layer.id as keyof typeof layerFilters]}
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
