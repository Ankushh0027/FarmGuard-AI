# FarmGuard AI — UI/UX Design System & Screen Specifications

**Target Audience:** Indian smallholder & progressive farmers, agricultural extension workers, and agronomists.  
**Platform:** Responsive Web Application (Optimized for Mobile Smartphones, Tablets, and Desktop Displays).  
**Language Support:** Devanagari Hindi (हिंदी), Roman Hinglish, and Indian English.  
**Design Philosophy:** Practical Agricultural SaaS — Combining government-portal reliability and clarity with modern, tactile software ergonomics. Zero generic AI clutter.

---

## 1. Visual Direction & Brand Identity

Indian agricultural users require **instant visual clarity**, **high-contrast text**, **touch-friendly controls**, and **clear operational guidance**.

### Core Tenets:
1. **Soil & Earth Grounding:** Palettes derived from healthy crops, fertile Gangetic alluvial soil, and clean monsoon water.
2. **Tactile & Unambiguous:** High-contrast cards, large clickable targets (minimum 44x44px for field hands), and unmistakable status states (Traffic Light: Green = Hold/Optimal, Amber = Postpone/Rain Coming, Red = Irrigate Now).
3. **Number Readability:** Numbers are the heartbeat of farming decisions — hectares/acres, litres, hours, and ₹ must be large, legible, and unclipped.
4. **Trilingual Respect:** Devanagari Hindi requires slightly taller line-height (`1.5` to `1.6`) and balanced font sizes compared to Latin fonts to avoid ascender/descender clipping.

---

## 2. Design Tokens

### 2.1 Color Palette

```css
:root {
  /* Surface & Canvas Tokens */
  --bg-app: #f6f8f6;            /* Natural organic canvas */
  --bg-surface: #ffffff;        /* Pure card surface */
  --bg-surface-elevated: #ffffff;
  --bg-surface-subtle: #f0f4f1;  /* Soft field tint */
  --bg-surface-muted: #e7ede8;   /* Input backgrounds & inactive chips */

  /* Brand Colors — Indian Agriculture & Foliage */
  --color-brand-primary: #1b5e20; /* Deep ICAR Green — authority & trust */
  --color-brand-dark: #0e3813;    /* Contrast text & headers */
  --color-brand-light: #2e7d32;   /* Hover states & active buttons */
  --color-brand-muted: #e8f5e9;   /* Soft green highlights & badge fills */
  --color-brand-border: #c8e6c9;  /* Delicate brand outlines */

  /* Semantic Action & Status Colors */
  --status-success: #1b5e20;      /* Optimal moisture / Task complete */
  --status-success-bg: #e8f5e9;
  --status-success-border: #a5d6a7;

  --status-warning: #b45309;      /* Rain forecast offset / Postpone */
  --status-warning-bg: #fffbeb;
  --status-warning-border: #fde68a;

  --status-danger: #b91c1c;       /* Critical soil dryness / High risk */
  --status-danger-bg: #fef2f2;
  --status-danger-border: #fecaca;

  --status-info: #0284c7;         /* Weather / Evapotranspiration / Water */
  --status-info-bg: #f0f9ff;
  --status-info-border: #bae6fd;

  /* Typography Colors */
  --text-primary: #111a14;        /* Near black for maximum sunlight readability */
  --text-secondary: #304436;      /* Subtitles & card descriptions */
  --text-muted: #597161;          /* Supporting notes & field hints */
  --text-inverse: #ffffff;

  /* Borders & Dividers */
  --border-subtle: #e4ebe5;
  --border-default: #cfdcd1;
  --border-strong: #9ab49f;
  --border-focus: #1b5e20;
}
```

### 2.2 Typography
- **Headings & Badges:** `Outfit`, sans-serif (Geometric, approachable, bold).
- **Body & Controls:** `Plus Jakarta Sans`, sans-serif (Exceptional readability at small sizes).
- **Numbers & Units:** `Outfit` / `Plus Jakarta Sans` with `font-variant-numeric: tabular-nums` (Guarantees numerical columns align perfectly).
- **Type Scale:**
  - `Hero / Metric Display`: 32px – 40px (Bold 800)
  - `Heading 1`: 24px – 28px (Bold 700)
  - `Heading 2`: 18px – 20px (Semi-bold 600)
  - `Body Regular`: 15px (Regular 400, Line-height 1.5)
  - `Body Small / Hints`: 13px (Medium 500)
  - `Caption / Badge`: 11px – 12px (Bold 700, Uppercase letter-spacing 0.05em)

### 2.3 Spacing & Layout
- 4px baseline grid: `4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`, `48px`.
- Card internal padding: `20px` (desktop), `16px` (mobile).
- Card gap: `20px` (desktop), `14px` (mobile).

### 2.4 Radii & Elevation
- **Border Radius:**
  - Small tags/badges: `6px`
  - Inputs & action buttons: `10px`
  - Cards & containers: `14px` – `18px`
  - Pills & status chips: `9999px` (Full circle)
- **Shadows:**
  - Card baseline: `0 1px 3px rgba(17, 26, 20, 0.05), 0 1px 2px rgba(17, 26, 20, 0.03)`
  - Elevated / Popover: `0 10px 25px -5px rgba(17, 26, 20, 0.08), 0 8px 10px -6px rgba(17, 26, 20, 0.04)`

### 2.5 Responsive Breakpoints
- **Mobile (`< 768px`):** Single column, bottom navigation bar, collapsed drawer, full-width touch cards.
- **Tablet (`768px – 1024px`):** 2-column dashboard grid, collapsible left sidebar.
- **Desktop (`> 1024px`):** Fixed 260px sidebar, multi-column dashboard, sticky summary cards.

---

## 3. Atomic Components & Pattern Library

### 3.1 Recommendation Hero Card ("The Traffic Light")
The core operational focal point of the farmer's day:
- **Green Variant:** "Optimal Moisture — Do Not Irrigate".
- **Amber Variant:** "Postpone Irrigation — Rain Expected (~X mm)".
- **Red Variant:** "Irrigate Now — Moisture Deficit (X mm depth)".
- Prominent secondary stats: Litres Needed, Pump Running Hours (e.g. `2 hrs 45 mins`), Electricity Cost Saved.

### 3.2 Crop & Soil Quick-Select Cards
- Visual cards displaying crop icons (`🌾 Wheat`, `🌾 Rice/Paddy`, `🌽 Maize`, `🎋 Sugarcane`) with seasonal and water-need badges.
- Single tap selects and instantly activates the parameters.

### 3.3 Steppers & Touch Input Sliders
- Large touch buttons (`-` / `+`) flanking numeric values so farmers can adjust land size (acres) or soil moisture (%) easily on mobile screens without typing into tiny keyboards.

### 3.4 Language Switcher
- Persistent, accessible switch with 3 clear options:
  - **हिंदी** (Hindi Devanagari)
  - **Hinglish** (Roman Hindi)
  - **English** (Indian English)

---

## 4. Screen-by-Screen Redesign Specifications (10 Screens)

### Screen 1: Farmer Dashboard (`OverviewPage`)
- **Purpose:** Daily command center answering: *"Do I need to irrigate my field today?"*
- **Key Elements:**
  - Active Farm Selector Pill (displays currently selected field name, crop, and location).
  - Primary Recommendation Hero Banner (Traffic light status, pump hours, water volume).
  - Today's Weather Snapshot (Live precipitation, temperature, and rain likelihood).
  - Quick Action Shortcuts (Check Water Need, Ask FarmGuard AI, View Rain Radar, Manage Fields).
  - Farm Summary Metric Cards (Current Soil Moisture, Water Saved this Season, Stubble Status).

### Screen 2: My Farms / Field Management (`FarmsPage`)
- **Purpose:** Manage multiple land parcels and switch active field.
- **Key Elements:**
  - List of saved fields (e.g., "Khet 1: North Plot — 2.5 Acres Wheat", "Khet 2: Well Plot — 1.0 Acre Sugarcane").
  - "Add New Field" modal trigger.
  - Active field indicator with "Switch Active Field" button.
  - Field cards showing crop, soil type, pump HP, and last calculated status.
  - Delete / Edit controls per field.
  - Stored persistently in browser `localStorage`.

### Screen 3: Add or Edit Farm (`AddFarmModal` / Sub-view)
- **Purpose:** Set up or update field profile without overwhelming the farmer.
- **Form Fields:**
  1. Field Name / Nickname (e.g., "Tubewell Plot")
  2. Crop Selection (Wheat, Rice, Maize, Sugarcane)
  3. Land Size (Acres, with touch increment stepper)
  4. Soil Type (Alluvial, Loamy, Sandy Loam, Clayey, Black, Red)
  5. Farm State / Region (13 Indian agricultural states)
  6. Tubewell Pump Capacity (3 HP, 5 HP, 7.5 HP, 10 HP)
- **Validation:** Clear feedback, default sensible presets for Indian farms.

### Screen 4: Crop & Soil Details (`CropSoilDetailView`)
- **Purpose:** Inspect crop water demands, growth stages, and soil characteristics.
- **Key Elements:**
  - FAO-56 crop coefficient (Kc) timeline and critical stages (e.g., CRI stage for wheat, tillering for paddy).
  - Interactive 6-inch Hand-Ball Soil Moisture Test Guide (Plain-language diagnostic for estimating moisture without probes).
  - Pump discharge rate estimator (200L drum fill test helper).

### Screen 5: Irrigation Recommendation (`FarmAnalysisPage`)
- **Purpose:** Run instant on-demand calculation for the selected farm field.
- **Key Elements:**
  - Current soil moisture slider / input with instant visual status.
  - Weather integration toggle ("Use live Open-Meteo forecast rain").
  - "Calculate Water Need" CTA.
  - Detailed results grid: Net Depth (mm), Water Volume (Liters & m³), Tubewell Pump Duration (hours & minutes), and Avoided Runoff.
  - Sustainable Stubble Residue Guidance (yield estimate, in-situ management, bio-decomposer).

### Screen 6: Weather & Rain Insights (`WeatherPage`)
- **Purpose:** 7-day tactical rain forecast to decide whether to pump or hold.
- **Key Elements:**
  - 7-Day Day-by-Day Forecast cards (Rain mm, Rain probability %, Temperature high/low).
  - Evapotranspiration (ET0) trend.
  - Clear Tactical Conclusion: "Rain expected on Thursday (~18 mm). Keep tubewell switched off to avoid waterlogging and fertilizer leaching."
  - State/Region selector for immediate local updates.

### Screen 7: Crop Risk & Community Alerts (`CommunityPage`)
- **Classification:** **Prototype / Regional Reference** (Clearly labeled to avoid fabricating live data).
- **Key Elements:**
  - Verified alerts from agricultural extension (e.g. Yellow Rust advisory in Northern Punjab, Fall Armyworm alerts).
  - Filter by crop and severity level.
  - Local incident reporter (saves report to local storage for demonstration).
  - Disclaimer: *"Demonstration module: Live crowdsourced reports will sync with local KVK bulletins in future updates."*

### Screen 8: AI Farm Assistant (`AIAdvisorPage`)
- **Purpose:** Empathetic, expert trilingual advisory agent for natural language questions.
- **Key Elements:**
  - Chat window with full chat history memory.
  - Quick Suggestion Prompts ("Will it rain this week?", "Yellowing leaves in wheat", "How to prepare compost from stubble").
  - Seamless farm context chip (shows the assistant is aware of active crop, soil, and moisture).
  - Collapsible "Behind the Scenes" tool trace (shows deterministic tools used; hidden by default for farmers to keep clean).
  - Multilingual voice/text toggle for Hindi, Hinglish, and English.

### Screen 9: Water & Environmental Impact (`SavingsPage`)
- **Purpose:** Quantify tangible farmer benefits (diesel/electricity costs saved) and environmental gains.
- **Key Elements:**
  - Configurable Pump HP and Electricity Tariff (₹/kWh).
  - Water volume saved (Liters & Tanker equivalents).
  - Electricity & Money saved (₹ saved per irrigation cycle and over 4-stage season).
  - Environmental Impact: Avoided CO2e (kg) and avoided PM2.5 (kg) from prevented stubble burning.

### Screen 10: Settings & Language Preferences (`SettingsPage`)
- **Purpose:** Centralized preferences and system diagnostics.
- **Key Elements:**
  - Language selection (Hindi, Hinglish, English).
  - Default pump rating & electricity tariff defaults.
  - Data reset / Clear local storage option.
  - System Verification Drawer (Links to Security Guardrails, Accuracy Benchmarks, and Architecture for evaluators).
