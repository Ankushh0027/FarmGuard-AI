/**
 * FarmGuard AI — Centralized Plain-Language UX & Agricultural Dictionary
 * 
 * Provides accessible, farmer-friendly plain English, Roman Hinglish, and Devanagari Hindi text
 * without third-party i18n bloat.
 */

export const TRANSLATIONS = {
  english: {
    // Nav & Headers
    appName: "FarmGuard AI",
    appTagline: "Smart Water & Field Decisions for Indian Farmers",
    navFarmerDecisions: "FARMER DECISIONS",
    navSystem: "SYSTEM & DETAILS",
    navHome: "Home Dashboard",
    navFarms: "My Farms & Fields",
    navCropHealth: "Crop Health",
    navIrrigation: "Irrigation Management",
    navWaterNeed: "Check Water Need",
    navAdvisor: "AI Farm Advisor",
    navWeather: "Weather Analytics",
    navCropSoil: "Crop & Soil Guide",
    navCommunity: "Community Crop Alerts",
    navMarket: "Market Insights",
    navAlerts: "Alerts & Notifications",
    navSavings: "Water & Money Saved",
    navReports: "My Field Reports",
    navSettings: "Settings & Preferences",
    navSecurity: "Field Safety Rules",
    navEvaluation: "Accuracy & Testing",
    navArchitecture: "How It Works",
    navAbout: "About FarmGuard",

    // Page Titles & Subtitles
    overviewTitle: "Farm Overview & Intelligence Dashboard",
    overviewSubtitle: "Precision crop monitoring, soil moisture status, and deterministic irrigation guidance.",
    farmsTitle: "My Farms & Field Management",
    farmsSubtitle: "Manage your different plots of land, crop stages, and pump settings in one place.",
    cropHealthTitle: "Crop Health & Disease Intelligence",
    cropHealthSubtitle: "NDVI canopy health, disease risk forecasting, and FAO-56 stage progression.",
    irrigationTitle: "Irrigation & Precision Water Management",
    irrigationSubtitle: "Deterministic crop water requirement, optimal pumping schedule, and conservation metrics.",
    cropSoilTitle: "Crop & Soil Agronomic Guide",
    cropSoilSubtitle: "Detailed growth stages, water requirements, and soil characteristics for Indian agriculture.",
    analysisTitle: "Field Water Need Calculator",
    analysisSubtitle: "Enter your crop, land size, and soil to calculate the exact litres of water and pump hours needed.",
    advisorTitle: "FarmGuard AI Farm Advisor",
    advisorSubtitle: "Context-aware conversational intelligence for crop protection, soil management, and water timing.",
    weatherTitle: "Weather & Agro-Meteorological Analytics",
    weatherSubtitle: "High-resolution 7-day precipitation, temperature curves, and spray-window forecasting.",
    alertsTitle: "Alerts & Real-Time Farm Notifications",
    alertsSubtitle: "Actionable weather warnings, disease transmission alerts, and pump advisories.",
    savingsTitle: "Water, Electricity & Money Saved",
    savingsSubtitle: "See how much groundwater, tubewell running time, and electricity bill you save with smart irrigation.",
    settingsTitle: "Settings & System Preferences",
    settingsSubtitle: "Customize language, tubewell pump defaults, electricity rates, and access diagnostics.",
    communityTitle: "Community Crop & Pest Alerts",
    communitySubtitle: "Nearby crop disease reports, weather alerts, and Krishi Vigyan Kendra (KVK) advisories.",
    marketTitle: "Market Insights & Mandi Prices",
    marketSubtitle: "Live agricultural mandi rates, government MSP comparison, and harvest arrival trends.",
    activityTitle: "My Field Activity Records",
    activitySubtitle: "Past calculations, water checks, and advisor conversations saved for your reference.",
    securityTitle: "Safety Guardrails & Field Protection",
    securitySubtitle: "How FarmGuard protects farmers by verifying all advice against agricultural guidelines.",
    evaluationTitle: "Accuracy & Performance Benchmarks",
    evaluationSubtitle: "Tested against real Indian farm conditions and ICAR agricultural standards.",
    architectureTitle: "How FarmGuard Calculates Water Need",
    architectureSubtitle: "Step-by-step scientific calculations explained in simple words.",
    aboutTitle: "About FarmGuard AI",
    aboutSubtitle: "Our mission to save groundwater and increase farmer income across India.",

    // Dashboard KPIs
    kpiSoilMoisture: "WATER IN THE SOIL",
    kpiSoilMoistureOptimal: "Good moisture • No water needed today",
    kpiSoilMoistureDry: "Dry soil • Irrigation recommended",
    kpiSoilMoistureWet: "Wet / Saturated • Do not irrigate",
    kpiWaterSaved: "WATER SAVED",
    kpiWaterSavedSubtext: "Up to 35% saved compared to open flood irrigation",
    kpiPumpHoursSaved: "PUMP HOURS SAVED",
    kpiPumpHoursSavedSubtext: "Based on standard 5 HP tubewell pump",
    kpiRiskAlerts: "CROP & PEST ALERTS",
    kpiRiskAlertsSubtext: "Verified alerts from agricultural extension and local farmers",

    // Explanations for unfamiliar features
    explainSoilMoisture: "Shows how much water is currently in your soil. If you don't have a sensor, use the 6-inch hand-ball test.",
    explainRainForecast: "Based on weather forecasts. If rain is coming, you can keep the pump off and let nature water your crop.",
    explainWaterRequirement: "Calculated from your field size, soil type, and crop water requirement.",
    explainPumpRuntime: "How long to run your tubewell pump based on the water needed and your pump's flow rate.",
    explainAdvisor: "Ask questions about your crop, watering, soil, fertilizers, or pest attacks in your own language.",
    explainAnalysis: "Enter your crop and field details to get an accurate watering plan and pump runtime.",

    // Form Field Labels & Explanations
    cropSelection: "1. Choose Your Crop",
    cropSelectionDesc: "Select the crop you are growing in your field.",
    fieldDetails: "2. Land Size & Soil Type",
    fieldAreaLabel: "Field Size in Acres",
    fieldAreaPlaceholder: "e.g., 2.0 or 1.5",
    fieldAreaHelper: "How many acres is this plot? (1 acre = ~40 guntha / 43,560 sq ft / ~4–5 bigha)",
    soilTypeLabel: "Soil Type (Mitti Ka Prakaar)",
    soilTypeHelper: "Select the soil in your field (Alluvial, Loam, Sandy Loam, Clay, or Black soil).",
    moistureWeather: "3. Soil Moisture & Rain Forecast",
    soilMoistureLabel: "Current Soil Moisture (%)",
    soilMoistureHelper: "Don't have a sensor? Use the 6-inch hand-feel ball test: crumbly soil = <40%, holds ball shape = 55–65%, muddy = >80%.",
    rainProbLabel: "Rain Probability (%)",
    rainProbHelper: "Chance of rain in the next 24 hours. Above 60%? Hold off on pumping!",
    rainForecastLabel: "Expected Rainfall (mm)",
    rainForecastHelper: "Expected rain depth in millimetres. Rain reduces your pump requirement.",
    pumpSection: "4. Tubewell Pump Flow (Optional)",
    pumpFlowLabel: "Pump Flow Rate (Litres per Minute)",
    pumpFlowHelper: "Leave blank if you don't know; we will assume a standard 5 HP pump (~460 L/min).",
    calculateBtn: "Calculate Water Need",
    calculatingBtn: "Calculating Water Requirement...",

    // Actions & Decisions
    decisionWater: "Irrigate According to Soil Need",
    decisionWaitRain: "Wait: Rain Expected — Keep Pump Off",
    decisionWaitMoisture: "No Irrigation Needed Today — Soil is Moist",
    decisionReduce: "Apply Reduced Irrigation Depth",
    whyThisMatters: "Why this matters:",
    nextAction: "Recommended Action:",

    // Field Management
    addField: "Add New Field",
    editField: "Edit Field",
    deleteField: "Delete Field",
    activeField: "Active Field",
    switchToField: "Switch to this field",
    fieldName: "Field Name / Plot Nickname",
    fieldNamePlaceholder: "e.g., North Tubewell Plot",
    saveField: "Save Field Profile",
    confirmDelete: "Are you sure you want to delete this field?",
    atLeastOneField: "You must have at least one farm field.",
    recommendedAction: "Recommended Action",
    tubewellPumpHours: "Tubewell Pump Hours",
    waterVolume: "Water Volume",
    moistureStatus: "Moisture Status",
    goodMoisture: "Good Moisture",
    drySoil: "Dry Soil",
    wetSoil: "Wet / Saturated",
    switchSuccess: "Switched active field to",
    fieldAdded: "New field added successfully",
    fieldUpdated: "Field details updated",
    fieldDeleted: "Field removed",

    // Results
    depthNeeded: "Water Depth Needed",
    totalWaterNeeded: "Total Water Needed",
    pumpRuntime: "Tubewell Pump Runtime",
    stubbleAdvice: "Crop Residue / Stubble Advice",
    demoBadge: "Demo Preset",
    liveBadge: "Connected to Server",
    offlineBadge: "Offline Calculation Engine",

    // Errors
    errNetwork: "Please check your internet connection and try again.",
    errServerBusy: "Advisor is temporarily busy. Please try again in a few moments.",
    errSelectCrop: "Please select your crop (Wheat, Rice, Maize, or Sugarcane).",
    errValidArea: "Please enter a valid field size greater than 0 (e.g., 1.5, 2.0 acres).",
    errValidMoisture: "Please enter soil moisture between 0% and 100%.",

    // Common
    language: "Language",
    acres: "Acres",
    litres: "Litres",
    minutes: "minutes",
    hours: "hours",
    reset: "Reset",
    send: "Send",
    stop: "Stop",
    cancel: "Cancel",
    today: "Today",
    statusOnline: "Live Server",
    statusOffline: "Offline Mode",
    guardrailsPill: "Crop Safety Active"
  },

  hinglish: {
    // Nav & Headers
    appName: "FarmGuard AI",
    appTagline: "Kisan Ke Liye Sahi Paani Aur Khet Ki Salah",
    navFarmerDecisions: "KISAN KE FAISLE",
    navSystem: "SYSTEM JAANKARI",
    navHome: "Home Dashboard",
    navFarms: "Mere Khet (My Fields)",
    navCropHealth: "Fasal Health & Keet",
    navIrrigation: "Irrigation Management",
    navWaterNeed: "Paani Ki Zaroorat Check Karein",
    navAdvisor: "Kheti Salah (AI Advisor)",
    navWeather: "Weather Analytics",
    navCropSoil: "Fasal Aur Mitti Guide",
    navCommunity: "Aas-Paas Ke Khet Alerts",
    navMarket: "Market Insights & Mandi",
    navAlerts: "Alerts & Notifications",
    navSavings: "Paani Aur Kharcha Bachat",
    navReports: "Meri Khet Reports",
    navSettings: "Settings Aur Bhasha",
    navSecurity: "Fasal Suraksha Niyam",
    navEvaluation: "Jaanch Aur Accuracy",
    navArchitecture: "Yeh Kaise Kaam Karta Hai",
    navAbout: "FarmGuard Ke Baare Mein",

    // Page Titles & Subtitles
    overviewTitle: "Khet Ki Jaankari Aur Aaj Ka Faisla",
    overviewSubtitle: "Mitti ki nami, aaj paani dena chahiye ya nahi, aur tubewell pump ka time aasan shabdo me dekhein.",
    farmsTitle: "Mere Khet Aur Plot Management",
    farmsSubtitle: "Apne alag-alag khet, fasal aur pump ki details ek jagah sambhalein.",
    cropHealthTitle: "Fasal Health Aur Rog Risk",
    cropHealthSubtitle: "NDVI canopy health, rog aane ka risk aur fasal ki growth stages ka hisaab.",
    irrigationTitle: "Irrigation & Paani Management",
    irrigationSubtitle: "Khet ke liye exact paani, pump running time aur bijli bachat ki calculation.",
    cropSoilTitle: "Fasal Aur Mitti Ki Guide",
    cropSoilSubtitle: "Fasal ki alag-alag stage, paani ki zaroorat aur mitti ki pehchan aasan bhasha me.",
    analysisTitle: "Khet Ke Paani Ki Zaroorat Ka Calculator",
    analysisSubtitle: "Apni fasal, khet ka size aur mitti batayein. FarmGuard exact litres aur pump running time calculate karega.",
    advisorTitle: "FarmGuard Krishi Salahkar (AI Copilot)",
    advisorSubtitle: "Fasal, paani, mitti, khad ya bimari ke baare me apni bhasha me sawaal poochein.",
    weatherTitle: "Weather Aur Baarish Analytics",
    weatherSubtitle: "Aane wale 7 dino ki baarish dekh kar decide karein ki tubewell chalana hai ya spray karna hai.",
    alertsTitle: "Khet Alerts Aur Zaruri Suchnayein",
    alertsSubtitle: "Mausam chetavni, keede/rog ke alerts aur pump advisory ek jagah.",
    savingsTitle: "Paani, Bijli Aur Paise Ki Bachat",
    savingsSubtitle: "Dekhein kitna ground water bacha, pump kitne ghante kam chala, aur bijli ke bill me kitne rupaye bache.",
    settingsTitle: "Settings Aur Pasand",
    settingsSubtitle: "Bhasha, tubewell pump ki capacity aur bijli ka rate set karein.",
    communityTitle: "Aas-Paas Ke Khet Aur Rog Alerts",
    communitySubtitle: "Kareebi khet alerts, keede/bimari ki chetavni aur Krishi Vigyan Kendra (KVK) ki practical salah.",
    marketTitle: "Mandi Bhaav Aur Sarkari MSP",
    marketSubtitle: "Mandi ke taaza modal bhaav aur sarkar ka official Minimum Support Price (MSP).",
    activityTitle: "Khet Ki Puraani Reports",
    activitySubtitle: "Pehle kiye gaye hisaab-kitaab aur kheti salah ka record.",
    securityTitle: "Fasal Suraksha Aur Sahi Salah Niyam",
    securitySubtitle: "FarmGuard ki har salah ICAR aur krishi guidelines ke mutabik check hoti hai.",
    evaluationTitle: "Accuracy Aur Testing Report",
    evaluationSubtitle: "Bharat ke asli kheto aur krishi anudan ke anusaar test kiya gaya.",
    architectureTitle: "FarmGuard Calculation Ka Tareeka",
    architectureSubtitle: "Paani aur pump ka hisaab-kitaab kaise hota hai, aasan bhasha me samjhein.",
    aboutTitle: "FarmGuard AI Ke Baare Mein",
    aboutSubtitle: "Kisan ka paani bachana aur fasal ki aamadni badhana hamara lakshya hai.",

    // Dashboard KPIs
    kpiSoilMoisture: "MITTI MEIN NAMI (MOISTURE)",
    kpiSoilMoistureOptimal: "Paryapt nami • Aaj paani dene ki zaroorat nahi hai",
    kpiSoilMoistureDry: "Mitti sookh rahi hai • Halka paani lagayein",
    kpiSoilMoistureWet: "Khet me paryapt paani hai • Pump na chalayein",
    kpiWaterSaved: "PAANI KI BACHAT",
    kpiWaterSavedSubtext: "Andhadhundh paani bahaane ke muqable 35% tak ki bachat",
    kpiPumpHoursSaved: "PUMP KA BACHA SAMAY",
    kpiPumpHoursSavedSubtext: "Standard 5 HP tubewell discharge ke hisaab se",
    kpiRiskAlerts: "KHET AUR ROG ALERTS",
    kpiRiskAlertsSubtext: "KVK aur aas-paas ke verified kisano ke taaza alerts",

    // Explanations for unfamiliar features
    explainSoilMoisture: "Isse pata chalta hai ki mitti mein kitni nami hai. Agar sensor nahi hai, toh mitti ka gola test karein.",
    explainRainForecast: "Yeh mausam ke anuman par based hai. Baarish aane se tubewell chalane ki zaroorat kam ho sakti hai.",
    explainWaterRequirement: "Yeh aapke khet ke area aur fasal ki zaroorat ke hisaab se nikala gaya anuman hai.",
    explainPumpRuntime: "Pump kitni der chalana hai, yeh paani ki zaroorat aur pump ke flow rate par depend karta hai.",
    explainAdvisor: "Apni fasal, paani, mitti ya khad ke baare mein apni bhasha mein sawaal poochein.",
    explainAnalysis: "Fasal aur khet ki jaankari bharein. App uplabdh data ke hisaab se kheti ki salah dega.",

    // Form Field Labels & Explanations
    cropSelection: "1. Apni Fasal Chunein",
    cropSelectionDesc: "Aapne khet me kaun si fasal bo rakhi hai?",
    fieldDetails: "2. Khet Ka Size Aur Mitti Ka Prakaar",
    fieldAreaLabel: "Khet Ka Size (Acres mein)",
    fieldAreaPlaceholder: "jaise 2.0 ya 1.5",
    fieldAreaHelper: "Aapka yeh khet kitne acre ka hai? (1 acre = lagbhag 40 guntha / 4–5 bigha alag alag ilaqo ke hisab se)",
    soilTypeLabel: "Khet Ki Mitti Kaisi Hai?",
    soilTypeHelper: "Apne khet ki mitti chunein (Jalodh/Alluvial, Domat/Loam, Balui Domat, Chikni mitti, ya Kaali mitti).",
    moistureWeather: "3. Mitti Ki Nami Aur Baarish",
    soilMoistureLabel: "Mitti Mein Nami (%)",
    soilMoistureHelper: "Sensor nahi hai? Mitti ka gola bana kar check karein: mitti bikhar jaye toh <40%, gola bane toh 55–65%, keechad bane toh >80%.",
    rainProbLabel: "Baarish Hone Ki Sambhavna (%)",
    rainProbHelper: "Agle 24 ghante me baarish ka chance. 60% se zyada ho toh pump na chalayein!",
    rainForecastLabel: "Kitni Baarish Ka Anuman Hai (mm)",
    rainForecastHelper: "Aane wali baarish (millimetres me). Baarish aane se pump chalane ki zaroorat kam ho jati hai.",
    pumpSection: "4. Tubewell Pump Ki Jaankari (Optional)",
    pumpFlowLabel: "Pump Ka Paani Flow (Litres Per Minute)",
    pumpFlowHelper: "Agar nahi pata toh khaali chhod dein; app 5 HP standard tubewell (~460 L/min) maan kar calculate karega.",
    calculateBtn: "Khet Ke Paani Ki Jaankari Nikalein",
    calculatingBtn: "Calculations ho rahi hain...",

    // Actions & Decisions
    decisionWater: "Khet me halka paani lagayein",
    decisionWaitRain: "Rukein: Baarish aane wali hai — Pump band rakhein",
    decisionWaitMoisture: "Aaj paani na dein — Mitti me achhi nami hai",
    decisionReduce: "Kam paani dein (halki sinchai)",
    whyThisMatters: "Yeh kyun zaroori hai:",
    nextAction: "Kisan ke liye agla kadam:",

    // Field Management
    addField: "Naya Khet Jodein",
    editField: "Khet Badlein",
    deleteField: "Khet Hatayein",
    activeField: "Selected Khet",
    switchToField: "Is khet ko chunein",
    fieldName: "Khet Ka Naam / Pehchan",
    fieldNamePlaceholder: "jaise Uttar Tubewell Plot",
    saveField: "Khet Save Karein",
    confirmDelete: "Kya aap is khet ko hatana chahte hain?",
    atLeastOneField: "Kam se kam ek khet hona zaroori hai.",
    recommendedAction: "Kisan Ke Liye Salah",
    tubewellPumpHours: "Tubewell Pump Chalane Ka Samay",
    waterVolume: "Paani Ki Maatra",
    moistureStatus: "Nami Ki Sthiti",
    goodMoisture: "Paryapt Nami",
    drySoil: "Mitti Sookh Rahi Hai",
    wetSoil: "Paryapt Paani Hai",
    switchSuccess: "Ab active khet hai:",
    fieldAdded: "Naya khet jud gaya",
    fieldUpdated: "Khet ki jaankari update ho gayi",
    fieldDeleted: "Khet hata diya gaya",

    // Results
    depthNeeded: "Paani Ki Gehrai (mm)",
    totalWaterNeeded: "Poore Khet Ka Paani (Litres)",
    pumpRuntime: "Tubewell Pump Chalane Ka Samay",
    stubbleAdvice: "Parali / Danthal Sambhalne Ka Tareeka",
    demoBadge: "Demo Udaharan",
    liveBadge: "Server Se Connected",
    offlineBadge: "Offline Calculation Engine",

    // Errors
    errNetwork: "Internet connection check karein aur dobara koshish karein.",
    errServerBusy: "Abhi salah nahi mil pa rahi. Thodi der baad dobara koshish karein.",
    errSelectCrop: "Kripya apni fasal chunein (Gehun, Dhaan, Makka ya Ganna).",
    errValidArea: "Khet ka size 0 se zyada bharein (jaise 1.5 ya 2 acre).",
    errValidMoisture: "Mitti ki nami 0% se 100% ke beech darj karein.",

    // Common
    language: "Bhasha",
    acres: "Acres",
    litres: "Litres",
    minutes: "minute",
    hours: "ghante",
    reset: "Reset Karein",
    send: "Bhejein",
    stop: "Rokein",
    cancel: "Cancel",
    today: "Aaj",
    statusOnline: "Online Server",
    statusOffline: "Offline Mode",
    guardrailsPill: "Fasal Suraksha Active"
  },

  hindi: {
    // Nav & Headers
    appName: "FarmGuard AI",
    appTagline: "भारतीय किसानों के लिए सटीक पानी व फसल निर्णय",
    navFarmerDecisions: "किसान के निर्णय",
    navSystem: "सिस्टम विवरण",
    navHome: "मुख्य डैशबोर्ड",
    navFarms: "मेरे खेत (फील्ड्स)",
    navCropHealth: "फसल स्वास्थ्य व कीट",
    navIrrigation: "सिंचाई प्रबंधन",
    navWaterNeed: "पानी की जरूरत जांचें",
    navAdvisor: "AI कृषि सलाहकार",
    navWeather: "मौसम एनालिटिक्स",
    navCropSoil: "फसल व मिट्टी गाइड",
    navCommunity: "क्षेत्रीय फसल अलर्ट",
    navMarket: "मार्केट व मंडी भाव",
    navAlerts: "अलर्ट व सूचनाएं",
    navSavings: "पानी व पैसे की बचत",
    navReports: "खेत की रिपोर्ट्स",
    navSettings: "सेटिंग्स व प्राथमिकताएं",
    navSecurity: "फसल सुरक्षा नियम",
    navEvaluation: "जांच व सटीकता",
    navArchitecture: "यह कैसे काम करता है",
    navAbout: "FarmGuard के बारे में",

    // Page Titles & Subtitles
    overviewTitle: "खेत की स्थिति और आज का निर्णय",
    overviewSubtitle: "मिट्टी की नमी, आज पानी देना चाहिए या नहीं, और पंप चलाने का समय आसान शब्दों में देखें।",
    farmsTitle: "मेरे खेत व फील्ड प्रबंधन",
    farmsSubtitle: "अपने अलग-अलग खेत, फसल व ट्यूबवेल की जानकारी एक जगह प्रबंधित करें।",
    cropHealthTitle: "फसल स्वास्थ्य व कीट निगरानी",
    cropHealthSubtitle: "NDVI स्वास्थ्य, कीट-रोग जोखिम पूर्वानुमान और FAO-56 विकास चरण।",
    irrigationTitle: "सिंचाई व जल प्रबंधन",
    irrigationSubtitle: "खेत के लिए सटीक पानी, ट्यूबवेल पंप चलाने का समय और भूजल बचत।",
    cropSoilTitle: "फसल व मिट्टी कृषि गाइड",
    cropSoilSubtitle: "फसल के विभिन्न चरण, पानी की आवश्यकता और मिट्टी की पहचान आसान भाषा में।",
    analysisTitle: "फसल के पानी की जरूरत का कैलकुलेटर",
    analysisSubtitle: "अपनी फसल, खेत का आकार और मिट्टी बताएं। FarmGuard सही पानी (लीटर) और पंप का समय बताएगा।",
    advisorTitle: "FarmGuard AI कृषि सलाहकार",
    advisorSubtitle: "अपनी फसल, सिंचाई, मिट्टी, खाद या कीट-रोग के बारे में अपनी भाषा में पूछें।",
    weatherTitle: "मौसम व कृषि-मौसम विज्ञान",
    weatherSubtitle: "अगले 7 दिनों की बारिश, तापमान और स्प्रे अनुकूल समय का सटीक अनुमान।",
    alertsTitle: "खेत अलर्ट व आपातकालीन सूचनाएं",
    alertsSubtitle: "मौसम चेतावनी, कीट-रोग प्रसार अलर्ट और सिंचाई सलाह का लाइव केंद्र।",
    savingsTitle: "पानी, बिजली और पैसे की बचत",
    savingsSubtitle: "देखें कितना भूजल बचा, पंप कितने घंटे कम चला और बिजली के बिल में कितने रुपये की बचत हुई।",
    settingsTitle: "सेटिंग्स व प्राथमिकताएं",
    settingsSubtitle: "भाषा, ट्यूबवेल पंप क्षमता, बिजली दर तय करें और सिस्टम विवरण देखें।",
    communityTitle: "क्षेत्रीय फसल व कीट अलर्ट",
    communitySubtitle: "आस-पास के किसानों के अलर्ट, कीट-रोग की चेतावनी और कृषि विज्ञान केंद्र (KVK) की सलाह।",
    marketTitle: "मंडी भाव और सरकारी समर्थन मूल्य (MSP)",
    marketSubtitle: "मंडी के ताजा मॉडल भाव और सरकार का आधिकारिक न्यूनतम समर्थन मूल्य (MSP)।",
    activityTitle: "खेत की पिछली रिपोर्ट्स",
    activitySubtitle: "पहले की गई गणनाओं और कृषि सलाह का पूरा रिकॉर्ड।",
    securityTitle: "फसल सुरक्षा व दिशा-निर्देश",
    securitySubtitle: "FarmGuard की सभी सलाह कृषि विज्ञान केंद्र के मानकों के अनुरूप जांची जाती हैं।",
    evaluationTitle: "सटीकता व मॉडल परीक्षण",
    evaluationSubtitle: "भारतीय कृषि परिस्थितियों और ICAR मानकों पर सत्यापित।",
    architectureTitle: "गणना का तरीका व कार्यप्रणाली",
    architectureSubtitle: "पानी और पंप के समय की गणना कैसे की जाती है, आसान भाषा में समझें।",
    aboutTitle: "FarmGuard AI के बारे में",
    aboutSubtitle: "भूजल संरक्षण और किसानों की आय बढ़ाने का हमारा संकल्प।",

    // Dashboard KPIs
    kpiSoilMoisture: "मिट्टी में नमी",
    kpiSoilMoistureOptimal: "पर्याप्त नमी • आज पानी देने की आवश्यकता नहीं",
    kpiSoilMoistureDry: "मिट्टी सूख रही है • हल्की सिंचाई की सलाह",
    kpiSoilMoistureWet: "खेत में पर्याप्त पानी है • पंप न चलाएं",
    kpiWaterSaved: "पानी की बचत",
    kpiWaterSavedSubtext: "बिना नाप के पानी बहाने की तुलना में 35% तक की बचत",
    kpiPumpHoursSaved: "पंप का बचा समय",
    kpiPumpHoursSavedSubtext: "मानक 5 HP ट्यूबवेल के बहाव के आधार पर",
    kpiRiskAlerts: "फसल व कीट अलर्ट",
    kpiRiskAlertsSubtext: "कृषि विज्ञान केंद्र और स्थानीय किसानों के सत्यापित अलर्ट",

    // Explanations for unfamiliar features
    explainSoilMoisture: "यह बताता है कि खेत की मिट्टी में कितनी नमी है। यदि सेंसर नहीं है, तो 6-इंच मिट्टी का गोला टेस्ट करें।",
    explainRainForecast: "मौसम के अनुमान पर आधारित। यदि बारिश आने वाली है, तो ट्यूबवेल न चलाएं और बारिश का लाभ लें।",
    explainWaterRequirement: "यह खेत के आकार, मिट्टी के प्रकार और फसल की आवश्यकता के अनुसार निकाला गया अनुमान है।",
    explainPumpRuntime: "पंप कितनी देर चलाना है, यह पानी की जरूरत और पंप से निकलने वाले पानी की मात्रा पर निर्भर करता है।",
    explainAdvisor: "अपनी फसल, सिंचाई, खाद या रोग के बारे में अपनी भाषा में प्रश्न पूछें।",
    explainAnalysis: "फसल और खेत का विवरण भरें। ऐप उपलब्ध जानकारी के आधार पर सटीक सिंचाई सलाह देगा।",

    // Form Field Labels & Explanations
    cropSelection: "1. अपनी फसल चुनें",
    cropSelectionDesc: "आपने खेत में कौन सी फसल बो रखी है?",
    fieldDetails: "2. खेत का आकार और मिट्टी का प्रकार",
    fieldAreaLabel: "खेत का आकार (एकड़ में)",
    fieldAreaPlaceholder: "जैसे 2.0 या 1.5 एकड़",
    fieldAreaHelper: "आपका यह खेत कितने एकड़ का है? (1 एकड़ = लगभग 40 गुंठा / 4–5 बीघा)",
    soilTypeLabel: "खेत की मिट्टी कैसी है?",
    soilTypeHelper: "अपने खेत की मिट्टी चुनें (जलोढ़/दोआब, दोमट, बलुई दोमट, चिकनी मिट्टी, या काली मिट्टी)।",
    moistureWeather: "3. मिट्टी की नमी और बारिश",
    soilMoistureLabel: "मिट्टी में नमी (%)",
    soilMoistureHelper: "सेंसर नहीं है? 6-इंच मिट्टी का गोला टेस्ट करें: मिट्टी बिखरे तो <40%, गोला बने तो 55-65%, कीचड़ बने तो >80%।",
    rainProbLabel: "बारिश होने की संभावना (%)",
    rainProbHelper: "अगले 24 घंटों में बारिश की संभावना। 60% से अधिक हो तो ट्यूबवेल न चलाएं!",
    rainForecastLabel: "अनुमानित बारिश (मिमी)",
    rainForecastHelper: "अनुमानित बारिश की गहराई (मिमी में)। बारिश आने से पंप चलाने की जरूरत घट जाती है।",
    pumpSection: "4. ट्यूबवेल पंप का पानी (वैकल्पिक)",
    pumpFlowLabel: "पंप का पानी बहाव (लीटर प्रति मिनट)",
    pumpFlowHelper: "यदि नहीं पता तो खाली छोड़ दें; ऐप 5 HP मानक पंप (~460 ली/मिनट) मानकर गणना करेगा।",
    calculateBtn: "पानी की जरूरत निकालें",
    calculatingBtn: "गणना की जा रही है...",

    // Actions & Decisions
    decisionWater: "खेत में पानी लगाएं",
    decisionWaitRain: "रुकें: बारिश आने वाली है — पंप बंद रखें",
    decisionWaitMoisture: "आज पानी न दें — मिट्टी में पर्याप्त नमी है",
    decisionReduce: "कम पानी दें (हल्की सिंचाई)",
    whyThisMatters: "यह क्यों जरूरी है:",
    nextAction: "किसान के लिए अगला कदम:",

    // Field Management
    addField: "नया खेत जोड़ें",
    editField: "खेत बदलें",
    deleteField: "खेत हटाएं",
    activeField: "सक्रिय खेत",
    switchToField: "यह खेत चुनें",
    fieldName: "खेत का नाम / पहचान",
    fieldNamePlaceholder: "जैसे उत्तर ट्यूबवेल खेत",
    saveField: "खेत सुरक्षित करें",
    confirmDelete: "क्या आप वाकई इस खेत को हटाना चाहते हैं?",
    atLeastOneField: "कम से कम एक खेत होना आवश्यक है।",
    recommendedAction: "किसान के लिए सलाह",
    tubewellPumpHours: "ट्यूबवेल पंप चलाने का समय",
    waterVolume: "पानी की मात्रा",
    moistureStatus: "नमी की स्थिति",
    goodMoisture: "पर्याप्त नमी",
    drySoil: "मिट्टी सूख रही है",
    wetSoil: "पर्याप्त पानी है",
    switchSuccess: "सक्रिय खेत बदला गया:",
    fieldAdded: "नया खेत सफलतापूर्वक जोड़ा गया",
    fieldUpdated: "खेत का विवरण अपडेट हुआ",
    fieldDeleted: "खेत हटाया गया",

    // Results
    depthNeeded: "पानी की गहराई (मिमी)",
    totalWaterNeeded: "पूरे खेत का पानी (लीटर)",
    pumpRuntime: "ट्यूबवेल पंप चलाने का समय",
    stubbleAdvice: "पराली प्रबंधन सुझाव",
    demoBadge: "डेमो उदाहरण",
    liveBadge: "सर्वर से कनेक्टेड",
    offlineBadge: "ऑफलाइन गणना मॉडल",

    // Errors
    errNetwork: "इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें।",
    errServerBusy: "सलाह सेवा अभी व्यस्त है। कृपया कुछ पलों बाद पुनः प्रयास करें।",
    errSelectCrop: "कृपया फसल चुनें (गेहूं, धान, मक्का या गन्ना)।",
    errValidArea: "खेत का आकार 0 से अधिक भरें (जैसे 1.5 या 2 एकड़)।",
    errValidMoisture: "मिट्टी की नमी 0% से 100% के बीच दर्ज करें।",

    // Common
    language: "भाषा",
    acres: "एकड़",
    litres: "लीटर",
    minutes: "मिनट",
    hours: "घंटे",
    reset: "रीसेट करें",
    send: "भेजें",
    stop: "रोकें",
    cancel: "रद्द करें",
    today: "आज",
    statusOnline: "लाइव सर्वर",
    statusOffline: "ऑफलाइन मोड",
    guardrailsPill: "फसल सुरक्षा सक्रिय"
  }
};

export function getTranslations(lang = 'auto') {
  if (lang === 'hindi') return TRANSLATIONS.hindi;
  if (lang === 'hinglish') return TRANSLATIONS.hinglish;
  if (lang === 'english') return TRANSLATIONS.english;

  // Auto-detect based on navigator.language or fallback to english
  try {
    const nav = navigator.language || '';
    if (nav.startsWith('hi')) return TRANSLATIONS.hindi;
  } catch (e) {
    // SSR / test safe
  }
  return TRANSLATIONS.english;
}

/**
 * Helper to explain hand-feel soil moisture test in simple terms
 */
export function getSoilMoistureGuide(lang = 'english') {
  if (lang === 'hindi') {
    return {
      title: "सेंसर के बिना मिट्टी की नमी कैसे जांचें (मिट्टी का गोला टेस्ट)",
      steps: [
        "जड़ क्षेत्र (लगभग 6–8 इंच गहराई) से एक मुट्ठी मिट्टी निकालें।",
        "मुट्ठी में दबाकर गोला बनाएं: यदि गोला नहीं बनता और मिट्टी बिखरती है (<40%), तो खेत सूखा है और सिंचाई चाहिए।",
        "यदि गोला बनता है और हल्के उछालने पर नहीं टूटता (55–65%), तो नमी बिल्कुल सही है, पानी न दें।",
        "यदि हाथ में कीचड़ या पानी लग जाता है (>80%), तो खेत में पानी ज्यादा है, पंप बिल्कुल न चलाएं।"
      ]
    };
  }
  if (lang === 'hinglish') {
    return {
      title: "Bina sensor mitti ki nami kaise check karein (Mitti Ka Gola Test)",
      steps: [
        "Root zone (lagbhag 6–8 inch gehrai) se ek mutthi mitti lein.",
        "Mutthi me daba kar gola banayein: agar mitti bikhar jaye (<40%), toh khet sukha hai aur paani chahiye.",
        "Agar gola ban jaye aur halke uchhalne par na toote (55–65%), toh nami sahi hai, paani mat dein.",
        "Agar haath me keechad lag jaye (>80%), toh paani zyada hai, pump bilkul na chalayein."
      ]
    };
  }
  return {
    title: "How to check soil moisture without a sensor (6-Inch Hand-Ball Test)",
    steps: [
      "Dig 6–8 inches down into the crop root zone and grab a handful of soil.",
      "Squeeze firmly: If it crumbles and cannot form a ball (<40%), the soil is dry and needs irrigation.",
      "If it forms a firm ball that holds together when tossed (55–65%), moisture is good; do not irrigate.",
      "If it leaves muddy water or paste on your palm (>80%), soil is waterlogged; keep the pump off."
    ]
  };
}

/**
 * Helper to explain tubewell flow rate estimation
 */
export function getPumpFlowGuide(lang = 'english') {
  if (lang === 'hindi') {
    return {
      title: "पंप का बहाव कैसे नापें (200 लीटर ड्रम टेस्ट)",
      explanation: "200 लीटर के नीले प्लास्टिक ड्रम को अपने पंप से भरें और सेकंड गिनें।",
      formula: "बहाव (लीटर/मिनट) = (200 / सेकंड) × 60",
      example: "उदाहरण: यदि ड्रम 26 सेकंड में भरता है, तो बहाव लगभग 460 ली/मिनट है (मानक 5 HP पंप)।"
    };
  }
  if (lang === 'hinglish') {
    return {
      title: "Pump ka flow rate kaise check karein (200L Drum Test)",
      explanation: "200-litre ke blue plastic drum ko pump se bharein aur seconds ginein.",
      formula: "Flow (L/min) = (200 / seconds) × 60",
      example: "Example: Agar drum 26 second me bharta hai, toh flow ~460 L/min hai (standard 5 HP pump)."
    };
  }
  return {
    title: "How to measure pump flow rate (200L Drum Test)",
    explanation: "Fill a standard 200-litre plastic drum from your pump outlet and count the seconds.",
    formula: "Flow (L/min) = (200 / seconds) × 60",
    example: "Example: If drum fills in 26 seconds, flow is ~460 L/min (standard 5 HP tubewell)."
  };
}
