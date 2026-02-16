import React, { useState, useRef, useCallback } from 'react';
import { WidgetElement } from '@/types/reportEditor';
import WidgetRenderer from './WidgetRenderer';

interface GridCanvasProps {
  elements: WidgetElement[];
  selectedElement: string | null;
  onElementSelect: (elementId: string | null) => void;
  onElementMove: (elementId: string, position: { x: number; y: number; w: number; h: number }) => void;
  onElementResize: (elementId: string, position: { x: number; y: number; w: number; h: number }) => void;
  gridSize: { columns: number; rows: number };
  isPreviewMode: boolean;
}

const GridCanvas: React.FC<GridCanvasProps> = ({
  elements,
  selectedElement,
  onElementSelect,
  onElementMove,
  onElementResize,
  gridSize,
  isPreviewMode
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // Calculer la taille de la grille
  const cellSize = 40; // Taille en pixels d'une cellule
  const canvasWidth = gridSize.columns * cellSize;
  const canvasHeight = gridSize.rows * cellSize;

  // Gérer le début du drag
  const handleMouseDown = useCallback((e: React.MouseEvent, elementId: string) => {
    if (isPreviewMode) return;
    
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    onElementSelect(elementId);
  }, [isPreviewMode, onElementSelect]);

  // Gérer le début du resize
  const handleResizeStart = useCallback((e: React.MouseEvent, elementId: string) => {
    if (isPreviewMode) return;
    
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    const element = elements.find(el => el.id === elementId);
    if (element) {
      setResizeStart({ 
        x: e.clientX, 
        y: e.clientY, 
        w: element.position.w, 
        h: element.position.h 
      });
    }
  }, [isPreviewMode, elements]);

  // Gérer le mouvement de la souris
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPreviewMode) return;

    if (isDragging && selectedElement) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      const element = elements.find(el => el.id === selectedElement);
      if (element && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const newX = Math.max(0, Math.min(
          gridSize.columns - element.position.w,
          Math.round((element.position.x * cellSize + deltaX) / cellSize)
        ));
        const newY = Math.max(0, Math.min(
          gridSize.rows - element.position.h,
          Math.round((element.position.y * cellSize + deltaY) / cellSize)
        ));
        
        if (newX !== element.position.x || newY !== element.position.y) {
          onElementMove(selectedElement, {
            ...element.position,
            x: newX,
            y: newY
          });
        }
      }
    }

    if (isResizing && selectedElement) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      const element = elements.find(el => el.id === selectedElement);
      if (element) {
        const newW = Math.max(1, Math.min(
          gridSize.columns - element.position.x,
          Math.round((resizeStart.w + deltaX / cellSize))
        ));
        const newH = Math.max(1, Math.min(
          gridSize.rows - element.position.y,
          Math.round((resizeStart.h + deltaY / cellSize))
        ));
        
        if (newW !== element.position.w || newH !== element.position.h) {
          onElementResize(selectedElement, {
            ...element.position,
            w: newW,
            h: newH
          });
        }
      }
    }
  }, [isDragging, isResizing, selectedElement, dragStart, resizeStart, elements, gridSize, onElementMove, onElementResize]);

  // Gérer la fin du drag/resize
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  // Générer les lignes de grille
  const renderGridLines = () => {
    const lines = [];
    
    // Lignes verticales
    for (let i = 0; i <= gridSize.columns; i++) {
      lines.push(
        <line
          key={`v-${i}`}
          x1={i * cellSize}
          y1={0}
          x2={i * cellSize}
          y2={canvasHeight}
          stroke="#e5e7eb"
          strokeWidth={1}
        />
      );
    }
    
    // Lignes horizontales
    for (let i = 0; i <= gridSize.rows; i++) {
      lines.push(
        <line
          key={`h-${i}`}
          x1={0}
          y1={i * cellSize}
          x2={canvasWidth}
          y2={i * cellSize}
          stroke="#e5e7eb"
          strokeWidth={1}
        />
      );
    }
    
    return lines;
  };

  return (
    <div className="relative">
      {/* Canvas SVG pour la grille */}
      <svg
        width={canvasWidth}
        height={canvasHeight}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      >
        {renderGridLines()}
      </svg>

      {/* Zone de travail */}
      <div
        ref={canvasRef}
        className="relative bg-white border border-gray-300 rounded-lg shadow-sm"
        style={{ 
          width: canvasWidth, 
          height: canvasHeight,
          minWidth: canvasWidth,
          minHeight: canvasHeight
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Éléments du rapport */}
        {elements.map((element) => (
          <div
            key={element.id}
            className={`absolute border-2 transition-all duration-200 ${
              selectedElement === element.id
                ? 'border-blue-500 shadow-lg'
                : 'border-transparent hover:border-gray-300'
            } ${isPreviewMode ? 'cursor-default' : 'cursor-move'}`}
            style={{
              left: element.position.x * cellSize,
              top: element.position.y * cellSize,
              width: element.position.w * cellSize,
              height: element.position.h * cellSize,
              zIndex: selectedElement === element.id ? 10 : 2
            }}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
          >
            {/* Contenu de l'élément */}
            <div className="w-full h-full p-2">
              <WidgetRenderer
                element={element}
                isPreviewMode={isPreviewMode}
              />
            </div>

            {/* Poignées de redimensionnement */}
            {!isPreviewMode && selectedElement === element.id && (
              <>
                {/* Poignée en bas à droite */}
                <div
                  className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize"
                  onMouseDown={(e) => handleResizeStart(e, element.id)}
                />
                
                {/* Poignée en bas */}
                <div
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 cursor-s-resize"
                  onMouseDown={(e) => handleResizeStart(e, element.id)}
                />
                
                {/* Poignée à droite */}
                <div
                  className="absolute top-1/2 right-0 transform -translate-y-1/2 w-3 h-3 bg-blue-500 cursor-e-resize"
                  onMouseDown={(e) => handleResizeStart(e, element.id)}
                />
              </>
            )}
          </div>
        ))}

        {/* Zone vide pour ajouter des éléments */}
        {elements.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-lg font-medium">Votre rapport vide</p>
              <p className="text-sm">Glissez des éléments depuis la palette</p>
            </div>
          </div>
        )}
      </div>

      {/* Informations de la grille */}
      <div className="mt-4 text-sm text-gray-500 text-center">
        Grille {gridSize.columns}×{gridSize.rows} • {elements.length} élément{elements.length > 1 ? 's' : ''}
      </div>
    </div>
  );
};

export default GridCanvas;


