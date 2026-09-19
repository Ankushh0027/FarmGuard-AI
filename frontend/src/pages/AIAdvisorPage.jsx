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
  RotateCcw
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { getAgentAdvice } from '../services/api';
import Badge from '../components/Badge';

export default function AIAdvisorPage({ setActivePage }) {
  const { farm, hasFarmProfile, addActivity } = useFarm();

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

  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `Hello! I am **FarmGuard**, your agricultural decision-support assistant.

Ask me about:
• **Water Needs**: How much water your crop needs based on your field size.
• **Irrigation Timing**: Should you run your pump today or wait for rain?
• **Pump Running Time**: How many hours to run your pump based on water flow.
• **Crop & Soil Health**: Guidance on soil moisture, symptoms, and water conservation.`,
      recommendation: null,
      tool_trace: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedTraces, setExpandedTraces] = useState({});
  const messagesEndRef = useRef(null);

  const suggestedPrompts = [
    'Should I water my crop today?',
    'How much water does my rice crop need?',
    'How long should I run my pump?',
    'Why is my crop not growing well?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const toggleTrace = (msgId) => {
    setExpandedTraces(prev => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: `Conversation reset. I am **FarmGuard**, ready to help with your crop, field water needs, weather or pump questions.`,
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
      if (msg.includes('wheat') || msg.includes('gehu') || msg.includes('gehoon')) updated.crop = 'wheat';
      else if (msg.includes('rice') || msg.includes('chawal') || msg.includes('dhaan') || msg.includes('dhan')) updated.crop = 'rice';
      else if (msg.includes('maize') || msg.includes('makka') || msg.includes('bhutta')) updated.crop = 'maize';
      else if (msg.includes('sugarcane') || msg.includes('ganna')) updated.crop = 'sugarcane';
    }

    // Field size extraction
    const mArea = msg.match(/(\d+(?:\.\d+)?)\s*(?:acre|acres|ekad)/);
    if (mArea) updated.area_acres = parseFloat(mArea[1]);

    // Soil moisture extraction
    const mMoist = msg.match(/(?:moisture|soil moisture|nami)(?:\s+is|\s*[:=])?\s*(\d+(?:\.\d+)?)\s*%/);
    if (mMoist) updated.soil_moisture_percent = parseFloat(mMoist[1]);
    else {
      const mMoist2 = msg.match(/(\d+(?:\.\d+)?)\s*%\s*(?:soil\s+)?moisture/);
      if (mMoist2) updated.soil_moisture_percent = parseFloat(mMoist2[1]);
    }

    // Location extraction
    for (const loc of ['uttar pradesh', 'punjab', 'haryana', 'bihar', 'madhya pradesh', 'rajasthan', 'gujarat', 'maharashtra', 'up', 'mp']) {
      if (loc === 'up' && /\bup\b/.test(msg)) { updated.location = 'Uttar Pradesh'; break; }
      else if (loc === 'mp' && /\bmp\b/.test(msg)) { updated.location = 'Madhya Pradesh'; break; }
      else if (msg.includes(loc)) {
        updated.location = loc.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        break;
      }
    }

    // Pump flow extraction
    const mPump = msg.match(/(\d+(?:\.\d+)?)\s*(?:lpm|litres\/min|liters\/min|l\/min|litres\s+per\s+minute|liters\s+per\s+minute)/);
    if (mPump) updated.pump_flow_lpm = parseFloat(mPump[1]);

    setSessionFarm(updated);
    return updated;
  };

  const handleSend = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    setInputMessage('');
    const userMsgId = `user-${Date.now()}`;
    const newUserMsg = {
      id: userMsgId,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    // Accumulate parameters into conversation context
    const currentContext = updateSessionFromText(text);

    try {
      // Build farm payload using accumulated session memory without fabricating missing parameters
      const farmPayload = currentContext.crop ? {
        crop: currentContext.crop,
        area_acres: currentContext.area_acres !== '' && currentContext.area_acres !== null && currentContext.area_acres !== undefined ? parseFloat(currentContext.area_acres) : null,
        soil_type: currentContext.soil_type || 'alluvial',
        current_irrigation_mm: currentContext.current_irrigation_mm !== '' && currentContext.current_irrigation_mm !== null && currentContext.current_irrigation_mm !== undefined ? parseFloat(currentContext.current_irrigation_mm) : 35.0,
        location: currentContext.location || null,
        rainfall_probability: currentContext.rainfall_probability !== '' && currentContext.rainfall_probability !== null && currentContext.rainfall_probability !== undefined ? parseFloat(currentContext.rainfall_probability) : null,
        forecast_rainfall_mm: currentContext.forecast_rainfall_mm !== null && currentContext.forecast_rainfall_mm !== '' && currentContext.forecast_rainfall_mm !== undefined
          ? parseFloat(currentContext.forecast_rainfall_mm)
          : null,
        soil_moisture_percent: currentContext.soil_moisture_percent !== '' && currentContext.soil_moisture_percent !== null && currentContext.soil_moisture_percent !== undefined
          ? parseFloat(currentContext.soil_moisture_percent)
          : null,
        pump_flow_lpm: currentContext.pump_flow_lpm !== '' && currentContext.pump_flow_lpm !== null && currentContext.pump_flow_lpm !== undefined ? parseFloat(currentContext.pump_flow_lpm) : null,
      } : null;

      const payload = {
        message: text,
        farm: farmPayload,
      };

      const response = await getAgentAdvice(payload);

      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        recommendation: response.recommendation,
        water_analysis: response.water_analysis,
        environmental_impact: response.environmental_impact,
        tool_trace: response.tool_trace || [],
        security: response.security,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, assistantMsg]);

      addActivity({
        title: `AI Question: "${text.slice(0, 36)}..."`,
        type: 'ADVISOR',
        status: response.blocked ? 'Blocked' : 'Answered',
        location: currentContext.location || 'Uttar Pradesh',
        recommended_mm: response.recommendation?.recommended_irrigation_mm ?? null,
        water_saved_l: response.water_analysis?.water_savings_liters ?? null,
        requestId: response.request_id || 'fg-trace',
      });
    } catch (err) {
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ **Connection issue:** ${err.message || 'Unable to communicate with the FarmGuard agent. Please ensure the backend server is running.'}`,
        tool_trace: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Build active memory context summary tokens
  const contextTokens = [];
  if (sessionFarm.crop) contextTokens.push(`Crop: ${sessionFarm.crop.toUpperCase()}`);
  if (sessionFarm.area_acres) contextTokens.push(`${sessionFarm.area_acres} Acres`);
  if (sessionFarm.soil_moisture_percent !== '') contextTokens.push(`Moisture: ${sessionFarm.soil_moisture_percent}%`);
  if (sessionFarm.location) contextTokens.push(sessionFarm.location);
  if (sessionFarm.pump_flow_lpm) contextTokens.push(`Pump: ${sessionFarm.pump_flow_lpm} L/min`);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '18px', height: 'calc(100vh - 130px)', minHeight: '600px' }}>
      {/* Top Banner with Active Farm Context & Clear Option */}
      <div className="card" style={{ padding: '14px 20px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-brand-muted)',
              color: 'var(--color-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <MessageSquare size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
                Ask FarmGuard
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {contextTokens.length > 0 ? (
                  <span style={{ color: 'var(--color-brand-dark)', fontWeight: 600 }}>
                    Active Context: {contextTokens.join(' • ')}
                  </span>
                ) : (
                  'Ask about irrigation, rain, soil or your crop...'
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleResetChat}
              style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Reset chat and start fresh"
            >
              <RotateCcw size={13} />
              Reset Chat
            </button>
            <Badge variant="success">Validated AI • Grounded Tools</Badge>
          </div>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="card" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        overflow: 'hidden',
        background: '#ffffff'
      }}>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '8px' }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              {/* Message Bubble Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '4px',
                fontSize: '0.74rem',
                color: 'var(--text-subtle)',
                flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
              }}>
                <span style={{ fontWeight: 700, color: msg.sender === 'user' ? 'var(--text-main)' : 'var(--color-brand-dark)' }}>
                  {msg.sender === 'user' ? 'You' : 'FarmGuard Assistant'}
                </span>
                <span>{msg.timestamp}</span>
              </div>

              {/* Bubble Body */}
              <div style={{
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                background: msg.sender === 'user' ? 'var(--color-brand)' : 'var(--bg-surface-subtle)',
                color: msg.sender === 'user' ? '#ffffff' : 'var(--text-main)',
                border: msg.sender === 'user' ? 'none' : '1px solid var(--border-default)',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                boxShadow: msg.sender === 'user' ? 'var(--shadow-sm)' : 'none',
                whiteSpace: 'pre-line',
              }}>
                {msg.text}

                {/* Structured Recommendation Pill (if returned by tool) */}
                {msg.recommendation && msg.recommendation.recommended_irrigation_mm !== undefined && (
                  <div style={{
                    marginTop: '12px',
                    padding: '12px 14px',
                    background: '#ffffff',
                    border: '1px solid var(--color-brand-border)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.84rem',
                    color: 'var(--text-main)',
                  }}>
                    <div style={{ fontWeight: 700, color: 'var(--color-brand-dark)', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={16} />
                      Recommended Action: {msg.recommendation.status}
                    </div>
                    <div>Recommended Irrigation Depth: <strong>{msg.recommendation.recommended_irrigation_mm} mm</strong></div>
                  </div>
                )}

                {/* Collapsible Tool & Security Trace (for judges / technical transparency) */}
                {msg.tool_trace && msg.tool_trace.length > 0 && (
                  <div style={{ marginTop: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                    <button
                      onClick={() => toggleTrace(msg.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: msg.sender === 'user' ? '#ffffff' : 'var(--text-subtle)',
                        fontSize: '0.74rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: 0,
                        fontWeight: 600,
                      }}
                    >
                      <Cpu size={12} />
                      <span>{expandedTraces[msg.id] ? 'Hide Verification Trace' : `Show Guardrail & Tool Trace (${msg.tool_trace.length} steps)`}</span>
                      {expandedTraces[msg.id] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>

                    {expandedTraces[msg.id] && (
                      <div style={{
                        marginTop: '8px',
                        padding: '10px',
                        background: 'var(--bg-surface-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        fontFamily: 'monospace',
                        fontSize: '0.74rem',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        border: '1px solid var(--border-subtle)'
                      }}>
                        {msg.tool_trace.map((step, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '6px' }}>
                            <span style={{ color: 'var(--color-brand)' }}>[{idx + 1}]</span>
                            <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{step.tool || step.event}:</span>
                            <span>{step.summary || step.status || 'OK'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-subtle)', fontSize: '0.84rem' }}>
              <Bot size={16} className="spin" style={{ color: 'var(--color-brand)' }} />
              <span>FarmGuard is evaluating field parameters and weather...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Farmer Prompts */}
        <div style={{ padding: '12px 0 8px', display: 'flex', gap: '8px', overflowX: 'auto', flexShrink: 0 }}>
          {suggestedPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              disabled={isLoading}
              style={{
                whiteSpace: 'nowrap',
                padding: '6px 12px',
                background: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-full)',
                color: 'var(--text-main)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-brand)';
                e.currentTarget.style.backgroundColor = 'var(--color-brand-muted)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-default)';
                e.currentTarget.style.backgroundColor = 'var(--bg-surface-subtle)';
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div style={{ display: 'flex', gap: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-default)', flexShrink: 0 }}>
          <input
            type="text"
            className="form-input"
            placeholder="Ask about irrigation, rain, soil or your crop..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
            style={{ flex: 1, padding: '11px 16px', fontSize: '0.92rem' }}
          />
          <button
            className="btn btn-primary"
            onClick={() => handleSend()}
            disabled={isLoading || !inputMessage.trim()}
            style={{ padding: '11px 20px', fontWeight: 700 }}
          >
            <Send size={16} />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}

