import React, { useState } from 'react';
import {
  Upload, FileSpreadsheet, Database, Zap, CheckCircle2,
  Loader2, AlertCircle,
  ArrowRight, Eye
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { buildApiUrl } from '../utils/api';

interface ImportSource {
  id: string;
  name: string;
  source_type: 'file' | 'api' | 'iot' | 'erp';
  source_type_display: string;
  description: string;
  icon: React.ComponentType<any>;
  comingSoon?: boolean;
}

interface ImportJob {
  id: string;
  name: string;
  data_type: string;
  status: string;
  file_name: string;
  total_rows: number;
  processed_rows: number;
  successful_rows: number;
  failed_rows: number;
  progress_percentage: number;
  success_rate: number;
  created_at: string;
}

interface FilePreview {
  headers: string[];
  sample_rows: Record<string, any>[];
  total_rows: number;
  detected_types: Record<string, string>;
  suggested_mapping: Record<string, string>;
}

const ImportData: React.FC = () => {
  useAuth();
  const [step, setStep] = useState<'select' | 'upload' | 'map' | 'execute' | 'complete'>('select');
  const [, setSelectedSource] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dataType, setDataType] = useState<string>('carbon');
  const [preview, setPreview] = useState<FilePreview | null>(null);
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const [currentJob, setCurrentJob] = useState<ImportJob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  
  const importSources: ImportSource[] = [
    {
      id: 'file',
      name: 'CSV/Excel Files',
      source_type: 'file',
      source_type_display: 'File Upload',
      description: 'Import emissions and operational data',
      icon: FileSpreadsheet,
    },
    {
      id: 'iot',
      name: 'Energy Systems',
      source_type: 'iot',
      source_type_display: 'IoT Integration',
      description: 'Connect smart meters and IoT devices',
      icon: Zap,
      comingSoon: true,
    },
    {
      id: 'erp',
      name: 'ERP Integration',
      source_type: 'erp',
      source_type_display: 'ERP System',
      description: 'Sync with existing business systems',
      icon: Database,
      comingSoon: true,
    },
  ];
  
  const handleSourceSelect = (sourceId: string) => {
    const source = importSources.find(s => s.id === sourceId);
    if (source?.comingSoon) {
      alert('This integration is coming soon! Currently, only file uploads are available.');
      return;
    }
    setSelectedSource(sourceId);
    setStep('upload');
    setError('');
  };
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!['csv', 'xlsx', 'xls', 'json'].includes(extension || '')) {
        setError('Please select a CSV, Excel, or JSON file');
        return;
      }
      
      // Validate file size (50MB max)
      if (file.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB');
        return;
      }
      
      setSelectedFile(file);
      setError('');
    }
  };
  
  const handlePreview = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('data_type', dataType);
      
      const token = localStorage.getItem('access_token');
      const response = await fetch(buildApiUrl('/api/v1/imports/jobs/preview/'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to preview file');
      }
      
      const data: FilePreview = await response.json();
      setPreview(data);
      setFieldMapping(data.suggested_mapping);
      setStep('map');
    } catch (err: any) {
      setError(err.message || 'Failed to preview file');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleStartImport = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    setError('');
    
    try {
      // Step 1: Create import job
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('name', `Import ${selectedFile.name}`);
      formData.append('data_type', dataType);
      
      const token = localStorage.getItem('access_token');
      const createResponse = await fetch(buildApiUrl('/api/v1/imports/jobs/'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!createResponse.ok) {
        throw new Error('Failed to create import job');
      }
      
      const job: ImportJob = await createResponse.json();
      setCurrentJob(job);
      
      // Step 2: Execute import with field mapping
      const executeResponse = await fetch(buildApiUrl(`/api/v1/imports/jobs/${job.id}/execute/`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ field_mapping: fieldMapping }),
      });
      
      if (!executeResponse.ok) {
        throw new Error('Failed to execute import');
      }
      
      const updatedJob: ImportJob = await executeResponse.json();
      setCurrentJob(updatedJob);
      setStep('complete');
    } catch (err: any) {
      setError(err.message || 'Failed to start import');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const resetImport = () => {
    setStep('select');
    setSelectedSource('');
    setSelectedFile(null);
    setPreview(null);
    setFieldMapping({});
    setCurrentJob(null);
    setError('');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Import Your Data</h1>
          <p className="text-gray-600">
            Have existing sustainability data? Import it to get started faster and see immediate insights.
          </p>
        </div>
        
        {/* Progress Steps */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            {[
              { key: 'select', label: 'Select Source' },
              { key: 'upload', label: 'Upload File' },
              { key: 'map', label: 'Map Fields' },
              { key: 'execute', label: 'Import' },
            ].map((s, idx, arr) => (
              <React.Fragment key={s.key}>
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      step === s.key || (arr.findIndex(x => x.key === step) > idx)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {arr.findIndex(x => x.key === step) > idx ? (
                      <CheckCircle2 size={20} />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">{s.label}</span>
                </div>
                {idx < arr.length - 1 && (
                  <div className={`h-1 flex-1 mx-4 rounded ${
                    arr.findIndex(x => x.key === step) > idx ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <AlertCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-medium text-red-800">Error</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}
        
        {/* Step 1: Select Source */}
        {step === 'select' && (
          <div className="grid md:grid-cols-3 gap-6">
            {importSources.map((source) => {
              const Icon = source.icon;
              return (
                <button
                  key={source.id}
                  onClick={() => handleSourceSelect(source.id)}
                  disabled={source.comingSoon}
                  className={`bg-white rounded-lg shadow-md p-6 text-left transition-all ${
                    source.comingSoon
                      ? 'opacity-60 cursor-not-allowed'
                      : 'hover:shadow-lg hover:scale-105 cursor-pointer'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Icon className="text-blue-600" size={24} />
                    </div>
                    {source.comingSoon && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{source.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{source.description}</p>
                  <div className="text-xs text-gray-500 flex items-center">
                    {!source.comingSoon && (
                      <>
                        <span>CSV, XLSX, JSON</span>
                        <ArrowRight size={14} className="ml-auto" />
                      </>
                    )}
                    {source.comingSoon && <span>API, MQTT, REST</span>}
                  </div>
                </button>
              );
            })}
          </div>
        )}
        
        {/* Step 2: Upload File */}
        {step === 'upload' && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold mb-6">Upload Your File</h2>
            
            {/* Data Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Type
              </label>
              <select
                value={dataType}
                onChange={(e) => setDataType(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="carbon">Carbon Emissions</option>
                <option value="ewaste">E-Waste</option>
                <option value="energy">Energy Consumption</option>
                <option value="water">Water Usage</option>
                <option value="waste">General Waste</option>
                <option value="mixed">Mixed Data</option>
              </select>
            </div>
            
            {/* File Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <Upload className="mx-auto text-gray-400 mb-4" size={48} />
              <input
                type="file"
                id="file-upload"
                accept=".csv,.xlsx,.xls,.json"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg font-medium cursor-pointer hover:bg-blue-600 transition"
              >
                Choose File
              </label>
              <p className="text-gray-500 text-sm mt-4">
                Supported formats: CSV, Excel (XLSX/XLS), JSON (max 50MB)
              </p>
              
              {selectedFile && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg inline-flex items-center">
                  <FileSpreadsheet className="text-blue-600 mr-3" size={24} />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setStep('select')}
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Back
              </button>
              <button
                onClick={handlePreview}
                disabled={!selectedFile || isProcessing}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={20} />
                    Processing...
                  </>
                ) : (
                  <>
                    <Eye className="mr-2" size={20} />
                    Preview & Map Fields
                  </>
                )}
              </button>
            </div>
          </div>
        )}
        
        {/* Step 3: Map Fields */}
        {step === 'map' && preview && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold mb-6">Map Your Fields</h2>
            <p className="text-gray-600 mb-6">
              Match your file columns to our system fields. We've suggested mappings based on your column names.
            </p>
            
            {/* Preview Data */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">File Preview</h3>
                <span className="text-sm text-gray-500">{preview.total_rows} total rows</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {preview.headers.map((header, idx) => (
                        <th key={idx} className="text-left p-2 font-medium text-gray-700">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.sample_rows.slice(0, 3).map((row, idx) => (
                      <tr key={idx} className="border-b border-gray-100">
                        {preview.headers.map((header, colIdx) => (
                          <td key={colIdx} className="p-2 text-gray-600">
                            {row[header]?.toString() || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Field Mapping */}
            <div className="space-y-4">
              <h3 className="font-medium">Field Mapping</h3>
              {preview.headers.map((header) => (
                <div key={header} className="flex items-center gap-4">
                  <div className="flex-1 p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">{header}</span>
                    <span className="ml-2 text-xs text-gray-500">
                      ({preview.detected_types[header]})
                    </span>
                  </div>
                  <ArrowRight className="text-gray-400" size={20} />
                  <select
                    value={fieldMapping[header] || ''}
                    onChange={(e) => setFieldMapping({...fieldMapping, [header]: e.target.value})}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Skip this field</option>
                    <option value="date">Date</option>
                    <option value="amount">Amount/Quantity</option>
                    <option value="category">Category/Type</option>
                    <option value="description">Description</option>
                    <option value="device_type">Device Type</option>
                    <option value="organization">Organization</option>
                  </select>
                </div>
              ))}
            </div>
            
            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setStep('upload')}
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Back
              </button>
              <button
                onClick={handleStartImport}
                disabled={isProcessing || Object.keys(fieldMapping).length === 0}
                className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={20} />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2" size={20} />
                    Start Import
                  </>
                )}
              </button>
            </div>
          </div>
        )}
        
        {/* Step 4: Complete */}
        {step === 'complete' && currentJob && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="text-green-600" size={40} />
              </div>
              <h2 className="text-3xl font-semibold mb-2">Import Complete!</h2>
              <p className="text-gray-600">
                Your data has been successfully imported into the system.
              </p>
            </div>
            
            {/* Import Summary */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {currentJob.total_rows}
                </div>
                <div className="text-sm text-gray-600">Total Rows</div>
              </div>
              <div className="p-6 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {currentJob.successful_rows}
                </div>
                <div className="text-sm text-gray-600">Successful</div>
              </div>
              <div className="p-6 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {currentJob.failed_rows}
                </div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
            </div>
            
            {/* Success Rate */}
            <div className="mb-8">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Success Rate</span>
                <span className="text-gray-600">{currentJob.success_rate}%</span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all"
                  style={{ width: `${currentJob.success_rate}%` }}
                />
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex justify-center gap-4">
              <button
                onClick={resetImport}
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Import More Data
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition"
              >
                View Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportData;
