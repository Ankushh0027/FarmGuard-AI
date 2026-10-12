import React, { useState } from 'react';
import {
  Users,
  AlertTriangle,
  ShieldCheck,
  MapPin,
  Clock,
  ThumbsUp,
  Send,
  PlusCircle,
  Filter,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Info,
  Sparkles,
  Search,
  Activity,
  Layers,
  ArrowUpRight,
  EyeOff,
  Stethoscope,
  X,
  Droplets,
  Sprout
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import {
  INITIAL_RISK_HOTSPOTS,
  INITIAL_COMMUNITY_REPORTS,
  INITIAL_ESCALATION_TICKETS
} from '../config/communityData';

export default function CommunityPage({ setActivePage }) {
  const { farm } = useFarm();

  // State
  const [activeTab, setActiveTab] = useState('hotspots'); // 'hotspots' | 'reports' | 'escalations'
  const [selectedCropFilter, setSelectedCropFilter] = useState('all');
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Live collections (optimistic updates for demo)
  const [hotspots] = useState(INITIAL_RISK_HOTSPOTS);
  const [reports, setReports] = useState(INITIAL_COMMUNITY_REPORTS);
  const [tickets, setTickets] = useState(INITIAL_ESCALATION_TICKETS);

  // Modal states
  const [showReportModal, setShowReportModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [selectedReportForEscalate, setSelectedReportForEscalate] = useState(null);
  const [notificationMsg, setNotificationMsg] = useState(null);

  // New report form state
  const [newReport, setNewReport] = useState({
    region: farm?.location || 'Punjab (Sangrur Cluster)',
    crop: farm?.crop ? farm.crop.charAt(0).toUpperCase() + farm.crop.slice(1) : 'Wheat',
    cropCategory: farm?.crop || 'wheat',
    acreage: farm?.area_acres || 3.0,
    threatType: 'Fungal Pathogen',
    threatTitle: '',
    description: '',
    severity: 'high',
    anonymize: true
  });

  // Upvote / Verify handler
  const handleToggleUpvote = (reportId) => {
    setReports(prev => prev.map(rep => {
      if (rep.id === reportId) {
        const nextUpvoted = !rep.userHasUpvoted;
        return {
          ...rep,
          userHasUpvoted: nextUpvoted,
          confirmedByCount: nextUpvoted ? rep.confirmedByCount + 1 : rep.confirmedByCount - 1
        };
      }
      return rep;
    }));
  };

  // Submit new report
  const handleCreateReport = (e) => {
    e.preventDefault();
    if (!newReport.threatTitle.trim() || !newReport.description.trim()) return;

    const randomClusterId = Math.floor(100 + Math.random() * 900);
    const generatedId = `rep-${Date.now().toString().slice(-4)}`;
    const randomHash = `Farmer_${newReport.cropCategory.slice(0, 2).toUpperCase()}_${randomClusterId}`;

    const newlyCreated = {
      id: generatedId,
      farmerHash: newReport.anonymize ? randomHash : 'Farmer (Direct)',
      cluster: `${newReport.region} Cluster #${randomClusterId}`,
      crop: `${newReport.crop} (${newReport.acreage} ac)`,
      cropCategory: newReport.cropCategory,
      acreage: Number(newReport.acreage),
      threatType: newReport.threatType,
      threatTitle: newReport.threatTitle,
      description: newReport.description,
      severity: newReport.severity,
      confirmedByCount: 1,
      userHasUpvoted: true,
      timestamp: 'Just now',
      aiTriage: {
        matchScore: 86,
        suspectedCause: `${newReport.threatTitle} Vector Analysis`,
        confidence: 'Preliminary Signal',
        recommendedWaterAdvice: 'Regulate irrigation moisture to mitigate microbial spread.'
      },
      status: 'Community Confirmed',
      escalatedToKvk: false
    };

    setReports([newlyCreated, ...reports]);
    setShowReportModal(false);
    setNotificationMsg({
      type: 'success',
      text: `Field report logged anonymously! AI Triage score: 86/100. Broadcasted to neighboring ${newReport.region} cluster.`
    });
    setActiveTab('reports');

    // Reset form
    setNewReport({
      region: farm?.location || 'Punjab (Sangrur Cluster)',
      crop: farm?.crop ? farm.crop.charAt(0).toUpperCase() + farm.crop.slice(1) : 'Wheat',
      cropCategory: farm?.crop || 'wheat',
      acreage: farm?.area_acres || 3.0,
      threatType: 'Fungal Pathogen',
      threatTitle: '',
      description: '',
      severity: 'high',
      anonymize: true
    });

    setTimeout(() => setNotificationMsg(null), 6000);
  };

  // Escalate report to KVK
  const handleConfirmEscalation = () => {
    if (!selectedReportForEscalate) return;

    const ticketId = `ESC-2026-${Math.floor(100 + Math.random() * 899)}`;
    const newTicket = {
      id: ticketId,
      reportId: selectedReportForEscalate.id,
      cluster: selectedReportForEscalate.cluster,
      crop: selectedReportForEscalate.crop,
      threat: selectedReportForEscalate.threatTitle,
      assignedExpert: 'Dr. A. Verma (Senior Scientist, Regional KVK)',
      assignedAuthority: 'District Agricultural Science Center & ICAR Extension',
      priority: selectedReportForEscalate.severity === 'high' ? 'Urgent' : 'Normal',
      status: 'In Field Triage',
      slaTimeRemaining: '4 hrs 00 mins',
      dateCreated: 'Just now',
      aiPreliminaryAssessment: selectedReportForEscalate.aiTriage?.suspectedCause 
        ? `Preliminary AI identification: ${selectedReportForEscalate.aiTriage.suspectedCause}. Farmer reported high spread velocity across cluster.`
        : 'Initial high-priority crop anomaly verified by neighboring smallholders.',
      statusSteps: [
        { step: 'Report Logged', done: true, time: 'Just now' },
        { step: 'AI Triage Validated', done: true, time: 'Just now' },
        { step: 'KVK Agronomist Assigned', done: true, time: 'Assigned' },
        { step: 'Field Inspection / Advisory', done: false, time: 'In Progress' }
      ]
    };

    setTickets([newTicket, ...tickets]);
    setReports(prev => prev.map(r => r.id === selectedReportForEscalate.id ? { ...r, escalatedToKvk: true } : r));
    setShowEscalateModal(false);
    setSelectedReportForEscalate(null);

    setNotificationMsg({
      type: 'success',
      text: `Escalation Ticket #${ticketId} created! Assigned to Regional Krishi Vigyan Kendra agronomist with a 4-hour SLA.`
    });
    setActiveTab('escalations');
    setTimeout(() => setNotificationMsg(null), 6000);
  };

  // Filter logic
  const filteredReports = reports.filter(r => {
    const matchCrop = selectedCropFilter === 'all' || r.cropCategory === selectedCropFilter;
    const matchSeverity = selectedSeverityFilter === 'all' || r.severity === selectedSeverityFilter;
    const matchSearch = searchQuery.trim() === '' || 
      r.threatTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.cluster.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCrop && matchSeverity && matchSearch;
  });

  const filteredHotspots = hotspots.filter(h => {
    const matchCrop = selectedCropFilter === 'all' || h.crop.toLowerCase().includes(selectedCropFilter);
    const matchSeverity = selectedSeverityFilter === 'all' || h.severity === selectedSeverityFilter;
    const matchSearch = searchQuery.trim() === '' || 
      h.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.threat.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCrop && matchSeverity && matchSearch;
  });

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* Toast Notification Banner */}
      {notificationMsg && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          background: notificationMsg.type === 'success' ? 'var(--color-brand-muted)' : '#fef2f2',
          border: `1px solid ${notificationMsg.type === 'success' ? 'var(--color-brand-border)' : '#fecaca'}`,
          borderRadius: 'var(--radius-md)',
          color: notificationMsg.type === 'success' ? 'var(--color-brand-dark)' : 'var(--status-danger)',
          fontWeight: 600,
          fontSize: '0.9rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} />
            <span>{notificationMsg.text}</span>
          </div>
          <button 
            onClick={() => setNotificationMsg(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* 1. Feature Hero Banner */}
      <div className="card" style={{
        padding: '28px 24px',
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ maxWidth: '760px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              background: 'rgba(217, 119, 6, 0.1)',
              border: '1px solid rgba(217, 119, 6, 0.25)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--accent-amber)',
              fontSize: '0.76rem',
              fontWeight: 700,
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              <AlertTriangle size={13} />
              WarriorHacks 2.0 • Community Crop-Risk Intelligence
            </div>

            <h1 style={{
              fontSize: '1.9rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              marginBottom: '10px'
            }}>
              Early-Warning Risk Radar & Peer Farmer Intelligence
            </h1>

            <p style={{
              fontSize: '0.95rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.55,
              marginBottom: '0'
            }}>
              Pest outbreaks, fungal rust, and groundwater depletion spread across neighboring village clusters long before official bulletins arrive. FarmGuard connects anonymized local farmer signals with verified agronomic advisories and Krishi Vigyan Kendra (KVK) extension desks.
            </p>
          </div>

          {/* Quick Action Button */}
          <div style={{ display: 'flex', gap: '10px', alignSelf: 'flex-start' }}>
            <button
              className="btn btn-primary"
              onClick={() => setShowReportModal(true)}
              style={{ padding: '10px 18px', fontWeight: 700, fontSize: '0.9rem' }}
            >
              <PlusCircle size={16} />
              Report Field Threat
            </button>
          </div>
        </div>
      </div>

      {/* 2. Live Key Metric Strip */}
      <div className="grid-4">
        <div className="kpi-card" style={{ borderLeft: '3px solid var(--accent-amber)' }}>
          <div className="kpi-label">
            <span>ACTIVE HOTSPOTS</span>
            <AlertTriangle size={15} color="var(--accent-amber)" />
          </div>
          <div className="kpi-value" style={{ color: 'var(--accent-amber)' }}>{hotspots.length}</div>
          <div className="kpi-subtext">Across 5 major crop belts</div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '3px solid var(--color-brand)' }}>
          <div className="kpi-label">
            <span>ANONYMIZED SIGNALS</span>
            <Users size={15} color="var(--color-brand)" />
          </div>
          <div className="kpi-value" style={{ color: 'var(--color-brand)' }}>
            {reports.reduce((acc, r) => acc + r.confirmedByCount, 0)}
          </div>
          <div className="kpi-subtext">Verified smallholder reports</div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '3px solid var(--accent-sky)' }}>
          <div className="kpi-label">
            <span>KVK EXTENSION DESK</span>
            <Stethoscope size={15} color="var(--accent-sky)" />
          </div>
          <div className="kpi-value" style={{ color: 'var(--accent-sky)' }}>{tickets.length}</div>
          <div className="kpi-subtext">Active agronomist tickets</div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '3px solid #7e22ce' }}>
          <div className="kpi-label">
            <span>PRIVACY RADIUS</span>
            <EyeOff size={15} color="#7e22ce" />
          </div>
          <div className="kpi-value" style={{ color: '#7e22ce' }}>5 km</div>
          <div className="kpi-subtext">Zero PII / Cluster fuzzed</div>
        </div>
      </div>

      {/* 3. Navigation Tabs & Search/Filter Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '12px'
      }}>
        {/* Main View Tabs */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('hotspots')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              border: activeTab === 'hotspots' ? '1px solid var(--color-brand-border)' : '1px solid var(--border-default)',
              background: activeTab === 'hotspots' ? 'var(--color-brand-muted)' : '#ffffff',
              color: activeTab === 'hotspots' ? 'var(--color-brand-dark)' : 'var(--text-secondary)',
              transition: 'all 0.15s ease'
            }}
          >
            <AlertTriangle size={15} />
            Regional Risk Hotspots ({filteredHotspots.length})
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              border: activeTab === 'reports' ? '1px solid var(--color-brand-border)' : '1px solid var(--border-default)',
              background: activeTab === 'reports' ? 'var(--color-brand-muted)' : '#ffffff',
              color: activeTab === 'reports' ? 'var(--color-brand-dark)' : 'var(--text-secondary)',
              transition: 'all 0.15s ease'
            }}
          >
            <Users size={15} />
            Crowd-Sourced Reports ({filteredReports.length})
          </button>

          <button
            onClick={() => setActiveTab('escalations')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              border: activeTab === 'escalations' ? '1px solid var(--color-brand-border)' : '1px solid var(--border-default)',
              background: activeTab === 'escalations' ? 'var(--color-brand-muted)' : '#ffffff',
              color: activeTab === 'escalations' ? 'var(--color-brand-dark)' : 'var(--text-secondary)',
              transition: 'all 0.15s ease'
            }}
          >
            <Stethoscope size={15} />
            KVK Extension Tickets ({tickets.length})
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Search box */}
          <div style={{ position: 'relative', width: '200px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-subtle)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Filter threat or cluster..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '30px', fontSize: '0.82rem', padding: '7px 10px 7px 30px' }}
            />
          </div>

          {/* Crop filter */}
          <select
            className="form-select"
            value={selectedCropFilter}
            onChange={(e) => setSelectedCropFilter(e.target.value)}
            style={{ padding: '7px 10px', fontSize: '0.82rem', width: 'auto' }}
          >
            <option value="all">All Crops</option>
            <option value="wheat">Wheat</option>
            <option value="cotton">Cotton</option>
            <option value="rice">Rice / Paddy</option>
            <option value="sugarcane">Sugarcane</option>
            <option value="maize">Maize</option>
          </select>

          {/* Severity filter */}
          <select
            className="form-select"
            value={selectedSeverityFilter}
            onChange={(e) => setSelectedSeverityFilter(e.target.value)}
            style={{ padding: '7px 10px', fontSize: '0.82rem', width: 'auto' }}
          >
            <option value="all">All Severity</option>
            <option value="high">High Risk</option>
            <option value="moderate">Moderate</option>
          </select>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: REGIONAL RISK RADAR & HOTSPOTS
          ========================================================================= */}
      {activeTab === 'hotspots' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Privacy & Science Guarantee callout */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            background: 'var(--bg-surface-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.82rem',
            color: 'var(--text-secondary)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={18} color="var(--color-brand)" />
              <span>
                <strong>Verified Triangulation:</strong> Hotspot alarms require 3+ corroborating farmer cluster signals within 15km or an authenticated ICAR/PAU university field bulletin.
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Updated real-time</span>
          </div>

          {/* Hotspot Cards Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredHotspots.length === 0 ? (
              <div className="card" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No active risk hotspots match your filter criteria.
              </div>
            ) : (
              filteredHotspots.map((hotspot) => {
                const isHigh = hotspot.severity === 'high';
                return (
                  <div
                    key={hotspot.id}
                    className="card"
                    style={{
                      padding: '20px',
                      borderLeft: isHigh ? '4px solid var(--status-danger)' : '4px solid var(--accent-amber)',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.4rem' }}>{hotspot.cropIcon}</span>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                              {hotspot.threat}
                            </h3>
                            <span className={`badge ${isHigh ? 'badge-danger' : 'badge-warning'}`}>
                              {hotspot.status} • Risk {hotspot.riskScore}/100
                            </span>
                            <span className="badge badge-secondary">
                              {hotspot.threatType}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <MapPin size={13} /> {hotspot.region} (~{hotspot.radiusKm} km radius)
                            </span>
                            <span>•</span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Users size={13} /> {hotspot.reportsCount} farmer reports ({hotspot.affectedAcresEst} acres est.)
                            </span>
                            <span>•</span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={13} /> {hotspot.lastUpdated}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Official Verification Badge */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        background: 'rgba(2, 132, 199, 0.06)',
                        border: '1px solid rgba(2, 132, 199, 0.2)',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)'
                      }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase' }}>
                          Verified Scientific Source
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-main)', fontWeight: 600 }}>
                          {hotspot.officialSource}
                        </div>
                      </div>
                    </div>

                    {/* Actionable Agronomic Guidance */}
                    <div style={{
                      padding: '12px 14px',
                      background: 'var(--bg-surface-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.86rem',
                      lineHeight: 1.5,
                      color: 'var(--text-secondary)'
                    }}>
                      <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Sprout size={13} color="var(--color-brand)" />
                        Immediate Actionable Water & Crop Protocol:
                      </div>
                      {hotspot.preventiveAction}
                    </div>

                    {/* Footer Actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Field coordinates: {hotspot.coordinates.lat.toFixed(2)}° N, {hotspot.coordinates.lon.toFixed(2)}° E (Anonymized zone)
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn btn-secondary"
                          onClick={() => {
                            setSelectedCropFilter(hotspot.crop.toLowerCase().includes('wheat') ? 'wheat' : hotspot.crop.toLowerCase().includes('cotton') ? 'cotton' : 'rice');
                            setActiveTab('reports');
                          }}
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        >
                          View {hotspot.reportsCount} Field Signals
                        </button>

                        <button
                          className="btn btn-primary"
                          onClick={() => {
                            setSelectedReportForEscalate({
                              id: hotspot.id,
                              cluster: hotspot.region,
                              crop: hotspot.crop,
                              threatTitle: hotspot.threat,
                              severity: hotspot.severity,
                              aiTriage: { suspectedCause: hotspot.threat }
                            });
                            setShowEscalateModal(true);
                          }}
                          style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                        >
                          <Stethoscope size={13} />
                          Request Extension Inspection
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: CROWD-SOURCED FIELD OBSERVATIONS
          ========================================================================= */}
      {activeTab === 'reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Privacy Guarantee Card */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            background: 'rgba(126, 34, 206, 0.06)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(126, 34, 206, 0.18)',
            fontSize: '0.82rem',
            color: 'var(--text-secondary)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <EyeOff size={18} color="#7e22ce" />
              <span>
                <strong>Zero PII Retention:</strong> Smallholder names, phone numbers, and exact survey numbers are never stored. Locations are strictly fuzzed to randomized village cluster IDs to prevent grain price manipulation.
              </span>
            </div>
            <button
              className="btn btn-secondary"
              onClick={() => setShowReportModal(true)}
              style={{ padding: '5px 12px', fontSize: '0.78rem', borderColor: '#7e22ce', color: '#7e22ce' }}
            >
              + Log Observation
            </button>
          </div>

          {/* List of Reports */}
          {filteredReports.length === 0 ? (
            <div className="card" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No peer farmer reports found matching your criteria.
            </div>
          ) : (
            filteredReports.map((report) => {
              const isHigh = report.severity === 'high';
              return (
                <div key={report.id} className="card" style={{ padding: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.74rem',
                          background: 'var(--bg-surface-subtle)',
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-subtle)'
                        }}>
                          {report.farmerHash}
                        </span>
                        <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          {report.threatTitle}
                        </h4>
                        <span className={`badge ${isHigh ? 'badge-danger' : 'badge-warning'}`}>
                          {report.severity.toUpperCase()}
                        </span>
                        {report.escalatedToKvk && (
                          <span className="badge badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Stethoscope size={11} /> KVK Escalated
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        <span>📍 {report.cluster}</span>
                        <span>•</span>
                        <span>🌾 {report.crop}</span>
                        <span>•</span>
                        <span>⏱️ {report.timestamp}</span>
                      </div>
                    </div>

                    {/* Upvote & Verification Counter */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => handleToggleUpvote(report.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: report.userHasUpvoted ? '1px solid var(--color-brand)' : '1px solid var(--border-default)',
                          background: report.userHasUpvoted ? 'var(--color-brand-muted)' : '#ffffff',
                          color: report.userHasUpvoted ? 'var(--color-brand-dark)' : 'var(--text-secondary)',
                          transition: 'all 0.15s ease'
                        }}
                        title="Confirm if you also observe this symptom in your nearby fields"
                      >
                        <ThumbsUp size={13} fill={report.userHasUpvoted ? 'currentColor' : 'none'} />
                        <span>{report.confirmedByCount} Verified in Cluster</span>
                      </button>
                    </div>
                  </div>

                  {/* Report observation content */}
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>
                    "{report.description}"
                  </p>

                  {/* AI Triage Analysis Block */}
                  {report.aiTriage && (
                    <div style={{
                      padding: '10px 14px',
                      background: 'rgba(27, 99, 52, 0.04)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-brand-border)',
                      fontSize: '0.82rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--color-brand-dark)' }}>
                          <Sparkles size={13} color="var(--color-brand)" />
                          AI Early-Triage Analysis (Confidence: {report.aiTriage.confidence})
                        </div>
                        <span style={{ fontSize: '0.74rem', color: 'var(--color-brand)', fontWeight: 700 }}>
                          Match Index: {report.aiTriage.matchScore}%
                        </span>
                      </div>
                      <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                        Suspected Vector: {report.aiTriage.suspectedCause}
                      </div>
                      <div style={{ color: 'var(--text-muted)' }}>
                        <strong>Water Management Note:</strong> {report.aiTriage.recommendedWaterAdvice}
                      </div>
                    </div>
                  )}

                  {/* Escalation Button on Card */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px', gap: '8px' }}>
                    {!report.escalatedToKvk ? (
                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          setSelectedReportForEscalate(report);
                          setShowEscalateModal(true);
                        }}
                        style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                      >
                        <Stethoscope size={13} />
                        Escalate to KVK Scientist
                      </button>
                    ) : (
                      <button
                        className="btn btn-secondary"
                        onClick={() => setActiveTab('escalations')}
                        style={{ padding: '6px 12px', fontSize: '0.78rem', color: 'var(--accent-blue)', borderColor: 'var(--accent-blue)' }}
                      >
                        View Active Ticket & SLA →
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: EXTENSION SERVICE & KVK ESCALATION DESK
          ========================================================================= */}
      {activeTab === 'escalations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Explanation Header */}
          <div className="card" style={{ padding: '18px 20px', background: 'var(--bg-surface-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <Stethoscope size={20} color="var(--accent-blue)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Krishi Vigyan Kendra (KVK) Agronomic Escalation Desk
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              When smallholder field anomalies exceed automated water-scheduling heuristics, reports are escalated directly to district agricultural scientists and hydrogeologists. Each ticket carries a tracked SLA and field investigation log.
            </p>
          </div>

          {/* Tickets List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {tickets.map((ticket) => {
              const isUrgent = ticket.priority === 'Urgent';
              return (
                <div key={ticket.id} className="card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          background: 'rgba(2, 132, 199, 0.08)',
                          color: 'var(--accent-blue)',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid rgba(2, 132, 199, 0.25)'
                        }}>
                          {ticket.id}
                        </span>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          {ticket.threat}
                        </h4>
                        <span className={`badge ${isUrgent ? 'badge-danger' : 'badge-secondary'}`}>
                          {ticket.priority} Priority
                        </span>
                        <span className="badge badge-info">
                          {ticket.status}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        <span>📍 {ticket.cluster}</span>
                        <span>•</span>
                        <span>🌾 {ticket.crop}</span>
                        <span>•</span>
                        <span>📅 Created {ticket.dateCreated}</span>
                      </div>
                    </div>

                    {/* SLA Timer */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      background: ticket.status === 'Official Advisory Issued' ? 'var(--color-brand-muted)' : 'rgba(217, 119, 6, 0.08)',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: `1px solid ${ticket.status === 'Official Advisory Issued' ? 'var(--color-brand-border)' : 'rgba(217, 119, 6, 0.25)'}`
                    }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-subtle)' }}>
                        Extension Service SLA
                      </span>
                      <span style={{
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        color: ticket.status === 'Official Advisory Issued' ? 'var(--color-brand-dark)' : 'var(--accent-amber)'
                      }}>
                        {ticket.slaTimeRemaining}
                      </span>
                    </div>
                  </div>

                  {/* Assigned Officer & Authority */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: 'var(--bg-surface-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '14px',
                    fontSize: '0.82rem',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Assigned Expert: </span>
                      <strong style={{ color: 'var(--text-main)' }}>{ticket.assignedExpert}</strong>
                    </div>
                    <div style={{ color: 'var(--text-subtle)', fontSize: '0.76rem' }}>
                      {ticket.assignedAuthority}
                    </div>
                  </div>

                  {/* Preliminary AI Diagnosis Assessment */}
                  <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.5 }}>
                    <strong>AI Triage Summary:</strong> {ticket.aiPreliminaryAssessment}
                  </div>

                  {ticket.resolutionNotes && (
                    <div style={{
                      padding: '10px 14px',
                      background: 'var(--color-brand-muted)',
                      border: '1px solid var(--color-brand-border)',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: '14px',
                      fontSize: '0.84rem',
                      color: 'var(--color-brand-dark)'
                    }}>
                      <strong>Official Resolution:</strong> {ticket.resolutionNotes}
                    </div>
                  )}

                  {/* Lifecycle Steps Pipeline */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '8px',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-subtle)'
                  }}>
                    {ticket.statusSteps.map((st, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          padding: '6px 8px',
                          background: st.done ? 'var(--color-brand-muted)' : 'var(--bg-surface-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          border: `1px solid ${st.done ? 'var(--color-brand-border)' : 'var(--border-subtle)'}`
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', fontWeight: 700, color: st.done ? 'var(--color-brand-dark)' : 'var(--text-subtle)' }}>
                          {st.done ? <CheckCircle2 size={12} color="var(--color-brand)" /> : <Clock size={12} />}
                          {st.step}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {st.time}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: REPORT FIELD THREAT / ANOMALY
          ========================================================================= */}
      {showReportModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="card fade-in" style={{
            maxWidth: '560px',
            width: '100%',
            background: '#ffffff',
            boxShadow: 'var(--shadow-md)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PlusCircle size={20} color="var(--color-brand)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Report Crop Risk or Outbreak
                </h3>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateReport} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Region & Crop in 2 cols */}
              <div className="grid-2">
                <div>
                  <label className="form-label">Cluster / Region</label>
                  <select
                    className="form-select"
                    value={newReport.region}
                    onChange={(e) => setNewReport({ ...newReport, region: e.target.value })}
                    required
                  >
                    <option value="Punjab (Sangrur Cluster)">Punjab (Sangrur Cluster)</option>
                    <option value="Maharashtra (Vidarbha Cluster)">Maharashtra (Vidarbha Cluster)</option>
                    <option value="Karnataka (Raichur Cluster)">Karnataka (Raichur Cluster)</option>
                    <option value="Uttar Pradesh (Meerut Cluster)">Uttar Pradesh (Meerut Cluster)</option>
                    <option value="Telangana (Warangal Cluster)">Telangana (Warangal Cluster)</option>
                    <option value="Haryana (Karnal Cluster)">Haryana (Karnal Cluster)</option>
                    <option value="Madhya Pradesh (Malwa Cluster)">Madhya Pradesh (Malwa Cluster)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Crop Affected</label>
                  <select
                    className="form-select"
                    value={newReport.cropCategory}
                    onChange={(e) => {
                      const cat = e.target.value;
                      const name = cat.charAt(0).toUpperCase() + cat.slice(1);
                      setNewReport({ ...newReport, cropCategory: cat, crop: name });
                    }}
                    required
                  >
                    <option value="wheat">Wheat (Gehu)</option>
                    <option value="cotton">Cotton (Kapas)</option>
                    <option value="rice">Rice / Paddy (Dhan)</option>
                    <option value="sugarcane">Sugarcane (Ganna)</option>
                    <option value="maize">Maize (Makka)</option>
                  </select>
                </div>
              </div>

              {/* Threat Category & Severity */}
              <div className="grid-2">
                <div>
                  <label className="form-label">Threat Category</label>
                  <select
                    className="form-select"
                    value={newReport.threatType}
                    onChange={(e) => setNewReport({ ...newReport, threatType: e.target.value })}
                  >
                    <option value="Fungal Pathogen">Fungal Pathogen (Rust, Blight, Blast)</option>
                    <option value="Pest Infestation">Pest Infestation (Bollworm, Borer, Thrips)</option>
                    <option value="Hydrological Stress">Hydrological Stress (Water Table Drop)</option>
                    <option value="Soil Salinity Spike">Soil / Water Salinity Ingress</option>
                    <option value="Weather Frost Stress">Hail / Cold Frost Shock</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Observed Severity</label>
                  <select
                    className="form-select"
                    value={newReport.severity}
                    onChange={(e) => setNewReport({ ...newReport, severity: e.target.value })}
                  >
                    <option value="high">High (Spreading Rapidly)</option>
                    <option value="moderate">Moderate (Isolated Patches)</option>
                    <option value="low">Early Advisory (First Sighting)</option>
                  </select>
                </div>
              </div>

              {/* Field Acreage */}
              <div>
                <label className="form-label">Approx. Affected Field Area (Acres)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="100"
                  className="form-input"
                  value={newReport.acreage}
                  onChange={(e) => setNewReport({ ...newReport, acreage: e.target.value })}
                  required
                />
              </div>

              {/* Threat Summary Title */}
              <div>
                <label className="form-label">Primary Symptom / Threat Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Yellow linear pustules on upper leaves after heavy mist"
                  value={newReport.threatTitle}
                  onChange={(e) => setNewReport({ ...newReport, threatTitle: e.target.value })}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="form-label">Detailed Field Observation & Water Conditions</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Describe leaf symptoms, irrigation method used, tubewell behavior, or spread to adjacent fields..."
                  value={newReport.description}
                  onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                  required
                />
              </div>

              {/* Privacy Checkbox */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '10px 12px',
                background: 'rgba(126, 34, 206, 0.05)',
                border: '1px solid rgba(126, 34, 206, 0.2)',
                borderRadius: 'var(--radius-sm)'
              }}>
                <input
                  type="checkbox"
                  id="anon-check"
                  checked={newReport.anonymize}
                  onChange={(e) => setNewReport({ ...newReport, anonymize: e.target.checked })}
                  style={{ marginTop: '3px' }}
                />
                <label htmlFor="anon-check" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <strong>Fuzz Location & Shield Farmer Identity</strong> (Recommended)
                  <br />
                  Obfuscates location to random 5km village cluster coordinate. No personal names or survey numbers shared.
                </label>
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowReportModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ fontWeight: 700 }}
                >
                  <Send size={15} />
                  Submit Community Observation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: CONFIRM ESCALATION TO KVK
          ========================================================================= */}
      {showEscalateModal && selectedReportForEscalate && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="card fade-in" style={{
            maxWidth: '520px',
            width: '100%',
            background: '#ffffff',
            boxShadow: 'var(--shadow-md)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Stethoscope size={22} color="var(--accent-sky)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Escalate to Krishi Vigyan Kendra
                </h3>
              </div>
              <button
                onClick={() => setShowEscalateModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.5 }}>
              You are about to dispatch an official extension service ticket for:
            </p>

            <div style={{
              padding: '12px 14px',
              background: 'var(--bg-surface-subtle)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '16px',
              fontSize: '0.84rem'
            }}>
              <div><strong>Threat:</strong> {selectedReportForEscalate.threatTitle}</div>
              <div style={{ marginTop: '4px' }}><strong>Cluster:</strong> {selectedReportForEscalate.cluster}</div>
              <div style={{ marginTop: '4px' }}><strong>Crop:</strong> {selectedReportForEscalate.crop}</div>
              <div style={{ marginTop: '4px' }}><strong>SLA Target:</strong> 4-Hour Agronomist Triage</div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              background: 'rgba(2, 132, 199, 0.08)',
              border: '1px solid rgba(2, 132, 199, 0.25)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              color: 'var(--accent-blue)',
              marginBottom: '18px'
            }}>
              <Sparkles size={16} />
              <span>AI will pre-populate diagnostic hypotheses to speed up physical sample analysis by the visiting agronomist.</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowEscalateModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirmEscalation}
                style={{ fontWeight: 700 }}
              >
                Confirm Dispatch Ticket
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
