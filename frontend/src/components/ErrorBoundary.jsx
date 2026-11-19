import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('FarmGuard ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px 24px',
          maxWidth: '720px',
          margin: '40px auto',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg, 12px)',
          border: '1px solid #fecaca',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertTriangle size={28} />
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
            Unable to Display This Section
          </h2>

          <p style={{ fontSize: '0.92rem', color: '#64748b', maxWidth: '520px', margin: 0, lineHeight: 1.5 }}>
            A rendering interruption occurred while loading this farm module. Your farm profiles and saved calculations remain secure.
          </p>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={this.handleReset}
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                fontWeight: 700
              }}
            >
              <RotateCcw size={16} />
              Reload Section
            </button>

            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
              className="btn btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                fontWeight: 700
              }}
            >
              <Home size={16} />
              Return to Home
            </button>
          </div>

          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <details style={{ marginTop: '16px', textAlign: 'left', width: '100%', fontSize: '0.78rem', color: '#94a3b8' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Technical Details</summary>
              <pre style={{ marginTop: '8px', padding: '12px', background: '#f8fafc', borderRadius: '6px', overflowX: 'auto', color: '#e11d48' }}>
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
