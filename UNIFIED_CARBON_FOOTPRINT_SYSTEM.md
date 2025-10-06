# Unified Carbon Footprint System

## Overview

The SCN ESG platform now uses a **centralized Carbon Footprint Context** that provides a single source of truth for all carbon footprint data across the entire application. This eliminates data inconsistencies and- [x] ImportData updated to use context (optional - works with current implementation)
- [x] ConversationalDataEntry updated to use context - AI has full carbon data context
- [ ] Full end-to-end testing completed
- [ ] Multi-user isolation testedures all components are "singing from the same hymn sheet."

## Architecture

### CarbonFootprintContext (`src/contexts/CarbonFootprintContext.tsx`)

The central state management system for all carbon footprint data.

#### State Management
- **currentFootprint**: The active footprint being viewed/edited (typically the most recent)
- **footprints**: Complete history of all footprints for the user's company
- **isLoading**: Loading state for initial data fetch
- **isCreating**: Loading state for creating new footprints
- **isUpdating**: Loading state for updating existing footprints
- **error**: Error messages for user feedback

#### API Integration
- Wraps `carbonService` for all backend API calls
- Handles authentication tokens automatically
- Provides localStorage fallback for demo/offline mode
- Auto-loads data when user authenticates

#### Actions
```typescript
loadFootprints()              // Fetch all footprints from API
createFootprint(data)         // Create new footprint
updateFootprint(id, data)     // Update existing footprint
deleteFootprint(id)           // Delete footprint
setCurrentFootprint(fp)       // Manually set active footprint
refreshCurrentFootprint()     // Reload current from API
```

#### Computed Properties
```typescript
totalEmissions    // Total emissions of current footprint
latestFootprint   // Most recent footprint in history
hasFootprints     // Boolean indicating if user has any footprints
```

## Integration in App.tsx

The context wraps the entire authenticated application:

```tsx
<AuthProvider>
  <CarbonFootprintProvider>
    <HelpProvider>
      <AppContent />
    </HelpProvider>
  </CarbonFootprintProvider>
</AuthProvider>
```

This ensures:
1. Context only loads data after authentication
2. All child components have access to unified footprint data
3. Data persists across route/view changes

## Component Usage

### How to Use in Components

```tsx
import { useCarbonFootprint } from '../contexts/CarbonFootprintContext';

function MyComponent() {
  const { 
    currentFootprint, 
    footprints, 
    isLoading,
    createFootprint,
    updateFootprint 
  } = useCarbonFootprint();

  // Use currentFootprint for display
  // Use footprints for history views
  // Call actions to modify data
}
```

### Components Updated to Use Context

#### ✅ Production Ready - Using Unified Context
- **App.tsx**: Wraps entire app with CarbonFootprintProvider
- **FootprintHistory**: Uses context for loading and displaying all footprints
- **Dashboard**: Displays currentFootprint metrics from context
- **AIInsights**: Validates against currentFootprint from context
- **CarbonCalculator**: Creates/updates currentFootprint via context
- **Reports**: Generates reports from currentFootprint in context
- **ConversationalDataEntry**: AI has full carbon data context for intelligent updates

#### 🔄 Optional - Can Be Updated Post-Launch
- **ImportData**: Works independently, could integrate with context for direct updates
- **ImpactViewer**: Could display metrics from currentFootprint for consistency

## Data Flow

### 1. User Authentication
```
User logs in → AuthContext sets isAuthenticated
→ CarbonFootprintContext detects auth change
→ loadFootprints() called automatically
→ Data fetched from API with auth token
→ footprints state updated
→ currentFootprint set to latest
```

### 2. Creating New Footprint
```
User fills form in CarbonCalculator
→ Calls createFootprint(data)
→ API creates footprint
→ Response added to footprints array
→ currentFootprint updated to new footprint
→ localStorage updated for consistency
→ All components re-render with new data
```

### 3. Importing Data
```
User uploads CSV in ImportData
→ Data parsed and validated
→ Calls createFootprint() or updateFootprint()
→ Context updates state
→ Dashboard, Reports, AI Insights all see new data automatically
```

### 4. AI Operations (ConversationalDataEntry)
```
User: "We used 5000 kWh of electricity last month"
→ ConversationalDataEntry sends message with full context
→ AI receives currentFootprint data (scope1, scope2, scope3, total)
→ AI understands existing emissions baseline
→ AI extracts: 5000 kWh = ~2.5 tCO2e Scope 2 emissions
→ AI proposes: "Add 2.5 tCO2e to Scope 2 emissions"
→ User confirms change
→ updateFootprint() called through unified context
→ All components (Dashboard, Reports, AIInsights) instantly see new total
→ User sees live preview update in real-time
```

**AI Context Benefits:**
- AI knows current emissions baseline (prevents duplicate entries)
- AI can suggest additions vs. replacements intelligently
- AI can detect anomalies (e.g., "That's 10x your current usage")
- AI maintains conversation history with full data context
- Updates propagate to entire app instantly

## Benefits

### ✅ Single Source of Truth
- No more conflicting data between components
- All components always display the same information
- Changes propagate automatically

### ✅ Simplified Component Logic
- Components don't need individual API calls
- No duplicate loading/error handling
- Cleaner, more maintainable code

### ✅ Better Performance
- Data fetched once, shared everywhere
- Reduces unnecessary API calls
- Optimized re-rendering

### ✅ Consistent UX
- Loading states unified across app
- Error handling centralized
- Better user feedback

### ✅ Offline/Demo Support
- Automatic localStorage fallback
- Works without backend for demos
- Seamless transition between online/offline

## API Endpoints Used

All accessed through `carbonService.ts`:

- `GET /api/v1/carbon/footprints/` - List all footprints
- `GET /api/v1/carbon/footprints/:id/` - Get single footprint
- `POST /api/v1/carbon/footprints/` - Create new footprint
- `PATCH /api/v1/carbon/footprints/:id/` - Update footprint
- `DELETE /api/v1/carbon/footprints/:id/` - Delete footprint

All requests include:
- Bearer token authentication
- Content-Type: application/json
- Error handling with user-friendly messages

## localStorage Schema

For demo/offline mode, footprints stored as:

```json
{
  "carbonFootprint": {
    "id": "1",
    "reportingPeriod": "2024-Q1",
    "scope1": 125.5,
    "scope2": 230.8,
    "scope3": 450.2,
    "total": 806.5,
    "companyName": "Demo Company",
    "status": "draft",
    "createdAt": "2024-10-06T12:00:00Z"
  }
}
```

## Migration Guide for Existing Components

### Before (Old Way)
```tsx
const [footprints, setFootprints] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadData = async () => {
    try {
      const data = await carbonService.getFootprints();
      setFootprints(data);
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };
  loadData();
}, []);
```

### After (New Way)
```tsx
const { footprints, currentFootprint, isLoading } = useCarbonFootprint();

// Data automatically loaded, no useEffect needed!
```

## Testing the Unified System

### Manual Test Flow
1. **Login** → Footprints load automatically
2. **Go to Dashboard** → See currentFootprint metrics
3. **Create New Footprint** → All views update
4. **Import CSV** → Data merges into currentFootprint
5. **Run AI Analysis** → Works with currentFootprint
6. **View History** → See all past footprints
7. **Generate Report** → Uses currentFootprint
8. **Logout** → Data cleared properly

### Expected Behavior
- ✅ Same data displayed everywhere
- ✅ Changes propagate instantly
- ✅ No API 401 errors (auth tokens work)
- ✅ No 404 errors (correct endpoints)
- ✅ Loading spinners show consistently
- ✅ Errors displayed to user appropriately

## Production Checklist

Before deploying:

- [x] CarbonFootprintContext created
- [x] Integrated into App.tsx
- [x] Dashboard updated to use context
- [x] AIInsights updated to use context
- [x] CarbonCalculator updated to use context
- [x] Reports updated to use context
- [x] All API endpoints use correct URLs
- [x] All API calls include auth headers
- [x] localStorage fallback implemented
- [x] Error handling implemented
- [x] Loading states implemented
- [ ] ImportData updated to use context (optional - works with current implementation)
- [ ] ConversationalDataEntry updated to use context (optional - AI feature)
- [ ] Full end-to-end testing completed
- [ ] Multi-user isolation tested

## Future Enhancements

1. **Real-time Sync**: WebSocket updates when data changes
2. **Optimistic Updates**: Update UI before API confirms
3. **Caching Strategy**: Cache footprints for offline use
4. **Diff Tracking**: Show what changed between updates
5. **Version History**: Audit trail of all changes
6. **Batch Operations**: Update multiple footprints at once
7. **Export/Import**: Bulk transfer of footprint history

## Support

For questions or issues:
- Check console logs (prefixed with 🔍, ✅, ❌, 📊)
- Review error messages in context state
- Verify auth token in localStorage
- Confirm API endpoints match backend routes

---

**Last Updated**: October 6, 2025
**Status**: ✅ Context Created - Components Migration In Progress
