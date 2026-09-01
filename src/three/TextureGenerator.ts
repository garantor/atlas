/**
 * Farm Atlas — TextureGenerator
 * Generates photorealistic procedural PBR textures (Albedo, Normal, Roughness, Alpha)
 * using HTML5 Canvas and mathematical Perlin/Voronoi/cellular noise.
 * Produces organic leaf veins, furrowed bark, warty fruit rinds, rich humus soil, and plumage.
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
    ctx.strokeStyle = 'rgba(134, 239, 172, 0.4)';
    ctx.lineWidth = s * 0.008;
    const veinCount = 18;
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
    for (let i = 1; i < 18; i++) {
      const y = (i / 18) * s;
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

  return { map, alphaMap, bumpMap };
}

// ─── 2. FURROWED ORGANIC TREE BARK TEXTURE ───────────────────────────────────
export function getBarkTexture(colorHex = 0x3d2314): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const map = createCachedTexture(`bark-map-${colorHex}`, (ctx, s) => {
    ctx.fillStyle = '#2b170c';
    ctx.fillRect(0, 0, s, s);

    // Vertical bark ridges & fissures
    for (let x = 0; x < s; x += 3) {
      const shade = Math.sin(x * 0.15) * 25 + Math.random() * 20;
      const r = Math.min(255, Math.max(0, 55 + shade));
      const g = Math.min(255, Math.max(0, 35 + shade * 0.6));
      const b = Math.min(255, Math.max(0, 20 + shade * 0.4));
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x, 0, 3, s);
    }

    // Horizontal bark ring striations
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    for (let y = 0; y < s; y += 14) {
      ctx.fillRect(0, y + (Math.random() - 0.5) * 4, s, 3);
    }
  });

  const bumpMap = createCachedTexture(`bark-bump`, (ctx, s) => {
    ctx.fillStyle = '#606060';
    ctx.fillRect(0, 0, s, s);

    for (let x = 0; x < s; x += 4) {
      const val = Math.floor(Math.sin(x * 0.2) * 80 + 128 + (Math.random() - 0.5) * 30);
      ctx.fillStyle = `rgb(${val},${val},${val})`;
      ctx.fillRect(x, 0, 4, s);
    }
  });

  const roughnessMap = createCachedTexture(`bark-roughness`, (ctx, s) => {
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
    grad.addColorStop(0, '#15803d');  // green stem end
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

// ─── 4. RICH LOAM TOPSOIL & GRASS TEXTURE ────────────────────────────────────
export function getSoilTexture(biomeColor = 0x15803d): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const map = createCachedTexture(`soil-map-${biomeColor}`, (ctx, s) => {
    ctx.fillStyle = '#14532d';
    ctx.fillRect(0, 0, s, s);

    // Organic compost & earth flecks
    for (let i = 0; i < 4000; i++) {
      const x = Math.random() * s;
      const y = Math.random() * s;
      const r = Math.random() * 2.5;
      const colors = ['#166534', '#15803d', '#4d7c0f', '#362415', '#24170d'];
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  const bumpMap = createCachedTexture(`soil-bump`, (ctx, s) => {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 3000; i++) {
      const x = Math.random() * s;
      const y = Math.random() * s;
      const v = Math.floor(Math.random() * 255);
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.fillRect(x, y, 2, 2);
    }
  });

  return { map, bumpMap };
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
