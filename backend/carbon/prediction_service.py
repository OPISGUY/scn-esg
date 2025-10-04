"""
Phase 3: Intelligent Assistance - Prediction Service
Provides predictive analytics and smart recommendations for carbon footprint data entry.

Features:
- Predict next values based on historical patterns
- Detect seasonal usage patterns
- Calculate year-over-year growth trends
- Provide confidence intervals
- Smart recommendations with context awareness
"""

import logging
import statistics
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from decimal import Decimal
from django.db.models import Avg, Count, Q, Sum
from django.utils import timezone

logger = logging.getLogger(__name__)


class PredictionService:
    """
    Predictive analytics service for carbon footprint data.
    
    Uses statistical analysis and pattern detection to predict future values
    and provide intelligent recommendations for data entry.
    """
    
    # Minimum data points required for reliable predictions
    MIN_DATA_POINTS = 3
    
    # Activity type to scope mapping
    ACTIVITY_SCOPES = {
        'electricity': 2,
        'natural_gas': 1,
        'gasoline': 1,
        'diesel': 1,
        'fuel_oil': 1,
        'business_travel': 3,
        'commuting': 3,
        'purchased_goods': 3,
    }
    
    def __init__(self):
        """Initialize the prediction service."""
        self.logger = logger
    
    def predict_next_value(
        self,
        company_id: str,
        activity_type: str,
        target_period: str,
        historical_data: Optional[List[Dict]] = None
    ) -> Dict:
        """
        Predict the next value for a given activity based on historical patterns.
        
        Args:
            company_id: UUID of the company
            activity_type: Type of activity (electricity, fuel, etc.)
            target_period: Target period in YYYY-MM format
            historical_data: Optional pre-fetched historical data
        
        Returns:
            dict: {
                'predicted_value': float,
                'confidence': float (0-1),
                'confidence_interval': {'lower': float, 'upper': float},
                'prediction_method': str,
                'reasoning': str,
                'historical_avg': float,
                'seasonal_factor': float,
                'growth_factor': float
            }
        """
        try:
            # Fetch historical data if not provided
            if historical_data is None:
                historical_data = self._fetch_historical_data(
                    company_id, activity_type, lookback_months=12
                )
            
            # Check if we have enough data
            if len(historical_data) < self.MIN_DATA_POINTS:
                return self._insufficient_data_response(historical_data)
            
            # Parse target period
            target_date = datetime.strptime(target_period, '%Y-%m')
            target_month = target_date.month
            
            # Calculate components
            historical_avg = self._calculate_average(historical_data)
            seasonal_factor = self._calculate_seasonal_factor(
                historical_data, target_month
            )
            growth_factor = self._calculate_growth_trend(historical_data)
            
            # Make prediction
            predicted_value = historical_avg * seasonal_factor * (1 + growth_factor)
            
            # Calculate confidence based on data consistency
            confidence = self._calculate_confidence(historical_data)
            
            # Calculate confidence interval (±15% for moderate confidence)
            interval_width = predicted_value * (0.15 / confidence) if confidence > 0 else 0.3
            confidence_interval = {
                'lower': max(0, predicted_value - interval_width),
                'upper': predicted_value + interval_width
            }
            
            # Generate reasoning
            reasoning = self._generate_prediction_reasoning(
                activity_type,
                target_month,
                historical_avg,
                seasonal_factor,
                growth_factor,
                len(historical_data)
            )
            
            return {
                'success': True,
                'predicted_value': round(predicted_value, 2),
                'confidence': round(confidence, 2),
                'confidence_interval': {
                    'lower': round(confidence_interval['lower'], 2),
                    'upper': round(confidence_interval['upper'], 2)
                },
                'prediction_method': 'seasonal_growth_adjusted',
                'reasoning': reasoning,
                'historical_avg': round(historical_avg, 2),
                'seasonal_factor': round(seasonal_factor, 3),
                'growth_factor': round(growth_factor, 3),
                'data_points_used': len(historical_data)
            }
            
        except Exception as e:
            self.logger.error(f"Prediction error: {str(e)}", exc_info=True)
            return {
                'success': False,
                'error': str(e),
                'predicted_value': None
            }
    
    def detect_seasonal_patterns(
        self,
        company_id: str,
        activity_type: str
    ) -> Dict:
        """
        Analyze historical data to detect seasonal usage patterns.
        
        Args:
            company_id: UUID of the company
            activity_type: Type of activity
        
        Returns:
            dict: {
                'has_seasonal_pattern': bool,
                'peak_months': list,
                'low_months': list,
                'monthly_factors': dict,
                'pattern_strength': float (0-1),
                'pattern_description': str
            }
        """
        try:
            # Fetch 24 months of data for better seasonal analysis
            historical_data = self._fetch_historical_data(
                company_id, activity_type, lookback_months=24
            )
            
            if len(historical_data) < 6:
                return {
                    'success': True,
                    'has_seasonal_pattern': False,
                    'message': 'Insufficient data for seasonal analysis (need 6+ months)'
                }
            
            # Group by month of year
            monthly_averages = self._calculate_monthly_averages(historical_data)
            
            # Calculate variation coefficient
            overall_avg = statistics.mean(monthly_averages.values())
            std_dev = statistics.stdev(monthly_averages.values()) if len(monthly_averages) > 1 else 0
            variation_coefficient = std_dev / overall_avg if overall_avg > 0 else 0
            
            # Determine if pattern is significant (>20% variation)
            has_pattern = variation_coefficient > 0.2
            pattern_strength = min(variation_coefficient, 1.0)
            
            # Identify peak and low months
            sorted_months = sorted(monthly_averages.items(), key=lambda x: x[1])
            low_months = [m for m, _ in sorted_months[:3]]
            peak_months = [m for m, _ in sorted_months[-3:]]
            
            # Calculate monthly factors (relative to average)
            monthly_factors = {
                month: round(value / overall_avg, 3) if overall_avg > 0 else 1.0
                for month, value in monthly_averages.items()
            }
            
            # Generate pattern description
            pattern_desc = self._describe_seasonal_pattern(
                activity_type, peak_months, low_months, has_pattern
            )
            
            return {
                'success': True,
                'has_seasonal_pattern': has_pattern,
                'peak_months': peak_months,
                'low_months': low_months,
                'monthly_factors': monthly_factors,
                'pattern_strength': round(pattern_strength, 2),
                'pattern_description': pattern_desc,
                'data_points_analyzed': len(historical_data)
            }
            
        except Exception as e:
            self.logger.error(f"Seasonal analysis error: {str(e)}", exc_info=True)
            return {
                'success': False,
                'error': str(e)
            }
    
    def calculate_growth_trend(
        self,
        company_id: str,
        activity_type: Optional[str] = None
    ) -> Dict:
        """
        Calculate year-over-year growth trend.
        
        Args:
            company_id: UUID of the company
            activity_type: Optional activity type (if None, calculates for total emissions)
        
        Returns:
            dict: {
                'growth_rate': float,  # Annual growth rate as decimal
                'trend_direction': str,  # 'increasing', 'decreasing', 'stable'
                'is_significant': bool,
                'confidence': float,
                'reasoning': str,
                'monthly_growth_rates': list
            }
        """
        try:
            # Fetch historical data
            historical_data = self._fetch_historical_data(
                company_id, activity_type, lookback_months=24
            )
            
            if len(historical_data) < 6:
                return {
                    'success': True,
                    'growth_rate': 0.0,
                    'trend_direction': 'unknown',
                    'is_significant': False,
                    'message': 'Insufficient data for trend analysis'
                }
            
            # Calculate month-over-month growth rates
            monthly_growth = self._calculate_monthly_growth(historical_data)
            
            # Calculate average annual growth rate
            if monthly_growth:
                avg_monthly_growth = statistics.mean(monthly_growth)
                annual_growth = (1 + avg_monthly_growth) ** 12 - 1
            else:
                annual_growth = 0.0
            
            # Determine trend direction
            if abs(annual_growth) < 0.05:  # < 5% change
                trend_direction = 'stable'
            elif annual_growth > 0:
                trend_direction = 'increasing'
            else:
                trend_direction = 'decreasing'
            
            # Check if trend is significant (>10% annual change)
            is_significant = abs(annual_growth) > 0.10
            
            # Calculate confidence based on consistency of growth rates
            confidence = self._calculate_trend_confidence(monthly_growth)
            
            # Generate reasoning
            reasoning = self._generate_trend_reasoning(
                activity_type, annual_growth, trend_direction, is_significant
            )
            
            return {
                'success': True,
                'growth_rate': round(annual_growth, 3),
                'trend_direction': trend_direction,
                'is_significant': is_significant,
                'confidence': round(confidence, 2),
                'reasoning': reasoning,
                'monthly_growth_rates': [round(g, 4) for g in monthly_growth],
                'data_points_analyzed': len(historical_data)
            }
            
        except Exception as e:
            self.logger.error(f"Growth trend error: {str(e)}", exc_info=True)
            return {
                'success': False,
                'error': str(e)
            }
    
    # ==================== Private Helper Methods ====================
    
    def _fetch_historical_data(
        self,
        company_id: str,
        activity_type: Optional[str],
        lookback_months: int = 12
    ) -> List[Dict]:
        """
        Fetch historical footprint data for prediction.
        
        Returns list of dicts with 'period' (YYYY-MM) and 'value' (float)
        """
        from carbon.models import CarbonFootprint
        
        # Calculate cutoff date
        cutoff_date = timezone.now() - timedelta(days=lookback_months * 30)
        
        # Fetch footprints
        footprints = CarbonFootprint.objects.filter(
            company_id=company_id,
            reporting_period__gte=cutoff_date
        ).order_by('reporting_period')
        
        # Extract values based on activity type
        historical_data = []
        for fp in footprints:
            if activity_type:
                # Map activity type to scope
                scope = self.ACTIVITY_SCOPES.get(activity_type, 2)
                value = float(getattr(fp, f'scope{scope}_emissions', 0))
            else:
                # Total emissions
                value = float(fp.total_emissions)
            
            historical_data.append({
                'period': fp.reporting_period.strftime('%Y-%m'),
                'value': value,
                'date': fp.reporting_period
            })
        
        return historical_data
    
    def _calculate_average(self, data: List[Dict]) -> float:
        """Calculate average value from historical data."""
        if not data:
            return 0.0
        values = [d['value'] for d in data]
        return statistics.mean(values)
    
    def _calculate_seasonal_factor(
        self,
        data: List[Dict],
        target_month: int
    ) -> float:
        """
        Calculate seasonal adjustment factor for target month.
        Returns multiplier (1.0 = average, >1.0 = above average, <1.0 = below average)
        """
        if len(data) < 3:
            return 1.0
        
        # Filter data for same month in previous years
        same_month_data = [
            d['value'] for d in data
            if d['date'].month == target_month
        ]
        
        if not same_month_data:
            return 1.0
        
        # Calculate average for this month vs overall average
        month_avg = statistics.mean(same_month_data)
        overall_avg = self._calculate_average(data)
        
        if overall_avg == 0:
            return 1.0
        
        return month_avg / overall_avg
    
    def _calculate_growth_trend(self, data: List[Dict]) -> float:
        """
        Calculate growth trend as annual growth rate.
        Returns growth rate as decimal (0.05 = 5% annual growth)
        """
        if len(data) < 2:
            return 0.0
        
        # Sort by date
        sorted_data = sorted(data, key=lambda x: x['date'])
        
        # Calculate linear regression slope
        try:
            # Simple approach: compare first half to second half
            mid_point = len(sorted_data) // 2
            first_half_avg = statistics.mean([d['value'] for d in sorted_data[:mid_point]])
            second_half_avg = statistics.mean([d['value'] for d in sorted_data[mid_point:]])
            
            if first_half_avg == 0:
                return 0.0
            
            # Calculate growth rate
            growth = (second_half_avg - first_half_avg) / first_half_avg
            
            # Annualize (assume data covers ~6 months per half)
            months_per_period = len(sorted_data) / 2
            annual_growth = growth * (12 / months_per_period) if months_per_period > 0 else 0
            
            return annual_growth
        except Exception as e:
            self.logger.warning(f"Growth calculation failed: {e}")
            return 0.0
    
    def _calculate_confidence(self, data: List[Dict]) -> float:
        """
        Calculate prediction confidence based on data consistency.
        Returns value between 0 and 1 (1 = high confidence)
        """
        if len(data) < 2:
            return 0.3
        
        values = [d['value'] for d in data]
        
        # Calculate coefficient of variation
        avg = statistics.mean(values)
        if avg == 0:
            return 0.5
        
        std_dev = statistics.stdev(values) if len(values) > 1 else 0
        cv = std_dev / avg
        
        # Convert to confidence (lower CV = higher confidence)
        # CV of 0.2 (20% std dev) = 0.8 confidence
        # CV of 0.5 (50% std dev) = 0.5 confidence
        confidence = max(0.3, min(1.0, 1.0 - cv))
        
        # Bonus for more data points
        data_bonus = min(0.1, len(data) / 100)
        
        return min(1.0, confidence + data_bonus)
    
    def _calculate_monthly_averages(self, data: List[Dict]) -> Dict[int, float]:
        """Calculate average value for each month (1-12)."""
        monthly_data = {m: [] for m in range(1, 13)}
        
        for entry in data:
            month = entry['date'].month
            monthly_data[month].append(entry['value'])
        
        # Calculate averages
        monthly_averages = {}
        for month, values in monthly_data.items():
            if values:
                monthly_averages[month] = statistics.mean(values)
        
        return monthly_averages
    
    def _calculate_monthly_growth(self, data: List[Dict]) -> List[float]:
        """Calculate month-over-month growth rates."""
        if len(data) < 2:
            return []
        
        sorted_data = sorted(data, key=lambda x: x['date'])
        growth_rates = []
        
        for i in range(1, len(sorted_data)):
            prev_value = sorted_data[i-1]['value']
            curr_value = sorted_data[i]['value']
            
            if prev_value > 0:
                growth = (curr_value - prev_value) / prev_value
                growth_rates.append(growth)
        
        return growth_rates
    
    def _calculate_trend_confidence(self, monthly_growth: List[float]) -> float:
        """Calculate confidence in growth trend."""
        if len(monthly_growth) < 2:
            return 0.3
        
        # Check consistency of growth direction
        positive_count = sum(1 for g in monthly_growth if g > 0)
        consistency = abs(positive_count / len(monthly_growth) - 0.5) * 2
        
        # Check variance
        std_dev = statistics.stdev(monthly_growth) if len(monthly_growth) > 1 else 1.0
        variance_factor = max(0, 1 - std_dev)
        
        confidence = (consistency * 0.6 + variance_factor * 0.4)
        return max(0.3, min(1.0, confidence))
    
    def _insufficient_data_response(self, data: List[Dict]) -> Dict:
        """Return response when insufficient data for prediction."""
        return {
            'success': True,
            'predicted_value': None,
            'confidence': 0.0,
            'message': f'Insufficient historical data (need {self.MIN_DATA_POINTS}+, have {len(data)})',
            'suggestion': 'Enter more historical data to enable predictions'
        }
    
    def _generate_prediction_reasoning(
        self,
        activity_type: str,
        target_month: int,
        historical_avg: float,
        seasonal_factor: float,
        growth_factor: float,
        data_points: int
    ) -> str:
        """Generate human-readable reasoning for prediction."""
        month_name = datetime(2000, target_month, 1).strftime('%B')
        
        reasoning_parts = []
        reasoning_parts.append(f"Based on {data_points} months of historical data")
        
        if activity_type:
            reasoning_parts.append(f"for {activity_type.replace('_', ' ')}")
        
        reasoning_parts.append(f"Historical average: {historical_avg:.2f}")
        
        if abs(seasonal_factor - 1.0) > 0.1:
            if seasonal_factor > 1.0:
                reasoning_parts.append(
                    f"{month_name} is typically {(seasonal_factor - 1) * 100:.0f}% above average"
                )
            else:
                reasoning_parts.append(
                    f"{month_name} is typically {(1 - seasonal_factor) * 100:.0f}% below average"
                )
        
        if abs(growth_factor) > 0.05:
            if growth_factor > 0:
                reasoning_parts.append(f"Usage is growing at {growth_factor * 100:.1f}% annually")
            else:
                reasoning_parts.append(f"Usage is decreasing at {abs(growth_factor) * 100:.1f}% annually")
        
        return ". ".join(reasoning_parts) + "."
    
    def _describe_seasonal_pattern(
        self,
        activity_type: str,
        peak_months: List[int],
        low_months: List[int],
        has_pattern: bool
    ) -> str:
        """Generate description of seasonal pattern."""
        if not has_pattern:
            return "No significant seasonal pattern detected."
        
        month_names = lambda months: ", ".join([
            datetime(2000, m, 1).strftime('%B') for m in months
        ])
        
        activity_name = activity_type.replace('_', ' ') if activity_type else "usage"
        
        desc = f"Your {activity_name} shows seasonal variation. "
        desc += f"Peak months: {month_names(peak_months)}. "
        desc += f"Low months: {month_names(low_months)}."
        
        return desc
    
    def _generate_trend_reasoning(
        self,
        activity_type: Optional[str],
        growth_rate: float,
        direction: str,
        is_significant: bool
    ) -> str:
        """Generate reasoning for growth trend."""
        activity_name = activity_type.replace('_', ' ') if activity_type else "emissions"
        
        if direction == 'stable':
            return f"Your {activity_name} has remained relatively stable over time."
        
        change_pct = abs(growth_rate) * 100
        
        if direction == 'increasing':
            reasoning = f"Your {activity_name} is increasing at {change_pct:.1f}% annually."
            if is_significant:
                reasoning += " This is a significant upward trend that may require attention."
        else:
            reasoning = f"Your {activity_name} is decreasing at {change_pct:.1f}% annually."
            if is_significant:
                reasoning += " Great work on reducing emissions!"
        
        return reasoning
