import React from 'react';
import { TrendingUp, Users, Leaf, Award } from 'lucide-react';
import { mockImpactMetrics } from '../data/mockData';

const ImpactViewer: React.FC = () => {
  const { totalCO2Avoided, devicesRecycled, offsetsPurchased, monthlyTrend } = mockImpactMetrics;

  const maxCO2 = Math.max(...monthlyTrend.map(m => m.co2Saved));
  const maxEwaste = Math.max(...monthlyTrend.map(m => m.ewaste));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-4">Environmental Impact Dashboard</h1>
        <p className="text-lg text-emerald-100">
          Visualize the positive environmental and social impact of your partnership with SCN
        </p>
      </div>

      {/* Key Impact Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-100 rounded-full -mr-10 -mt-10"></div>
          <div className="relative">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Leaf className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">{(totalCO2Avoided / 1000).toFixed(1)}k</div>
            <div className="font-semibold text-gray-900">CO₂ Avoided</div>
            <div className="text-sm text-gray-600">Tonnes this year</div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-100 rounded-full -mr-10 -mt-10"></div>
          <div className="relative">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">{Math.floor(devicesRecycled * 0.3)}</div>
            <div className="font-semibold text-gray-900">People Helped</div>
            <div className="text-sm text-gray-600">Through digital inclusion</div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-100 rounded-full -mr-10 -mt-10"></div>
          <div className="relative">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-2">{devicesRecycled}</div>
            <div className="font-semibold text-gray-900">Devices Refurbished</div>
            <div className="text-sm text-gray-600">Given second life</div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-100 rounded-full -mr-10 -mt-10"></div>
          <div className="relative">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-orange-600 mb-2">{offsetsPurchased}</div>
            <div className="font-semibold text-gray-900">Carbon Credits</div>
            <div className="text-sm text-gray-600">Purchased & verified</div>
          </div>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Monthly Impact Trends</h2>
            <p className="text-gray-600">CO₂ savings and e-waste processing over time</p>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-gray-600">CO₂ Saved (kg)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-gray-600">E-waste (kg)</span>
            </div>
          </div>
        </div>
        
        <div className="relative h-64">
          <div className="absolute inset-0 flex items-end justify-between space-x-2">
            {monthlyTrend.map((month, index) => (
              <div key={month.month} className="flex-1 flex flex-col items-center space-y-2">
                <div className="w-full flex space-x-1 items-end h-48">
                  <div
                    className="bg-green-500 rounded-t flex-1 transition-all duration-1000 ease-out"
                    style={{ 
                      height: `${(month.co2Saved / maxCO2) * 100}%`,
                      animationDelay: `${index * 100}ms`
                    }}
                  ></div>
                  <div
                    className="bg-blue-500 rounded-t flex-1 transition-all duration-1000 ease-out"
                    style={{ 
                      height: `${(month.ewaste / maxEwaste) * 100}%`,
                      animationDelay: `${index * 100 + 50}ms`
                    }}
                  ></div>
                </div>
                <div className="text-xs font-medium text-gray-600">{month.month}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Impact Stories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Environmental Impact */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 border border-green-200">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <Leaf className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-green-900 mb-4">Environmental Benefits</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-green-800">Landfill Waste Prevented</span>
              <span className="font-bold text-green-900">{Math.floor(devicesRecycled * 2.5)}kg</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-800">Raw Materials Saved</span>
              <span className="font-bold text-green-900">{Math.floor(devicesRecycled * 15)}kg</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-800">Water Conservation</span>
              <span className="font-bold text-green-900">{Math.floor(devicesRecycled * 1.2)}L</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-800">Energy Savings</span>
              <span className="font-bold text-green-900">{Math.floor(devicesRecycled * 45)}kWh</span>
            </div>
          </div>
          <p className="text-sm text-green-700 mt-4">
            Your e-waste donations have prevented significant environmental damage while conserving precious natural resources.
          </p>
        </div>

        {/* Social Impact */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-8 border border-blue-200">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-blue-900 mb-4">Social Impact</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-blue-800">Individuals Trained</span>
              <span className="font-bold text-blue-900">{Math.floor(devicesRecycled * 0.3)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-800">Devices Redistributed</span>
              <span className="font-bold text-blue-900">{Math.floor(devicesRecycled * 0.7)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-800">Training Hours Delivered</span>
              <span className="font-bold text-blue-900">{Math.floor(devicesRecycled * 2.4)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-800">Communities Supported</span>
              <span className="font-bold text-blue-900">{Math.ceil(devicesRecycled / 50)}</span>
            </div>
          </div>
          <p className="text-sm text-blue-700 mt-4">
            Your partnership has bridged the digital divide, providing opportunities for skills development and employment.
          </p>
        </div>
      </div>

      {/* Certification & Recognition */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Award className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Certifications & Achievements</h2>
            <p className="text-gray-600">Your verified impact contributions</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg p-4 border border-green-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700 mb-2">Carbon Neutral</div>
              <div className="text-sm text-green-600 mb-3">2024 Verified Status</div>
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <Leaf className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg p-4 border border-blue-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700 mb-2">Digital Champion</div>
              <div className="text-sm text-blue-600 mb-3">Community Impact Award</div>
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg p-4 border border-purple-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-700 mb-2">Sustainability Leader</div>
              <div className="text-sm text-purple-600 mb-3">ESG Excellence Recognition</div>
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpactViewer;