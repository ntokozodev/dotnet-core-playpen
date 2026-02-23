export function LoadingSpinner(props: { label?: string }) {
  return (
    <div class="flex items-center gap-3 rounded border border-slate-200 bg-white p-4 text-slate-700" role="status" aria-live="polite">
      <span class="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-700" aria-hidden="true" />
      <span class="text-sm">{props.label ?? "Loading..."}</span>
    </div>
  );
}
