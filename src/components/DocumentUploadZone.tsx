/**
 * DocumentUploadZone Component
 * Drag-and-drop file upload zone for utility bills, receipts, and meter photos
 */

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  documentService, 
  UploadDocumentRequest, 
  UploadDocumentResponse 
} from '../services/documentService';

interface DocumentUploadZoneProps {
  onUploadComplete?: (response: UploadDocumentResponse) => void;
  onUploadError?: (error: string) => void;
  conversationSessionId?: string;
  footprintId?: string;
  defaultDocumentType?: 'utility_bill' | 'fuel_receipt' | 'travel_receipt' | 'invoice' | 'meter_photo' | 'other';
  compact?: boolean;
}

export const DocumentUploadZone: React.FC<DocumentUploadZoneProps> = ({
  onUploadComplete,
  onUploadError,
  conversationSessionId,
  footprintId,
  defaultDocumentType = 'utility_bill',
  compact = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<UploadDocumentRequest['document_type']>(defaultDocumentType);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    
    if (acceptedFiles.length === 0) {
      setError('No files selected or file type not supported');
      return;
    }

    const file = acceptedFiles[0];
    
    // Validate file
    const validation = documentService.validateFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      onUploadError?.(validation.error || 'Invalid file');
      return;
    }

    setSelectedFile(file);
  }, [onUploadError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxSize: 4 * 1024 * 1024, // 4MB
    multiple: false,
  });

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Simulate progress (since fetch doesn't support upload progress easily)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await documentService.uploadDocument({
        file: selectedFile,
        document_type: documentType,
        conversation_session_id: conversationSessionId,
        footprint_id: footprintId,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Success!
      onUploadComplete?.(response);
      
      // Reset form
      setTimeout(() => {
        setSelectedFile(null);
        setUploadProgress(0);
        setUploading(false);
      }, 1500);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      onUploadError?.(errorMessage);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setError(null);
    setUploadProgress(0);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div {...getRootProps()} className="cursor-pointer">
          <input {...getInputProps()} />
          <button
            type="button"
            className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            disabled={uploading}
          >
            📎 Upload Document
          </button>
        </div>
        {selectedFile && (
          <span className="text-sm text-gray-600">
            {selectedFile.name} ({documentService.formatFileSize(selectedFile.size)})
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Upload Document</h3>
        <span className="text-sm text-gray-500">Max 4MB • PDF, JPG, PNG</span>
      </div>

      {/* Document Type Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Document Type
        </label>
        <select
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value as any)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={uploading}
        >
          <option value="utility_bill">⚡ Utility Bill (Electric/Gas/Water)</option>
          <option value="fuel_receipt">⛽ Fuel Receipt</option>
          <option value="travel_receipt">✈️ Travel Receipt</option>
          <option value="invoice">📄 Invoice</option>
          <option value="meter_photo">📸 Meter Photo</option>
          <option value="other">📎 Other Document</option>
        </select>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {selectedFile ? (
          <div className="space-y-2">
            <div className="text-4xl">📄</div>
            <div className="text-lg font-medium text-gray-900">{selectedFile.name}</div>
            <div className="text-sm text-gray-500">
              {documentService.formatFileSize(selectedFile.size)} • {selectedFile.type}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-4xl">{isDragActive ? '📥' : '📤'}</div>
            <div className="text-lg font-medium text-gray-900">
              {isDragActive ? 'Drop file here' : 'Drag & drop file here'}
            </div>
            <div className="text-sm text-gray-500">
              or click to browse files
            </div>
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Uploading and extracting...</span>
            <span className="font-medium text-blue-600">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-500 h-2 transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex items-start gap-2">
            <span className="text-red-500 text-xl">⚠️</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Upload Error</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {selectedFile && !uploading && (
          <>
            <button
              onClick={handleUpload}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 font-medium transition-colors"
            >
              🚀 Upload & Extract
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium transition-colors"
            >
              Cancel
            </button>
          </>
        )}
        {uploading && (
          <button
            disabled
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
          >
            Processing...
          </button>
        )}
      </div>

      {/* Helper Text */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>✓ Supported formats: PDF, JPG, PNG</p>
        <p>✓ Maximum file size: 4 MB</p>
        <p>✓ AI will automatically extract emissions data from your document</p>
      </div>
    </div>
  );
};

export default DocumentUploadZone;
