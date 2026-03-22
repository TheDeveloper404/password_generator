/**
 * Pattern Lock component.
 * A 3x3 grid where users draw a pattern to unlock the vault.
 * Supports touch and mouse input.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from '../../contexts/LanguageContext';

interface PatternLockProps {
  darkMode: boolean;
  onPatternComplete: (pattern: number[]) => void;
  error?: string;
  mode?: 'setup' | 'verify';
}

const GRID_SIZE = 3;
const DOT_RADIUS = 14;
const ACTIVE_RADIUS = 20;

export default function PatternLock({ darkMode, onPatternComplete, error, mode = 'verify' }: PatternLockProps) {
  const { t } = useTranslation();
  const [selectedDots, setSelectedDots] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getDotPosition = useCallback((index: number) => {
    const row = Math.floor(index / GRID_SIZE);
    const col = index % GRID_SIZE;
    const spacing = 80;
    const offset = 40;
    return {
      x: offset + col * spacing,
      y: offset + row * spacing,
    };
  }, []);

  const getEventPosition = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }, []);

  const getDotAtPosition = useCallback((pos: { x: number; y: number }) => {
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      const dotPos = getDotPosition(i);
      const dist = Math.sqrt((pos.x - dotPos.x) ** 2 + (pos.y - dotPos.y) ** 2);
      if (dist < ACTIVE_RADIUS + 10) return i;
    }
    return -1;
  }, [getDotPosition]);

  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const pos = getEventPosition(e);
    const dot = getDotAtPosition(pos);
    if (dot >= 0) {
      setSelectedDots([dot]);
      setIsDrawing(true);
      setCurrentPoint(pos);
    }
  }, [getEventPosition, getDotAtPosition]);

  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getEventPosition(e);
    setCurrentPoint(pos);
    const dot = getDotAtPosition(pos);
    if (dot >= 0 && !selectedDots.includes(dot)) {
      setSelectedDots(prev => [...prev, dot]);
    }
  }, [isDrawing, getEventPosition, getDotAtPosition, selectedDots]);

  const handleEnd = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setCurrentPoint(null);
    if (selectedDots.length >= 4) {
      onPatternComplete(selectedDots);
    }
    // Reset after a short delay for visual feedback
    setTimeout(() => setSelectedDots([]), 500);
  }, [isDrawing, selectedDots, onPatternComplete]);

  // Prevent scrolling while drawing
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const preventScroll = (e: TouchEvent) => {
      if (isDrawing) e.preventDefault();
    };
    container.addEventListener('touchmove', preventScroll, { passive: false });
    return () => container.removeEventListener('touchmove', preventScroll);
  }, [isDrawing]);

  const svgWidth = 200;
  const svgHeight = 200;

  return (
    <div className="flex flex-col items-center gap-4">
      <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        {mode === 'setup' ? t.patternSetup : t.patternDraw}
      </p>

      <div
        ref={containerRef}
        className={`relative rounded-2xl border-2 transition-colors cursor-pointer select-none ${
          error
            ? 'border-red-500/50'
            : isDrawing
              ? darkMode ? 'border-blue-500/50' : 'border-blue-400/50'
              : darkMode ? 'border-gray-700' : 'border-gray-200'
        } ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}
        style={{ width: svgWidth, height: svgHeight, touchAction: 'none' }}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      >
        <svg width={svgWidth} height={svgHeight} className="absolute inset-0">
          {/* Lines between selected dots */}
          {selectedDots.map((dot, i) => {
            if (i === 0) return null;
            const from = getDotPosition(selectedDots[i - 1]);
            const to = getDotPosition(dot);
            return (
              <line
                key={`line-${i}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={error ? '#ef4444' : '#3b82f6'}
                strokeWidth={3}
                strokeLinecap="round"
                opacity={0.6}
              />
            );
          })}

          {/* Line from last selected dot to current touch/mouse position */}
          {isDrawing && currentPoint && selectedDots.length > 0 && (
            <line
              x1={getDotPosition(selectedDots[selectedDots.length - 1]).x}
              y1={getDotPosition(selectedDots[selectedDots.length - 1]).y}
              x2={currentPoint.x}
              y2={currentPoint.y}
              stroke="#3b82f6"
              strokeWidth={2}
              strokeLinecap="round"
              opacity={0.3}
              strokeDasharray="4 4"
            />
          )}

          {/* Dots */}
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
            const pos = getDotPosition(i);
            const isSelected = selectedDots.includes(i);
            const isFirst = selectedDots[0] === i;
            return (
              <g key={`dot-${i}`}>
                {/* Outer ring for selected dots */}
                {isSelected && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={ACTIVE_RADIUS}
                    fill={error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.15)'}
                    stroke={error ? '#ef4444' : '#3b82f6'}
                    strokeWidth={1.5}
                    opacity={0.6}
                  />
                )}
                {/* Inner dot */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isSelected ? DOT_RADIUS : DOT_RADIUS - 4}
                  fill={
                    error
                      ? isSelected ? '#ef4444' : (darkMode ? '#4b5563' : '#d1d5db')
                      : isSelected
                        ? isFirst ? '#8b5cf6' : '#3b82f6'
                        : darkMode ? '#4b5563' : '#d1d5db'
                  }
                  className="transition-all duration-150"
                />
                {/* Inner white dot */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isSelected ? 5 : 3}
                  fill={isSelected ? 'white' : (darkMode ? '#6b7280' : '#9ca3af')}
                  className="transition-all duration-150"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {error && (
        <p className="text-xs text-red-500 font-medium">{error}</p>
      )}

      {selectedDots.length > 0 && selectedDots.length < 4 && (
        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          {t.patternMinDots}
        </p>
      )}
    </div>
  );
}
