import { buildApiUrl } from '../utils/api';

export interface CarbonFootprintData {
  id?: string;
  company?: string;
  reporting_period: string;
  scope1_emissions: number;
  scope2_emissions: number;
  scope3_emissions: number;
  total_emissions?: number;
  status?: 'draft' | 'submitted' | 'verified';
  created_at?: string;
  verified_at?: string | null;
}

export interface CarbonCalculationInput {
  companyName: string;
  reportingPeriod: string;
  employees: number;
  revenue: number;
  naturalGas: number;
  heatingOil: number;
  companyVehicles: number;
  electricityKWh: number;
  region: string;
  businessTravel: number;
  employeeCommuting: number;
  wasteGenerated: number;
}

export interface CarbonCalculationResult {
  scope1: number;
  scope2: number;
  scope3: number;
  total: number;
  methodology: string;
  emissionFactors: string;
}

class CarbonService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  /**
   * Get all carbon footprints for the authenticated user's company
   */
  async getFootprints(): Promise<CarbonFootprintData[]> {
    const response = await fetch(buildApiUrl('/api/v1/carbon/footprints/'), {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch footprints: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get a single carbon footprint by ID
   */
  async getFootprint(id: string): Promise<CarbonFootprintData> {
    const response = await fetch(buildApiUrl(`/api/v1/carbon/footprints/${id}/`), {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch footprint: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create a new carbon footprint
   */
  async createFootprint(data: Omit<CarbonFootprintData, 'id' | 'company' | 'total_emissions' | 'created_at'>): Promise<CarbonFootprintData> {
    const response = await fetch(buildApiUrl('/api/v1/carbon/footprints/'), {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.detail || 'Failed to create footprint');
    }

    return response.json();
  }

  /**
   * Update an existing carbon footprint
   */
  async updateFootprint(id: string, data: Partial<CarbonFootprintData>): Promise<CarbonFootprintData> {
    const response = await fetch(buildApiUrl(`/api/v1/carbon/footprints/${id}/`), {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.detail || 'Failed to update footprint');
    }

    return response.json();
  }

  /**
   * Delete a carbon footprint
   */
  async deleteFootprint(id: string): Promise<void> {
    const response = await fetch(buildApiUrl(`/api/v1/carbon/footprints/${id}/`), {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete footprint: ${response.statusText}`);
    }
  }

  /**
   * Calculate carbon footprint from input data (helper endpoint)
   */
  async calculateFootprint(input: CarbonCalculationInput): Promise<CarbonCalculationResult> {
    const response = await fetch(buildApiUrl('/api/v1/carbon/footprints/calculate/'), {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.detail || 'Failed to calculate footprint');
    }

    return response.json();
  }

  /**
   * Get carbon balance for the user's company
   */
  async getCarbonBalance(): Promise<any> {
    const response = await fetch(buildApiUrl('/api/v1/carbon/footprints/carbon_balance/'), {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch carbon balance: ${response.statusText}`);
    }

    return response.json();
  }
}

export const carbonService = new CarbonService();
