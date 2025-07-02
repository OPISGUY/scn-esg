import React, { useState } from 'react';
import { Plus, Recycle, Calendar, Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { mockEwasteEntries } from '../data/mockData';
import { calculateEwasteCO2Savings } from '../utils/calculations';

const EwasteTracker: React.FC = () => {
  const [entries, setEntries] = useState(mockEwasteEntries);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEntry, setNewEntry] = useState({
    deviceType: '',
    quantity: 0,
    weight: 0,
    donationDate: new Date().toISOString().split('T')[0]
  });

  const deviceTypes = [
    'Laptops', 'Desktop Computers', 'Mobile Phones', 'Tablets', 
    'Monitors', 'Printers', 'Servers', 'Networking Equipment'
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'collected':
        return <Truck className="w-5 h-5 text-blue-500" />;
      case 'processed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'collected':
        return 'bg-blue-100 text-blue-800';
      case 'processed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddEntry = () => {
    if (newEntry.deviceType && newEntry.quantity > 0) {
      const estimatedCO2 = calculateEwasteCO2Savings(newEntry.deviceType, newEntry.quantity) * 1000; // Convert to kg
      const entry = {
        id: (entries.length + 1).toString(),
        ...newEntry,
        estimatedCO2Saved: estimatedCO2,
        status: 'pending' as const
      };
      
      setEntries([entry, ...entries]);
      setNewEntry({
        deviceType: '',
        quantity: 0,
        weight: 0,
        donationDate: new Date().toISOString().split('T')[0]
      });
      setShowAddForm(false);
    }
  };

  const totalDevices = entries.reduce((sum, entry) => sum + entry.quantity, 0);
  const totalWeight = entries.reduce((sum, entry) => sum + entry.weight, 0);
  const totalCO2Saved = entries.reduce((sum, entry) => sum + entry.estimatedCO2Saved, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-700 rounded-2xl p-8 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-4">E-waste Tracker</h1>
            <p className="text-lg text-blue-100 mb-4">
              Track your device donations to SCN and see the environmental impact
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Log Donation</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-blue-600">{totalDevices}</span>
          </div>
          <h3 className="font-semibold text-gray-900">Total Devices</h3>
          <p className="text-sm text-gray-600">Donated to SCN</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Recycle className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-purple-600">{totalWeight}kg</span>
          </div>
          <h3 className="font-semibold text-gray-900">Total Weight</h3>
          <p className="text-sm text-gray-600">E-waste processed</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-green-600">{(totalCO2Saved / 1000).toFixed(1)}t</span>
          </div>
          <h3 className="font-semibold text-gray-900">CO₂ Saved</h3>
          <p className="text-sm text-gray-600">Environmental impact</p>
        </div>
      </div>

      {/* Add Entry Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Log New E-waste Donation</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Device Type
                </label>
                <select
                  value={newEntry.deviceType}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, deviceType: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select device type</option>
                  {deviceTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={newEntry.quantity}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={newEntry.weight}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, weight: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Donation Date
                </label>
                <input
                  type="date"
                  value={newEntry.donationDate}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, donationDate: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEntry}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
              >
                Add Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Entries List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Donation History</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {entries.map((entry) => (
            <div key={entry.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{entry.deviceType}</h3>
                    <p className="text-sm text-gray-600">
                      {entry.quantity} devices • {entry.weight}kg • {(entry.estimatedCO2Saved / 1000).toFixed(1)}t CO₂ saved
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(entry.donationDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(entry.status)}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}>
                      {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Impact Summary */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-8 border border-green-200">
        <div className="max-w-3xl">
          <h2 className="text-xl font-bold text-green-900 mb-4">Your Environmental Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{totalDevices}</div>
              <div className="text-sm font-medium text-green-800">Devices Recycled</div>
              <div className="text-xs text-green-600">Prevented from landfill</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{(totalCO2Saved / 1000).toFixed(1)}t</div>
              <div className="text-sm font-medium text-green-800">CO₂ Emissions Avoided</div>
              <div className="text-xs text-green-600">Through proper recycling</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{Math.floor(totalCO2Saved / 365)}</div>
              <div className="text-sm font-medium text-green-800">Days of Car Emissions</div>
              <div className="text-xs text-green-600">Equivalent offset</div>
            </div>
          </div>
          <p className="text-green-800">
            Your partnership with SCN has prevented {totalDevices} devices from ending up in landfills, 
            avoiding {(totalCO2Saved / 1000).toFixed(1)} tonnes of CO₂ emissions while supporting digital inclusion initiatives in UK communities.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EwasteTracker;