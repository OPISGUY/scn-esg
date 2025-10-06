import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { carbonService, CarbonFootprintData } from '../services/carbonService';
import { useAuth } from './AuthContext';

interface CarbonFootprintContextType {
  // Current active footprint (latest or selected)
  currentFootprint: CarbonFootprintData | null;
  
  // All footprints (history)
  footprints: CarbonFootprintData[];
  
  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  
  // Error handling
  error: string | null;
  
  // Actions
  loadFootprints: () => Promise<void>;
  createFootprint: (data: Omit<CarbonFootprintData, 'id' | 'company' | 'total_emissions' | 'created_at'>) => Promise<CarbonFootprintData>;
  updateFootprint: (id: string, data: Partial<CarbonFootprintData>) => Promise<CarbonFootprintData>;
  deleteFootprint: (id: string) => Promise<void>;
  setCurrentFootprint: (footprint: CarbonFootprintData | null) => void;
  refreshCurrentFootprint: () => Promise<void>;
  
  // Computed properties
  totalEmissions: number;
  latestFootprint: CarbonFootprintData | null;
  hasFootprints: boolean;
}

const CarbonFootprintContext = createContext<CarbonFootprintContextType | undefined>(undefined);

export const useCarbonFootprint = () => {
  const context = useContext(CarbonFootprintContext);
  if (!context) {
    throw new Error('useCarbonFootprint must be used within a CarbonFootprintProvider');
  }
  return context;
};

interface CarbonFootprintProviderProps {
  children: ReactNode;
}

export const CarbonFootprintProvider: React.FC<CarbonFootprintProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [currentFootprint, setCurrentFootprint] = useState<CarbonFootprintData | null>(null);
  const [footprints, setFootprints] = useState<CarbonFootprintData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load all footprints from the API
   * Falls back to localStorage for demo/offline mode
   */
  const loadFootprints = useCallback(async () => {
    if (!isAuthenticated) {
      console.log('🔍 Loading footprints for user:', user?.email || 'unauthenticated');
      setFootprints([]);
      setCurrentFootprint(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('🔍 Loading footprints for user:', user?.email);
      
      const data = await carbonService.getFootprints();
      const footprintsArray = Array.isArray(data) ? data : [];
      
      // If API returns empty, try localStorage fallback for demo mode
      if (footprintsArray.length === 0) {
        const savedFootprint = localStorage.getItem('carbonFootprint');
        if (savedFootprint) {
          try {
            const parsed = JSON.parse(savedFootprint);
            // Convert to API format
            const localFootprint: CarbonFootprintData = {
              id: parsed.id || '1',
              reporting_period: parsed.reportingPeriod || parsed.reporting_period || '2024',
              scope1_emissions: parsed.scope1 || parsed.scope1_emissions || 0,
              scope2_emissions: parsed.scope2 || parsed.scope2_emissions || 0,
              scope3_emissions: parsed.scope3 || parsed.scope3_emissions || 0,
              total_emissions: parsed.total || parsed.total_emissions || 
                (parsed.scope1 || 0) + (parsed.scope2 || 0) + (parsed.scope3 || 0),
              company_data: {
                id: parsed.company || 1,
                name: parsed.companyName || 'Demo Company'
              },
              status: parsed.status || 'draft',
              created_at: parsed.createdAt || new Date().toISOString()
            };
            console.log('📊 Using localStorage fallback footprint');
            setFootprints([localFootprint]);
            setCurrentFootprint(localFootprint);
            return;
          } catch (parseError) {
            console.error('Error parsing localStorage footprint:', parseError);
          }
        }
      }
      
      // Sort by created_at descending (most recent first)
      const sortedFootprints = footprintsArray.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });
      
      setFootprints(sortedFootprints);
      
      // Set current to the latest footprint
      if (sortedFootprints.length > 0) {
        setCurrentFootprint(sortedFootprints[0]);
      }
      
      console.log(`✅ Loaded ${sortedFootprints.length} footprints`);
    } catch (err) {
      console.error('❌ Failed to load footprints:', err);
      
      // Try localStorage fallback on error
      const savedFootprint = localStorage.getItem('carbonFootprint');
      if (savedFootprint) {
        try {
          const parsed = JSON.parse(savedFootprint);
          const localFootprint: CarbonFootprintData = {
            id: parsed.id || '1',
            reporting_period: parsed.reportingPeriod || parsed.reporting_period || '2024',
            scope1_emissions: parsed.scope1 || parsed.scope1_emissions || 0,
            scope2_emissions: parsed.scope2 || parsed.scope2_emissions || 0,
            scope3_emissions: parsed.scope3 || parsed.scope3_emissions || 0,
            total_emissions: parsed.total || parsed.total_emissions ||
              (parsed.scope1 || 0) + (parsed.scope2 || 0) + (parsed.scope3 || 0),
            company_data: {
              id: parsed.company || 1,
              name: parsed.companyName || user?.company || user?.email || 'Demo Company'
            },
            status: parsed.status || 'draft',
            created_at: parsed.createdAt || new Date().toISOString()
          };
          console.log('📊 Using localStorage fallback after error');
          setFootprints([localFootprint]);
          setCurrentFootprint(localFootprint);
        } catch (parseError) {
          console.error('Error parsing localStorage footprint:', parseError);
          setError(err instanceof Error ? err.message : 'Failed to load footprints');
        }
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load footprints');
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  /**
   * Create a new footprint
   */
  const createFootprint = useCallback(async (
    data: Omit<CarbonFootprintData, 'id' | 'company' | 'total_emissions' | 'created_at'>
  ): Promise<CarbonFootprintData> => {
    try {
      setIsCreating(true);
      setError(null);
      console.log('➕ Creating new footprint:', data);
      
      const newFootprint = await carbonService.createFootprint(data);
      
      // Add to list and set as current
      setFootprints(prev => [newFootprint, ...prev]);
      setCurrentFootprint(newFootprint);
      
      // Update localStorage for consistency
      localStorage.setItem('carbonFootprint', JSON.stringify({
        id: newFootprint.id,
        reportingPeriod: newFootprint.reporting_period,
        scope1: newFootprint.scope1_emissions,
        scope2: newFootprint.scope2_emissions,
        scope3: newFootprint.scope3_emissions,
        total: newFootprint.total_emissions,
        companyName: newFootprint.company_data?.name,
        status: newFootprint.status,
        createdAt: newFootprint.created_at
      }));
      
      console.log('✅ Footprint created successfully');
      return newFootprint;
    } catch (err) {
      console.error('❌ Failed to create footprint:', err);
      setError(err instanceof Error ? err.message : 'Failed to create footprint');
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, []);

  /**
   * Update an existing footprint
   */
  const updateFootprint = useCallback(async (
    id: string,
    data: Partial<CarbonFootprintData>
  ): Promise<CarbonFootprintData> => {
    try {
      setIsUpdating(true);
      setError(null);
      console.log('🔄 Updating footprint:', id, data);
      
      const updatedFootprint = await carbonService.updateFootprint(id, data);
      
      // Update in list
      setFootprints(prev => prev.map(fp => fp.id === id ? updatedFootprint : fp));
      
      // Update current if it's the one being updated
      if (currentFootprint?.id === id) {
        setCurrentFootprint(updatedFootprint);
      }
      
      // Update localStorage if it's the current one
      if (currentFootprint?.id === id) {
        localStorage.setItem('carbonFootprint', JSON.stringify({
          id: updatedFootprint.id,
          reportingPeriod: updatedFootprint.reporting_period,
          scope1: updatedFootprint.scope1_emissions,
          scope2: updatedFootprint.scope2_emissions,
          scope3: updatedFootprint.scope3_emissions,
          total: updatedFootprint.total_emissions,
          companyName: updatedFootprint.company_data?.name,
          status: updatedFootprint.status,
          createdAt: updatedFootprint.created_at
        }));
      }
      
      console.log('✅ Footprint updated successfully');
      return updatedFootprint;
    } catch (err) {
      console.error('❌ Failed to update footprint:', err);
      setError(err instanceof Error ? err.message : 'Failed to update footprint');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [currentFootprint]);

  /**
   * Delete a footprint
   */
  const deleteFootprint = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      console.log('🗑️ Deleting footprint:', id);
      
      await carbonService.deleteFootprint(id);
      
      // Remove from list
      setFootprints(prev => prev.filter(fp => fp.id !== id));
      
      // If it was the current one, set to the next latest
      if (currentFootprint?.id === id) {
        const remaining = footprints.filter(fp => fp.id !== id);
        setCurrentFootprint(remaining.length > 0 ? remaining[0] : null);
        
        if (remaining.length > 0) {
          localStorage.setItem('carbonFootprint', JSON.stringify({
            id: remaining[0].id,
            reportingPeriod: remaining[0].reporting_period,
            scope1: remaining[0].scope1_emissions,
            scope2: remaining[0].scope2_emissions,
            scope3: remaining[0].scope3_emissions,
            total: remaining[0].total_emissions,
            companyName: remaining[0].company_data?.name,
            status: remaining[0].status,
            createdAt: remaining[0].created_at
          }));
        } else {
          localStorage.removeItem('carbonFootprint');
        }
      }
      
      console.log('✅ Footprint deleted successfully');
    } catch (err) {
      console.error('❌ Failed to delete footprint:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete footprint');
      throw err;
    }
  }, [currentFootprint, footprints]);

  /**
   * Refresh the current footprint from the API
   */
  const refreshCurrentFootprint = useCallback(async () => {
    if (!currentFootprint?.id) return;
    
    try {
      console.log('🔄 Refreshing current footprint:', currentFootprint.id);
      const refreshed = await carbonService.getFootprint(currentFootprint.id);
      setCurrentFootprint(refreshed);
      
      // Update in list
      setFootprints(prev => prev.map(fp => fp.id === refreshed.id ? refreshed : fp));
      
      console.log('✅ Current footprint refreshed');
    } catch (err) {
      console.error('❌ Failed to refresh footprint:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh footprint');
    }
  }, [currentFootprint]);

  // Load footprints when user authenticates
  useEffect(() => {
    if (isAuthenticated) {
      loadFootprints();
    }
  }, [isAuthenticated, loadFootprints]);

  // Computed properties
  const totalEmissions = currentFootprint?.total_emissions || 0;
  const latestFootprint = footprints.length > 0 ? footprints[0] : null;
  const hasFootprints = footprints.length > 0;

  const value: CarbonFootprintContextType = {
    currentFootprint,
    footprints,
    isLoading,
    isCreating,
    isUpdating,
    error,
    loadFootprints,
    createFootprint,
    updateFootprint,
    deleteFootprint,
    setCurrentFootprint,
    refreshCurrentFootprint,
    totalEmissions,
    latestFootprint,
    hasFootprints,
  };

  return (
    <CarbonFootprintContext.Provider value={value}>
      {children}
    </CarbonFootprintContext.Provider>
  );
};
