import {
  UtensilsCrossed,
  ChefHat,
  Music2,
  Camera,
  Flower2,
  HelpCircle,
} from 'lucide-react';

/**
 * Canonical FESTV provider type config.
 * Only these 5 enums are valid — matches ProviderType in schema.prisma.
 */
export const providerTypeConfig = [
  {
    value: 'RESTO_VENUE',
    label: 'Restaurant / Venue',
    icon: UtensilsCrossed,
    color:     'bg-gold/10 text-gold-dark border-gold/30',
    darkColor: 'bg-gold/10 text-gold-dark border-gold/30',
  },
  {
    value: 'CATERER',
    label: 'Caterer',
    icon: ChefHat,
    color:     'bg-green/10 text-green border-green/30',
    darkColor: 'bg-green/10 text-green border-green/30',
  },
  {
    value: 'ENTERTAINMENT',
    label: 'Entertainment',
    icon: Music2,
    color:     'bg-charcoal/10 text-charcoal border-charcoal/30',
    darkColor: 'bg-charcoal/10 text-charcoal border-charcoal/30',
  },
  {
    value: 'PHOTO_VIDEO',
    label: 'Photo & Video',
    icon: Camera,
    color:     'bg-gold-light/10 text-gold-dark border-gold-light/30',
    darkColor: 'bg-gold-light/10 text-gold-dark border-gold-light/30',
  },
  {
    value: 'FLORIST_DECOR',
    label: 'Florist & Decor',
    icon: Flower2,
    color:     'bg-muted/10 text-muted border-muted/30',
    darkColor: 'bg-muted/10 text-muted border-muted/30',
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
  variant = 'light',
}: ProviderTypeBadgeProps) {
  const config = providerTypeConfig.find(t => t.value === type);

  if (!config) {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border"
        style={{ background: '#F5F3EF', color: '#7A7068', borderColor: 'rgba(0,0,0,0.09)' }}>
        {showIcon && <HelpCircle size={12} strokeWidth={1.5} />}
        {type}
      </span>
    );
  }

  const Icon = config.icon;

  const sizeClasses = {
    xs: { text: 'text-xs', padding: 'px-3 py-1' },
    sm: { text: 'text-xs', padding: 'px-3 py-1' },
    md: { text: 'text-xs', padding: 'px-3 py-1' },
    lg: { text: 'text-xs', padding: 'px-3 py-1' },
  };

  const currentSize = sizeClasses[size];
  const colorClass = variant === 'dark' ? config.darkColor : config.color;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-sans font-semibold ${currentSize.padding} ${currentSize.text} ${colorClass} border rounded-full transition-colors`}
    >
      {showIcon && <Icon size={12} strokeWidth={1.5} />}
      <span>{config.label}</span>
    </span>
  );
}

export function getProviderTypeConfig(type: string) {
  return providerTypeConfig.find(t => t.value === type);
}

export function getAllProviderTypes() {
  return providerTypeConfig;
}
