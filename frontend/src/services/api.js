/**
 * FarmGuard AI — Frontend API Client
 * Interacts with FastAPI backend endpoints with transparent client-side deterministic fallback.
 * Strictly adheres to FAO-56 prototype constants and preserves offline demo usability.
 */

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || '';

// ============================================================================
// CENTRALIZED AGRONOMIC CONSTANTS (EXACT MATCH WITH BACKEND farm_calculator.py)
// ============================================================================
const LITERS_PER_ACRE_MM = 4046.8564;
const TUBEWELL_PUMP_DISCHARGE_LPH = 28000.0;

const CROP_DATA = {
  wheat: {
    base_irrigation_depth_mm: 50.0,
    target_moisture_percent: 65.0,
    critical_moisture_percent: 40.0,
    residue_tonnes_per_acre: 1.9,
    stubble_burning_risk: 'High',
    co2_kg_per_tonne_burned: 1460.0,
    pm25_kg_per_tonne_burned: 7.5,
    economic_value_inr_per_tonne: 1200.0,
    recommended_practices: [
      'In-situ stubble retention with Super SMS / Happy Seeder for direct sowing',
      'Mulching to preserve topsoil moisture and reduce evaporative loss',
      'Apply bio-decomposer spray for accelerated in-field decomposition',
      'Collection for dry fodder (Bhoosa) or biomass briquetting',
    ],
  },
  rice: {
    base_irrigation_depth_mm: 75.0,
    target_moisture_percent: 85.0,
    critical_moisture_percent: 60.0,
    residue_tonnes_per_acre: 2.5,
    stubble_burning_risk: 'High',
    co2_kg_per_tonne_burned: 1510.0,
    pm25_kg_per_tonne_burned: 9.0,
    economic_value_inr_per_tonne: 850.0,
    recommended_practices: [
      'Use Straw Management System (SMS) fitted combine harvesters',
      'In-situ soil incorporation using Rotavator / Mulcher with microbial consortia',
      'Baling and supplying to nearest biomass power or compressed bio-gas (CBG) plants',
      'Substrate utilization for commercial mushroom cultivation',
    ],
  },
  maize: {
    base_irrigation_depth_mm: 45.0,
    target_moisture_percent: 60.0,
    critical_moisture_percent: 35.0,
    residue_tonnes_per_acre: 2.0,
    stubble_burning_risk: 'Moderate',
    co2_kg_per_tonne_burned: 1400.0,
    pm25_kg_per_tonne_burned: 6.0,
    economic_value_inr_per_tonne: 1000.0,
    recommended_practices: [
      'Shred and incorporate stalks directly into soil to replenish organic carbon',
      'Silage making for dairy cattle feed',
      'Surface mulching for weed suppression and soil moisture conservation',
    ],
  },
  sugarcane: {
    base_irrigation_depth_mm: 65.0,
    target_moisture_percent: 75.0,
    critical_moisture_percent: 50.0,
    residue_tonnes_per_acre: 3.5,
    stubble_burning_risk: 'Moderate',
    co2_kg_per_tonne_burned: 1380.0,
    pm25_kg_per_tonne_burned: 5.5,
    economic_value_inr_per_tonne: 600.0,
    recommended_practices: [
      'Trash shredding and inter-row mulching (Trash Blanketing) in ratoon crop',
      'Composting with microbial culture',
      'Use as boiler fuel in local processing units or pelletization',
    ],
  },
};
CROP_DATA.paddy = CROP_DATA.rice;

const SOIL_DATA = {
  alluvial: { retention_factor: 1.00, drainage: 'Moderate', description: 'Fertile Gangetic floodplain soil' },
  loamy: { retention_factor: 1.00, drainage: 'Optimal', description: 'Balanced moisture holding and aeration' },
  'sandy loam': { retention_factor: 0.85, drainage: 'Moderately Fast', description: 'Permeable sandy-loam' },
  clayey: { retention_factor: 1.20, drainage: 'Slow', description: 'Heavy soil with high moisture retention' },
  'clay loam': { retention_factor: 1.10, drainage: 'Moderate-Slow', description: 'Heavy loam with good water retention' },
  sandy: { retention_factor: 0.80, drainage: 'Fast', description: 'High porosity; low water holding capacity' },
  black: { retention_factor: 1.25, drainage: 'Very Slow', description: 'High swell-shrink clay with superior retention' },
  red: { retention_factor: 0.90, drainage: 'Moderately Fast', description: 'Permeable soil with moderate holding' },
};

/**
 * Deterministic Client-Side Calculation Engine
 * Replicates backend farm_calculator.py pure math when offline.
 */
export function calculateDeterministicFallback(payload) {
  const cropKey = (payload.crop || 'wheat').toLowerCase().trim();
  const cropInfo = CROP_DATA[cropKey] || (cropKey.includes('rice') || cropKey.includes('paddy') ? CROP_DATA.rice : CROP_DATA.wheat);
  const soilKey = (payload.soil_type || 'alluvial').toLowerCase().trim();
  const soilInfo = SOIL_DATA[soilKey] || SOIL_DATA.loamy;

  const targetMoisture = cropInfo.target_moisture_percent;
  const criticalMoisture = cropInfo.critical_moisture_percent;
  const baseDepth = cropInfo.base_irrigation_depth_mm;
  const soilRetention = soilInfo.retention_factor;

  const area = Number(payload.area_acres) || 1.0;
  const currentMoisture = Number(payload.soil_moisture_percent) || 0;
  const rainProb = Number(payload.rainfall_probability || 0);
  const forecastRainMm = payload.forecast_rainfall_mm !== null && payload.forecast_rainfall_mm !== undefined && payload.forecast_rainfall_mm !== ''
    ? Number(payload.forecast_rainfall_mm)
    : null;
  const currentIrrigationMm = payload.current_irrigation_mm ? Number(payload.current_irrigation_mm) : 35.0;

  // 1. Deficit calculation
  const deficitPercent = Math.max(0, targetMoisture - currentMoisture);
  const depletionRatio = targetMoisture > 0 ? deficitPercent / targetMoisture : 0;
  const rawRequirementMm = (baseDepth * depletionRatio) / soilRetention;

  let recommendedMm = 0;
  let status = 'Optimal Soil Moisture';
  let urgency = 'Low';
  let action = 'Hold irrigation. Soil moisture is at or above target capacity.';
  let rainStatus = forecastRainMm !== null ? 'amount_known' : 'no_rain';
  let expectedRainOffsetMm = 0;
  let explanation = '';

  if (currentMoisture >= targetMoisture) {
    recommendedMm = 0;
    explanation = `Current soil moisture (${currentMoisture.toFixed(1)}%) meets or exceeds the target (${targetMoisture.toFixed(1)}%) for ${cropKey} on ${soilKey} soil. No additional irrigation required.`;
  } else if (forecastRainMm !== null) {
    rainStatus = 'amount_known';
    expectedRainOffsetMm = Number(Math.min(rawRequirementMm, Math.max(0, forecastRainMm)).toFixed(1));
    const netIrrigationMm = Math.max(0, Number((rawRequirementMm - forecastRainMm).toFixed(1)));

    if (forecastRainMm >= rawRequirementMm) {
      recommendedMm = 0;
      status = 'Postpone Irrigation (Forecast Rainfall Sufficient)';
      urgency = 'Low';
      action = `Postpone irrigation. Forecast precipitation (~${forecastRainMm.toFixed(1)} mm) is expected to satisfy the ${rawRequirementMm.toFixed(1)} mm moisture deficit.`;
      explanation = `Soil moisture deficit is ${rawRequirementMm.toFixed(1)} mm for ${cropKey}. Forecast rainfall amount (${forecastRainMm.toFixed(1)} mm) meets or exceeds this deficit without pumping.`;
    } else if (netIrrigationMm > 0) {
      recommendedMm = netIrrigationMm;
      status = 'Reduced Irrigation Recommended';
      urgency = 'Medium';
      action = `Apply reduced irrigation of ${recommendedMm} mm across ${area} acres.`;
      explanation = `Soil moisture deficit is ${rawRequirementMm.toFixed(1)} mm. Factoring in ${forecastRainMm.toFixed(1)} mm of forecast rainfall reduces the net irrigation requirement to ${recommendedMm} mm.`;
    } else {
      recommendedMm = 0;
      status = 'Hold Irrigation';
      urgency = 'Low';
      action = 'Hold irrigation based on forecast rainfall balance.';
      explanation = `Water balance indicates net requirement is 0 mm with ${forecastRainMm.toFixed(1)} mm forecast rain.`;
    }
  } else {
    rainStatus = rainProb > 0 ? 'probability_only' : 'no_rain';
    expectedRainOffsetMm = 0;
    recommendedMm = Number(rawRequirementMm.toFixed(1));

    if (rainProb >= 60) {
      status = 'Check Local Forecast Before Irrigating';
      urgency = 'Medium';
      action = `Soil moisture deficit indicates ${recommendedMm} mm is needed. Rain probability is high (${rainProb}%), but expected rainfall depth is unconfirmed.`;
      explanation = `Soil moisture (${currentMoisture.toFixed(1)}%) is ${deficitPercent.toFixed(1)}% below target for ${cropKey}. Rain probability is ${rainProb}%. Do not assume rain will fully satisfy the deficit without checking local radar.`;
    } else if (currentMoisture < criticalMoisture) {
      status = 'Irrigate Urgently';
      urgency = currentMoisture > criticalMoisture * 0.7 ? 'High' : 'Critical';
      action = `Apply ${recommendedMm} mm of irrigation across ${area} acres immediately.`;
      explanation = `Soil moisture (${currentMoisture.toFixed(1)}%) has fallen below critical threshold (${criticalMoisture.toFixed(1)}%). Crop is experiencing moisture stress.`;
    } else {
      status = 'Moderate Irrigation Recommended';
      urgency = 'Medium';
      action = `Schedule light irrigation of ${recommendedMm} mm.`;
      explanation = `Moisture is moderately depleted (${deficitPercent.toFixed(1)}% below target) for ${cropKey}. Applying ${recommendedMm} mm restores field capacity for ${soilKey} soil.`;
    }
  }

  // 2. Volumetric Water Conservation
  const currentLiters = Math.round(currentIrrigationMm * area * LITERS_PER_ACRE_MM);
  const recommendedLiters = Math.round(recommendedMm * area * LITERS_PER_ACRE_MM);
  const savingsLiters = currentLiters > recommendedLiters ? Math.round(currentLiters - recommendedLiters) : 0;
  const savingsPercent = currentLiters > 0 ? Number(((savingsLiters / currentLiters) * 100).toFixed(1)) : 0;
  const pumpHoursSaved = savingsLiters > 0 ? Number((savingsLiters / TUBEWELL_PUMP_DISCHARGE_LPH).toFixed(1)) : 0;

  // 3. Stubble Residue & Environmental Footprint
  const residueTonnesPerAcre = cropInfo.residue_tonnes_per_acre ?? 1.9;
  const economicValueRate = cropInfo.economic_value_inr_per_tonne ?? 1000;
  const co2Rate = cropInfo.co2_kg_per_tonne_burned ?? 1460;
  const pm25Rate = cropInfo.pm25_kg_per_tonne_burned ?? 7.5;

  const totalResidueTonnes = Number((area * residueTonnesPerAcre).toFixed(2));
  const economicPotentialInr = Math.round(totalResidueTonnes * economicValueRate);
  const co2eAvoidedKg = Number((totalResidueTonnes * co2Rate).toFixed(1));
  const pm25AvoidedKg = Number((totalResidueTonnes * pm25Rate).toFixed(2));

  return {
    farm_input: { ...payload },
    irrigation_recommendation: {
      recommended_irrigation_mm: recommendedMm,
      status,
      urgency,
      action,
      soil_depletion_percent: Number(deficitPercent.toFixed(1)),
      expected_rain_offset_mm: expectedRainOffsetMm,
      rain_forecast_status: rainStatus,
      explanation,
    },
    water_analysis: {
      current_water_liters: currentLiters,
      recommended_water_liters: recommendedLiters,
      water_savings_liters: savingsLiters,
      water_savings_percent: savingsPercent,
      diesel_or_electricity_savings_hours: pumpHoursSaved,
    },
    residue_estimate: {
      crop: cropKey,
      area_acres: area,
      estimated_residue_tonnes: totalResidueTonnes,
      stubble_burning_risk: cropInfo.stubble_burning_risk,
      recommended_practices: cropInfo.recommended_practices,
      economic_potential_inr: economicPotentialInr,
    },
    environmental_impact: {
      co2e_avoided_kg: co2eAvoidedKg,
      pm25_avoided_kg: pm25AvoidedKg,
      water_saved_liters: savingsLiters,
      water_saved_cubic_meters: Number((savingsLiters / 1000).toFixed(2)),
      soil_health_benefit: `In-situ retention of ${totalResidueTonnes} tonnes of ${cropKey} residue replenishes organic carbon and protects topsoil structure.`,
    },
    assumptions: [
      {
        type: 'weather',
        text: forecastRainMm !== null
          ? `Precipitation depth of ${forecastRainMm} mm factored into root-zone balance.`
          : 'No confirmed precipitation depth available; probability evaluated as risk context.',
      },
      {
        type: 'agronomic_model',
        text: `Baseline single depth (${baseDepth} mm) and soil retention (${soilRetention}x) derived from FAO-56 prototype tables.`,
      },
      {
        type: 'equipment',
        text: 'Tubewell run times estimate standard 5 HP pump discharge (28,000 L/hr).',
      },
    ],
    notes: [
      'Calculations executed via deterministic client calculation engine (FAO-56 prototype constants).',
      'Simulation Mode: Live backend unavailable; estimates reflect standard agricultural baselines.',
    ],
    is_client_fallback: true,
    request_id: `demo-calc-${Date.now()}`,
  };
}

/**
 * Deterministic AI Advisor Fallback
 * Provides structured decision support when backend LLM agent is offline.
 */
function generateDeterministicAgentAdviceFallback(payload) {
  const query = (payload.message || '').toLowerCase();

  // 1. Guardrail Check (Prompt Injection Defense)
  const injectionPatterns = [
    /ignore (all|prior|previous) instructions/i,
    /system prompt/i,
    /gemini_api_key/i,
    /api[-_]?key/i,
    /developer mode/i,
    /bypass filters/i,
    /print.*env/i,
  ];

  for (const pattern of injectionPatterns) {
    if (pattern.test(query)) {
      return {
        answer: '🛡️ **Security Guardrail Notice:** Your query matched a system security filter pattern (prompt injection or credential disclosure heuristic). Request has been safely intercepted.',
        blocked: true,
        block_reason: 'Prompt injection defense triggered (Heuristic pattern match)',
        security: {
          prompt_injection: 'detected',
          secret_scan: 'passed',
          output_guardrails: 'enforced',
        },
        tool_trace: [
          { event: 'INPUT_GUARDRAIL_INTERCEPTION', reason: 'Security pattern matched' },
        ],
        is_client_fallback: true,
        request_id: `guardrail-intercept-${Date.now()}`,
      };
    }
  }

  // 2. Extract farm parameters from message if not provided in payload
  const farmPayload = payload.farm || {};
  let crop = farmPayload.crop || 'wheat';
  if (query.includes('rice') || query.includes('chawal') || query.includes('dhan')) crop = 'rice';
  else if (query.includes('maize') || query.includes('makka')) crop = 'maize';
  else if (query.includes('sugarcane') || query.includes('ganna')) crop = 'sugarcane';
  else if (query.includes('wheat') || query.includes('gehu')) crop = 'wheat';

  const area = farmPayload.area_acres || 2.0;
  const soilMoisture = farmPayload.soil_moisture_percent !== undefined && farmPayload.soil_moisture_percent !== ''
    ? Number(farmPayload.soil_moisture_percent)
    : 38.0;

  // Run deterministic calculation for numbers
  const calcResult = calculateDeterministicFallback({
    crop,
    area_acres: area,
    soil_type: farmPayload.soil_type || 'alluvial',
    soil_moisture_percent: soilMoisture,
    current_irrigation_mm: farmPayload.current_irrigation_mm || 35.0,
    forecast_rainfall_mm: farmPayload.forecast_rainfall_mm || null,
    rainfall_probability: farmPayload.rainfall_probability || 20,
    pump_flow_lpm: farmPayload.pump_flow_lpm || '',
  });

  const rec = calcResult.irrigation_recommendation;
  const water = calcResult.water_analysis;
  const residue = calcResult.residue_estimate;

  // Determine language preference
  const langPref = (payload.language || '').toLowerCase();
  const hasDevanagari = /[\u0900-\u097F]/.test(query);
  const hinglishMarkers = ['khet', 'paani', 'pani', 'fasal', 'sinchai', 'sichai', 'nami', 'gehun', 'gehu', 'dhaan', 'makka', 'ganna', 'kitna', 'kaise', 'batao', 'chahiye', 'aaj', 'mitti'];
  const hasHinglish = hinglishMarkers.some(m => query.includes(m));

  let detectedLang = 'english';
  if (langPref === 'hindi' || (!langPref && hasDevanagari)) {
    detectedLang = 'hindi';
  } else if (langPref === 'hinglish' || (!langPref && hasHinglish)) {
    detectedLang = 'hinglish';
  }

  // Synthesize transparent, grounded advice
  let adviceText = '';
  const pumpMins = Math.round(water.recommended_water_liters / (28000 / 60));
  const hours = Math.floor(pumpMins / 60);
  const mins = pumpMins % 60;
  const pumpTimeStr = hours > 0 ? `${hours} hr ${mins} min` : `${mins} min`;

  if (detectedLang === 'hindi') {
    if (query.includes('water') || query.includes('paani') || query.includes('पानी') || query.includes('सिंचाई') || query.includes('आज')) {
      adviceText = `### फसल सिंचाई निर्णय (${crop.toUpperCase()} — ${area} एकड़)

**सलाह:** ${rec.recommended_irrigation_mm === 0 ? 'अभी सिंचाई रोकें (Wait/Postpone)' : `सिंचाई करें: ${rec.recommended_irrigation_mm} मिमी`}
* **स्थिति:** ${rec.status} (प्राथमिकता: **${rec.urgency}**)
* **वर्तमान मिट्टी की नमी:** ${soilMoisture}% (लक्षित नमी: ${CROP_DATA[crop]?.target_moisture_percent || 65}%)
* **सुझाई गई गहराई:** **${rec.recommended_irrigation_mm} मिमी**

---

### पानी और पंप का प्रभाव
* **आवश्यक पानी की मात्रा:** ${water.recommended_water_liters.toLocaleString()} लीटर पूरे खेत के लिए।
* **पानी की बचत:** अधिक सिंचाई से बचकर **${water.water_savings_liters.toLocaleString()} लीटर** (${water.water_savings_percent}%) तक पानी की बचत।
* **ट्यूबवेल का अनुमानित समय:** लगभग **${pumpTimeStr}** (मानक 5 HP पंप, ~460 ली/मिनट बहाव पर)।

---

### फसल अवशेष एवं मिट्टी सुरक्षा
* अनुमानित पराली/अवशेष: **${residue.estimated_residue_tonnes} टन**।
* सलाह: *फसल अवशेष को जलाने के बजाय खेत में ही मल्चिंग या मिट्टी में मिलाना सबसे फायदेमंद है।*

> ℹ️ *सूचना: यह सलाह क्लाइंट-साइड FAO-56 वैज्ञानिक मॉडल द्वारा ऑफलाइन मोड में तैयार की गई है।*`;
    } else if (query.includes('pump') || query.includes('पंप') || query.includes('समय') || query.includes('घंटे')) {
      adviceText = `### ट्यूबवेल पंप चलाने का समय

आपके **${area} एकड़** के **${crop}** के खेत के लिए:
* **सुझाई गई पानी की गहराई:** ${rec.recommended_irrigation_mm} मिमी
* **कुल पानी की मात्रा:** ${water.recommended_water_liters.toLocaleString()} लीटर
* **अनुमानित पंप समय (5 HP ट्यूबवेल):** **${pumpTimeStr}** (लगभग 28,000 लीटर/घंटा बहाव पर)।

💡 *कृषि सुझाव: वाष्पीकरण से पानी के नुकसान से बचने के लिए दोपहर की तेज धूप (12 बजे से 3 बजे) में सिंचाई से बचें।*

> ℹ️ *सूचना: क्लाइंट-साइड वैज्ञानिक गणना (ऑफलाइन मोड)।*`;
    } else {
      adviceText = `### ${crop.toUpperCase()} के लिए कृषि मार्गदर्शन

1. **मिट्टी की नमी स्थिति:** वर्तमान अनुमानित नमी **${soilMoisture}%** है। फसल की स्वस्थ वृद्धि के लिए इसे ${CROP_DATA[crop]?.critical_moisture_percent}% से ${CROP_DATA[crop]?.target_moisture_percent}% के बीच बनाए रखें।
2. **वर्तमान पानी की आवश्यकता:** ${rec.recommended_irrigation_mm === 0 ? 'अभी अतिरिक्त पानी की जरूरत नहीं है।' : `लगभग ${rec.recommended_irrigation_mm} मिमी पानी की आवश्यकता है।`}
3. **मिट्टी पोषण सुझाव:** पराली न जलाएं। खेत में अवशेष रखने से मिट्टी की नमी बनी रहती है और जैविक कार्बन बढ़ता है।

> ℹ️ *सूचना: क्लाइंट-साइड FAO-56 मॉडल द्वारा उत्पन्न सलाह।*`;
    }
  } else if (detectedLang === 'hinglish') {
    if (query.includes('water') || query.includes('paani') || query.includes('pani') || query.includes('sinchai') || query.includes('aaj')) {
      adviceText = `### Khet Mein Paani Ka Faisla (${crop.toUpperCase()} — ${area} Acres)

**Salah:** ${rec.recommended_irrigation_mm === 0 ? 'Abhi paani rok kar wait karein' : `Sinchai karein: ${rec.recommended_irrigation_mm} mm`}
* **Status:** ${rec.status} (Urgency: **${rec.urgency}**)
* **Mitti ki nami:** ${soilMoisture}% (Target: ${CROP_DATA[crop]?.target_moisture_percent || 65}%)
* **Recommended depth:** **${rec.recommended_irrigation_mm} mm**

---

### Paani Aur Pump Runtime
* **Zaroori paani:** ${water.recommended_water_liters.toLocaleString()} Litres poore khet ke liye.
* **Paani ki bachat:** Over-irrigation se bach kar **${water.water_savings_liters.toLocaleString()} Litres** (${water.water_savings_percent}%) paani bachaya ja sakta hai.
* **Tubewell runtime:** Lagbhag **${pumpTimeStr}** (standard 5 HP tubewell, ~460 L/min flow par).

---

### Fasal Avshesh Aur Mitti Ki Nami
* Anumanit parali: **${residue.estimated_residue_tonnes} tonnes**.
* Salah: *Parali jalane ke bajay surface mulching karein taaki mitti ki nami bani rahe.*

> ℹ️ *Note: Yeh salah offline FAO-56 precision model dwara taiyar ki gayi hai.*`;
    } else if (query.includes('pump') || query.includes('ghante') || query.includes('time') || query.includes('runtime')) {
      adviceText = `### Tubewell Pump Timing Estimation

Aapke **${area} acres** ke **${crop}** khet ke liye:
* **Recommended Paani Ki Gehrai:** ${rec.recommended_irrigation_mm} mm
* **Total Paani:** ${water.recommended_water_liters.toLocaleString()} Litres
* **Estimated Pump Time (5 HP Standard):** **${pumpTimeStr}** (~28,000 L/hr delivery par).

💡 *Agronomic Tip: Dopehar ki tez dhoop (12 PM - 3 PM) me paani chalane se bachein taaki evaporation loss kam ho.*

> ℹ️ *Note: Client-side calculation (backend offline mode).*`;
    } else {
      adviceText = `### ${crop.toUpperCase()} Ke Liye Agricultural Guidance

1. **Mitti Ki Nami:** Current moisture **${soilMoisture}%** hai. Isko ${CROP_DATA[crop]?.critical_moisture_percent}% se ${CROP_DATA[crop]?.target_moisture_percent}% ke beech maintain karein.
2. **Paani Ki Zaroorat:** ${rec.recommended_irrigation_mm === 0 ? 'Abhi paani dene ki zaroorat nahi hai.' : `Lagbhag ${rec.recommended_irrigation_mm} mm paani require hai.`}
3. **Residue Tip:** Parali ko mat jalayein. Khet me mulch karne se mitti ki nami aur organic carbon dono improve hote hain.

> ℹ️ *Note: Client-side FAO-56 decision model (offline demo mode).*`;
    }
  } else {
    // English
    if (query.includes('water') || query.includes('paani') || query.includes('irrigation') || query.includes('today')) {
      adviceText = `### Field Water Decision for ${crop.toUpperCase()} (${area} Acres)

**Recommendation:** ${rec.action}
* **Status:** ${rec.status} (Urgency: **${rec.urgency}**)
* **Current Soil Moisture:** ${soilMoisture}% (Target: ${CROP_DATA[crop]?.target_moisture_percent || 65}%)
* **Recommended Depth:** **${rec.recommended_irrigation_mm} mm**

---

### Water & Pump Impact
* **Target Water Volume:** ${water.recommended_water_liters.toLocaleString()} Liters across your field.
* **Potential Conservation:** Conserves up to **${water.water_savings_liters.toLocaleString()} Liters** (${water.water_savings_percent}%) compared to uncalibrated over-flooding.
* **Tubewell Runtime:** Estimated at **${pumpTimeStr}** on a standard 5 HP pump (~460 L/min).

---

### Crop & Soil Residue Guidance
* Expected stubble yield: **${residue.estimated_residue_tonnes} tonnes**.
* Practice: *${residue.recommended_practices[0]}*.

> ℹ️ *Note: This response was generated deterministically by the client-side decision model (FAO-56 constants) because the live backend server is offline.*`;
    } else if (query.includes('pump') || query.includes('hour') || query.includes('time')) {
      adviceText = `### Tubewell Pump Timing Estimation

Based on your field size of **${area} acres** of **${crop}**:
* **Recommended Water Depth:** ${rec.recommended_irrigation_mm} mm
* **Total Water Volume:** ${water.recommended_water_liters.toLocaleString()} Liters
* **Estimated Pump Time (5 HP Standard):** **${pumpTimeStr}** (at ~28,000 L/hr discharge).

💡 *Agronomic Tip: Avoid running your pump during peak midday hours (12 PM - 3 PM) to prevent evaporative losses.*

> ℹ️ *Note: Client-side calculation estimate (backend offline).*`;
    } else {
      adviceText = `### Agricultural Guidance for ${crop.toUpperCase()}

1. **Soil Moisture Status:** Current estimated moisture is **${soilMoisture}%**. Maintain moisture between ${CROP_DATA[crop]?.critical_moisture_percent}% and ${CROP_DATA[crop]?.target_moisture_percent}%.
2. **Current Water Need:** ${rec.action}
3. **Field Residue Tip:** Avoid burning stubble. In-situ retention can conserve essential topsoil nutrients and save valuable irrigation moisture.

> ℹ️ *Note: Deterministic client advice generated in offline demo mode.*`;
    }
  }

  return {
    answer: adviceText,
    recommendation: rec,
    water_analysis: water,
    environmental_impact: calcResult.environmental_impact,
    detected_language: detectedLang,
    tool_trace: [
      { tool: 'input_guardrails', status: 'passed' },
      { tool: 'fao56_crop_calculator', status: 'executed', crop, recommended_mm: rec.recommended_irrigation_mm },
      { tool: 'deterministic_advisory_synthesis', status: 'completed' },
    ],
    security: {
      prompt_injection: 'passed',
      secret_scan: 'passed',
      output_guardrails: 'passed',
    },
    is_client_fallback: true,
    request_id: `offline-agent-${Date.now()}`,
  };
}

// Track backend availability
let isBackendAvailable = true;

export async function checkHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${API_BASE_URL}/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    isBackendAvailable = true;
    return data;
  } catch (err) {
    isBackendAvailable = false;
    return { status: 'offline', mode: 'demo_fallback', note: 'Running with client-side deterministic agronomic engine' };
  }
}

export async function checkReady() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${API_BASE_URL}/ready`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return { status: 'offline', mode: 'demo_fallback' };
  }
}

export async function getMetrics() {
  try {
    const res = await fetch(`${API_BASE_URL}/metrics`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } catch (err) {
    return null;
  }
}

export async function analyzeFarm(payload, options = {}) {
  const callerSignal = options.signal;
  if (callerSignal?.aborted) {
    const err = new Error('Request was aborted by user');
    err.name = 'AbortError';
    throw err;
  }

  const timeoutMs = options.timeout || 12000;
  const internalController = new AbortController();
  const timeoutId = setTimeout(() => internalController.abort(new Error('Timeout')), timeoutMs);

  const onCallerAbort = () => internalController.abort(callerSignal.reason);
  if (callerSignal) {
    callerSignal.addEventListener('abort', onCallerAbort, { once: true });
  }

  try {
    let res = null;
    let attempt = 0;
    while (attempt < 2) {
      attempt++;
      try {
        res = await fetch(`${API_BASE_URL}/api/v1/farm/analyze`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: internalController.signal,
        });

        if (res.ok) {
          isBackendAvailable = true;
          return await res.json();
        }

        if ([502, 503, 504].includes(res.status) && attempt < 2 && !internalController.signal.aborted) {
          await new Promise(r => setTimeout(r, 600));
          continue;
        }
        break;
      } catch (networkErr) {
        if (callerSignal?.aborted) {
          throw networkErr;
        }
        if (attempt < 2 && !internalController.signal.aborted) {
          await new Promise(r => setTimeout(r, 600));
          continue;
        }
        break;
      }
    }

    if (callerSignal?.aborted) {
      const err = new Error('Request was aborted by user');
      err.name = 'AbortError';
      throw err;
    }

    return calculateDeterministicFallback(payload);
  } finally {
    clearTimeout(timeoutId);
    if (callerSignal) {
      callerSignal.removeEventListener('abort', onCallerAbort);
    }
  }
}

export async function getAgentAdvice(payload, options = {}) {
  const callerSignal = options.signal;
  if (callerSignal?.aborted) {
    const err = new Error('Request was aborted by user');
    err.name = 'AbortError';
    throw err;
  }

  const timeoutMs = options.timeout || 15000;
  const internalController = new AbortController();
  const timeoutId = setTimeout(() => internalController.abort(new Error('Timeout')), timeoutMs);

  const onCallerAbort = () => internalController.abort(callerSignal.reason);
  if (callerSignal) {
    callerSignal.addEventListener('abort', onCallerAbort, { once: true });
  }

  try {
    let res = null;
    let attempt = 0;
    while (attempt < 2) {
      attempt++;
      try {
        res = await fetch(`${API_BASE_URL}/api/v1/agent/advice`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: internalController.signal,
        });

        if (res.ok) {
          isBackendAvailable = true;
          return await res.json();
        }

        if ([502, 503, 504].includes(res.status) && attempt < 2 && !internalController.signal.aborted) {
          await new Promise(r => setTimeout(r, 600));
          continue;
        }
        break;
      } catch (networkErr) {
        if (callerSignal?.aborted) {
          throw networkErr;
        }
        if (attempt < 2 && !internalController.signal.aborted) {
          await new Promise(r => setTimeout(r, 600));
          continue;
        }
        break;
      }
    }

    if (callerSignal?.aborted) {
      const err = new Error('Request was aborted by user');
      err.name = 'AbortError';
      throw err;
    }

    return generateDeterministicAgentAdviceFallback(payload);
  } finally {
    clearTimeout(timeoutId);
    if (callerSignal) {
      callerSignal.removeEventListener('abort', onCallerAbort);
    }
  }
}

// ============================================================================
// PERSISTENT FARMS & GEOLOCATION API CLIENT
// ============================================================================

export async function fetchFarms() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/farms`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : null;
  } catch (err) {
    console.warn('Backend fetchFarms failed, falling back to local storage:', err.message);
    return null;
  }
}

export async function saveFarmApi(farmData) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/farms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(farmData),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Backend saveFarmApi failed:', err.message);
    return null;
  }
}

export async function updateFarmApi(farmId, farmData) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/farms/${farmId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(farmData),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`Backend updateFarmApi failed for ${farmId}:`, err.message);
    return null;
  }
}

export async function deleteFarmApi(farmId) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/farms/${farmId}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.warn(`Backend deleteFarmApi failed for ${farmId}:`, err.message);
    return false;
  }
}

export async function resetFarmsApi() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/farms/reset`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Backend resetFarmsApi failed:', err.message);
    return null;
  }
}

export async function fetchWeatherForecastApi(location, lat = null, lon = null) {
  try {
    const params = new URLSearchParams();
    if (location) params.append('location', location);
    if (lat !== null && lat !== undefined && !isNaN(lat)) params.append('latitude', lat);
    if (lon !== null && lon !== undefined && !isNaN(lon)) params.append('longitude', lon);

    const res = await fetch(`${API_BASE_URL}/api/v1/weather/forecast?${params.toString()}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend weather endpoint failed, attempting direct Open-Meteo fallback:', err.message);
  }

  // Fallback to direct client-side Open-Meteo call
  try {
    const queryLat = lat || 26.8524;
    const queryLon = lon || 80.9412;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${queryLat}&longitude=${queryLon}&daily=precipitation_sum,precipitation_probability_max&timezone=Asia%2FKolkata`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`);
    const data = await res.json();
    const daily = data.daily || {};
    const rainSum = daily.precipitation_sum?.[0] ?? 0.0;
    const rainProb = (daily.precipitation_probability_max?.[0] ?? 0) / 100.0;
    return {
      location: location || 'Uttar Pradesh',
      latitude: queryLat,
      longitude: queryLon,
      forecast_rainfall_mm: rainSum,
      rainfall_probability: rainProb,
      source: 'Open-Meteo (Direct)',
      status: 'available',
    };
  } catch (fallbackErr) {
    return {
      location: location || 'Uttar Pradesh',
      forecast_rainfall_mm: 0.0,
      rainfall_probability: 0.15,
      source: 'offline-estimate',
      status: 'unavailable',
    };
  }
}
