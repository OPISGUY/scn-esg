import React, { useState } from 'react';
import DocumentUploadZone from './DocumentUploadZone';
import DocumentExtractionReview from './DocumentExtractionReview';
import type { UploadDocumentResponse } from '../services/documentService';

const DocumentUploadDemo: React.FC = () => {
  const [uploadedDocumentId, setUploadedDocumentId] = useState<string | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleUploadComplete = (response: UploadDocumentResponse) => {
    console.log('Document uploaded:', response);
    setUploadedDocumentId(response.document_id);
    setShowReview(true);
    setSuccessMessage(`✅ Document uploaded and ${response.extraction_status}!`);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
    setErrorMessage(`❌ Upload failed: ${error}`);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  const handleValidateComplete = () => {
    setSuccessMessage('✅ Document validated successfully!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleApplyComplete = () => {
    setSuccessMessage('✅ Data applied to footprint successfully!');
    setShowReview(false);
    setUploadedDocumentId(null);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleError = (error: string) => {
    setErrorMessage(`❌ Error: ${error}`);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  const handleNewUpload = () => {
    setUploadedDocumentId(null);
    setShowReview(false);
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📄 Smart Document Upload
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Phase 2: Multi-Modal Document Intelligence
          </p>
          <p className="text-lg text-gray-500">
            Upload utility bills, receipts, or meter photos and watch AI extract emissions data automatically
          </p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="max-w-2xl mx-auto mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {errorMessage}
          </div>
        )}

        {/* Main Content */}
        {!showReview ? (
          <div className="max-w-2xl mx-auto">
            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="text-3xl mb-2">⚡</div>
                <h3 className="font-semibold text-gray-900 mb-1">Utility Bills</h3>
                <p className="text-sm text-gray-600">Electric, gas, water bills with automatic kWh extraction</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="text-3xl mb-2">⛽</div>
                <h3 className="font-semibold text-gray-900 mb-1">Fuel Receipts</h3>
                <p className="text-sm text-gray-600">Gas station receipts with fuel type and quantity</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="text-3xl mb-2">📸</div>
                <h3 className="font-semibold text-gray-900 mb-1">Meter Photos</h3>
                <p className="text-sm text-gray-600">Analog or digital meter readings via photo upload</p>
              </div>
            </div>

            {/* Upload Component */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <DocumentUploadZone
                onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
              />
            </div>

            {/* Features List */}
            <div className="mt-8 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">✨ AI-Powered Features</h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700"><strong>Instant Extraction:</strong> AI reads and extracts data in &lt;5 seconds</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700"><strong>High Accuracy:</strong> 90%+ extraction accuracy for utility bills</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700"><strong>Multi-Format:</strong> Supports PDF, JPG, PNG (up to 4MB)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700"><strong>Smart Validation:</strong> Review and correct extracted data before applying</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700"><strong>Automatic Calculations:</strong> Emissions calculated with region-specific factors</span>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            {/* Back Button */}
            <button
              onClick={handleNewUpload}
              className="mb-6 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Upload Another Document
            </button>

            {/* Review Component */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              {uploadedDocumentId && (
                <DocumentExtractionReview
                  documentId={uploadedDocumentId}
                  onValidateComplete={handleValidateComplete}
                  onApplyComplete={handleApplyComplete}
                  onError={handleError}
                />
              )}
            </div>

            {/* Next Steps */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">🎯 Next Steps</h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-800">
                <li>Review the extracted data for accuracy</li>
                <li>Make any necessary corrections inline</li>
                <li>Click "Approve & Validate" when ready</li>
                <li>Finally, "Apply to Footprint" to add emissions data</li>
              </ol>
            </div>
          </div>
        )}

        {/* Technical Info */}
        <div className="mt-12 max-w-2xl mx-auto bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 Technical Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-700">AI Model:</p>
              <p className="text-gray-600">Google Gemini Vision (gemini-2.0-flash-exp)</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Processing Time:</p>
              <p className="text-gray-600">&lt;5 seconds per document</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">PDF Parsing:</p>
              <p className="text-gray-600">PyMuPDF (300 DPI conversion)</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Supported Formats:</p>
              <p className="text-gray-600">PDF, JPG, PNG (max 4MB)</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Extraction Accuracy:</p>
              <p className="text-gray-600">90%+ for utility bills, 85%+ for meters</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Data Security:</p>
              <p className="text-gray-600">Auto-delete after 90 days</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadDemo;
