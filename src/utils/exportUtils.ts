import { CarbonFootprintData } from '../services/carbonService';

export const exportToCSV = (footprints: CarbonFootprintData[], filename: string = 'carbon-footprints') => {
  if (footprints.length === 0) {
    alert('No data to export');
    return;
  }

  // CSV headers
  const headers = [
    'ID',
    'Reporting Period',
    'Scope 1 (tCO₂e)',
    'Scope 2 (tCO₂e)',
    'Scope 3 (tCO₂e)',
    'Total (tCO₂e)',
    'Status',
    'Created Date',
    'Verified Date'
  ];

  // Convert footprints to CSV rows
  const rows = footprints.map(fp => [
    fp.id || '',
    fp.reporting_period || '',
    fp.scope1_emissions.toFixed(2),
    fp.scope2_emissions.toFixed(2),
    fp.scope3_emissions.toFixed(2),
    (fp.total_emissions || 0).toFixed(2),
    fp.status || 'draft',
    fp.created_at ? new Date(fp.created_at).toLocaleDateString() : '',
    fp.verified_at ? new Date(fp.verified_at).toLocaleDateString() : ''
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportDetailedReport = (
  footprints: CarbonFootprintData[],
  companyName: string,
  filename: string = 'detailed-emissions-report'
) => {
  if (footprints.length === 0) {
    alert('No data to export');
    return;
  }

  const sortedFootprints = [...footprints].sort((a, b) => 
    new Date(a.reporting_period).getTime() - new Date(b.reporting_period).getTime()
  );

  const lines: string[] = [];
  
  // Report header
  lines.push(`Detailed Carbon Emissions Report`);
  lines.push(`Company: ${companyName}`);
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push(`Total Records: ${footprints.length}`);
  lines.push('');
  lines.push('='.repeat(80));
  lines.push('');

  // Summary statistics
  const totalEmissions = sortedFootprints.reduce((sum, fp) => sum + (fp.total_emissions || 0), 0);
  const avgEmissions = totalEmissions / footprints.length;
  const latestFootprint = sortedFootprints[sortedFootprints.length - 1];

  lines.push('SUMMARY STATISTICS');
  lines.push('='.repeat(80));
  lines.push(`Total Cumulative Emissions: ${totalEmissions.toFixed(2)} tCO₂e`);
  lines.push(`Average per Period: ${avgEmissions.toFixed(2)} tCO₂e`);
  lines.push(`Latest Period: ${latestFootprint.reporting_period}`);
  lines.push(`Latest Total: ${(latestFootprint.total_emissions || 0).toFixed(2)} tCO₂e`);
  lines.push('');
  lines.push('='.repeat(80));
  lines.push('');

  // Detailed records
  lines.push('DETAILED EMISSIONS BY PERIOD');
  lines.push('='.repeat(80));
  lines.push('');

  sortedFootprints.forEach((fp, index) => {
    lines.push(`Record ${index + 1}: ${fp.reporting_period}`);
    lines.push(`  Status: ${fp.status || 'draft'}`);
    lines.push(`  Scope 1 (Direct): ${fp.scope1_emissions.toFixed(2)} tCO₂e`);
    lines.push(`  Scope 2 (Electricity): ${fp.scope2_emissions.toFixed(2)} tCO₂e`);
    lines.push(`  Scope 3 (Indirect): ${fp.scope3_emissions.toFixed(2)} tCO₂e`);
    lines.push(`  Total: ${(fp.total_emissions || 0).toFixed(2)} tCO₂e`);
    lines.push(`  Created: ${fp.created_at ? new Date(fp.created_at).toLocaleString() : 'N/A'}`);
    if (fp.verified_at) {
      lines.push(`  Verified: ${new Date(fp.verified_at).toLocaleString()}`);
    }
    lines.push('');
    lines.push('-'.repeat(80));
    lines.push('');
  });

  // Trend analysis (if multiple records)
  if (sortedFootprints.length > 1) {
    const firstTotal = sortedFootprints[0].total_emissions || 0;
    const lastTotal = sortedFootprints[sortedFootprints.length - 1].total_emissions || 0;
    const change = lastTotal - firstTotal;
    const percentChange = firstTotal > 0 ? ((change / firstTotal) * 100) : 0;

    lines.push('TREND ANALYSIS');
    lines.push('='.repeat(80));
    lines.push(`First Period: ${sortedFootprints[0].reporting_period} - ${firstTotal.toFixed(2)} tCO₂e`);
    lines.push(`Latest Period: ${sortedFootprints[sortedFootprints.length - 1].reporting_period} - ${lastTotal.toFixed(2)} tCO₂e`);
    lines.push(`Change: ${change > 0 ? '+' : ''}${change.toFixed(2)} tCO₂e (${percentChange > 0 ? '+' : ''}${percentChange.toFixed(1)}%)`);
    lines.push('');
  }

  lines.push('='.repeat(80));
  lines.push('End of Report');

  // Create and download
  const content = lines.join('\n');
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.txt`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
