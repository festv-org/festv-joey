import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { 
  Menu, 
  X, 
  ChefHat, 
  User, 
  LogOut, 
  LayoutDashboard,
  Search,
  PlusCircle,
  RefreshCw,
  Briefcase,
  Users,
  UtensilsCrossed,
  CalendarCheck,
  FileText,
  Wallet,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { canAccessPlanner } from '../pages/Planner';

export default function Layout() {
  const { isAuthenticated, user, logout, switchRole, hasRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  const handleSwitchRole = async (role: 'CLIENT' | 'PROVIDER') => {
    if (user?.role === role) return;
    setIsSwitching(true);
    try {
      await switchRole(role);
      setUserMenuOpen(false);
      navigate(role === 'PROVIDER' ? '/provider/dashboard' : '/dashboard');
    } catch (err) {
      console.error('Failed to switch role:', err);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-stone-100">
        <nav className="section-padding">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:shadow-xl group-hover:shadow-brand-500/30 transition-shadow">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-stone-800">
                F<span className="text-brand-500">êtes</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/providers" className="btn-ghost">
                <Search className="w-4 h-4 mr-2" />
                Browse Providers
              </Link>
              
              {isAuthenticated ? (
                <>
                  {user?.role === 'CLIENT' && (
                    <Link to="/create-request" className="btn-ghost">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Create Request
                    </Link>
                  )}
                  
                  {canAccessPlanner(user?.email) && (
                    <>
                      <Link to="/planner" className="btn-ghost text-brand-600">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Planner
                      </Link>
                      <Link to="/database" className="btn-ghost text-brand-600">
                        <Search className="w-4 h-4 mr-2" />
                        Database
                      </Link>
                    </>
                  )}
                  
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 px-3 py-2 rounded-full bg-stone-100 hover:bg-stone-200 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                        {user?.avatarUrl ? (
                          <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {user?.firstName?.[0]}{user?.lastName?.[0]}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="font-medium text-stone-700">
                        {user?.firstName}
                      </span>
                    </button>

                    {userMenuOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setUserMenuOpen(false)}
                        />
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-stone-100 py-2 z-20 animate-slide-up">
                          <div className="px-4 py-2 border-b border-stone-100">
                            <p className="font-medium text-stone-800">{user?.firstName} {user?.lastName}</p>
                            <p className="text-sm text-stone-500">{user?.email}</p>
                            <p className="text-xs text-brand-600 mt-1 flex items-center gap-1">
                              {user?.role === 'PROVIDER' ? (
                                <><Briefcase className="w-3 h-3" /> Provider Mode</>
                              ) : (
                                <><Users className="w-3 h-3" /> Client Mode</>
                              )}
                            </p>
                          </div>
                          
                          {/* Role Switcher */}
                          {user?.roles && user.roles.length > 1 ? (
                            <div className="px-2 py-2 border-b border-stone-100">
                              <p className="px-2 text-xs font-medium text-stone-400 uppercase mb-2">Switch Mode</p>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleSwitchRole('CLIENT')}
                                  disabled={isSwitching || user.role === 'CLIENT'}
                                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    user.role === 'CLIENT'
                                      ? 'bg-brand-100 text-brand-700'
                                      : 'hover:bg-stone-100 text-stone-600'
                                  }`}
                                >
                                  <Users className="w-4 h-4" />
                                  Client
                                </button>
                                <button
                                  onClick={() => handleSwitchRole('PROVIDER')}
                                  disabled={isSwitching || user.role === 'PROVIDER'}
                                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    user.role === 'PROVIDER'
                                      ? 'bg-brand-100 text-brand-700'
                                      : 'hover:bg-stone-100 text-stone-600'
                                  }`}
                                >
                                  <Briefcase className="w-4 h-4" />
                                  Provider
                                </button>
                              </div>
                            </div>
                          ) : !user?.roles?.includes('PROVIDER') ? (
                            <div className="px-2 py-2 border-b border-stone-100">
                              <Link
                                to="/become-provider"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-2 px-2 py-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors text-sm font-medium"
                              >
                                <Briefcase className="w-4 h-4" />
                                Become a Provider
                              </Link>
                            </div>
                          ) : null}
                          
                          <Link
                            to={user?.role === 'PROVIDER' ? '/provider/dashboard' : '/dashboard'}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-stone-700 hover:bg-stone-50 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                          </Link>
                          {user?.role === 'PROVIDER' && (
                            <>
                              <Link
                                to="/provider/menu"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-stone-700 hover:bg-stone-50 transition-colors"
                              >
                                <UtensilsCrossed className="w-4 h-4" />
                                My Menu / Services
                              </Link>
                              <Link
                                to="/provider/bookings"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-stone-700 hover:bg-stone-50 transition-colors"
                              >
                                <CalendarCheck className="w-4 h-4" />
                                Bookings
                              </Link>
                              <Link
                                to="/provider/quotes"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-stone-700 hover:bg-stone-50 transition-colors"
                              >
                                <FileText className="w-4 h-4" />
                                Quotes
                              </Link>
                              <Link
                                to="/provider/earnings"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-stone-700 hover:bg-stone-50 transition-colors"
                              >
                                <Wallet className="w-4 h-4" />
                                Earnings
                              </Link>
                            </>
                          )}
                          <Link
                            to="/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-stone-700 hover:bg-stone-50 transition-colors"
                          >
                            <User className="w-4 h-4" />
                            My Profile
                          </Link>
                          
                          {/* Account Verification Status */}
                          {user?.emailVerified === false ? (
                            <Link
                              to="/account/verify"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-amber-600 hover:bg-amber-50 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Verify Account
                            </Link>
                          ) : (
                            <div className="flex items-center gap-3 px-4 py-2.5 text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              Verified ✓
                            </div>
                          )}
                          
                          {/* Admin Link */}
                          {canAccessPlanner(user?.email) && (
                            <Link
                              to="/admin/providers"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-brand-600 hover:bg-brand-50 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Admin: Verify Providers
                            </Link>
                          )}
                          
                          <hr className="my-2 border-stone-100" />
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors w-full"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-ghost">Sign In</Link>
                  <Link to="/register" className="btn-primary">Get Started</Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-stone-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-stone-700" />
              ) : (
                <Menu className="w-6 h-6 text-stone-700" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-stone-100 animate-slide-up">
              <div className="flex flex-col gap-2">
                <Link 
                  to="/providers" 
                  className="px-4 py-3 rounded-lg hover:bg-stone-100 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Browse Providers
                </Link>
                {isAuthenticated ? (
                  <>
                    <Link 
                      to={user?.role === 'PROVIDER' ? '/provider/dashboard' : '/dashboard'}
                      className="px-4 py-3 rounded-lg hover:bg-stone-100 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    {user?.role === 'PROVIDER' && (
                      <>
                        <Link 
                          to="/provider/menu"
                          className="px-4 py-3 rounded-lg hover:bg-stone-100 transition-colors flex items-center gap-2"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <UtensilsCrossed className="w-4 h-4" />
                          My Menu / Services
                        </Link>
                        <Link 
                          to="/provider/bookings"
                          className="px-4 py-3 rounded-lg hover:bg-stone-100 transition-colors flex items-center gap-2"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <CalendarCheck className="w-4 h-4" />
                          Bookings
                        </Link>
                        <Link 
                          to="/provider/quotes"
                          className="px-4 py-3 rounded-lg hover:bg-stone-100 transition-colors flex items-center gap-2"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <FileText className="w-4 h-4" />
                          Quotes
                        </Link>
                        <Link 
                          to="/provider/earnings"
                          className="px-4 py-3 rounded-lg hover:bg-stone-100 transition-colors flex items-center gap-2"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Wallet className="w-4 h-4" />
                          Earnings
                        </Link>
                      </>
                    )}
                    {user?.role === 'CLIENT' && (
                      <Link 
                        to="/create-request"
                        className="px-4 py-3 rounded-lg hover:bg-stone-100 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Create Request
                      </Link>
                    )}
                    <Link 
                      to="/profile"
                      className="px-4 py-3 rounded-lg hover:bg-stone-100 transition-colors flex items-center gap-3"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                        {user?.avatarUrl ? (
                          <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                            <span className="text-white font-semibold text-xs">
                              {user?.firstName?.[0]}{user?.lastName?.[0]}
                            </span>
                          </div>
                        )}
                      </div>
                      My Profile
                    </Link>
                    
                    {/* Account Verification Status */}
                    {user?.emailVerified === false ? (
                      <Link 
                        to="/account/verify"
                        className="px-4 py-3 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors flex items-center gap-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <CheckCircle className="w-4 h-4" />
                        Verify Account
                      </Link>
                    ) : (
                      <div className="px-4 py-3 text-green-600 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Verified ✓
                      </div>
                    )}
                    
                    {/* Role Switch / Become Provider */}
                    {user?.roles && user.roles.length > 1 ? (
                      <div className="px-4 py-2">
                        <p className="text-xs font-medium text-stone-400 uppercase mb-2">Switch Mode</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              handleSwitchRole('CLIENT');
                              setMobileMenuOpen(false);
                            }}
                            disabled={user.role === 'CLIENT'}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                              user.role === 'CLIENT'
                                ? 'bg-brand-100 text-brand-700'
                                : 'bg-stone-100 text-stone-600'
                            }`}
                          >
                            Client
                          </button>
                          <button
                            onClick={() => {
                              handleSwitchRole('PROVIDER');
                              setMobileMenuOpen(false);
                            }}
                            disabled={user.role === 'PROVIDER'}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                              user.role === 'PROVIDER'
                                ? 'bg-brand-100 text-brand-700'
                                : 'bg-stone-100 text-stone-600'
                            }`}
                          >
                            Provider
                          </button>
                        </div>
                      </div>
                    ) : !user?.roles?.includes('PROVIDER') ? (
                      <Link 
                        to="/become-provider"
                        className="px-4 py-3 rounded-lg hover:bg-brand-50 text-brand-600 transition-colors flex items-center gap-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Briefcase className="w-4 h-4" />
                        Become a Provider
                      </Link>
                    ) : null}
                    
                    {canAccessPlanner(user?.email) && (
                      <>
                        <Link 
                          to="/planner"
                          className="px-4 py-3 rounded-lg hover:bg-brand-50 text-brand-600 transition-colors flex items-center gap-2"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Planner
                        </Link>
                        <Link 
                          to="/database"
                          className="px-4 py-3 rounded-lg hover:bg-brand-50 text-brand-600 transition-colors flex items-center gap-2"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Search className="w-4 h-4" />
                          Database
                        </Link>
                        <Link 
                          to="/admin/providers"
                          className="px-4 py-3 rounded-lg hover:bg-brand-50 text-brand-600 transition-colors flex items-center gap-2"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <CheckCircle className="w-4 h-4" />
                          Admin: Verify Providers
                        </Link>
                      </>
                    )}
                    <button
                      onClick={handleLogout}
                      className="px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 text-left transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/login"
                      className="px-4 py-3 rounded-lg hover:bg-stone-100 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link 
                      to="/register"
                      className="btn-primary mx-4"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-12">
        <div className="section-padding">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                  <ChefHat className="w-5 h-5 text-white" />
                </div>
                <span className="font-display font-bold text-lg text-white">Fêtes</span>
              </div>
              <p className="text-sm">
                The easiest way to find and book catering and event services for your special occasions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">For Clients</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/providers" className="hover:text-white transition-colors">Find Providers</Link></li>
                <li><Link to="/create-request" className="hover:text-white transition-colors">Create Request</Link></li>
                <li><Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">For Providers</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/register?role=provider" className="hover:text-white transition-colors">Join as Provider</Link></li>
                <li><Link to="/provider-resources" className="hover:text-white transition-colors">Resources</Link></li>
                <li><Link to="/success-stories" className="hover:text-white transition-colors">Success Stories</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-stone-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Fêtes. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
