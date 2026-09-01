# Farm Atlas (AgriVerse 3D) 🌿

> **Interactive 3D Tropical Agro-Ecosystems & Polyculture Intercropping Simulator**  
> *Inspired by the botanical depth and interactive anatomy of Seed Atlas (`seedsatlas.vercel.app`), expanded to full polyculture agroforests and mixed companion-farming belts across Southwest Nigeria and West Africa.*

---

## 🌍 Overview

**Farm Atlas** is a high-fidelity, interactive 3D crop-science platform and companion-farming simulator. It transitions agricultural education from single seed specimens to **living tropical agro-ecosystems**, enabling farmers, researchers, and students to visualize, design, and simulate multi-tier polyculture farms in real time.

---

## ✨ Key Features

### 1. 🌿 8 Signature Tropical Agro-Ecosystems
Explore full botanical and spatial representations of core West African farming systems:
* **Cocoa-Plantain Agroforest** (Ondo / Osun Rainforest Belt) — Multi-tier shaded cocoa with plantain, kolanut, and free-range poultry.
* **Yam-Maize-Egusi Mound Polyculture** (Derived Savanna / Forest Transition) — Earthen mounds with live maize climbing trellises and egusi living mulch.
* **Cassava-Maize Staggered Relay** (Humid Forest Agro-Belt) — Relay intercropping optimizing land equivalent ratios (LER 1.65).
* **Ofada Wetland Rice & Aquaculture** (Ogun / Lagos River Basin) — Flooded paddy perimeter trenches with Clarias catfish and Nile tilapia.
* **Oil Palm Silvopasture** (Coastal Forest & Delta Swamps) — Understory pineapple and guinea grass grazed by West African Dwarf Goats.
* **Mandala Market Garden** (Urban Fringe & Vegetable Belts) — Concentric aromatic barrier rings of Scent Leaf (*Efinrin*) and Bitter Leaf shielding nightshades.
* **Savanna Cereal-Legume Belt** (Southern Guinea Savanna) — Sorghum-cowpea strip intercrops with pigeon pea living windbreaks.
* **Integrated Aquaponics & Snailery** (Intensive Urban-Periurban) — Recirculating aquaculture with giant African land snails (*Archachatina marginata*).

---

### 2. 🧪 Live 3D Intercropping & Sandbox Simulation Engine
* **Dynamic 3D Assembly**: Add or remove any combination of 35+ crops and 9 livestock species in the Sandbox, and watch the 3D diorama assemble the custom polyculture in real time.
* **Agronomic Formula Engine**:
  * **Land Equivalent Ratio (LER)**: Real-time calculation showing land-use efficiency vs. monocultures.
  * **N₂ Fixation Balance**: Evaluates rhizobial legume nitrogen fixation ($40\text{–}120\text{ kg N/ha}$) and animal manure mineralization.
  * **Weed Suppression**: Multi-canopy ground cover physics.
  * **Pest Bio-Shield Score**: Secondary plant metabolites and natural predator interactions.
  * **Photosynthetically Active Radiation (PAR)**: Stratified 7-tier light penetration modeling.

---

### 3. 👨‍🌾 Farmer Agronomic Implications & Advisory Engine
Directly alerts the farmer to real-world biological conflicts and actionable management tips:
* 🚨 **Critical Operational Warnings**: Unfenced goats in root/tuber beds, poultry scratching fresh vegetable nursery beds, sorghum allelopathic root exudates (*Sorgoleone*).
* ✨ **High-Yield Synergies**: Poultry leaf litter sanitation in cocoa orchards, tilapia pest grazing in rice basins, bee pollination multipliers (+30–50% pod set).
* 💡 **Structural Management**: Living maize trellises for yam vines, cut-and-carry pigeon pea fodder banks.
* 📅 **Planting Calendars & Staggering**: Time-staggered relay schedules for maximum yield.

---

### 4. 🔬 Museum-Grade 3D Graphics & Living Physics
* **PBR Shaders (`MeshPhysicalMaterial`)**: Translucent leaf cards with botanical venation, furrowed bark bump maps, and warty cocoa pod rinds.
* **GPU Wind Vertex Shader (`GLSL`)**: Parallel harmonic wind waves rustling canopy leaves at a locked 60 FPS.
* **Boids Flocking Simulation**: Craig Reynolds' steering algorithm simulating living birds (Cattle Egrets) and pollinators circling the canopy.
* **Square 1-Hectare Plot Mode**: Switch between a precision **1-Ha Square Cadastral Plot ($100\text{m} \times 100\text{m}$)** with drainage curbs and a **Circular Diorama**.
* **3 View Perspectives**: Macro Ecosystem, Subterranean Cross-Section (mycorrhizae & root nodules), and Flow Cycles (Nitrogen, Carbon, Water).

---

### 5. 🎨 Dual Botanical Luxury Aesthetic
* **Light Mode**: Warm botanical museum paper ground (`#f6f2e8`) with rich forest green accents.
* **Dark Mode**: Deep obsidian emerald forest (`#060c08`) with glowing nutrient cycles.

---

## 🛠️ Technology Stack

* **Frontend Framework**: React 19 + TypeScript + Vite
* **3D Graphics**: Three.js (`0.185.1`) with PBR Physical Materials & ACESFilmic Tone Mapping
* **Animation & Camera Physics**: GSAP 3 (smooth cubic camera flight interpolations)
* **State Store**: Zustand 5
* **Asset Pipeline**: Sourced GLTF/GLB with Google Draco (`DRACOLoader`) + Canvas Procedural PBR Engine
* **Styling**: Custom Design Tokens & Vanilla CSS

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/afolabir/atlas.git
cd atlas
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start development server
```bash
npm run dev
```

Open **[http://localhost:5177](http://localhost:5177)** in your browser.

---

## 📜 Available Scripts

* `npm run dev` — Starts the local Vite development server with Hot Module Replacement.
* `npm run build` — Type-checks TypeScript and compiles the production bundle.
* `npm run preview` — Locally preview the production build.

---

## 📄 License

MIT License © 2026 Farm Atlas Contributors.
