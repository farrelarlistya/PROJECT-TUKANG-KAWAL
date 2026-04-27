export default function Spinner({ size = 10, className = '' }) {
  return (
    <div className={`inline-block w-${size} h-${size} border-4 border-brand/30 border-t-brand rounded-full animate-spin ${className}`} />
  );
}
