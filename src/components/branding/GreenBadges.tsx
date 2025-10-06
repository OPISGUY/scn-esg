import { motion } from 'framer-motion';
import { Recycle, Zap, Globe, Award } from 'lucide-react';
import { BRAND_IDENTITY } from '../../constants/branding';

interface GreenBadgeProps {
  type?: 'greenPowered' | 'recycledHardware' | 'carbonNeutral' | 'zeroWaste';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

/**
 * GreenBadge - Reusable badge component for green branding
 */
export function GreenBadge({ type = 'greenPowered', size = 'md', animated = false }: GreenBadgeProps) {
  const badge = BRAND_IDENTITY.badges[type];
  
  const iconMap = {
    greenPowered: Zap,
    recycledHardware: Recycle,
    carbonNeutral: Globe,
    zeroWaste: Award,
  };
  
  const Icon = iconMap[type];
  
  const sizeClasses = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const BadgeContent = (
    <div
      className={`inline-flex items-center gap-2 ${sizeClasses[size]} ${badge.bgColor} ${badge.textColor} border ${badge.borderColor} rounded-full font-semibold`}
    >
      <Icon className={iconSizes[size]} />
      <span>{badge.text}</span>
    </div>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
      >
        {BadgeContent}
      </motion.div>
    );
  }

  return BadgeContent;
}

/**
 * GreenBadgeFloating - Animated floating badge for hero sections
 */
export function GreenBadgeFloating({ type = 'greenPowered' }: Pick<GreenBadgeProps, 'type'>) {
  const badge = BRAND_IDENTITY.badges[type];
  const iconMap = {
    greenPowered: Zap,
    recycledHardware: Recycle,
    carbonNeutral: Globe,
    zeroWaste: Award,
  };
  const Icon = iconMap[type];

  return (
    <motion.div
      animate={{
        y: [0, -10, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={`inline-flex items-center gap-2 px-4 py-2 ${badge.bgColor} ${badge.textColor} border ${badge.borderColor} rounded-full font-semibold shadow-lg`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm">{badge.text}</span>
    </motion.div>
  );
}

/**
 * CertificationBadges - Display grid of trust/certification badges
 */
export function CertificationBadges() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {BRAND_IDENTITY.certifications.map((cert: any, index: number) => (
        <motion.div
          key={cert.name}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          viewport={{ once: true }}
          className="bg-white p-4 rounded-lg border-2 border-green-100 text-center hover:border-green-300 hover:shadow-md transition"
        >
          <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-sm font-bold text-gray-900">{cert.name}</div>
          <div className="text-xs text-gray-600 mt-1">{cert.description}</div>
        </motion.div>
      ))}
    </div>
  );
}

/**
 * GreenStats - Display environmental impact statistics
 */
export function GreenStats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {BRAND_IDENTITY.messaging.stats.map((stat: any, index: number) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="text-5xl mb-2">{stat.icon}</div>
          <div className="text-3xl md:text-4xl font-bold text-green-600 mb-1">{stat.value}</div>
          <div className="text-sm md:text-base text-gray-600">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  );
}

/**
 * GreenCommitmentBanner - Full-width banner highlighting green infrastructure
 */
export function GreenCommitmentBanner() {
  return (
    <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          <span className="font-semibold">100% Renewable Energy</span>
        </div>
        <span className="hidden md:inline">•</span>
        <div className="flex items-center gap-2">
          <Recycle className="w-5 h-5" />
          <span className="font-semibold">100% Recycled Hardware</span>
        </div>
        <span className="hidden md:inline">•</span>
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          <span className="font-semibold">Carbon Neutral Infrastructure</span>
        </div>
      </div>
    </div>
  );
}
