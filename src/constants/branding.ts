/**
 * Verdant By SCN Brand Identity Constants
 * 
 * Theme: World's First Green-Powered ESG Platform on Recycled Hardware
 * USP: Sustainable compliance for a sustainable future
 */

export const BRAND_IDENTITY = {
  // Core Brand Messaging
  tagline: "The World's First Green-Powered ESG Platform",
  subTagline: "Running on 100% Recycled Hardware",
  usp: "Sustainable compliance for a sustainable future",
  missionStatement: "We practice what we preach—our platform runs on renewable energy and recycled hardware, making us the first truly green ESG solution.",
  
  // Color Palette (Tailwind-compatible)
  colors: {
    // Primary Greens
    primaryGreen: '#10B981',      // Emerald-500 (main brand color)
    darkGreen: '#047857',         // Emerald-700 (hover states, emphasis)
    lightGreen: '#D1FAE5',        // Emerald-100 (backgrounds, subtle highlights)
    forestGreen: '#065F46',       // Emerald-800 (text, deep accents)
    
    // Recycled/Sustainability Grays
    recycledGray: '#6B7280',      // Gray-500 (secondary text)
    steelGray: '#4B5563',         // Gray-600 (body text)
    silverGray: '#E5E7EB',        // Gray-200 (borders, dividers)
    
    // Earth Tones (complementary)
    earthBrown: '#92400E',        // Amber-800 (warm accent)
    skyBlue: '#0EA5E9',           // Sky-500 (data visualization)
    sunYellow: '#FBBF24',         // Amber-400 (highlights, badges)
    
    // Semantic Colors
    success: '#10B981',           // Green (positive actions)
    warning: '#F59E0B',           // Amber (alerts)
    danger: '#EF4444',            // Red (errors)
    info: '#3B82F6',              // Blue (information)
  },

  // Typography Scale
  typography: {
    fontFamily: {
      sans: '"Inter", system-ui, -apple-system, sans-serif',
      display: '"Inter", sans-serif',
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem',// 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
      '6xl': '3.75rem', // 60px
    },
  },

  // Brand Messaging
  messaging: {
    hero: {
      primary: "Sustainable Compliance for a Sustainable Future",
      secondary: "The only ESG platform powered by 100% renewable energy and recycled hardware",
      cta: "Start Your Green ESG Journey",
    },
    commitment: {
      title: "Our Green Commitment",
      subtitle: "We don't just help you track sustainability—we embody it",
      description: "Every calculation, every report, every insight runs on infrastructure that's kind to our planet.",
    },
    stats: [
      { value: "100%", label: "Renewable Energy", icon: "⚡" },
      { value: "0%", label: "New Hardware", icon: "♻️" },
      { value: "50 Tonnes", label: "CO₂ Saved Annually", icon: "🌍" },
      { value: "1st", label: "Green ESG Platform", icon: "🌱" },
    ],
    features: [
      "Certified carbon-neutral cloud infrastructure",
      "Servers built from 100% recycled materials",
      "Powered exclusively by wind and solar energy",
      "Zero e-waste: We extend hardware lifecycles",
      "Green data centers with advanced cooling efficiency",
      "Transparent environmental impact reporting",
    ],
  },

  // Visual Elements
  visual: {
    gradients: {
      primary: 'bg-gradient-to-r from-green-600 to-emerald-600',
      hero: 'bg-gradient-to-br from-green-50 via-white to-emerald-50',
      card: 'bg-gradient-to-br from-green-50 to-white',
      overlay: 'bg-gradient-to-r from-green-500/10 to-emerald-500/10',
    },
    shadows: {
      sm: 'shadow-sm hover:shadow-md',
      md: 'shadow-md hover:shadow-lg',
      lg: 'shadow-lg hover:shadow-xl',
      xl: 'shadow-xl hover:shadow-2xl',
    },
    borders: {
      default: 'border border-green-100',
      hover: 'border border-green-200 hover:border-green-300',
      focus: 'focus:ring-2 focus:ring-green-500 focus:border-green-500',
    },
  },

  // Badge Configurations
  badges: {
    greenPowered: {
      text: "100% Green-Powered",
      icon: "⚡",
      bgColor: "bg-green-100",
      textColor: "text-green-700",
      borderColor: "border-green-200",
    },
    recycledHardware: {
      text: "Powered by Recycled Hardware",
      icon: "♻️",
      bgColor: "bg-emerald-100",
      textColor: "text-emerald-700",
      borderColor: "border-emerald-200",
    },
    carbonNeutral: {
      text: "Certified Carbon Neutral",
      icon: "🌍",
      bgColor: "bg-teal-100",
      textColor: "text-teal-700",
      borderColor: "border-teal-200",
    },
    zeroWaste: {
      text: "Zero E-Waste Infrastructure",
      icon: "🔄",
      bgColor: "bg-cyan-100",
      textColor: "text-cyan-700",
      borderColor: "border-cyan-200",
    },
  },

  // Icon Mappings (Lucide React)
  icons: {
    sustainability: 'Leaf',
    recycling: 'Recycle',
    energy: 'Zap',
    earth: 'Globe',
    growth: 'TrendingUp',
    shield: 'Shield',
    check: 'CheckCircle2',
    sparkles: 'Sparkles',
    award: 'Award',
    heart: 'Heart',
  },

  // Animation Variants (Framer Motion)
  animations: {
    fadeIn: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6 },
    },
    slideIn: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.5 },
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.4 },
    },
    floatingBadge: {
      animate: {
        y: [0, -10, 0],
        transition: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        },
      },
    },
  },

  // Component Patterns
  components: {
    button: {
      primary: "bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105",
      secondary: "bg-white text-green-600 border-2 border-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition",
      ghost: "text-green-600 hover:text-green-700 hover:bg-green-50 px-4 py-2 rounded-lg transition",
    },
    card: {
      default: "bg-white p-6 rounded-lg border border-green-100 shadow-sm hover:shadow-md transition-shadow",
      feature: "bg-gradient-to-br from-green-50 to-white p-6 border border-green-100 rounded-lg hover:shadow-lg transition-shadow",
      stat: "bg-white p-8 rounded-xl border-2 border-green-100 shadow-md hover:border-green-200 transition",
    },
    section: {
      default: "py-16 px-6",
      hero: "py-20 px-6 bg-gradient-to-br from-green-50 via-white to-emerald-50",
      dark: "py-16 px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white",
    },
  },

  // Trust Indicators
  certifications: [
    { name: "ISO 14001", description: "Environmental Management" },
    { name: "Carbon Neutral", description: "Certified by Climate Neutral" },
    { name: "Green Web Foundation", description: "Verified Green Hosting" },
    { name: "B Corp Pending", description: "Certified Benefit Corporation (In Progress)" },
  ],

  // Footer Attribution
  footer: {
    greenStatement: "This platform is powered by 100% renewable energy and runs on recycled hardware. Every query you make contributes to a greener future.",
    carbonSavings: "By using Verdant By SCN, you're helping save 50 tonnes of CO₂ annually compared to traditional cloud platforms.",
  },
};

// Helper function to get color value by name
export const getColor = (colorName: keyof typeof BRAND_IDENTITY.colors): string => {
  return BRAND_IDENTITY.colors[colorName];
};

// Helper function to get gradient class
export const getGradient = (gradientName: keyof typeof BRAND_IDENTITY.visual.gradients): string => {
  return BRAND_IDENTITY.visual.gradients[gradientName];
};

// Helper function to format badge
export const getBadge = (badgeName: keyof typeof BRAND_IDENTITY.badges) => {
  return BRAND_IDENTITY.badges[badgeName];
};
