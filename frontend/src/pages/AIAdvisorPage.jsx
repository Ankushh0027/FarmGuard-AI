import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Bot,
  User,
  Send,
  MapPin,
  Sprout,
  Droplets,
  CloudRain,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Cpu,
  Info,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Sparkles,
  HelpCircle,
  Zap,
  Timer,
  RotateCcw,
  Compass,
  ArrowRight,
  TrendingDown,
  Languages,
  X
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { getAgentAdvice } from '../services/api';
import Badge from '../components/Badge';

export default function AIAdvisorPage({ setActivePage }) {
  const { farm, hasFarmProfile, addActivity, language, setLanguage, t } = useFarm();

  // Conversational session context memory
  const [sessionFarm, setSessionFarm] = useState(() => {
    if (hasFarmProfile && farm.crop) {
      return {
        crop: farm.crop,
        area_acres: farm.area_acres || '',
        soil_type: farm.soil_type || 'alluvial',
        location: farm.location || 'Uttar Pradesh',
        soil_moisture_percent: farm.soil_moisture_percent || '',
        current_irrigation_mm: farm.current_irrigation_mm || 35.0,
        rainfall_probability: farm.rainfall_probability || 0,
        forecast_rainfall_mm: farm.forecast_rainfall_mm || null,
        pump_flow_lpm: farm.pump_flow_lpm || '',
      };
    }
    return {
      crop: '',
      area_acres: '',
      soil_type: 'alluvial',
      location: 'Uttar Pradesh',
      soil_moisture_percent: '',
      current_irrigation_mm: 35.0,
      rainfall_probability: 0,
      forecast_rainfall_mm: null,
      pump_flow_lpm: '',
    };
  });

  // Sync session farm when active farm changes
  useEffect(() => {
    if (farm && farm.crop) {
      setSessionFarm({
        crop: farm.crop,
        area_acres: farm.area_acres || '',
        soil_type: farm.soil_type || 'alluvial',
        location: farm.location || 'Uttar Pradesh',
        soil_moisture_percent: farm.soil_moisture_percent || '',
        current_irrigation_mm: farm.current_irrigation_mm || 35.0,
        rainfall_probability: farm.rainfall_probability || 0,
        forecast_rainfall_mm: farm.forecast_rainfall_mm || null,
        pump_flow_lpm: farm.pump_flow_lpm || '',
      });
    }
  }, [farm]);

  const languageMode = language; // Synced with global language

  const getWelcomeText = (lang) => {
    if (lang === 'hindi') {
      return `नमस्ते किसान भाई! मैं **FarmGuard कृषि सलाहकार** हूँ।

मैं आपकी भाषा (हिंदी, Hinglish या English) में सरल और सही सलाह देता हूँ:

• **सिंचाई कब करें:** आज खेत में पानी लगाएं या आने वाली बारिश का इंतजार करें?
• **पानी व पंप का समय:** खेत के लिए कितने लीटर पानी और ट्यूबवेल कितने घंटे चलाना है?
• **फसल सुरक्षा व पराली:** फसल की देखभाल और पराली को बिना जलाए खाद बनाने का तरीका।

आप नीचे दिए गए विकल्पों में से चुन सकते हैं या अपना प्रश्न लिख सकते हैं।`;
    }
    if (lang === 'hinglish') {
      return `Namaste kisan bhai! Main **FarmGuard Krishi Salahkar** hoon.

Main aapki bhasha (Hindi, Hinglish ya English) me practical kheti salah deta hoon:

• **Sinchai kab karein:** Aaj khet me paani lagayein ya aane wali baarish ka wait karein?
• **Paani aur pump ka time:** Khet ke liye kitne litres paani aur pump kitni der chalana hai?
• **Fasal suraksha aur parali:** Parali ko bina jalaye khad banane aur keedo se bachne ki salah.

Aap neeche diye gaye buttons click kar sakte hain ya apna sawaal likh sakte hain.`;
    }
    return `Hello! I am **FarmGuard Agricultural Advisor**.

I provide practical, ICAR-grounded field advice in **English**, **Hinglish**, or **हिंदी**:

• **Irrigation Scheduling:** Whether to water your crop today or wait for upcoming rainfall.
• **Volume & Pumping Runtime:** Exact litres required and tubewell pump running hours.
• **Crop Health & Stubble Advice:** Managing residue without open burning to enrich soil.

Feel free to pick a question below or type your query in your own words.`;
  };

  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: getWelcomeText(language),
      recommendation: null,
      tool_trace: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedTraces, setExpandedTraces] = useState({});
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  const languageOptions = [
    { id: 'auto', label: 'Auto (ऑटो)' },
    { id: 'english', label: 'English' },
    { id: 'hinglish', label: 'Hinglish' },
    { id: 'hindi', label: 'हिंदी' },
  ];

  const quickActionPrompts = languageMode === 'hindi' ? [
    { label: '💧 आज पानी दें या नहीं?', prompt: 'क्या मुझे आज मौसम के अनुसार अपने खेत में पानी देना चाहिए?' },
    { label: '⏱️ पंप कितने घंटे चलाएं?', prompt: 'मेरे खेत के लिए ट्यूबवेल पंप कितने घंटे चलाना चाहिए?' },
    { label: '🌾 गेहूं में सही सिंचाई समय', prompt: 'मेरे गेहूं के खेत में पानी कब देना चाहिए?' },
    { label: '🍂 पराली का सही उपयोग', prompt: 'फसल अवशेष को बिना जलाए खेत में खाद कैसे बनाएं?' },
  ] : (languageMode === 'hinglish' ? [
    { label: '💧 Aaj paani du kya?', prompt: 'Kya mujhe forecast ke hisab se aaj khet me paani dena chahiye?' },
    { label: '⏱️ Pump kitni der chalayein?', prompt: 'Mere khet ke size ke liye tubewell pump kitni der chalana hoga?' },
    { label: '🌾 Gehun me sinchai', prompt: 'Mere gehun ke khet mein paani kab dena chahiye?' },
    { label: '🍂 Parali ka istemal', prompt: 'Parali ko bina jalaye kaise use karein?' },
  ] : [
    { label: '💧 Should I water today?', prompt: 'Should I irrigate my field today based on the weather forecast?' },
    { label: '⏱️ How long to run pump?', prompt: 'How many hours should I run my tubewell pump for my current field size?' },
    { label: '🌾 Wheat watering stages', prompt: 'When should I irrigate my wheat crop?' },
    { label: '🍂 Manage crop stubble', prompt: 'What are the best methods to manage crop residue without open burning?' },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const toggleTrace = (msgId) => {
    setExpandedTraces(prev => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  };

  const handleResetChat = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: getWelcomeText(language),
        recommendation: null,
        tool_trace: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
    setSessionFarm({
      crop: farm.crop || '',
      area_acres: farm.area_acres || '',
      soil_type: farm.soil_type || 'alluvial',
      location: farm.location || 'Uttar Pradesh',
      soil_moisture_percent: farm.soil_moisture_percent || '',
      current_irrigation_mm: farm.current_irrigation_mm || 35.0,
      rainfall_probability: farm.rainfall_probability || 0,
      forecast_rainfall_mm: farm.forecast_rainfall_mm || null,
      pump_flow_lpm: farm.pump_flow_lpm || '',
    });
  };

  // Extract and accumulate farm parameters from message
  const updateSessionFromText = (text) => {
    const msg = text.toLowerCase();
    const updated = { ...sessionFarm };

    // Crop extraction
    if (!updated.crop) {
      if (msg.includes('wheat') || msg.includes('gehu') || msg.includes('gehoon') || msg.includes('गेहूं')) updated.crop = 'wheat';
      else if (msg.includes('rice') || msg.includes('chawal') || msg.includes('dhaan') || msg.includes('dhan') || msg.includes('धान')) updated.crop = 'rice';
      else if (msg.includes('maize') || msg.includes('makka') || msg.includes('bhutta') || msg.includes('मक्का')) updated.crop = 'maize';
      else if (msg.includes('sugarcane') || msg.includes('ganna') || msg.includes('गन्ना')) updated.crop = 'sugarcane';
    }

    // Field size extraction
    const mArea = msg.match(/(\d+(?:\.\d+)?)\s*(?:acre|acres|ekad|एकड़)/);
    if (mArea) updated.area_acres = parseFloat(mArea[1]);

    // Soil moisture extraction
    const mMoist = msg.match(/(?:moisture|soil moisture|nami|नमी)(?:\s+is|\s*[:=])?\s*(\d+(?:\.\d+)?)\s*%/);
    if (mMoist) updated.soil_moisture_percent = parseFloat(mMoist[1]);
    else {
      const mMoist2 = msg.match(/(\d+(?:\.\d+)?)\s*%\s*(?:soil\s+)?(?:moisture|nami|नमी)/);
      if (mMoist2) updated.soil_moisture_percent = parseFloat(mMoist2[1]);
    }

    // Location extraction
    if (msg.includes('punjab') || msg.includes('पंजाब')) updated.location = 'Punjab';
    else if (msg.includes('haryana') || msg.includes('हरियाणा')) updated.location = 'Haryana';
    else if (msg.includes('uttar pradesh') || msg.includes('up') || msg.includes('उत्तर प्रदेश')) updated.location = 'Uttar Pradesh';
    else if (msg.includes('rajasthan') || msg.includes('राजस्थान')) updated.location = 'Rajasthan';
    else if (msg.includes('bihar') || msg.includes('बिहार')) updated.location = 'Bihar';

    return updated;
  };

  const handleSend = async (overrideText = null) => {
    const textToSend = overrideText || inputMessage;
    if (!textToSend || !textToSend.trim() || isLoading) return;

    // Cancel previous pending request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!overrideText) setInputMessage('');
    setIsLoading(true);

    const updatedContext = updateSessionFromText(textToSend);
    setSessionFarm(updatedContext);

    // Build conversation memory (last 6 turns)
    const history = messages
      .filter(m => m.id !== 'welcome-1' && !m.id.startsWith('error-') && !m.id.startsWith('cancel-'))
      .slice(-6)
      .map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

    try {
      const payload = {
        message: textToSend.trim(),
        language: languageMode === 'auto' ? undefined : languageMode,
        history,
        farm: {
          crop: updatedContext.crop || 'wheat',
          area_acres: updatedContext.area_acres ? parseFloat(updatedContext.area_acres) : 2.0,
          soil_type: updatedContext.soil_type || 'alluvial',
          soil_moisture_percent: updatedContext.soil_moisture_percent !== '' ? parseFloat(updatedContext.soil_moisture_percent) : 38.0,
          current_irrigation_mm: updatedContext.current_irrigation_mm ? parseFloat(updatedContext.current_irrigation_mm) : 35.0,
          rainfall_probability: updatedContext.rainfall_probability || 0,
          forecast_rainfall_mm: updatedContext.forecast_rainfall_mm !== null ? parseFloat(updatedContext.forecast_rainfall_mm) : null,
          location: updatedContext.location || 'Uttar Pradesh',
          pump_flow_lpm: updatedContext.pump_flow_lpm ? parseFloat(updatedContext.pump_flow_lpm) : null,
        }
      };

      const response = await getAgentAdvice(payload, { signal: controller.signal });

      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: response.answer || (language === 'hindi' ? 'मैंने आपके खेत की स्थिति का विश्लेषण करके ऊपर दी गई सलाह तैयार की है।' : 'I evaluated your field parameters and generated an agronomic recommendation above.'),
        recommendation: response.recommendation || null,
        water_analysis: response.water_analysis || null,
        tool_trace: response.tool_trace || [],
        detected_language: response.detected_language,
        is_client_fallback: response.is_client_fallback || false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, assistantMsg]);

      // Add to audit activity
      addActivity({
        title: `Advisor: "${textToSend.slice(0, 30)}..."`,
        description: `Consulted FarmGuard AI for ${updatedContext.crop || 'field'} water guidance.`,
        category: 'advisor',
      });
    } catch (err) {
      if (err.name === 'AbortError') {
        setMessages(prev => [
          ...prev,
          {
            id: `cancel-${Date.now()}`,
            sender: 'assistant',
            text: language === 'hindi'
              ? '⏹️ उत्तर रोक दिया गया। आप जब चाहें नया प्रश्न पूछ सकते हैं।'
              : language === 'hinglish'
                ? '⏹️ Request roki gayi. Aap jab chahein naya sawaal pooch sakte hain.'
                : '⏹️ Request cancelled. Feel free to ask another farming question whenever you are ready.',
            tool_trace: [],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            sender: 'assistant',
            text: language === 'hindi'
              ? '⚠️ इंटरनेट कनेक्शन जांचें या कुछ पलों बाद पुनः प्रयास करें।'
              : language === 'hinglish'
                ? '⚠️ Internet connection check karein ya thodi der baad dobara koshish karein.'
                : '⚠️ Please check your internet connection or try again in a few moments.',
            tool_trace: [{ event: 'ERROR', error: String(err) }],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        ]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const contextTokens = [];
  if (sessionFarm.crop) contextTokens.push(`${language === 'hindi' ? 'फसल' : 'Crop'}: ${sessionFarm.crop.toUpperCase()}`);
  if (sessionFarm.area_acres) contextTokens.push(`${sessionFarm.area_acres} ${t.acres || 'Acres'}`);
  if (sessionFarm.soil_moisture_percent !== '') contextTokens.push(`${language === 'hindi' ? 'नमी' : 'Moisture'}: ${sessionFarm.soil_moisture_percent}%`);
  if (sessionFarm.location) contextTokens.push(sessionFarm.location);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100vh - 128px)', minHeight: '640px' }}>
      {/* Top Banner with Active Farm Context & Clear Option */}
      <div className="card" style={{ padding: '16px 24px', flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #0d2818 0%, #1b532e 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 3px 8px rgba(13, 40, 24, 0.35)'
            }}>
              <Bot size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)', letterSpacing: '-0.015em' }}>
                  {t.advisorTitle || 'FarmGuard Agricultural Advisor'}
                </span>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, background: 'var(--color-brand-muted)', color: 'var(--color-brand-dark)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                  ICAR Grounded
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {contextTokens.length > 0 ? (
                  <span style={{ color: 'var(--color-brand-dark)', fontWeight: 700 }}>
                    {language === 'hindi' ? 'वर्तमान खेत विवरण:' : 'Active Field:'} {contextTokens.join(' • ')}
                  </span>
                ) : (
                  t.explainAdvisor || 'Ask about irrigation depth, pump runtime, rain forecast, or residue mulching...'
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleResetChat}
              style={{ padding: '7px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Reset conversation context"
            >
              <RotateCcw size={13} />
              {t.reset || 'Reset'}
            </button>
            <Badge variant="success">{t.guardrailsPill || 'Crop Safety Active'}</Badge>
          </div>
        </div>
      </div>

      {/* Main Chat Workspace */}
      <div
        className="card advisor-chat-card"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {/* Messages Stream */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', paddingRight: '8px' }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="advisor-msg-item"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              {/* Message Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '6px',
                fontSize: '0.74rem',
                color: 'var(--text-subtle)',
                flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
              }}>
                <span style={{ fontWeight: 800, color: msg.sender === 'user' ? 'var(--text-main)' : 'var(--color-brand-dark)' }}>
                  {msg.sender === 'user' ? (language === 'hindi' ? 'आप (किसान)' : 'You') : 'FarmGuard Advisor'}
                </span>
                {msg.detected_language && (
                  <span className="simulation-pill" style={{ fontSize: '0.68rem', padding: '1px 6px', textTransform: 'capitalize' }}>
                    {msg.detected_language === 'hindi' ? 'हिंदी' : (msg.detected_language === 'hinglish' ? 'Hinglish' : 'English')}
                  </span>
                )}
                <span>{msg.timestamp}</span>
              </div>

              {/* Message Bubble */}
              <div
                style={{
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-lg)',
                  background: msg.sender === 'user' ? 'linear-gradient(135deg, #1b532e 0%, #0d2818 100%)' : 'var(--bg-surface-subtle)',
                  color: msg.sender === 'user' ? '#ffffff' : 'var(--text-main)',
                  border: msg.sender === 'user' ? 'none' : '1px solid var(--border-default)',
                  fontSize: '0.92rem',
                  lineHeight: 1.6,
                  boxShadow: msg.sender === 'user' ? '0 3px 8px rgba(13, 40, 24, 0.3)' : 'var(--shadow-xs)',
                  whiteSpace: 'pre-line',
                }}
              >
                {msg.text}

                {/* Structured Recommendation Card */}
                {msg.recommendation && (
                  <div style={{
                    marginTop: '16px',
                    padding: '16px 18px',
                    background: '#ffffff',
                    border: '1px solid var(--color-brand-border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-main)',
                    boxShadow: 'var(--shadow-xs)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div style={{ fontWeight: 800, color: 'var(--color-brand-dark)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem' }}>
                        <CheckCircle2 size={16} />
                        {language === 'hindi' ? 'सिंचाई सलाह:' : 'Recommendation:'} {msg.recommendation.status}
                      </div>
                    </div>

                    <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                      {msg.recommendation.explanation}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                      <div style={{ padding: '8px 12px', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                          {t.depthNeeded || 'Depth'}
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-brand-dark)' }}>
                          {msg.recommendation.recommended_irrigation_mm || 0} mm
                        </div>
                      </div>

                      <div style={{ padding: '8px 12px', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                          {t.totalWaterNeeded || 'Volume'}
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-sky-dark)' }}>
                          {msg.water_analysis?.recommended_water_liters ? `${msg.water_analysis.recommended_water_liters.toLocaleString()} L` : '0 L'}
                        </div>
                      </div>

                      <div style={{ padding: '8px 12px', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                          {t.pumpRuntime || 'Runtime'}
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-amber-dark)' }}>
                          {msg.recommendation.recommended_irrigation_mm === 0 ? '0 h' : `~${(Number(msg.recommendation.recommended_irrigation_mm) * 0.35).toFixed(1)} h`}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-md)', alignSelf: 'flex-start' }}>
              <div className="spinner-sm spin" style={{ width: 18, height: 18, border: '2px solid var(--border-default)', borderTopColor: 'var(--color-brand)', borderRadius: '50%' }} />
              <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {language === 'hindi' ? 'सलाह तैयार की जा रही है...' : language === 'hinglish' ? 'Salah prepare ho rahi hai...' : 'Consulting agricultural models...'}
              </span>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  marginLeft: '8px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <X size={12} />
                <span>{t.cancel || 'Cancel'}</span>
              </button>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Language Selector Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', padding: '10px 0 6px', borderTop: '1px solid var(--border-subtle)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Languages size={14} /> {t.language || 'Language'}:
            </span>
            {languageOptions.map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setLanguage(opt.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  border: languageMode === opt.id ? '1px solid var(--color-brand)' : '1px solid var(--border-default)',
                  background: languageMode === opt.id ? 'var(--color-brand)' : 'var(--bg-surface-subtle)',
                  color: languageMode === opt.id ? '#ffffff' : 'var(--text-main)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="advisor-chips-row" style={{ padding: '0 0 10px', display: 'flex', gap: '8px', overflowX: 'auto', flexShrink: 0 }}>
          {quickActionPrompts.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(q.prompt)}
              disabled={isLoading}
              style={{
                whiteSpace: 'nowrap',
                padding: '7px 14px',
                background: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-full)',
                color: 'var(--text-main)',
                fontSize: '0.79rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-brand)';
                e.currentTarget.style.backgroundColor = 'var(--color-brand-muted)';
                e.currentTarget.style.color = 'var(--color-brand-dark)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-default)';
                e.currentTarget.style.backgroundColor = 'var(--bg-surface-subtle)';
                e.currentTarget.style.color = 'var(--text-main)';
              }}
            >
              {q.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div style={{ display: 'flex', gap: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-default)', flexShrink: 0 }}>
          <input
            type="text"
            className="form-input"
            placeholder={
              languageMode === 'hindi'
                ? 'फसल, पानी, मौसम, मिट्टी की नमी या ट्यूबवेल पंप के बारे में पूछें...'
                : (languageMode === 'hinglish'
                  ? 'Khet me paani, mausam, mitti ki nami ya tubewell pump ke baare me puchein...'
                  : 'Ask about field water demand, rain forecast, soil moisture, or tubewell pump...')
            }
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
            style={{ flex: 1, padding: '12px 18px', fontSize: '0.94rem' }}
          />
          {isLoading ? (
            <button
              type="button"
              className="btn"
              onClick={handleCancel}
              style={{
                padding: '12px 20px',
                fontWeight: 800,
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
              title="Cancel current request"
            >
              <X size={16} />
              <span>{t.stop || 'Stop'}</span>
            </button>
          ) : (
            <button
              type="button"
              data-action="send-advisor"
              className="btn btn-primary"
              onClick={() => handleSend()}
              disabled={isLoading || !inputMessage.trim()}
              style={{ padding: '12px 24px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Send size={16} />
              <span>{t.send || 'Send'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
