import React, { useEffect, useRef, useState } from 'react';

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
  onCancel?: () => void;
  className?: string;
}

// Lightweight canvas signature pad with mouse and touch support (no external deps)
const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, onCancel, className }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const drawing = useRef(false);
  const [isEmpty, setIsEmpty] = useState(true);

  // Adjust canvas for device pixel ratio and container width
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = Math.max(window.devicePixelRatio || 1, 1);
    const rect = container.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.max(180, Math.floor(rect.width * 0.3));

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    // background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    // guide line
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(16, height - 32);
    ctx.lineTo(width - 16, height - 32);
    ctx.stroke();
  };

  useEffect(() => {
    resizeCanvas();
    const onResize = () => resizeCanvas();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const getCtx = () => canvasRef.current?.getContext('2d') || null;

  const getRelativePos = (e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    let clientX = 0, clientY = 0;
    if (e instanceof TouchEvent) {
      const t = e.touches[0] || e.changedTouches[0];
      if (!t) return { x: 0, y: 0 };
      clientX = t.clientX;
      clientY = t.clientY;
    } else {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    }
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = (e: MouseEvent | TouchEvent) => {
    const ctx = getCtx();
    if (!ctx) return;
    const { x, y } = getRelativePos(e);
    drawing.current = true;
    setIsEmpty(false);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: MouseEvent | TouchEvent) => {
    if (!drawing.current) return;
    const ctx = getCtx();
    if (!ctx) return;
    const { x, y } = getRelativePos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    drawing.current = false;
  };

  // Mouse handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e: MouseEvent) => { e.preventDefault(); startDrawing(e); };
    const handleMouseMove = (e: MouseEvent) => draw(e);
    const handleMouseUp = () => stopDrawing();
    const handleMouseLeave = () => stopDrawing();

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Touch handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const opts: AddEventListenerOptions = { passive: false };

    const handleTouchStart = (e: TouchEvent) => { e.preventDefault(); startDrawing(e); };
    const handleTouchMove = (e: TouchEvent) => { e.preventDefault(); draw(e); };
    const handleTouchEnd = () => stopDrawing();

    canvas.addEventListener('touchstart', handleTouchStart, opts);
    canvas.addEventListener('touchmove', handleTouchMove, opts);
    canvas.addEventListener('touchend', handleTouchEnd, opts);

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx) return;
    setIsEmpty(true);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    resizeCanvas();
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  };

  return (
    <div className={className}>
      <div className="space-y-3">
        <p id="sig-instructions" className="text-sm text-slate-600">
          Signez dans la zone ci-dessous avec la souris ou le doigt. Utilisez Effacer pour recommencer.
        </p>
        <div ref={containerRef} className="w-full border-2 border-dashed border-slate-300 rounded-xl bg-white">
          <canvas
            ref={canvasRef}
            role="img"
            aria-label="Zone de signature"
            aria-describedby="sig-instructions"
            className="block rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-3 justify-end">
          <button
            type="button"
            onClick={clear}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
            aria-label="Effacer la signature"
            title="Effacer la signature"
          >
            Effacer
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              aria-label="Annuler la signature"
              title="Annuler la signature"
            >
              Annuler
            </button>
          )}
          <button
            type="button"
            onClick={save}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            aria-label="Enregistrer la signature"
            title="Enregistrer la signature"
            disabled={isEmpty}
          >
            Enregistrer la signature
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignaturePad;
