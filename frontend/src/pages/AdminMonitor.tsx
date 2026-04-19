import { useState, useEffect, useCallback, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canAccessPlanner } from './Planner';
import { apiFetch } from '../utils/api';

// ── Types ───────────────────────────────────────────────────────
interface DbEvent {
  id: string;
  model: string;
  action: 'create' | 'update' | 'delete';
  recordId: string;
  summary: string;
  details: Record<string, any>;
  severity: 'info' | 'success' | 'warning' | 'critical';
  timestamp: string;
}

interface Stats {
  total: number;
  byModel: Record<string, number>;
  byAction: Record<string, number>;
  bySeverity: Record<string, number>;
  last24h: number;
  lastHour: number;
}

interface NotifConfig {
  watchedModels: string[];
  discordEnabled: boolean;
  emailEnabled: boolean;
  allModels: string[];
}

// ── Constants ───────────────────────────────────────────────────
const MODEL_COLORS: Record<string, string> = {
  User: '#10b981', ProviderProfile: '#0f3460', EventRequest: '#8b5cf6',
  Quote: '#f59e0b', Booking: '#e94560', Payment: '#ec4899',
  Review: '#f97316', Message: '#06b6d4', MenuItem: '#84cc16',
  Service: '#6366f1', PricingLevel: '#14b8a6', Favorite: '#f43f5e',
  PortfolioItem: '#a855f7', Notification: '#64748b', MenuItemPricingTier: '#84cc16',
};

const MODEL_ICONS: Record<string, string> = {
  User: '👤', ProviderProfile: '🏪', EventRequest: '📋', Quote: '💬',
  Booking: '📅', Payment: '💳', Review: '⭐', Message: '💬',
  MenuItem: '🍽️', Service: '🔧', PricingLevel: '💰', Favorite: '❤️',
  PortfolioItem: '📸', Notification: '🔔', MenuItemPricingTier: '🏷️',
};

const SEVERITY_COLORS: Record<string, string> = {
  info: '#3b82f6', success: '#10b981', warning: '#f59e0b', critical: '#e94560',
};

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  create: { label: 'NEW', color: '#10b981' },
  update: { label: 'UPD', color: '#f59e0b' },
  delete: { label: 'DEL', color: '#e94560' },
};

// ── Graph node positions (entity relationship layout) ───────────
interface GraphNode {
  id: string;
  label: string;
  icon: string;
  x: number;
  y: number;
  color: string;
}

interface GraphEdge {
  from: string;
  to: string;
  label?: string;
}

const NODES: GraphNode[] = [
  { id: 'User', label: 'User', icon: '👤', x: 80, y: 180, color: '#10b981' },
  { id: 'ProviderProfile', label: 'Provider', icon: '🏪', x: 540, y: 60, color: '#0f3460' },
  { id: 'EventRequest', label: 'Event Request', icon: '📋', x: 250, y: 80, color: '#8b5cf6' },
  { id: 'Quote', label: 'Quote', icon: '💬', x: 400, y: 180, color: '#f59e0b' },
  { id: 'Booking', label: 'Booking', icon: '📅', x: 300, y: 300, color: '#e94560' },
  { id: 'Payment', label: 'Payment', icon: '💳', x: 480, y: 360, color: '#ec4899' },
  { id: 'Review', label: 'Review', icon: '⭐', x: 140, y: 370, color: '#f97316' },
  { id: 'MenuItem', label: 'Menu Item', icon: '🍽️', x: 680, y: 180, color: '#84cc16' },
  { id: 'Service', label: 'Service', icon: '🔧', x: 700, y: 290, color: '#6366f1' },
  { id: 'Message', label: 'Message', icon: '💬', x: 80, y: 60, color: '#06b6d4' },
];

const EDGES: GraphEdge[] = [
  { from: 'User', to: 'EventRequest', label: 'creates' },
  { from: 'User', to: 'Message', label: 'sends' },
  { from: 'User', to: 'Review', label: 'writes' },
  { from: 'EventRequest', to: 'Quote', label: 'receives' },
  { from: 'ProviderProfile', to: 'Quote', label: 'sends' },
  { from: 'ProviderProfile', to: 'MenuItem', label: 'offers' },
  { from: 'ProviderProfile', to: 'Service', label: 'provides' },
  { from: 'Quote', to: 'Booking', label: 'becomes' },
  { from: 'Booking', to: 'Payment', label: 'triggers' },
  { from: 'Booking', to: 'Review', label: 'receives' },
];

// ── SVG helpers ─────────────────────────────────────────────────
const NODE_W = 110;
const NODE_H = 52;

function edgePath(from: GraphNode, to: GraphNode): string {
  const x1 = from.x + NODE_W / 2, y1 = from.y + NODE_H / 2;
  const x2 = to.x + NODE_W / 2, y2 = to.y + NODE_H / 2;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const dx = x2 - x1, dy = y2 - y1;
  const cx = mx - dy * 0.15, cy = my + dx * 0.15;
  return `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`;
}

// ── Main Component ──────────────────────────────────────────────
export default function AdminMonitor() {
  const { user, token } = useAuth();

  if (!canAccessPlanner(user?.email)) {
    return <Navigate to="/" replace />;
  }

  const [events, setEvents] = useState<DbEvent[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [config, setConfig] = useState<NotifConfig | null>(null);
  const [modelFilter, setModelFilter] = useState<string>('');
  const [pulsingNodes, setPulsingNodes] = useState<Set<string>>(new Set());
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string>('');
  const [showConfig, setShowConfig] = useState(false);
  const [pollInterval, setPollInterval] = useState(5);
  const lastEventId = useRef<string>('');

  // ── Fetch events ────────────────────────────────────────────
  const fetchEvents = useCallback(async () => {
    if (!token) return;
    try {
      const url = modelFilter ? `/admin/events?limit=150&model=${modelFilter}` : '/admin/events?limit=150';
      const res = await apiFetch<{ success: boolean; data: DbEvent[] }>(url, { token });
      if (res.success) {
        // Detect new events for pulse animation
        if (events.length > 0 && res.data.length > 0 && res.data[0].id !== lastEventId.current) {
          const newModels = new Set<string>();
          for (const e of res.data) {
            if (e.id === lastEventId.current) break;
            newModels.add(e.model);
          }
          if (newModels.size > 0) {
            setPulsingNodes(newModels);
            setTimeout(() => setPulsingNodes(new Set()), 2000);
          }
        }
        if (res.data.length > 0) lastEventId.current = res.data[0].id;
        setEvents(res.data);
        setConnected(true);
        setError('');
      }
    } catch (err: any) {
      setError(err.message);
      setConnected(false);
    }
  }, [token, modelFilter, events.length]);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiFetch<{ success: boolean; data: Stats }>('/admin/events/stats', { token });
      if (res.success) setStats(res.data);
    } catch {}
  }, [token]);

  const fetchConfig = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiFetch<{ success: boolean; data: NotifConfig }>('/admin/events/config', { token });
      if (res.success) setConfig(res.data);
    } catch {}
  }, [token]);

  const updateConfig = useCallback(async (models: string[]) => {
    if (!token) return;
    try {
      const res = await apiFetch<{ success: boolean; data: NotifConfig }>('/admin/events/config', {
        token, method: 'PUT', body: JSON.stringify({ watchedModels: models }),
      });
      if (res.success) setConfig(res.data);
    } catch {}
  }, [token]);

  // ── Polling ─────────────────────────────────────────────────
  useEffect(() => {
    fetchEvents();
    fetchStats();
    fetchConfig();
  }, []);

  useEffect(() => {
    const id = setInterval(() => { fetchEvents(); fetchStats(); }, pollInterval * 1000);
    return () => clearInterval(id);
  }, [fetchEvents, fetchStats, pollInterval]);

  // ── Time formatting ─────────────────────────────────────────
  const ago = (ts: string) => {
    const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
    if (s < 5) return 'just now';
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  };

  // ── Active models for graph highlighting ────────────────────
  const activeModels = new Set(events.slice(0, 20).map(e => e.model));

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117', fontFamily: 'system-ui,-apple-system,sans-serif', color: 'white' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#0f1117 0%,#1a1a2e 50%,#16213e 100%)', padding: '20px 24px', borderBottom: '3px solid #e94560' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
              CaterEase <span style={{ color: '#e94560' }}>Monitor</span>
              <span style={{ marginLeft: 10, fontSize: 11, padding: '3px 10px', borderRadius: 20, background: connected ? '#10b98120' : '#e9456020', color: connected ? '#10b981' : '#e94560', border: `1px solid ${connected ? '#10b98140' : '#e9456040'}` }}>
                {connected ? '● LIVE' : '● OFFLINE'}
              </span>
            </h1>
            {error && <p style={{ color: '#e94560', fontSize: 11, margin: '4px 0 0' }}>{error}</p>}
          </div>
          {stats && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[
                { l: 'Total Events', v: stats.total, c: '#8b5cf6' },
                { l: 'Last Hour', v: stats.lastHour, c: '#10b981' },
                { l: 'Last 24h', v: stats.last24h, c: '#f59e0b' },
              ].map(({ l, v, c }) => (
                <div key={l} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '6px 14px', borderLeft: `3px solid ${c}` }}>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>{l}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'monospace' }}>{v}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '16px 16px' }}>
        {/* Controls bar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={modelFilter} onChange={e => setModelFilter(e.target.value)}
            style={{ background: '#1e2030', border: '1px solid #2a2d40', borderRadius: 8, padding: '6px 12px', color: 'white', fontSize: 12, cursor: 'pointer' }}>
            <option value="">All Models</option>
            {config?.allModels.map(m => (
              <option key={m} value={m}>{MODEL_ICONS[m] || '📦'} {m}</option>
            ))}
          </select>
          <select value={pollInterval} onChange={e => setPollInterval(+e.target.value)}
            style={{ background: '#1e2030', border: '1px solid #2a2d40', borderRadius: 8, padding: '6px 12px', color: 'white', fontSize: 12, cursor: 'pointer' }}>
            {[2, 5, 10, 30].map(s => <option key={s} value={s}>Poll: {s}s</option>)}
          </select>
          <button onClick={() => { fetchEvents(); fetchStats(); }}
            style={{ background: '#e94560', border: 'none', borderRadius: 8, padding: '6px 14px', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            Refresh Now
          </button>
          <button onClick={() => setShowConfig(!showConfig)}
            style={{ background: showConfig ? '#f59e0b' : '#2a2d40', border: 'none', borderRadius: 8, padding: '6px 14px', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            {showConfig ? 'Hide Config' : '⚙ Notifications'}
          </button>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            {config?.discordEnabled && (
              <span style={{ fontSize: 10, padding: '4px 10px', borderRadius: 12, background: '#5865F220', color: '#5865F2', border: '1px solid #5865F240', fontWeight: 600 }}>Discord ON</span>
            )}
            {config?.emailEnabled && (
              <span style={{ fontSize: 10, padding: '4px 10px', borderRadius: 12, background: '#10b98120', color: '#10b981', border: '1px solid #10b98140', fontWeight: 600 }}>Email ON</span>
            )}
          </div>
        </div>

        {/* Config panel */}
        {showConfig && config && (
          <div style={{ background: '#1e2030', borderRadius: 12, padding: 16, marginBottom: 14, border: '1px solid #2a2d40' }}>
            <h3 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#f59e0b' }}>Watched Models</h3>
            <p style={{ margin: '0 0 12px', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Toggle which models trigger notifications (Discord/email). Changes are live.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {config.allModels.map(m => {
                const isOn = config.watchedModels.includes(m);
                return (
                  <button key={m} onClick={() => {
                    const next = isOn
                      ? config.watchedModels.filter(x => x !== m)
                      : [...config.watchedModels, m];
                    updateConfig(next);
                  }}
                    style={{
                      padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      border: `1px solid ${isOn ? (MODEL_COLORS[m] || '#6b7280') + '60' : '#2a2d40'}`,
                      background: isOn ? (MODEL_COLORS[m] || '#6b7280') + '20' : 'transparent',
                      color: isOn ? (MODEL_COLORS[m] || '#6b7280') : 'rgba(255,255,255,0.3)',
                    }}>
                    {MODEL_ICONS[m] || '📦'} {m} {isOn ? '✓' : ''}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Main content: Graph + Feed */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 16, alignItems: 'start' }}>

          {/* ── Entity Relationship Graph ─────────────────────── */}
          <div style={{ background: '#1e2030', borderRadius: 12, border: '1px solid #2a2d40', overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid #2a2d40', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>Entity Graph</h3>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>Nodes pulse on new activity</span>
            </div>
            <div style={{ position: 'relative', height: 440, overflow: 'hidden' }}>
              {/* SVG edges */}
              <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M0 0 L10 5 L0 10 z" fill="rgba(255,255,255,0.15)" />
                  </marker>
                </defs>
                {EDGES.map((edge, i) => {
                  const from = NODES.find(n => n.id === edge.from);
                  const to = NODES.find(n => n.id === edge.to);
                  if (!from || !to) return null;
                  const path = edgePath(from, to);
                  const isActive = activeModels.has(from.id) || activeModels.has(to.id);
                  return (
                    <g key={i}>
                      <path d={path} fill="none" stroke={isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'} strokeWidth={isActive ? 2 : 1} markerEnd="url(#arrow)" style={{ transition: 'all 0.5s' }} />
                      {edge.label && (() => {
                        const mx = (from.x + to.x + NODE_W) / 2;
                        const my = (from.y + to.y + NODE_H) / 2 - 6;
                        return <text x={mx} y={my} fill="rgba(255,255,255,0.15)" fontSize="9" textAnchor="middle">{edge.label}</text>;
                      })()}
                    </g>
                  );
                })}
              </svg>

              {/* Nodes */}
              {NODES.map(node => {
                const count = stats?.byModel[node.id] || 0;
                const isPulsing = pulsingNodes.has(node.id);
                const isActive = activeModels.has(node.id);
                return (
                  <div key={node.id}
                    onClick={() => setModelFilter(modelFilter === node.id ? '' : node.id)}
                    style={{
                      position: 'absolute', left: node.x, top: node.y, width: NODE_W, height: NODE_H,
                      background: isActive ? `${node.color}18` : 'rgba(255,255,255,0.03)',
                      border: `2px solid ${isActive ? node.color + '80' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: 10, cursor: 'pointer', transition: 'all 0.3s',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      boxShadow: isPulsing ? `0 0 20px ${node.color}60, 0 0 40px ${node.color}30` : 'none',
                      animation: isPulsing ? 'nodePulse 0.6s ease-in-out 3' : 'none',
                      outline: modelFilter === node.id ? `2px solid ${node.color}` : 'none',
                      outlineOffset: 2,
                    }}>
                    <div style={{ fontSize: 16, lineHeight: 1 }}>{node.icon}</div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: isActive ? node.color : 'rgba(255,255,255,0.5)', marginTop: 2 }}>{node.label}</div>
                    {count > 0 && (
                      <div style={{
                        position: 'absolute', top: -6, right: -6,
                        background: node.color, color: 'white', borderRadius: 10,
                        fontSize: 9, fontWeight: 700, padding: '1px 6px', minWidth: 18, textAlign: 'center',
                        boxShadow: `0 0 8px ${node.color}60`,
                      }}>{count}</div>
                    )}
                  </div>
                );
              })}
            </div>
            <style>{`
              @keyframes nodePulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.08); }
              }
            `}</style>

            {/* Model breakdown bar */}
            {stats && Object.keys(stats.byModel).length > 0 && (
              <div style={{ padding: '10px 16px', borderTop: '1px solid #2a2d40' }}>
                <div style={{ display: 'flex', gap: 3, borderRadius: 6, overflow: 'hidden', height: 20 }}>
                  {Object.entries(stats.byModel).sort((a, b) => b[1] - a[1]).map(([model, count]) => (
                    <div key={model}
                      onClick={() => setModelFilter(modelFilter === model ? '' : model)}
                      title={`${model}: ${count}`}
                      style={{
                        flex: count, background: MODEL_COLORS[model] || '#6b7280', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 9, fontWeight: 700, color: 'white', minWidth: count > 2 ? 24 : 4,
                        opacity: !modelFilter || modelFilter === model ? 1 : 0.3, transition: 'opacity 0.2s',
                      }}>
                      {count > 3 ? count : ''}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Activity Feed ─────────────────────────────────── */}
          <div style={{ background: '#1e2030', borderRadius: 12, border: '1px solid #2a2d40', display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 220px)' }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid #2a2d40', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>
                Activity Feed
                {modelFilter && (
                  <span style={{ marginLeft: 8, fontSize: 10, padding: '2px 8px', borderRadius: 6, background: (MODEL_COLORS[modelFilter] || '#6b7280') + '20', color: MODEL_COLORS[modelFilter] || '#6b7280' }}>
                    {MODEL_ICONS[modelFilter]} {modelFilter}
                    <span onClick={() => setModelFilter('')} style={{ marginLeft: 4, cursor: 'pointer', opacity: 0.6 }}>✕</span>
                  </span>
                )}
              </h3>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>{events.length} events</span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
              {events.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.2)' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📡</div>
                  <p style={{ fontSize: 13, margin: 0 }}>Waiting for events...</p>
                  <p style={{ fontSize: 11, margin: '4px 0 0' }}>New database entries will appear here</p>
                </div>
              ) : (
                events.map((event, i) => {
                  const isNew = i < 3 && pulsingNodes.has(event.model);
                  return (
                    <div key={event.id}
                      style={{
                        padding: '10px 16px', borderBottom: '1px solid #ffffff06',
                        background: isNew ? `${MODEL_COLORS[event.model] || '#6b7280'}08` : 'transparent',
                        transition: 'background 0.5s',
                      }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        {/* Left indicator */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0, paddingTop: 2 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: SEVERITY_COLORS[event.severity] || '#6b7280', boxShadow: isNew ? `0 0 8px ${SEVERITY_COLORS[event.severity]}` : 'none' }} />
                          <span style={{
                            fontSize: 8, fontWeight: 700, padding: '1px 4px', borderRadius: 4,
                            background: ACTION_LABELS[event.action]?.color + '20',
                            color: ACTION_LABELS[event.action]?.color || '#6b7280',
                          }}>{ACTION_LABELS[event.action]?.label}</span>
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4,
                              background: (MODEL_COLORS[event.model] || '#6b7280') + '20',
                              color: MODEL_COLORS[event.model] || '#6b7280',
                              cursor: 'pointer',
                            }} onClick={() => setModelFilter(modelFilter === event.model ? '' : event.model)}>
                              {MODEL_ICONS[event.model] || '📦'} {event.model}
                            </span>
                            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace', flexShrink: 0 }}>{ago(event.timestamp)}</span>
                          </div>
                          <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, wordBreak: 'break-word' }}>
                            {event.summary}
                          </p>
                          {/* Expandable details */}
                          {Object.keys(event.details).length > 0 && (
                            <details style={{ marginTop: 4 }}>
                              <summary style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', cursor: 'pointer', userSelect: 'none' }}>details</summary>
                              <div style={{ marginTop: 4, padding: 8, background: 'rgba(0,0,0,0.2)', borderRadius: 6, fontSize: 10, fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)', lineHeight: 1.8, wordBreak: 'break-all' }}>
                                {Object.entries(event.details).slice(0, 10).map(([k, v]) => (
                                  <div key={k}><span style={{ color: 'rgba(255,255,255,0.6)' }}>{k}:</span> {String(v)}</div>
                                ))}
                              </div>
                            </details>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
