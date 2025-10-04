// Carbon Offset Marketplace Data - Market Competitive Pricing & Sequoia Tonnes
import { CarbonOffset } from '../types';

// Current market rates (January 2025)
export const MARKET_RATES = {
  VOLUNTARY_CREDITS: {
    min: 7.50,
    max: 22,
    average: 15
  },
  COMPLIANCE_CREDITS: {
    min: 27,
    max: 104,
    average: 50
  },
  SEQUOIA_TONNES: {
    base: 27, // Base price for 25-year sequestration
    multiplier: 1.4 // Price multiplier for each extended period
  }
};

// Sequoia Tonnes with different sequestration periods
export const SEQUOIA_TONNES: CarbonOffset[] = [
  {
    id: 'seq-25',
    name: 'Sequoia Tonnes - 25 Year Guarantee',
    type: 'Direct Air Capture',
    price: 27,
    co2Offset: 1,
    sequestrationPeriod: 25,
    description: 'Premium direct air capture with 25-year geological storage guarantee. Verified by leading carbon standards with real-time monitoring.',
    features: ['Direct Air Capture', '25-year guarantee', 'Real-time monitoring', 'Insurance backed'],
    image: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=400',
    available: 100,
    category: 'sequestration',
    permanence: 'high',
    verification: 'Gold Standard + Verra'
  },
  {
    id: 'seq-50',
    name: 'Sequoia Tonnes - 50 Year Guarantee',
    type: 'Enhanced Direct Air Capture',
    price: 38, // 27 * 1.4
    co2Offset: 1,
    sequestrationPeriod: 50,
    description: 'Enhanced direct air capture with 50-year geological storage in deep saline aquifers. Double verification and insurance coverage.',
    features: ['Enhanced DAC Technology', '50-year guarantee', 'Deep geological storage', 'Double insurance'],
    image: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=400',
    available: 75,
    category: 'sequestration',
    permanence: 'very-high',
    verification: 'Gold Standard + Verra + CAR'
  },
  {
    id: 'seq-100',
    name: 'Sequoia Tonnes - 100 Year Guarantee',
    type: 'Permanent Direct Air Capture',
    price: 53, // 27 * 1.4^2
    co2Offset: 1,
    sequestrationPeriod: 100,
    description: 'Ultra-permanent direct air capture with 100-year storage guarantee. Maximum permanence with multi-site geological injection.',
    features: ['Ultra-permanent storage', '100-year guarantee', 'Multi-site injection', 'Triple insurance'],
    image: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=400',
    available: 50,
    category: 'sequestration',
    permanence: 'ultra-high',
    verification: 'Gold Standard + Verra + CAR + ISO'
  },
  {
    id: 'seq-500',
    name: 'Sequoia Tonnes - 500 Year Guarantee',
    type: 'Millennial Direct Air Capture',
    price: 74, // 27 * 1.4^3
    co2Offset: 1,
    sequestrationPeriod: 500,
    description: 'Millennial-scale permanent storage with 500-year guarantee. Ultimate climate commitment with advanced mineralization technology.',
    features: ['Millennial storage', '500-year guarantee', 'Advanced mineralization', 'Comprehensive insurance'],
    image: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=400',
    available: 25,
    category: 'sequestration',
    permanence: 'millennial',
    verification: 'All major standards + proprietary'
  },
  {
    id: 'seq-1000',
    name: 'Sequoia Tonnes - 1000 Year Guarantee',
    type: 'Eternal Direct Air Capture',
    price: 104, // 27 * 1.4^4
    co2Offset: 1,
    sequestrationPeriod: 1000,
    description: 'The ultimate climate solution with 1000-year permanent storage guarantee. Revolutionary technology ensuring carbon removal for generations.',
    features: ['Eternal storage', '1000-year guarantee', 'Revolutionary technology', 'Legacy insurance'],
    image: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=400',
    available: 10,
    category: 'sequestration',
    permanence: 'eternal',
    verification: 'Proprietary eternal standard'
  }
];

// Market-competitive voluntary carbon credits
export const CARBON_CREDITS: CarbonOffset[] = [
  {
    id: 'cc-reuse',
    name: 'Technology Reuse Credits',
    type: 'Circular Economy',
    price: 18,
    co2Offset: 1,
    description: 'Verified carbon credits from our certified e-waste recycling and device refurbishment programs. Avoiding landfill emissions while creating social value.',
    features: ['Immediate impact', 'Social co-benefits', 'Local community support', 'Transparent tracking'],
    image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400',
    available: 500,
    category: 'reuse',
    verification: 'Verra VCS'
  },
  {
    id: 'cc-renewable',
    name: 'Renewable Energy Credits',
    type: 'Clean Energy',
    price: 7.50,
    co2Offset: 1,
    description: 'Support renewable energy projects while offsetting your carbon footprint. Wind and solar projects in developing countries.',
    features: ['Clean energy support', 'Developing country projects', 'UN SDG alignment', 'Additional benefits'],
    image: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=400',
    available: 1000,
    category: 'renewable',
    verification: 'Gold Standard'
  },
  {
    id: 'cc-forestry',
    name: 'Forest Conservation Credits',
    type: 'Nature-Based Solutions',
    price: 15,
    co2Offset: 1,
    description: 'Protect endangered forests while capturing carbon. REDD+ projects with biodiversity co-benefits and community engagement.',
    features: ['Forest protection', 'Biodiversity benefits', 'Community engagement', 'Long-term monitoring'],
    image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
    available: 750,
    category: 'forestry',
    verification: 'Verra VCS + CCB'
  },
  {
    id: 'cc-biochar',
    name: 'Biochar Carbon Removal',
    type: 'Carbon Removal',
    price: 22,
    co2Offset: 1,
    description: 'Permanent carbon removal through biochar production. Agricultural waste converted to long-term carbon storage with soil benefits.',
    features: ['Permanent removal', 'Soil improvement', 'Agricultural benefits', 'Measurable impact'],
    image: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=400',
    available: 200,
    category: 'removal',
    verification: 'Gold Standard + Puro.earth'
  }
];

// Combined marketplace offerings
export const OFFSET_MARKETPLACE = [...CARBON_CREDITS, ...SEQUOIA_TONNES];

// Quick offset calculator presets
export const OFFSET_PRESETS = [
  { tonnes: 1, label: '1 Tonne', description: 'Small business monthly average' },
  { tonnes: 5, label: '5 Tonnes', description: 'Individual annual footprint' },
  { tonnes: 10, label: '10 Tonnes', description: 'Small office annual average' },
  { tonnes: 25, label: '25 Tonnes', description: 'Medium business quarterly' },
  { tonnes: 50, label: '50 Tonnes', description: 'Large office annual average' },
  { tonnes: 100, label: '100 Tonnes', description: 'Enterprise quarterly average' }
];

// Auto-offset calculator
export const calculateOffsetRecommendations = (emissionsTonnes: number) => {
  const recommendations = [];
  
  // Budget option - mix of affordable credits
  const budgetMix = [
    { credit: CARBON_CREDITS.find(c => c.id === 'cc-renewable')!, percentage: 60 },
    { credit: CARBON_CREDITS.find(c => c.id === 'cc-forestry')!, percentage: 40 }
  ];
  const budgetCost = budgetMix.reduce((total, item) => 
    total + (item.credit.price * emissionsTonnes * item.percentage / 100), 0
  );
  
  recommendations.push({
    name: 'Budget Mix',
    totalCost: budgetCost,
    averagePrice: budgetCost / emissionsTonnes,
    credits: budgetMix,
    description: 'Affordable mix of renewable energy and forest conservation credits'
  });
  
  // Balanced option - mix including reuse
  const balancedMix = [
    { credit: CARBON_CREDITS.find(c => c.id === 'cc-reuse')!, percentage: 50 },
    { credit: CARBON_CREDITS.find(c => c.id === 'cc-renewable')!, percentage: 30 },
    { credit: CARBON_CREDITS.find(c => c.id === 'cc-forestry')!, percentage: 20 }
  ];
  const balancedCost = balancedMix.reduce((total, item) => 
    total + (item.credit.price * emissionsTonnes * item.percentage / 100), 0
  );
  
  recommendations.push({
    name: 'Balanced Portfolio',
    totalCost: balancedCost,
    averagePrice: balancedCost / emissionsTonnes,
    credits: balancedMix,
    description: 'Balanced mix including technology reuse and nature-based solutions'
  });
  
  // Premium option - includes some removal
  const premiumMix = [
    { credit: CARBON_CREDITS.find(c => c.id === 'cc-biochar')!, percentage: 30 },
    { credit: CARBON_CREDITS.find(c => c.id === 'cc-reuse')!, percentage: 40 },
    { credit: CARBON_CREDITS.find(c => c.id === 'cc-forestry')!, percentage: 30 }
  ];
  const premiumCost = premiumMix.reduce((total, item) => 
    total + (item.credit.price * emissionsTonnes * item.percentage / 100), 0
  );
  
  recommendations.push({
    name: 'Premium Portfolio',
    totalCost: premiumCost,
    averagePrice: premiumCost / emissionsTonnes,
    credits: premiumMix,
    description: 'Premium mix with permanent carbon removal and high-impact credits'
  });
  
  // Ultra-premium with Sequoia Tonnes
  if (emissionsTonnes <= 10) { // Only recommend for smaller amounts due to cost
    const ultraPremiumCost = SEQUOIA_TONNES[0].price * emissionsTonnes;
    recommendations.push({
      name: 'Sequoia Tonnes (25-year)',
      totalCost: ultraPremiumCost,
      averagePrice: SEQUOIA_TONNES[0].price,
      credits: [{ credit: SEQUOIA_TONNES[0], percentage: 100 }],
      description: 'Ultimate permanence with direct air capture and 25-year storage guarantee'
    });
  }
  
  return recommendations;
};

export default OFFSET_MARKETPLACE;
