import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  Mic, 
  MicOff, 
  Brain, 
  CheckCircle,
  Loader2,
  Calculator,
  Save,
  AlertCircle
} from 'lucide-react';
import { carbonService } from '../services/carbonService';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  suggestedFields?: Array<{
    field: string;
    value: any;
    unit?: string;
    confidence: number;
  }>;
}

interface ConversationalDataEntryProps {
  onDataExtracted?: (data: any) => void;
}

const ConversationalDataEntry: React.FC<ConversationalDataEntryProps> = ({ 
  onDataExtracted
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: `Hi! I'm your AI assistant for carbon data entry. You can describe your emissions in natural language, and I'll help structure the data. Try saying something like "We used 5000 kWh of electricity last month" or "Our delivery trucks traveled 10,000 miles this quarter".`,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognition = useRef<any>(null);

  useEffect(() => {
    // Initialize speech recognition if available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'en-US';

      recognition.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };

      recognition.current.onerror = () => {
        setIsListening(false);
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const processConversationalInput = async (userInput: string) => {
    setIsProcessing(true);
    
    try {
      // Mock AI processing - in real app this would call the backend
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      // Mock response based on input content
      let aiResponse = '';
      let suggestedFields: any[] = [];

      if (userInput.toLowerCase().includes('electricity') || userInput.toLowerCase().includes('kwh')) {
        const kwhMatch = userInput.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*kwh/i);
        if (kwhMatch) {
          const kwhValue = parseFloat(kwhMatch[1].replace(/,/g, ''));
          suggestedFields = [
            {
              field: 'electricity_consumption',
              value: kwhValue,
              unit: 'kWh',
              confidence: 95
            },
            {
              field: 'scope2_emissions',
              value: (kwhValue * 0.4532).toFixed(2), // Mock emission factor
              unit: 'tCO2e',
              confidence: 90
            }
          ];
          aiResponse = `Great! I detected electricity consumption of ${kwhValue.toLocaleString()} kWh. Based on the average grid emission factor, this equals approximately ${(kwhValue * 0.4532 / 1000).toFixed(2)} tCO₂e in Scope 2 emissions. Would you like to specify the grid region for more accurate factors?`;
        }
      } else if (userInput.toLowerCase().includes('fuel') || userInput.toLowerCase().includes('gas')) {
        const gallonMatch = userInput.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*gallon/i);
        const literMatch = userInput.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*liter/i);
        
        if (gallonMatch || literMatch) {
          const value = gallonMatch ? parseFloat(gallonMatch[1].replace(/,/g, '')) : parseFloat(literMatch![1].replace(/,/g, ''));
          const unit = gallonMatch ? 'gallons' : 'liters';
          const emissionFactor = gallonMatch ? 8.89 : 2.35; // kg CO2/gallon vs kg CO2/liter
          
          suggestedFields = [
            {
              field: 'fuel_consumption',
              value: value,
              unit: unit,
              confidence: 95
            },
            {
              field: 'scope1_emissions',
              value: (value * emissionFactor / 1000).toFixed(2),
              unit: 'tCO2e',
              confidence: 90
            }
          ];
          aiResponse = `I detected fuel consumption of ${value.toLocaleString()} ${unit}. This generates approximately ${(value * emissionFactor / 1000).toFixed(2)} tCO₂e in Scope 1 emissions. What type of fuel was this?`;
        }
      } else if (userInput.toLowerCase().includes('travel') || userInput.toLowerCase().includes('miles') || userInput.toLowerCase().includes('km')) {
        const milesMatch = userInput.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*miles/i);
        const kmMatch = userInput.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*km/i);
        
        if (milesMatch || kmMatch) {
          const value = milesMatch ? parseFloat(milesMatch[1].replace(/,/g, '')) : parseFloat(kmMatch![1].replace(/,/g, ''));
          const unit = milesMatch ? 'miles' : 'km';
          const emissionFactor = milesMatch ? 0.404 : 0.251; // kg CO2/mile vs kg CO2/km for average car
          
          suggestedFields = [
            {
              field: 'business_travel',
              value: value,
              unit: unit,
              confidence: 85
            },
            {
              field: 'scope3_emissions',
              value: (value * emissionFactor / 1000).toFixed(2),
              unit: 'tCO2e',
              confidence: 80
            }
          ];
          aiResponse = `I detected business travel of ${value.toLocaleString()} ${unit}. Assuming average vehicle emissions, this is approximately ${(value * emissionFactor / 1000).toFixed(2)} tCO₂e in Scope 3 emissions. Was this by car, plane, or other transport?`;
        }
      } else {
        aiResponse = `I received your input: "${userInput}". Could you provide more specific details about quantities, units, or activities? For example, mention kWh for electricity, gallons/liters for fuel, or miles/km for travel.`;
      }

      return { response: aiResponse, fields: suggestedFields };
    } catch (error) {
      console.error('Error processing conversational input:', error);
      return { 
        response: 'Sorry, I had trouble processing that input. Could you try rephrasing it?', 
        fields: [] 
      };
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');

    // Process the input with AI
    const result = await processConversationalInput(currentInput);

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: result.response,
      timestamp: new Date(),
      suggestedFields: result.fields
    };

    setMessages(prev => [...prev, aiMessage]);

    // Update extracted data
    if (result.fields.length > 0) {
      const newData = { ...extractedData };
      result.fields.forEach(field => {
        newData[field.field] = {
          value: field.value,
          unit: field.unit,
          confidence: field.confidence,
          timestamp: new Date()
        };
      });
      setExtractedData(newData);
      onDataExtracted?.(newData);
    }
  };

  const handleVoiceInput = () => {
    if (!recognition.current) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognition.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognition.current.start();
    }
  };

  const acceptSuggestedField = (_messageId: string, field: any) => {
    const newData = { ...extractedData };
    newData[field.field] = {
      value: field.value,
      unit: field.unit,
      confidence: field.confidence,
      accepted: true,
      timestamp: new Date()
    };
    setExtractedData(newData);
    onDataExtracted?.(newData);

    // Add system message
    const systemMessage: Message = {
      id: Date.now().toString(),
      type: 'system',
      content: `✓ Added ${field.field}: ${field.value} ${field.unit || ''}`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSaveToFootprint = async () => {
    if (!user) {
      setSaveError('Please log in to save your data');
      return;
    }

    if (Object.keys(extractedData).length === 0) {
      setSaveError('No data to save. Please extract some emissions data first.');
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      // Calculate emissions from extracted data
      const scope1 = Number(extractedData.scope1_emissions?.value || 0);
      const scope2 = Number(extractedData.scope2_emissions?.value || 0);
      const scope3 = Number(extractedData.scope3_emissions?.value || 0);

      console.log('Saving footprint with data:', { scope1, scope2, scope3 });

      // Validate that we have at least some emissions
      if (scope1 === 0 && scope2 === 0 && scope3 === 0) {
        throw new Error('Please extract emission values before saving. All scopes are zero.');
      }

      // Create footprint
      await carbonService.createFootprint({
        reporting_period: new Date().getFullYear().toString(),
        scope1_emissions: scope1,
        scope2_emissions: scope2,
        scope3_emissions: scope3,
        status: 'draft'
      });

      setSaveSuccess(true);
      
      // Add success message
      const systemMessage: Message = {
        id: Date.now().toString(),
        type: 'system',
        content: `✅ Data saved successfully! Your carbon footprint has been created.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, systemMessage]);

      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save footprint:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save data');
      
      // Add error message
      const systemMessage: Message = {
        id: Date.now().toString(),
        type: 'system',
        content: `❌ Failed to save data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, systemMessage]);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-t-2xl p-6 text-white">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6" />
          <h2 className="text-xl font-bold">AI-Powered Data Entry</h2>
          <MessageCircle className="w-5 h-5 opacity-75" />
        </div>
        <p className="text-green-100 mt-2">
          Describe your emissions naturally - I'll extract the structured data
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 bg-white p-6 space-y-4 overflow-y-auto" style={{ maxHeight: '400px' }}>
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              message.type === 'user' 
                ? 'bg-blue-600 text-white' 
                : message.type === 'system'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-gray-100 text-gray-800'
            }`}>
              <p className="text-sm">{message.content}</p>
              
              {/* Suggested Fields */}
              {message.suggestedFields && message.suggestedFields.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-medium text-gray-600">Extracted data:</p>
                  {message.suggestedFields.map((field, index) => (
                    <div key={index} className="bg-blue-50 rounded p-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {field.field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        <span className="text-blue-600">{field.confidence}% confident</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span>{field.value} {field.unit}</span>
                        <button
                          onClick={() => acceptSuggestedField(message.id, field)}
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Accept
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <p className="text-xs opacity-75 mt-2">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">AI is processing...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-gray-50 p-4 rounded-b-2xl border-t border-gray-200">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your emissions... (e.g., 'We used 5000 kWh of electricity')"
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              disabled={isProcessing}
            />
            <button
              onClick={handleVoiceInput}
              className={`absolute right-2 top-2 p-1 rounded-full transition-colors ${
                isListening 
                  ? 'bg-red-100 text-red-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isProcessing}
            className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Extracted Data Summary */}
      {Object.keys(extractedData).length > 0 && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-green-600" />
              <h3 className="font-medium text-green-800">Extracted Data Summary</h3>
            </div>
            <button
              onClick={handleSaveToFootprint}
              disabled={isSaving}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save to Footprint
                </>
              )}
            </button>
          </div>

          {saveSuccess && (
            <div className="mb-3 bg-green-100 border border-green-300 rounded-lg p-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-800 text-sm font-medium">Data saved successfully!</p>
            </div>
          )}

          {saveError && (
            <div className="mb-3 bg-red-100 border border-red-300 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800 text-sm">{saveError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(extractedData).map(([key, data]: [string, any]) => (
              <div key={key} className="bg-white rounded p-3 border border-green-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  {data.accepted && <CheckCircle className="w-4 h-4 text-green-600" />}
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {data.value} {data.unit}
                </div>
                <div className="text-xs text-gray-500">
                  {data.confidence}% confidence
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationalDataEntry;
