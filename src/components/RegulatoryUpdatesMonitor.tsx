import React, { useState, useEffect } from 'react';
import { AlertTriangle, ExternalLink, Calendar, TrendingUp, Filter, Bell, CheckCircle, Clock } from 'lucide-react';

interface RegulatoryUpdate {
  id: number;
  title: string;
  source: string;
  update_type: string;
  description: string;
  source_url: string;
  published_date: string;
  effective_date: string | null;
  impact_assessment: string;
  status: string;
  created_at: string;
}

interface UpdateStats {
  total_updates: number;
  recent_updates: number;
  high_impact_updates: number;
  sources: { [key: string]: number };
}

const RegulatoryUpdatesMonitor: React.FC = () => {
  const [updates, setUpdates] = useState<RegulatoryUpdate[]>([]);
  const [stats, setStats] = useState<UpdateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedUpdate, setSelectedUpdate] = useState<RegulatoryUpdate | null>(null);

  useEffect(() => {
    fetchUpdates();
    fetchStats();
  }, []);

  const fetchUpdates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/compliance/regulatory-updates/');
      if (!response.ok) throw new Error('Failed to fetch regulatory updates');
      
      const data = await response.json();
      setUpdates(data.results || data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/compliance/regulatory-updates/stats/');
      if (!response.ok) throw new Error('Failed to fetch stats');
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const triggerManualSync = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/compliance/regulatory-updates/sync/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) throw new Error('Manual sync failed');
      
      const result = await response.json();
      
      // Refresh the updates
      await fetchUpdates();
      await fetchStats();
      
      // Show success message
      alert(`Sync completed: ${result.created_count} new updates found`);
    } catch (err) {
      alert(`Sync failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const filterUpdates = (updates: RegulatoryUpdate[]): RegulatoryUpdate[] => {
    return updates.filter(update => {
      const matchesSource = selectedSource === 'all' || update.source === selectedSource;
      const matchesType = selectedType === 'all' || update.update_type === selectedType;
      const matchesStatus = selectedStatus === 'all' || update.status === selectedStatus;
      
      return matchesSource && matchesType && matchesStatus;
    });
  };

  const getImpactLevel = (update: RegulatoryUpdate): 'high' | 'medium' | 'low' => {
    const impactText = update.impact_assessment.toLowerCase();
    if (impactText.includes('high')) return 'high';
    if (impactText.includes('medium')) return 'medium';
    return 'low';
  };

  const getImpactColor = (level: 'high' | 'medium' | 'low'): string => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getSourceColor = (source: string): string => {
    const colors: { [key: string]: string } = {
      'EFRAG': 'bg-blue-100 text-blue-800',
      'EUR-Lex': 'bg-purple-100 text-purple-800',
      'EBA': 'bg-green-100 text-green-800',
      'ESMA': 'bg-orange-100 text-orange-800'
    };
    return colors[source] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredUpdates = filterUpdates(updates);

  if (loading && updates.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading regulatory updates...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">Error: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Regulatory Updates</h2>
          <p className="text-gray-600">Monitor CSRD and ESG regulatory changes</p>
        </div>
        <button
          onClick={triggerManualSync}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Bell className="h-4 w-4 mr-2" />
          {loading ? 'Syncing...' : 'Manual Sync'}
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Updates</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total_updates}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Recent (30 days)</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.recent_updates}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">High Impact</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.high_impact_updates}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center">
              <Filter className="h-8 w-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Sources</p>
                <p className="text-2xl font-semibold text-gray-900">{Object.keys(stats.sources).length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Sources</option>
            <option value="EFRAG">EFRAG</option>
            <option value="EUR-Lex">EUR-Lex</option>
            <option value="EBA">EBA</option>
            <option value="ESMA">ESMA</option>
          </select>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="regulation">Regulation</option>
            <option value="guidance">Guidance</option>
            <option value="taxonomy">Taxonomy</option>
            <option value="technical_standard">Technical Standard</option>
          </select>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Updates List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Updates List */}
        <div className="space-y-4">
          {filteredUpdates.length === 0 ? (
            <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
              <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No regulatory updates found</p>
            </div>
          ) : (
            filteredUpdates.map((update) => {
              const impactLevel = getImpactLevel(update);
              
              return (
                <div
                  key={update.id}
                  className={`bg-white rounded-lg border p-4 cursor-pointer transition-colors ${
                    selectedUpdate?.id === update.id ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedUpdate(update)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getSourceColor(update.source)}`}>
                        {update.source}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full border ${getImpactColor(impactLevel)}`}>
                        {impactLevel.toUpperCase()} IMPACT
                      </span>
                    </div>
                    <div className="flex items-center">
                      {getStatusIcon(update.status)}
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {update.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {update.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{formatDate(update.published_date)}</span>
                    <span className="capitalize">{update.update_type.replace('_', ' ')}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Update Details */}
        <div className="lg:sticky lg:top-6">
          {selectedUpdate ? (
            <div className="bg-white rounded-lg border p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getSourceColor(selectedUpdate.source)}`}>
                      {selectedUpdate.source}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full border ${getImpactColor(getImpactLevel(selectedUpdate))}`}>
                      {getImpactLevel(selectedUpdate).toUpperCase()} IMPACT
                    </span>
                  </div>
                  {selectedUpdate.source_url && (
                    <a
                      href={selectedUpdate.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {selectedUpdate.title}
                  </h3>
                  <p className="text-gray-600">{selectedUpdate.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-500">Published:</span>
                    <p className="text-gray-900">{formatDate(selectedUpdate.published_date)}</p>
                  </div>
                  {selectedUpdate.effective_date && (
                    <div>
                      <span className="font-medium text-gray-500">Effective:</span>
                      <p className="text-gray-900">{formatDate(selectedUpdate.effective_date)}</p>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-500">Type:</span>
                    <p className="text-gray-900 capitalize">{selectedUpdate.update_type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Status:</span>
                    <div className="flex items-center mt-1">
                      {getStatusIcon(selectedUpdate.status)}
                      <span className="ml-1 capitalize">{selectedUpdate.status}</span>
                    </div>
                  </div>
                </div>

                {selectedUpdate.impact_assessment && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Impact Assessment</h4>
                    <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {selectedUpdate.impact_assessment}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
              <Filter className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Select an update to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegulatoryUpdatesMonitor;
