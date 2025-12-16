import React, { ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gaming-800/50 border border-red-900/50 rounded-xl text-center shadow-xl animate-fade-in backdrop-blur-sm min-h-[300px]">
          <div className="bg-red-900/30 p-4 rounded-full mb-4 border border-red-500/20">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-200 mb-2">System Module Error</h2>
          <p className="text-gray-400 mb-6 max-w-sm text-sm">
            A critical component failed to render. This might be due to a connectivity issue or data feed interruption.
          </p>
          {this.state.error && (
            <div className="bg-black/40 p-3 rounded border border-gaming-700 w-full max-w-md mb-6 overflow-auto max-h-32 text-left">
              <code className="text-xs text-red-300 font-mono break-all whitespace-pre-wrap">
                {this.state.error.message}
              </code>
            </div>
          )}
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-gaming-700 hover:bg-gaming-600 text-gray-200 rounded-lg transition-colors border border-gaming-600 text-sm font-medium uppercase tracking-wide"
          >
            <RefreshCw size={14} />
            Re-Initialize
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;