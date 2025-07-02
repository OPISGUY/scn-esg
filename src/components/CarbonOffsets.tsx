import React, { useState, useEffect } from 'react';
import { ShoppingCart, Leaf, Users, Zap, Check, ArrowRight, Heart, Target, AlertCircle, HelpCircle } from 'lucide-react';
import { mockCarbonOffsets, calculateCarbonBalance } from '../data/mockData';

const CarbonOffsets: React.FC = () => {
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [showCheckout, setShowCheckout] = useState(false);
  const [carbonBalance, setCarbonBalance] = useState(calculateCarbonBalance());
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  // Update carbon balance when cart changes
  useEffect(() => {
    setCarbonBalance(calculateCarbonBalance());
  }, [cart]);

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

  const getTotalCO2Offset = () => {
    return Object.entries(cart).reduce((total, [id, quantity]) => {
      const offset = mockCarbonOffsets.find(o => o.id === id);
      return total + (offset ? offset.co2Offset * quantity : 0);
    }, 0);
  };

  const getTotalPrice = () => {
    return Object.entries(cart).reduce((total, [id, quantity]) => {
      const offset = mockCarbonOffsets.find(o => o.id === id);
      return total + (offset ? offset.price * quantity : 0);
    }, 0);
  };

  const completePurchase = () => {
    // Save purchase to localStorage for real-time updates
    const purchase = {
      id: Date.now().toString(),
      items: Object.entries(cart).map(([id, quantity]) => {
        const offset = mockCarbonOffsets.find(o => o.id === id);
        return {
          offsetId: id,
          offsetName: offset?.name || '',
          quantity,
          price: offset?.price || 0,
          co2Offset: offset?.co2Offset || 0
        };
      }),
      totalCO2Offset: getTotalCO2Offset(),
      totalPrice: getTotalPrice(),
      purchaseDate: new Date().toISOString()
    };

    const existingPurchases = JSON.parse(localStorage.getItem('offsetPurchases') || '[]');
    existingPurchases.push(purchase);
    localStorage.setItem('offsetPurchases', JSON.stringify(existingPurchases));

    // Trigger storage event for real-time updates
    window.dispatchEvent(new Event('storage'));

    alert(`Purchase completed! 
    
✓ ${getTotalCO2Offset()} tonnes CO₂e offset purchased
✓ £${getTotalPrice()} invested in verified carbon credits
✓ Your carbon balance has been updated in real-time
✓ Certificates will be available in your reports section

Your net emissions have been reduced and the dashboard will reflect these changes immediately.`);
    
    setCart({});
    setShowCheckout(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Technology Recycling':
        return <Leaf className="w-5 h-5 text-green-600" />;
      case 'Carbon Sequestration':
        return <Target className="w-5 h-5 text-purple-600" />;
      case 'Social Impact':
        return <Users className="w-5 h-5 text-blue-600" />;
      case 'Energy Efficiency':
        return <Zap className="w-5 h-5 text-yellow-600" />;
      default:
        return <Heart className="w-5 h-5 text-purple-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Technology Recycling':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Carbon Sequestration':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Social Impact':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Energy Efficiency':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  };

  const carbonCreditsOffsets = mockCarbonOffsets.filter(offset => offset.category === 'reuse');
  const sequoiaOffsets = mockCarbonOffsets.filter(offset => offset.category === 'sequestration');

  return (
    <div className="space-y-8">
      {/* Header with Dynamic Recommendation */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-700 rounded-2xl p-8 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-4">Offset Your Footprint</h1>
            {carbonBalance.netEmissions > 0 ? (
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="w-6 h-6 text-orange-300" />
                  <span className="text-lg font-semibold">Action Required</span>
                </div>
                <p className="text-lg text-purple-100">
                  You have <span className="font-bold text-white">{carbonBalance.netEmissions.toFixed(1)} tCO₂e</span> left to offset. Take action below.
                </p>
                <div className="mt-2 text-sm text-purple-200">
                  Estimated cost: £{(carbonBalance.netEmissions * 30).toLocaleString()} to achieve carbon neutrality
                </div>
              </div>
            ) : (
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Check className="w-6 h-6 text-green-300" />
                  <span className="text-lg font-semibold">Carbon Neutral Achieved!</span>
                </div>
                <p className="text-lg text-purple-100">
                  Congratulations! You've achieved carbon neutrality. Consider additional offsets for positive impact.
                </p>
              </div>
            )}
            <div className="flex items-center space-x-6 text-purple-100">
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5" />
                <span>Verified Offsets</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5" />
                <span>Social Impact</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5" />
                <span>UK Certified</span>
              </div>
            </div>
          </div>
          {Object.keys(cart).length > 0 && (
            <div className="bg-white text-purple-700 px-6 py-4 rounded-xl">
              <div className="text-center">
                <div className="text-2xl font-bold">{getTotalCO2Offset()}</div>
                <div className="text-sm">tonnes CO₂e</div>
                <div className="text-lg font-semibold">£{getTotalPrice()}</div>
                <button
                  onClick={() => setShowCheckout(true)}
                  className="mt-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors duration-200"
                >
                  Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Real-time Carbon Balance Update */}
      {Object.keys(cart).length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
          <h3 className="font-semibold text-green-900 mb-3 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Impact Preview: Your Updated Carbon Balance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-600">Current Net Emissions</div>
              <div className="text-2xl font-bold text-orange-600">{carbonBalance.netEmissions.toFixed(1)}t</div>
            </div>
            <div className="flex items-center justify-center text-green-600 text-xl font-bold">-</div>
            <div>
              <div className="text-lg font-bold text-gray-600">Cart Offsets</div>
              <div className="text-2xl font-bold text-green-600">{getTotalCO2Offset()}t</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-600">New Net Emissions</div>
              <div className={`text-2xl font-bold ${(carbonBalance.netEmissions - getTotalCO2Offset()) <= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                {Math.max(carbonBalance.netEmissions - getTotalCO2Offset(), 0).toFixed(1)}t
              </div>
              {(carbonBalance.netEmissions - getTotalCO2Offset()) <= 0 && (
                <div className="text-sm text-green-600 font-medium">Carbon Neutral!</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Carbon Credits from Reuse Section */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Leaf className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Carbon Credits (from Reuse)</h2>
            <p className="text-gray-600">Verified carbon credits generated from our e-waste recycling programs</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {carbonCreditsOffsets.map((offset) => (
            <div key={offset.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
              <div className="relative">
                <img 
                  src={offset.image} 
                  alt={offset.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(offset.type)} flex items-center space-x-1`}>
                    {getTypeIcon(offset.type)}
                    <span>{offset.type}</span>
                  </div>
                </div>
                <div className="absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm px-3 py-1 rounded-lg">
                  <div className="text-sm font-bold text-gray-900">£{offset.price}</div>
                  <div className="text-xs text-gray-600">per tonne CO₂e</div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{offset.name}</h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">{offset.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium text-gray-900">{offset.available}</span> credits available
                  </div>
                  <div className="text-sm font-medium text-green-600">
                    1 tonne CO₂e offset
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 flex-1">
                    <button
                      onClick={() => {
                        const currentQuantity = cart[offset.id] || 0;
                        if (currentQuantity > 0) {
                          setCart(prev => ({
                            ...prev,
                            [offset.id]: currentQuantity - 1
                          }));
                        }
                      }}
                      disabled={!cart[offset.id]}
                      className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-medium">{cart[offset.id] || 0}</span>
                    <button
                      onClick={() => addToCart(offset.id)}
                      className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
                    >
                      +
                    </button>
                  </div>
                  
                  <button
                    onClick={() => addToCart(offset.id, 1)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sequoia Tonnes Section */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Target className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Sequoia Tonnes (from Direct Sequestration)</h2>
            <p className="text-gray-600">Premium carbon offsets from direct atmospheric CO₂ capture and permanent storage</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {sequoiaOffsets.map((offset) => (
            <div key={offset.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
              <div className="relative">
                <img 
                  src={offset.image} 
                  alt={offset.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(offset.type)} flex items-center space-x-1`}>
                    {getTypeIcon(offset.type)}
                    <span>{offset.type}</span>
                  </div>
                </div>
                <div className="absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm px-3 py-1 rounded-lg">
                  <div className="text-sm font-bold text-gray-900">£{offset.price}</div>
                  <div className="text-xs text-gray-600">per tonne CO₂e</div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{offset.name}</h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">{offset.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium text-gray-900">{offset.available}</span> credits available
                  </div>
                  <div className="text-sm font-medium text-purple-600">
                    1 tonne CO₂e offset
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 flex-1">
                    <button
                      onClick={() => {
                        const currentQuantity = cart[offset.id] || 0;
                        if (currentQuantity > 0) {
                          setCart(prev => ({
                            ...prev,
                            [offset.id]: currentQuantity - 1
                          }));
                        }
                      }}
                      disabled={!cart[offset.id]}
                      className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-medium">{cart[offset.id] || 0}</span>
                    <button
                      onClick={() => addToCart(offset.id)}
                      className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
                    >
                      +
                    </button>
                  </div>
                  
                  <button
                    onClick={() => addToCart(offset.id, 1)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors duration-200 flex items-center space-x-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why Choose SCN Offsets */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-8 border border-green-200">
        <h2 className="text-2xl font-bold text-green-900 mb-6">Why Choose SCN Carbon Offsets?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-green-900 mb-2">Verified Impact</h3>
            <p className="text-green-700 text-sm">
              All our offsets are third-party verified and certified to Gold Standard or VCS
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-green-900 mb-2">Social Co-benefits</h3>
            <p className="text-green-700 text-sm">
              Every offset purchased supports digital inclusion and community development
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-semibold text-green-900 mb-2">Local Impact</h3>
            <p className="text-green-700 text-sm">
              Supporting UK communities while addressing global climate challenges
            </p>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Complete Your Purchase</h2>
            
            <div className="space-y-4 mb-6">
              {Object.entries(cart).map(([id, quantity]) => {
                const offset = mockCarbonOffsets.find(o => o.id === id);
                if (!offset) return null;
                
                return (
                  <div key={id} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div>
                      <div className="font-medium text-gray-900">{offset.name}</div>
                      <div className="text-sm text-gray-600">{quantity} × £{offset.price}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">£{offset.price * quantity}</div>
                      <div className="text-sm text-gray-600">{quantity}t CO₂e</div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <div className="text-right">
                  <div>£{getTotalPrice()}</div>
                  <div className="text-sm font-normal text-gray-600">{getTotalCO2Offset()}t CO₂e offset</div>
                </div>
              </div>
            </div>

            {/* Impact Preview */}
            <div className="bg-green-50 rounded-lg p-4 mb-6 border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">Impact Preview</h3>
              <div className="text-sm text-green-800">
                <div>• Your net emissions will reduce to {Math.max(carbonBalance.netEmissions - getTotalCO2Offset(), 0).toFixed(1)}t CO₂e</div>
                <div>• Dashboard will update in real-time</div>
                <div>• Certificates available immediately</div>
                {(carbonBalance.netEmissions - getTotalCO2Offset()) <= 0 && (
                  <div className="font-bold text-green-700 mt-2">🎉 You will achieve carbon neutrality!</div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCheckout(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={completePurchase}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors duration-200 flex items-center space-x-2"
              >
                <span>Complete Purchase</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarbonOffsets;