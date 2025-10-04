import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Calculator, 
  Check, 
  AlertCircle, 
  Star,
  Clock,
  Shield
} from 'lucide-react';
import { calculateCarbonBalance } from '../data/mockData';
import { 
  OFFSET_MARKETPLACE, 
  OFFSET_PRESETS, 
  calculateOffsetRecommendations,
  SEQUOIA_TONNES,
  CARBON_CREDITS
} from '../data/offsetMarketplace';
import { CarbonOffset, OffsetRecommendation } from '../types';

const CarbonOffsets: React.FC = () => {
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [carbonBalance, setCarbonBalance] = useState(calculateCarbonBalance());
  const [activeTab, setActiveTab] = useState<'auto' | 'browse' | 'sequoia'>('auto');
  const [customTonnes, setCustomTonnes] = useState('');
  const [recommendations, setRecommendations] = useState<OffsetRecommendation[]>([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState<OffsetRecommendation | null>(null);

  // Update carbon balance when cart changes
  useEffect(() => {
    setCarbonBalance(calculateCarbonBalance());
  }, [cart]);

  // Auto-calculate recommendations for remaining emissions
  useEffect(() => {
    const emissions = carbonBalance.netEmissions || 0;
    // Only show recommendations if we have positive, finite emissions
    if (emissions > 0 && isFinite(emissions)) {
      setRecommendations(calculateOffsetRecommendations(emissions));
    } else {
      // Default recommendation for 0 or invalid emissions
      setRecommendations([]);
    }
  }, [carbonBalance]);

  const addToCart = (offsetId: string, quantity: number = 1) => {
    setCart(prev => ({
      ...prev,
      [offsetId]: (prev[offsetId] || 0) + quantity
    }));
  };

  const removeFromCart = (offsetId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      delete newCart[offsetId];
      return newCart;
    });
  };

  const setCartQuantity = (offsetId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(offsetId);
    } else {
      setCart(prev => ({
        ...prev,
        [offsetId]: quantity
      }));
    }
  };

  const getTotalCO2Offset = () => {
    return Object.entries(cart).reduce((total, [id, quantity]) => {
      const offset = OFFSET_MARKETPLACE.find(o => o.id === id);
      return total + (offset ? offset.co2Offset * quantity : 0);
    }, 0);
  };

  const getTotalPrice = () => {
    return Object.entries(cart).reduce((total, [id, quantity]) => {
      const offset = OFFSET_MARKETPLACE.find(o => o.id === id);
      return total + (offset ? offset.price * quantity : 0);
    }, 0);
  };

  const autoOffsetFromRecommendation = (recommendation: OffsetRecommendation) => {
    const emissions = parseFloat(customTonnes) || carbonBalance.netEmissions;
    const newCart: { [key: string]: number } = {};
    
    recommendation.credits.forEach(({ credit, percentage }) => {
      const quantity = Math.ceil((emissions * percentage / 100) * credit.co2Offset);
      if (quantity > 0) {
        newCart[credit.id] = quantity;
      }
    });
    
    setCart(newCart);
    setSelectedRecommendation(recommendation);
    setActiveTab('browse');
  };

  const autoOffsetByAmount = (tonnes: number) => {
    setCustomTonnes(tonnes.toString());
    const recs = calculateOffsetRecommendations(tonnes);
    setRecommendations(recs);
  };

  const completePurchase = () => {
    // Save purchase to localStorage for real-time updates
    const purchase = {
      id: Date.now().toString(),
      items: Object.entries(cart).map(([id, quantity]) => {
        const offset = OFFSET_MARKETPLACE.find(o => o.id === id);
        return {
          id,
          name: offset?.name || '',
          quantity,
          price: offset?.price || 0,
          co2Offset: (offset?.co2Offset || 0) * quantity
        };
      }),
      totalCO2: getTotalCO2Offset(),
      totalCost: getTotalPrice(),
      date: new Date().toISOString()
    };

    // Store in localStorage for persistence
    const existingPurchases = JSON.parse(localStorage.getItem('offsetPurchases') || '[]');
    existingPurchases.push(purchase);
    localStorage.setItem('offsetPurchases', JSON.stringify(existingPurchases));

    // Trigger storage event for real-time updates across components
    window.dispatchEvent(new Event('storage'));

    // Reset cart and show success
    setCart({});
    alert(`Successfully purchased ${getTotalCO2Offset()} tonnes of carbon offsets for £${getTotalPrice().toLocaleString()}!`);
  };

  const OffsetCard: React.FC<{ offset: CarbonOffset }> = ({ offset }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
      <div className="relative">
        <img 
          src={offset.image} 
          alt={offset.name}
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
        {offset.permanence === 'eternal' && (
          <div className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold">
            ♾️ ETERNAL
          </div>
        )}
        {offset.permanence === 'millennial' && (
          <div className="absolute top-2 right-2 bg-indigo-600 text-white px-2 py-1 rounded-full text-xs font-bold">
            ⭐ 500Y
          </div>
        )}
        {offset.verification && (
          <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Verified
          </div>
        )}
      </div>

      <div className="mb-4">
        <h3 className="font-bold text-gray-900 mb-2">{offset.name}</h3>
        <p className="text-sm text-gray-600 mb-3">{offset.description}</p>
        
        {offset.features && (
          <div className="flex flex-wrap gap-1 mb-3">
            {offset.features.slice(0, 3).map((feature, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {feature}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-2xl font-bold text-green-600">£{offset.price.toLocaleString()}</span>
            <span className="text-sm text-gray-500">/tonne</span>
          </div>
          {offset.sequestrationPeriod && (
            <div className="text-right">
              <div className="text-sm font-medium text-purple-600 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {offset.sequestrationPeriod} years
              </div>
              <div className="text-xs text-gray-500">Storage guarantee</div>
            </div>
          )}
        </div>

        <div className="text-sm text-gray-600 mb-4">
          <div className="flex items-center justify-between">
            <span>Available:</span>
            <span className="font-medium">{offset.available} tonnes</span>
          </div>
          {offset.verification && (
            <div className="flex items-center justify-between mt-1">
              <span>Verified by:</span>
              <span className="font-medium text-green-600">{offset.verification}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center border border-gray-300 rounded-lg">
          <button
            onClick={() => setCartQuantity(offset.id, Math.max(0, (cart[offset.id] || 0) - 1))}
            className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-l-lg"
          >
            -
          </button>
          <span className="px-4 py-2 bg-gray-50 min-w-[60px] text-center">
            {cart[offset.id] || 0}
          </span>
          <button
            onClick={() => addToCart(offset.id, 1)}
            className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-r-lg"
          >
            +
          </button>
        </div>
        <button
          onClick={() => addToCart(offset.id, 1)}
          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Carbon Offset Marketplace</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Offset your remaining emissions with market-competitive carbon credits and revolutionary Sequoia Tonnes
        </p>
      </div>

      {/* Current Balance Display */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Current Net Emissions
            </h3>
            <div className="text-3xl font-bold text-orange-600">
              {carbonBalance.netEmissions.toFixed(1)} tonnes CO₂e
            </div>
            <p className="text-sm text-orange-700 mt-1">
              Remaining to offset for carbon neutrality
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-orange-900">
              Est. Cost: £{(carbonBalance.netEmissions * 25).toLocaleString()} - £{(carbonBalance.netEmissions * 45).toLocaleString()}
            </div>
            <p className="text-sm text-orange-600">Market rate: £25-45/tonne</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('auto')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
            activeTab === 'auto' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🚀 Auto Offset
        </button>
        <button
          onClick={() => setActiveTab('browse')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
            activeTab === 'browse' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🛍️ Browse Credits
        </button>
        <button
          onClick={() => setActiveTab('sequoia')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
            activeTab === 'sequoia' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🌳 Sequoia Tonnes
        </button>
      </div>

      {/* Auto Offset Tab */}
      {activeTab === 'auto' && (
        <div className="space-y-6">
          {/* Quick Offset Presets */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Offset</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {OFFSET_PRESETS.map((preset) => (
                <button
                  key={preset.tonnes}
                  onClick={() => autoOffsetByAmount(preset.tonnes)}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 text-center group"
                >
                  <div className="text-2xl font-bold text-blue-600 mb-1">{preset.label}</div>
                  <div className="text-xs text-gray-600">{preset.description}</div>
                  <div className="text-sm font-medium text-green-600 mt-2">
                    £{(preset.tonnes * 25).toLocaleString()}+
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div className="bg-blue-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Custom Amount Calculator
            </h3>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-blue-800 mb-2">
                  Tonnes of CO₂e to offset
                </label>
                <input
                  type="number"
                  value={customTonnes}
                  onChange={(e) => setCustomTonnes(e.target.value)}
                  placeholder="Enter tonnes..."
                  className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => {
                  const tonnes = parseFloat(customTonnes);
                  if (tonnes > 0) {
                    autoOffsetByAmount(tonnes);
                  }
                }}
                disabled={!customTonnes || parseFloat(customTonnes) <= 0}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Calculate
              </button>
            </div>
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Offset Recommendations</h3>
              <div className="grid gap-4">
                {recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className={`bg-white border-2 rounded-xl p-6 hover:shadow-md transition-all duration-200 cursor-pointer ${
                      selectedRecommendation?.name === rec.name ? 'border-green-500 bg-green-50' : 'border-gray-200'
                    }`}
                    onClick={() => autoOffsetFromRecommendation(rec)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">{rec.name}</h4>
                        <p className="text-sm text-gray-600">{rec.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          £{rec.totalCost.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          £{rec.averagePrice.toFixed(0)}/tonne avg
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {rec.credits.map((item, idx) => (
                        <div key={idx} className="bg-gray-100 rounded-full px-3 py-1 text-sm">
                          {item.percentage}% {item.credit.name}
                        </div>
                      ))}
                    </div>

                    <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" />
                      Select This Portfolio
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Browse Credits Tab */}
      {activeTab === 'browse' && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-6">Carbon Credits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CARBON_CREDITS.map((offset) => (
              <OffsetCard key={offset.id} offset={offset} />
            ))}
          </div>
        </div>
      )}

      {/* Sequoia Tonnes Tab */}
      {activeTab === 'sequoia' && (
        <div>
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold text-purple-900 mb-2 flex items-center gap-2">
              <Star className="w-6 h-6" />
              Sequoia Tonnes - Ultimate Permanence
            </h3>
            <p className="text-purple-700">
              Revolutionary direct air capture technology with guaranteed long-term storage. 
              The most permanent carbon offset solution available, with periods from 25 to 1000 years.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {SEQUOIA_TONNES.map((offset) => (
              <OffsetCard key={offset.id} offset={offset} />
            ))}
          </div>
        </div>
      )}

      {/* Shopping Cart */}
      {Object.keys(cart).length > 0 && (
        <div className="fixed bottom-6 right-6 bg-white rounded-xl shadow-xl border border-gray-200 p-6 max-w-md">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Your Offset Cart
          </h4>
          
          <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
            {Object.entries(cart).map(([id, quantity]) => {
              const offset = OFFSET_MARKETPLACE.find(o => o.id === id);
              if (!offset) return null;
              
              return (
                <div key={id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{offset.name}</div>
                    <div className="text-xs text-gray-500">{quantity} × £{offset.price}</div>
                  </div>
                  <button
                    onClick={() => removeFromCart(id)}
                    className="text-red-600 hover:text-red-800 ml-2"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
          
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between font-bold">
              <span>Total CO₂ Offset:</span>
              <span className="text-green-600">{getTotalCO2Offset()} tonnes</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total Cost:</span>
              <span className="text-green-600">£{getTotalPrice().toLocaleString()}</span>
            </div>
            
            <button
              onClick={completePurchase}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2 font-semibold"
            >
              <Check className="w-5 h-5" />
              Complete Purchase
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarbonOffsets;
