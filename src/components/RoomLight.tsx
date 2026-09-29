/**
 * RoomLight — radial gradient overlay driven by candle state.
 * Animate only opacity via CSS transition (no filter/backdrop-filter).
 */

interface RoomLightProps {
  mode: 'off' | 'warm' | 'dim' | 'dark';
}

export default function RoomLight({ mode }: RoomLightProps) {
  const classMap = {
    off: '',
    warm: 'room-light--warm',
    dim: 'room-light--dim',
    dark: 'room-light--dark',
  };

  return (
    <div
      className={`room-light ${classMap[mode]}`}
      style={{ opacity: mode === 'off' ? 0 : 1 }}
      aria-hidden="true"
    />
  );
}
