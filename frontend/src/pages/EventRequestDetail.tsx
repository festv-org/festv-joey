import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Users, 
  DollarSign, 
  MapPin,
  ArrowLeft,
  CheckCircle,
  Star,
  MessageSquare,
  ChevronRight
} from 'lucide-react';

// Mock data
const mockRequest = {
  id: '1',
  title: 'Smith Wedding Reception',
  eventType: 'WEDDING',
  description: 'Elegant wedding reception for 150 guests. Looking for high-quality catering with a focus on farm-to-table cuisine.',
  guestCount: 150,
  budgetMin: 5000,
  budgetMax: 8000,
  eventDate: '2025-03-15',
  eventStartTime: '18:00',
  eventEndTime: '23:00',
  venueName: 'Grand Ballroom at The Plaza',
  venueAddress: '123 Main Street',
  venueCity: 'San Francisco',
  venueState: 'CA',
  venueZipCode: '94102',
  status: 'SUBMITTED',
  serviceStyle: 'PLATED',
  createdAt: '2025-01-10',
};

const mockQuotes = [
  {
    id: '1',
    provider: {
      id: '1',
      businessName: 'Gourmet Delights Catering',
      averageRating: 4.9,
      totalReviews: 128,
      isVerified: true,
    },
    totalAmount: 6750,
    pricePerPerson: 45,
    message: 'We would be honored to cater your special day! Our team specializes in elegant plated dinners and we can customize the menu to your preferences.',
    validUntil: '2025-02-15',
    status: 'SENT',
  },
  {
    id: '2',
    provider: {
      id: '2',
      businessName: 'Savory Moments Catering',
      averageRating: 4.7,
      totalReviews: 89,
      isVerified: true,
    },
    totalAmount: 5950,
    pricePerPerson: 39.67,
    message: 'Congratulations on your upcoming wedding! We offer a comprehensive package that includes appetizers, main course, and dessert.',
    validUntil: '2025-02-10',
    status: 'SENT',
  },
  {
    id: '3',
    provider: {
      id: '3',
      businessName: 'Elite Events Catering',
      averageRating: 4.8,
      totalReviews: 156,
      isVerified: false,
    },
    totalAmount: 7200,
    pricePerPerson: 48,
    message: 'We specialize in luxury wedding catering with white-glove service. Our package includes a dedicated event coordinator.',
    validUntil: '2025-02-20',
    status: 'SENT',
  },
];

export default function EventRequestDetail() {
  const { id } = useParams();
  const [selectedQuote, setSelectedQuote] = useState<string | null>(null);

  const handleAcceptQuote = (quoteId: string) => {
    // In real app, this would call the API
    alert(`Quote ${quoteId} accepted! Redirecting to booking...`);
  };

  return (
    <div className="py-8">
      <div className="section-padding">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/dashboard" 
            className="flex items-center gap-2 text-stone-600 hover:text-stone-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-display text-3xl font-bold text-stone-900">
                  {mockRequest.title}
                </h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  mockRequest.status === 'SUBMITTED'
                    ? 'bg-amber-100 text-amber-700'
                    : mockRequest.status === 'QUOTED'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {mockRequest.status}
                </span>
              </div>
              <p className="text-stone-600">
                Created on {new Date(mockRequest.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="font-display text-lg font-semibold text-stone-900 mb-4">
                Event Details
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-stone-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-stone-500">Date</p>
                    <p className="font-medium text-stone-900">
                      {new Date(mockRequest.eventDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-stone-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-stone-500">Time</p>
                    <p className="font-medium text-stone-900">
                      {mockRequest.eventStartTime} - {mockRequest.eventEndTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-stone-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-stone-500">Guests</p>
                    <p className="font-medium text-stone-900">{mockRequest.guestCount} people</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-stone-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-stone-500">Budget</p>
                    <p className="font-medium text-stone-900">
                      ${mockRequest.budgetMin.toLocaleString()} - ${mockRequest.budgetMax.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-stone-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-stone-500">Venue</p>
                    <p className="font-medium text-stone-900">{mockRequest.venueName}</p>
                    <p className="text-sm text-stone-600">
                      {mockRequest.venueAddress}<br />
                      {mockRequest.venueCity}, {mockRequest.venueState} {mockRequest.venueZipCode}
                    </p>
                  </div>
                </div>
              </div>

              {mockRequest.description && (
                <div className="mt-6 pt-6 border-t border-stone-200">
                  <h3 className="font-medium text-stone-900 mb-2">Description</h3>
                  <p className="text-stone-600 text-sm">{mockRequest.description}</p>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-stone-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-500">Event Type</span>
                  <span className="font-medium text-stone-900">{mockRequest.eventType}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-stone-500">Service Style</span>
                  <span className="font-medium text-stone-900">{mockRequest.serviceStyle}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quotes */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-semibold text-stone-900">
                Quotes Received ({mockQuotes.length})
              </h2>
            </div>

            {mockQuotes.length === 0 ? (
              <div className="card p-12 text-center">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-stone-400" />
                </div>
                <h3 className="font-semibold text-stone-900 mb-2">No quotes yet</h3>
                <p className="text-stone-600">
                  Providers are reviewing your request. You'll receive quotes soon!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {mockQuotes.map((quote) => (
                  <div 
                    key={quote.id} 
                    className={`card p-6 transition-all ${
                      selectedQuote === quote.id ? 'ring-2 ring-brand-500' : ''
                    }`}
                  >
                    {/* Provider Info */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-brand-100 rounded-xl flex items-center justify-center">
                          <span className="text-xl font-bold text-brand-600">
                            {quote.provider.businessName[0]}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Link 
                              to={`/providers/${quote.provider.id}`}
                              className="font-semibold text-stone-900 hover:text-brand-600"
                            >
                              {quote.provider.businessName}
                            </Link>
                            {quote.provider.isVerified && (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-stone-500">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span>{quote.provider.averageRating}</span>
                            <span>({quote.provider.totalReviews} reviews)</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-stone-900">
                          ${quote.totalAmount.toLocaleString()}
                        </p>
                        <p className="text-sm text-stone-500">
                          ${quote.pricePerPerson.toFixed(2)}/person
                        </p>
                      </div>
                    </div>

                    {/* Message */}
                    <p className="text-stone-600 mb-4">{quote.message}</p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                      <p className="text-sm text-stone-500">
                        Valid until {new Date(quote.validUntil).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2">
                        <Link 
                          to={`/providers/${quote.provider.id}`}
                          className="btn-secondary text-sm py-2"
                        >
                          View Profile
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                        <button
                          onClick={() => handleAcceptQuote(quote.id)}
                          className="btn-primary text-sm py-2"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Accept Quote
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
