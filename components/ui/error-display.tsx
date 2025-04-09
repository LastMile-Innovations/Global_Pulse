import { AlertTriangle } from "lucide-react";

interface ErrorDisplayProps {
  message: string;
  details?: string;
}

export function ErrorDisplay({ message, details }: ErrorDisplayProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-sm text-destructive"
      role="alert"
    >
      <AlertTriangle className="h-6 w-6" />
      <p className="font-medium">{message}</p>
      {details && <p className="text-xs">{details}</p>}
    </div>
  );
}
