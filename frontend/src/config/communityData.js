/**
 * FarmGuard AI — Community Crop-Risk Intelligence Data
 * Anonymized crowd-sourced reports, regional risk hotspots, and extension service escalation tickets.
 */

export const INITIAL_RISK_HOTSPOTS = [
  {
    id: 'hotspot-1',
    region: 'Punjab (Sangrur & Bathinda Cluster)',
    crop: 'Wheat',
    cropIcon: '🌾',
    threat: 'Yellow Rust (Puccinia striiformis)',
    threatType: 'Fungal Pathogen',
    severity: 'high',
    riskScore: 88,
    reportsCount: 19,
    affectedAcresEst: 450,
    radiusKm: 25,
    officialSource: 'Punjab Agricultural University (PAU) Field Advisory #YR-2026-04',
    lastUpdated: '18 mins ago',
    preventiveAction: 'Inspect flag leaf underside for linear powdery yellow pustules. Suspend overhead sprinkler watering to reduce canopy humidity. Spot-spray Propiconazole 25% EC (0.1%) if disease threshold exceeded.',
    coordinates: { lat: 30.2458, lon: 75.8421 },
    status: 'Active Outbreak'
  },
  {
    id: 'hotspot-2',
    region: 'Maharashtra (Vidarbha & Marathwada Cotton Belt)',
    crop: 'Cotton',
    cropIcon: '☁️',
    threat: 'Pink Bollworm (Pectinophora gossypiella)',
    threatType: 'Pest Infestation',
    severity: 'high',
    riskScore: 84,
    reportsCount: 27,
    affectedAcresEst: 720,
    radiusKm: 35,
    officialSource: 'ICAR-CICR Nagpur & Maharashtra State Agri Dept Alert',
    lastUpdated: '1 hour ago',
    preventiveAction: 'Deploy pheromone traps @ 5 traps/acre for adult monitoring. Regulate irrigation intervals to avoid lush vegetative foliage which attracts oviposition.',
    coordinates: { lat: 20.7453, lon: 78.6022 },
    status: 'Active Outbreak'
  },
  {
    id: 'hotspot-3',
    region: 'Karnataka (Raichur & Tungabhadra Basin)',
    crop: 'Rice / Paddy',
    cropIcon: '🌾',
    threat: 'Paddy Blast (Pyricularia oryzae)',
    threatType: 'Fungal Pathogen',
    severity: 'moderate',
    riskScore: 64,
    reportsCount: 12,
    affectedAcresEst: 280,
    radiusKm: 20,
    officialSource: 'UAS Raichur Regional Research Station Note',
    lastUpdated: '3 hours ago',
    preventiveAction: 'Maintain thin standing water layer (2-3 cm) rather than intermittent drying. Split nitrogen fertilizer applications to prevent succulent tissue susceptibility.',
    coordinates: { lat: 16.2120, lon: 77.3439 },
    status: 'Contained Monitoring'
  },
  {
    id: 'hotspot-4',
    region: 'Uttar Pradesh (Meerut & Muzaffarnagar Cluster)',
    crop: 'Sugarcane',
    cropIcon: '🎋',
    threat: 'Top Borer & Aquifer Water Table Drawdown',
    threatType: 'Pest + Hydrological Stress',
    severity: 'moderate',
    riskScore: 59,
    reportsCount: 9,
    affectedAcresEst: 310,
    radiusKm: 30,
    officialSource: 'UP Council of Sugarcane Research (UPCSR) Advisory',
    lastUpdated: '5 hours ago',
    preventiveAction: 'Transition from flood to alternate furrow irrigation. Inspect shoot whorl for dead hearts. Avoid midday tubewell pumping during peak evaporation hours.',
    coordinates: { lat: 28.9845, lon: 77.7064 },
    status: 'Advisory Warning'
  },
  {
    id: 'hotspot-5',
    region: 'Telangana (Warangal & Khammam Chilli Belt)',
    crop: 'Chilli & Maize',
    cropIcon: '🌶️',
    threat: 'Invasive Black Thrips (Thrips parvispinus)',
    threatType: 'Pest Infestation',
    severity: 'high',
    riskScore: 91,
    reportsCount: 34,
    affectedAcresEst: 890,
    radiusKm: 40,
    officialSource: 'PJTSAU Hyderabad Crop Protection Cell',
    lastUpdated: '35 mins ago',
    preventiveAction: 'Erect blue sticky traps (25 traps/acre). Implement drip micro-irrigation to maintain uniform soil moisture without splashing leaf foliage.',
    coordinates: { lat: 17.9689, lon: 79.5941 },
    status: 'Active Outbreak'
  }
];

export const INITIAL_COMMUNITY_REPORTS = [
  {
    id: 'rep-101',
    farmerHash: 'Farmer_PB_841',
    cluster: 'Sangrur Cluster #42 (Punjab)',
    crop: 'Wheat (HD-3086)',
    cropCategory: 'wheat',
    acreage: 4.5,
    threatType: 'Fungal Pathogen',
    threatTitle: 'Yellow streak pustules after dense morning dew',
    description: 'Found bright yellow powdery stripes running along leaf blades in 2 acres near canal line. Neighboring wheat fields also showing similar symptoms after 3 cold foggy nights.',
    severity: 'high',
    confirmedByCount: 16,
    userHasUpvoted: false,
    timestamp: '14 minutes ago',
    aiTriage: {
      matchScore: 92,
      suspectedCause: 'Puccinia striiformis (Yellow Rust)',
      confidence: 'High (Pattern matches PAU bulletin)',
      recommendedWaterAdvice: 'Avoid overhead sprinkler watering; keep field surface well-drained.'
    },
    status: 'Community Confirmed',
    escalatedToKvk: true
  },
  {
    id: 'rep-102',
    farmerHash: 'Farmer_MH_209',
    cluster: 'Yavatmal Cluster #18 (Vidarbha, MH)',
    crop: 'Cotton (Bt Rasi)',
    cropCategory: 'cotton',
    acreage: 6.0,
    threatType: 'Pest Infestation',
    threatTitle: 'Rosette flowers and entry holes in mid-season green bolls',
    description: 'Noticed flower rosette formation and premature boll dropping in mid-canopy. Pheromone trap counts exceeded 8 moths per night across 3 consecutive days.',
    severity: 'high',
    confirmedByCount: 23,
    userHasUpvoted: false,
    timestamp: '52 minutes ago',
    aiTriage: {
      matchScore: 89,
      suspectedCause: 'Pectinophora gossypiella (Pink Bollworm)',
      confidence: 'High',
      recommendedWaterAdvice: 'Moderate irrigation schedule; avoid excessive nitrogen fertilizer.'
    },
    status: 'Community Confirmed',
    escalatedToKvk: true
  },
  {
    id: 'rep-103',
    farmerHash: 'Farmer_KA_512',
    cluster: 'Sindhanur Cluster #07 (Karnataka)',
    crop: 'Rice (Sona Masoori)',
    cropCategory: 'rice',
    acreage: 3.5,
    threatType: 'Fungal Pathogen',
    threatTitle: 'Spindle lesions with grey centers appearing on leaves',
    description: 'Boat-shaped brownish lesions on upper leaves near water inlet side. Mild leaf collar rot beginning to show during tillering stage.',
    severity: 'moderate',
    confirmedByCount: 11,
    userHasUpvoted: false,
    timestamp: '2 hours ago',
    aiTriage: {
      matchScore: 78,
      suspectedCause: 'Pyricularia oryzae (Rice Blast)',
      confidence: 'Moderate',
      recommendedWaterAdvice: 'Keep 2-3 cm standing water; delay second urea top-dress until weather clears.'
    },
    status: 'Community Confirmed',
    escalatedToKvk: false
  },
  {
    id: 'rep-104',
    farmerHash: 'Farmer_UP_304',
    cluster: 'Barabanki Cluster #12 (Uttar Pradesh)',
    crop: 'Wheat (PBW-502)',
    cropCategory: 'wheat',
    acreage: 2.0,
    threatType: 'Hydrological Stress',
    threatTitle: 'Borewell water discharge reduced by 40% in two weeks',
    description: 'Tubewell discharge rate dropped from 30,000 L/hr to roughly 18,000 L/hr. Sandy loam patch drying faster than normal; soil moisture down to 28%.',
    severity: 'moderate',
    confirmedByCount: 7,
    userHasUpvoted: false,
    timestamp: '4 hours ago',
    aiTriage: {
      matchScore: 71,
      suspectedCause: 'Local Water Table Drop / Pump Cavitation',
      confidence: 'Moderate',
      recommendedWaterAdvice: 'Implement alternate border flooding or pulse irrigation to stretch limited discharge.'
    },
    status: 'Verifying',
    escalatedToKvk: false
  },
  {
    id: 'rep-105',
    farmerHash: 'Farmer_TS_993',
    cluster: 'Warangal Rural Cluster #31 (Telangana)',
    crop: 'Maize (Hybrid Pioneer)',
    cropCategory: 'maize',
    acreage: 5.0,
    threatType: 'Pest Infestation',
    threatTitle: 'Whorl feeding and sawdust frass on central shoot',
    description: 'Shot holes on opened leaves and heavy frass in central whorls across 2 acres. Young larvae found feeding inside whorls at knee-high growth stage.',
    severity: 'high',
    confirmedByCount: 19,
    userHasUpvoted: false,
    timestamp: '6 hours ago',
    aiTriage: {
      matchScore: 94,
      suspectedCause: 'Spodoptera frugiperda (Fall Armyworm)',
      confidence: 'Very High',
      recommendedWaterAdvice: 'Maintain healthy plant vigor; avoid waterlogging stress.'
    },
    status: 'Community Confirmed',
    escalatedToKvk: true
  }
];

export const INITIAL_ESCALATION_TICKETS = [
  {
    id: 'ESC-2026-089',
    reportId: 'rep-101',
    cluster: 'Sangrur Cluster #42 (Punjab)',
    crop: 'Wheat (4.5 ac)',
    threat: 'Yellow Rust Outbreak Cluster',
    assignedExpert: 'Dr. H. S. Dhillon (Senior Agronomist, KVK Sangrur)',
    assignedAuthority: 'Krishi Vigyan Kendra & Dept of Agriculture, Punjab',
    priority: 'Urgent',
    status: 'In Field Triage',
    slaTimeRemaining: '3 hrs 45 mins',
    dateCreated: 'Today, 08:30 AM',
    aiPreliminaryAssessment: 'Symptom geometry and regional meteorological conditions (fog + 14°C temp) strongly favor rapid urediniospore dispersal. Urgent extension notice required before jointing stage.',
    statusSteps: [
      { step: 'Report Logged', done: true, time: '08:30 AM' },
      { step: 'AI Triage Validated', done: true, time: '08:32 AM' },
      { step: 'KVK Agronomist Assigned', done: true, time: '09:15 AM' },
      { step: 'Field Inspection / Advisory', done: false, time: 'Expected 01:00 PM' }
    ]
  },
  {
    id: 'ESC-2026-074',
    reportId: 'rep-102',
    cluster: 'Yavatmal Cluster #18 (Vidarbha, MH)',
    crop: 'Cotton (6.0 ac)',
    threat: 'Pink Bollworm Trap Count Breach',
    assignedExpert: 'Dr. Pravin Deshmukh (Entomologist, KVK Yavatmal)',
    assignedAuthority: 'CICR Extension Cell & District Agri Office',
    priority: 'Urgent',
    status: 'Field Sample Dispatched',
    slaTimeRemaining: '1 hr 20 mins',
    dateCreated: 'Today, 07:15 AM',
    aiPreliminaryAssessment: 'Moth capture rates exceed Economic Threshold Level (ETL > 8 moths/trap/night). Recommends trichogramma egg parasitoids release + synchronized cluster mating disruption.',
    statusSteps: [
      { step: 'Report Logged', done: true, time: '07:15 AM' },
      { step: 'AI Triage Validated', done: true, time: '07:18 AM' },
      { step: 'KVK Agronomist Assigned', done: true, time: '07:45 AM' },
      { step: 'Field Inspection / Advisory', done: true, time: '09:30 AM' }
    ]
  },
  {
    id: 'ESC-2026-061',
    reportId: 'rep-104',
    cluster: 'Meerut Cluster #09 (Uttar Pradesh)',
    crop: 'Sugarcane (8.0 ac)',
    threat: 'Borewell Salinity Spike (TDS > 3400 ppm)',
    assignedExpert: 'Er. R. K. Sharma (Hydrogeologist, CGWB Northern Region)',
    assignedAuthority: 'Central Ground Water Board (CGWB) Liaison Cell',
    priority: 'Normal',
    status: 'Official Advisory Issued',
    slaTimeRemaining: 'Completed',
    dateCreated: 'Yesterday, 02:40 PM',
    aiPreliminaryAssessment: 'Subsurface aquifer brackish water intrusion detected following consecutive dry pumping cycles.',
    resolutionNotes: 'Official Advisory #CGWB-2026-19 issued: Transition farm to micro-sprinkler and blend 50% canal water with tubewell supply. Gypsum soil amendment recommended.',
    statusSteps: [
      { step: 'Report Logged', done: true, time: 'Yesterday' },
      { step: 'AI Triage Validated', done: true, time: 'Yesterday' },
      { step: 'KVK Agronomist Assigned', done: true, time: 'Yesterday' },
      { step: 'Field Inspection / Advisory', done: true, time: 'Resolved' }
    ]
  }
];
