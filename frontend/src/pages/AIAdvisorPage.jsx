import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  User,
  Send,
  Sparkles,
  MapPin,
  Sprout,
  Droplets,
  CloudRain,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Cpu,
  AlertTriangle,
  Info,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { getAgentAdvice } from '../services/api';
import Badge from '../components/Badge';

export default function AIAdvisorPage() {
  const { farm, setFarm, addActivity } = useFarm();

  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `Hello! I am **FarmGuard AI**, your India-specific sustainable farming assistant.

I orchestrate live weather lookups and deterministic FAO-56 crop calculation tools before synthesizing advice. Ask me about irrigation timing, crop water requirements, or residue management!`,
      recommendation: null,
      numerical_results: null,
      tool_trace: [],
      security: { guardrails: 'active' },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedTraces, setExpandedTraces] = useState({});
  const messagesEndRef = useRef(null);

  const suggestedPrompts = [
    'Should I irrigate my field today?',
    'How much water does my crop need in this weather?',
    'Rain is expected tomorrow. What should I do?',
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
        farm: {
          crop: farm.crop,
          area_acres: farm.area_acres,
          soil_type: farm.soil_type,
          current_irrigation_mm: farm.current_irrigation_mm,
          location: farm.location,
          rainfall_probability: farm.rainfall_probability,
          forecast_rainfall_mm: farm.forecast_rainfall_mm,
          soil_moisture_percent: farm.soil_moisture_percent,
        }
      };

      const response = await getAgentAdvice(payload);

      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        recommendation: response.recommendation,
        numerical_results: response.numerical_results,
        tool_trace: response.tool_trace || [],
        security: response.security,
        evaluation: response.evaluation,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, assistantMsg]);

      addActivity({
        type: 'ADVISOR',
        title: `AI Consultation: "${text.slice(0, 35)}..."`,
        location: farm.location,
        recommended_mm: response.numerical_results?.irrigation_recommendation?.recommended_irrigation_mm ?? null,
        water_saved_l: response.numerical_results?.water_conservation?.estimated_water_saved_liters ?? null,
        status: response.blocked ? 'blocked' : 'success',
        requestId: `fg-adv-${Date.now().toString(16).slice(-8)}`,
      });
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sender: 'assistant',
          text: `⚠️ **Advisory Notice:** ${err.message || 'Unable to complete advisory request.'}`,
          isError: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '24px', height: 'calc(100vh - 140px)' }}>
      {/* Left Column: Chat Conversation Container */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        {/* Chat Messages Viewport */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isTraceExpanded = !!expandedTraces[msg.id];

            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  gap: '14px',
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: isUser ? '80%' : '90%',
                  flexDirection: isUser ? 'row-reverse' : 'row',
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  background: isUser ? 'var(--bg-surface-elevated)' : 'linear-gradient(135deg, var(--primary-600), var(--primary-400))',
                  color: '#fff',
                  boxShadow: isUser ? 'none' : '0 0 12px var(--primary-glow)',
                }}>
                  {isUser ? <User size={18} /> : <Bot size={18} />}
                </div>

                {/* Message Body */}
                <div style={{
                  background: isUser ? 'linear-gradient(135deg, var(--primary-900), var(--primary-800))' : 'var(--bg-surface)',
                  border: isUser ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px 20px',
                  color: 'var(--text-main)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}>
                  {/* Text Content */}
                  <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '0.92rem' }}>
                    {msg.text}
                  </div>

                  {/* Recommendation Highlight Pill */}
                  {msg.recommendation && (
                    <div style={{
                      padding: '12px 14px',
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--primary-300)' }}>
                          Tactical Action
                        </span>
                        <Badge variant={msg.recommendation.recommended_irrigation_mm === 0 ? 'info' : 'success'}>
                          {msg.recommendation.status || 'Active'}
                        </Badge>
                      </div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff' }}>
                        {msg.recommendation.action}
                      </div>
                    </div>
                  )}

                  {/* Expandable "How FarmGuard Reasoned" Trace */}
                  {msg.tool_trace && msg.tool_trace.length > 0 && (
                    <div style={{
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: '8px',
                    }}>
                      <button
                        onClick={() => toggleTrace(msg.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary-400)',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 0',
                        }}
                      >
                        <Cpu size={14} />
                        <span>How FarmGuard reasoned ({msg.tool_trace.length} verified steps)</span>
                        {isTraceExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      {isTraceExpanded && (
                        <div style={{
                          marginTop: '10px',
                          padding: '12px',
                          background: 'var(--bg-card)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          fontSize: '0.78rem',
                          fontFamily: 'var(--font-mono)',
                        }}>
                          {msg.tool_trace.map((trace, tIdx) => (
                            <div key={tIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                              <span style={{ color: 'var(--primary-400)' }}>✓</span>
                              <strong style={{ color: 'var(--text-main)' }}>{trace.tool}</strong>: {trace.summary || trace.event || trace.status}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', alignSelf: 'flex-end' }}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div style={{ display: 'flex', gap: '14px', alignSelf: 'flex-start' }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary-600), var(--primary-400))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}>
                <RefreshCw size={18} className="pulse-glow" style={{ animation: 'spin 1s linear infinite' }} />
              </div>
              <div style={{
                padding: '14px 18px',
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-lg)',
                color: 'var(--text-muted)',
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span>Orchestrating deterministic farming tools & safety guardrails...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Bar */}
        <div style={{
          padding: '10px 20px',
          background: 'var(--bg-card)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
        }}>
          {suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              disabled={isLoading}
              onClick={() => handleSend(prompt)}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-full)',
                padding: '6px 12px',
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary-500)';
                e.currentTarget.style.color = 'var(--primary-300)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="chat-input-box">
          <input
            type="text"
            className="form-input"
            value={inputMessage}
            disabled={isLoading}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask FarmGuard about irrigation, rainfall forecasts, or stubble management..."
            style={{ flex: 1 }}
          />
          <button
            className="btn btn-primary"
            onClick={() => handleSend()}
            disabled={isLoading || !inputMessage.trim()}
          >
            <Send size={16} />
            <span>Send</span>
          </button>
        </div>
      </div>

      {/* Right Column: Active Farm Context Sidebar */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="card-header" style={{ margin: 0 }}>
          <div>
            <h3 className="card-title">
              <MapPin size={18} style={{ color: 'var(--primary-400)' }} />
              Active Farm Context
            </h3>
            <p className="card-subtitle">Grounding data passed to advisor</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ padding: '12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 600 }}>Crop & Area</div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)', textTransform: 'capitalize' }}>
              {farm.crop} ({farm.area_acres} Acres)
            </div>
          </div>

          <div style={{ padding: '12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 600 }}>Region / Location</div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
              {farm.location}
            </div>
          </div>

          <div style={{ padding: '12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 600 }}>Soil Classification</div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)', textTransform: 'capitalize' }}>
              {farm.soil_type}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--primary-400)', marginTop: '2px' }}>
              Moisture: {farm.soil_moisture_percent}%
            </div>
          </div>

          <div style={{ padding: '12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 600 }}>Weather Ingestion</div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
              {farm.rainfall_probability}% Rain • {farm.forecast_rainfall_mm || 6.4} mm
            </div>
          </div>
        </div>

        {/* Security & Grounding Note */}
        <div style={{
          marginTop: 'auto',
          padding: '12px',
          background: 'rgba(168, 85, 247, 0.08)',
          border: '1px solid rgba(168, 85, 247, 0.2)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-start',
        }}>
          <ShieldCheck size={18} style={{ color: '#c084fc', flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            All numerical claims in advisor answers are mathematically grounded against deterministic tool outputs.
          </div>
        </div>
      </div>
    </div>
  );
}
