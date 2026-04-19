import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import {
  CheckCircle, XCircle, Clock, AlertCircle, Search,
  ChefHat, Music, Camera, Palette, Users, Star,
  MapPin, Mail, Phone, Calendar, Briefcase, Loader2, X, Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { canAccessPlanner } from './Planner';

// ── Type config ─────────────────────────────────────────────────
const TYPE_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string; emoji: string }> = {
  CATERER:          { label: 'Caterer',           icon: ChefHat, color: 'text-red-700',    bg: 'bg-red-100',    emoji: '🍽️' },
  DJ:               { label: 'DJ',                icon: Music,   color: 'text-purple-700', bg: 'bg-purple-100', emoji: '🎧' },
  PHOTOGRAPHER:     { label: 'Photographer',      icon: Camera,  color: 'text-pink-700',   bg: 'bg-pink-100',   emoji: '📷' },
  VIDEOGRAPHER:     { label: 'Videographer',       icon: Camera,  color: 'text-teal-700',   bg: 'bg-teal-100',   emoji: '🎬' },
  DECORATOR:        { label: 'Decorator',          icon: Palette, color: 'text-amber-700',  bg: 'bg-amber-100',  emoji: '🎨' },
  MUSICIAN:         { label: 'Musician',           icon: Music,   color: 'text-blue-700',   bg: 'bg-blue-100',   emoji: '🎵' },
  FLORIST:          { label: 'Florist',            icon: Palette, color: 'text-green-700',  bg: 'bg-green-100',  emoji: '💐' },
  BARTENDER:        { label: 'Bartender',          icon: ChefHat, color: 'text-orange-700', bg: 'bg-orange-100', emoji: '🍸' },
  EVENT_PLANNER:    { label: 'Event Planner',      icon: Users,   color: 'text-indigo-700', bg: 'bg-indigo-100', emoji: '📋' },
  RENTAL_EQUIPMENT: { label: 'Equipment Rental',   icon: Users,   color: 'text-stone-700',  bg: 'bg-stone-100',  emoji: '🎪' },
  OTHER:            { label: 'Other',              icon: Users,   color: 'text-stone-600',  bg: 'bg-stone-100',  emoji: '📦' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  UNVERIFIED: { label: 'Unverified', color: 'text-stone-600',  bg: 'bg-stone-100', icon: AlertCircle },
  PENDING:    { label: 'Pending',    color: 'text-amber-700',  bg: 'bg-amber-100', icon: Clock },
  VERIFIED:   { label: 'Verified',   color: 'text-green-700',  bg: 'bg-green-100', icon: CheckCircle },
  REJECTED:   { label: 'Rejected',   color: 'text-red-700',    bg: 'bg-red-100',   icon: XCircle },
};

type FilterStatus = 'all' | 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

interface ProviderData {
  id: string;
  businessName: string;
  businessDescription?: string;
  providerTypes: string[];
  primaryType?: string;
  verificationStatus: string;
  averageRating: number;
  totalReviews: number;
  completedBookings: number;
  maxGuestCount: number;
  minGuestCount: number;
  pricePerPerson?: number;
  hourlyRate?: number;
  createdAt: string;
  user: {
    id: string; email: string; firstName: string; lastName: string;
    avatarUrl?: string; phoneNumber?: string; createdAt: string;
  };
  _count: { services: number; menuItems: number; portfolioItems: number; bookings: number; reviews: number };
}

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : '/api/v1';

export default function AdminProviderVerification() {
  const { user, token } = useAuth();
  const [providers, setProviders] = useState<ProviderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<ProviderData | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProviders = useCallback(async () => {
    if (!token) return;
    try {
      const url = filter === 'all'
        ? `${API_BASE}/admin/providers/all`
        : `${API_BASE}/admin/providers/all?status=${filter}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) setProviders(data.data);
      else setError(data.error);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [token, filter]);

  useEffect(() => { fetchProviders(); }, [fetchProviders]);

  // Gate check — after all hooks
  if (!canAccessPlanner(user?.email)) {
    return <Navigate to="/" replace />;
  }

  const handleVerify = async (provider: ProviderData) => {
    if (!confirm(`Verify "${provider.businessName}" as a trusted provider?`)) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/providers/${provider.id}/verify`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        setSelectedProvider(null);
        fetchProviders();
      } else {
        alert(`Failed: ${data.error}`);
      }
    } catch (e: any) { alert(`Error: ${e.message}`); }
    finally { setActionLoading(false); }
  };

  const handleReject = async () => {
    if (!selectedProvider || !rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/providers/${selectedProvider.id}/reject`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setShowRejectModal(false);
        setRejectionReason('');
        setSelectedProvider(null);
        fetchProviders();
      } else {
        alert(`Failed: ${data.error}`);
      }
    } catch (e: any) { alert(`Error: ${e.message}`); }
    finally { setActionLoading(false); }
  };

  const filtered = providers.filter(p => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = p.businessName.toLowerCase().includes(q)
        || p.user.email.toLowerCase().includes(q)
        || `${p.user.firstName} ${p.user.lastName}`.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const counts = {
    all: providers.length,
    UNVERIFIED: providers.filter(p => p.verificationStatus === 'UNVERIFIED').length,
    PENDING: providers.filter(p => p.verificationStatus === 'PENDING').length,
    VERIFIED: providers.filter(p => p.verificationStatus === 'VERIFIED').length,
    REJECTED: providers.filter(p => p.verificationStatus === 'REJECTED').length,
  };

  return (
    <div className="py-8">
      <div className="section-padding">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-stone-900">Provider Verification</h1>
              <p className="text-stone-600">Review and verify provider profiles</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 border-b border-stone-200 overflow-x-auto">
          {(['all', 'PENDING', 'UNVERIFIED', 'VERIFIED', 'REJECTED'] as FilterStatus[]).map(status => {
            const active = filter === status;
            const count = counts[status];
            const cfg = status === 'all' ? null : STATUS_CONFIG[status];
            return (
              <button key={status} onClick={() => { setFilter(status); setLoading(true); }}
                className={`px-4 py-2.5 font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  active ? 'border-brand-600 text-brand-600' : 'border-transparent text-stone-500 hover:text-stone-700'
                }`}>
                {cfg && <cfg.icon className="w-4 h-4" />}
                {status === 'all' ? 'All' : cfg?.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-brand-100 text-brand-700' : 'bg-stone-100 text-stone-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input type="text" placeholder="Search by business name, owner, or email..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="input-field pl-12 w-full" />
        </div>

        {/* Error */}
        {error && (
          <div className="card p-4 mb-6 border-l-4 border-red-500 bg-red-50">
            <p className="text-red-700 text-sm"><strong>Error:</strong> {error}</p>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
            <p className="text-stone-500 text-sm">Loading providers...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <Shield className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <h3 className="font-semibold text-stone-900 mb-2">No providers found</h3>
            <p className="text-stone-600 text-sm">
              {searchQuery ? 'Try a different search term' : `No providers with status "${filter}"`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(provider => {
              const sc = STATUS_CONFIG[provider.verificationStatus] || STATUS_CONFIG.UNVERIFIED;
              const StatusIcon = sc.icon;
              const types = provider.providerTypes.length > 0
                ? provider.providerTypes
                : provider.primaryType ? [provider.primaryType] : [];

              return (
                <div key={provider.id} className="card overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                        {provider.user.avatarUrl ? (
                          <img src={provider.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {provider.user.firstName[0]}{provider.user.lastName[0]}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <h3 className="font-display text-lg font-bold text-stone-900">{provider.businessName}</h3>
                            <p className="text-sm text-stone-500">
                              {provider.user.firstName} {provider.user.lastName}
                            </p>
                          </div>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${sc.bg} ${sc.color}`}>
                            <StatusIcon className="w-4 h-4" />
                            {sc.label}
                          </span>
                        </div>

                        {/* Type badges */}
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {types.map(t => {
                            const cfg = TYPE_CONFIG[t] || TYPE_CONFIG.OTHER;
                            const Icon = cfg.icon;
                            return (
                              <span key={t} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                                <Icon className="w-3 h-3" /> {cfg.label}
                              </span>
                            );
                          })}
                        </div>

                        {/* Contact + stats */}
                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-stone-500">
                          <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {provider.user.email}</span>
                          {provider.user.phoneNumber && (
                            <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {provider.user.phoneNumber}</span>
                          )}
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Joined {new Date(provider.user.createdAt).toLocaleDateString()}</span>
                        </div>

                        {/* Content counts */}
                        <div className="flex flex-wrap gap-3 mt-3 text-xs text-stone-400">
                          <span>{provider._count.services} services</span>
                          <span>•</span>
                          <span>{provider._count.menuItems} menu items</span>
                          <span>•</span>
                          <span>{provider._count.portfolioItems} portfolio</span>
                          <span>•</span>
                          <span>{provider._count.bookings} bookings</span>
                          {provider.averageRating > 0 && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-0.5">
                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                {provider.averageRating.toFixed(1)} ({provider._count.reviews})
                              </span>
                            </>
                          )}
                        </div>



                        {provider.businessDescription && (
                          <p className="text-sm text-stone-600 mt-3 line-clamp-2">{provider.businessDescription}</p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {provider.verificationStatus !== 'VERIFIED' && (
                      <div className="flex gap-3 mt-5 pt-4 border-t border-stone-100">
                        <button onClick={() => handleVerify(provider)} disabled={actionLoading}
                          className="btn-primary flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Verify Provider
                        </button>
                        <button onClick={() => { setSelectedProvider(provider); setShowRejectModal(true); }}
                          disabled={actionLoading}
                          className="btn-secondary text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-2">
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    )}
                    {provider.verificationStatus === 'VERIFIED' && (
                      <div className="flex gap-3 mt-5 pt-4 border-t border-stone-100">
                        <button onClick={() => { setSelectedProvider(provider); setShowRejectModal(true); }}
                          disabled={actionLoading}
                          className="btn-secondary text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-2 text-sm">
                          <XCircle className="w-4 h-4" />
                          Revoke Verification
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedProvider && (
          <>
            <div className="fixed inset-0 bg-black/40 z-50" onClick={() => { setShowRejectModal(false); setRejectionReason(''); }} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-lg font-bold text-stone-900">Reject Provider</h3>
                    <button onClick={() => { setShowRejectModal(false); setRejectionReason(''); }}
                      className="p-1 rounded-lg hover:bg-stone-100">
                      <X className="w-5 h-5 text-stone-400" />
                    </button>
                  </div>
                  <p className="text-sm text-stone-600 mb-4">
                    Rejecting <strong>{selectedProvider.businessName}</strong>. Please provide a reason:
                  </p>
                  <textarea value={rejectionReason} onChange={e => setRejectionReason(e.target.value)}
                    placeholder="Reason for rejection (required)..."
                    rows={4}
                    className="input-field w-full resize-none" />
                  <div className="flex gap-3 mt-4">
                    <button onClick={() => { setShowRejectModal(false); setRejectionReason(''); }}
                      className="btn-secondary flex-1">Cancel</button>
                    <button onClick={handleReject} disabled={!rejectionReason.trim() || actionLoading}
                      className="flex-1 px-4 py-2 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
                      {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                      Reject Provider
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
