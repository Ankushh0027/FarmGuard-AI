/**
 * FarmGuard AI — Market Insights Benchmark Data
 * Simulated regional APMC mandi rates, historical seasonal price trends, and official CCEA MSP references.
 * 
 * IMPORTANT PROVENANCE NOTICE:
 * This data represents benchmark distributions modeled after historical Agmarknet 
 * (Directorate of Marketing & Inspection, Ministry of Agriculture & Farmers Welfare, GoI) 
 * seasonal price cycles and Cabinet Committee on Economic Affairs (CCEA) MSP notifications.
 * No real-time live trading feed is claimed. No profit or price guarantees are made.
 */

export const SUPPORTED_MARKET_CROPS = [
  {
    id: 'wheat',
    name: 'Wheat (Gehu)',
    icon: '🌾',
    category: 'Rabi Cereal',
    standardUnit: '₹/quintal',
    msp: 2275, // CCEA RMS 2024-25 (RMS 2025-26 announced at 2425)
    mspNextSeason: 2425,
    mspSeason: 'Rabi Marketing Season (RMS 2024-25 / 2025-26)',
    mspSource: 'Cabinet Committee on Economic Affairs (CCEA), Ministry of Agriculture & Farmers Welfare, GoI',
    currentSeasonStatus: 'Pre-Harvest Lean Stock Phase',
    modalAveragePrice: 2410,
    priceDiffMspPercent: '+5.9%',
    marketSummary: 'Firm trading with lean-stock premium above MSP ahead of main Rabi harvest arrivals.',
    farmerInterpretation: 'Modal prices are currently trading ₹85–₹205/quintal above the official CCEA MSP benchmark across major north-central APMCs. Lean warehouse reserves before new harvest arrivals maintain support. Historically, prices moderate towards MSP during peak arrivals in April–May.',
    actionableAdvice: 'If pukka on-farm storage is available, avoid distress selling immediately at harvest peak when supply glut temporarily dampens local spot bids. Ensure grain moisture is tested below 12% before storage.',
    regionalMandis: [
      { name: 'Khanna APMC', state: 'Punjab', modalPrice: 2420, minPrice: 2350, maxPrice: 2490, diffMsp: '+6.4%', arrivalsQuintals: 1450, grade: 'Sharbati / Mill Quality' },
      { name: 'Karnal APMC', state: 'Haryana', modalPrice: 2400, minPrice: 2320, maxPrice: 2460, diffMsp: '+5.5%', arrivalsQuintals: 1200, grade: 'FAQ (HD-2967 / HD-3086)' },
      { name: 'Hardoi APMC', state: 'Uttar Pradesh', modalPrice: 2360, minPrice: 2280, maxPrice: 2410, diffMsp: '+3.7%', arrivalsQuintals: 980, grade: 'Dara Quality' },
      { name: 'Sehore APMC', state: 'Madhya Pradesh', modalPrice: 2480, minPrice: 2380, maxPrice: 2550, diffMsp: '+9.0%', arrivalsQuintals: 820, grade: 'Premium Sharbati' },
      { name: 'Kota APMC', state: 'Rajasthan', modalPrice: 2390, minPrice: 2300, maxPrice: 2450, diffMsp: '+5.1%', arrivalsQuintals: 750, grade: 'Lokwan / Medium' }
    ],
    timeSeries: {
      days30: [
        { date: '12 Mar', modal: 2380, min: 2310, max: 2430 },
        { date: '16 Mar', modal: 2390, min: 2320, max: 2440 },
        { date: '20 Mar', modal: 2385, min: 2315, max: 2435 },
        { date: '24 Mar', modal: 2395, min: 2330, max: 2450 },
        { date: '28 Mar', modal: 2405, min: 2340, max: 2470 },
        { date: '01 Apr', modal: 2415, min: 2350, max: 2480 },
        { date: '05 Apr', modal: 2410, min: 2340, max: 2485 },
        { date: '09 Apr', modal: 2405, min: 2335, max: 2475 },
        { date: '12 Apr', modal: 2410, min: 2340, max: 2490 }
      ],
      days90: [
        { date: '15 Jan', modal: 2340, min: 2280, max: 2390 },
        { date: '30 Jan', modal: 2355, min: 2290, max: 2410 },
        { date: '14 Feb', modal: 2365, min: 2300, max: 2420 },
        { date: '28 Feb', modal: 2375, min: 2310, max: 2430 },
        { date: '15 Mar', modal: 2390, min: 2320, max: 2445 },
        { date: '30 Mar', modal: 2410, min: 2345, max: 2475 },
        { date: '12 Apr', modal: 2410, min: 2340, max: 2490 }
      ],
      months6: [
        { date: 'Oct', modal: 2290, min: 2250, max: 2340 },
        { date: 'Nov', modal: 2310, min: 2260, max: 2360 },
        { date: 'Dec', modal: 2330, min: 2275, max: 2380 },
        { date: 'Jan', modal: 2350, min: 2290, max: 2400 },
        { date: 'Feb', modal: 2370, min: 2305, max: 2425 },
        { date: 'Mar', modal: 2395, min: 2330, max: 2460 },
        { date: 'Apr', modal: 2410, min: 2340, max: 2490 }
      ]
    }
  },
  {
    id: 'paddy',
    name: 'Paddy / Rice (Dhan)',
    icon: '🌾',
    category: 'Kharif Cereal',
    standardUnit: '₹/quintal',
    msp: 2300, // CCEA KMS 2024-25 Common
    mspNextSeason: null,
    mspSeason: 'Kharif Marketing Season (KMS 2024-25)',
    mspSource: 'Cabinet Committee on Economic Affairs (CCEA), Ministry of Agriculture & Farmers Welfare, GoI',
    currentSeasonStatus: 'Post-Harvest Marketing Phase',
    modalAveragePrice: 2350,
    priceDiffMspPercent: '+2.2%',
    marketSummary: 'Stable price band anchored by Food Corporation of India (FCI) MSP procurement.',
    farmerInterpretation: 'Paddy Common prices are tightly anchored around the official CCEA MSP floor of ₹2,300/quintal. Active procurement operations by FCI and state civil supplies corporations ensure farmers rarely need to discount below MSP.',
    actionableAdvice: 'Ensure your paddy meets Fair Average Quality (FAQ) standards: moisture content strictly below 17% and foreign matter below 1% to avoid deductions at official grain procurement stations.',
    regionalMandis: [
      { name: 'Kurukshetra APMC', state: 'Haryana', modalPrice: 2360, minPrice: 2300, maxPrice: 2420, diffMsp: '+2.6%', arrivalsQuintals: 2100, grade: 'PR-126 / FAQ' },
      { name: 'Burdwan APMC', state: 'West Bengal', modalPrice: 2340, minPrice: 2290, maxPrice: 2390, diffMsp: '+1.7%', arrivalsQuintals: 1800, grade: 'Swarna / Common' },
      { name: 'Thanjavur APMC', state: 'Tamil Nadu', modalPrice: 2350, minPrice: 2300, maxPrice: 2410, diffMsp: '+2.2%', arrivalsQuintals: 1600, grade: 'ADT-45 / Ponni' },
      { name: 'Nizamabad APMC', state: 'Telangana', modalPrice: 2380, minPrice: 2310, maxPrice: 2440, diffMsp: '+3.5%', arrivalsQuintals: 1350, grade: 'RNR 15048' },
      { name: 'Gondia APMC', state: 'Maharashtra', modalPrice: 2320, minPrice: 2280, maxPrice: 2370, diffMsp: '+0.9%', arrivalsQuintals: 1150, grade: 'Common Non-Basmati' }
    ],
    timeSeries: {
      days30: [
        { date: '12 Mar', modal: 2335, min: 2290, max: 2380 },
        { date: '16 Mar', modal: 2340, min: 2295, max: 2385 },
        { date: '20 Mar', modal: 2345, min: 2300, max: 2390 },
        { date: '24 Mar', modal: 2350, min: 2300, max: 2400 },
        { date: '28 Mar', modal: 2345, min: 2295, max: 2395 },
        { date: '01 Apr', modal: 2350, min: 2300, max: 2405 },
        { date: '05 Apr', modal: 2355, min: 2305, max: 2410 },
        { date: '09 Apr', modal: 2350, min: 2300, max: 2405 },
        { date: '12 Apr', modal: 2350, min: 2300, max: 2410 }
      ],
      days90: [
        { date: '15 Jan', modal: 2315, min: 2280, max: 2350 },
        { date: '30 Jan', modal: 2320, min: 2285, max: 2360 },
        { date: '14 Feb', modal: 2330, min: 2290, max: 2370 },
        { date: '28 Feb', modal: 2335, min: 2295, max: 2380 },
        { date: '15 Mar', modal: 2340, min: 2300, max: 2390 },
        { date: '30 Mar', modal: 2350, min: 2300, max: 2405 },
        { date: '12 Apr', modal: 2350, min: 2300, max: 2410 }
      ],
      months6: [
        { date: 'Oct', modal: 2295, min: 2260, max: 2330 },
        { date: 'Nov', modal: 2305, min: 2270, max: 2340 },
        { date: 'Dec', modal: 2315, min: 2280, max: 2350 },
        { date: 'Jan', modal: 2325, min: 2285, max: 2365 },
        { date: 'Feb', modal: 2335, min: 2295, max: 2380 },
        { date: 'Mar', modal: 2345, min: 2300, max: 2395 },
        { date: 'Apr', modal: 2350, min: 2300, max: 2410 }
      ]
    }
  },
  {
    id: 'maize',
    name: 'Maize (Makka / Corn)',
    icon: '🌽',
    category: 'Kharif / Rabi Coarse Grain',
    standardUnit: '₹/quintal',
    msp: 2225, // CCEA KMS 2024-25
    mspNextSeason: null,
    mspSeason: 'Kharif Marketing Season (KMS 2024-25)',
    mspSource: 'Cabinet Committee on Economic Affairs (CCEA), PIB Press Release',
    currentSeasonStatus: 'Active Industrial Demand Phase',
    modalAveragePrice: 2370,
    priceDiffMspPercent: '+6.5%',
    marketSummary: 'Robust demand premium supported by poultry feed formulation and ethanol distilleries.',
    farmerInterpretation: 'Maize prices are trading solidly +5% to +8% over MSP across major southern and eastern hubs. Industrial absorption by feed compounders and grain-based distilleries provides consistent price support.',
    actionableAdvice: 'Proper cob drying below 14% moisture is essential. Moisture above 14.5% triggers rapid aflatoxin mold growth, leading to heavy spot price discounts from commercial feed mill buyers.',
    regionalMandis: [
      { name: 'Gulabbagh APMC', state: 'Bihar (Purnia)', modalPrice: 2410, minPrice: 2300, maxPrice: 2490, diffMsp: '+8.3%', arrivalsQuintals: 2400, grade: 'Yellow Hybrid Feed Quality' },
      { name: 'Davanagere APMC', state: 'Karnataka', modalPrice: 2390, minPrice: 2280, maxPrice: 2460, diffMsp: '+7.4%', arrivalsQuintals: 1650, grade: 'Industrial Starch Grade' },
      { name: 'Warangal APMC', state: 'Telangana', modalPrice: 2370, minPrice: 2270, maxPrice: 2440, diffMsp: '+6.5%', arrivalsQuintals: 1250, grade: 'Poultry Grade Yellow' },
      { name: 'Chhindwara APMC', state: 'Madhya Pradesh', modalPrice: 2350, minPrice: 2250, maxPrice: 2420, diffMsp: '+5.6%', arrivalsQuintals: 1100, grade: 'Hybrid Commercial' },
      { name: 'Bahraich APMC', state: 'Uttar Pradesh', modalPrice: 2320, minPrice: 2240, maxPrice: 2390, diffMsp: '+4.3%', arrivalsQuintals: 850, grade: 'Local Desi / Hybrid' }
    ],
    timeSeries: {
      days30: [
        { date: '12 Mar', modal: 2330, min: 2240, max: 2410 },
        { date: '16 Mar', modal: 2345, min: 2250, max: 2425 },
        { date: '20 Mar', modal: 2350, min: 2260, max: 2430 },
        { date: '24 Mar', modal: 2360, min: 2265, max: 2440 },
        { date: '28 Mar', modal: 2365, min: 2270, max: 2450 },
        { date: '01 Apr', modal: 2375, min: 2280, max: 2460 },
        { date: '05 Apr', modal: 2370, min: 2275, max: 2455 },
        { date: '09 Apr', modal: 2365, min: 2270, max: 2450 },
        { date: '12 Apr', modal: 2370, min: 2275, max: 2460 }
      ],
      days90: [
        { date: '15 Jan', modal: 2260, min: 2200, max: 2320 },
        { date: '30 Jan', modal: 2280, min: 2215, max: 2345 },
        { date: '14 Feb', modal: 2305, min: 2230, max: 2370 },
        { date: '28 Feb', modal: 2325, min: 2245, max: 2395 },
        { date: '15 Mar', modal: 2345, min: 2255, max: 2420 },
        { date: '30 Mar', modal: 2370, min: 2275, max: 2450 },
        { date: '12 Apr', modal: 2370, min: 2275, max: 2460 }
      ],
      months6: [
        { date: 'Oct', modal: 2210, min: 2160, max: 2270 },
        { date: 'Nov', modal: 2235, min: 2180, max: 2295 },
        { date: 'Dec', modal: 2255, min: 2200, max: 2315 },
        { date: 'Jan', modal: 2275, min: 2210, max: 2340 },
        { date: 'Feb', modal: 2310, min: 2235, max: 2380 },
        { date: 'Mar', modal: 2350, min: 2260, max: 2430 },
        { date: 'Apr', modal: 2370, min: 2275, max: 2460 }
      ]
    }
  },
  {
    id: 'sugarcane',
    name: 'Sugarcane (Ganna)',
    icon: '🎋',
    category: 'Commercial Cash Crop',
    standardUnit: '₹/quintal',
    msp: 340, // CCEA FRP 2024-25 for basic recovery rate 10.25%
    mspNextSeason: null,
    mspSeason: 'Sugar Season (SS 2024-25 FRP Resolution)',
    mspSource: 'Cabinet Committee on Economic Affairs (CCEA) Fair & Remunerative Price (FRP) Notification',
    currentSeasonStatus: 'Crushing & Cane Dispatch Season',
    modalAveragePrice: 365,
    priceDiffMspPercent: '+7.4% (SAP/Recovery adjusted)',
    marketSummary: 'Statutorily regulated pricing governed by CCEA FRP and northern State Advised Prices (SAP).',
    farmerInterpretation: 'Sugarcane rates are statutorily regulated rather than determined through speculative auction. The national floor is the CCEA Fair and Remunerative Price (₹340/quintal for 10.25% sugar recovery), while major northern states operate under State Advised Prices (SAP ~₹370/quintal in UP).',
    actionableAdvice: 'Deliver cane to the mill gate within 24 hours of cutting. Inversion of sucrose begins rapidly after 24–36 hours of harvest, diminishing sugar recovery and associated incentive payments.',
    regionalMandis: [
      { name: 'Muzaffarnagar Cane Belt', state: 'Uttar Pradesh', modalPrice: 370, minPrice: 360, maxPrice: 370, diffMsp: '+8.8% (SAP)', arrivalsQuintals: 12500, grade: 'Early Maturing (Co-0238 / Co-15023)' },
      { name: 'Meerut Sugar Belt', state: 'Uttar Pradesh', modalPrice: 370, minPrice: 360, maxPrice: 370, diffMsp: '+8.8% (SAP)', arrivalsQuintals: 11200, grade: 'State Advised Price' },
      { name: 'Kolhapur Sugar Cluster', state: 'Maharashtra', modalPrice: 355, minPrice: 340, maxPrice: 365, diffMsp: '+4.4% (Recovery Premium)', arrivalsQuintals: 15000, grade: 'High Recovery (> 11.5% sucrose)' },
      { name: 'Belagavi Sugar Zone', state: 'Karnataka', modalPrice: 348, minPrice: 340, maxPrice: 355, diffMsp: '+2.4% (FRP + Incentive)', arrivalsQuintals: 9800, grade: 'Co-86032 / Recovery Linked' },
      { name: 'Rohtak Cooperative Mill', state: 'Haryana', modalPrice: 386, minPrice: 380, maxPrice: 386, diffMsp: '+13.5% (State SAP)', arrivalsQuintals: 7500, grade: 'Early Variety State SAP' }
    ],
    timeSeries: {
      days30: [
        { date: '12 Mar', modal: 365, min: 340, max: 375 },
        { date: '16 Mar', modal: 365, min: 340, max: 375 },
        { date: '20 Mar', modal: 365, min: 340, max: 375 },
        { date: '24 Mar', modal: 365, min: 340, max: 375 },
        { date: '28 Mar', modal: 365, min: 340, max: 375 },
        { date: '01 Apr', modal: 365, min: 340, max: 375 },
        { date: '05 Apr', modal: 365, min: 340, max: 375 },
        { date: '09 Apr', modal: 365, min: 340, max: 375 },
        { date: '12 Apr', modal: 365, min: 340, max: 375 }
      ],
      days90: [
        { date: '15 Jan', modal: 365, min: 340, max: 375 },
        { date: '30 Jan', modal: 365, min: 340, max: 375 },
        { date: '14 Feb', modal: 365, min: 340, max: 375 },
        { date: '28 Feb', modal: 365, min: 340, max: 375 },
        { date: '15 Mar', modal: 365, min: 340, max: 375 },
        { date: '30 Mar', modal: 365, min: 340, max: 375 },
        { date: '12 Apr', modal: 365, min: 340, max: 375 }
      ],
      months6: [
        { date: 'Oct', modal: 350, min: 335, max: 360 },
        { date: 'Nov', modal: 365, min: 340, max: 375 },
        { date: 'Dec', modal: 365, min: 340, max: 375 },
        { date: 'Jan', modal: 365, min: 340, max: 375 },
        { date: 'Feb', modal: 365, min: 340, max: 375 },
        { date: 'Mar', modal: 365, min: 340, max: 375 },
        { date: 'Apr', modal: 365, min: 340, max: 375 }
      ]
    }
  }
];
