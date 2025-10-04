/**
 * ConversationalDataEntry - Smart Data Entry Component (Phase 1 MVP)
 * Real AI integration with context-aware conversational extraction
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  Send,
  Mic,
  MicOff,
  Brain,
  Loader2,
  AlertCircle,
  CheckCircle,
  Paperclip,
  X,
  FileText,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { carbonService } from '../services/carbonService';
import {
  conversationalAIService,
  type ExtractedData,
  type ConversationalExtractionResponse,
} from '../services/conversationalAIService';
import {
  documentService,
  type UploadDocumentResponse,
} from '../services/documentService';
import LiveFootprintPreview from './LiveFootprintPreview';
import DocumentUploadZone from './DocumentUploadZone';

interface ConversationalMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'document';
  content: string;
  timestamp: Date;
  extractedData?: ExtractedData | null;
  confidenceScore?: number;
  documentId?: string;
  documentName?: string;
  documentType?: string;
}

interface PendingChange {
  field: 'scope1_emissions' | 'scope2_emissions' | 'scope3_emissions';
  operation: 'add' | 'set' | 'subtract';
  value: number;
  confidence: number;
  activity_type?: string;
  messageId?: string;
}

interface ConversationalDataEntryProps {
  onDataExtracted?: (data: any) => void;
}

const ConversationalDataEntry: React.FC<ConversationalDataEntryProps> = ({
  onDataExtracted,
}) => {
  const { user } = useAuth();

  // State
  const [messages, setMessages] = useState<ConversationalMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hi! I'm your AI assistant for carbon data entry. You can describe your emissions in natural language, and I'll help structure the data. Try saying something like "We used 5000 kWh of electricity last month" or "Our delivery trucks traveled 10,000 miles this quarter".`,
      timestamp: new Date(),
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentFootprintId, setCurrentFootprintId] = useState<string | null>(null);
  const [currentFootprint, setCurrentFootprint] = useState<any>(null);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognition = useRef<any>(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition =
        (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
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

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load or create carbon footprint on mount
  useEffect(() => {
    const loadFootprint = async () => {
      if (!user) return;

      try {
        // Get user's most recent footprint or create new one
        const footprints = await carbonService.getFootprints();
        const footprintsArray = Array.isArray(footprints) ? footprints : [];
        
        if (footprintsArray.length > 0) {
          // Use most recent
          const latest = footprintsArray[0];
          if (latest.id) {
            setCurrentFootprintId(latest.id);
            // Safe number conversion with fallback to 0
            setCurrentFootprint({
              scope1_emissions: Number(latest.scope1_emissions) || 0,
              scope2_emissions: Number(latest.scope2_emissions) || 0,
              scope3_emissions: Number(latest.scope3_emissions) || 0,
              total_emissions: Number(latest.total_emissions) || 0,
            });
          }
        } else {
          // Try localStorage fallback before creating new
          const savedFootprint = localStorage.getItem('carbonFootprint');
          if (savedFootprint) {
            try {
              const parsed = JSON.parse(savedFootprint);
              setCurrentFootprintId(parsed.id || 'local-1');
              setCurrentFootprint({
                scope1_emissions: Number(parsed.scope1 || parsed.scope1_emissions) || 0,
                scope2_emissions: Number(parsed.scope2 || parsed.scope2_emissions) || 0,
                scope3_emissions: Number(parsed.scope3 || parsed.scope3_emissions) || 0,
                total_emissions: Number(parsed.total || parsed.total_emissions) || 0,
              });
              return;
            } catch (parseError) {
              console.error('Error parsing localStorage footprint:', parseError);
            }
          }
          
          // Create a new draft footprint if no localStorage data
          const newFootprint = await carbonService.createFootprint({
            reporting_period: new Date().getFullYear().toString(),
            scope1_emissions: 0,
            scope2_emissions: 0,
            scope3_emissions: 0,
            status: 'draft',
          });
          if (newFootprint.id) {
            setCurrentFootprintId(newFootprint.id);
            setCurrentFootprint({
              scope1_emissions: 0,
              scope2_emissions: 0,
              scope3_emissions: 0,
              total_emissions: 0,
            });
          }
        }
      } catch (error) {
        console.error('Failed to load footprint:', error);
        // Try localStorage fallback on error
        const savedFootprint = localStorage.getItem('carbonFootprint');
        if (savedFootprint) {
          try {
            const parsed = JSON.parse(savedFootprint);
            setCurrentFootprintId(parsed.id || 'local-1');
            setCurrentFootprint({
              scope1_emissions: Number(parsed.scope1 || parsed.scope1_emissions) || 0,
              scope2_emissions: Number(parsed.scope2 || parsed.scope2_emissions) || 0,
              scope3_emissions: Number(parsed.scope3 || parsed.scope3_emissions) || 0,
              total_emissions: Number(parsed.total || parsed.total_emissions) || 0,
            });
            setError('Using local data. Changes will sync when connected.');
          } catch (parseError) {
            console.error('Error parsing localStorage footprint:', parseError);
            // Still allow usage with a default footprint
            setCurrentFootprintId('temp-' + Date.now());
            setCurrentFootprint({
              scope1_emissions: 0,
              scope2_emissions: 0,
              scope3_emissions: 0,
              total_emissions: 0,
            });
            setError('Using temporary footprint. Data will be saved when you log in.');
          }
        } else {
          // No localStorage, use temp
          setCurrentFootprintId('temp-' + Date.now());
          setCurrentFootprint({
            scope1_emissions: 0,
            scope2_emissions: 0,
            scope3_emissions: 0,
            total_emissions: 0,
          });
          setError('Using temporary footprint. Data will be saved when you log in.');
        }
      }
    };

    loadFootprint();
  }, [user]);

  // Set auth token when user changes
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      conversationalAIService.setAccessToken(token);
    }
  }, [user]);

  // Handle sending message
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing || !currentFootprintId) return;

    const userMessage: ConversationalMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsProcessing(true);
    setError(null);

    try {
      // Build conversation history (last 10 messages)
      const conversationHistory = messages
        .filter((msg) => msg.role !== 'document')  // Filter out document messages
        .slice(-10)
        .map((msg) => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
        }));

      // Call AI extraction API
      const result: ConversationalExtractionResponse =
        await conversationalAIService.extractFromConversation(
          currentInput,
          conversationHistory,
          currentFootprintId,
          sessionId || undefined
        );

      // Update session ID if this is first message
      if (!sessionId && result.session_id) {
        setSessionId(result.session_id);
      }

      // Add AI response message
      const aiMessage: ConversationalMessage = {
        id: result.message_id || (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.ai_response,
        timestamp: new Date(),
        extractedData: result.extracted_data,
        confidenceScore: result.extracted_data?.confidence,
      };

      setMessages((prev) => [...prev, aiMessage]);

      // If data was extracted, add to pending changes
      if (result.extracted_data && result.suggested_actions && result.suggested_actions.length > 0) {
        const newChanges: PendingChange[] = result.suggested_actions
          .filter((action) => action.type === 'update_footprint')
          .map((action) => ({
            field: action.field,
            operation: action.operation,
            value: action.value,
            confidence: result.extracted_data!.confidence,
            activity_type: result.extracted_data!.activity_type,
            messageId: result.message_id,
          }));

        setPendingChanges((prev) => [...prev, ...newChanges]);

        // Notify parent if callback provided
        if (onDataExtracted) {
          onDataExtracted(result.extracted_data);
        }
      }

      // Show clarifying questions if any
      if (result.clarifying_questions && result.clarifying_questions.length > 0) {
        const questionsMessage: ConversationalMessage = {
          id: (Date.now() + 2).toString(),
          role: 'system',
          content: '❓ ' + result.clarifying_questions.join('\n'),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, questionsMessage]);
      }

      // Show warnings if validation has issues
      if (result.validation?.status === 'warning' && result.validation.warnings.length > 0) {
        const warningMessage: ConversationalMessage = {
          id: (Date.now() + 3).toString(),
          role: 'system',
          content: '⚠️ ' + result.validation.warnings.join('\n'),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, warningMessage]);
      }
    } catch (error) {
      console.error('Error processing conversational input:', error);
      
      const errorMessage: ConversationalMessage = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: `❌ Sorry, I had trouble processing that. ${
          error instanceof Error ? error.message : 'Please try again.'
        }`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setError(error instanceof Error ? error.message : 'Processing error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle accepting a pending change
  const handleAcceptChange = async (change: PendingChange) => {
    if (!currentFootprintId) return;

    try {
      // Build update data
      const updateData = {
        [change.field]: {
          operation: change.operation,
          value: change.value,
          source: 'conversational_extraction',
          confidence: change.confidence,
          metadata: {
            activity_type: change.activity_type,
          },
        },
      };

      // Update footprint
      const result = await conversationalAIService.updateWithContext({
        footprint_id: currentFootprintId,
        update_data: updateData,
        conversation_message_id: change.messageId,
        user_confirmed: true,
      });

      // Update local footprint state
      if (result.updated_footprint) {
        setCurrentFootprint({
          scope1_emissions: result.updated_footprint.scope1_emissions,
          scope2_emissions: result.updated_footprint.scope2_emissions,
          scope3_emissions: result.updated_footprint.scope3_emissions,
          total_emissions: result.updated_footprint.total_emissions,
        });
      }

      // Remove from pending changes
      setPendingChanges((prev) => prev.filter((c) => c !== change));

      // Add success message
      const successMessage: ConversationalMessage = {
        id: Date.now().toString(),
        role: 'system',
        content: `✅ Updated ${change.field.replace(/_/g, ' ')}: ${
          change.operation === 'add' ? '+' : ''
        }${change.value.toFixed(2)} tCO₂e`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, successMessage]);
    } catch (error) {
      console.error('Error accepting change:', error);
      
      const errorMessage: ConversationalMessage = {
        id: Date.now().toString(),
        role: 'system',
        content: `❌ Failed to update footprint: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  // Handle rejecting a pending change
  const handleRejectChange = (change: PendingChange) => {
    setPendingChanges((prev) => prev.filter((c) => c !== change));

    const rejectMessage: ConversationalMessage = {
      id: Date.now().toString(),
      role: 'system',
      content: `❌ Rejected change to ${change.field.replace(/_/g, ' ')}`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, rejectMessage]);
  };

  // Handle document upload
  const handleDocumentUploadComplete = async (response: UploadDocumentResponse) => {
    setShowDocumentUpload(false);

    // Add document message to conversation
    const documentMessage: ConversationalMessage = {
      id: response.document_id,
      role: 'document',
      content: `📄 Uploaded document: ${response.file_name} (${response.file_size_display})`,
      timestamp: new Date(),
      documentId: response.document_id,
      documentName: response.file_name,
      documentType: response.document_type,
    };
    setMessages((prev) => [...prev, documentMessage]);

    // Fetch full document details including extracted data
    try {
      const fullDoc = await documentService.getDocument(response.document_id);
      
      // Show extraction status
      const statusMessage: ConversationalMessage = {
        id: `${response.document_id}-status`,
        role: 'assistant',
        content: `Document extraction ${fullDoc.extraction_status}. ${
          fullDoc.extracted_data ? 'I found some information in your document!' : 'Processing...'
        }`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, statusMessage]);

      // Show prompt to validate document
      if (fullDoc.extraction_status === 'completed') {
        const promptMessage: ConversationalMessage = {
          id: `${response.document_id}-prompt`,
          role: 'assistant',
          content: `Would you like me to help you validate and apply this data to your footprint? You can say "validate the document" or "apply the document data".`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, promptMessage]);
      }
    } catch (err) {
      console.error('Error fetching document details:', err);
    }
  };

  const handleDocumentUploadError = (error: string) => {
    const errorMessage: ConversationalMessage = {
      id: Date.now().toString(),
      role: 'system',
      content: `❌ Document upload failed: ${error}`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, errorMessage]);
  };

  // Handle voice input
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

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Left: Conversation Panel */}
      <div className="flex flex-col h-full max-h-[800px]">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-t-2xl p-6 text-white">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6" />
            <h2 className="text-xl font-bold">Smart Data Entry</h2>
            <MessageCircle className="w-5 h-5 opacity-75" />
          </div>
          <p className="text-green-100 mt-2 text-sm">
            Describe your emissions naturally - I'll extract and validate the data
          </p>
          {sessionId && (
            <div className="mt-2 text-xs text-green-100 opacity-75">
              Session: {sessionId.slice(0, 8)}...
            </div>
          )}
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-xs text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Messages */}
        <div
          className="flex-1 bg-white p-6 space-y-4 overflow-y-auto"
          style={{ maxHeight: 'calc(100% - 200px)' }}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : message.role === 'system'
                    ? 'bg-yellow-50 text-yellow-900 border border-yellow-200'
                    : message.role === 'document'
                    ? 'bg-purple-50 text-purple-900 border border-purple-200'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                {/* Document Info */}
                {message.role === 'document' && message.documentType && (
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <FileText className="w-4 h-4" />
                    <span className="font-medium">
                      {message.documentType.replace(/_/g, ' ')}
                    </span>
                  </div>
                )}

                {/* Extracted Data Preview */}
                {message.extractedData && (
                  <div className="mt-3 p-3 bg-white bg-opacity-90 rounded border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-semibold text-gray-700">Extracted Data</span>
                    </div>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div>
                        <strong>Activity:</strong> {message.extractedData.activity_type}
                      </div>
                      <div>
                        <strong>Scope {message.extractedData.scope}:</strong>{' '}
                        {message.extractedData.quantity} {message.extractedData.unit}
                      </div>
                      <div>
                        <strong>Emissions:</strong> {message.extractedData.calculated_emissions.toFixed(2)}{' '}
                        tCO₂e
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            message.confidenceScore && message.confidenceScore >= 0.9
                              ? 'bg-green-100 text-green-700'
                              : message.confidenceScore && message.confidenceScore >= 0.7
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {message.confidenceScore
                            ? `${(message.confidenceScore * 100).toFixed(0)}% confident`
                            : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-xs opacity-75 mt-2">{message.timestamp.toLocaleTimeString()}</p>
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 px-4 py-3 rounded-lg flex items-center gap-2">
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
            {/* Document Upload Button */}
            <button
              onClick={() => setShowDocumentUpload(true)}
              disabled={isProcessing || !currentFootprintId}
              className="p-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              title="Upload document"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            
            <div className="flex-1 relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe your emissions or upload a document..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                disabled={isProcessing || !currentFootprintId}
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
              disabled={!inputValue.trim() || isProcessing || !currentFootprintId}
              className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Document Upload Modal */}
        {showDocumentUpload && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  Upload Document
                </h3>
                <button
                  onClick={() => setShowDocumentUpload(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Upload utility bills, invoices, meter readings, or other documents containing emissions data.
                AI will automatically extract relevant information.
              </p>

              <DocumentUploadZone
                onUploadComplete={handleDocumentUploadComplete}
                onUploadError={handleDocumentUploadError}
                conversationSessionId={sessionId || undefined}
                footprintId={currentFootprintId || undefined}
              />
            </div>
          </div>
        )}
      </div>

      {/* Right: Live Footprint Preview */}
      <div className="flex flex-col h-full max-h-[800px] overflow-y-auto">
        {currentFootprint ? (
          <LiveFootprintPreview
            currentFootprint={currentFootprint}
            pendingChanges={pendingChanges}
            onAcceptChange={handleAcceptChange}
            onRejectChange={handleRejectChange}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-50 rounded-2xl">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Loading footprint data...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationalDataEntry;
