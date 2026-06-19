import React from 'react';
import { AlertCircle } from 'lucide-react';
import Button from './Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught rendering exception:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-rose-50/50 border border-rose-100 rounded-2xl text-center space-y-4 my-6">
          <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-rose-800">Profile Section Render Error</h3>
            <p className="text-xs text-rose-600 font-semibold max-w-md mx-auto leading-normal">
              {this.state.error?.message || "An unexpected error occurred while loading this view."}
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <Button 
              type="button"
              variant="destructive"
              onClick={() => { this.setState({ hasError: false }); }}
              className="text-xs font-bold px-4 py-2"
            >
              Reset View
            </Button>
            <Button 
              type="button"
              variant="secondary"
              onClick={() => { window.location.reload(); }}
              className="text-xs font-bold px-4 py-2 border-slate-200"
            >
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
