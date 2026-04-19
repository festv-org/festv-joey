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
  Phone,
  Mail,
  FileText,
  CreditCard,
  AlertCircle
} from 'lucide-react';

// Mock booking data
const mockBooking = {
  id: '1',
  status: 'DEPOSIT_PAID',
  totalAmount: 6750,
  depositAmount: 2025,
  depositPaid: true,
  balancePaid: false,
  eventRequest: {
    id: '1',
    title: 'Smith Wedding Reception',
    eventType: 'WEDDING',
    guestCount: 150,
    eventDate: '2025-03-15',
    eventStartTime: '18:00',
    eventEndTime: '23:00',
    venueName: 'Grand Ballroom at The Plaza',
    venueAddress: '123 Main Street',
    venueCity: 'San Francisco',
    venueState: 'CA',
    venueZipCode: '94102',
  },
  provider: {
    id: '1',
    businessName: 'Gourmet Delights Catering',
    averageRating: 4.9,
    totalReviews: 128,
    isVerified: true,
    phone: '(555) 123-4567',
    email: 'contact@gourmetdelights.com',
  },
  quote: {
    id: '1',
    items: [
      { name: 'Appetizer Selection', quantity: 150, unitPrice: 8, totalPrice: 1200 },
      { name: 'Main Course - Plated', quantity: 150, unitPrice: 25, totalPrice: 3750 },
      { name: 'Dessert Station', quantity: 1, unitPrice: 800, totalPrice: 800 },
      { name: 'Beverage Service', quantity: 150, unitPrice: 5, totalPrice: 750 },
      { name: 'Service Staff (5 hours)', quantity: 8, unitPrice: 31.25, totalPrice: 250 },
    ],
    subtotal: 6750,
    taxAmount: 0,
    totalAmount: 6750,
  },
  createdAt: '2025-01-15',
  confirmedAt: '2025-01-16',
};

const statusSteps = [
  { key: 'PENDING_DEPOSIT', label: 'Deposit Pending' },
  { key: 'DEPOSIT_PAID', label: 'Deposit Paid' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'COMPLETED', label: 'Completed' },
];

export default function BookingDetail() {
  const { id } = useParams();
  const [showPayment, setShowPayment] = useState(false);

  const currentStepIndex = statusSteps.findIndex(s => s.key === mockBooking.status);
  const balanceDue = mockBooking.totalAmount - mockBooking.depositAmount;

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
              <h1 className="font-display text-3xl font-bold text-stone-900 mb-2">
                Booking #{mockBooking.id.slice(0, 8)}
              </h1>
              <p className="text-stone-600">
                {mockBooking.eventRequest.title}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              mockBooking.status === 'COMPLETED'
                ? 'bg-green-100 text-green-700'
                : mockBooking.status === 'CANCELLED'
                ? 'bg-red-100 text-red-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              {mockBooking.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="card p-6 mb-8">
          <h2 className="font-semibold text-stone-900 mb-6">Booking Progress</h2>
          <div className="flex items-center justify-between">
            {statusSteps.map((step, index) => (
              <div key={step.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    index <= currentStepIndex
                      ? 'bg-green-500 text-white'
                      : 'bg-stone-200 text-stone-500'
                  }`}>
                    {index < currentStepIndex ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <span className="font-semibold">{index + 1}</span>
                    )}
                  </div>
                  <span className={`text-xs mt-2 text-center ${
                    index <= currentStepIndex ? 'text-stone-900 font-medium' : 'text-stone-500'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {index < statusSteps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded ${
                    index < currentStepIndex ? 'bg-green-500' : 'bg-stone-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Alert */}
            {!mockBooking.balancePaid && mockBooking.depositPaid && (
              <div className="card p-5 bg-amber-50 border-amber-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-800">Balance Due</h3>
                    <p className="text-amber-700 text-sm mt-1">
                      Please pay the remaining balance of ${balanceDue.toLocaleString()} at least 7 days before your event.
                    </p>
                    <button 
                      onClick={() => setShowPayment(true)}
                      className="mt-3 px-4 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors"
                    >
                      Pay Balance
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Event Details */}
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold text-stone-900 mb-4">
                Event Details
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-stone-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-stone-500">Date</p>
                    <p className="font-medium text-stone-900">
                      {new Date(mockBooking.eventRequest.eventDate).toLocaleDateString('en-US', {
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
                      {mockBooking.eventRequest.eventStartTime} - {mockBooking.eventRequest.eventEndTime}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-stone-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-stone-500">Guests</p>
                    <p className="font-medium text-stone-900">{mockBooking.eventRequest.guestCount} people</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-stone-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-stone-500">Venue</p>
                    <p className="font-medium text-stone-900">{mockBooking.eventRequest.venueName}</p>
                    <p className="text-sm text-stone-600">
                      {mockBooking.eventRequest.venueCity}, {mockBooking.eventRequest.venueState}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quote Breakdown */}
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold text-stone-900 mb-4">
                <FileText className="w-5 h-5 inline mr-2" />
                Quote Breakdown
              </h2>
              <div className="space-y-3">
                {mockBooking.quote.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
                    <div>
                      <p className="font-medium text-stone-900">{item.name}</p>
                      <p className="text-sm text-stone-500">
                        {item.quantity} × ${item.unitPrice.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-medium text-stone-900">${item.totalPrice.toLocaleString()}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t-2 border-stone-200">
                <div className="flex justify-between text-lg font-semibold text-stone-900">
                  <span>Total</span>
                  <span>${mockBooking.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold text-stone-900 mb-4">
                <CreditCard className="w-5 h-5 inline mr-2" />
                Payment Summary
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-stone-600">Deposit (30%)</span>
                    {mockBooking.depositPaid && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Paid</span>
                    )}
                  </div>
                  <span className="font-medium text-stone-900">${mockBooking.depositAmount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-stone-600">Balance Due</span>
                    {mockBooking.balancePaid && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Paid</span>
                    )}
                  </div>
                  <span className="font-medium text-stone-900">${balanceDue.toLocaleString()}</span>
                </div>
                <div className="pt-3 border-t border-stone-200 flex justify-between">
                  <span className="font-semibold text-stone-900">Total Paid</span>
                  <span className="font-semibold text-green-600">
                    ${(mockBooking.depositPaid ? mockBooking.depositAmount : 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Provider Card */}
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold text-stone-900 mb-4">
                Your Provider
              </h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-brand-100 rounded-xl flex items-center justify-center">
                  <span className="text-xl font-bold text-brand-600">
                    {mockBooking.provider.businessName[0]}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Link 
                      to={`/providers/${mockBooking.provider.id}`}
                      className="font-semibold text-stone-900 hover:text-brand-600"
                    >
                      {mockBooking.provider.businessName}
                    </Link>
                    {mockBooking.provider.isVerified && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-stone-500">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span>{mockBooking.provider.averageRating}</span>
                    <span>({mockBooking.provider.totalReviews} reviews)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-stone-200">
                <a 
                  href={`tel:${mockBooking.provider.phone}`}
                  className="flex items-center gap-3 text-stone-600 hover:text-brand-600"
                >
                  <Phone className="w-4 h-4" />
                  {mockBooking.provider.phone}
                </a>
                <a 
                  href={`mailto:${mockBooking.provider.email}`}
                  className="flex items-center gap-3 text-stone-600 hover:text-brand-600"
                >
                  <Mail className="w-4 h-4" />
                  {mockBooking.provider.email}
                </a>
              </div>

              <button className="w-full btn-secondary mt-4">
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Message
              </button>
            </div>

            {/* Actions */}
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold text-stone-900 mb-4">
                Actions
              </h2>
              <div className="space-y-3">
                <button className="w-full btn-secondary justify-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Download Invoice
                </button>
                <button className="w-full btn-secondary justify-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Add to Calendar
                </button>
                {mockBooking.status === 'COMPLETED' && (
                  <button className="w-full btn-primary justify-center">
                    <Star className="w-4 h-4 mr-2" />
                    Leave Review
                  </button>
                )}
              </div>
            </div>

            {/* Need Help */}
            <div className="card p-6 bg-stone-50">
              <h3 className="font-semibold text-stone-900 mb-2">Need Help?</h3>
              <p className="text-sm text-stone-600 mb-4">
                Contact our support team if you have any questions about your booking.
              </p>
              <a href="/support" className="text-brand-600 font-medium text-sm hover:text-brand-700">
                Contact Support →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
