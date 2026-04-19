import { Link } from 'react-router-dom';
import { 
  Search, 
  Calendar, 
  MessageSquare, 
  Star,
  ChefHat,
  Music,
  Camera,
  Palette,
  ArrowRight,
  CheckCircle2,
  Users,
  Award
} from 'lucide-react';

const providerTypes = [
  { icon: ChefHat, label: 'Caterers', color: 'bg-orange-100 text-orange-600' },
  { icon: Music, label: 'DJs & Musicians', color: 'bg-purple-100 text-purple-600' },
  { icon: Camera, label: 'Photographers', color: 'bg-blue-100 text-blue-600' },
  { icon: Palette, label: 'Decorators', color: 'bg-pink-100 text-pink-600' },
];

const steps = [
  {
    icon: Search,
    title: 'Describe Your Event',
    description: 'Tell us about your event - guest count, budget, date, and any special requirements.',
  },
  {
    icon: MessageSquare,
    title: 'Receive Quotes',
    description: 'Qualified providers will send you personalized quotes for your event.',
  },
  {
    icon: Calendar,
    title: 'Book & Enjoy',
    description: 'Choose your favorite, confirm the booking, and enjoy your perfectly catered event.',
  },
];

const stats = [
  { value: '2,500+', label: 'Verified Providers' },
  { value: '15,000+', label: 'Events Catered' },
  { value: '4.8', label: 'Average Rating', icon: Star },
  { value: '98%', label: 'Satisfaction Rate' },
];

export default function Landing() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-sage-50" />
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        
        <div className="section-padding relative z-10 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-stone-100 mb-8 animate-fade-in">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-sm text-stone-600">2,500+ verified providers ready to serve</span>
            </div>
            
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-stone-900 leading-tight mb-6 animate-slide-up">
              Perfect Catering for
              <span className="block gradient-text">Every Occasion</span>
            </h1>
            
            <p className="text-xl text-stone-600 mb-10 max-w-2xl mx-auto animate-slide-up animate-delay-100">
              Connect with top-rated caterers, DJs, photographers, and event professionals. 
              Get quotes from verified providers and book with confidence.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up animate-delay-200">
              <Link to="/create-request" className="btn-primary text-lg px-8 py-4">
                Plan Your Event
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link to="/providers" className="btn-secondary text-lg px-8 py-4">
                Browse Providers
              </Link>
            </div>

            {/* Provider Types */}
            <div className="mt-16 flex flex-wrap justify-center gap-4 animate-slide-up animate-delay-300">
              {providerTypes.map((type) => (
                <div
                  key={type.label}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-full shadow-sm border border-stone-100 hover:shadow-md hover:border-stone-200 transition-all cursor-pointer"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${type.color}`}>
                    <type.icon className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-stone-700">{type.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-1 left-0 right-0">
          <svg className="w-full h-20 fill-white" viewBox="0 0 1440 80" preserveAspectRatio="none">
            <path d="M0,40 C480,80 960,0 1440,40 L1440,80 L0,80 Z" />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="section-padding">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <span className="font-display text-4xl font-bold text-stone-900">{stat.value}</span>
                  {stat.icon && <stat.icon className="w-6 h-6 text-yellow-500 fill-yellow-500" />}
                </div>
                <p className="text-stone-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-stone-50">
        <div className="section-padding">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-stone-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              Finding the perfect catering for your event is easy with CaterEase
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.title} className="relative">
                <div className="card p-8 text-center h-full">
                  <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <step.icon className="w-8 h-8 text-brand-600" />
                  </div>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    {index + 1}
                  </div>
                  <h3 className="font-display text-xl font-semibold text-stone-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-stone-600">{step.description}</p>
                </div>
                
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 text-stone-300">
                    <ArrowRight className="w-8 h-8" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="section-padding">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-display text-4xl font-bold text-stone-900 mb-6">
                Why Choose CaterEase?
              </h2>
              <p className="text-lg text-stone-600 mb-8">
                We've built the most comprehensive platform for connecting event hosts 
                with exceptional service providers.
              </p>
              
              <div className="space-y-6">
                {[
                  { title: 'Verified Providers', desc: 'Every provider is vetted and reviewed by real customers' },
                  { title: 'Transparent Pricing', desc: 'Get detailed quotes upfront with no hidden fees' },
                  { title: 'Secure Payments', desc: 'Pay safely through our protected payment system' },
                  { title: 'Dedicated Support', desc: '24/7 support to help you every step of the way' },
                ].map((feature) => (
                  <div key={feature.title} className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-stone-900">{feature.title}</h4>
                      <p className="text-stone-600">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="card p-6 bg-gradient-to-br from-brand-500 to-brand-600 text-white">
                  <Users className="w-8 h-8 mb-4" />
                  <h4 className="font-display text-2xl font-bold mb-1">50,000+</h4>
                  <p className="text-brand-100">Happy Customers</p>
                </div>
                <div className="card p-6">
                  <Award className="w-8 h-8 text-brand-500 mb-4" />
                  <h4 className="font-display text-2xl font-bold text-stone-900 mb-1">Top Rated</h4>
                  <p className="text-stone-600">Event Platform</p>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="card p-6">
                  <Star className="w-8 h-8 text-yellow-500 mb-4" />
                  <h4 className="font-display text-2xl font-bold text-stone-900 mb-1">4.8/5</h4>
                  <p className="text-stone-600">Average Rating</p>
                </div>
                <div className="card p-6 bg-stone-900 text-white">
                  <Calendar className="w-8 h-8 mb-4" />
                  <h4 className="font-display text-2xl font-bold mb-1">15,000+</h4>
                  <p className="text-stone-400">Events Booked</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-brand-500 to-brand-700 relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          }}
        />
        
        <div className="section-padding relative z-10 text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Plan Your Perfect Event?
          </h2>
          <p className="text-xl text-brand-100 mb-10 max-w-2xl mx-auto">
            Join thousands of happy customers who found their perfect catering match through CaterEase.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/register" 
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-brand-600 font-semibold rounded-full hover:bg-stone-100 transition-all duration-200 shadow-xl text-lg"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link 
              to="/providers" 
              className="inline-flex items-center justify-center px-8 py-4 text-white font-semibold rounded-full border-2 border-white/30 hover:bg-white/10 transition-all duration-200 text-lg"
            >
              View Providers
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
