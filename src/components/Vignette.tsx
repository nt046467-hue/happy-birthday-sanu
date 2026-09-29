export default function Vignette() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[2] select-none"
      style={{
        background: 'radial-gradient(circle at 50% 50%, transparent 60%, rgba(13, 0, 16, 0.6) 100%)',
      }}
      aria-hidden="true"
    />
  );
}
