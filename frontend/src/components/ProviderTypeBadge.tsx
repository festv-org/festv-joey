import { 
  ChefHat, 
  Camera, 
  Music, 
  Palette, 
  Calendar,
  Flower2,
  Truck,
  HelpCircle
} from 'lucide-react';

// Centralized provider type configuration
export const providerTypeConfig = [
  { 
    value: 'CATERER', 
    label: 'Caterer', 
    icon: ChefHat, 
    color: 'bg-red-50 text-red-700 border-red-200',
    darkColor: 'bg-red-100 text-red-800 border-red-300'
  },
  { 
    value: 'BARTENDER', 
    label: 'Bartender', 
    icon: ChefHat, 
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    darkColor: 'bg-amber-100 text-amber-800 border-amber-300'
  },
  { 
    value: 'PHOTOGRAPHER', 
    label: 'Photographer', 
    icon: Camera, 
    color: 'bg-pink-50 text-pink-700 border-pink-200',
    darkColor: 'bg-pink-100 text-pink-800 border-pink-300'
  },
  { 
    value: 'VIDEOGRAPHER', 
    label: 'Videographer', 
    icon: Camera, 
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    darkColor: 'bg-purple-100 text-purple-800 border-purple-300'
  },
  { 
    value: 'DJ', 
    label: 'DJ', 
    icon: Music, 
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    darkColor: 'bg-indigo-100 text-indigo-800 border-indigo-300'
  },
  { 
    value: 'MUSICIAN', 
    label: 'Musician', 
    icon: Music, 
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    darkColor: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  { 
    value: 'DECORATOR', 
    label: 'Decorator', 
    icon: Palette, 
    color: 'bg-teal-50 text-teal-700 border-teal-200',
    darkColor: 'bg-teal-100 text-teal-800 border-teal-300'
  },
  { 
    value: 'FLORIST', 
    label: 'Florist', 
    icon: Flower2, 
    color: 'bg-green-50 text-green-700 border-green-200',
    darkColor: 'bg-green-100 text-green-800 border-green-300'
  },
  { 
    value: 'EVENT_PLANNER', 
    label: 'Event Planner', 
    icon: Calendar, 
    color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    darkColor: 'bg-cyan-100 text-cyan-800 border-cyan-300'
  },
  { 
    value: 'RENTAL_EQUIPMENT', 
    label: 'Equipment Rental', 
    icon: Truck, 
    color: 'bg-stone-50 text-stone-700 border-stone-200',
    darkColor: 'bg-stone-100 text-stone-800 border-stone-300'
  },
  { 
    value: 'OTHER', 
    label: 'Other', 
    icon: HelpCircle, 
    color: 'bg-gray-50 text-gray-700 border-gray-200',
    darkColor: 'bg-gray-100 text-gray-800 border-gray-300'
  },
];

interface ProviderTypeBadgeProps {
  type: string;
  showIcon?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
}

export function ProviderTypeBadge({ 
  type, 
  showIcon = true, 
  size = 'md',
  variant = 'light'
}: ProviderTypeBadgeProps) {
  const config = providerTypeConfig.find(t => t.value === type);
  
  // Fallback for unknown types
  if (!config) {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-stone-100 text-stone-700 rounded border border-stone-200">
        {showIcon && <HelpCircle className="w-3 h-3" />}
        {type}
      </span>
    );
  }
  
  const Icon = config.icon;
  
  // Size configurations
  const sizeClasses = {
    xs: {
      text: 'text-xs',
      padding: 'px-2 py-0.5',
      icon: 'w-3 h-3',
    },
    sm: {
      text: 'text-xs',
      padding: 'px-2 py-1',
      icon: 'w-3 h-3',
    },
    md: {
      text: 'text-sm',
      padding: 'px-3 py-1.5',
      icon: 'w-4 h-4',
    },
    lg: {
      text: 'text-base',
      padding: 'px-4 py-2',
      icon: 'w-5 h-5',
    },
  };
  
  const currentSize = sizeClasses[size];
  const colorClass = variant === 'dark' ? config.darkColor : config.color;
  
  return (
    <span 
      className={`inline-flex items-center gap-1.5 ${currentSize.padding} ${currentSize.text} ${colorClass} border rounded-full font-medium transition-colors`}
    >
      {showIcon && <Icon className={currentSize.icon} />}
      <span>{config.label}</span>
    </span>
  );
}

// Helper function to get provider type config
export function getProviderTypeConfig(type: string) {
  return providerTypeConfig.find(t => t.value === type);
}

// Helper function to get all provider types for filters
export function getAllProviderTypes() {
  return providerTypeConfig;
}
