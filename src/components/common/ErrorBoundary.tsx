import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ChapterHub ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-screen" style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: 'var(--bg-primary, #FBFBF9)',
          color: 'var(--text-primary, #1A1B1E)',
          fontFamily: 'var(--font-sans, sans-serif)',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '480px',
            background: 'var(--bg-surface, #FFFFFF)',
            padding: '36px 30px',
            borderRadius: '16px',
            border: '1px solid var(--border-medium, rgba(0,0,0,0.12))',
            boxShadow: 'var(--shadow-lg, 0 12px 32px rgba(0,0,0,0.08))'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(234, 67, 53, 0.12)',
              color: '#EA4335',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <AlertTriangle size={24} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>
              Something unexpected happened
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary, #5F6368)', marginBottom: '20px', lineHeight: 1.4 }}>
              {this.state.error?.message || 'An error occurred while loading this view.'}
            </p>
            <button
              onClick={this.handleReset}
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '8px',
                background: '#4285F4',
                color: '#FFF',
                fontWeight: 600,
                fontSize: '0.88rem'
              }}
            >
              <RefreshCw size={15} />
              <span>Return to Dashboard</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
