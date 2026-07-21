export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-border border-t-primary animate-spin" />
        <p className="text-sm text-muted-foreground font-medium">Memuat halaman...</p>
      </div>
    </div>
  )
}
