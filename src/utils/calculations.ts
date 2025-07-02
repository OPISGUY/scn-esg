// UK-specific emission factors (DEFRA/BEIS 2024) - GHG Protocol compliant
export const calculateCO2FromElectricity = (kWh: number, region: string = 'UK'): number => {
  // Updated UK grid emission factor: 0.21233 kg CO2e per kWh (DEFRA 2024)
  const emissionFactors: { [key: string]: number } = {
    'UK': 0.21233, // DEFRA/BEIS 2024 UK grid average
    'EU': 0.29,    // European Environment Agency 2024
    'US': 0.43,    // EPA eGRID 2024
    'Global': 0.5  // IEA global average
  };
  
  return kWh * (emissionFactors[region] || emissionFactors['UK']);
};

export const calculateCO2FromFuel = (fuel: string, amount: number): number => {
  // DEFRA 2024 emission factors (kg CO2e per unit)
  const emissionFactors: { [key: string]: number } = {
    'petrol': 2.31,        // kg CO2 per litre
    'diesel': 2.68,        // kg CO2 per litre
    'naturalGas': 0.18362, // kg CO2 per kWh (gross calorific value)
    'heating_oil': 2.52,   // kg CO2 per litre
    'lpg': 1.51,          // kg CO2 per litre
    'coal': 2.04          // kg CO2 per kg
  };
  
  return amount * (emissionFactors[fuel] || 0);
};

export const calculateScope3Simplified = (
  employees: number,
  revenue: number,
  businessTravel: number
): number => {
  // GHG Protocol Scope 3 simplified calculation using UK industry averages
  // Category 7: Employee commuting (UK average: 2.5 tonnes CO2 per employee per year)
  const employeeCommutingFootprint = employees * 2.5;
  
  // Category 1: Purchased goods and services (revenue-based estimation)
  // UK average: 0.0001 tonnes CO2 per £ revenue for service sector
  const purchasedGoodsFootprint = revenue * 0.0001;
  
  // Category 6: Business travel (direct input)
  const travelFootprint = businessTravel;
  
  // Category 5: Waste generated in operations (employee-based estimation)
  // UK average: 0.2 tonnes CO2 per employee per year
  const wasteFootprint = employees * 0.2;
  
  return employeeCommutingFootprint + purchasedGoodsFootprint + travelFootprint + wasteFootprint;
};

export const calculateEwasteCO2Savings = (deviceType: string, quantity: number): number => {
  // CO2 savings per device through proper recycling vs landfill (WEEE Forum data)
  const savingsPerDevice: { [key: string]: number } = {
    'laptops': 300,              // kg CO2 saved per laptop
    'desktop computers': 400,     // kg CO2 saved per desktop
    'mobile phones': 70,         // kg CO2 saved per phone
    'tablets': 130,              // kg CO2 saved per tablet
    'monitors': 200,             // kg CO2 saved per monitor
    'printers': 250,             // kg CO2 saved per printer
    'servers': 800,              // kg CO2 saved per server
    'networking equipment': 150   // kg CO2 saved per network device
  };
  
  const key = deviceType.toLowerCase();
  return quantity * (savingsPerDevice[key] || 100) / 1000; // Convert to tonnes
};

export const formatCO2 = (co2: number): string => {
  if (co2 >= 1000) {
    return `${(co2 / 1000).toFixed(1)}k`;
  }
  return co2.toFixed(1);
};

export const getCO2Color = (amount: number): string => {
  if (amount < 100) return 'text-green-600';
  if (amount < 500) return 'text-yellow-600';
  if (amount < 1000) return 'text-orange-600';
  return 'text-red-600';
};

// Calculate carbon credits generated from e-waste donations (SCN methodology)
export const calculateCarbonCreditsFromEwaste = (deviceType: string, quantity: number): number => {
  // Carbon credits generated per device through SCN's certified recycling process
  // Based on avoided emissions + material recovery + social impact multiplier
  const creditsPerDevice: { [key: string]: number } = {
    'laptops': 0.2,              // tonnes CO2e credits per laptop
    'desktop computers': 0.3,     // tonnes CO2e credits per desktop
    'mobile phones': 0.05,       // tonnes CO2e credits per phone
    'tablets': 0.1,              // tonnes CO2e credits per tablet
    'monitors': 0.15,            // tonnes CO2e credits per monitor
    'printers': 0.2,             // tonnes CO2e credits per printer
    'servers': 0.6,              // tonnes CO2e credits per server
    'networking equipment': 0.1   // tonnes CO2e credits per network device
  };
  
  const key = deviceType.toLowerCase();
  return quantity * (creditsPerDevice[key] || 0.1);
};

// GHG Protocol compliant calculation validation
export const validateGHGProtocolCompliance = (footprint: any): boolean => {
  // Ensure all required scopes are present and calculated
  const hasScope1 = footprint.scope1 !== undefined && footprint.scope1 >= 0;
  const hasScope2 = footprint.scope2 !== undefined && footprint.scope2 >= 0;
  const hasScope3 = footprint.scope3 !== undefined && footprint.scope3 >= 0;
  const hasTotal = footprint.total === (footprint.scope1 + footprint.scope2 + footprint.scope3);
  
  return hasScope1 && hasScope2 && hasScope3 && hasTotal;
};

// Calculate carbon intensity metrics for benchmarking
export const calculateCarbonIntensity = (totalEmissions: number, revenue: number, employees: number) => {
  return {
    perRevenue: revenue > 0 ? (totalEmissions / revenue) * 1000000 : 0, // tonnes CO2e per £M revenue
    perEmployee: employees > 0 ? totalEmissions / employees : 0,        // tonnes CO2e per employee
    perSquareMeter: 0 // Would need floor area input for this metric
  };
};