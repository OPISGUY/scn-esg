# AI Services Configuration - Render Deployment

## ✅ Completed Local Updates

### 1. API Key and Model Updated
- **API Key**: Set in `.env` file (not committed to Git)
- **Model**: `gemini-2.5-flash-lite-preview-09-2025`

### 2. Code Updates
- ✅ Updated `backend/carbon/ai_services.py` - GeminiAIService class
- ✅ Updated `backend/compliance/ai_services.py` - CSRDAIService and ComplianceAIService classes
- ✅ Updated `backend/carbon/ai_views.py` - ai_validate_emission_data to use latest footprint
- ✅ Restored real API calls in `src/components/AIInsights.tsx`
- ✅ Created `.env` file in backend folder with new API key

### 3. Local Testing Results
```
✅ PASS - Gemini Connection
✅ PASS - AI Validator
✅ PASS - AI Benchmarking
✅ PASS - Action Plan Generator

Total: 4/4 tests passed
🎉 All AI services are working correctly with the new Gemini API!
```

## 🚀 Render Production Deployment Steps

### Step 1: Set Environment Variable on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Navigate to your backend service: `scn-esg-backend`
3. Click on **"Environment"** in the left sidebar
4. Add or update the environment variable:
   ```
   Key: GOOGLE_AI_API_KEY
   Value: [Your API key from the local .env file]
   ```
5. Click **"Save Changes"**

### Step 2: Deploy Updated Code

Option A - **Automatic Deploy (Recommended)**:
1. Push code to GitHub main branch
2. Render will automatically deploy the changes

Option B - **Manual Deploy**:
1. In Render dashboard, click **"Manual Deploy"**
2. Select **"Deploy latest commit"**

### Step 3: Verify Deployment

Once deployed, verify AI services are working:

```bash
# Test the validation endpoint
curl -X POST https://scn-esg-backend.onrender.com/api/v1/carbon/ai/validate/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'

# Test the benchmark endpoint  
curl -X GET https://scn-esg-backend.onrender.com/api/v1/carbon/ai/benchmark/ \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test the action plan endpoint
curl -X POST https://scn-esg-backend.onrender.com/api/v1/carbon/ai/action-plan/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Step 4: Test in Frontend

1. Navigate to your deployed frontend: https://your-frontend-url.vercel.app
2. Login with demo credentials: `demo@scn.com` / `Demo1234!`
3. Click on **"AI Insights"** tab
4. Test each tab:
   - **Data Validation** - Should show real AI validation results
   - **Benchmark** - Should show real industry benchmarking
   - **Action Plan** - Should generate real AI action plans

## 🔍 Troubleshooting

### Issue: "AI service error" or 503 errors
**Solution**: 
- Check Render logs: `render logs --tail 100`
- Verify `GOOGLE_AI_API_KEY` is set correctly
- Ensure the API key has proper permissions in Google Cloud Console

### Issue: "No carbon footprint data found"
**Solution**:
- Create a carbon footprint first using the Carbon Calculator
- Or the API will automatically use the most recent footprint for the user's company

### Issue: "Model not found" errors
**Solution**:
- Verify the model name is correct: `gemini-2.5-flash-lite-preview-09-2025`
- Check if the model is available in your Google AI Studio region
- Try falling back to `gemini-1.5-flash` if the preview model is unavailable

## 📊 Expected AI Responses

### Validation Tab
- **Validation Score**: 0-100 based on data quality
- **Anomalies**: Array of detected issues with severity levels (low/medium/high)
- **Data Quality Issues**: List of improvements needed
- **Recommendations**: AI-generated suggestions for better data

### Benchmark Tab
- **Percentile Ranking**: Your company's position (0-100)
- **Industry Average**: Average emissions for your industry
- **Performance vs Average**: % difference from industry average
- **Improvement Opportunities**: Specific AI recommendations

### Action Plan Tab
- **Quick Wins**: Low-cost, fast-implementation actions (3 months)
- **Medium-Term**: Moderate cost and timeline actions (12-18 months)
- **Long-Term**: Strategic initiatives (24-36 months)
- Each includes: action description, CO2 reduction estimate, cost level, timeline

## 📝 API Rate Limits

The AI endpoints have rate limits configured:
- **Validation**: 50 requests/hour per user
- **Benchmark**: 20 requests/hour per user (cached for 6 hours)
- **Action Plan**: 10 requests/hour per user
- **Predictions**: 5 requests/hour per user

## 🔐 Security Notes

- API key is stored as environment variable (never in code)
- All AI endpoints require authentication (`IsAuthenticated` permission)
- Rate limiting prevents abuse
- Error messages don't expose API key details

## 📈 Monitoring

Monitor AI service usage in Render logs:
```
"Gemini AI service initialized successfully with gemini-2.5-flash-lite-preview-09-2025"
"AI validation completed"
"AI benchmarking completed"
"AI action plan generated"
```

Watch for errors:
```
"Failed to configure Gemini AI"
"AI validation error"
"Gemini AI call failed"
```

---

**Last Updated**: October 4, 2025
**Status**: ✅ Ready for production deployment
**Next Step**: Set `GOOGLE_AI_API_KEY` on Render and deploy
