from django.core.management.base import BaseCommand
from notifications.models import NotificationTemplate


class Command(BaseCommand):
    help = 'Create default notification templates'

    def handle(self, *args, **options):
        templates = [
            {
                'name': 'Carbon Neutral Achievement',
                'notification_type': 'carbon_neutral_achieved',
                'subject_template': '🎉 Congratulations! {{ company_name }} is now Carbon Neutral!',
                'html_template': '''
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 30px; text-align: center;">
                        <h1 style="margin: 0; font-size: 28px;">🌍 Carbon Neutral Achievement! 🎉</h1>
                        <p style="margin: 10px 0 0; font-size: 18px;">{{ company_name }} has achieved carbon neutrality!</p>
                    </div>
                    <div style="padding: 30px; background: white;">
                        <h2 style="color: #166534;">Your Sustainability Impact</h2>
                        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p><strong>Total Emissions:</strong> {{ total_emissions|floatformat:1 }} tCO2e</p>
                            <p><strong>Carbon Offsets:</strong> {{ total_offsets|floatformat:1 }} tCO2e</p>
                            <p><strong>E-waste Credits:</strong> {{ ewaste_credits|floatformat:1 }} tCO2e</p>
                            <p><strong>Net Carbon Balance:</strong> <span style="color: #22c55e; font-weight: bold;">+{{ carbon_balance|floatformat:1 }} tCO2e</span></p>
                        </div>
                        <p>This is a significant milestone in your sustainability journey. You've successfully offset more carbon than you've emitted, making a positive impact on our planet!</p>
                        <p style="margin-top: 30px;">Keep up the excellent work!</p>
                        <p>Best regards,<br>The SCN ESG Platform Team</p>
                    </div>
                </body>
                </html>
                ''',
                'text_template': '''
                Congratulations! {{ company_name }} is now Carbon Neutral!
                
                Your Sustainability Impact:
                - Total Emissions: {{ total_emissions|floatformat:1 }} tCO2e
                - Carbon Offsets: {{ total_offsets|floatformat:1 }} tCO2e  
                - E-waste Credits: {{ ewaste_credits|floatformat:1 }} tCO2e
                - Net Carbon Balance: +{{ carbon_balance|floatformat:1 }} tCO2e
                
                This is a significant milestone in your sustainability journey!
                
                Best regards,
                The SCN ESG Platform Team
                '''
            },
            {
                'name': 'Milestone Reached',
                'notification_type': 'milestone_reached',
                'subject_template': '🎯 Milestone Achieved: {{ milestone_type }} - {{ company_name }}',
                'html_template': '''
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; padding: 30px; text-align: center;">
                        <h1 style="margin: 0; font-size: 28px;">🎯 Milestone Achievement!</h1>
                        <p style="margin: 10px 0 0; font-size: 18px;">{{ company_name }} has reached a new sustainability milestone!</p>
                    </div>
                    <div style="padding: 30px; background: white;">
                        <h2 style="color: #1e40af;">{{ milestone_type }}</h2>
                        <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p><strong>Target:</strong> {{ threshold_value|floatformat:1 }}</p>
                            <p><strong>Achieved:</strong> {{ current_value|floatformat:1 }}</p>
                            <p><strong>Date Achieved:</strong> {{ achieved_date|date:"F d, Y" }}</p>
                        </div>
                        <p>Congratulations on reaching this important sustainability milestone! Every step forward makes a difference in building a more sustainable future.</p>
                        <p style="margin-top: 30px;">Keep up the great work!</p>
                        <p>Best regards,<br>The SCN ESG Platform Team</p>
                    </div>
                </body>
                </html>
                ''',
                'text_template': '''
                Milestone Achievement: {{ milestone_type }}
                
                {{ company_name }} has reached a new sustainability milestone!
                
                Details:
                - Target: {{ threshold_value|floatformat:1 }}
                - Achieved: {{ current_value|floatformat:1 }}
                - Date: {{ achieved_date|date:"F d, Y" }}
                
                Congratulations on this important achievement!
                
                Best regards,
                The SCN ESG Platform Team
                '''
            },
            {
                'name': 'Monthly Summary',
                'notification_type': 'monthly_summary',
                'subject_template': '📊 Monthly Sustainability Report - {{ month }} - {{ company_name }}',
                'html_template': '''
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 30px; text-align: center;">
                        <h1 style="margin: 0; font-size: 28px;">📊 Monthly Sustainability Report</h1>
                        <p style="margin: 10px 0 0; font-size: 18px;">{{ month }} - {{ company_name }}</p>
                    </div>
                    <div style="padding: 30px; background: white;">
                        <h2 style="color: #7c3aed;">This Month's Performance</h2>
                        <div style="background: #faf5ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p><strong>Total Emissions:</strong> {{ current_month_data.emissions.total|floatformat:1 }} tCO2e</p>
                            <p><strong>Carbon Offsets:</strong> {{ current_month_data.offsets.total|floatformat:1 }} tCO2e</p>
                            <p><strong>Devices Donated:</strong> {{ current_month_data.ewaste.devices_donated }}</p>
                            <p><strong>Carbon Neutrality:</strong> {{ current_month_data.balance.neutrality_percentage|floatformat:1 }}%</p>
                        </div>
                        
                        {% if improvements %}
                        <h3 style="color: #7c3aed;">Month-over-Month Changes</h3>
                        <ul>
                        {% for key, improvement in improvements.items %}
                            <li style="color: {% if improvement.is_improvement %}#22c55e{% else %}#ef4444{% endif %};">
                                {{ improvement.direction|title }} by {{ improvement.percentage }}%
                            </li>
                        {% endfor %}
                        </ul>
                        {% endif %}
                        
                        {% if recommendations %}
                        <h3 style="color: #7c3aed;">Recommendations</h3>
                        <ul>
                        {% for recommendation in recommendations %}
                            <li>{{ recommendation }}</li>
                        {% endfor %}
                        </ul>
                        {% endif %}
                        
                        <p style="margin-top: 30px;">Visit your dashboard for detailed analytics and insights.</p>
                        <p>Best regards,<br>The SCN ESG Platform Team</p>
                    </div>
                </body>
                </html>
                ''',
                'text_template': '''
                Monthly Sustainability Report - {{ month }}
                {{ company_name }}
                
                This Month's Performance:
                - Total Emissions: {{ current_month_data.emissions.total|floatformat:1 }} tCO2e
                - Carbon Offsets: {{ current_month_data.offsets.total|floatformat:1 }} tCO2e
                - Devices Donated: {{ current_month_data.ewaste.devices_donated }}
                - Carbon Neutrality: {{ current_month_data.balance.neutrality_percentage|floatformat:1 }}%
                
                {% if recommendations %}
                Recommendations:
                {% for recommendation in recommendations %}
                - {{ recommendation }}
                {% endfor %}
                {% endif %}
                
                Visit your dashboard for detailed analytics.
                
                Best regards,
                The SCN ESG Platform Team
                '''
            },
            {
                'name': 'Milestone Achievement',
                'notification_type': 'milestone_achievement',
                'subject_template': '🎯 {{ company_name }} reached a new milestone!',
                'html_template': '''
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px; text-align: center;">
                        <h1 style="margin: 0; font-size: 28px;">🎯 Milestone Achieved!</h1>
                        <p style="margin: 10px 0 0; font-size: 18px;">{{ company_name }} has reached {{ milestone_type }}!</p>
                    </div>
                    <div style="padding: 30px; background: white;">
                        <h2 style="color: #1e40af;">Congratulations {{ user_name }}!</h2>
                        <p>We're excited to inform you that {{ company_name }} has achieved a significant sustainability milestone:</p>
                        <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                            <h3 style="margin: 0; color: #1e40af;">{{ milestone_type|title }}</h3>
                            <p style="margin: 10px 0 0; font-size: 16px;">Total Emissions: {{ data.total_emissions|floatformat:1 }} tCO2e</p>
                            <p style="margin: 5px 0 0; color: #6b7280;">Achieved on {{ achievement_date }}</p>
                        </div>
                        <p>This milestone represents your continued commitment to environmental sustainability and corporate responsibility.</p>
                        <p style="margin-top: 30px;">Keep up the great work on your sustainability journey!</p>
                        <p>Best regards,<br>The SCN ESG Platform Team</p>
                    </div>
                </body>
                </html>
                ''',
                'text_template': '''
                Milestone Achieved!
                
                Dear {{ user_name }},
                
                {{ company_name }} has reached {{ milestone_type }}!
                
                Details:
                - Milestone: {{ milestone_type|title }}
                - Total Emissions: {{ data.total_emissions|floatformat:1 }} tCO2e
                - Achieved on: {{ achievement_date }}
                
                This milestone represents your continued commitment to environmental sustainability.
                
                Best regards,
                The SCN ESG Platform Team
                '''
            }
        ]
        
        created_count = 0
        for template_data in templates:
            template, created = NotificationTemplate.objects.get_or_create(
                notification_type=template_data['notification_type'],
                defaults=template_data
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created template: {template.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Template already exists: {template.name}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} notification templates')
        )
