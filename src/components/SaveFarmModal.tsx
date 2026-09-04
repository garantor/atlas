import React, { useState, useEffect } from 'react';
import { useAtlas, useSelectedFarm } from '@/state/useAtlas';
import { CROPS } from '@/data/cropsDatabase';
import { LIVESTOCK } from '@/data/livestockDatabase';
import type { Crop, LivestockSpecies } from '@/data/types';

export function SaveFarmModal() {
  const {
    saveModalOpen, setSaveModalOpen,
    farmAcreage, infrastructure, farmShape,
    activeDisplayMode, sandboxCropIds, sandboxLivestockIds,
    saveFarmConfig
  } = useAtlas();

  const farm = useSelectedFarm();

  const defaultName = activeDisplayMode === 'sandbox'
    ? `Custom Poly-culture Estate (${farmAcreage >= 1000 ? `${farmAcreage / 1000}k` : farmAcreage} ac)`
    : `${farm?.name || 'Agroforest'} (${farmAcreage >= 1000 ? `${farmAcreage / 1000}k` : farmAcreage} ac Plan)`;

  const [farmName, setFarmName] = useState(defaultName);
  const [description, setDescription] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync default name whenever modal opens
  useEffect(() => {
    if (saveModalOpen) {
      setFarmName(defaultName);
      setDescription('');
      setSavedSuccess(false);
    }
  }, [saveModalOpen, farm?.name, farmAcreage, activeDisplayMode]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && saveModalOpen) {
        setSaveModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveModalOpen, setSaveModalOpen]);

  if (!saveModalOpen) return null;

  const activeCrops = activeDisplayMode === 'sandbox'
    ? sandboxCropIds
    : (farm?.cropIds || []);

  const activeLivestock = activeDisplayMode === 'sandbox'
    ? sandboxLivestockIds
    : (farm?.livestockIds || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmName.trim()) return;

    saveFarmConfig(farmName, description);
    setSavedSuccess(true);
    setTimeout(() => {
      setSaveModalOpen(false);
      setSavedSuccess(false);
    }, 600);
  };

  const infraList = [
    { key: 'roads', label: 'Laterite Roads', icon: '🛣️' },
    { key: 'farmhouse', label: 'Operations Hub', icon: '🏡' },
    { key: 'cctv', label: 'CCTV Towers', icon: '📡' },
    { key: 'waterTower', label: 'Water & Irrigation', icon: '💧' },
    { key: 'solarArray', label: 'Solar PV Array', icon: '☀️' },
    { key: 'dryingPatio', label: 'Drying Patio', icon: '🧺' },
    { key: 'perimeterFence', label: 'Security Fence', icon: '🛡️' },
  ] as const;

  const activeInfra = infraList.filter(i => infrastructure[i.key]);

  return (
    <div className="modal-overlay" role="dialog" aria-labelledby="save-farm-title" aria-modal="true">
      <div className="modal-backdrop" onClick={() => setSaveModalOpen(false)} />
      
      <div
        className="modal-content"
        style={{
          maxWidth: '560px',
          width: '94%',
          background: 'var(--surface-raised)',
          border: '1px solid var(--border-strong)',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px var(--green-glow)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
      >
        {/* Header */}
        <div
          className="modal-header"
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--glass)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>💾</span>
            <div>
              <h2 id="save-farm-title" style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--ink-strong)' }}>
                Save Farm Configuration
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '2px 0 0' }}>
                Store your custom layout, acreage, crops, and infrastructure
              </p>
            </div>
          </div>
          <button
            onClick={() => setSaveModalOpen(false)}
            style={{
              background: 'var(--surface-sunk)',
              border: '1px solid var(--border)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--muted)',
              cursor: 'pointer',
              fontSize: '14px',
            }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body & Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '24px', gap: '20px' }}>
          
          {/* Farm Name Input */}
          <div>
            <label
              htmlFor="farm-name-input"
              style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink-strong)', marginBottom: '8px' }}
            >
              Custom Farm Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              id="farm-name-input"
              type="text"
              required
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              placeholder="e.g. Ondo Valley 100-Acre Cocoa & Solar Concession"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '12px',
                background: 'var(--surface-sunk)',
                border: '1px solid var(--border-strong)',
                color: 'var(--ink-strong)',
                fontSize: '14px',
                outline: 'none',
                fontFamily: 'inherit',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
              }}
              autoFocus
            />
          </div>

          {/* Description / Notes */}
          <div>
            <label
              htmlFor="farm-desc-input"
              style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink-strong)', marginBottom: '8px' }}
            >
              Notes & Architectural Description (Optional)
            </label>
            <textarea
              id="farm-desc-input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Phase 2 expansion featuring central laterite access road, solar drying yard for cocoa export, and borehole water tower."
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '12px',
                background: 'var(--surface-sunk)',
                border: '1px solid var(--border)',
                color: 'var(--ink-body)',
                fontSize: '12px',
                outline: 'none',
                fontFamily: 'inherit',
                resize: 'vertical',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
              }}
            />
          </div>

          {/* Live Configuration Snapshot Card */}
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)' }}>
                Configuration Snapshot
              </span>
              <span
                style={{
                  background: 'var(--green-wash)',
                  color: 'var(--green-light)',
                  border: '1px solid var(--green-glow)',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 'var(--r-full)',
                }}
              >
                {farmAcreage >= 1000 ? `${(farmAcreage / 1000).toLocaleString()}k ac` : `${farmAcreage} ac`} · {(farmAcreage / 2.471).toFixed(1)} ha
              </span>
            </div>

            {/* Infrastructure badges */}
            <div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '6px' }}>
                Active Infrastructure ({activeInfra.length}/7):
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {activeInfra.map(i => (
                  <span
                    key={i.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'var(--surface-raised)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '4px 8px',
                      fontSize: '11px',
                      color: 'var(--ink-strong)',
                    }}
                  >
                    <span>{i.icon}</span>
                    <span>{i.label}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Crops & Fauna badges */}
            <div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '6px' }}>
                Ecosystem Species ({activeCrops.length} crops, {activeLivestock.length} fauna):
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {activeCrops.map(cid => {
                  const crop = CROPS.find((c: Crop) => c.id === cid);
                  return (
                    <span
                      key={cid}
                      style={{
                        background: 'rgba(34, 197, 94, 0.1)',
                        border: '1px solid rgba(34, 197, 94, 0.25)',
                        color: 'var(--green-light)',
                        borderRadius: '6px',
                        padding: '2px 6px',
                        fontSize: '10px',
                        fontWeight: 600,
                      }}
                    >
                      {crop?.name || cid}
                    </span>
                  );
                })}
                {activeLivestock.map(lid => {
                  const animal = LIVESTOCK.find((l: LivestockSpecies) => l.id === lid);
                  return (
                    <span
                      key={lid}
                      style={{
                        background: 'rgba(245, 158, 11, 0.1)',
                        border: '1px solid rgba(245, 158, 11, 0.25)',
                        color: 'var(--harvest-light)',
                        borderRadius: '6px',
                        padding: '2px 6px',
                        fontSize: '10px',
                        fontWeight: 600,
                      }}
                    >
                      {animal?.name || lid}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Pedestal Shape */}
            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
              Pedestal Shape: <strong style={{ color: 'var(--ink-strong)' }}>{farmShape === 'circle' ? 'Circular Pedestal' : 'Square Plot Grid'}</strong>
            </div>
          </div>

          {/* Footer Actions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '8px',
            }}
          >
            <button
              type="button"
              onClick={() => setSaveModalOpen(false)}
              style={{
                padding: '10px 20px',
                borderRadius: '12px',
                background: 'var(--surface-sunk)',
                border: '1px solid var(--border)',
                color: 'var(--ink-body)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savedSuccess}
              style={{
                padding: '10px 24px',
                borderRadius: '12px',
                background: savedSuccess
                  ? '#10b981'
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px var(--green-glow)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
              }}
            >
              {savedSuccess ? (
                <>
                  <span>✓</span> Saved!
                </>
              ) : (
                <>
                  <span>💾</span> Save Farm
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
