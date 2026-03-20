import { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    // Log do erro (em produção, enviar para Sentry ou similar)
    console.error('[ErrorBoundary] Erro capturado:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
            <AlertTriangle size={32} className="text-destructive" />
          </div>
          <h2 className="font-heading text-xl font-bold text-foreground mb-2">
            Algo deu errado
          </h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            Ocorreu um erro inesperado nesta página. Tente recarregar ou voltar para o início.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={this.handleReset}
              className="gap-2"
            >
              <RefreshCw size={14} />
              Tentar novamente
            </Button>
            <Button
              onClick={() => window.location.href = '/'}
              className="gap-2"
            >
              Voltar ao início
            </Button>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-6 text-left max-w-lg w-full">
              <summary className="text-xs text-muted-foreground cursor-pointer">Detalhes do erro (dev)</summary>
              <pre className="mt-2 text-xs bg-muted p-3 rounded-lg overflow-auto text-destructive">
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
