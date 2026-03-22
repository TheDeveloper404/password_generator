import { useEffect, useRef, useState, useCallback } from 'react';
import { Shield, Lock, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';
import type { VaultData, VaultEntry } from '../../types/vault';

interface PasswordMapProps {
  darkMode: boolean;
  vault: VaultData;
}

interface MapNode {
  entry: VaultEntry;
  x: number;
  y: number;
  radius: number;
  color: string;
  glowColor: string;
  score: number;
  vx: number;
  vy: number;
}

function scorePassword(pw: string): number {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s += 1;
  if (pw.length >= 12) s += 1;
  if (pw.length >= 16) s += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s += 1;
  if (/[0-9]/.test(pw)) s += 1;
  if (/[^A-Za-z0-9]/.test(pw)) s += 1;
  const poolSize =
    (/[a-z]/.test(pw) ? 26 : 0) +
    (/[A-Z]/.test(pw) ? 26 : 0) +
    (/[0-9]/.test(pw) ? 10 : 0) +
    (/[^A-Za-z0-9]/.test(pw) ? 33 : 0);
  const entropy = poolSize > 0 ? pw.length * Math.log2(poolSize) : 0;
  if (entropy >= 60) s += 2;
  else if (entropy >= 40) s += 1;
  return Math.min(10, s);
}

function scoreColor(score: number): { fill: string; glow: string } {
  if (score <= 2) return { fill: '#ef4444', glow: 'rgba(239,68,68,0.5)' };
  if (score <= 4) return { fill: '#f97316', glow: 'rgba(249,115,22,0.4)' };
  if (score <= 6) return { fill: '#eab308', glow: 'rgba(234,179,8,0.4)' };
  if (score <= 8) return { fill: '#22c55e', glow: 'rgba(34,197,94,0.4)' };
  return { fill: '#06b6d4', glow: 'rgba(6,182,212,0.5)' };
}

function scoreLabel(score: number, t: ReturnType<typeof useTranslation>['t']): string {
  if (score <= 2) return t.mapCritical;
  if (score <= 4) return t.mapWeak;
  if (score <= 6) return t.mapFair;
  if (score <= 8) return t.mapStrong;
  return t.mapExcellent;
}

export default function PasswordMap({ darkMode, vault }: PasswordMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<MapNode[]>([]);
  const animFrameRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<VaultEntry | null>(null);
  const [hoveredNode, setHoveredNode] = useState<MapNode | null>(null);
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  // Build nodes from vault entries
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const w = canvas.width;
    const h = canvas.height;
    const entries = vault.entries.filter((e) => e.password);

    nodesRef.current = entries.map((entry) => {
      const score = scorePassword(entry.password);
      const colors = scoreColor(score);
      const radius = 16 + score * 2.5;
      return {
        entry,
        x: radius + Math.random() * (w - radius * 2),
        y: radius + Math.random() * (h - radius * 2),
        radius,
        color: colors.fill,
        glowColor: colors.glow,
        score,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
      };
    });
  }, [vault]);

  // Animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const nodes = nodesRef.current;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Draw connecting lines between nearby nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const alpha = (1 - dist / 150) * 0.15;
          ctx.strokeStyle = darkMode
            ? `rgba(148,163,184,${alpha})`
            : `rgba(100,116,139,${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // Update + draw nodes
    const mouse = mouseRef.current;
    let foundHover: MapNode | null = null;
    const time = Date.now() / 1000;

    for (const node of nodes) {
      // Gentle floating
      node.x += node.vx;
      node.y += node.vy;

      // Bounce off walls
      if (node.x - node.radius < 0 || node.x + node.radius > w) node.vx *= -1;
      if (node.y - node.radius < 0 || node.y + node.radius > h) node.vy *= -1;
      node.x = Math.max(node.radius, Math.min(w - node.radius, node.x));
      node.y = Math.max(node.radius, Math.min(h - node.radius, node.y));

      // Simple repulsion between nodes
      for (const other of nodes) {
        if (other === node) continue;
        const dx = node.x - other.x;
        const dy = node.y - other.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = node.radius + other.radius + 8;
        if (dist < minDist && dist > 0) {
          const force = (minDist - dist) * 0.02;
          node.vx += (dx / dist) * force;
          node.vy += (dy / dist) * force;
        }
      }

      // Damping
      node.vx *= 0.99;
      node.vy *= 0.99;

      // Check hover
      const isHovered =
        mouse &&
        Math.sqrt((mouse.x - node.x) ** 2 + (mouse.y - node.y) ** 2) < node.radius;

      if (isHovered) foundHover = node;

      // Pulsating glow
      const pulsePhase = Math.sin(time * 2 + node.x * 0.01) * 0.3 + 0.7;
      const glowRadius = node.radius * (isHovered ? 2.2 : 1.6) * pulsePhase;

      // Outer glow
      const glow = ctx.createRadialGradient(
        node.x, node.y, node.radius * 0.5,
        node.x, node.y, glowRadius
      );
      glow.addColorStop(0, node.glowColor);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // Main circle
      const grad = ctx.createRadialGradient(
        node.x - node.radius * 0.3,
        node.y - node.radius * 0.3,
        node.radius * 0.1,
        node.x,
        node.y,
        node.radius
      );
      grad.addColorStop(0, node.color);
      grad.addColorStop(1, darkMode ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.15)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(node.x, node.y, isHovered ? node.radius * 1.15 : node.radius, 0, Math.PI * 2);
      ctx.fill();

      // Ring
      ctx.strokeStyle = isHovered ? '#fff' : node.color;
      ctx.lineWidth = isHovered ? 2.5 : 1.5;
      ctx.beginPath();
      ctx.arc(node.x, node.y, isHovered ? node.radius * 1.15 : node.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Icon / initial
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${Math.round(node.radius * 0.7)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const initial = node.entry.title ? node.entry.title.charAt(0).toUpperCase() : '?';
      ctx.fillText(initial, node.x, node.y);

      // Label on hover
      if (isHovered) {
        ctx.fillStyle = darkMode ? 'rgba(15,23,42,0.9)' : 'rgba(255,255,255,0.95)';
        const label = node.entry.title || node.entry.siteUrl || '—';
        ctx.font = '12px sans-serif';
        const metrics = ctx.measureText(label);
        const pad = 8;
        const bx = node.x - metrics.width / 2 - pad;
        const by = node.y - node.radius - 32;
        const bw = metrics.width + pad * 2;
        const bh = 22;

        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, 6);
        ctx.fill();
        ctx.strokeStyle = darkMode ? 'rgba(148,163,184,0.3)' : 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = darkMode ? '#e2e8f0' : '#1e293b';
        ctx.font = '11px sans-serif';
        ctx.fillText(label, node.x, by + bh / 2);
      }
    }

    setHoveredNode(foundHover);
    animFrameRef.current = requestAnimationFrame(animate);
  }, [darkMode]);

  // Start / stop animation
  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [animate]);

  // Resize handler
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = Math.max(400, rect.height);
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // Mouse tracking
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = null;
  }, []);

  const handleClick = useCallback(() => {
    if (hoveredNode) {
      setSelectedEntry(hoveredNode.entry);
    }
  }, [hoveredNode]);

  // Stats
  const entries = vault.entries.filter((e) => e.password);
  const scores = entries.map((e) => scorePassword(e.password));
  const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const critical = scores.filter((s) => s <= 2).length;
  const strong = scores.filter((s) => s > 6).length;

  if (entries.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-16 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        <Shield size={48} className="mb-4 opacity-20" />
        <p className="text-sm">{t.mapEmpty}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-lg font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <Shield size={20} className="text-blue-500" />
            {t.mapTitle}
          </h2>
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {t.mapDesc}
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: t.mapTotal, value: entries.length, icon: Shield, color: 'text-blue-500', bg: darkMode ? 'bg-blue-500/10' : 'bg-blue-50' },
          { label: t.mapAvgScore, value: avg.toFixed(1), icon: CheckCircle, color: avg > 6 ? 'text-emerald-500' : avg > 4 ? 'text-amber-500' : 'text-red-500', bg: darkMode ? 'bg-gray-700/50' : 'bg-gray-50' },
          { label: t.mapCritical, value: critical, icon: AlertTriangle, color: 'text-red-500', bg: darkMode ? 'bg-red-500/10' : 'bg-red-50' },
          { label: t.mapStrongCount, value: strong, icon: Lock, color: 'text-emerald-500', bg: darkMode ? 'bg-emerald-500/10' : 'bg-emerald-50' },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-xl p-3 text-center ${stat.bg}`}>
            <stat.icon size={16} className={`mx-auto mb-1 ${stat.color}`} />
            <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</div>
            <div className={`text-[10px] ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4">
        {[
          { color: '#ef4444', label: t.mapCritical },
          { color: '#f97316', label: t.mapWeak },
          { color: '#eab308', label: t.mapFair },
          { color: '#22c55e', label: t.mapStrong },
          { color: '#06b6d4', label: t.mapExcellent },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color, boxShadow: `0 0 6px ${l.color}` }} />
            <span className={`text-[10px] ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className={`relative rounded-2xl overflow-hidden border ${darkMode ? 'border-gray-700/50 bg-gray-900/80' : 'border-gray-200 bg-gradient-to-br from-slate-50 to-gray-100'}`}
        style={{ minHeight: 400 }}
      >
        <canvas
          ref={canvasRef}
          className="block w-full"
          style={{ cursor: hoveredNode ? 'pointer' : 'default', minHeight: 400 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        />
      </div>

      {/* Selected entry detail panel */}
      {selectedEntry && (
        <div className={`rounded-xl border p-4 space-y-3 animate-in fade-in duration-200 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className="flex items-center justify-between">
            <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {selectedEntry.title || selectedEntry.siteUrl || '—'}
            </h3>
            <button onClick={() => setSelectedEntry(null)} className={`p-1 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
              <X size={16} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className={`text-[10px] uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{t.mapScore}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: scoreColor(scorePassword(selectedEntry.password)).fill }} />
                <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {scorePassword(selectedEntry.password)}/10
                </span>
                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  ({scoreLabel(scorePassword(selectedEntry.password), t)})
                </span>
              </div>
            </div>
            <div>
              <p className={`text-[10px] uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{t.mapLength}</p>
              <p className={`text-sm font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedEntry.password.length} {t.mapChars}
              </p>
            </div>
            {selectedEntry.siteUrl && (
              <div>
                <p className={`text-[10px] uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{t.mapUrl}</p>
                <p className={`text-xs mt-1 truncate ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{selectedEntry.siteUrl}</p>
              </div>
            )}
            {selectedEntry.username && (
              <div>
                <p className={`text-[10px] uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{t.mapUser}</p>
                <p className={`text-xs mt-1 truncate ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{selectedEntry.username}</p>
              </div>
            )}
          </div>
          {/* Strength bar */}
          <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div
              className="h-full transition-all duration-500 rounded-full"
              style={{
                width: `${scorePassword(selectedEntry.password) * 10}%`,
                backgroundColor: scoreColor(scorePassword(selectedEntry.password)).fill,
                boxShadow: `0 0 8px ${scoreColor(scorePassword(selectedEntry.password)).glow}`,
              }}
            />
          </div>
        </div>
      )}

      <p className={`text-[10px] text-center ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
        {t.mapHint}
      </p>
    </div>
  );
}
