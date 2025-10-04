/**
 * DocumentExtractionReview Component
 * Review and correct AI-extracted data from uploaded documents
 */

import React, { useState, useEffect } from 'react';
import {
  documentService,
  UploadedDocument,
  ValidateDocumentRequest,
} from '../services/documentService';

interface DocumentExtractionReviewProps {
  documentId: string;
  onValidateComplete?: (approved: boolean) => void;
  onApplyComplete?: (emissions: number, scope: string) => void;
  onError?: (error: string) => void;
}

export const DocumentExtractionReview: React.FC<DocumentExtractionReviewProps> = ({
  documentId,
  onValidateComplete,
  onApplyComplete,
  onError,
}) => {
  const [document, setDocument] = useState<UploadedDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [applying, setApplying] = useState(false);
  const [corrections, setCorrections] = useState<Record<string, any>>({});
  const [notes, setNotes] = useState('');
  const [editingField, setEditingField] = useState<string | null>(null);

  useEffect(() => {
    loadDocument();
  }, [documentId]);

  const loadDocument = async () => {
    try {
      setLoading(true);
      const doc = await documentService.getDocument(documentId);
      setDocument(doc);
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to load document';
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldEdit = (fieldName: string, newValue: string) => {
    setCorrections((prev) => ({
      ...prev,
      [fieldName]: newValue,
    }));
  };

  const handleApprove = async () => {
    if (!document) return;

    setValidating(true);
    try {
      const request: ValidateDocumentRequest = {
        approve: true,
        corrections: Object.keys(corrections).length > 0 ? corrections : undefined,
        notes: notes || undefined,
      };

      await documentService.validateDocument(documentId, request);
      onValidateComplete?.(true);
      
      // Reload document to get updated state
      await loadDocument();
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Validation failed';
      onError?.(error);
    } finally {
      setValidating(false);
    }
  };

  const handleReject = async () => {
    if (!document) return;

    setValidating(true);
    try {
      const request: ValidateDocumentRequest = {
        approve: false,
        corrections,
        notes: notes || 'Extraction rejected by user',
      };

      await documentService.validateDocument(documentId, request);
      onValidateComplete?.(false);
      await loadDocument();
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Rejection failed';
      onError?.(error);
    } finally {
      setValidating(false);
    }
  };

  const handleApplyToFootprint = async () => {
    if (!document || !document.user_validated) {
      onError?.('Please validate the document first');
      return;
    }

    setApplying(true);
    try {
      const response = await documentService.applyDocumentToFootprint(documentId, {
        create_conversation_message: true,
      });

      onApplyComplete?.(response.emissions_added, response.scope_updated);
      await loadDocument();
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to apply to footprint';
      onError?.(error);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="animate-spin text-4xl mb-4">⏳</div>
        <p className="text-gray-600">Loading document...</p>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800">Document not found</p>
      </div>
    );
  }

  const extractedData = document.extracted_data || {};
  const confidenceColor = documentService.getConfidenceColor(document.confidence_score || 0);
  const confidenceLabel = documentService.getConfidenceLabel(document.confidence_score || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Document Extraction Review</h2>
            <p className="text-gray-600">{document.file_name}</p>
            <p className="text-sm text-gray-500 mt-1">
              {document.file_size_display} • {document.mime_type} • Uploaded {new Date(document.created_at).toLocaleString()}
            </p>
          </div>
          
          {/* Status Badge */}
          <div className="flex flex-col items-end gap-2">
            <span
              className={`
                px-3 py-1 rounded-full text-sm font-medium
                ${document.extraction_status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                ${document.extraction_status === 'processing' ? 'bg-yellow-100 text-yellow-800' : ''}
                ${document.extraction_status === 'failed' ? 'bg-red-100 text-red-800' : ''}
                ${document.extraction_status === 'pending' ? 'bg-gray-100 text-gray-800' : ''}
              `}
            >
              {document.extraction_status.toUpperCase()}
            </span>
            
            {document.confidence_score && (
              <span className={`text-sm font-medium ${confidenceColor}`}>
                {confidenceLabel} Confidence ({document.confidence_score.toFixed(1)}%)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Extraction Error */}
      {document.extraction_status === 'failed' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <span className="text-red-500 text-xl">⚠️</span>
            <div className="flex-1">
              <p className="font-medium text-red-800">Extraction Failed</p>
              <p className="text-sm text-red-600 mt-1">{document.extraction_error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Extracted Fields */}
      {document.extraction_status === 'completed' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Extracted Data</h3>
            <p className="text-sm text-gray-600 mt-1">
              Review and correct the extracted values below. Click on any field to edit.
            </p>
          </div>

          <div className="p-6 space-y-4">
            {Object.entries(extractedData).map(([key, value]) => {
              const isEditing = editingField === key;
              const correctedValue = corrections[key] !== undefined ? corrections[key] : value;
              const hasCorrection = corrections[key] !== undefined;

              return (
                <div
                  key={key}
                  className={`
                    border rounded-lg p-4 transition-colors
                    ${hasCorrection ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 hover:border-gray-300'}
                  `}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {key.replace(/_/g, ' ').toUpperCase()}
                        {hasCorrection && (
                          <span className="ml-2 text-yellow-600 text-xs">(Modified)</span>
                        )}
                      </label>

                      {isEditing ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={correctedValue?.toString() || ''}
                            onChange={(e) => handleFieldEdit(key, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                          <button
                            onClick={() => setEditingField(null)}
                            className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                          >
                            ✓
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => setEditingField(key)}
                          className="cursor-pointer px-3 py-2 bg-gray-50 rounded-md hover:bg-gray-100 border border-gray-200"
                        >
                          <span className="text-gray-900">
                            {value !== null && value !== undefined ? String(correctedValue) : '(empty)'}
                          </span>
                        </div>
                      )}

                      {hasCorrection && !isEditing && (
                        <p className="text-xs text-gray-500 mt-1">
                          Original: {String(value)}
                        </p>
                      )}
                    </div>

                    {/* Field Confidence (if available from extracted_fields) */}
                    {document.extracted_fields.find((f) => f.field_name === key) && (
                      <div className="text-right">
                        <span className={`text-sm font-medium ${documentService.getConfidenceColor(
                          document.extracted_fields.find((f) => f.field_name === key)?.confidence || 0
                        )}`}>
                          {document.extracted_fields.find((f) => f.field_name === key)?.confidence.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Notes Section */}
      {document.extraction_status === 'completed' && !document.user_validated && (
        <div className="bg-white rounded-lg shadow p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes or comments about this document..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex gap-3">
          {!document.user_validated && document.extraction_status === 'completed' && (
            <>
              <button
                onClick={handleApprove}
                disabled={validating}
                className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {validating ? '⏳ Validating...' : '✓ Approve & Validate'}
              </button>
              <button
                onClick={handleReject}
                disabled={validating}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {validating ? '⏳ Processing...' : '✗ Reject'}
              </button>
            </>
          )}

          {document.user_validated && !document.applied_to_footprint && (
            <button
              onClick={handleApplyToFootprint}
              disabled={applying}
              className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {applying ? '⏳ Applying...' : '🚀 Apply to Footprint'}
            </button>
          )}

          {document.applied_to_footprint && (
            <div className="flex-1 px-6 py-3 bg-green-100 text-green-800 rounded-lg text-center font-medium">
              ✓ Applied to Footprint
            </div>
          )}
        </div>

        {/* Status Messages */}
        {document.user_validated && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              ✓ Validated by {document.validated_by_email} on {new Date(document.validated_at!).toLocaleString()}
            </p>
          </div>
        )}

        {document.applied_to_footprint && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              ✓ Data has been applied to your carbon footprint
            </p>
          </div>
        )}
      </div>

      {/* Processing Info */}
      {document.processing_time_ms && (
        <div className="text-sm text-gray-500 text-center">
          Processed in {document.processing_time_ms}ms using {document.gemini_model_used}
        </div>
      )}
    </div>
  );
};

export default DocumentExtractionReview;
