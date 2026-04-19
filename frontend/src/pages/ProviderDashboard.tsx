import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  DollarSign, 
  Calendar, 
  Star,
  TrendingUp,
  Clock,
  CheckCircle,
  Users,
  ChevronRight,
  Send,
  Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { providersApi } from '../utils/api';

// Type config for badges
const TYPE_CONFIG: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
  CATERER: { label: 'Caterer', emoji: '🍽️', color: '#b91c1c', bg: '#fef2f2' },
  DJ: { label: 'DJ', emoji: '🎧', color: '#7c3aed', bg: '#f5f3ff' },
  PHOTOGRAPHER: { label: 'Photographer', emoji: '📷', color: '#be185d', bg: '#fdf2f8' },
  VIDEOGRAPHER: { label: 'Videographer', emoji: '🎬', color: '#0d9488', bg: '#f0fdfa' },
  DECORATOR: { label: 'Decorator', emoji: '🎨', color: '#b45309', bg: '#fffbeb' },
  MUSICIAN: { label: 'Musician', emoji: '🎵', color: '#1d4ed8', bg: '#eff6ff' },
  FLORIST: { label: 'Florist', emoji: '💐', color: '#15803d', bg: '#f0fdf4' },
  BARTENDER: { label: 'Bartender', emoji: '🍸', color: '#c2410c', bg: '#fff7ed' },
  EVENT_PLANNER: { label: 'Event Planner', emoji: '📋', color: '#4338ca', bg: '#eef2ff' },
  RENTAL_EQUIPMENT: { label: 'Equipment Rental', emoji: '🎪', color: '#4b5563', bg: '#f3f4f6' },
  OTHER: { label: 'Other', emoji: '📦', color: '#6b7280', bg: '#f9fafb' },
};

const VERIFY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  VERIFIED: { label: 'Verified', color: '#059669', bg: '#f0fdf4' },
  PENDING: { label: 'Pending Verification', color: '#d97706', bg: '#fffbeb' },
  UNVERIFIED: { label: 'Unverified', color: '#6b7280', bg: '#f3f4f6' },
  REJECTED: { label: 'Rejected', color: '#dc2626', bg: '#fef2f2' },
};

// TODO: Replace with real API calls when endpoints are ready
const mockRequests: any[] = [];
const mockBookings: any[] = [];

export default function ProviderDashboard() {
  const { user, token } = useAuth();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const data = await providersApi.getMyProfiles(token) as any;
        if (data.success) setProfiles(data.data || []);
      } catch (e) { console.error('Failed to load provider profiles', e); }
      finally { setProfileLoading(false); }
    })();
  }, [token]);

  // Use real profile stats if available, fall back to zero
  const profile = profiles[0];
  const stats = profile ? {
    totalEarnings: 0, // Would need a separate earnings endpoint
    pendingQuotes: 0,
    activeBookings: profile.totalBookings || 0,
    completedBookings: profile.completedBookings || 0,
    averageRating: profile.averageRating || 0,
    totalReviews: profile.totalReviews || 0,
    responseRate: profile.responseRate || 0,
  } : { totalEarnings: 0, pendingQuotes: 0, activeBookings: 0, completedBookings: 0, averageRating: 0, totalReviews: 0, responseRate: 0 };

  return (
    <div className="py-8">
      <div className="section-padding">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-stone-900">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="text-stone-600 mt-1">
                Here's what's happening with your business
              </p>
            </div>
            {/* Provider type badges + verification status */}
            {!profileLoading && profiles.length > 0 && (
              <div className="flex flex-col items-end gap-2">
                <div className="flex flex-wrap gap-2">
                  {profiles.map(p => {
                    const types = p.providerTypes || (p.primaryType ? [p.primaryType] : []);
                    return types.map((t: string) => {
                      const cfg = TYPE_CONFIG[t] || TYPE_CONFIG.OTHER;
                      return (
                        <span key={`${p.id}-${t}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold" style={{ background: cfg.bg, color: cfg.color }}>
                          <span>{cfg.emoji}</span> {cfg.label}
                        </span>
                      );
                    });
                  })}
                </div>
                {profiles.map(p => {
                  const vc = VERIFY_CONFIG[p.verificationStatus] || VERIFY_CONFIG.UNVERIFIED;
                  return (
                    <span key={p.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: vc.bg, color: vc.color }}>
                      {p.verificationStatus === 'VERIFIED' ? '✅' : p.verificationStatus === 'REJECTED' ? '❌' : '⏳'} {vc.label}
                      {p.verificationStatus === 'REJECTED' && p.rejectionReason && (
                        <span className="text-xs ml-1 opacity-70">- {p.rejectionReason}</span>
                      )}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid - Now Clickable */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link to="/provider/earnings" className="card card-hover p-5 group">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold text-stone-900">
                  ${stats.totalEarnings.toLocaleString()}
                </p>
                <p className="text-sm text-stone-500">Total Earnings</p>
              </div>
              <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-stone-500 transition-colors" />
            </div>
          </Link>

          <Link to="/provider/quotes" className="card card-hover p-5 group">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                <Send className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold text-stone-900">{stats.pendingQuotes}</p>
                <p className="text-sm text-stone-500">Pending Quotes</p>
              </div>
              <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-stone-500 transition-colors" />
            </div>
          </Link>

          <Link to="/provider/bookings" className="card card-hover p-5 group">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold text-stone-900">{stats.activeBookings}</p>
                <p className="text-sm text-stone-500">Active Bookings</p>
              </div>
              <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-stone-500 transition-colors" />
            </div>
          </Link>

          <Link to="/provider/reviews" className="card card-hover p-5 group">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <p className="text-2xl font-bold text-stone-900">{stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'New'}</p>
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                </div>
                <p className="text-sm text-stone-500">{stats.totalReviews} Reviews</p>
              </div>
              <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-stone-500 transition-colors" />
            </div>
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Available Requests */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold text-stone-900">
                Available Requests
              </h2>
              <Link to="/provider/requests" className="text-brand-600 text-sm font-medium hover:text-brand-700">
                View all
              </Link>
            </div>

            <div className="space-y-4">
              {mockRequests.map((request) => (
                <div key={request.id} className="card p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-stone-900">{request.title}</h3>
                      <p className="text-sm text-stone-500">
                        {request.venueCity}, {request.venueState}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-medium">
                      {request.eventType}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-stone-600 mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(request.eventDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {request.guestCount} guests
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      ${request.budgetMin.toLocaleString()} - ${request.budgetMax.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button className="btn-primary text-sm py-2">
                      <Send className="w-4 h-4 mr-1" />
                      Send Quote
                    </button>
                    <button className="btn-secondary text-sm py-2">
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Bookings */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold text-stone-900">
                Upcoming Bookings
              </h2>
              <Link to="/provider/bookings" className="text-brand-600 text-sm font-medium hover:text-brand-700">
                View all
              </Link>
            </div>

            <div className="space-y-4">
              {mockBookings.map((booking) => (
                <Link
                  key={booking.id}
                  to={`/bookings/${booking.id}`}
                  className="card p-5 card-hover flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-stone-900 truncate">
                      {booking.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-stone-500 mt-1">
                      <span>{booking.clientName}</span>
                      <span>•</span>
                      <span>{new Date(booking.eventDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-stone-900">
                      ${booking.totalAmount.toLocaleString()}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      booking.status === 'CONFIRMED'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {booking.status.replace('_', ' ')}
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-stone-400" />
                </Link>
              ))}

              {mockBookings.length === 0 && (
                <div className="card p-8 text-center">
                  <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-stone-400" />
                  </div>
                  <h3 className="font-semibold text-stone-900 mb-2">No upcoming bookings</h3>
                  <p className="text-stone-600">
                    Send quotes to clients to get new bookings.
                  </p>
                </div>
              )}
            </div>

            {/* Performance Card */}
            <div className="card p-5 mt-4 bg-gradient-to-br from-brand-500 to-brand-600 text-white">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6" />
                <h3 className="font-semibold">Performance This Month</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-brand-100 text-sm">Response Rate</p>
                  <p className="text-2xl font-bold">{stats.responseRate}%</p>
                </div>
                <div>
                  <p className="text-brand-100 text-sm">Completed</p>
                  <p className="text-2xl font-bold">{stats.completedBookings}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
