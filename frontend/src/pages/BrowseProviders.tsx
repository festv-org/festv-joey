import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Star, 
  Users, 
  DollarSign,
  ChefHat,
  Music,
  Camera,
  Palette,
  X,
  SlidersHorizontal,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { ProviderType } from '../types';
import { useAuth } from '../context/AuthContext';

// ── Pricing model logic ─────────────────────────────────────────
const getProviderPricingModel = (primaryType?: string, isSoloWorker?: boolean): 'hourly' | 'perPerson' => {
  if (primaryType === 'CATERER' || primaryType === 'BARTENDER') {
    return isSoloWorker ? 'hourly' : 'perPerson';
  }
  if (['PHOTOGRAPHER', 'VIDEOGRAPHER', 'DJ', 'MUSICIAN', 'EVENT_PLANNER'].includes(primaryType || '')) {
    return 'hourly';
  }
  return 'perPerson';
};

// ── Provider type config ────────────────────────────────────────
const TYPE_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  CATERER:          { label: 'Caterer',        icon: ChefHat, color: 'text-red-700',    bg: 'bg-red-100' },
  DJ:               { label: 'DJ',             icon: Music,   color: 'text-purple-700', bg: 'bg-purple-100' },
  PHOTOGRAPHER:     { label: 'Photographer',   icon: Camera,  color: 'text-pink-700',   bg: 'bg-pink-100' },
  VIDEOGRAPHER:     { label: 'Videographer',   icon: Camera,  color: 'text-teal-700',   bg: 'bg-teal-100' },
  DECORATOR:        { label: 'Decorator',      icon: Palette, color: 'text-amber-700',  bg: 'bg-amber-100' },
  MUSICIAN:         { label: 'Musician',       icon: Music,   color: 'text-blue-700',   bg: 'bg-blue-100' },
  FLORIST:          { label: 'Florist',        icon: Palette, color: 'text-green-700',  bg: 'bg-green-100' },
  BARTENDER:        { label: 'Bartender',      icon: ChefHat, color: 'text-orange-700', bg: 'bg-orange-100' },
  EVENT_PLANNER:    { label: 'Event Planner',  icon: Users,   color: 'text-indigo-700', bg: 'bg-indigo-100' },
  RENTAL_EQUIPMENT: { label: 'Equipment Rental', icon: Users, color: 'text-stone-700',  bg: 'bg-stone-100' },
  OTHER:            { label: 'Other',          icon: Users,   color: 'text-stone-600',  bg: 'bg-stone-100' },
};

const providerTypeOptions: { value: ProviderType; label: string; icon: any }[] = [
  { value: 'CATERER', label: 'Caterers', icon: ChefHat },
  { value: 'DJ', label: 'DJs', icon: Music },
  { value: 'PHOTOGRAPHER', label: 'Photographers', icon: Camera },
  { value: 'VIDEOGRAPHER', label: 'Videographers', icon: Camera },
  { value: 'DECORATOR', label: 'Decorators', icon: Palette },
  { value: 'MUSICIAN', label: 'Musicians', icon: Music },
  { value: 'FLORIST', label: 'Florists', icon: Palette },
  { value: 'BARTENDER', label: 'Bartenders', icon: ChefHat },
  { value: 'RENTAL_EQUIPMENT', label: 'Equipment', icon: Users },
];

// ── Provider type badge component ───────────────────────────────
function ProviderTypeBadge({ type, size = 'sm' }: { type: string; size?: 'sm' | 'md' }) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.OTHER;
  const Icon = cfg.icon;
  const isSm = size === 'sm';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${cfg.bg} ${cfg.color} ${
      isSm ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
    }`}>
      <Icon className={isSm ? 'w-3 h-3' : 'w-4 h-4'} />
      {cfg.label}
    </span>
  );
}

// ── Verification status badge ───────────────────────────────────
function VerificationBadge({ status }: { status: string }) {
  if (status === 'VERIFIED') {
    return (
      <div className="absolute top-3 right-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-green-700 flex items-center gap-1">
        <CheckCircle className="w-3 h-3 fill-green-500 text-white" />
        Verified
      </div>
    );
  }
  if (status === 'PENDING') {
    return (
      <div className="absolute top-3 right-3 px-2 py-1 bg-amber-100/90 backdrop-blur-sm rounded-full text-xs font-medium text-amber-700 flex items-center gap-1">
        <Clock className="w-3 h-3" />
        Pending Verification
      </div>
    );
  }
  if (status === 'REJECTED') {
    return (
      <div className="absolute top-3 right-3 px-2 py-1 bg-red-100/90 backdrop-blur-sm rounded-full text-xs font-medium text-red-700 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        Rejected
      </div>
    );
  }
  return (
    <div className="absolute top-3 right-3 px-2 py-1 bg-stone-100/90 backdrop-blur-sm rounded-full text-xs font-medium text-stone-600 flex items-center gap-1">
      <AlertCircle className="w-3 h-3" />
      Unverified
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────
interface ApiProvider {
  id: string;
  userId: string;
  businessName: string;
  businessDescription?: string;
  providerTypes: string[];
  primaryType?: string;
  isSoloWorker: boolean;
  verificationStatus: string;
  averageRating: number;
  totalReviews: number;
  totalBookings: number;
  completedBookings: number;
  pricePerPerson?: number;
  hourlyRate?: number;
  minimumHours?: number;
  fixedFee?: number;
  minimumBudget?: number;
  maximumBudget?: number;
  minGuestCount: number;
  maxGuestCount: number;
  serviceAreas: string[];
  user: { firstName: string; lastName: string; avatarUrl?: string; city?: string; state?: string };
  cuisineTypes?: { id: string; name: string }[];
  portfolioItems?: { id: string; title: string }[];
}

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : '/api/v1';

export default function BrowseProviders() {
  const { user, token } = useAuth();
  const [providers, setProviders] = useState<ApiProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<ProviderType[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [minRating, setMinRating] = useState(0);

  // Fetch from real API
  useEffect(() => {
    const fetchProviders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (selectedTypes.length > 0) {
          selectedTypes.forEach(t => params.append('providerTypes', t));
        }
        if (minRating > 0) params.set('minRating', String(minRating));
        params.set('limit', '50');

        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_BASE}/providers/search?${params.toString()}`, { headers });
        const data = await res.json();

        if (data.success) {
          setProviders(data.data);
        } else {
          setError(data.error || 'Failed to load providers');
        }
      } catch (err: any) {
        setError(err.message || 'Network error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProviders();
  }, [token, selectedTypes, minRating]);

  const toggleProviderType = (type: ProviderType) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  // Client-side search filter (name only — API handles type + rating)
  const filteredProviders = providers.filter(p => {
    if (searchQuery && !p.businessName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const isOwnProfile = (p: ApiProvider) => user?.id === p.userId;

  return (
    <div className="py-8">
      <div className="section-padding">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-stone-900 mb-2">Browse Providers</h1>
          <p className="text-stone-600">Find the perfect caterers and event professionals for your occasion</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input type="text" placeholder="Search providers..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} className="input-field pl-12" />
            </div>
            <button onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary ${showFilters ? 'bg-brand-50 border-brand-500 text-brand-600' : ''}`}>
              <SlidersHorizontal className="w-5 h-5 mr-2" />
              Filters
            </button>
          </div>

          {/* Provider Type Pills */}
          <div className="flex flex-wrap gap-2">
            {providerTypeOptions.map((type) => (
              <button key={type.value} onClick={() => toggleProviderType(type.value)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${
                  selectedTypes.includes(type.value)
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-stone-200 hover:border-stone-300 text-stone-600'
                }`}>
                <type.icon className="w-4 h-4" />
                {type.label}
              </button>
            ))}
          </div>

          {/* Extended Filters */}
          {showFilters && (
            <div className="card p-6 animate-slide-up">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Minimum Rating</label>
                  <div className="flex items-center gap-2">
                    {[0, 3, 4, 4.5].map((rating) => (
                      <button key={rating} onClick={() => setMinRating(rating)}
                        className={`px-3 py-2 rounded-lg border-2 transition-all ${
                          minRating === rating ? 'border-brand-500 bg-brand-50' : 'border-stone-200 hover:border-stone-300'
                        }`}>
                        {rating === 0 ? 'Any' : (
                          <span className="flex items-center gap-1">
                            {rating}+ <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <input type="text" placeholder="Enter city or zip code" className="input-field pl-10" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Budget Range</label>
                  <div className="flex items-center gap-2">
                    <input type="number" placeholder="Min" className="input-field w-24" />
                    <span className="text-stone-400">to</span>
                    <input type="number" placeholder="Max" className="input-field w-24" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active Filters */}
          {(selectedTypes.length > 0 || minRating > 0) && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-stone-500">Active filters:</span>
              {selectedTypes.map((type) => (
                <span key={type} className="inline-flex items-center gap-1 px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-sm">
                  {TYPE_CONFIG[type]?.label || type}
                  <button onClick={() => toggleProviderType(type)}><X className="w-4 h-4" /></button>
                </span>
              ))}
              {minRating > 0 && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-sm">
                  {minRating}+ stars
                  <button onClick={() => setMinRating(0)}><X className="w-4 h-4" /></button>
                </span>
              )}
              <button onClick={() => { setSelectedTypes([]); setMinRating(0); }}
                className="text-sm text-brand-600 hover:text-brand-700">Clear all</button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-stone-600">
            Showing <span className="font-semibold text-stone-900">{filteredProviders.length}</span> provider{filteredProviders.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="card p-6 mb-6 border-l-4 border-red-500 bg-red-50">
            <p className="text-red-700 text-sm"><strong>Error loading providers:</strong> {error}</p>
            <p className="text-red-600 text-xs mt-1">Make sure the backend is running and accessible.</p>
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
            <p className="text-stone-500 text-sm">Loading providers...</p>
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-stone-400" />
            </div>
            <h3 className="font-semibold text-stone-900 mb-2">No providers found</h3>
            <p className="text-stone-600">
              {providers.length === 0 ? 'No providers have been verified yet. Check back soon!' : 'Try adjusting your filters or search query'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.map((provider) => {
              const own = isOwnProfile(provider);
              const pricingModel = getProviderPricingModel(provider.primaryType, provider.isSoloWorker);
              return (
                <Link key={provider.id} to={`/providers/${provider.id}`}
                  className={`card card-hover overflow-hidden ${own ? 'ring-2 ring-brand-400 ring-offset-2' : ''}`}>
                  {/* Cover */}
                  <div className="h-40 bg-gradient-to-br from-brand-400 to-brand-600 relative">
                    {/* Own profile indicator */}
                    {own && (
                      <div className="absolute top-3 left-3 px-2 py-1 bg-brand-600/90 backdrop-blur-sm rounded-full text-xs font-medium text-white flex items-center gap-1">
                        <User className="w-3 h-3" />
                        Your Profile
                      </div>
                    )}
                    {/* Verification badge */}
                    <VerificationBadge status={provider.verificationStatus} />
                    {/* Provider type badges */}
                    <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap">
                      {provider.providerTypes.slice(0, 3).map((type) => (
                        <ProviderTypeBadge key={type} type={type} />
                      ))}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-display text-lg font-semibold text-stone-900 mb-1">
                      {provider.businessName}
                    </h3>

                    {/* Location */}
                    {(provider.user.city || provider.serviceAreas?.length > 0) && (
                      <div className="flex items-center gap-1 text-stone-500 text-sm mb-2">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{provider.user.city}{provider.user.state ? `, ${provider.user.state}` : ''}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold text-stone-900">
                          {provider.averageRating > 0 ? provider.averageRating.toFixed(1) : 'New'}
                        </span>
                        {provider.totalReviews > 0 && (
                          <span className="text-stone-500 text-sm">({provider.totalReviews})</span>
                        )}
                      </div>
                      {provider.completedBookings > 0 && (
                        <>
                          <span className="text-stone-300">•</span>
                          <span className="text-sm text-stone-500">{provider.completedBookings} bookings</span>
                        </>
                      )}
                    </div>

                    {provider.businessDescription && (
                      <p className="text-stone-600 text-sm line-clamp-2 mb-4">{provider.businessDescription}</p>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                      {pricingModel === 'hourly' ? (
                        <>
                          <div className="flex items-center gap-1 text-stone-600">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">Min {provider.minimumHours || 2} hrs</span>
                          </div>
                          {provider.hourlyRate && (
                            <div className="flex items-center gap-1 text-brand-600 font-semibold">
                              <DollarSign className="w-4 h-4" />
                              <span>{provider.hourlyRate}/hr</span>
                              {provider.fixedFee ? <span className="text-xs text-stone-500">+ fee</span> : null}
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-1 text-stone-600">
                            <Users className="w-4 h-4" />
                            <span className="text-sm">{provider.minGuestCount}-{provider.maxGuestCount} guests</span>
                          </div>
                          {provider.pricePerPerson && (
                            <div className="flex items-center gap-1 text-brand-600 font-semibold">
                              <DollarSign className="w-4 h-4" />
                              <span>{provider.pricePerPerson}/person</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    {provider.isSoloWorker && (
                      <div className="mt-2 flex items-center gap-1 text-amber-600 text-xs">
                        <User className="w-3 h-3" />
                        <span>Freelancer</span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
