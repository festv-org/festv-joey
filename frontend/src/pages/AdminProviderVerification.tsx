import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { CheckCircle, MapPin, Calendar, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { canAccessPlanner } from './Planner';
import { ProviderTypeBadge } from '../components/ProviderTypeBadge';

// ── Helpers ───────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : '/api/v1';

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-CA', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface Provider {
  id: string;
  businessName: string;
  businessDescription?: string | null;
  primaryType: string;
  providerTypes: string[];
  verificationStatus: string;
  averageRating: number;
  totalReviews: number;
  languages?: string[];
  city?: string | null;
  state?: string | null;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    city?: string | null;
    state?: string | null;
    createdAt: string;
  };
}

type FilterTab = 'all' | 'pending' | 'verified' | 'rejected';

// ── Status badge config ───────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  UNVERIFIED: { label: 'Unverified',     cls: 'bg-muted/10 text-muted border border-muted/20'       },
  PENDING:    { label: 'Pending Review', cls: 'bg-gold/10 text-gold-dark border border-gold/30'      },
  VERIFIED:   { label: 'Verified',       cls: 'bg-green/10 text-green border border-green/30'        },
  REJECTED:   { label: 'Rejected',       cls: 'bg-red/10 text-red border border-red/30'              },
};

// ── Sort order ────────────────────────────────────────────────────────────────

const STATUS_ORDER: Record<string, number> = {
  PENDING: 0, UNVERIFIED: 1, VERIFIED: 2, REJECTED: 3,
};

// ── Toast ─────────────────────────────────────────────────────────────────────

interface ToastMsg { id: number; text: string; ok: boolean }

function Toast({ toasts }: { toasts: ToastMsg[] }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`font-sans text-sm px-5 py-3 rounded-md shadow-lg border flex items-center gap-2 transition-all
            ${t.ok
              ? 'bg-dark text-white border-gold/30'
              : 'bg-dark text-white border-red/30'
            }`}
        >
          {t.ok
            ? <Check size={14} strokeWidth={2.5} className="text-gold flex-shrink-0" />
            : <span className="text-red flex-shrink-0 text-base leading-none">✕</span>
          }
          {t.text}
        </div>
      ))}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="bg-white border border-border rounded-md p-6 mb-4 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-border flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-border rounded w-48" />
          <div className="h-3 bg-border rounded w-32" />
          <div className="h-3 bg-border rounded w-full mt-4" />
          <div className="h-3 bg-border rounded w-3/4" />
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AdminProviderVerification() {
  const { user, token } = useAuth();

  const [providers, setProviders]       = useState<Provider[]>([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState<FilterTab>('all');
  const [toasts, setToasts]             = useState<ToastMsg[]>([]);
  const [actionIds, setActionIds]       = useState<Set<string>>(new Set());
  // Per-card reject state: id → reason string (undefined = panel closed)
  const [rejectPanels, setRejectPanels] = useState<Record<string, string>>({});

  // ── Gate check (must be before conditional returns after hooks) ─────────────
  if (!canAccessPlanner(user?.email)) {
    return <Navigate to="/" replace />;
  }

  // ── Toast helpers ──────────────────────────────────────────────────────────
  const showToast = useCallback((text: string, ok = true) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, text, ok }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchProviders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/providers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        // Sort: PENDING/UNVERIFIED → VERIFIED → REJECTED
        const sorted = (data.data ?? []).sort((a: Provider, b: Provider) =>
          (STATUS_ORDER[a.verificationStatus] ?? 9) - (STATUS_ORDER[b.verificationStatus] ?? 9)
        );
        setProviders(sorted);
      } else {
        console.error('[AdminVerification] fetch error:', data.message);
      }
    } catch (err) {
      console.error('[AdminVerification] network error:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchProviders(); }, [fetchProviders]);

  // ── Approve ────────────────────────────────────────────────────────────────
  const handleApprove = async (provider: Provider) => {
    setActionIds(prev => new Set(prev).add(provider.id));
    try {
      const res = await fetch(`${API_BASE}/admin/providers/${provider.id}/verify`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        setProviders(prev =>
          prev.map(p => p.id === provider.id ? { ...p, verificationStatus: 'VERIFIED' } : p)
        );
        showToast('Vendor approved and is now live');
      } else {
        showToast(data.message ?? 'Approval failed', false);
      }
    } catch {
      showToast('Network error — please try again', false);
    } finally {
      setActionIds(prev => { const s = new Set(prev); s.delete(provider.id); return s; });
    }
  };

  // ── Reject ─────────────────────────────────────────────────────────────────
  const handleReject = async (provider: Provider) => {
    const reason = rejectPanels[provider.id] ?? '';
    setActionIds(prev => new Set(prev).add(provider.id));
    try {
      const res = await fetch(`${API_BASE}/admin/providers/${provider.id}/reject`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason.trim() || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        setProviders(prev =>
          prev.map(p => p.id === provider.id ? { ...p, verificationStatus: 'REJECTED' } : p)
        );
        setRejectPanels(prev => { const n = { ...prev }; delete n[provider.id]; return n; });
        showToast('Vendor rejected');
      } else {
        showToast(data.message ?? 'Rejection failed', false);
      }
    } catch {
      showToast('Network error — please try again', false);
    } finally {
      setActionIds(prev => { const s = new Set(prev); s.delete(provider.id); return s; });
    }
  };

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = providers.filter(p => {
    if (filter === 'pending')  return p.verificationStatus === 'PENDING'  || p.verificationStatus === 'UNVERIFIED';
    if (filter === 'verified') return p.verificationStatus === 'VERIFIED';
    if (filter === 'rejected') return p.verificationStatus === 'REJECTED';
    return true;
  });

  const pendingCount = providers.filter(
    p => p.verificationStatus === 'PENDING' || p.verificationStatus === 'UNVERIFIED'
  ).length;

  const TABS: { key: FilterTab; label: string; count?: number }[] = [
    { key: 'all',      label: 'All',      count: providers.length },
    { key: 'pending',  label: 'Pending',  count: pendingCount },
    { key: 'verified', label: 'Verified', count: providers.filter(p => p.verificationStatus === 'VERIFIED').length },
    { key: 'rejected', label: 'Rejected', count: providers.filter(p => p.verificationStatus === 'REJECTED').length },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="bg-bg min-h-screen px-6 md:px-12 py-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl text-dark">Vendor Approvals</h1>
          <p className="font-sans text-sm text-muted mt-1">
            {pendingCount > 0
              ? `${pendingCount} vendor${pendingCount !== 1 ? 's' : ''} pending review`
              : 'No vendors pending review'}
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-0 border-b border-border mb-8">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`font-sans text-xs uppercase tracking-widest px-5 py-3 border-b-2 transition-colors focus:outline-none flex items-center gap-2
                ${filter === tab.key
                  ? 'border-gold text-gold font-bold'
                  : 'border-transparent text-muted hover:text-charcoal'
                }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`text-xs rounded-full px-1.5 py-0.5 font-sans font-semibold
                  ${filter === tab.key ? 'bg-gold/15 text-gold-dark' : 'bg-border text-muted'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading ? (
          <div>
            {[1, 2, 3].map(i => <Skeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          /* Empty state */
          <div className="bg-white border border-border rounded-md p-12 text-center">
            <CheckCircle size={36} strokeWidth={1.5} className="text-muted mx-auto mb-4" />
            <p className="font-serif text-xl text-muted">
              {filter === 'pending' ? 'No vendors pending review' : 'No vendors in this category'}
            </p>
            <p className="font-sans text-xs text-muted mt-2">
              {filter === 'pending' ? 'All caught up — check back later.' : ''}
            </p>
          </div>
        ) : (
          /* Vendor cards */
          <div>
            {filtered.map(provider => {
              const badge   = STATUS_BADGE[provider.verificationStatus] ?? STATUS_BADGE.UNVERIFIED;
              const city    = provider.city ?? provider.user?.city;
              const state   = provider.state ?? provider.user?.state;
              const initials = `${provider.user.firstName[0] ?? ''}${provider.user.lastName[0] ?? ''}`.toUpperCase();
              const canAct  = provider.verificationStatus !== 'VERIFIED';
              const isActing = actionIds.has(provider.id);
              const rejectOpen = provider.id in rejectPanels;

              return (
                <div
                  key={provider.id}
                  className="bg-white border border-border rounded-md p-6 mb-4"
                >
                  <div className="flex items-start gap-4">

                    {/* Avatar */}
                    <div
                      className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center border border-border"
                      style={{ background: 'rgba(196,160,106,0.1)' }}
                    >
                      <span className="font-serif text-base text-gold-dark">{initials}</span>
                    </div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">

                      {/* Top row: name + status */}
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="min-w-0">
                          <h3 className="font-serif text-xl text-dark leading-tight">
                            {provider.businessName}
                          </h3>
                          <p className="font-sans text-xs text-muted mt-0.5">
                            {provider.user.firstName} {provider.user.lastName}
                            {' · '}{provider.user.email}
                          </p>
                        </div>
                        <span className={`font-sans text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </div>

                      {/* Type badge + location + date */}
                      <div className="flex flex-wrap items-center gap-3 mt-3">
                        <ProviderTypeBadge type={provider.primaryType} size="xs" />
                        {(city || state) && (
                          <span className="flex items-center gap-1 font-sans text-xs text-muted">
                            <MapPin size={11} strokeWidth={1.5} />
                            {[city, state].filter(Boolean).join(', ')}
                          </span>
                        )}
                        <span className="flex items-center gap-1 font-sans text-xs text-muted">
                          <Calendar size={11} strokeWidth={1.5} />
                          Joined {fmtDate(provider.user.createdAt)}
                        </span>
                      </div>

                      {/* Languages */}
                      {provider.languages && provider.languages.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {provider.languages.map(lang => (
                            <span key={lang} className="font-sans text-xs border border-border rounded-md px-2 py-0.5 text-charcoal">
                              {lang}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* About — 2-line clamp */}
                      {provider.businessDescription && (
                        <p
                          className="font-sans text-sm text-muted mt-3 leading-relaxed"
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {provider.businessDescription}
                        </p>
                      )}

                      {/* Action buttons */}
                      {canAct && (
                        <div className="mt-5 pt-4 border-t border-border">
                          {!rejectOpen ? (
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleApprove(provider)}
                                disabled={isActing}
                                className="bg-gold text-dark font-sans text-xs font-bold tracking-widest uppercase px-4 py-2 hover:bg-gold-dark transition-colors focus:outline-none disabled:opacity-50 rounded-md"
                              >
                                {isActing ? 'Approving…' : 'Approve'}
                              </button>
                              <button
                                onClick={() => setRejectPanels(prev => ({ ...prev, [provider.id]: '' }))}
                                disabled={isActing}
                                className="border border-red text-red font-sans text-xs uppercase tracking-widest px-4 py-2 hover:bg-red/5 transition-colors focus:outline-none disabled:opacity-50 rounded-md"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            /* Inline rejection panel */
                            <div className="space-y-3">
                              <input
                                type="text"
                                placeholder="Reason for rejection (optional)"
                                value={rejectPanels[provider.id]}
                                onChange={e => setRejectPanels(prev => ({ ...prev, [provider.id]: e.target.value }))}
                                className="w-full border border-border rounded-md px-4 py-2.5 text-sm font-sans text-dark focus:outline-none focus:border-red transition-colors"
                                autoFocus
                              />
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handleReject(provider)}
                                  disabled={isActing}
                                  className="bg-red/90 text-white font-sans text-xs font-bold tracking-widest uppercase px-4 py-2 hover:bg-red transition-colors focus:outline-none disabled:opacity-50 rounded-md"
                                >
                                  {isActing ? 'Rejecting…' : 'Confirm Reject'}
                                </button>
                                <button
                                  onClick={() => setRejectPanels(prev => { const n = { ...prev }; delete n[provider.id]; return n; })}
                                  disabled={isActing}
                                  className="font-sans text-xs text-muted hover:text-charcoal transition-colors focus:outline-none"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Toast notifications */}
      <Toast toasts={toasts} />
    </div>
  );
}
