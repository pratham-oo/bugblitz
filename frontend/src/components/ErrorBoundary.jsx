import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // You can log the error here or send to Sentry
  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary caught an error]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-100 text-red-800 rounded-xl text-center">
          <h2 className="font-bold text-xl mb-2">Something went wrong 😬</h2>
          <p>{this.state.error?.message || "Please refresh or try again."}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
