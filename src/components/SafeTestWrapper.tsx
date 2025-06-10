
import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  componentName: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class SafeTestWrapper extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error(`❌ Error in ${this.props.componentName}:`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }

  render() {
    if (this.state.hasError) {
      const fallback = this.props.fallbackMessage || `Component "${this.props.componentName}" failed to render`;
      return (
        <div style={{ 
          padding: '20px', 
          margin: '10px',
          border: '2px solid red', 
          borderRadius: '8px',
          backgroundColor: '#ffe6e6',
          color: '#d00'
        }}>
          <h3>❌ {fallback}</h3>
          <details style={{ marginTop: '10px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
              Error Details (click to expand)
            </summary>
            <pre style={{ fontSize: '12px', marginTop: '10px', whiteSpace: 'pre-wrap' }}>
              {this.state.error?.message || 'Unknown error'}
              {this.state.error?.stack && '\n\nStack:\n' + this.state.error.stack}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
