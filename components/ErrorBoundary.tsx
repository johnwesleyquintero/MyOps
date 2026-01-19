import React, { Component, ErrorInfo, ReactNode } from "react";
import { Icon } from "./Icons";
import { toast } from "sonner";

interface Props {
  children: ReactNode;
  mode?: "DEMO" | "LIVE";
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    copied: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null, copied: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
    });
    window.location.reload();
  };

  private handleCopyMarkdown = () => {
    const { error, errorInfo } = this.state;
    const md = `
# Error Report
**Date:** ${new Date().toLocaleString()}
**User Agent:** ${navigator.userAgent}

## Exception: ${error?.name}
> ${error?.message}

### Stack Trace
\`\`\`
${error?.stack}
\`\`\`

${
  errorInfo
    ? `### Component Stack
\`\`\`
${errorInfo.componentStack}
\`\`\``
    : ""
}
    `.trim();

    navigator.clipboard.writeText(md).then(() => {
      this.setState({ copied: true });
      toast.success("Error report copied", {
        description: "Paste it into the support channel or AI assistant.",
        icon: <Icon.Copy size={14} />,
      });
      setTimeout(() => this.setState({ copied: false }), 2000);
    });
  };

  public render() {
    if (this.state.hasError) {
      const isDev =
        process.env.NODE_ENV === "development" || this.props.mode === "DEMO";

      if (isDev) {
        // --- DEV / DEBUG VIEW ---
        return (
          <div className="min-h-screen bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text p-8 font-mono overflow-auto transition-colors">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center gap-4 text-red-600 dark:text-red-400 border-b border-notion-light-border dark:border-notion-dark-border pb-4">
                <Icon.Alert size={48} />
                <div>
                  <h1 className="text-2xl font-black uppercase tracking-tighter">
                    System Malfunction
                  </h1>
                  <p className="notion-label">Developer Context Enabled</p>
                </div>
              </div>

              <div className="notion-card p-6 space-y-4 border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-900/10">
                <h2 className="text-lg font-bold text-red-600 dark:text-red-400">
                  Exception: {this.state.error?.name}
                </h2>
                <p className="text-sm bg-notion-light-hover dark:bg-notion-dark-hover p-4 rounded-lg border border-notion-light-border dark:border-notion-dark-border">
                  {this.state.error?.message}
                </p>

                <div className="space-y-2">
                  <h3 className="notion-label">Stack Trace</h3>
                  <pre className="text-[10px] leading-relaxed bg-notion-light-sidebar dark:bg-notion-dark-sidebar p-4 rounded-lg overflow-x-auto border border-notion-light-border dark:border-notion-dark-border whitespace-pre-wrap">
                    {this.state.error?.stack}
                  </pre>
                </div>

                {this.state.errorInfo && (
                  <div className="space-y-2">
                    <h3 className="notion-label">Component Stack</h3>
                    <pre className="text-[10px] leading-relaxed bg-notion-light-sidebar dark:bg-notion-dark-sidebar p-4 rounded-lg overflow-x-auto border border-notion-light-border dark:border-notion-dark-border whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={this.handleReset}
                  className="notion-button notion-button-danger px-6 py-2.5 font-bold"
                >
                  Hard Reset
                </button>
                <button
                  onClick={this.handleCopyMarkdown}
                  className={`notion-button px-6 py-2.5 font-bold ${
                    this.state.copied
                      ? "bg-green-600 dark:bg-green-500/20 text-white dark:text-green-400 border-transparent dark:border-green-500/30"
                      : "border-notion-light-border dark:border-notion-dark-border"
                  }`}
                >
                  {this.state.copied ? (
                    <>
                      <Icon.Check size={18} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Icon.Copy size={18} />
                      Copy Context (MD)
                    </>
                  )}
                </button>
                <button
                  onClick={() => (window.location.href = "/")}
                  className="notion-button px-6 py-2.5 border-notion-light-border dark:border-notion-dark-border"
                >
                  Return to Base
                </button>
              </div>
            </div>
          </div>
        );
      }

      // --- PROD / PUBLIC VIEW ---
      return (
        <div className="min-h-screen bg-notion-light-bg dark:bg-notion-dark-bg flex items-center justify-center p-6 transition-colors">
          <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
            <div className="w-24 h-24 bg-notion-light-hover dark:bg-notion-dark-hover rounded-full flex items-center justify-center mx-auto border border-notion-light-border dark:border-notion-dark-border">
              <Icon.Bot
                size={48}
                className="text-notion-light-text dark:text-notion-dark-text"
              />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-black text-notion-light-text dark:text-notion-dark-text uppercase tracking-tight">
                Cockpit Offline
              </h1>
              <p className="text-notion-light-muted dark:text-notion-dark-muted font-medium">
                We've encountered an unexpected turbulence. Your data is safe,
                but the interface needs a quick restart.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReset}
                className="w-full notion-button notion-button-primary py-3.5 text-base"
              >
                Restart Cockpit
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="w-full notion-button py-3.5 text-base border-notion-light-border dark:border-notion-dark-border"
              >
                Back to Dashboard
              </button>
            </div>

            <p className="notion-label">
              Error ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
