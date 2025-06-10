
import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  componentName: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class SafeComponentWrapper extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error(`Error in ${this.props.componentName}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          color: 'red', 
          padding: '10px', 
          border: '1px solid red', 
          margin: '10px',
          backgroundColor: '#ffe6e6'
        }}>
          <h3>❌ Error in {this.props.componentName}</h3>
          <details>
            <summary>Error details</summary>
            <pre style={{ fontSize: '12px', marginTop: '10px' }}>
              {this.state.error?.message || 'Unknown error'}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
