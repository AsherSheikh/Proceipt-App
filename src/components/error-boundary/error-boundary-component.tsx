import React, { Component, ErrorInfo } from 'react';
import { Button, DevSettings, SafeAreaView, Text, View } from 'react-native';
import { useTheme } from 'theme';

import Styles from './error-boundary-component-styles';

export type ErrorBoundaryProps = {
  componentName?: string;
  children?: React.ReactNode;
  onReset?: () => void;
  renderFallback?: ((onReset: () => void) => JSX.Element) | (() => JSX.Element);
  reportError?: (details: {
    error: Error | null;
    info: ErrorInfo;
    componentName?: string;
  }) => void;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export interface ErrorComponentProps {
  onReset(): void;
}

export const ErrorComponent = ({ onReset }: ErrorComponentProps) => {
  const [styles] = useTheme(Styles);
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container}>
        <View style={styles.bottom}>
          <Text style={styles.title}>We're sorry...</Text>
          <Text style={styles.subtitle}>
            An error occured. Please reload app
          </Text>
        </View>
        <Button onPress={onReset} title="Reload App" />
      </SafeAreaView>
    </View>
  );
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error | null, info: ErrorInfo) {
    const { componentName, reportError } = this.props;

    if (reportError) {
      reportError({ error, info, componentName });
    }
  }

  handleReset = () => {
    this.props.onReset && this.props.onReset();
    this.setState({ hasError: false });
    DevSettings.reload();
  };

  // To avoid unnecessary re-renders
  shouldComponentUpdate(
    nextProps: Readonly<any>,
    nextState: Readonly<any>,
  ): boolean {
    return nextState.error !== nextProps.error;
  }

  render() {
    const { hasError } = this.state;
    const {
      children,
      renderFallback = () => <ErrorComponent onReset={this.handleReset} />,
    } = this.props;

    return hasError ? renderFallback(this.handleReset) : children;
  }
}

export default ErrorBoundary;
