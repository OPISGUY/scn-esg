import React, { useState, useEffect } from 'react';
import { Calculator, Zap, Car, Building, Save, ArrowRight, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { calculateCO2FromElectricity, calculateCO2FromFuel, calculateScope3Simplified } from '../utils/calculations';
import { useAuth } from '../contexts/AuthContext';
import { useCarbonFootprint } from '../contexts/CarbonFootprintContext';

interface CarbonCalculatorProps {
  onViewChange: (view: string) => void;
}

const CarbonCalculator: React.FC<CarbonCalculatorProps> = ({ onViewChange }) => {
  const { user } = useAuth();
  const { currentFootprint, createFootprint, updateFootprint, isCreating, isUpdating } = useCarbonFootprint();
  const [currentStep, setCurrentStep] = useState(1);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  const isSaving = isCreating || isUpdating;
  const [formData, setFormData] = useState({
    // Company Info
    companyName: '',
    reportingPeriod: '2024',
    employees: 0,
    revenue: 0,
    
    // Scope 1 - Direct emissions
    naturalGas: 0,
    heatingOil: 0,
    companyVehicles: 0,
    
    // Scope 2 - Electricity
    electricityKWh: 0,
    region: 'UK',
    
    // Scope 3 - Simplified
    businessTravel: 0,
    employeeCommuting: 0,
    wasteGenerated: 0
  });

  const [results, setResults] = useState({
    scope1: 0,
    scope2: 0,
    scope3: 0,
    total: 0
  });

  const [dataSource, setDataSource] = useState({
    electricity: 'manual',
    gas: 'manual',
    fuel: 'manual'
  });

  const [uploadedFiles, setUploadedFiles] = useState({
    electricity: null as File | null,
    gas: null as File | null,
    fuel: null as File | null
  });

  // Load existing footprint data on component mount
  useEffect(() => {
    if (!user) {
      return;
    }

    // Pre-populate from currentFootprint if available
    if (currentFootprint) {
      setFormData(prev => ({
        ...prev,
        companyName: currentFootprint.company_data?.name || user.company || '',
        reportingPeriod: currentFootprint.reporting_period || new Date().getFullYear().toString(),
      }));

      // If there's data, show results
      if (currentFootprint.scope1_emissions || currentFootprint.scope2_emissions || currentFootprint.scope3_emissions) {
        setResults({
          scope1: Number(currentFootprint.scope1_emissions) || 0,
          scope2: Number(currentFootprint.scope2_emissions) || 0,
          scope3: Number(currentFootprint.scope3_emissions) || 0,
          total: Number(currentFootprint.total_emissions) || 0,
        });
      }
    } else {
      // No existing footprints, just pre-fill company name
      setFormData(prev => ({
        ...prev,
        companyName: user.company || '',
      }));
    }
  }, [user, currentFootprint]);

  const handleFileUpload = (type: 'electricity' | 'gas' | 'fuel', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFiles(prev => ({ ...prev, [type]: file }));
      // TODO: Parse file and extract data
      alert(`File "${file.name}" uploaded successfully! (Parsing functionality coming soon)`);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateResults = () => {
    // Scope 1 calculations using UK-specific DEFRA 2024 emission factors
    const naturalGasCO2 = calculateCO2FromFuel('naturalGas', formData.naturalGas);
    const oilCO2 = calculateCO2FromFuel('heating_oil', formData.heatingOil);
    const vehicleCO2 = formData.companyVehicles * 2.31 * 12; // Assuming 12 months
    const scope1Total = (naturalGasCO2 + oilCO2 + vehicleCO2) / 1000; // Convert to tonnes

    // Scope 2 calculations using UK grid emission factor
    const scope2Total = calculateCO2FromElectricity(formData.electricityKWh, formData.region) / 1000;

    // Scope 3 calculations (simplified but GHG Protocol compliant categories)
    const scope3Total = calculateScope3Simplified(
      formData.employees,
      formData.revenue,
      formData.businessTravel
    ) + (formData.employeeCommuting / 1000) + (formData.wasteGenerated / 1000);

    const total = scope1Total + scope2Total + scope3Total;

    setResults({
      scope1: scope1Total,
      scope2: scope2Total,
      scope3: scope3Total,
      total: total
    });

    // Save to localStorage for immediate use
    const footprintData = {
      companyName: formData.companyName,
      reportingPeriod: formData.reportingPeriod,
      scope1: scope1Total,
      scope2: scope2Total,
      scope3: scope3Total,
      total: total,
      calculatedAt: new Date().toISOString(),
      methodology: 'GHG Protocol Corporate Standard',
      emissionFactors: 'DEFRA/BEIS 2024'
    };
    localStorage.setItem('carbonFootprint', JSON.stringify(footprintData));
  };

  const handleSaveFootprint = async () => {
    if (!user) {
      setSaveError('Please log in to save your carbon footprint');
      return;
    }

    setSaveError(null);
    setSaveSuccess(false);

    try {
      if (currentFootprint?.id) {
        // Update existing footprint
        await updateFootprint(currentFootprint.id, {
          reporting_period: formData.reportingPeriod,
          scope1_emissions: results.scope1,
          scope2_emissions: results.scope2,
          scope3_emissions: results.scope3,
          status: 'draft'
        });
      } else {
        // Create new footprint
        await createFootprint({
          reporting_period: formData.reportingPeriod,
          scope1_emissions: results.scope1,
          scope2_emissions: results.scope2,
          scope3_emissions: results.scope3,
          status: 'draft'
        });
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000); // Reset after 3 seconds
    } catch (error) {
      console.error('Failed to save footprint:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save footprint');
    }
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      if (currentStep === 4) {
        calculateResults();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const steps = [
    { number: 1, title: 'Company Info', icon: Building },
    { number: 2, title: 'Data Sources', icon: Upload },
    { number: 3, title: 'Direct Emissions', icon: Car },
    { number: 4, title: 'Electricity & Other', icon: Zap },
    { number: 5, title: 'Results', icon: Calculator }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-8 py-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Carbon Footprint Calculator</h1>
          <p className="text-green-100">GHG Protocol compliant carbon footprint assessment with guided data entry</p>
          <div className="mt-4 flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-300 rounded-full"></div>
              <span>DEFRA/BEIS 2024 Emission Factors</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-300 rounded-full"></div>
              <span>GHG Protocol Corporate Standard</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-8 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center space-x-2 ${
                    isActive ? 'text-green-600' : 
                    isCompleted ? 'text-green-500' : 'text-gray-400'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isActive ? 'bg-green-100 text-green-600' :
                      isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-sm">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Company Information</h2>
                <p className="text-gray-600 mb-6">Basic details for your GHG Protocol compliant carbon footprint assessment</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter company name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reporting Period
                  </label>
                  <select
                    value={formData.reportingPeriod}
                    onChange={(e) => handleInputChange('reportingPeriod', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Employees
                  </label>
                  <input
                    type="number"
                    value={formData.employees}
                    onChange={(e) => handleInputChange('employees', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Annual Revenue (£)
                  </label>
                  <input
                    type="number"
                    value={formData.revenue}
                    onChange={(e) => handleInputChange('revenue', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Data Sources & Methodology</h2>
                <p className="text-gray-600 mb-6">Choose how you'll provide your energy and fuel consumption data for accurate GHG calculations</p>
              </div>
              
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-6 h-6 text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-2">GHG Protocol Compliance</h3>
                      <p className="text-blue-800 text-sm mb-4">
                        This calculator follows the GHG Protocol Corporate Accounting and Reporting Standard. 
                        For the most accurate results, we recommend uploading actual utility bills and fuel receipts. 
                        All calculations use the latest UK emission factors from DEFRA/BEIS 2024.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">Electricity Data (Scope 2)</h3>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="electricity"
                          value="manual"
                          checked={dataSource.electricity === 'manual'}
                          onChange={(e) => setDataSource(prev => ({ ...prev, electricity: e.target.value }))}
                          className="mr-2"
                        />
                        <span className="text-sm">Manual entry (kWh)</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="electricity"
                          value="upload"
                          checked={dataSource.electricity === 'upload'}
                          onChange={(e) => setDataSource(prev => ({ ...prev, electricity: e.target.value }))}
                          className="mr-2"
                        />
                        <span className="text-sm">Upload utility bills</span>
                      </label>
                    </div>
                    {dataSource.electricity === 'upload' && (
                      <div className="mt-3">
                        <label className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center space-x-2 cursor-pointer">
                          <Upload className="w-4 h-4" />
                          <span>{uploadedFiles.electricity ? uploadedFiles.electricity.name : 'Upload Bills'}</span>
                          <input 
                            type="file" 
                            accept=".pdf,.jpg,.jpeg,.png,.csv,.xlsx" 
                            onChange={(e) => handleFileUpload('electricity', e)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">Gas Data (Scope 1)</h3>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="gas"
                          value="manual"
                          checked={dataSource.gas === 'manual'}
                          onChange={(e) => setDataSource(prev => ({ ...prev, gas: e.target.value }))}
                          className="mr-2"
                        />
                        <span className="text-sm">Manual entry (kWh)</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="gas"
                          value="upload"
                          checked={dataSource.gas === 'upload'}
                          onChange={(e) => setDataSource(prev => ({ ...prev, gas: e.target.value }))}
                          className="mr-2"
                        />
                        <span className="text-sm">Upload gas bills</span>
                      </label>
                    </div>
                    {dataSource.gas === 'upload' && (
                      <div className="mt-3">
                        <label className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center space-x-2 cursor-pointer">
                          <Upload className="w-4 h-4" />
                          <span>{uploadedFiles.gas ? uploadedFiles.gas.name : 'Upload Bills'}</span>
                          <input 
                            type="file" 
                            accept=".pdf,.jpg,.jpeg,.png,.csv,.xlsx" 
                            onChange={(e) => handleFileUpload('gas', e)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">Fuel Data (Scope 1)</h3>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="fuel"
                          value="manual"
                          checked={dataSource.fuel === 'manual'}
                          onChange={(e) => setDataSource(prev => ({ ...prev, fuel: e.target.value }))}
                          className="mr-2"
                        />
                        <span className="text-sm">Manual entry (litres)</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="fuel"
                          value="upload"
                          checked={dataSource.fuel === 'upload'}
                          onChange={(e) => setDataSource(prev => ({ ...prev, fuel: e.target.value }))}
                          className="mr-2"
                        />
                        <span className="text-sm">Upload fuel receipts</span>
                      </label>
                    </div>
                    {dataSource.fuel === 'upload' && (
                      <div className="mt-3">
                        <label className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center space-x-2 cursor-pointer">
                          <Upload className="w-4 h-4" />
                          <span>{uploadedFiles.fuel ? uploadedFiles.fuel.name : 'Upload Receipts'}</span>
                          <input 
                            type="file" 
                            accept=".pdf,.jpg,.jpeg,.png,.csv,.xlsx" 
                            onChange={(e) => handleFileUpload('fuel', e)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Scope 1: Direct Emissions</h2>
                <p className="text-gray-600 mb-6">Emissions from sources directly owned or controlled by your organization (GHG Protocol Scope 1)</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Natural Gas Consumption (kWh/year)
                    <span className="text-xs text-gray-500 ml-1">- From your gas bills</span>
                  </label>
                  <input
                    type="number"
                    value={formData.naturalGas}
                    onChange={(e) => handleInputChange('naturalGas', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Typical UK office: 50-150 kWh per m² per year</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heating Oil (litres/year)
                    <span className="text-xs text-gray-500 ml-1">- If applicable</span>
                  </label>
                  <input
                    type="number"
                    value={formData.heatingOil}
                    onChange={(e) => handleInputChange('heatingOil', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">DEFRA emission factor: 2.52 kg CO₂/litre</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Vehicle Fuel (litres/month)
                    <span className="text-xs text-gray-500 ml-1">- Fleet fuel consumption</span>
                  </label>
                  <input
                    type="number"
                    value={formData.companyVehicles}
                    onChange={(e) => handleInputChange('companyVehicles', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Petrol: 2.31 kg CO₂/litre | Diesel: 2.68 kg CO₂/litre</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Scope 2 & 3: Indirect Emissions</h2>
                <p className="text-gray-600 mb-6">Electricity consumption (Scope 2) and other indirect emissions (Scope 3)</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Electricity Consumption (kWh/year)
                    <span className="text-xs text-gray-500 ml-1">- From your electricity bills</span>
                  </label>
                  <input
                    type="number"
                    value={formData.electricityKWh}
                    onChange={(e) => handleInputChange('electricityKWh', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">UK grid factor: 0.21233 kg CO₂e/kWh (2024)</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grid Region
                  </label>
                  <select
                    value={formData.region}
                    onChange={(e) => handleInputChange('region', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="UK">United Kingdom</option>
                    <option value="EU">European Union</option>
                    <option value="US">United States</option>
                    <option value="Global">Global Average</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Travel (tonnes CO₂/year)
                    <span className="text-xs text-gray-500 ml-1">- Flights, trains, hotels</span>
                  </label>
                  <input
                    type="number"
                    value={formData.businessTravel}
                    onChange={(e) => handleInputChange('businessTravel', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">London-NYC return flight: ~1 tonne CO₂</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee Commuting (kg CO₂/year)
                    <span className="text-xs text-gray-500 ml-1">- Estimated total</span>
                  </label>
                  <input
                    type="number"
                    value={formData.employeeCommuting}
                    onChange={(e) => handleInputChange('employeeCommuting', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Average UK employee: 1,000-3,000 kg CO₂/year</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Your GHG Protocol Compliant Carbon Footprint</h2>
                <p className="text-gray-600 mb-6">Calculated using DEFRA/BEIS 2024 emission factors and GHG Protocol methodology</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <div className="text-2xl font-bold text-red-600 mb-1">{results.scope1.toFixed(1)}</div>
                  <div className="text-sm font-medium text-red-700">Scope 1</div>
                  <div className="text-xs text-red-600">Direct emissions</div>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <div className="text-2xl font-bold text-orange-600 mb-1">{results.scope2.toFixed(1)}</div>
                  <div className="text-sm font-medium text-orange-700">Scope 2</div>
                  <div className="text-xs text-orange-600">Electricity</div>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <div className="text-2xl font-bold text-yellow-600 mb-1">{results.scope3.toFixed(1)}</div>
                  <div className="text-sm font-medium text-yellow-700">Scope 3</div>
                  <div className="text-xs text-yellow-600">Other indirect</div>
                </div>
                
                <div className="bg-gray-900 rounded-lg p-4 text-white">
                  <div className="text-2xl font-bold mb-1">{results.total.toFixed(1)}</div>
                  <div className="text-sm font-medium">Total</div>
                  <div className="text-xs opacity-80">tonnes CO₂e</div>
                </div>
              </div>

              {/* Methodology Note */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">Calculation Methodology</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>• <strong>Standard:</strong> GHG Protocol Corporate Accounting and Reporting Standard</p>
                  <p>• <strong>Emission Factors:</strong> DEFRA/BEIS 2024 (UK Government)</p>
                  <p>• <strong>Scope 1:</strong> Direct combustion of fuels in owned/controlled sources</p>
                  <p>• <strong>Scope 2:</strong> Indirect emissions from purchased electricity (location-based)</p>
                  <p>• <strong>Scope 3:</strong> Simplified categories - business travel, commuting, waste</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <h3 className="font-semibold text-green-900 mb-3">Next Steps: Complete Your Carbon Balance</h3>
                <p className="text-green-800 mb-4">
                  Your calculated footprint of {results.total.toFixed(1)} tonnes CO₂e represents your gross emissions. 
                  Now explore SCN's certified offset programs to achieve carbon neutrality and create positive social impact.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => onViewChange('offsets')}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2"
                  >
                    <span>Browse Carbon Offsets</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onViewChange('ewaste')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
                  >
                    <span>Log E-waste Donations</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
              currentStep === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Previous
          </button>
          
          <div className="flex items-center space-x-3">
            {currentStep === 5 && (
              <>
                <button 
                  onClick={handleSaveFootprint}
                  disabled={isSaving || !user}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 ${
                    isSaving || !user
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : saveSuccess
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : saveSuccess ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save to Account</span>
                    </>
                  )}
                </button>
                {!user && (
                  <p className="text-sm text-amber-600">Login required to save</p>
                )}
                {saveError && (
                  <p className="text-sm text-red-600">{saveError}</p>
                )}
              </>
            )}
            <button
              onClick={nextStep}
              disabled={currentStep === 5}
              className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 ${
                currentStep === 5
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              <span>{currentStep === 4 ? 'Calculate Footprint' : 'Next'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarbonCalculator;