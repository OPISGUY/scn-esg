#!/usr/bin/env python3

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'scn_esg_platform.settings')
django.setup()

from compliance.models import ESRSDatapointCatalog

# Comprehensive ESRS datapoints for a more complete demo
comprehensive_datapoints = [
    # ESRS E1 - Climate Change
    {
        'id': 'ESRS_E1_1',
        'name': 'Transition plan for climate change mitigation',
        'description': 'General information about the transition plan for climate change mitigation',
        'standard': 'ESRS E1',
        'section': 'Strategy',
        'disclosure_requirement': 'E1-1',
        'category': 'Environment',
        'data_type': 'narrative',
        'mandatory': True,
        'ai_guidance': 'Describe your organization\'s transition plan to achieve climate neutrality, including targets, actions, and timelines.'
    },
    {
        'id': 'ESRS_E1_2',
        'name': 'Policies related to climate change mitigation and adaptation',
        'description': 'Information about policies adopted to manage climate-related impacts, risks and opportunities',
        'standard': 'ESRS E1',
        'section': 'Governance',
        'disclosure_requirement': 'E1-2',
        'category': 'Environment',
        'data_type': 'narrative',
        'mandatory': True,
        'ai_guidance': 'Detail your climate-related policies, including governance structures and implementation processes.'
    },
    {
        'id': 'ESRS_E1_3',
        'name': 'Actions and resources related to climate change policies',
        'description': 'Information about actions taken and resources allocated to implement climate change policies',
        'standard': 'ESRS E1',
        'section': 'Strategy',
        'disclosure_requirement': 'E1-3',
        'category': 'Environment',
        'data_type': 'narrative',
        'mandatory': True,
        'ai_guidance': 'Describe specific actions taken and resources allocated to implement your climate policies.'
    },
    {
        'id': 'ESRS_E1_4',
        'name': 'Targets related to climate change mitigation and adaptation',
        'description': 'Information about targets set by the undertaking to address climate change mitigation and adaptation',
        'standard': 'ESRS E1',
        'section': 'Targets',
        'disclosure_requirement': 'E1-4',
        'category': 'Environment',
        'data_type': 'quantitative',
        'unit': 'tCO2e, %',
        'mandatory': True,
        'ai_guidance': 'Set measurable targets for emissions reduction, renewable energy adoption, and climate adaptation measures.'
    },
    {
        'id': 'ESRS_E1_5',
        'name': 'Energy consumption and mix',
        'description': 'Information about energy consumption and the energy mix',
        'standard': 'ESRS E1',
        'section': 'Metrics',
        'disclosure_requirement': 'E1-5',
        'category': 'Environment',
        'data_type': 'quantitative',
        'unit': 'MWh, %',
        'mandatory': True,
        'ai_guidance': 'Report total energy consumption by source, including renewable vs non-renewable energy breakdown.'
    },
    {
        'id': 'ESRS_E1_6',
        'name': 'Gross Scopes 1, 2, 3 and Total GHG emissions',
        'description': 'Gross GHG emissions in metric tonnes of CO2 equivalent',
        'standard': 'ESRS E1',
        'section': 'Metrics',
        'disclosure_requirement': 'E1-6',
        'category': 'Environment',
        'data_type': 'quantitative',
        'unit': 'tCO2e',
        'mandatory': True,
        'ai_guidance': 'Calculate and report GHG emissions following GHG Protocol Corporate Standard for all three scopes.'
    },
    {
        'id': 'ESRS_E1_7',
        'name': 'GHG removals and GHG mitigation projects',
        'description': 'Information about GHG removals and mitigation projects financed through carbon credits',
        'standard': 'ESRS E1',
        'section': 'Metrics',
        'disclosure_requirement': 'E1-7',
        'category': 'Environment',
        'data_type': 'quantitative',
        'unit': 'tCO2e',
        'mandatory': False,
        'ai_guidance': 'Report carbon removals and offsets, distinguishing between different types and verification standards.'
    },
    
    # ESRS E2 - Pollution
    {
        'id': 'ESRS_E2_1',
        'name': 'Policies related to pollution',
        'description': 'Information about policies to prevent or control pollution',
        'standard': 'ESRS E2',
        'section': 'Governance',
        'disclosure_requirement': 'E2-1',
        'category': 'Environment',
        'data_type': 'narrative',
        'mandatory': True,
        'ai_guidance': 'Describe policies for preventing air, water, and soil pollution, including chemical management.'
    },
    {
        'id': 'ESRS_E2_4',
        'name': 'Pollution-related targets',
        'description': 'Information about targets related to pollution prevention and control',
        'standard': 'ESRS E2',
        'section': 'Targets',
        'disclosure_requirement': 'E2-4',
        'category': 'Environment',
        'data_type': 'quantitative',
        'unit': 'Various',
        'mandatory': True,
        'ai_guidance': 'Set targets for reducing pollutant emissions to air, water, and soil.'
    },
    {
        'id': 'ESRS_E2_5',
        'name': 'Pollutants to air',
        'description': 'Information about emissions of pollutants to air',
        'standard': 'ESRS E2',
        'section': 'Metrics',
        'disclosure_requirement': 'E2-5',
        'category': 'Environment',
        'data_type': 'quantitative',
        'unit': 'tonnes',
        'mandatory': True,
        'ai_guidance': 'Report emissions of key air pollutants including NOx, SO2, PM, and others.'
    },
    
    # ESRS E3 - Water and Marine Resources
    {
        'id': 'ESRS_E3_1',
        'name': 'Policies related to water and marine resources',
        'description': 'Information about policies related to water and marine resources',
        'standard': 'ESRS E3',
        'section': 'Governance',
        'disclosure_requirement': 'E3-1',
        'category': 'Environment',
        'data_type': 'narrative',
        'mandatory': True,
        'ai_guidance': 'Describe policies for water stewardship and marine resource protection.'
    },
    {
        'id': 'ESRS_E3_4',
        'name': 'Water consumption',
        'description': 'Information about water consumption',
        'standard': 'ESRS E3',
        'section': 'Metrics',
        'disclosure_requirement': 'E3-4',
        'category': 'Environment',
        'data_type': 'quantitative',
        'unit': 'm³',
        'mandatory': True,
        'ai_guidance': 'Report total water consumption and withdrawal by source, including recycled water.'
    },
    
    # ESRS E4 - Biodiversity and Ecosystems
    {
        'id': 'ESRS_E4_1',
        'name': 'Policies related to biodiversity and ecosystems',
        'description': 'Information about policies related to biodiversity and ecosystems',
        'standard': 'ESRS E4',
        'section': 'Governance',
        'disclosure_requirement': 'E4-1',
        'category': 'Environment',
        'data_type': 'narrative',
        'mandatory': True,
        'ai_guidance': 'Describe policies for protecting biodiversity and managing ecosystem impacts.'
    },
    
    # ESRS E5 - Circular Economy
    {
        'id': 'ESRS_E5_1',
        'name': 'Policies related to circular economy',
        'description': 'Information about policies related to circular economy',
        'standard': 'ESRS E5',
        'section': 'Governance',
        'disclosure_requirement': 'E5-1',
        'category': 'Environment',
        'data_type': 'narrative',
        'mandatory': True,
        'ai_guidance': 'Describe policies for waste prevention, circular design, and resource efficiency.'
    },
    {
        'id': 'ESRS_E5_5',
        'name': 'Resource inflows',
        'description': 'Information about resource inflows including material footprint',
        'standard': 'ESRS E5',
        'section': 'Metrics',
        'disclosure_requirement': 'E5-5',
        'category': 'Environment',
        'data_type': 'quantitative',
        'unit': 'tonnes',
        'mandatory': True,
        'ai_guidance': 'Report materials used by type, including renewable vs non-renewable materials.'
    },
    {
        'id': 'ESRS_E5_6',
        'name': 'Resource outflows',
        'description': 'Information about resource outflows including waste',
        'standard': 'ESRS E5',
        'section': 'Metrics',
        'disclosure_requirement': 'E5-6',
        'category': 'Environment',
        'data_type': 'quantitative',
        'unit': 'tonnes',
        'mandatory': True,
        'ai_guidance': 'Report waste generated by type and disposal method, including recycling rates.'
    },
    
    # ESRS S1 - Own Workforce
    {
        'id': 'ESRS_S1_1',
        'name': 'Policies related to own workforce',
        'description': 'Information about policies related to own workforce',
        'standard': 'ESRS S1',
        'section': 'Governance',
        'disclosure_requirement': 'S1-1',
        'category': 'Social',
        'data_type': 'narrative',
        'mandatory': True,
        'ai_guidance': 'Describe policies for employee rights, diversity, health and safety, and development.'
    },
    {
        'id': 'ESRS_S1_6',
        'name': 'Characteristics of the undertaking\'s employees',
        'description': 'Information about the characteristics of employees',
        'standard': 'ESRS S1',
        'section': 'Metrics',
        'disclosure_requirement': 'S1-6',
        'category': 'Social',
        'data_type': 'quantitative',
        'unit': 'Number, %',
        'mandatory': True,
        'ai_guidance': 'Report employee demographics including gender, age, employment type, and geographic distribution.'
    },
    {
        'id': 'ESRS_S1_11',
        'name': 'Social protection',
        'description': 'Information about social protection for employees',
        'standard': 'ESRS S1',
        'section': 'Metrics',
        'disclosure_requirement': 'S1-11',
        'category': 'Social',
        'data_type': 'narrative',
        'mandatory': True,
        'ai_guidance': 'Describe social protection measures including benefits, pension schemes, and support programs.'
    },
    {
        'id': 'ESRS_S1_14',
        'name': 'Health and safety metrics',
        'description': 'Information about health and safety performance',
        'standard': 'ESRS S1',
        'section': 'Metrics',
        'disclosure_requirement': 'S1-14',
        'category': 'Social',
        'data_type': 'quantitative',
        'unit': 'Number, Rate',
        'mandatory': True,
        'ai_guidance': 'Report workplace injury rates, occupational disease rates, and fatality statistics.'
    },
    
    # ESRS S2 - Workers in the Value Chain
    {
        'id': 'ESRS_S2_1',
        'name': 'Policies related to value chain workers',
        'description': 'Information about policies related to value chain workers',
        'standard': 'ESRS S2',
        'section': 'Governance',
        'disclosure_requirement': 'S2-1',
        'category': 'Social',
        'data_type': 'narrative',
        'mandatory': True,
        'ai_guidance': 'Describe policies for protecting workers in your supply chain and value network.'
    },
    
    # ESRS S3 - Affected Communities
    {
        'id': 'ESRS_S3_1',
        'name': 'Policies related to affected communities',
        'description': 'Information about policies related to affected communities',
        'standard': 'ESRS S3',
        'section': 'Governance',
        'disclosure_requirement': 'S3-1',
        'category': 'Social',
        'data_type': 'narrative',
        'mandatory': True,
        'ai_guidance': 'Describe policies for managing impacts on local communities and stakeholder engagement.'
    },
    
    # ESRS S4 - Consumers and End-users
    {
        'id': 'ESRS_S4_1',
        'name': 'Policies related to consumers and end-users',
        'description': 'Information about policies related to consumers and end-users',
        'standard': 'ESRS S4',
        'section': 'Governance',
        'disclosure_requirement': 'S4-1',
        'category': 'Social',
        'data_type': 'narrative',
        'mandatory': True,
        'ai_guidance': 'Describe policies for product safety, data protection, and consumer rights.'
    },
    
    # ESRS G1 - Business Conduct
    {
        'id': 'ESRS_G1_1',
        'name': 'Business conduct policies and corporate culture',
        'description': 'Information about business conduct policies and corporate culture',
        'standard': 'ESRS G1',
        'section': 'Strategy',
        'disclosure_requirement': 'G1-1',
        'category': 'Governance',
        'data_type': 'narrative',
        'mandatory': True,
        'ai_guidance': 'Describe policies and culture related to business ethics, anti-corruption, and compliance.'
    },
    {
        'id': 'ESRS_G1_4',
        'name': 'Incidents of corruption or bribery',
        'description': 'Information about incidents of corruption or bribery',
        'standard': 'ESRS G1',
        'section': 'Metrics',
        'disclosure_requirement': 'G1-4',
        'category': 'Governance',
        'data_type': 'quantitative',
        'unit': 'Number',
        'mandatory': True,
        'ai_guidance': 'Report any confirmed incidents of corruption, bribery, or other business conduct violations.'
    },
    {
        'id': 'ESRS_G1_5',
        'name': 'Political influence and lobbying activities',
        'description': 'Information about political influence and lobbying activities',
        'standard': 'ESRS G1',
        'section': 'Metrics',
        'disclosure_requirement': 'G1-5',
        'category': 'Governance',
        'data_type': 'quantitative',
        'unit': 'EUR',
        'mandatory': False,
        'ai_guidance': 'Report political contributions and lobbying expenditures with transparency on positions taken.'
    }
]

def populate_esrs_datapoints():
    """Populate the database with comprehensive ESRS datapoints"""
    print("Adding comprehensive ESRS datapoints...")
    
    created_count = 0
    updated_count = 0
    
    for datapoint in comprehensive_datapoints:
        # Use 'code' field instead of 'id' for ESRS identifier
        datapoint_data = datapoint.copy()
        code = datapoint_data.pop('id')  # Remove 'id' and use as 'code'
        datapoint_data['code'] = code
        
        dp, created = ESRSDatapointCatalog.objects.update_or_create(
            code=code,
            defaults=datapoint_data
        )
        
        if created:
            created_count += 1
            print(f"Created: {dp.code} - {dp.name}")
        else:
            updated_count += 1
            print(f"Updated: {dp.code} - {dp.name}")
    
    total_count = ESRSDatapointCatalog.objects.count()
    
    print(f"\nSummary:")
    print(f"- Created: {created_count}")
    print(f"- Updated: {updated_count}")
    print(f"- Total datapoints in database: {total_count}")
    
    return created_count, updated_count, total_count

if __name__ == "__main__":
    populate_esrs_datapoints()
