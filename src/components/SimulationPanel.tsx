import { useAtlas, useSelectedFarm } from '@/state/useAtlas';
import { lerLabel } from '@/data/intercroppingRules';

export function SimulationPanel() {
  const { simulationResult } = useAtlas();
  const farm = useSelectedFarm();
  const { ler, nitrogenDelta, weedSuppression, pestResistance, canopyPAR, waterEfficiency, compatibilityWarnings, synergies } = simulationResult;

  const { label, status } = lerLabel(ler);

  // LER gauge: max meaningful LER ~2.5
  const lerCircumference = 2 * Math.PI * 40;
  const lerFill = Math.min(ler / 2.5, 1) * lerCircumference;
  const lerOffset = lerCircumference - lerFill;

  const lerColor = status === 'good' ? '#f5a623' : status === 'warn' ? '#ef6c00' : '#c62828';

  return (
    <aside className="simulation-panel" aria-label="Intercropping simulation">
      {/* LER Gauge */}
      <div className="synergy-hud">
        <div className="hud-title">
          <span>⚗️</span>
          <span>Synergy Analysis</span>
        </div>

        <div className="ler-gauge-wrap">
          <svg
            width="100"
            height="100"
            viewBox="0 0 100 100"
            className="ler-gauge-svg"
            role="img"
            aria-label={`LER ${ler.toFixed(2)}`}
          >
            {/* Track */}
            <circle
              className="ler-gauge-track"
              cx="50" cy="50" r="40"
              strokeDasharray={lerCircumference}
              style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
            />
            {/* Fill */}
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
            {/* Label */}
            <text className="ler-gauge-label" x="50" y="47" style={{ fill: lerColor }}>
              {ler === 0 ? '—' : ler.toFixed(2)}
            </text>
            <text className="ler-gauge-sub" x="50" y="59">
              LER
            </text>
          </svg>

          <div className="ler-gauge-info">
            <h4>{ler === 0 ? 'Add crops to sandbox' : 'Land Equivalent Ratio'}</h4>
            {ler > 0 && (
              <span className={`ler-status ${status}`}>{label}</span>
            )}
            {ler > 0 && (
              <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '6px', lineHeight: 1.5 }}>
                {ler >= 1 ? `${((ler - 1) * 100).toFixed(0)}% more efficient than monocultures` : 'Monoculture is more land-efficient'}
              </p>
            )}
          </div>
        </div>

        {/* Metric bars */}
        {ler > 0 && (
          <div className="metric-bar-group">
            <MetricBar label="N₂ Fixation" icon="🌱" value={nitrogenDelta} unit="kg/ha" fillClass="n2"
              fillPct={Math.max(0, Math.min((nitrogenDelta + 50) / 150 * 100, 100))} />
            <MetricBar label="Weed Suppression" icon="🌿" value={weedSuppression} unit="%" fillClass="weed"
              fillPct={weedSuppression} />
            <MetricBar label="Pest Resistance" icon="🛡" value={pestResistance} unit="%" fillClass="pest"
              fillPct={pestResistance} />
            <MetricBar label="Light Capture" icon="☀️" value={canopyPAR} unit="% PAR" fillClass="par"
              fillPct={canopyPAR} />
            <MetricBar label="Water Efficiency" icon="💧" value={waterEfficiency} unit="%" fillClass="water"
              fillPct={waterEfficiency} />
          </div>
        )}

        {/* Synergies */}
        {synergies.length > 0 && (
          <div className="metric-synergy-list">
            {synergies.slice(0, 4).map((s, i) => (
              <div key={i} className="synergy-item" style={{ fontSize: '11px', color: 'var(--status-good)', lineHeight: 1.5 }}>
                {s}
              </div>
            ))}
          </div>
        )}

        {/* Warnings */}
        {compatibilityWarnings.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {compatibilityWarnings.map((w, i) => (
              <div key={i} className="compat-warning">
                <span>⚠</span>
                <span style={{ fontSize: '11px' }}>{w.replace('⚠ ', '')}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Farm-level baseline info when sandbox is empty */}
      {ler === 0 && farm && (
        <div className="synergy-hud" style={{ marginTop: '8px' }}>
          <div className="hud-title">
            <span>📊</span>
            <span>Farm Baseline</span>
          </div>
          <div className="metric-bar-group">
            <MetricBar label="System LER" icon="⚗️" value={farm.lerBaseline} unit="" fillClass="n2"
              fillPct={Math.min(farm.lerBaseline / 2.5 * 100, 100)} />
            <MetricBar label="N₂ Balance" icon="🌱" value={farm.nitrogenDelta} unit="kg/ha" fillClass="n2"
              fillPct={Math.max(0, Math.min((farm.nitrogenDelta + 50) / 150 * 100, 100))} />
            <MetricBar label="Weed Suppression" icon="🌿" value={farm.weedSuppressionPct} unit="%" fillClass="weed"
              fillPct={farm.weedSuppressionPct} />
            <MetricBar label="Pest Resistance" icon="🛡" value={farm.pestResistancePct} unit="%" fillClass="pest"
              fillPct={farm.pestResistancePct} />
          </div>
        </div>
      )}
    </aside>
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
            ? value.toFixed(2)
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
