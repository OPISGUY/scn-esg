// src/services/emissionFactorService.ts
/**
 * Emission Factor Service
 * 
 * TypeScript client for smart emission factor lookup with region-specific,
 * industry-specific, and time-based factors.
 */

import { buildApiUrl } from '../utils/api';

// ========== TYPE DEFINITIONS ==========

export interface EmissionFactor {
  id: string;
  activity_type: string;
  sub_category: string;
  region_name: string;
  region_code: string;
  region_type: 'global' | 'country' | 'state' | 'city' | 'utility';
  factor_value: number;
  unit: string;
  year: number;
  source: string;
  source_url?: string;
  confidence_level: 'high' | 'medium' | 'low' | 'estimated';
  co2_percentage?: number;
  ch4_percentage?: number;
  n2o_percentage?: number;
  usage_count?: number;
}

export interface EmissionFactorLookupRequest {
  activity_type: string;
  region_code?: string;
  year?: number;
  industry?: string;
  sub_category?: string;
}

export interface EmissionFactorLookupResponse {
  factor: EmissionFactor;
  alternatives: Array<{
    id: string;
    region_name: string;
    factor_value: number;
    unit: string;
    year: number;
  }>;
}

export interface EmissionFactorListResponse {
  factors: EmissionFactor[];
  count: number;
}

// ========== SERVICE CLASS ==========

class EmissionFactorService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  /**
   * Smart emission factor lookup
   * Finds the best matching factor based on activity, region, and time
   */
  async lookupFactor(request: EmissionFactorLookupRequest): Promise<EmissionFactorLookupResponse> {
    const url = buildApiUrl('/carbon/emission-factors/lookup/');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to lookup emission factor');
    }

    return response.json();
  }

  /**
   * List all available emission factors with optional filters
   */
  async listFactors(filters?: {
    activity_type?: string;
    region?: string;
    year?: number;
  }): Promise<EmissionFactorListResponse> {
    const params = new URLSearchParams();
    if (filters?.activity_type) params.append('activity_type', filters.activity_type);
    if (filters?.region) params.append('region', filters.region);
    if (filters?.year) params.append('year', filters.year.toString());

    const url = buildApiUrl(`/carbon/emission-factors/?${params.toString()}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to list emission factors');
    }

    return response.json();
  }

  /**
   * Get factor for electricity based on location
   */
  async getElectricityFactor(regionCode?: string, year: number = 2025): Promise<EmissionFactor> {
    const result = await this.lookupFactor({
      activity_type: 'electricity',
      region_code: regionCode || 'US',
      year,
    });
    return result.factor;
  }

  /**
   * Get factor for natural gas
   */
  async getNaturalGasFactor(year: number = 2025): Promise<EmissionFactor> {
    const result = await this.lookupFactor({
      activity_type: 'natural_gas',
      year,
    });
    return result.factor;
  }

  /**
   * Get factor for vehicle fuel
   */
  async getVehicleFuelFactor(
    fuelType: 'gasoline' | 'diesel',
    regionCode?: string,
    year: number = 2025
  ): Promise<EmissionFactor> {
    const result = await this.lookupFactor({
      activity_type: 'vehicle_fuel',
      sub_category: fuelType,
      region_code: regionCode || 'US',
      year,
    });
    return result.factor;
  }

  /**
   * Get factor for air travel
   */
  async getAirTravelFactor(
    travelType: 'domestic_short' | 'international_long',
    year: number = 2025
  ): Promise<EmissionFactor> {
    const result = await this.lookupFactor({
      activity_type: 'air_travel',
      sub_category: travelType,
      year,
    });
    return result.factor;
  }

  /**
   * Calculate emissions from activity data
   */
  calculateEmissions(quantity: number, factor: EmissionFactor): number {
    return quantity * factor.factor_value;
  }

  /**
   * Format factor for display
   */
  formatFactor(factor: EmissionFactor): string {
    return `${factor.factor_value.toFixed(4)} ${factor.unit}`;
  }

  /**
   * Get human-readable factor description
   */
  getFactorDescription(factor: EmissionFactor): string {
    const regionText = factor.region_name !== 'Global' ? ` (${factor.region_name})` : '';
    const yearText = ` [${factor.year}]`;
    return `${factor.activity_type}${regionText}${yearText}: ${this.formatFactor(factor)}`;
  }

  /**
   * Compare factors
   */
  compareFactor(factor1: EmissionFactor, factor2: EmissionFactor): {
    difference: number;
    percentDifference: number;
    cleaner: 'first' | 'second' | 'same';
  } {
    const diff = factor1.factor_value - factor2.factor_value;
    const percentDiff = (diff / factor2.factor_value) * 100;
    
    let cleaner: 'first' | 'second' | 'same' = 'same';
    if (diff < -0.001) cleaner = 'first';
    else if (diff > 0.001) cleaner = 'second';

    return {
      difference: diff,
      percentDifference: percentDiff,
      cleaner,
    };
  }

  /**
   * Get confidence color for UI
   */
  getConfidenceColor(confidence: string): string {
    switch (confidence) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-orange-600';
      case 'estimated': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  }

  /**
   * Get activity type display name
   */
  getActivityDisplayName(activityType: string): string {
    const names: Record<string, string> = {
      'electricity': 'Electricity',
      'natural_gas': 'Natural Gas',
      'vehicle_fuel': 'Vehicle Fuel',
      'air_travel': 'Air Travel',
      'heating_oil': 'Heating Oil',
      'propane': 'Propane',
      'diesel': 'Diesel',
      'gasoline': 'Gasoline',
    };
    return names[activityType] || activityType.replace(/_/g, ' ');
  }

  /**
   * Get common regions for quick selection
   */
  getCommonRegions(): Array<{ code: string; name: string }> {
    return [
      { code: 'US', name: 'United States (National)' },
      { code: 'US-CA', name: 'California' },
      { code: 'US-TX', name: 'Texas' },
      { code: 'US-NY', name: 'New York' },
      { code: 'GB', name: 'United Kingdom' },
      { code: 'DE', name: 'Germany' },
      { code: 'FR', name: 'France' },
    ];
  }

  /**
   * Get common activity types
   */
  getCommonActivityTypes(): string[] {
    return [
      'electricity',
      'natural_gas',
      'vehicle_fuel',
      'air_travel',
      'heating_oil',
      'propane',
    ];
  }
}

// Export singleton instance
export const emissionFactorService = new EmissionFactorService();
