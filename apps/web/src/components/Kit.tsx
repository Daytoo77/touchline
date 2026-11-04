import { useState } from 'react';
import type { Kit } from '@touchline/shared';

/** Tiny generated shirt (no crests, no logos). */
export function KitSwatch({ kit, size = 26 }: { kit: Kit; size?: number }) {
  const id = `k${kit.shirt.slice(1)}${kit.trim.slice(1)}${kit.pattern}`;
  return (
    <svg className="swatch" width={size} height={size * 1.15} viewBox="0 0 26 30" aria-hidden="true">
      <defs>
        <clipPath id={id}>
          <path d="M7 2 L2 6 L4 12 L7 11 L7 28 L19 28 L19 11 L22 12 L24 6 L19 2 L16 4 Q13 6 10 4 Z" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect width="26" height="30" fill={kit.shirt} />
        {kit.pattern === 'stripes' && [5, 11, 17].map((x) => <rect key={x} x={x} y="0" width="3" height="30" fill={kit.trim} />)}
        {kit.pattern === 'hoops' && [6, 13, 20].map((y) => <rect key={y} x="0" y={y} width="26" height="3.5" fill={kit.trim} />)}
        {kit.pattern === 'halves' && <rect x="13" y="0" width="13" height="30" fill={kit.trim} />}
        {kit.pattern === 'sash' && <path d="M2 4 L8 2 L26 24 L22 30 Z" fill={kit.trim} />}
      </g>
      <path d="M7 2 L2 6 L4 12 L7 11 L7 28 L19 28 L19 11 L22 12 L24 6 L19 2 L16 4 Q13 6 10 4 Z" fill="none" stroke="rgba(0,0,0,.45)" strokeWidth="1" />
    </svg>
  );
}

/**
 * Club badge: shows your own image at `public/crests/<club-id>.png` if you added one (that folder is
 * gitignored, so nothing is committed or published), otherwise the generated shirt.
 */
export function ClubBadge({ clubId, kit, size = 26 }: { clubId: string; kit: Kit; size?: number }) {
  const [missing, setMissing] = useState(false);
  if (missing) return <KitSwatch kit={kit} size={size} />;
  return (
    <img
      className="swatch"
      src={`${import.meta.env.BASE_URL}crests/${clubId}.png`}
      width={size}
      height={size * 1.15}
      style={{ objectFit: 'contain' }}
      alt=""
      onError={() => setMissing(true)}
    />
  );
}
