import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileSpreadsheet, Zap, Link as LinkIcon, CheckCircle, AlertCircle } from 'lucide-react';

const DataImportSection: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      handleUpload(event.target.files[0]);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      setSelectedFile(event.dataTransfer.files[0]);
      handleUpload(event.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleUpload = async (_file: File) => {
    setUploadStatus('uploading');
    
    // Simulate upload delay - this is a demo, not real processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate success
    setUploadStatus('success');
    
    // Reset after 3 seconds to show the demo message
    setTimeout(() => {
      setUploadStatus('idle');
      setSelectedFile(null);
    }, 3000);
  };

  const importOptions = [
    {
      icon: <FileSpreadsheet className="w-8 h-8" />,
      title: 'CSV/Excel Files',
      description: 'Import emissions and operational data',
      formats: 'CSV, XLSX, JSON',
      color: 'from-blue-500 to-cyan-500',
      available: true,
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Energy Systems',
      description: 'Connect smart meters and IoT devices',
      formats: 'API, MQTT, REST',
      color: 'from-yellow-500 to-orange-500',
      available: false,
    },
    {
      icon: <LinkIcon className="w-8 h-8" />,
      title: 'ERP Integration',
      description: 'Sync with existing business systems',
      formats: 'SAP, Oracle, Custom',
      color: 'from-purple-500 to-pink-500',
      available: false,
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Import Your Data
          </h2>
          <p className="text-xl text-gray-600">
            Have existing sustainability data? Import it to get started faster and see immediate insights.
          </p>
        </div>

        {/* Import Options Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {importOptions.map((option, index) => (
            <motion.div
              key={option.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`bg-white rounded-lg shadow-lg overflow-hidden ${
                !option.available ? 'opacity-75' : ''
              }`}
            >
              <div className={`bg-gradient-to-r ${option.color} p-6 text-white`}>
                <div className="flex justify-center mb-3">{option.icon}</div>
                <h3 className="text-xl font-bold text-center">{option.title}</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-3">{option.description}</p>
                <div className="text-sm text-gray-500 mb-4">
                  <span className="font-semibold">Supports:</span> {option.formats}
                </div>
                {!option.available && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded px-3 py-2 text-sm text-yellow-800">
                    Coming Soon
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* File Upload Demo Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-lg shadow-xl p-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            Try It Now - Upload a Sample File
          </h3>
          <p className="text-gray-600 mb-6 text-center">
            Upload a CSV or Excel file to see how quickly we can analyze your emissions data
          </p>

          {/* Upload Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition ${
              dragOver
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-green-400'
            } ${uploadStatus !== 'idle' ? 'pointer-events-none' : ''}`}
          >
            {uploadStatus === 'idle' && (
              <>
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  Drop your file here or click to browse
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Supports CSV, XLSX, JSON files up to 10MB
                </p>
                <label className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 cursor-pointer transition">
                  Select File
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls,.json"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </>
            )}

            {uploadStatus === 'uploading' && (
              <div className="space-y-4">
                <div className="animate-spin w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full mx-auto" />
                <p className="text-lg font-semibold text-gray-700">
                  Analyzing {selectedFile?.name}...
                </p>
                <p className="text-sm text-gray-500">
                  Processing emissions data and identifying patterns
                </p>
              </div>
            )}

            {uploadStatus === 'success' && (
              <div className="space-y-4">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
                <p className="text-lg font-semibold text-green-700">
                  File Analyzed Successfully!
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left max-w-md mx-auto">
                  <h4 className="font-semibold text-green-900 mb-2">Preview Results:</h4>
                  <ul className="space-y-1 text-sm text-green-800">
                    <li>✓ Found 247 emission entries</li>
                    <li>✓ Identified Scope 1, 2, and 3 categories</li>
                    <li>✓ Detected 12 facilities across 5 locations</li>
                    <li>✓ Ready to import into dashboard</li>
                  </ul>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 max-w-md mx-auto">
                  <p className="text-sm text-blue-800">
                    <strong>This is a demo.</strong> To import real data, <a href="/free-trial" className="underline font-semibold">start your free trial</a>
                  </p>
                </div>
              </div>
            )}

            {uploadStatus === 'error' && (
              <div className="space-y-4">
                <AlertCircle className="w-16 h-16 text-red-600 mx-auto" />
                <p className="text-lg font-semibold text-red-700">
                  Upload Failed
                </p>
                <p className="text-sm text-gray-600">
                  Please try again or contact support if the issue persists
                </p>
                <button
                  onClick={() => setUploadStatus('idle')}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>

          {/* Feature List */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900">Auto-Detection</h4>
                <p className="text-sm text-gray-600">
                  AI identifies data columns and emission categories automatically
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900">Data Validation</h4>
                <p className="text-sm text-gray-600">
                  Smart checks ensure accuracy and flag inconsistencies
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900">Instant Insights</h4>
                <p className="text-sm text-gray-600">
                  See charts, trends, and recommendations immediately after import
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-gray-600 mb-4">
            Ready to import your sustainability data?
          </p>
          <a
            href="/free-trial"
            className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition shadow-lg"
          >
            Start Free Trial
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default DataImportSection;
