import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  ChefHat, 
  Camera, 
  Music, 
  Palette,
  Flower2,
  Calendar,
  Truck,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  DollarSign,
  MapPin,
  Users,
  Clock,
  User,
  Plus,
  Trash2,
  GripVertical
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { providersApi } from '../utils/api';

// Provider types with their pricing models
const providerTypes = [
  { 
    value: 'CATERER', 
    label: 'Caterer', 
    icon: ChefHat, 
    description: 'Food & beverage services',
    hasSoloOption: true,
    soloLabel: 'Individual Server/Chef',
    companyLabel: 'Catering Company',
  },
  { 
    value: 'BARTENDER', 
    label: 'Bartender', 
    icon: ChefHat, 
    description: 'Bar services',
    hasSoloOption: true,
    soloLabel: 'Individual Bartender',
    companyLabel: 'Bar Service Company',
  },
  { 
    value: 'PHOTOGRAPHER', 
    label: 'Photographer', 
    icon: Camera, 
    description: 'Event photography',
    pricingModel: 'hourly',
  },
  { 
    value: 'VIDEOGRAPHER', 
    label: 'Videographer', 
    icon: Camera, 
    description: 'Video production',
    pricingModel: 'hourly',
  },
  { 
    value: 'DJ', 
    label: 'DJ', 
    icon: Music, 
    description: 'Music & entertainment',
    pricingModel: 'hourly',
  },
  { 
    value: 'MUSICIAN', 
    label: 'Musician', 
    icon: Music, 
    description: 'Live music',
    pricingModel: 'hourly',
  },
  { 
    value: 'DECORATOR', 
    label: 'Decorator', 
    icon: Palette, 
    description: 'Event decoration',
    pricingModel: 'perPerson',
  },
  { 
    value: 'FLORIST', 
    label: 'Florist', 
    icon: Flower2, 
    description: 'Floral arrangements',
    pricingModel: 'perPerson',
  },
  { 
    value: 'EVENT_PLANNER', 
    label: 'Event Planner', 
    icon: Calendar, 
    description: 'Full event planning',
    pricingModel: 'hourly',
  },
  { 
    value: 'RENTAL_EQUIPMENT', 
    label: 'Equipment Rental', 
    icon: Truck, 
    description: 'Tables, chairs, etc.',
    pricingModel: 'perPerson',
  },
];

// Get pricing model for a provider type
const getPricingModel = (type: string, isSoloWorker: boolean): 'hourly' | 'perPerson' => {
  const providerType = providerTypes.find(t => t.value === type);
  
  // Caterer and Bartender depend on solo vs company
  if (type === 'CATERER' || type === 'BARTENDER') {
    return isSoloWorker ? 'hourly' : 'perPerson';
  }
  
  return providerType?.pricingModel as 'hourly' | 'perPerson' || 'perPerson';
};

interface PricingLevel {
  id: string;
  name: string;
  description: string;
  pricePerPerson: number;
  minimumGuests?: number;
  features: string[];
}

export default function BecomeProvider() {
  const { token, user, switchRole } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  // Check if user already has a profile
  useEffect(() => {
    const checkProfile = async () => {
      if (!token || !user?.roles?.includes('PROVIDER')) {
        setLoading(false);
        return;
      }

      try {
        const profiles: any = await providersApi.getMyProfiles(token);
        if (profiles.data && profiles.data.length > 0) {
          setHasProfile(true);
        }
      } catch (err) {
        console.error('Error checking profile:', err);
      } finally {
        setLoading(false);
      }
    };

    checkProfile();
  }, [token, user]);

  const [formData, setFormData] = useState({
    businessName: '',
    businessDescription: '',
    primaryType: '',
    providerTypes: [] as string[],
    
    // Solo worker flags (for caterer/bartender)
    isSoloWorker: false,
    
    // Location
    serviceRadius: 50,
    serviceAreas: [] as string[],
    serviceAreasInput: '',
    
    // Per-person pricing (for companies: caterers, florists, decorators, equipment, bartender companies)
    minimumBudget: 500,
    maximumBudget: 10000,
    pricePerPerson: 50,
    minGuestCount: 10,
    maxGuestCount: 500,
    depositPercentage: 25,
    
    // Pricing levels for per-person providers
    pricingLevels: [] as PricingLevel[],
    usePricingLevels: false,
    
    // Hourly pricing (for solo workers and hourly services)
    hourlyRate: 75,
    minimumHours: 2,
    fixedFee: 0, // Optional setup/travel fee
    
    // Common
    leadTimeDays: 7,
  });

  const updateForm = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleProviderType = (type: string) => {
    setFormData(prev => {
      const types = prev.providerTypes.includes(type)
        ? prev.providerTypes.filter(t => t !== type)
        : [...prev.providerTypes, type];
      
      // Update primaryType if needed
      const primaryType = types.length > 0 
        ? (types.includes(prev.primaryType) ? prev.primaryType : types[0])
        : '';
      
      return { ...prev, providerTypes: types, primaryType };
    });
  };

  const addServiceArea = () => {
    if (formData.serviceAreasInput.trim()) {
      setFormData(prev => ({
        ...prev,
        serviceAreas: [...prev.serviceAreas, prev.serviceAreasInput.trim()],
        serviceAreasInput: '',
      }));
    }
  };

  const removeServiceArea = (area: string) => {
    setFormData(prev => ({
      ...prev,
      serviceAreas: prev.serviceAreas.filter(a => a !== area),
    }));
  };

  // Pricing Levels Management
  const addPricingLevel = () => {
    const newLevel: PricingLevel = {
      id: Date.now().toString(),
      name: '',
      description: '',
      pricePerPerson: 0,
      features: [],
    };
    setFormData(prev => ({
      ...prev,
      pricingLevels: [...prev.pricingLevels, newLevel],
    }));
  };

  const updatePricingLevel = (id: string, field: keyof PricingLevel, value: any) => {
    setFormData(prev => ({
      ...prev,
      pricingLevels: prev.pricingLevels.map(level => 
        level.id === id ? { ...level, [field]: value } : level
      ),
    }));
  };

  const removePricingLevel = (id: string) => {
    setFormData(prev => ({
      ...prev,
      pricingLevels: prev.pricingLevels.filter(level => level.id !== id),
    }));
  };

  const addFeatureToLevel = (levelId: string, feature: string) => {
    if (feature.trim()) {
      setFormData(prev => ({
        ...prev,
        pricingLevels: prev.pricingLevels.map(level => 
          level.id === levelId 
            ? { ...level, features: [...level.features, feature.trim()] }
            : level
        ),
      }));
    }
  };

  const removeFeatureFromLevel = (levelId: string, featureIndex: number) => {
    setFormData(prev => ({
      ...prev,
      pricingLevels: prev.pricingLevels.map(level => 
        level.id === levelId 
          ? { ...level, features: level.features.filter((_, i) => i !== featureIndex) }
          : level
      ),
    }));
  };

  // Determine if current selection needs solo/company choice
  const needsSoloCompanyChoice = formData.providerTypes.some(
    t => t === 'CATERER' || t === 'BARTENDER'
  );

  // Determine the pricing model based on primary type
  const primaryPricingModel = formData.primaryType 
    ? getPricingModel(formData.primaryType, formData.isSoloWorker)
    : 'perPerson';

  const handleSubmit = async () => {
    if (!token) return;
    setIsSubmitting(true);
    setError('');

    try {
      // Build profile data based on pricing model
      const profileData: Record<string, any> = {
        businessName: formData.businessName,
        businessDescription: formData.businessDescription || undefined,
        primaryType: formData.primaryType,
        providerTypes: formData.providerTypes,
        serviceRadius: formData.serviceRadius,
        serviceAreas: formData.serviceAreas,
        leadTimeDays: formData.leadTimeDays,
        isSoloWorker: formData.isSoloWorker,
      };

      // Add pricing fields based on model
      if (primaryPricingModel === 'hourly') {
        profileData.hourlyRate = formData.hourlyRate;
        profileData.minimumHours = formData.minimumHours;
        profileData.fixedFee = formData.fixedFee || 0;
      } else {
        profileData.minimumBudget = formData.minimumBudget;
        profileData.maximumBudget = formData.maximumBudget;
        profileData.minGuestCount = formData.minGuestCount;
        profileData.maxGuestCount = formData.maxGuestCount;
        profileData.depositPercentage = formData.depositPercentage;
        
        // If using pricing levels, include them; otherwise use default pricePerPerson
        if (formData.usePricingLevels && formData.pricingLevels.length > 0) {
          profileData.pricingLevels = formData.pricingLevels.map(level => ({
            name: level.name,
            description: level.description || undefined,
            pricePerPerson: level.pricePerPerson,
            minimumGuests: level.minimumGuests || undefined,
            features: level.features,
          }));
          // Set default pricePerPerson to lowest level
          profileData.pricePerPerson = Math.min(...formData.pricingLevels.map(l => l.pricePerPerson));
        } else {
          profileData.pricePerPerson = formData.pricePerPerson;
        }
      }

      const response = await providersApi.createProfile(profileData, token);
      
      if ((response as any).success) {
        await switchRole('PROVIDER');
        navigate('/provider/dashboard');
      }
    } catch (err) {
      console.error('Failed to create provider profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to create profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  // If user already has provider role AND profile, redirect
  if (user?.roles?.includes('PROVIDER') && hasProfile) {
    return (
      <div className="py-8">
        <div className="section-padding max-w-2xl mx-auto text-center">
          <div className="card p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="font-display text-2xl font-bold text-stone-900 mb-2">
              You're Already a Provider!
            </h2>
            <p className="text-stone-600 mb-6">
              You already have a provider account. Switch to provider mode to access your provider dashboard.
            </p>
            <button
              onClick={() => {
                switchRole('PROVIDER');
                navigate('/provider/dashboard');
              }}
              className="btn-primary"
            >
              <Briefcase className="w-5 h-5 mr-2" />
              Switch to Provider Mode
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="section-padding max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-stone-600 hover:text-stone-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="font-display text-3xl font-bold text-stone-900">
            Become a Provider
          </h1>
          <p className="text-stone-600 mt-1">
            Start offering your services to clients on CaterEase
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {['Business Info', 'Services', 'Pricing'].map((label, index) => (
            <div key={label} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step > index + 1 
                  ? 'bg-green-500 text-white'
                  : step === index + 1 
                  ? 'bg-brand-500 text-white' 
                  : 'bg-stone-200 text-stone-500'
              }`}>
                {step > index + 1 ? <CheckCircle className="w-5 h-5" /> : index + 1}
              </div>
              <span className={`ml-2 font-medium hidden sm:inline ${step === index + 1 ? 'text-stone-900' : 'text-stone-500'}`}>
                {label}
              </span>
              {index < 2 && <div className="w-8 sm:w-16 h-0.5 bg-stone-200 mx-2 sm:mx-4" />}
            </div>
          ))}
        </div>

        <div className="card p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Business Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => updateForm('businessName', e.target.value)}
                  className="input-field"
                  placeholder="Your business or brand name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Business Description
                </label>
                <textarea
                  value={formData.businessDescription}
                  onChange={(e) => updateForm('businessDescription', e.target.value)}
                  className="input-field min-h-[120px]"
                  placeholder="Tell clients about your business, experience, and what makes you unique..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-3">
                  Service Areas
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={formData.serviceAreasInput}
                    onChange={(e) => updateForm('serviceAreasInput', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addServiceArea())}
                    className="input-field flex-1"
                    placeholder="Enter city or region (e.g., San Francisco Bay Area)"
                  />
                  <button
                    type="button"
                    onClick={addServiceArea}
                    className="btn-secondary"
                  >
                    Add
                  </button>
                </div>
                {formData.serviceAreas.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.serviceAreas.map((area) => (
                      <span
                        key={area}
                        className="px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-sm flex items-center gap-2"
                      >
                        <MapPin className="w-3 h-3" />
                        {area}
                        <button
                          onClick={() => removeServiceArea(area)}
                          className="hover:text-brand-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Service Radius (miles)
                </label>
                <input
                  type="number"
                  value={formData.serviceRadius}
                  onChange={(e) => updateForm('serviceRadius', parseInt(e.target.value))}
                  className="input-field w-32"
                  min="1"
                  max="500"
                />
              </div>
            </div>
          )}

          {/* Step 2: Service Types */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-3">
                  What services do you offer? *
                </label>
                <p className="text-sm text-stone-500 mb-4">
                  Select all that apply. Your primary service type will determine your main pricing structure.
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {providerTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = formData.providerTypes.includes(type.value);
                    const isPrimary = formData.primaryType === type.value;
                    
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => toggleProviderType(type.value)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? 'border-brand-500 bg-brand-50'
                            : 'border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isSelected ? 'bg-brand-500 text-white' : 'bg-stone-100 text-stone-500'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${isSelected ? 'text-brand-700' : 'text-stone-700'}`}>
                                {type.label}
                              </span>
                              {isPrimary && (
                                <span className="px-2 py-0.5 bg-brand-500 text-white text-xs rounded-full">
                                  Primary
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-stone-500 mt-0.5">
                              {type.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {formData.providerTypes.length > 1 && (
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Primary Service Type
                  </label>
                  <select
                    value={formData.primaryType}
                    onChange={(e) => updateForm('primaryType', e.target.value)}
                    className="input-field"
                  >
                    {formData.providerTypes.map((type) => (
                      <option key={type} value={type}>
                        {providerTypes.find(t => t.value === type)?.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Solo Worker vs Company Selection */}
              {needsSoloCompanyChoice && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                  <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Service Type
                  </h4>
                  <p className="text-sm text-amber-800 mb-4">
                    Are you an individual offering your services, or do you run a company?
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => updateForm('isSoloWorker', true)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        formData.isSoloWorker
                          ? 'border-amber-500 bg-amber-100'
                          : 'border-amber-200 hover:border-amber-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          formData.isSoloWorker ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-600'
                        }`}>
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className={`font-medium ${formData.isSoloWorker ? 'text-amber-900' : 'text-stone-700'}`}>
                            Individual / Freelancer
                          </p>
                          <p className="text-sm text-stone-500">
                            Hourly rate + optional fixed fee
                          </p>
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateForm('isSoloWorker', false)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        !formData.isSoloWorker
                          ? 'border-amber-500 bg-amber-100'
                          : 'border-amber-200 hover:border-amber-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          !formData.isSoloWorker ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-600'
                        }`}>
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                          <p className={`font-medium ${!formData.isSoloWorker ? 'text-amber-900' : 'text-stone-700'}`}>
                            Company / Business
                          </p>
                          <p className="text-sm text-stone-500">
                            Per-person pricing, deposits, etc.
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Pricing */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Pricing model indicator */}
              <div className={`p-4 rounded-xl ${
                primaryPricingModel === 'hourly' ? 'bg-blue-50 border border-blue-200' : 'bg-green-50 border border-green-200'
              }`}>
                <div className="flex items-center gap-3">
                  {primaryPricingModel === 'hourly' ? (
                    <>
                      <Clock className="w-6 h-6 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-900">Hourly-Based Pricing</p>
                        <p className="text-sm text-blue-700">
                          Set your hourly rate and optional fixed fees
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Users className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">Per-Person Pricing</p>
                        <p className="text-sm text-green-700">
                          Set your rates based on guest count - optionally create pricing tiers
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Hourly-based pricing fields */}
              {primaryPricingModel === 'hourly' && (
                <>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        <DollarSign className="w-4 h-4 inline mr-1" />
                        Hourly Rate ($) *
                      </label>
                      <input
                        type="number"
                        value={formData.hourlyRate}
                        onChange={(e) => updateForm('hourlyRate', parseInt(e.target.value))}
                        className="input-field"
                        min="1"
                        placeholder="75"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Minimum Hours *
                      </label>
                      <input
                        type="number"
                        value={formData.minimumHours}
                        onChange={(e) => updateForm('minimumHours', parseInt(e.target.value))}
                        className="input-field"
                        min="1"
                        placeholder="2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      Fixed Fee (optional)
                    </label>
                    <p className="text-sm text-stone-500 mb-2">
                      Additional flat fee for travel, setup, equipment, etc.
                    </p>
                    <input
                      type="number"
                      value={formData.fixedFee}
                      onChange={(e) => updateForm('fixedFee', parseInt(e.target.value) || 0)}
                      className="input-field w-40"
                      min="0"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Lead Time (days notice needed)
                    </label>
                    <input
                      type="number"
                      value={formData.leadTimeDays}
                      onChange={(e) => updateForm('leadTimeDays', parseInt(e.target.value))}
                      className="input-field w-32"
                      min="0"
                    />
                  </div>

                  {/* Hourly pricing summary */}
                  <div className="bg-stone-50 rounded-xl p-6">
                    <h3 className="font-semibold text-stone-900 mb-4">Pricing Example</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-stone-600">4 hours of service</span>
                        <span className="font-medium">${formData.hourlyRate * 4}</span>
                      </div>
                      {formData.fixedFee > 0 && (
                        <div className="flex justify-between">
                          <span className="text-stone-600">Fixed fee</span>
                          <span className="font-medium">${formData.fixedFee}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t border-stone-200">
                        <span className="text-stone-900 font-medium">Example Total</span>
                        <span className="font-bold text-brand-600">
                          ${(formData.hourlyRate * 4) + (formData.fixedFee || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Per-person pricing fields */}
              {primaryPricingModel === 'perPerson' && (
                <>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        <Users className="w-4 h-4 inline mr-1" />
                        Minimum Guest Count
                      </label>
                      <input
                        type="number"
                        value={formData.minGuestCount}
                        onChange={(e) => updateForm('minGuestCount', parseInt(e.target.value))}
                        className="input-field"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        <Users className="w-4 h-4 inline mr-1" />
                        Maximum Guest Count
                      </label>
                      <input
                        type="number"
                        value={formData.maxGuestCount}
                        onChange={(e) => updateForm('maxGuestCount', parseInt(e.target.value))}
                        className="input-field"
                        min="1"
                      />
                    </div>
                  </div>

                  {/* Pricing Levels Toggle */}
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.usePricingLevels}
                        onChange={(e) => updateForm('usePricingLevels', e.target.checked)}
                        className="w-5 h-5 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                      />
                      <div>
                        <p className="font-medium text-purple-900">Use Multiple Pricing Levels</p>
                        <p className="text-sm text-purple-700">
                          Create different tiers like "Basic", "Premium", "Deluxe" with different price points
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Single Price or Pricing Levels */}
                  {!formData.usePricingLevels ? (
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        <DollarSign className="w-4 h-4 inline mr-1" />
                        Price Per Person ($)
                      </label>
                      <input
                        type="number"
                        value={formData.pricePerPerson}
                        onChange={(e) => updateForm('pricePerPerson', parseInt(e.target.value))}
                        className="input-field w-40"
                        min="0"
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-stone-700">
                          Pricing Levels
                        </label>
                        <button
                          type="button"
                          onClick={addPricingLevel}
                          className="btn-secondary text-sm"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Level
                        </button>
                      </div>

                      {formData.pricingLevels.length === 0 ? (
                        <div className="text-center py-8 bg-stone-50 rounded-xl border-2 border-dashed border-stone-200">
                          <p className="text-stone-500 mb-3">No pricing levels yet</p>
                          <button
                            type="button"
                            onClick={addPricingLevel}
                            className="btn-primary text-sm"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Your First Level
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {formData.pricingLevels.map((level, index) => (
                            <div key={level.id} className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-2">
                                  <GripVertical className="w-5 h-5 text-stone-400" />
                                  <span className="text-sm font-medium text-stone-500">Level {index + 1}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removePricingLevel(level.id)}
                                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <label className="block text-xs font-medium text-stone-600 mb-1">
                                    Level Name *
                                  </label>
                                  <input
                                    type="text"
                                    value={level.name}
                                    onChange={(e) => updatePricingLevel(level.id, 'name', e.target.value)}
                                    className="input-field text-sm"
                                    placeholder="e.g., Basic, Premium, Deluxe"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-stone-600 mb-1">
                                    Price Per Person ($) *
                                  </label>
                                  <input
                                    type="number"
                                    value={level.pricePerPerson || ''}
                                    onChange={(e) => updatePricingLevel(level.id, 'pricePerPerson', parseInt(e.target.value) || 0)}
                                    className="input-field text-sm"
                                    min="0"
                                    placeholder="0"
                                  />
                                </div>
                              </div>

                              <div className="mb-4">
                                <label className="block text-xs font-medium text-stone-600 mb-1">
                                  Description
                                </label>
                                <input
                                  type="text"
                                  value={level.description}
                                  onChange={(e) => updatePricingLevel(level.id, 'description', e.target.value)}
                                  className="input-field text-sm"
                                  placeholder="Brief description of this tier"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-stone-600 mb-1">
                                  Included Features
                                </label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {level.features.map((feature, fIndex) => (
                                    <span
                                      key={fIndex}
                                      className="px-2 py-1 bg-white border border-stone-200 rounded text-xs flex items-center gap-1"
                                    >
                                      {feature}
                                      <button
                                        type="button"
                                        onClick={() => removeFeatureFromLevel(level.id, fIndex)}
                                        className="text-stone-400 hover:text-red-500"
                                      >
                                        ×
                                      </button>
                                    </span>
                                  ))}
                                </div>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="Add feature (press Enter)"
                                    className="input-field text-sm flex-1"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addFeatureToLevel(level.id, (e.target as HTMLInputElement).value);
                                        (e.target as HTMLInputElement).value = '';
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        <DollarSign className="w-4 h-4 inline mr-1" />
                        Minimum Budget ($)
                      </label>
                      <input
                        type="number"
                        value={formData.minimumBudget}
                        onChange={(e) => updateForm('minimumBudget', parseInt(e.target.value))}
                        className="input-field"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        <DollarSign className="w-4 h-4 inline mr-1" />
                        Maximum Budget ($)
                      </label>
                      <input
                        type="number"
                        value={formData.maximumBudget}
                        onChange={(e) => updateForm('maximumBudget', parseInt(e.target.value))}
                        className="input-field"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Deposit Required (%)
                      </label>
                      <input
                        type="number"
                        value={formData.depositPercentage}
                        onChange={(e) => updateForm('depositPercentage', parseInt(e.target.value))}
                        className="input-field"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Lead Time (days notice needed)
                      </label>
                      <input
                        type="number"
                        value={formData.leadTimeDays}
                        onChange={(e) => updateForm('leadTimeDays', parseInt(e.target.value))}
                        className="input-field"
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Per-person pricing summary */}
                  <div className="bg-stone-50 rounded-xl p-6">
                    <h3 className="font-semibold text-stone-900 mb-4">
                      Pricing Example (100 guests)
                    </h3>
                    {formData.usePricingLevels && formData.pricingLevels.length > 0 ? (
                      <div className="space-y-3">
                        {formData.pricingLevels.map((level) => (
                          <div key={level.id} className="flex justify-between items-center">
                            <span className="text-stone-600">{level.name || 'Unnamed Level'}</span>
                            <span className="font-medium">
                              ${level.pricePerPerson * 100} ({level.pricePerPerson}/person)
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-stone-600">Per person rate</span>
                          <span className="font-medium">${formData.pricePerPerson} × 100</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-600">Subtotal</span>
                          <span className="font-medium">${formData.pricePerPerson * 100}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-stone-200">
                          <span className="text-stone-600">Required deposit ({formData.depositPercentage}%)</span>
                          <span className="font-medium">
                            ${Math.round((formData.pricePerPerson * 100) * (formData.depositPercentage / 100))}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Profile Summary */}
              <div className="bg-brand-50 rounded-xl p-6 border border-brand-200">
                <h3 className="font-semibold text-brand-900 mb-4">Profile Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-brand-700">Business Name</span>
                    <span className="font-medium text-brand-900">{formData.businessName || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-700">Primary Service</span>
                    <span className="font-medium text-brand-900">
                      {providerTypes.find(t => t.value === formData.primaryType)?.label || 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-700">Pricing Model</span>
                    <span className="font-medium text-brand-900">
                      {primaryPricingModel === 'hourly' ? 'Hourly' : 'Per-Person'}
                      {primaryPricingModel === 'perPerson' && formData.usePricingLevels && 
                        ` (${formData.pricingLevels.length} levels)`
                      }
                    </span>
                  </div>
                  {formData.isSoloWorker && (
                    <div className="flex justify-between">
                      <span className="text-brand-700">Type</span>
                      <span className="font-medium text-brand-900">Individual / Freelancer</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-stone-200">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="btn-secondary"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Previous
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && !formData.businessName) ||
                  (step === 2 && formData.providerTypes.length === 0)
                }
                className="btn-primary disabled:opacity-50"
              >
                Next
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={
                  isSubmitting || 
                  !formData.businessName || 
                  formData.providerTypes.length === 0 ||
                  (primaryPricingModel === 'perPerson' && formData.usePricingLevels && 
                    (formData.pricingLevels.length === 0 || formData.pricingLevels.some(l => !l.name || !l.pricePerPerson)))
                }
                className="btn-primary disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Profile...
                  </span>
                ) : (
                  <>
                    <Briefcase className="w-5 h-5 mr-2" />
                    Create Provider Account
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
