"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error!}
            resetError={this.resetError}
          />
        );
      }

      return (
        <DefaultErrorFallback
          error={this.state.error!}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({
  error,
  resetError,
}: {
  error: Error;
  resetError: () => void;
}) {
  const isDatabaseError =
    error.message.includes("base de datos") ||
    error.message.includes("database") ||
    error.message.includes("Can't reach database server");

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <CardTitle className="text-lg font-semibold text-gray-900">
          {isDatabaseError ? "Error de Conexión" : "Algo salió mal"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-gray-600">
            {isDatabaseError
              ? "No se pudo conectar a la base de datos. Esto puede deberse a problemas de conexión a internet o configuración del servidor."
              : "Ocurrió un error inesperado. Por favor, inténtalo de nuevo."}
          </p>
        </div>

        <div className="bg-gray-50 p-3 rounded-md">
          <p className="text-xs text-gray-500 font-mono break-words">
            {error.message}
          </p>
        </div>

        <div className="flex flex-col space-y-2">
          <Button onClick={resetError} className="w-full" variant="default">
            <RefreshCw className="h-4 w-4 mr-2" />
            Intentar de nuevo
          </Button>

          {isDatabaseError && (
            <Button
              onClick={() => window.location.reload()}
              className="w-full"
              variant="outline"
            >
              Recargar página
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Hook para manejar errores de forma más simple
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error: Error) => {
    console.error("Error capturado:", error);
    setError(error);
  }, []);

  return { error, handleError, resetError };
}
