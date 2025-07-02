export interface CarbonFootprint {
  id: string;
  companyName: string;
  reportingPeriod: string;
  scope1: number;
  scope2: number;
  scope3: number;
  total: number;
  createdAt: string;
  status: 'draft' | 'submitted' | 'verified';
}

export interface EwasteEntry {
  id: string;
  deviceType: string;
  quantity: number;
  weight: number;
  donationDate: string;
  estimatedCO2Saved: number;
  status: 'pending' | 'collected' | 'processed';
  carbonCreditsGenerated?: number;
}

export interface CarbonOffset {
  id: string;
  name: string;
  type: string;
  price: number;
  co2Offset: number;
  description: string;
  image: string;
  available: number;
  category?: 'reuse' | 'sequestration' | 'social';
}

export interface ImpactMetrics {
  totalCO2Avoided: number;
  devicesRecycled: number;
  offsetsPurchased: number;
  reportsGenerated: number;
  eWasteDiverted: number;
  carbonCreditsFromDonations: number;
  sequoiaTonnesPurchased: number;
  studentsSupported: number;
  monthlyTrend: Array<{
    month: string;
    co2Saved: number;
    ewaste: number;
  }>;
}

export interface User {
  id: string;
  companyName: string;
  email: string;
  industry: string;
  employees: number;
  joinedDate: string;
  role: 'admin' | 'decision_maker';
  permissions: string[];
}

export interface DataEntry {
  id: string;
  category: string;
  subcategory: string;
  value: number;
  unit: string;
  period: string;
  source: string;
  uploadedBy: string;
  uploadedAt: string;
  verified: boolean;
}

export interface CarbonBalance {
  grossEmissions: number;
  scnOffsets: number;
  netEmissions: number;
  neutralityPercentage: number;
}