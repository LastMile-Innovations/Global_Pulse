export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center">
        <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin-slow mb-4" />
        <span className="text-muted-foreground text-lg font-medium">Loading...</span>
      </div>
    </div>
  );
}
