import { Button } from "@/components/ui/Button";

interface AsyncBoundaryProps {
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  isEmpty?: boolean;
  emptyMessage?: string;
  loadingMessage?: string;
  children: React.ReactNode;
  onRetry?: () => void;
}

function LoadingSpinner({ message = "Memuat..." }: { message?: string }) {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <span className="font-sans text-sm text-text-light tracking-widest uppercase animate-pulse">
        {message}
      </span>
    </div>
  );
}

function ErrorDisplay({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-4">
      <p className="text-sm text-rose-600">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Coba Lagi
        </Button>
      )}
    </div>
  );
}

function EmptyState({ message = "Tidak ada data." }: { message?: string }) {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <p className="text-sm text-text-light">{message}</p>
    </div>
  );
}

export default function AsyncBoundary({
  isLoading,
  isError,
  error,
  isEmpty = false,
  emptyMessage,
  loadingMessage,
  children,
  onRetry,
}: AsyncBoundaryProps) {
  if (isLoading) {
    return <LoadingSpinner message={loadingMessage} />;
  }

  if (isError) {
    return (
      <ErrorDisplay
        message={error?.message ?? "Gagal memuat data."}
        onRetry={onRetry}
      />
    );
  }

  if (isEmpty) {
    return <EmptyState message={emptyMessage} />;
  }

  return <>{children}</>;
}
