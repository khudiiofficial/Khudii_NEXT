export default function Loading() {
  return (
    <div className="flex min-h-[320px] w-full items-center justify-center" role="status" aria-label="Loading page">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#e7001e] border-t-transparent" />
    </div>
  );
}
