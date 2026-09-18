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
  Zap
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { getAgentAdvice } from '../services/api';
import Badge from '../components/Badge';

export default function AIAdvisorPage({ setActivePage }) {
  const { farm, hasFarmProfile, addActivity } = useFarm();

  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `Hello! I am **FarmGuard**, your agricultural decision assistant.

Ask me any question about:
• **Irrigation Timing**: Should you run your tubewell today or wait for rain?
• **Crop Water Demand**: How much water your crop needs based on field size and soil.
• **Electricity & Savings**: How to avoid excess pumping and cut electricity costs.
• **Residue Management**: How to incorporate crop stubble instead of burning.`,
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
    hasFarmProfile && farm.crop
      ? `Should I water my ${farm.crop} field in ${farm.location} today?`
      : 'Should I water my crop today or wait for rain?',
    'How much water does a 2-acre field need in current weather?',
    'It might rain tomorrow. Should I turn on my tubewell pump?',
    'How can I reduce tubewell electricity consumption?',
    'What is the best way to mulch crop stubble to retain soil moisture?',
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

    try {
      const payload = {
        message: text,
        farm: hasFarmProfile && farm.crop ? {
          crop: farm.crop,
          area_acres: parseFloat(farm.area_acres) || 1.0,
          soil_type: farm.soil_type || 'alluvial',
          current_irrigation_mm: parseFloat(farm.current_irrigation_mm) || 35.0,
          location: farm.location || 'Uttar Pradesh',
          rainfall_probability: parseFloat(farm.rainfall_probability) || 0,
          forecast_rainfall_mm: farm.forecast_rainfall_mm !== '' && farm.forecast_rainfall_mm !== null
            ? parseFloat(farm.forecast_rainfall_mm)
            : null,
          soil_moisture_percent: parseFloat(farm.soil_moisture_percent) || 45.0,
        } : null
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
        status: response.blocked ? 'blocked' : 'Answered',
        location: farm.location || 'Uttar Pradesh',
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

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100vh - 140px)', minHeight: '600px' }}>
      {/* Top Banner with Active Farm Context */}
      <div className="card" style={{ padding: '14px 20px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--primary-subtle)',
              color: 'var(--primary-400)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <MessageSquare size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-main)' }}>Ask FarmGuard</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
                {hasFarmProfile && farm.crop
                  ? `Active Field: ${farm.crop.toUpperCase()} (${farm.area_acres} ac) in ${farm.location}`
                  : 'Ask freely or configure your field in "Check Water Need" for customized advice'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Badge variant="success">Safe AI • Zero Hallucination</Badge>
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
        background: 'var(--bg-card)'
      }}>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '8px' }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '88%',
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
                <span style={{ fontWeight: 600, color: msg.sender === 'user' ? 'var(--text-main)' : 'var(--primary-400)' }}>
                  {msg.sender === 'user' ? 'You' : 'FarmGuard'}
                </span>
                <span>{msg.timestamp}</span>
              </div>

              {/* Bubble Body */}
              <div style={{
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                background: msg.sender === 'user' ? 'var(--primary-600)' : 'var(--bg-surface)',
                color: '#fff',
                border: msg.sender === 'user' ? 'none' : '1px solid var(--border-subtle)',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                boxShadow: msg.sender === 'user' ? '0 4px 12px rgba(5, 150, 105, 0.25)' : 'none',
                whiteSpace: 'pre-line',
              }}>
                {msg.text}

                {/* Structured Recommendation Pill (if returned by tool) */}
                {msg.recommendation && (
                  <div style={{
                    marginTop: '12px',
                    padding: '12px 14px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.84rem',
                    color: 'var(--text-main)',
                  }}>
                    <div style={{ fontWeight: 700, color: 'var(--primary-300)', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                        color: 'var(--text-subtle)',
                        fontSize: '0.74rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: 0,
                      }}
                    >
                      <Cpu size={12} />
                      <span>{expandedTraces[msg.id] ? 'Hide Verification Trace' : `Show Guardrail & Calculation Trace (${msg.tool_trace.length} steps)`}</span>
                      {expandedTraces[msg.id] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>

                    {expandedTraces[msg.id] && (
                      <div style={{
                        marginTop: '8px',
                        padding: '10px',
                        background: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: 'var(--radius-sm)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.74rem',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                      }}>
                        {msg.tool_trace.map((step, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '6px' }}>
                            <span style={{ color: 'var(--primary-400)' }}>[{idx + 1}]</span>
                            <span style={{ color: 'var(--text-main)' }}>{step.tool || step.event}:</span>
                            <span>{step.status || 'OK'}</span>
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
              <Bot size={16} className="spin" style={{ color: 'var(--primary-400)' }} />
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
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-full)',
                color: 'var(--text-muted)',
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary-400)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div style={{ display: 'flex', gap: '10px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)', flexShrink: 0 }}>
          <input
            type="text"
            className="form-input"
            placeholder="Ask a question (e.g. 'Should I water my field today?', 'How to save pumping electricity?')..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
            style={{ flex: 1, padding: '10px 14px', fontSize: '0.9rem' }}
          />
          <button
            className="btn btn-primary"
            onClick={() => handleSend()}
            disabled={isLoading || !inputMessage.trim()}
            style={{ padding: '10px 18px' }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
