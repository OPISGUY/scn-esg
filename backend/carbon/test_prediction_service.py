"""
Comprehensive tests for PredictionService - Phase 3 Week 1
Tests prediction algorithms, seasonal pattern detection, and growth trend analysis
"""
from datetime import datetime, timedelta
from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from companies.models import Company
from carbon.models import CarbonFootprint
from carbon.prediction_service import PredictionService

User = get_user_model()


class TestPredictionService(TestCase):
    """Test suite for PredictionService prediction algorithms"""
    
    def setUp(self):
        """Set up test data with predictable patterns"""
        # Create test user and company
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            name='Test User'
        )
        self.company = Company.objects.create(
            name='Test Company',
            industry='Technology',
            employee_count=50
        )
        self.company.users.add(self.user)
        
        # Create prediction service
        self.service = PredictionService()
        
        # Create test footprint data with seasonal patterns
        # Summer months (June-Aug): Higher electricity usage (+20%)
        # Winter months (Dec-Feb): Lower electricity usage (-15%)
        # Growing trend: +5% per month
        
        base_date = datetime(2023, 1, 1)
        base_value = Decimal('100.00')
        
        self.historical_data = []
        
        for month_offset in range(12):
            period_date = base_date + timedelta(days=30 * month_offset)
            month = period_date.month
            
            # Apply seasonal factor
            if month in [6, 7, 8]:  # Summer
                seasonal_factor = 1.20
            elif month in [12, 1, 2]:  # Winter
                seasonal_factor = 0.85
            else:
                seasonal_factor = 1.0
            
            # Apply growth trend (5% per month)
            growth_factor = 1.0 + (0.05 * month_offset)
            
            value = base_value * Decimal(str(seasonal_factor * growth_factor))
            
            footprint = CarbonFootprint.objects.create(
                company=self.company,
                reporting_period=period_date,
                scope1_emissions=value if month % 2 == 0 else Decimal('0'),
                scope2_emissions=value if month % 2 != 0 else Decimal('0'),
                scope3_emissions=Decimal('50.00'),
                status='verified'
            )
            
            self.historical_data.append({
                'date': period_date,
                'value': value,
                'footprint': footprint
            })
    
    def test_predict_next_value_basic(self):
        """Test basic prediction with sufficient data"""
        target_date = datetime(2023, 12, 1)
        
        result = self.service.predict_next_value(
            company_id=self.company.id,
            activity_type='electricity',
            target_period=target_date
        )
        
        # Validate response structure
        self.assertTrue(result['success'])
        self.assertIsNotNone(result['predicted_value'])
        self.assertIsNotNone(result['confidence_score'])
        self.assertIsNotNone(result['confidence_interval'])
        self.assertIsNotNone(result['reasoning'])
        
        # Validate predicted value is positive
        self.assertGreater(float(result['predicted_value']), 0)
        
        # Validate confidence score is between 0 and 1
        self.assertGreaterEqual(result['confidence_score'], 0.0)
        self.assertLessEqual(result['confidence_score'], 1.0)
        
        # Validate confidence interval
        self.assertLess(
            result['confidence_interval']['lower'],
            result['predicted_value']
        )
        self.assertGreater(
            result['confidence_interval']['upper'],
            result['predicted_value']
        )
    
    def test_predict_next_value_insufficient_data(self):
        """Test prediction with less than 3 data points"""
        # Create new company with only 2 data points
        new_company = Company.objects.create(
            name='New Company',
            industry='Manufacturing'
        )
        
        for i in range(2):
            CarbonFootprint.objects.create(
                company=new_company,
                reporting_period=datetime(2023, i + 1, 1),
                scope2_emissions=Decimal('50.00'),
                status='verified'
            )
        
        result = self.service.predict_next_value(
            company_id=new_company.id,
            activity_type='electricity',
            target_period=datetime(2023, 4, 1)
        )
        
        # Should return graceful failure response
        self.assertFalse(result['success'])
        self.assertIsNone(result['predicted_value'])
        self.assertIn('insufficient', result['message'].lower())
    
    def test_predict_next_value_no_data(self):
        """Test prediction with no historical data"""
        empty_company = Company.objects.create(
            name='Empty Company',
            industry='Retail'
        )
        
        result = self.service.predict_next_value(
            company_id=empty_company.id,
            activity_type='electricity',
            target_period=datetime(2023, 12, 1)
        )
        
        self.assertFalse(result['success'])
        self.assertIsNone(result['predicted_value'])
        self.assertEqual(result['data_points_used'], 0)
    
    def test_predict_seasonal_summer_increase(self):
        """Test seasonal pattern detection shows summer increase"""
        result = self.service.predict_next_value(
            company_id=self.company.id,
            activity_type='electricity',
            target_period=datetime(2024, 7, 1)  # July (summer)
        )
        
        # Summer should have higher seasonal factor
        self.assertTrue(result['success'])
        self.assertIsNotNone(result['seasonal_factor'])
        self.assertGreater(result['seasonal_factor'], 1.0)
    
    def test_predict_seasonal_winter_decrease(self):
        """Test seasonal pattern detection shows winter decrease"""
        result = self.service.predict_next_value(
            company_id=self.company.id,
            activity_type='electricity',
            target_period=datetime(2024, 1, 1)  # January (winter)
        )
        
        # Winter should have lower seasonal factor
        self.assertTrue(result['success'])
        self.assertIsNotNone(result['seasonal_factor'])
        self.assertLess(result['seasonal_factor'], 1.0)
    
    def test_predict_with_growth_trend(self):
        """Test prediction incorporates growth trend"""
        result = self.service.predict_next_value(
            company_id=self.company.id,
            activity_type='electricity',
            target_period=datetime(2024, 6, 1)
        )
        
        # Should have positive growth factor
        self.assertTrue(result['success'])
        self.assertIsNotNone(result['growth_factor'])
        self.assertGreater(result['growth_factor'], 1.0)
    
    def test_detect_seasonal_patterns_basic(self):
        """Test seasonal pattern detection with sufficient data"""
        result = self.service.detect_seasonal_patterns(
            company_id=self.company.id,
            activity_type='electricity'
        )
        
        # Validate response structure
        self.assertTrue(result['success'])
        self.assertTrue(result['pattern_detected'])
        self.assertIsNotNone(result['pattern_description'])
        self.assertIsNotNone(result['monthly_factors'])
        self.assertIsNotNone(result['peak_month'])
        self.assertIsNotNone(result['low_month'])
        self.assertIsNotNone(result['pattern_strength'])
        
        # Should have 12 monthly factors
        self.assertEqual(len(result['monthly_factors']), 12)
        
        # Pattern strength should be between 0 and 1
        self.assertGreaterEqual(result['pattern_strength'], 0.0)
        self.assertLessEqual(result['pattern_strength'], 1.0)
        
        # Peak month should be summer (June, July, or August)
        self.assertIn(result['peak_month'], ['June', 'July', 'August'])
        
        # Low month should be winter (December, January, or February)
        self.assertIn(result['low_month'], ['December', 'January', 'February'])
    
    def test_detect_seasonal_patterns_insufficient_data(self):
        """Test seasonal pattern detection with insufficient data"""
        new_company = Company.objects.create(
            name='Minimal Data Company',
            industry='Services'
        )
        
        # Only 2 months of data
        for i in range(2):
            CarbonFootprint.objects.create(
                company=new_company,
                reporting_period=datetime(2023, i + 1, 1),
                scope2_emissions=Decimal('75.00'),
                status='verified'
            )
        
        result = self.service.detect_seasonal_patterns(
            company_id=new_company.id,
            activity_type='electricity'
        )
        
        self.assertFalse(result['success'])
        self.assertFalse(result['pattern_detected'])
    
    def test_calculate_growth_trend_basic(self):
        """Test growth trend calculation with increasing data"""
        result = self.service.calculate_growth_trend(
            company_id=self.company.id,
            activity_type='electricity'
        )
        
        # Validate response structure
        self.assertTrue(result['success'])
        self.assertIsNotNone(result['annual_growth_rate'])
        self.assertIsNotNone(result['trend_direction'])
        self.assertIsNotNone(result['trend_significance'])
        self.assertIsNotNone(result['trend_confidence'])
        self.assertIsNotNone(result['reasoning'])
        
        # Should detect increasing trend (we built 5% monthly growth into test data)
        self.assertEqual(result['trend_direction'], 'increasing')
        
        # Annual growth rate should be positive
        self.assertGreater(result['annual_growth_rate'], 0)
        
        # Confidence should be between 0 and 1
        self.assertGreaterEqual(result['trend_confidence'], 0.0)
        self.assertLessEqual(result['trend_confidence'], 1.0)
    
    def test_calculate_growth_trend_stable(self):
        """Test growth trend detection with stable data"""
        stable_company = Company.objects.create(
            name='Stable Company',
            industry='Finance'
        )
        
        # Create 12 months of stable data
        for i in range(12):
            CarbonFootprint.objects.create(
                company=stable_company,
                reporting_period=datetime(2023, i + 1, 1),
                scope2_emissions=Decimal('100.00'),  # Constant value
                status='verified'
            )
        
        result = self.service.calculate_growth_trend(
            company_id=stable_company.id,
            activity_type='electricity'
        )
        
        # Should detect stable trend
        self.assertTrue(result['success'])
        self.assertEqual(result['trend_direction'], 'stable')
        
        # Annual growth should be near zero
        self.assertLess(abs(result['annual_growth_rate']), 15.0)  # Within ±15%
    
    def test_calculate_growth_trend_decreasing(self):
        """Test growth trend detection with decreasing data"""
        declining_company = Company.objects.create(
            name='Declining Company',
            industry='Logistics'
        )
        
        # Create 12 months of declining data (-5% per month)
        for i in range(12):
            value = Decimal('200.00') * Decimal(str(0.95 ** i))
            CarbonFootprint.objects.create(
                company=declining_company,
                reporting_period=datetime(2023, i + 1, 1),
                scope1_emissions=value,
                status='verified'
            )
        
        result = self.service.calculate_growth_trend(
            company_id=declining_company.id,
            activity_type='gasoline'
        )
        
        # Should detect decreasing trend
        self.assertTrue(result['success'])
        self.assertEqual(result['trend_direction'], 'decreasing')
        
        # Annual growth should be negative
        self.assertLess(result['annual_growth_rate'], 0)
    
    def test_activity_scope_mapping(self):
        """Test that activity types correctly map to scopes"""
        # Test Scope 2 activity (electricity)
        result_scope2 = self.service.predict_next_value(
            company_id=self.company.id,
            activity_type='electricity',
            target_period=datetime(2023, 12, 1)
        )
        self.assertTrue(result_scope2['success'])
        
        # Test Scope 1 activity (gasoline)
        result_scope1 = self.service.predict_next_value(
            company_id=self.company.id,
            activity_type='gasoline',
            target_period=datetime(2023, 12, 1)
        )
        self.assertTrue(result_scope1['success'])
    
    def test_confidence_score_high_with_stable_data(self):
        """Test confidence score is high with low variance data"""
        consistent_company = Company.objects.create(
            name='Consistent Company',
            industry='Education'
        )
        
        # Create very consistent data (low variance = high confidence)
        for i in range(12):
            value = Decimal('150.00') + Decimal(str(i * 0.5))  # Very small variation
            CarbonFootprint.objects.create(
                company=consistent_company,
                reporting_period=datetime(2023, i + 1, 1),
                scope2_emissions=value,
                status='verified'
            )
        
        result = self.service.predict_next_value(
            company_id=consistent_company.id,
            activity_type='electricity',
            target_period=datetime(2024, 1, 1)
        )
        
        # High consistency should yield high confidence
        self.assertTrue(result['success'])
        self.assertGreater(result['confidence_score'], 0.6)
    
    def test_confidence_score_low_with_volatile_data(self):
        """Test confidence score is lower with high variance data"""
        volatile_company = Company.objects.create(
            name='Volatile Company',
            industry='Events'
        )
        
        # Create volatile data (high variance = lower confidence)
        import random
        random.seed(42)
        for i in range(12):
            # Random values between 50 and 250
            value = Decimal(str(random.uniform(50, 250)))
            CarbonFootprint.objects.create(
                company=volatile_company,
                reporting_period=datetime(2023, i + 1, 1),
                scope2_emissions=value,
                status='verified'
            )
        
        result = self.service.predict_next_value(
            company_id=volatile_company.id,
            activity_type='electricity',
            target_period=datetime(2024, 1, 1)
        )
        
        # High volatility should yield lower confidence
        self.assertTrue(result['success'])
        self.assertLess(result['confidence_score'], 0.9)
    
    def test_prediction_with_specific_footprint_id(self):
        """Test prediction scoped to specific footprint"""
        # Create a second footprint for different scope
        specific_footprint = CarbonFootprint.objects.create(
            company=self.company,
            reporting_period=datetime(2023, 6, 1),
            scope1_emissions=Decimal('500.00'),
            status='verified'
        )
        
        result = self.service.predict_next_value(
            company_id=self.company.id,
            activity_type='gasoline',
            target_period=datetime(2023, 12, 1),
            footprint_id=specific_footprint.id
        )
        
        # Should successfully scope to specific footprint
        self.assertTrue(result['success'])
        self.assertIsNotNone(result['predicted_value'])
    
    def test_edge_case_extreme_values(self):
        """Test handling of extreme emission values"""
        extreme_company = Company.objects.create(
            name='Extreme Company',
            industry='Heavy Industry'
        )
        
        # Create data with extreme values
        CarbonFootprint.objects.create(
            company=extreme_company,
            reporting_period=datetime(2023, 1, 1),
            scope1_emissions=Decimal('10000.00'),
            status='verified'
        )
        CarbonFootprint.objects.create(
            company=extreme_company,
            reporting_period=datetime(2023, 2, 1),
            scope1_emissions=Decimal('10500.00'),
            status='verified'
        )
        CarbonFootprint.objects.create(
            company=extreme_company,
            reporting_period=datetime(2023, 3, 1),
            scope1_emissions=Decimal('9800.00'),
            status='verified'
        )
        
        result = self.service.predict_next_value(
            company_id=extreme_company.id,
            activity_type='manufacturing',
            target_period=datetime(2023, 4, 1)
        )
        
        # Should handle extreme values without crashing
        self.assertTrue(result['success'])
        self.assertGreater(result['predicted_value'], Decimal('0'))
    
    def test_monthly_factors_sum_to_twelve(self):
        """Test that seasonal factors properly normalize across 12 months"""
        result = self.service.detect_seasonal_patterns(
            company_id=self.company.id,
            activity_type='electricity'
        )
        
        if result['pattern_detected'] and result['monthly_factors']:
            # Sum of factors should be close to 12 (average = 1.0)
            total_factor = sum(m['factor'] for m in result['monthly_factors'])
            self.assertAlmostEqual(total_factor, 12.0, delta=1.0)
    
    def test_reasoning_contains_methodology(self):
        """Test that reasoning field explains prediction methodology"""
        result = self.service.predict_next_value(
            company_id=self.company.id,
            activity_type='electricity',
            target_period=datetime(2024, 6, 1)
        )
        
        self.assertTrue(result['success'])
        reasoning = result['reasoning'].lower()
        
        # Should mention key concepts
        self.assertTrue(
            'historical' in reasoning or 
            'average' in reasoning or 
            'data' in reasoning
        )

