import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an unexpected error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center select-none font-sans">
          <div className="max-w-md w-full p-8 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-6">
            <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto shadow-sm">
              <svg className="w-8 h-8 text-rose-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-black text-slate-800 tracking-tight">Something went wrong</h1>
              <p className="text-sm text-slate-500 font-semibold leading-relaxed">
                An unexpected application rendering error occurred. The system has automatically intercepted the crash.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-left">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Error Diagnostics</span>
              <code className="text-xs text-rose-600 font-mono break-all leading-normal font-semibold">
                {this.state.error?.message || String(this.state.error || 'Unknown Error')}
              </code>
            </div>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.href = '/';
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition-all duration-200 shadow-md shadow-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-[0.98]"
            >
              Return to Home Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
