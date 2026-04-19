import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Star, 
  MapPin, 
  Users, 
  DollarSign, 
  Calendar,
  CheckCircle,
  MessageSquare,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Play,
  Clock,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { providersApi } from '../utils/api';
import { ProviderProfile as ProviderProfileType } from '../types';

// Determine pricing model based on provider type
const getProviderPricingModel = (primaryType?: string, isSoloWorker?: boolean): 'hourly' | 'perPerson' => {
  // Caterer and Bartender depend on solo vs company
  if (primaryType === 'CATERER' || primaryType === 'BARTENDER') {
    return isSoloWorker ? 'hourly' : 'perPerson';
  }
  
  // Hourly services
  if (['PHOTOGRAPHER', 'VIDEOGRAPHER', 'DJ', 'MUSICIAN', 'EVENT_PLANNER'].includes(primaryType || '')) {
    return 'hourly';
  }
  
  // Per-person services: florist, decorator, equipment rental
  return 'perPerson';
};

// Mock provider data
const mockProvider = {
  id: '1',
  businessName: 'Gourmet Delights Catering',
  businessDescription: `Premium catering services for weddings, corporate events, and special occasions. We specialize in farm-to-table cuisine with locally sourced ingredients.

Our team of professional chefs brings over 20 years of combined experience to every event. We pride ourselves on creating memorable dining experiences that delight your guests and make your special occasion truly unforgettable.

From intimate gatherings to grand celebrations, we customize every menu to match your vision and exceed your expectations.`,
  providerTypes: ['CATERER'],
  primaryType: 'CATERER',
  isSoloWorker: false,
  averageRating: 4.9,
  totalReviews: 128,
  totalBookings: 245,
  // Per-person pricing
  pricePerPerson: 45,
  minimumBudget: 500,
  maximumBudget: 50000,
  depositPercentage: 25,
  minGuestCount: 20,
  maxGuestCount: 500,
  // Hourly pricing (for hourly providers)
  hourlyRate: null,
  minimumHours: null,
  fixedFee: null,
  // Service area
  serviceRadius: 50,
  isVerified: true,
  responseRate: 98,
  responseTime: '< 2 hours',
};

const mockPortfolio = [
  { id: '1', type: 'IMAGE', title: 'Wedding Reception Setup', url: null },
  { id: '2', type: 'IMAGE', title: 'Corporate Gala Buffet', url: null },
  { id: '3', type: 'IMAGE', title: 'Garden Party Appetizers', url: null },
  { id: '4', type: 'IMAGE', title: 'Plated Dinner Service', url: null },
  { id: '5', type: 'VIDEO', title: 'Behind the Scenes', url: null },
  { id: '6', type: 'IMAGE', title: 'Dessert Display', url: null },
];

const mockReviews = [
  {
    id: '1',
    clientName: 'Sarah M.',
    rating: 5,
    title: 'Absolutely phenomenal!',
    content: 'The food was incredible and the service was impeccable. Our wedding guests are still talking about the appetizers!',
    date: '2025-01-15',
    eventType: 'Wedding',
  },
  {
    id: '2',
    clientName: 'Michael R.',
    rating: 5,
    title: 'Best corporate event ever',
    content: 'Professional, punctual, and the food quality was outstanding. Will definitely use again for our company events.',
    date: '2025-01-10',
    eventType: 'Corporate',
  },
  {
    id: '3',
    clientName: 'Jennifer L.',
    rating: 4,
    title: 'Great experience overall',
    content: 'Loved the variety of options and the attention to dietary restrictions. The team was very accommodating.',
    date: '2024-12-28',
    eventType: 'Birthday',
  },
];

const mockServices = [
  {
    id: '1',
    name: 'Full-Service Catering',
    description: 'Complete catering package including setup, service, and cleanup',
    basePrice: 2500,
    pricePerPerson: 45,
  },
  {
    id: '2',
    name: 'Buffet Package',
    description: 'Self-service buffet with variety of options',
    basePrice: 1500,
    pricePerPerson: 35,
  },
  {
    id: '3',
    name: 'Appetizer & Cocktail Service',
    description: 'Passed hors d\'oeuvres and drink service',
    basePrice: 1000,
    pricePerPerson: 25,
  },
];

export default function ProviderProfile() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'about' | 'portfolio' | 'reviews' | 'services'>('about');
  const [isFavorite, setIsFavorite] = useState(false);

  // Determine pricing model
  const pricingModel = getProviderPricingModel(mockProvider.primaryType, mockProvider.isSoloWorker);
  const isHourlyProvider = pricingModel === 'hourly';

  return (
    <div className="pb-12">
      {/* Hero Section */}
      <div className="h-64 md:h-80 bg-gradient-to-br from-brand-500 to-brand-700 relative">
        <div className="absolute inset-0 bg-black/20" />
        <div className="section-padding relative z-10 h-full flex items-end pb-24">
          <div className="flex items-center gap-3">
            <Link to="/providers" className="text-white/80 hover:text-white flex items-center gap-1">
              <ChevronLeft className="w-5 h-5" />
              All Providers
            </Link>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <div className="section-padding -mt-16 relative z-20">
        <div className="card p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 md:w-32 md:h-32 bg-brand-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-4xl md:text-5xl font-bold text-brand-600">
                {mockProvider.businessName[0]}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="font-display text-2xl md:text-3xl font-bold text-stone-900">
                      {mockProvider.businessName}
                    </h1>
                    {mockProvider.isVerified && (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-stone-600">
                    <span className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold text-stone-900">{mockProvider.averageRating}</span>
                      <span>({mockProvider.totalReviews} reviews)</span>
                    </span>
                    <span>•</span>
                    <span>{mockProvider.totalBookings} bookings</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {mockProvider.serviceRadius} mile radius
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`p-3 rounded-full border-2 transition-all ${
                      isFavorite 
                        ? 'border-red-500 bg-red-50 text-red-500' 
                        : 'border-stone-200 hover:border-stone-300 text-stone-500'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                  <button className="p-3 rounded-full border-2 border-stone-200 hover:border-stone-300 text-stone-500">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="px-4 py-2 bg-stone-100 rounded-lg">
                  <span className="text-sm text-stone-500">Response rate</span>
                  <p className="font-semibold text-stone-900">{mockProvider.responseRate}%</p>
                </div>
                <div className="px-4 py-2 bg-stone-100 rounded-lg">
                  <span className="text-sm text-stone-500">Response time</span>
                  <p className="font-semibold text-stone-900">{mockProvider.responseTime}</p>
                </div>
                <div className="px-4 py-2 bg-stone-100 rounded-lg">
                  <span className="text-sm text-stone-500">Starting at</span>
                  {isHourlyProvider ? (
                    <p className="font-semibold text-stone-900">
                      ${mockProvider.hourlyRate || 75}/hr
                      {mockProvider.fixedFee ? ` + ${mockProvider.fixedFee} fee` : ''}
                    </p>
                  ) : (
                    <p className="font-semibold text-stone-900">${mockProvider.pricePerPerson}/person</p>
                  )}
                </div>
                {mockProvider.isSoloWorker && (
                  <div className="px-4 py-2 bg-amber-100 rounded-lg">
                    <span className="text-sm text-amber-700 flex items-center gap-1">
                      <User className="w-4 h-4" />
                      Freelancer
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-3 mt-6 pt-6 border-t border-stone-200">
            <Link to="/create-request" className="btn-primary flex-1 justify-center">
              <Calendar className="w-5 h-5 mr-2" />
              Request Quote
            </Link>
            <button className="btn-secondary">
              <MessageSquare className="w-5 h-5 mr-2" />
              Message
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="section-padding mt-8">
        <div className="border-b border-stone-200">
          <nav className="flex gap-8">
            {(['about', 'portfolio', 'services', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 font-medium transition-colors relative ${
                  activeTab === tab 
                    ? 'text-brand-600' 
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'reviews' && ` (${mockReviews.length})`}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'about' && (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h2 className="font-display text-xl font-semibold text-stone-900 mb-4">
                  About Us
                </h2>
                <div className="prose prose-stone max-w-none">
                  {mockProvider.businessDescription.split('\n\n').map((paragraph, i) => (
                    <p key={i} className="text-stone-600 mb-4">{paragraph}</p>
                  ))}
                </div>
              </div>
              
              <div className="space-y-6">
                {!isHourlyProvider && (
                  <div className="card p-5">
                    <h3 className="font-semibold text-stone-900 mb-4">Capacity</h3>
                    <div className="flex items-center gap-2 text-stone-600">
                      <Users className="w-5 h-5" />
                      <span>{mockProvider.minGuestCount} - {mockProvider.maxGuestCount} guests</span>
                    </div>
                  </div>
                )}
                
                <div className="card p-5">
                  <h3 className="font-semibold text-stone-900 mb-4">Pricing</h3>
                  {isHourlyProvider ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-stone-600">
                        <Clock className="w-5 h-5" />
                        <span>${mockProvider.hourlyRate || 75}/hour</span>
                      </div>
                      {mockProvider.minimumHours && (
                        <div className="flex items-center gap-2 text-stone-600">
                          <Clock className="w-5 h-5" />
                          <span>Min {mockProvider.minimumHours} hours</span>
                        </div>
                      )}
                      {mockProvider.fixedFee && mockProvider.fixedFee > 0 && (
                        <div className="flex items-center gap-2 text-stone-600">
                          <DollarSign className="w-5 h-5" />
                          <span>${mockProvider.fixedFee} setup/travel fee</span>
                        </div>
                      )}
                      <div className="pt-3 mt-3 border-t border-stone-100">
                        <p className="text-sm text-stone-500">Example: 4 hours</p>
                        <p className="text-lg font-bold text-stone-900">
                          ${((mockProvider.hourlyRate || 75) * 4) + (mockProvider.fixedFee || 0)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-stone-600">
                        <DollarSign className="w-5 h-5" />
                        <span>From ${mockProvider.pricePerPerson}/person</span>
                      </div>
                      <div className="flex items-center gap-2 text-stone-600">
                        <DollarSign className="w-5 h-5" />
                        <span>Min: ${mockProvider.minimumBudget?.toLocaleString()}</span>
                      </div>
                      {mockProvider.depositPercentage && (
                        <div className="flex items-center gap-2 text-stone-600">
                          <DollarSign className="w-5 h-5" />
                          <span>{mockProvider.depositPercentage}% deposit required</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'portfolio' && (
            <div>
              <h2 className="font-display text-xl font-semibold text-stone-900 mb-6">
                Portfolio
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {mockPortfolio.map((item) => (
                  <div
                    key={item.id}
                    className="aspect-square bg-gradient-to-br from-stone-200 to-stone-300 rounded-xl overflow-hidden relative group cursor-pointer"
                  >
                    {item.type === 'VIDEO' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                          <Play className="w-8 h-8 text-stone-700 ml-1" />
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end">
                      <p className="p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                        {item.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div>
              <h2 className="font-display text-xl font-semibold text-stone-900 mb-6">
                Services & Packages
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockServices.map((service) => (
                  <div key={service.id} className="card p-6">
                    <h3 className="font-semibold text-stone-900 mb-2">{service.name}</h3>
                    <p className="text-stone-600 text-sm mb-4">{service.description}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                      <div>
                        <p className="text-2xl font-bold text-stone-900">
                          ${service.pricePerPerson}
                        </p>
                        <p className="text-sm text-stone-500">per person</p>
                      </div>
                      <p className="text-sm text-stone-500">
                        From ${service.basePrice.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-semibold text-stone-900">
                  Reviews ({mockReviews.length})
                </h2>
                <div className="flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                  <span className="text-2xl font-bold text-stone-900">{mockProvider.averageRating}</span>
                </div>
              </div>
              
              <div className="space-y-6">
                {mockReviews.map((review) => (
                  <div key={review.id} className="card p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-stone-900">{review.clientName}</p>
                        <p className="text-sm text-stone-500">{review.eventType} • {new Date(review.date).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-stone-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.title && (
                      <h4 className="font-medium text-stone-900 mb-2">{review.title}</h4>
                    )}
                    <p className="text-stone-600">{review.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
