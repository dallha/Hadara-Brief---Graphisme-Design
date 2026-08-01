import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackLabel?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-8">
          <div className="bg-red-950/50 border border-red-500/40 rounded-3xl p-8 max-w-2xl w-full space-y-4">
            <h2 className="text-xl font-bold text-red-400">
              Erreur dans {this.props.fallbackLabel || 'le composant'}
            </h2>
            <p className="text-sm text-slate-300 font-mono bg-slate-900/80 p-4 rounded-xl overflow-auto whitespace-pre-wrap">
              {this.state.error?.message}
            </p>
            <p className="text-xs text-slate-500 font-mono overflow-auto whitespace-pre-wrap">
              {this.state.error?.stack?.split('\n').slice(0, 8).join('\n')}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-5 py-2.5 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 font-bold transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
