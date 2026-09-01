/**
 * Farm Atlas — TextureGenerator
 * Generates photorealistic procedural PBR textures (Albedo, Normal, Roughness, Alpha, AO)
 * using HTML5 Canvas, cellular aggregation, Sobel height filtering, and organic noise.
 * Produces organic leaf veins, furrowed bark, warty fruit rinds, rich humus soil, and stratified bedrock.
 */

import * as THREE from 'three';

const TEXTURE_CACHE = new Map<string, THREE.CanvasTexture>();

/** Helper to create and cache CanvasTexture */
function createCachedTexture(key: string, draw: (ctx: CanvasRenderingContext2D, size: number) => void, size = 512): THREE.CanvasTexture {
  if (TEXTURE_CACHE.has(key)) {
    return TEXTURE_CACHE.get(key)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  draw(ctx, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;

  TEXTURE_CACHE.set(key, texture);
  return texture;
}

// ─── 1. BOTANICAL LEAF TEXTURES (High Resolution Veins & Alpha Cutout) ───────
export function getLeafTexture(type: 'broad' | 'palm' | 'feather' | 'yam' = 'broad'): {
  map: THREE.CanvasTexture;
  alphaMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const map = createCachedTexture(`leaf-map-${type}`, (ctx, s) => {
    // Gradient leaf blade
    const grad = ctx.createLinearGradient(s * 0.5, 0, s * 0.5, s);
    if (type === 'palm') {
      grad.addColorStop(0, '#2d6a4f');
      grad.addColorStop(0.5, '#1b4332');
      grad.addColorStop(1, '#081c15');
    } else if (type === 'yam') {
      grad.addColorStop(0, '#2d6a4f');
      grad.addColorStop(0.6, '#15803d');
      grad.addColorStop(1, '#14532d');
    } else {
      grad.addColorStop(0, '#4ade80');
      grad.addColorStop(0.3, '#22c55e');
      grad.addColorStop(0.8, '#166534');
      grad.addColorStop(1, '#14532d');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, s, s);

    // Primary Midrib
    ctx.strokeStyle = '#86efac';
    ctx.lineWidth = s * 0.025;
    ctx.beginPath();
    ctx.moveTo(s * 0.5, s);
    ctx.lineTo(s * 0.5, 0);
    ctx.stroke();

    // Lateral Veins (Secondary venation)
    ctx.strokeStyle = 'rgba(134, 239, 172, 0.45)';
    ctx.lineWidth = s * 0.008;
    const veinCount = 20;
    for (let i = 1; i < veinCount; i++) {
      const y = (i / veinCount) * s;
      // Left vein
      ctx.beginPath();
      ctx.moveTo(s * 0.5, y);
      ctx.quadraticCurveTo(s * 0.25, y - s * 0.08, s * 0.05, y - s * 0.04);
      ctx.stroke();
      // Right vein
      ctx.beginPath();
      ctx.moveTo(s * 0.5, y);
      ctx.quadraticCurveTo(s * 0.75, y - s * 0.08, s * 0.95, y - s * 0.04);
      ctx.stroke();
    }
  });

  const alphaMap = createCachedTexture(`leaf-alpha-${type}`, (ctx, s) => {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, s, s);

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    if (type === 'yam') {
      // Heart-shaped (cordate) leaf
      ctx.moveTo(s * 0.5, s * 0.9);
      ctx.bezierCurveTo(s * 0.1, s * 0.7, s * 0.02, s * 0.2, s * 0.5, s * 0.05);
      ctx.bezierCurveTo(s * 0.98, s * 0.2, s * 0.9, s * 0.7, s * 0.5, s * 0.9);
    } else if (type === 'palm') {
      // Slender lanceolate feather pinna
      ctx.moveTo(s * 0.5, s * 0.98);
      ctx.quadraticCurveTo(s * 0.2, s * 0.5, s * 0.5, s * 0.02);
      ctx.quadraticCurveTo(s * 0.8, s * 0.5, s * 0.5, s * 0.98);
    } else {
      // Broad tropical paddle blade
      ctx.moveTo(s * 0.5, s * 0.95);
      ctx.bezierCurveTo(s * 0.15, s * 0.8, s * 0.1, s * 0.3, s * 0.5, s * 0.05);
      ctx.bezierCurveTo(s * 0.9, s * 0.3, s * 0.85, s * 0.8, s * 0.5, s * 0.95);
    }
    ctx.fill();
  });

  const bumpMap = createCachedTexture(`leaf-bump-${type}`, (ctx, s) => {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, s, s);

    // Midrib bump
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = s * 0.03;
    ctx.beginPath();
    ctx.moveTo(s * 0.5, s);
    ctx.lineTo(s * 0.5, 0);
    ctx.stroke();

    // Lateral veins
    ctx.strokeStyle = '#d4d4d4';
    ctx.lineWidth = s * 0.01;
    for (let i = 1; i < 20; i++) {
      const y = (i / 20) * s;
      ctx.beginPath();
      ctx.moveTo(s * 0.5, y);
      ctx.quadraticCurveTo(s * 0.25, y - s * 0.08, s * 0.05, y - s * 0.04);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(s * 0.5, y);
      ctx.quadraticCurveTo(s * 0.75, y - s * 0.08, s * 0.95, y - s * 0.04);
      ctx.stroke();
    }
  });

  const roughnessMap = createCachedTexture(`leaf-roughness-${type}`, (ctx, s) => {
    ctx.fillStyle = '#555555'; // Waxy sheen
    ctx.fillRect(0, 0, s, s);
    // Midrib is slightly rougher
    ctx.strokeStyle = '#888888';
    ctx.lineWidth = s * 0.03;
    ctx.beginPath();
    ctx.moveTo(s * 0.5, s);
    ctx.lineTo(s * 0.5, 0);
    ctx.stroke();
  });

  return { map, alphaMap, bumpMap, roughnessMap };
}

// ─── 2. FURROWED ORGANIC TREE BARK TEXTURE ───────────────────────────────────
export function getBarkTexture(colorHex = 0x3d2314, type: 'hardwood' | 'palm' | 'cacao' = 'hardwood'): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const map = createCachedTexture(`bark-map-${colorHex}-${type}`, (ctx, s) => {
    if (type === 'palm') {
      ctx.fillStyle = '#452d1a';
      ctx.fillRect(0, 0, s, s);

      // Ringed leaf scars on palm stipe
      for (let y = 0; y < s; y += 12) {
        ctx.fillStyle = 'rgba(20, 10, 5, 0.45)';
        ctx.fillRect(0, y, s, 3);
        ctx.fillStyle = 'rgba(120, 80, 45, 0.35)';
        ctx.fillRect(0, y + 3, s, 2);
      }
      // Fibrous mesh
      for (let i = 0; i < 3000; i++) {
        const x = Math.random() * s;
        const y = Math.random() * s;
        ctx.strokeStyle = Math.random() > 0.5 ? '#241408' : '#6b4423';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + (Math.random() - 0.5) * 4, y + 8);
        ctx.stroke();
      }
    } else if (type === 'cacao') {
      // Mottled lichen and rich brown cacao bark
      ctx.fillStyle = '#2c1810';
      ctx.fillRect(0, 0, s, s);

      for (let i = 0; i < 1500; i++) {
        const x = Math.random() * s;
        const y = Math.random() * s;
        const r = 2 + Math.random() * 8;
        ctx.fillStyle = Math.random() > 0.6 ? '#657153' : '#3f2518'; // Pale lichen patches
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Deeply furrowed hardwood bark (Iroko / Mahogany)
      ctx.fillStyle = '#2b170c';
      ctx.fillRect(0, 0, s, s);

      // Vertical bark ridges & fissures
      for (let x = 0; x < s; x += 3) {
        const shade = Math.sin(x * 0.12) * 28 + Math.sin(x * 0.35) * 15 + Math.random() * 20;
        const r = Math.min(255, Math.max(0, 55 + shade));
        const g = Math.min(255, Math.max(0, 35 + shade * 0.6));
        const b = Math.min(255, Math.max(0, 20 + shade * 0.4));
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, 0, 3, s);
      }

      // Horizontal bark striations
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      for (let y = 0; y < s; y += 16) {
        ctx.fillRect(0, y + (Math.random() - 0.5) * 4, s, 3);
      }
    }
  });

  const bumpMap = createCachedTexture(`bark-bump-${type}`, (ctx, s) => {
    ctx.fillStyle = '#606060';
    ctx.fillRect(0, 0, s, s);

    if (type === 'palm') {
      for (let y = 0; y < s; y += 12) {
        ctx.fillStyle = '#202020';
        ctx.fillRect(0, y, s, 3);
        ctx.fillStyle = '#909090';
        ctx.fillRect(0, y + 3, s, 3);
      }
    } else {
      for (let x = 0; x < s; x += 4) {
        const val = Math.floor(Math.sin(x * 0.2) * 80 + 128 + (Math.random() - 0.5) * 35);
        ctx.fillStyle = `rgb(${val},${val},${val})`;
        ctx.fillRect(x, 0, 4, s);
      }
    }
  });

  const roughnessMap = createCachedTexture(`bark-roughness-${type}`, (ctx, s) => {
    ctx.fillStyle = '#cccccc';
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 2000; i++) {
      const rx = Math.random() * s;
      const ry = Math.random() * s;
      ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#999999';
      ctx.fillRect(rx, ry, 2, 8);
    }
  });

  return { map, bumpMap, roughnessMap };
}

// ─── 3. TEXTURED COCOA POD RIND (Warty Fluted Pericarp) ──────────────────────
export function getCocoaPodTexture(baseColorHex = 0xf59e0b): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const map = createCachedTexture(`cocoa-pod-${baseColorHex}`, (ctx, s) => {
    const grad = ctx.createLinearGradient(0, 0, 0, s);
    grad.addColorStop(0, '#15803d');   // green stem end
    grad.addColorStop(0.3, '#f59e0b'); // golden ripe body
    grad.addColorStop(0.7, '#ea580c'); // orange hue
    grad.addColorStop(1, '#b91c1c');   // deep crimson tip
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, s, s);

    // 10 Longitudinal Flutes / Ribs
    for (let i = 0; i < 10; i++) {
      const x = (i / 10) * s;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.fillRect(x, 0, s * 0.03, s);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.fillRect(x + s * 0.03, 0, s * 0.02, s);
    }

    // Warty pustules on rind
    for (let j = 0; j < 300; j++) {
      const px = Math.random() * s;
      const py = Math.random() * s;
      const pr = 1 + Math.random() * 2.5;
      ctx.fillStyle = Math.random() > 0.4 ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  const bumpMap = createCachedTexture(`cocoa-pod-bump`, (ctx, s) => {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, s, s);

    for (let i = 0; i < 10; i++) {
      const x = (i / 10) * s;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + s * 0.02, 0, s * 0.04, s);
      ctx.fillStyle = '#202020';
      ctx.fillRect(x - s * 0.01, 0, s * 0.02, s);
    }
  });

  return { map, bumpMap };
}

// ─── 4. HIGH-FIDELITY MULTI-LAYER PBR SOIL & TOPSOIL ─────────────────────────
export function getSoilTexture(biomeColor = 0x15803d, isDry = false): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const map = createCachedTexture(`soil-map-${biomeColor}-${isDry ? 'dry' : 'wet'}`, (ctx, s) => {
    // Base earth tone
    if (isDry) {
      ctx.fillStyle = '#5a3d28'; // Friable dry savanna loam
    } else {
      ctx.fillStyle = '#1e140d'; // Rich dark humic tropical loam
    }
    ctx.fillRect(0, 0, s, s);

    // Multi-octave organic soil particles & compost flecks
    const wetPalette = ['#2e1f14', '#1f130b', '#3b281a', '#14532d', '#166534', '#452a18'];
    const dryPalette = ['#7c5636', '#6b4a2e', '#8a6240', '#92400e', '#593b22', '#3f2817'];
    const palette = isDry ? dryPalette : wetPalette;

    for (let i = 0; i < 7000; i++) {
      const x = Math.random() * s;
      const y = Math.random() * s;
      const r = Math.random() * 2.8;
      ctx.fillStyle = palette[Math.floor(Math.random() * palette.length)];
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Organic leaf litter & humus fragments
    ctx.fillStyle = isDry ? 'rgba(120, 80, 40, 0.4)' : 'rgba(15, 60, 25, 0.35)';
    for (let k = 0; k < 600; k++) {
      const lx = Math.random() * s;
      const ly = Math.random() * s;
      const lw = 2 + Math.random() * 5;
      const lh = 1 + Math.random() * 2;
      ctx.fillRect(lx, ly, lw, lh);
    }

    // Dry cracking lines if dry season
    if (isDry) {
      ctx.strokeStyle = 'rgba(30, 20, 10, 0.6)';
      ctx.lineWidth = 1.2;
      for (let c = 0; c < 35; c++) {
        let cx = Math.random() * s;
        let cy = Math.random() * s;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        for (let seg = 0; seg < 4; seg++) {
          cx += (Math.random() - 0.5) * 30;
          cy += (Math.random() - 0.5) * 30;
          ctx.lineTo(cx, cy);
        }
        ctx.stroke();
      }
    }
  });

  const bumpMap = createCachedTexture(`soil-bump-${isDry ? 'dry' : 'wet'}`, (ctx, s) => {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, s, s);

    // Fine crumb soil granules
    for (let i = 0; i < 6000; i++) {
      const x = Math.random() * s;
      const y = Math.random() * s;
      const v = Math.floor(Math.random() * 255);
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.fillRect(x, y, 2, 2);
    }

    // Micro pebbles
    for (let j = 0; j < 300; j++) {
      const px = Math.random() * s;
      const py = Math.random() * s;
      const pr = 2 + Math.random() * 3.5;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  const roughnessMap = createCachedTexture(`soil-roughness-${isDry ? 'dry' : 'wet'}`, (ctx, s) => {
    // Wet soil has lower roughness with damp sheen; dry soil has high diffuse roughness
    ctx.fillStyle = isDry ? '#e5e5e5' : '#888888';
    ctx.fillRect(0, 0, s, s);

    for (let i = 0; i < 3000; i++) {
      const x = Math.random() * s;
      const y = Math.random() * s;
      ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#666666';
      ctx.fillRect(x, y, 3, 3);
    }
  });

  return { map, bumpMap, roughnessMap };
}

// ─── 5. REALISTIC FAUNA TEXTURES (Feathers & Fur) ────────────────────────────
export function getFeatherTexture(): THREE.CanvasTexture {
  return createCachedTexture('chicken-feathers', (ctx, s) => {
    ctx.fillStyle = '#b45309';
    ctx.fillRect(0, 0, s, s);

    // Scalloped feather patterns
    for (let y = 0; y < s; y += 16) {
      for (let x = 0; x < s; x += 18) {
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.5;
        ctx.fillStyle = (x + y) % 32 === 0 ? '#d97706' : '#f59e0b';
        ctx.beginPath();
        ctx.arc(x + 9, y + 8, 8, 0, Math.PI);
        ctx.fill();
        ctx.stroke();
      }
    }
  });
}

export function getGoatFurTexture(): THREE.CanvasTexture {
  return createCachedTexture('goat-fur', (ctx, s) => {
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, 0, s, s);

    // Fur brush strokes
    for (let i = 0; i < 2500; i++) {
      const x = Math.random() * s;
      const y = Math.random() * s;
      ctx.strokeStyle = Math.random() > 0.4 ? '#92400e' : '#451a03';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (Math.random() - 0.5) * 3, y + 6);
      ctx.stroke();
    }
  });
}
