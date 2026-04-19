import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusCircle, 
  Calendar, 
  Clock, 
  DollarSign, 
  Users,
  ChevronRight,
  FileText,
  CheckCircle,
  AlertCircle,
  Star,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { EventRequest, Booking } from '../types';
import { eventRequestsApi, bookingsApi } from '../utils/api';
import { format } from 'date-fns';

export default function ClientDashboard() {
  const { user, token } = useAuth();
  const [eventRequests, setEventRequests] = useState<EventRequest[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!token) return;
      
      try {
        // Fetch event requests
        try {
          const requestsRes = await eventRequestsApi.getMyRequests(token);
          console.log('Event requests response:', requestsRes);
          if ((requestsRes as any).success) {
            // Backend returns array directly in data, not data.eventRequests
            const requests = (requestsRes as any).data || [];
            setEventRequests(Array.isArray(requests) ? requests : []);
          }
        } catch (err) {
          console.log('No event requests found:', err);
          setEventRequests([]);
        }
        
        // Fetch bookings
        try {
          const bookingsRes = await bookingsApi.getClientBookings(token);
          console.log('Bookings response:', bookingsRes);
          if ((bookingsRes as any).success) {
            // Backend returns array directly in data, not data.bookings
            const bookingsList = (bookingsRes as any).data || [];
            setBookings(Array.isArray(bookingsList) ? bookingsList : []);
          }
        } catch (err) {
          console.log('No bookings found:', err);
          setBookings([]);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [token]);

  const activeRequests = eventRequests.filter(r => r.status === 'SUBMITTED');
  const upcomingBookings = bookings.filter(b => 
    ['CONFIRMED', 'DEPOSIT_PAID'].includes(b.status)
  );

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="section-padding">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-stone-900">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-stone-600 mt-1">
              Manage your event requests and bookings
            </p>
          </div>
          <Link to="/create-request" className="btn-primary">
            <PlusCircle className="w-5 h-5 mr-2" />
            New Event Request
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link to="/event-requests" className="card p-5 card-hover">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-900">{eventRequests.length}</p>
                <p className="text-sm text-stone-500">Total Requests</p>
              </div>
            </div>
          </Link>
          
          <Link to="/event-requests?status=SUBMITTED" className="card p-5 card-hover">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-900">{activeRequests.length}</p>
                <p className="text-sm text-stone-500">Awaiting Quotes</p>
              </div>
            </div>
          </Link>
          
          <Link to="/bookings?status=upcoming" className="card p-5 card-hover">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-900">{upcomingBookings.length}</p>
                <p className="text-sm text-stone-500">Upcoming Events</p>
              </div>
            </div>
          </Link>
          
          <Link to="/bookings?status=completed" className="card p-5 card-hover">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-900">
                  {bookings.filter(b => b.status === 'COMPLETED').length}
                </p>
                <p className="text-sm text-stone-500">Completed</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Event Requests */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold text-stone-900">
                Event Requests
              </h2>
              <Link to="/event-requests" className="text-brand-600 text-sm font-medium hover:text-brand-700 flex items-center gap-1">
                View all
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {eventRequests.length === 0 ? (
              <div className="card p-8 text-center">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-stone-400" />
                </div>
                <h3 className="font-semibold text-stone-900 mb-2">No event requests yet</h3>
                <p className="text-stone-600 mb-4">
                  Create your first event request to start receiving quotes from providers.
                </p>
                <Link to="/create-request" className="btn-primary">
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Create Request
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {eventRequests.slice(0, 5).map((request) => (
                  <Link
                    key={request.id}
                    to={`/event-requests/${request.id}`}
                    className="card p-5 card-hover flex items-center gap-4"
                  >
                    <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-brand-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-stone-900 truncate">
                        {request.title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-stone-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(request.eventDate), 'MMM d, yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {request.guestCount} guests
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        request.status === 'SUBMITTED' 
                          ? 'bg-amber-100 text-amber-700'
                          : request.status === 'DRAFT'
                          ? 'bg-stone-100 text-stone-600'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {request.status}
                      </span>
                      {((request as any)._count?.quotes > 0 || (request.quotes && request.quotes.length > 0)) && (
                        <span className="px-2 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-medium">
                          {(request as any)._count?.quotes || request.quotes?.length} quotes
                        </span>
                      )}
                      <ChevronRight className="w-5 h-5 text-stone-400" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Bookings */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold text-stone-900">
                Upcoming Bookings
              </h2>
              <Link to="/bookings" className="text-brand-600 text-sm font-medium hover:text-brand-700 flex items-center gap-1">
                View all
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {upcomingBookings.length === 0 ? (
              <div className="card p-8 text-center">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-stone-400" />
                </div>
                <h3 className="font-semibold text-stone-900 mb-2">No upcoming bookings</h3>
                <p className="text-stone-600">
                  Accept a quote to create your first booking.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.slice(0, 5).map((booking) => (
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
                        {booking.eventRequest?.title || 'Event Booking'}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-stone-500 mt-1">
                        <span>{booking.provider?.businessName}</span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          ${booking.totalAmount?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'CONFIRMED'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {booking.status.replace('_', ' ')}
                      </span>
                      <ChevronRight className="w-5 h-5 text-stone-400" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="font-display text-xl font-semibold text-stone-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/create-request" className="card p-5 card-hover group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center group-hover:bg-brand-200 transition-colors">
                  <PlusCircle className="w-6 h-6 text-brand-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900">Create Request</h3>
                  <p className="text-sm text-stone-500">Start planning a new event</p>
                </div>
              </div>
            </Link>
            
            <Link to="/providers" className="card p-5 card-hover group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900">Browse Providers</h3>
                  <p className="text-sm text-stone-500">Explore caterers & services</p>
                </div>
              </div>
            </Link>
            
            <Link to="/favorites" className="card p-5 card-hover group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                  <Star className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900">Favorites</h3>
                  <p className="text-sm text-stone-500">View saved providers</p>
                </div>
              </div>
            </Link>
            
            {!user?.roles?.includes('PROVIDER') && (
              <Link to="/become-provider" className="card p-5 card-hover group border-2 border-dashed border-stone-200 hover:border-brand-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                    <Briefcase className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-900">Become a Provider</h3>
                    <p className="text-sm text-stone-500">Offer your services</p>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
