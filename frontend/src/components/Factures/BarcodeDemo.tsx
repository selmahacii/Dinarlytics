import React, { useEffect, useRef } from 'react';

interface Props {
  value: string;
  width?: number; // overall width
  height?: number; // bar height
}

/**
 * Demo-only barcode-like renderer (not scannable) to keep the demo fully static without deps.
 * It draws alternating bars based on the characters of the value.
 */
const BarcodeDemo: React.FC<Props> = ({ value, width = 180, height = 40 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(ratio, ratio);

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);

    // Generate bars from value
    const codes = value.split('').map((c, i) => c.charCodeAt(0) + i * 13);
    const bars = codes.map((code, i) => {
      const w = 1 + (code % 4); // 1..4 px
      const g = 1 + ((code >> 2) % 3); // 1..3 px gap
      return { w, g };
    });

    let x = 4; // left padding
    ctx.fillStyle = '#0f172a';
    for (let i = 0; i < bars.length; i++) {
      const { w, g } = bars[i];
      // draw narrow and wide bars in a simple pattern
      ctx.fillRect(x, 2, w, height - 4);
      x += w + g;
      if (x > width - 4) break; // stop at right padding
    }

    // Quiet zones
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, 4, height);
    ctx.fillRect(width - 4, 0, 4, height);
  }, [value, width, height]);

  return (
    <div className="inline-flex flex-col items-center" aria-label={`Code-barres démo pour ${value}`}>
      <canvas ref={canvasRef} role="img" aria-label={`Code-barres démo ${value}`} />
      <div className="text-[10px] text-slate-500 mt-1">{value}</div>
    </div>
  );
};

export default BarcodeDemo;
