import { Laptop, Monitor, Smartphone, Printer, Server, Box, Wifi, Settings } from 'lucide-react';
import { avatars } from '../assets/avatars';

/*
  Reference-matched layout:
  3 glowing rings (500→800→1200px) with sparkle dots and floating items.
  Ring 1: 2 per side (close to form)
  Ring 2: 3 per side (mid area)
  Ring 3: 4 per side (edges)
*/

const leftPool = [
  { type: 'avatar', idx: 0, size: 36 },
  { type: 'icon', Icon: Laptop, size: 18, color: '#60a5fa' },
  { type: 'avatar', idx: 2, size: 34 },
  { type: 'icon', Icon: Wifi, size: 16, color: '#22d3ee' },
  { type: 'avatar', idx: 4, size: 34 },
  { type: 'icon', Icon: Server, size: 16, color: '#f472b6' },
  { type: 'avatar', idx: 6, size: 32 },
  { type: 'icon', Icon: Smartphone, size: 14, color: '#34d399' },
  { type: 'avatar', idx: 7, size: 34 },
];

const rightPool = [
  { type: 'icon', Icon: Monitor, size: 18, color: '#a78bfa' },
  { type: 'avatar', idx: 1, size: 34 },
  { type: 'icon', Icon: Printer, size: 16, color: '#fbbf24' },
  { type: 'avatar', idx: 3, size: 36 },
  { type: 'icon', Icon: Settings, size: 14, color: '#94a3b8' },
  { type: 'avatar', idx: 5, size: 34 },
  { type: 'icon', Icon: Box, size: 14, color: '#818cf8' },
  { type: 'avatar', idx: 0, size: 34 },
  { type: 'icon', Icon: Laptop, size: 14, color: '#60a5fa' },
];

function computePositions() {
  const positions = [];
  let lIdx = 0, rIdx = 0;

  const rings = [
    { radius: 250, items: 2, spread: 60, push: 100 },
    { radius: 400, items: 3, spread: 80, push: 80 },
    { radius: 600, items: 4, spread: 100, push: 40 },
  ];

  rings.forEach(({ radius, items, spread, push }) => {
    for (let i = 0; i < items; i++) {
      const leftAngle = 180 - spread / 2 + (i * spread) / Math.max(items - 1, 1);
      const leftRad = (leftAngle * Math.PI) / 180;
      const lx = radius * Math.cos(leftRad) - push;
      const ly = radius * Math.sin(leftRad);

      positions.push({
        ...leftPool[lIdx % leftPool.length],
        tx: lx, ty: ly,
        delay: (lIdx + rIdx) * 0.4,
      });
      lIdx++;

      const rightAngle = 0 - spread / 2 + (i * spread) / Math.max(items - 1, 1);
      const rightRad = (rightAngle * Math.PI) / 180;
      const rx = radius * Math.cos(rightRad) + push;
      const ry = radius * Math.sin(rightRad);

      positions.push({
        ...rightPool[rIdx % rightPool.length],
        tx: rx, ty: ry,
        delay: (lIdx + rIdx) * 0.4,
      });
      rIdx++;
    }
  });

  return positions;
}

// Sparkle dots positioned along the ring arcs
function computeSparkles() {
  const sparkles = [];
  const rings = [
    { radius: 250, count: 3 },
    { radius: 400, count: 4 },
    { radius: 600, count: 5 },
  ];

  rings.forEach(({ radius, count }) => {
    for (let i = 0; i < count; i++) {
      // Distribute sparkles around the full circle
      const angle = (i * 360) / count + 15; // offset to avoid items
      const rad = (angle * Math.PI) / 180;
      sparkles.push({
        tx: radius * Math.cos(rad),
        ty: radius * Math.sin(rad),
        delay: i * 0.8,
        size: 3 + Math.random() * 3,
      });
    }
  });

  return sparkles;
}

const COMPUTED = computePositions();
const SPARKLES = computeSparkles();

export default function AuthDecorations() {
  return (
    <>
      {/* Glowing orbital rings */}
      <div className="auth-ring auth-ring-1" />
      <div className="auth-ring auth-ring-2" />
      <div className="auth-ring auth-ring-3" />

      {/* Sparkle dots along rings */}
      {SPARKLES.map((s, i) => (
        <div
          key={`sp-${i}`}
          className="auth-sparkle"
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(calc(-50% + ${s.tx}px), calc(-50% + ${s.ty}px))`,
            animationDelay: `${s.delay}s`,
            width: s.size,
            height: s.size,
          }}
        />
      ))}

      {/* Floating items on ring arcs */}
      {COMPUTED.map((item, i) => {
        const posStyle = {
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(calc(-50% + ${item.tx}px), calc(-50% + ${item.ty}px))`,
          zIndex: 5,
        };

        if (item.type === 'avatar') {
          return (
            <div
              key={`av-${i}`}
              className="auth-orbit-item"
              style={{ ...posStyle, animationDelay: `${item.delay}s` }}
            >
              <img
                src={avatars[item.idx % avatars.length]}
                alt=""
                style={{
                  width: item.size, height: item.size,
                  borderRadius: '50%', objectFit: 'cover',
                  border: '2px solid rgba(139,92,246,0.2)',
                  boxShadow: '0 0 12px rgba(139,92,246,0.15), 0 4px 16px rgba(0,0,0,0.3)',
                }}
              />
            </div>
          );
        }

        return (
          <div
            key={`ic-${i}`}
            className="auth-orbit-item"
            style={{
              ...posStyle,
              width: 36, height: 36,
              borderRadius: 12,
              background: 'rgba(139,92,246,0.06)',
              border: '1px solid rgba(139,92,246,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 12px rgba(139,92,246,0.1), 0 4px 20px rgba(0,0,0,0.3)',
              backdropFilter: 'blur(8px)',
              opacity: 0.65,
            }}
          >
            <item.Icon style={{ width: item.size, height: item.size, color: item.color }} />
          </div>
        );
      })}
    </>
  );
}
