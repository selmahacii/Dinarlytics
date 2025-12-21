import React, { useEffect, useRef } from 'react';

interface QrDemoProps {
  value: string;
  size?: number; // pixel size
  className?: string;
}

// Demo-only QR-like renderer (not scannable). Deterministic pattern based on value hash.
// Keeps the app fully static and dependency-free for demos.
const QrDemo: React.FC<QrDemoProps> = ({ value, size = 80, className }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const modules = 29; // pseudo-QR grid
    const pad = 2; // quiet zone in modules
    const width = size;
    const height = size;
    const cell = Math.floor(width / (modules + pad * 2));
    const gridSize = cell * (modules + pad * 2);

    canvas.width = gridSize * dpr;
    canvas.height = gridSize * dpr;
    canvas.style.width = gridSize + 'px';
    canvas.style.height = gridSize + 'px';

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, gridSize, gridSize);

    // Simple hash
    const hash = (str: string) => {
      let h = 5381;
      for (let i = 0; i < str.length; i++) h = ((h << 5) + h) + str.charCodeAt(i);
      return Math.abs(h >>> 0);
    };

    let seed = hash(value || 'demo');
    const rnd = () => {
      // LCG
      seed = (seed * 1664525 + 1013904223) % 0xffffffff;
      return seed / 0xffffffff;
    };

    // Draw finder-like squares at 3 corners (for aesthetics)
    const drawFinder = (gx: number, gy: number) => {
      const baseX = (gx + pad) * cell;
      const baseY = (gy + pad) * cell;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(baseX, baseY, cell * 7, cell * 7);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(baseX + cell, baseY + cell, cell * 5, cell * 5);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(baseX + cell * 2, baseY + cell * 2, cell * 3, cell * 3);
    };

    drawFinder(0, 0);
    drawFinder(modules - 7, 0);
    drawFinder(0, modules - 7);

    // Reserve finder areas
    const isReserved = (x: number, y: number) => {
      const inTopLeft = x < 7 && y < 7;
      const inTopRight = x >= modules - 7 && y < 7;
      const inBottomLeft = x < 7 && y >= modules - 7;
      return inTopLeft || inTopRight || inBottomLeft;
    };

    // Fill pattern
    for (let y = 0; y < modules; y++) {
      for (let x = 0; x < modules; x++) {
        if (isReserved(x, y)) continue;
        const on = rnd() > 0.55; // density
        if (on) {
          ctx.fillStyle = '#0f172a';
          const px = (x + pad) * cell;
          const py = (y + pad) * cell;
          ctx.fillRect(px, py, cell, cell);
        }
      }
    }
  }, [value, size]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      role="img"
      aria-label={`QR démo pour ${value}`}
    />
  );
};

export default QrDemo;
