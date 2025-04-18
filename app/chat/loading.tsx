import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-full w-full min-h-[300px]">
      <LoadingSpinner />
      <span className="ml-3 text-muted-foreground">Loading chat...</span>
    </div>
  );
}
