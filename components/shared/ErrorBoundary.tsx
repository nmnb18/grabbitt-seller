/**
 * Global Error Boundary
 * Catches React errors and displays a friendly recovery screen
 */

import React, { Component, ErrorInfo, ReactNode } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// expo-updates types - may not be available in dev builds
let Updates: { reloadAsync?: () => Promise<void> } = {};
try {
  Updates = require("expo-updates");
} catch {
  // expo-updates not available in development builds
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console (in production, send to error tracking service)
    console.error("ErrorBoundary caught an error:", error);
    console.error("Component stack:", errorInfo.componentStack);

    this.setState({ errorInfo });

    // TODO: Send to error tracking service like Sentry
    // Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
  }

  handleRestart = async () => {
    try {
      // Try to reload the app using Expo Updates
      if (!__DEV__) {
        await Updates.reloadAsync();
      } else {
        // In development, just reset the error state
        this.setState({ hasError: false, error: null, errorInfo: null });
      }
    } catch (e) {
      // If reload fails, just reset state
      this.setState({ hasError: false, error: null, errorInfo: null });
    }
  };

  handleResetState = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            {/* Error Icon */}
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={80}
                color="#EF4444"
              />
            </View>

            {/* Error Message */}
            <Text style={styles.title}>Oops! Something went wrong</Text>
            <Text style={styles.message}>
              The app encountered an unexpected error. Don't worry, your data is safe.
            </Text>

            {/* Error Details (Development only) */}
            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorTitle}>Error Details:</Text>
                <Text style={styles.errorText} numberOfLines={3}>
                  {this.state.error.toString()}
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={this.handleRestart}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="restart" size={20} color="#fff" />
                <Text style={styles.primaryButtonText}>Restart App</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={this.handleResetState}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>

            {/* Support Info */}
            <Text style={styles.supportText}>
              If this keeps happening, please contact{"\n"}
              <Text style={styles.supportEmail}>support@grabbitt.in</Text>
            </Text>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC to wrap any component with error boundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A", // Dark background
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#F8FAFC",
    textAlign: "center",
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  errorDetails: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: "100%",
    maxWidth: 320,
  },
  errorTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#EF4444",
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: "#F87171",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 280,
    gap: 12,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#6366F1", // Indigo
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#94A3B8",
    fontSize: 16,
    fontWeight: "500",
  },
  supportText: {
    marginTop: 32,
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
  supportEmail: {
    color: "#6366F1",
    fontWeight: "500",
  },
});

export default ErrorBoundary;
