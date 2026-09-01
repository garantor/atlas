import { useAtlas, useSelectedFarm } from '@/state/useAtlas';
import { lerLabel, simulateIntercropping } from '@/data/intercroppingRules';
import type { FarmerAdvisory } from '@/data/types';

export function SimulationPanel() {
  const { simulationResult, activeDisplayMode, sandboxCropIds, sandboxLivestockIds } = useAtlas();
  const farm = useSelectedFarm();

  // If in preset farm mode and sandbox is empty, evaluate active farm's advisories
  const activeResult = activeDisplayMode === 'sandbox' && (sandboxCropIds.length > 0 || sandboxLivestockIds.length > 0)
    ? simulationResult
    : farm
      ? simulateIntercropping(farm.cropIds, farm.livestockIds)
      : simulationResult;

  const { ler, nitrogenDelta, weedSuppression, pestResistance, canopyPAR, waterEfficiency, farmerAdvisories } = activeResult;
  const { label, status } = lerLabel(ler || (farm?.lerBaseline ?? 1.0));

  const currentLER = ler || (farm?.lerBaseline ?? 1.0);
  const lerCircumference = 2 * Math.PI * 40;
  const lerFill = Math.min(currentLER / 2.5, 1) * lerCircumference;
  const lerOffset = lerCircumference - lerFill;
  const lerColor = status === 'good' ? 'var(--status-good)' : status === 'warn' ? 'var(--status-warn)' : 'var(--status-bad)';

  return (
    <aside className="simulation-panel" aria-label="Intercropping simulation & Farmer Advisories">
      {/* LER & Synergy Overview Gauge */}
      <div className="synergy-hud">
        <div className="hud-title">
          <span>⚗️</span>
          <span>Ecosystem Synergy & LER</span>
        </div>

        <div className="ler-gauge-wrap">
          <svg
            width="90"
            height="90"
            viewBox="0 0 100 100"
            className="ler-gauge-svg"
            role="img"
            aria-label={`LER ${currentLER.toFixed(2)}`}
          >
            <circle
              className="ler-gauge-track"
              cx="50" cy="50" r="40"
              strokeDasharray={lerCircumference}
              style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
            />
            <circle
              className="ler-gauge-fill"
              cx="50" cy="50" r="40"
              strokeDasharray={lerCircumference}
              strokeDashoffset={lerOffset}
              style={{
                transform: 'rotate(-90deg)',
                transformOrigin: 'center',
                stroke: lerColor,
              }}
            />
            <text className="ler-gauge-label" x="50" y="47" style={{ fill: lerColor }}>
              {currentLER.toFixed(2)}
            </text>
            <text className="ler-gauge-sub" x="50" y="60">
              LER
            </text>
          </svg>

          <div className="ler-gauge-info">
            <h4>{label}</h4>
            <span className={`ler-status ${status}`}>
              {currentLER >= 1
                ? `${((currentLER - 1) * 100).toFixed(0)}% more yield vs monoculture`
                : 'Monoculture more land-efficient'}
            </span>
            <p style={{ fontSize: '11px', color: 'var(--ink-body)', marginTop: '6px', lineHeight: 1.5 }}>
              {activeDisplayMode === 'sandbox'
                ? 'Calculated live from your custom sandbox species combination.'
                : 'Baseline agronomic efficiency for this tropical agro-ecosystem.'}
            </p>
          </div>
        </div>

        {/* Ecological Metric Bars */}
        <div className="metric-bar-group">
          <MetricBar
            label="N₂ Soil Balance"
            icon="🌱"
            value={nitrogenDelta}
            unit="kg/ha"
            fillClass="n2"
            fillPct={Math.max(0, Math.min((nitrogenDelta + 40) / 140 * 100, 100))}
          />
          <MetricBar
            label="Weed Suppression"
            icon="🌿"
            value={weedSuppression}
            unit="%"
            fillClass="weed"
            fillPct={weedSuppression}
          />
          <MetricBar
            label="Pest Resistance"
            icon="🛡️"
            value={pestResistance}
            unit="%"
            fillClass="pest"
            fillPct={pestResistance}
          />
          <MetricBar
            label="Canopy Light (PAR)"
            icon="☀️"
            value={canopyPAR}
            unit="%"
            fillClass="par"
            fillPct={canopyPAR}
          />
          <MetricBar
            label="Water Retention"
            icon="💧"
            value={waterEfficiency}
            unit="%"
            fillClass="water"
            fillPct={waterEfficiency}
          />
        </div>
      </div>

      {/* ─── Farmer Agronomic Advisories & Implications ─── */}
      <div className="synergy-hud" style={{ gap: 'var(--space-3)' }}>
        <div className="hud-title">
          <span>👨‍🌾</span>
          <span>Farmer Agronomic Advisories ({farmerAdvisories.length})</span>
        </div>

        {farmerAdvisories.length === 0 ? (
          <p style={{ fontSize: '12px', color: 'var(--muted-soft)', fontStyle: 'italic', padding: '8px 0' }}>
            No specific biological conflicts or companion rules triggered for this single species yet. Add companion crops or livestock to see operational advisories!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {farmerAdvisories.map((adv: FarmerAdvisory) => (
              <AdvisoryCard key={adv.id} advisory={adv} />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

function AdvisoryCard({ advisory }: { advisory: FarmerAdvisory }) {
  const isWarning = advisory.type === 'warning';
  const isSynergy = advisory.type === 'synergy';
  const isCalendar = advisory.type === 'calendar';

  const borderColor = isWarning
    ? 'rgba(239, 68, 68, 0.4)'
    : isSynergy
      ? 'rgba(52, 211, 153, 0.4)'
      : isCalendar
        ? 'rgba(56, 189, 248, 0.4)'
        : 'rgba(245, 158, 11, 0.4)';

  const badgeClass = isWarning
    ? 'tag-amber'
    : isSynergy
      ? 'tag-green'
      : 'tag-amber';

  const badgeText = isWarning
    ? '🚨 Operational Warning'
    : isSynergy
      ? '✨ High Synergy'
      : isCalendar
        ? '📅 Planting Schedule'
        : '💡 Management Tip';

  return (
    <div
      className="advisory-card"
      style={{
        padding: '12px 14px',
        borderRadius: 'var(--r-md)',
        background: 'var(--surface-sunk)',
        border: `1px solid ${borderColor}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
        <h5 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink-strong)', lineHeight: 1.3 }}>
          {advisory.title}
        </h5>
        <span className={`tag ${badgeClass}`} style={{ fontSize: '9px', flexShrink: 0 }}>
          {badgeText}
        </span>
      </div>

      <p style={{ fontSize: '12px', color: 'var(--ink-body)', lineHeight: 1.6 }}>
        {advisory.description}
      </p>

      <div
        style={{
          marginTop: '4px',
          padding: '8px 10px',
          borderRadius: 'var(--r-sm)',
          background: 'var(--surface-raised)',
          border: '1px solid var(--border)',
          fontSize: '11px',
          color: 'var(--ink)',
          lineHeight: 1.5,
        }}
      >
        <strong style={{ color: 'var(--muted)', display: 'block', marginBottom: '2px' }}>
          Recommended Farmer Action:
        </strong>
        {advisory.actionableTip}
      </div>
    </div>
  );
}

function MetricBar({
  label, icon, value, unit, fillClass, fillPct
}: {
  label: string;
  icon: string;
  value: number;
  unit: string;
  fillClass: string;
  fillPct: number;
}) {
  return (
    <div className="metric-bar-item">
      <div className="metric-bar-header">
        <span className="metric-bar-label">
          <span>{icon}</span>
          <span>{label}</span>
        </span>
        <span className="metric-bar-value">
          {typeof value === 'number' && value % 1 !== 0
            ? value.toFixed(1)
            : Math.round(value)
          }{unit ? ` ${unit}` : ''}
        </span>
      </div>
      <div className="metric-bar-track" role="progressbar" aria-valuenow={fillPct} aria-valuemin={0} aria-valuemax={100}>
        <div
          className={`metric-bar-fill ${fillClass}`}
          style={{ width: `${Math.max(0, Math.min(fillPct, 100))}%` }}
        />
      </div>
    </div>
  );
}
