import React, { useState, useRef, useEffect } from 'react';
import {
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
  AlertCircle
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { getAgentAdvice } from '../services/api';
import Badge from '../components/Badge';

export default function AIAdvisorPage() {
  const { farm, hasFarmProfile, addActivity } = useFarm();

  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `Hello! I am **FarmGuard AI**, an agricultural decision assistant powered by deterministic FAO-56 crop calculation tools and multi-tier security guardrails.

Ask me about irrigation scheduling, weather forecast interpretations, or crop residue mulching!`,
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
    hasFarmProfile ? `Should I irrigate my ${farm.crop} field today?` : 'Should I irrigate my field today?',
    'How much water does my crop need in this weather?',
    'Rain is expected tomorrow. What should I do?',
    'What are the best residue practices to avoid stubble burning?',
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
        farm: hasFarmProfile ? {
          crop: farm.crop,
          area_acres: farm.area_acres,
          soil_type: farm.soil_type,
          current_irrigation_mm: farm.current_irrigation_mm,
          location: farm.location,
          rainfall_probability: farm.rainfall_probability,
          forecast_rainfall_mm: farm.forecast_rainfall_mm,
          soil_moisture_percent: farm.soil_moisture_percent,
        } : null
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
        title: `Advisor: "${text.slice(0, 32)}..."`,
        location: farm.location || 'General Query',
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
          text: `⚠️ **Advisory Notice:** ${err.message || 'Unable to connect to advisory service.'}`,
          isError: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '20px', height: 'calc(100vh - 120px)' }}>
      {/* Left Column: Chat Conversation Container */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        {/* Chat Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isTraceExpanded = !!expandedTraces[msg.id];

            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: isUser ? '80%' : '88%',
                  flexDirection: isUser ? 'row-reverse' : 'row',
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  background: isUser ? 'var(--bg-surface-elevated)' : 'var(--color-brand-dark)',
                  color: '#fff',
                }}>
                  {isUser ? <User size={16} /> : <Bot size={16} />}
                </div>

                {/* Message Box */}
                <div style={{
                  background: isUser ? '#14352a' : 'var(--bg-surface-elevated)',
                  border: isUser ? '1px solid var(--color-brand-border)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 16px',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}>
                  {/* Text Content */}
                  <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '0.88rem' }}>
                    {msg.text}
                  </div>

                  {/* Recommendation Highlight Pill */}
                  {msg.recommendation && (
                    <div style={{
                      padding: '10px 12px',
                      background: 'var(--color-brand-muted)',
                      border: '1px solid var(--color-brand-border)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--color-brand-light)' }}>
                          Recommended Action
                        </span>
                        <Badge variant={msg.recommendation.recommended_irrigation_mm === 0 ? 'info' : 'success'}>
                          {msg.recommendation.status || 'Active'}
                        </Badge>
                      </div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {msg.recommendation.action}
                      </div>
                    </div>
                  )}

                  {/* Expandable "How FarmGuard Reasoned" Trace */}
                  {msg.tool_trace && msg.tool_trace.length > 0 && (
                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
                      <button
                        onClick={() => toggleTrace(msg.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-brand-light)',
                          fontSize: '0.76rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '2px 0',
                        }}
                      >
                        <Cpu size={13} />
                        <span>How FarmGuard reasoned ({msg.tool_trace.length} tool checkpoints)</span>
                        {isTraceExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>

                      {isTraceExpanded && (
                        <div style={{
                          marginTop: '8px',
                          padding: '10px',
                          background: 'var(--bg-surface)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          fontSize: '0.76rem',
                          fontFamily: 'var(--font-mono)',
                        }}>
                          {msg.tool_trace.map((trace, tIdx) => (
                            <div key={tIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                              <span style={{ color: 'var(--color-brand-light)' }}>✓</span>
                              <strong style={{ color: 'var(--text-primary)' }}>{trace.tool}</strong>: {trace.summary || trace.event || trace.status}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', alignSelf: 'flex-end' }}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div style={{ display: 'flex', gap: '10px', alignSelf: 'flex-start' }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--color-brand-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}>
                <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} />
              </div>
              <div style={{
                padding: '10px 14px',
                background: 'var(--bg-surface-elevated)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-muted)',
                fontSize: '0.84rem',
              }}>
                Executing deterministic tools & safety guardrails...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Bar */}
        <div style={{
          padding: '8px 16px',
          background: 'var(--bg-surface)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
        }}>
          {suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              disabled={isLoading}
              onClick={() => handleSend(prompt)}
              style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-full)',
                padding: '4px 10px',
                fontSize: '0.74rem',
                color: 'var(--text-secondary)',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div style={{ padding: '12px 16px', background: 'var(--bg-sidebar)', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '8px' }}>
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
            <Send size={15} />
            <span>Send</span>
          </button>
        </div>
      </div>

      {/* Right Column: Active Farm Context Sidebar */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div className="card-header" style={{ margin: 0 }}>
          <div>
            <h3 className="card-title" style={{ fontSize: '0.95rem' }}>
              <MapPin size={15} style={{ color: 'var(--color-brand)' }} />
              Active Farm Context
            </h3>
            <p className="card-subtitle">Grounding data passed to advisor</p>
          </div>
        </div>

        {hasFarmProfile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ padding: '10px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.70rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 600 }}>Crop & Area</div>
              <div style={{ fontWeight: 700, fontSize: '0.90rem', color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                {farm.crop} ({farm.area_acres} Acres)
              </div>
            </div>

            <div style={{ padding: '10px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.70rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 600 }}>Region / Soil</div>
              <div style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                {farm.location} • <span style={{ textTransform: 'capitalize' }}>{farm.soil_type}</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-brand-light)', marginTop: '2px' }}>
                Soil Moisture: {farm.soil_moisture_percent}%
              </div>
            </div>

            <div style={{ padding: '10px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.70rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 600 }}>Weather Ingestion</div>
              <div style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                {farm.rainfall_probability}% Rain • {farm.forecast_rainfall_mm || 0} mm
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: '16px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <AlertCircle size={24} style={{ color: 'var(--accent-amber)', margin: '0 auto 8px auto' }} />
            <div style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--text-primary)' }}>No Farm Context Yet</div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
              Run Farm Analysis first to provide specific field parameters to the advisor.
            </div>
          </div>
        )}

        <div style={{
          marginTop: 'auto',
          padding: '10px',
          background: 'var(--accent-purple-muted)',
          border: '1px solid rgba(168, 85, 247, 0.25)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          gap: '8px',
          alignItems: 'flex-start',
        }}>
          <ShieldCheck size={16} style={{ color: '#c084fc', flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            All numerical recommendations are calculated strictly by the deterministic tool layer.
          </div>
        </div>
      </div>
    </div>
  );
}
