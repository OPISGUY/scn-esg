import { CarbonOffset, EwasteEntry, ImpactMetrics, CarbonFootprint } from '../types';

export const mockCarbonOffsets: CarbonOffset[] = [
  {
    id: '1',
    name: 'Carbon Credits from Reuse',
    type: 'Technology Recycling',
    price: 25,
    co2Offset: 1,
    description: 'Verified carbon credits generated from our certified e-waste recycling and device refurbishment programs. Each credit represents 1 tonne of CO₂e avoided through proper recycling vs landfill disposal.',
    image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400',
    available: 500,
    category: 'reuse'
  },
  {
    id: '2',
    name: 'Sequoia Tonnes - Direct Sequestration',
    type: 'Carbon Sequestration',
    price: 35,
    co2Offset: 1,
    description: 'Premium carbon offsets from direct atmospheric CO₂ capture and permanent geological sequestration projects. Verified to the highest international standards with additional permanence guarantees.',
    image: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=400',
    available: 750,
    category: 'sequestration'
  },
  {
    id: '3',
    name: 'Digital Skills Training Carbon Credits',
    type: 'Social Impact',
    price: 30,
    co2Offset: 1,
    description: 'Fund digital literacy programs while offsetting carbon through our community-based initiatives. Creates measurable social value while achieving verified carbon reductions.',
    image: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=400',
    available: 1000,
    category: 'social'
  }
];

export const mockEwasteEntries: EwasteEntry[] = [
  {
    id: '1',
    deviceType: 'Laptops',
    quantity: 25,
    weight: 50,
    donationDate: '2024-01-15',
    estimatedCO2Saved: 125,
    status: 'processed',
    carbonCreditsGenerated: 5.2
  },
  {
    id: '2',
    deviceType: 'Desktop Computers',
    quantity: 15,
    weight: 90,
    donationDate: '2024-01-20',
    estimatedCO2Saved: 180,
    status: 'processed',
    carbonCreditsGenerated: 7.5
  },
  {
    id: '3',
    deviceType: 'Mobile Phones',
    quantity: 50,
    weight: 10,
    donationDate: '2024-02-01',
    estimatedCO2Saved: 75,
    status: 'collected',
    carbonCreditsGenerated: 3.1
  }
];

export const mockImpactMetrics: ImpactMetrics = {
  totalCO2Avoided: 2340,
  devicesRecycled: 445,
  offsetsPurchased: 150,
  reportsGenerated: 12,
  eWasteDiverted: 1250, // kg
  carbonCreditsFromDonations: 15.8,
  sequoiaTonnesPurchased: 85,
  studentsSupported: 134,
  monthlyTrend: [
    { month: 'Jan', co2Saved: 380, ewaste: 90 },
    { month: 'Feb', co2Saved: 420, ewaste: 85 },
    { month: 'Mar', co2Saved: 350, ewaste: 95 },
    { month: 'Apr', co2Saved: 480, ewaste: 110 },
    { month: 'May', co2Saved: 390, ewaste: 65 },
    { month: 'Jun', co2Saved: 320, ewaste: 75 }
  ]
};

export const mockCarbonFootprint: CarbonFootprint = {
  id: '1',
  companyName: 'Tech Solutions Ltd',
  reportingPeriod: '2024',
  scope1: 125.5,
  scope2: 340.2,
  scope3: 892.1,
  total: 1357.8,
  createdAt: '2024-01-15',
  status: 'verified'
};

// Real-time carbon balance calculation with localStorage integration
export const calculateCarbonBalance = () => {
  // Get saved footprint data or use mock data
  const savedFootprint = localStorage.getItem('carbonFootprint');
  const footprint = savedFootprint ? JSON.parse(savedFootprint) : mockCarbonFootprint;
  
  // Get saved offset purchases or use mock data
  const savedOffsets = localStorage.getItem('offsetPurchases');
  const offsetPurchases = savedOffsets ? JSON.parse(savedOffsets) : [];
  
  // Calculate total purchased offsets
  const purchasedOffsets = offsetPurchases.reduce((total: number, purchase: any) => {
    return total + purchase.totalCO2Offset;
  }, 0);
  
  const grossEmissions = footprint.total;
  const scnOffsets = mockImpactMetrics.carbonCreditsFromDonations + mockImpactMetrics.sequoiaTonnesPurchased + purchasedOffsets;
  const netEmissions = Math.max(grossEmissions - scnOffsets, 0);
  
  return {
    grossEmissions,
    scnOffsets,
    netEmissions,
    neutralityPercentage: Math.min((scnOffsets / grossEmissions) * 100, 100)
  };
};

// Calculate students supported based on total investment
export const calculateStudentsSupported = () => {
  const savedOffsets = localStorage.getItem('offsetPurchases');
  const offsetPurchases = savedOffsets ? JSON.parse(savedOffsets) : [];
  
  // Calculate total spend on offsets
  const totalOffsetSpend = offsetPurchases.reduce((total: number, purchase: any) => {
    return total + purchase.totalPrice;
  }, 0);
  
  // Estimate hardware value from e-waste donations (£50 average per device)
  const estimatedHardwareValue = mockImpactMetrics.devicesRecycled * 50;
  
  // Students supported calculation: (Hardware value + Offset spend) / £200 per student
  const totalInvestment = estimatedHardwareValue + totalOffsetSpend;
  const studentsSupported = Math.floor(totalInvestment / 200);
  
  return {
    studentsSupported,
    totalInvestment,
    hardwareValue: estimatedHardwareValue,
    offsetSpend: totalOffsetSpend,
    costPerStudent: 200
  };
};

// Get real-time impact metrics
export const getRealTimeImpactMetrics = (): ImpactMetrics => {
  const studentData = calculateStudentsSupported();
  
  return {
    ...mockImpactMetrics,
    studentsSupported: Math.max(studentData.studentsSupported, mockImpactMetrics.studentsSupported)
  };
};