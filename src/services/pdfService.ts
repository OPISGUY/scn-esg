import jsPDF from 'jspdf';
import { CarbonFootprint, ImpactMetrics, CarbonBalance, EwasteEntry } from '../types';

export interface ReportData {
  companyName: string;
  reportingPeriod: { start: string; end: string };
  carbonFootprint: CarbonFootprint;
  carbonBalance: CarbonBalance;
  impactMetrics: ImpactMetrics;
  ewasteEntries: EwasteEntry[];
  generatedAt: string;
}

export class PDFReportService {
  private pdf: jsPDF;
  private pageHeight: number;
  private pageWidth: number;
  private currentY: number;
  private margin: number;

  constructor() {
    this.pdf = new jsPDF('p', 'mm', 'a4');
    this.pageHeight = this.pdf.internal.pageSize.height;
    this.pageWidth = this.pdf.internal.pageSize.width;
    this.currentY = 20;
    this.margin = 20;
  }

  async generateReport(data: ReportData): Promise<void> {
    try {
      // Validate required data
      if (!data) {
        throw new Error('No data provided for PDF generation');
      }
      
      // Provide defaults for missing data
      const reportData: ReportData = {
        companyName: data.companyName || 'Unknown Company',
        reportingPeriod: data.reportingPeriod || { start: '2024-01-01', end: '2024-12-31' },
        carbonFootprint: data.carbonFootprint || {
          scope1: 0,
          scope2: 0,
          scope3: 0,
          total: 0,
          breakdown: {}
        },
        carbonBalance: data.carbonBalance || {
          grossEmissions: 0,
          scnOffsets: 0,
          netEmissions: 0,
          neutralityPercentage: 0
        },
        impactMetrics: data.impactMetrics || {
          carbonSaved: 0,
          treesPlanted: 0,
          renewableEnergy: 0,
          wasteRecycled: 0
        },
        ewasteEntries: data.ewasteEntries || [],
        generatedAt: data.generatedAt || new Date().toISOString()
      };
      
      // Cover Page
      this.addCoverPage(reportData);
      
      // Executive Summary
      this.addNewPage();
      this.addExecutiveSummary(reportData);
      
      // Carbon Footprint Breakdown
      this.addNewPage();
      this.addCarbonFootprintSection(reportData);
      
      // Carbon Balance Sheet
      this.addNewPage();
      this.addCarbonBalanceSheet(reportData);
      
      // SCN Impact Summary
      this.addNewPage();
      this.addSCNImpactSummary(reportData);
      
      // Methodology & Compliance
      this.addNewPage();
      this.addMethodologySection();
      
      // Download the PDF
      this.pdf.save(`${reportData.companyName}-ESG-Report-${reportData.reportingPeriod.start}-${reportData.reportingPeriod.end}.pdf`);
    } catch (error) {
      console.error('Error generating PDF report:', error);
      throw new Error(`Failed to generate PDF report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private addCoverPage(data: ReportData): void {
    // SCN Logo placeholder (you can replace with actual logo)
    this.pdf.setFillColor(51, 65, 85); // slate-700
    this.pdf.rect(this.margin, 20, 40, 15, 'F');
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('SCN', this.margin + 18, 30);
    
    // Title
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFontSize(28);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('ESG IMPACT REPORT', this.margin, 70);
    
    // Company Name
    this.pdf.setFontSize(20);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(data.companyName, this.margin, 85);
    
    // Reporting Period
    this.pdf.setFontSize(16);
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.text(`Reporting Period: ${data.reportingPeriod.start} - ${data.reportingPeriod.end}`, this.margin, 100);
    
    // Generated Date
    this.pdf.setFontSize(12);
    this.pdf.text(`Generated: ${new Date(data.generatedAt).toLocaleDateString('en-GB')}`, this.margin, 115);
    
    // Key Metrics Box
    this.pdf.setDrawColor(34, 197, 94); // green-500
    this.pdf.setLineWidth(2);
    this.pdf.rect(this.margin, 140, this.pageWidth - 2 * this.margin, 80);
    
    this.pdf.setFontSize(16);
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('KEY METRICS AT A GLANCE', this.margin + 10, 155);
    
    // Key metrics
    const metrics = [
      `Total Carbon Footprint: ${data.carbonFootprint.total.toFixed(1)} tCO₂e`,
      `Net Emissions: ${data.carbonBalance.netEmissions.toFixed(1)} tCO₂e`,
      `Carbon Neutrality: ${data.carbonBalance.neutralityPercentage.toFixed(1)}%`,
      `E-waste Diverted: ${data.impactMetrics.eWasteDiverted} kg`,
      `Students Supported: ${data.impactMetrics.studentsSupported}`
    ];
    
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'normal');
    metrics.forEach((metric, index) => {
      this.pdf.text(metric, this.margin + 10, 170 + (index * 8));
    });
    
    // Compliance Statement
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.text('This report has been prepared in accordance with:', this.margin, 250);
    this.pdf.text('• GHG Protocol Corporate Accounting and Reporting Standard', this.margin, 260);
    this.pdf.text('• ISO 14064-1:2018 Greenhouse gases', this.margin, 268);
    this.pdf.text('• TCFD Recommendations', this.margin, 276);
  }

  private addExecutiveSummary(data: ReportData): void {
    this.addSectionHeader('EXECUTIVE SUMMARY');
    
    const summaryText = `This report presents the comprehensive Environmental, Social, and Governance (ESG) performance of ${data.companyName} for the period ${data.reportingPeriod.start} to ${data.reportingPeriod.end}.

Through our partnership with SCN (Social Climate Network), we have achieved significant progress in our sustainability journey:

CARBON PERFORMANCE:
• Total operational emissions: ${data.carbonFootprint.total.toFixed(1)} tCO₂e
• SCN-generated offsets applied: ${data.carbonBalance.scnOffsets.toFixed(1)} tCO₂e
• Net carbon position: ${data.carbonBalance.netEmissions.toFixed(1)} tCO₂e
• Carbon neutrality progress: ${data.carbonBalance.neutralityPercentage.toFixed(1)}%

CIRCULAR ECONOMY IMPACT:
• Electronic waste diverted from landfill: ${data.impactMetrics.eWasteDiverted} kg
• Devices successfully recycled and refurbished: ${data.impactMetrics.devicesRecycled}
• Carbon credits generated from e-waste: ${data.impactMetrics.carbonCreditsFromDonations.toFixed(1)} tCO₂e

SOCIAL VALUE CREATION:
• Students supported through digital inclusion programs: ${data.impactMetrics.studentsSupported}
• Community impact through device donations and skills training
• Contribution to closing the digital divide

This report demonstrates our commitment to transparent sustainability reporting and our progress toward becoming a net-zero, socially responsible organization.`;

    this.addWrappedText(summaryText, 12);
  }

  private addCarbonFootprintSection(data: ReportData): void {
    this.addSectionHeader('CARBON FOOTPRINT ANALYSIS');
    
    // GHG Protocol breakdown
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('GHG Protocol Scope Breakdown', this.margin, this.currentY);
    this.currentY += 15;
    
    // Table headers
    const tableY = this.currentY;
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Scope', this.margin, tableY);
    this.pdf.text('Description', this.margin + 30, tableY);
    this.pdf.text('Emissions (tCO₂e)', this.margin + 100, tableY);
    this.pdf.text('% of Total', this.margin + 140, tableY);
    
    // Table data
    const scopes = [
      {
        scope: 'Scope 1',
        description: 'Direct emissions from owned sources',
        emissions: data.carbonFootprint.scope1,
        percentage: (data.carbonFootprint.scope1 / data.carbonFootprint.total * 100).toFixed(1)
      },
      {
        scope: 'Scope 2',
        description: 'Indirect emissions from purchased energy',
        emissions: data.carbonFootprint.scope2,
        percentage: (data.carbonFootprint.scope2 / data.carbonFootprint.total * 100).toFixed(1)
      },
      {
        scope: 'Scope 3',
        description: 'Other indirect emissions',
        emissions: data.carbonFootprint.scope3,
        percentage: (data.carbonFootprint.scope3 / data.carbonFootprint.total * 100).toFixed(1)
      }
    ];
    
    this.pdf.setFont('helvetica', 'normal');
    scopes.forEach((scope, index) => {
      const y = tableY + 10 + (index * 8);
      this.pdf.text(scope.scope, this.margin, y);
      this.pdf.text(scope.description, this.margin + 30, y);
      this.pdf.text(scope.emissions.toFixed(1), this.margin + 100, y);
      this.pdf.text(`${scope.percentage}%`, this.margin + 140, y);
    });
    
    // Total row
    const totalY = tableY + 40;
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('TOTAL', this.margin, totalY);
    this.pdf.text(data.carbonFootprint.total.toFixed(1), this.margin + 100, totalY);
    this.pdf.text('100.0%', this.margin + 140, totalY);
    
    this.currentY = totalY + 20;
    
    // Methodology note
    this.addSubsectionHeader('Methodology & Data Quality');
    const methodologyText = `This carbon footprint has been calculated using the GHG Protocol Corporate Accounting and Reporting Standard. Emission factors are sourced from DEFRA (UK Government) 2024 conversion factors. Data collection covers all operational activities under the company's operational control.

Data Quality: All Scope 1 and 2 emissions are based on primary data (actual consumption records). Scope 3 emissions use a combination of primary data and industry averages where specific data is unavailable.`;

    this.addWrappedText(methodologyText, 10);
  }

  private addCarbonBalanceSheet(data: ReportData): void {
    this.addSectionHeader('CARBON BALANCE SHEET');
    
    // Validate data exists
    if (!data.carbonBalance) {
      this.addWrappedText('Carbon balance data not available', 14);
      this.currentY += 20;
      return;
    }
    
    // Default values for missing data
    const grossEmissions = data.carbonBalance.grossEmissions || 0;
    const scnOffsets = data.carbonBalance.scnOffsets || 0;
    const netEmissions = data.carbonBalance.netEmissions || 0;
    const neutralityPercentage = data.carbonBalance.neutralityPercentage || 0;
    
    // Balance sheet visual
    this.pdf.setDrawColor(200, 200, 200);
    this.pdf.setLineWidth(1);
    
    // Gross Emissions
    this.pdf.setFillColor(239, 68, 68); // red-500
    this.pdf.rect(this.margin, this.currentY, 50, 20, 'F');
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('GROSS EMISSIONS', this.margin + 2, this.currentY + 8);
    this.pdf.text(`${grossEmissions.toFixed(1)} tCO₂e`, this.margin + 2, this.currentY + 16);
    
    // Minus sign
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFontSize(20);
    this.pdf.text('−', this.margin + 60, this.currentY + 12);
    
    // SCN Offsets
    this.pdf.setFillColor(34, 197, 94); // green-500
    this.pdf.rect(this.margin + 80, this.currentY, 50, 20, 'F');
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('SCN OFFSETS', this.margin + 82, this.currentY + 8);
    this.pdf.text(`${scnOffsets.toFixed(1)} tCO₂e`, this.margin + 82, this.currentY + 16);
    
    // Equals sign
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFontSize(20);
    this.pdf.text('=', this.margin + 140, this.currentY + 12);
    
    // Net Emissions
    const netColor = netEmissions <= 0 ? [34, 197, 94] : [249, 115, 22]; // green or orange
    this.pdf.setFillColor(netColor[0], netColor[1], netColor[2]);
    this.pdf.rect(this.margin + 160, this.currentY, 50, 20, 'F');
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('NET EMISSIONS', this.margin + 162, this.currentY + 8);
    this.pdf.text(`${netEmissions.toFixed(1)} tCO₂e`, this.margin + 162, this.currentY + 16);
    
    this.currentY += 40;
    
    // Neutrality Progress
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(`Carbon Neutrality Progress: ${neutralityPercentage.toFixed(1)}%`, this.margin, this.currentY);
    
    // Progress bar
    this.currentY += 10;
    this.pdf.setDrawColor(200, 200, 200);
    this.pdf.setLineWidth(1);
    this.pdf.rect(this.margin, this.currentY, 150, 8);
    
    const progressWidth = Math.max(0, Math.min(150, (neutralityPercentage / 100) * 150));
    this.pdf.setFillColor(34, 197, 94);
    this.pdf.rect(this.margin, this.currentY, progressWidth, 8, 'F');
    
    this.currentY += 25;
    
    // Offset sources breakdown
    this.addSubsectionHeader('SCN Offset Sources');
    const offsetText = `The ${data.carbonBalance.scnOffsets.toFixed(1)} tCO₂e of offsets applied to your carbon balance come from:

• E-waste Recycling Credits: ${data.impactMetrics.carbonCreditsFromDonations.toFixed(1)} tCO₂e
  Generated from your donated electronic devices through certified recycling processes

• Premium Sequoia Tonnes: ${data.impactMetrics.sequoiaTonnesPurchased} tCO₂e
  Direct atmospheric CO₂ capture and permanent geological storage

• Community Impact Credits: Additional offsets from digital inclusion programs

All offsets are third-party verified and meet international standards including the Gold Standard and Verified Carbon Standard (VCS).`;

    this.addWrappedText(offsetText, 10);
  }

  private addSCNImpactSummary(data: ReportData): void {
    this.addSectionHeader('SCN PARTNERSHIP IMPACT');
    
    // E-waste Impact
    this.addSubsectionHeader('Circular Economy Contribution');
    
    // E-waste table
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    const tableY = this.currentY;
    this.pdf.text('Device Type', this.margin, tableY);
    this.pdf.text('Quantity', this.margin + 40, tableY);
    this.pdf.text('Weight (kg)', this.margin + 70, tableY);
    this.pdf.text('CO₂ Saved (tCO₂e)', this.margin + 110, tableY);
    this.pdf.text('Status', this.margin + 150, tableY);
    
    this.pdf.setFont('helvetica', 'normal');
    let yPos = tableY + 8;
    data.ewasteEntries.forEach(entry => {
      this.pdf.text(entry.deviceType, this.margin, yPos);
      this.pdf.text(entry.quantity.toString(), this.margin + 40, yPos);
      this.pdf.text(entry.weight.toString(), this.margin + 70, yPos);
      this.pdf.text((entry.estimatedCO2Saved / 1000).toFixed(2), this.margin + 110, yPos);
      this.pdf.text(entry.status.charAt(0).toUpperCase() + entry.status.slice(1), this.margin + 150, yPos);
      yPos += 8;
    });
    
    // Total row
    yPos += 5;
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('TOTAL', this.margin, yPos);
    this.pdf.text(data.ewasteEntries.reduce((sum, entry) => sum + entry.quantity, 0).toString(), this.margin + 40, yPos);
    this.pdf.text(data.impactMetrics.eWasteDiverted.toString(), this.margin + 70, yPos);
    this.pdf.text(data.impactMetrics.carbonCreditsFromDonations.toFixed(2), this.margin + 110, yPos);
    
    this.currentY = yPos + 20;
    
    // Social Impact
    this.addSubsectionHeader('Social Value Creation');
    const socialText = `Through our partnership with SCN, your organization has contributed to significant social value:

DIGITAL INCLUSION:
• ${data.impactMetrics.studentsSupported} students provided with refurbished devices
• Digital skills training programs supported
• Reduced digital divide in underserved communities

ENVIRONMENTAL EDUCATION:
• Awareness programs on sustainable technology use
• Training on proper e-waste disposal practices
• Community engagement on climate action

ECONOMIC IMPACT:
• Local job creation in refurbishment and repair services
• Support for social enterprises and community organizations
• Circular economy development in the region

This aligns with the UK Social Value Act 2012 and contributes to multiple UN Sustainable Development Goals (SDGs).`;

    this.addWrappedText(socialText, 10);
  }

  private addMethodologySection(): void {
    this.addSectionHeader('METHODOLOGY & COMPLIANCE');
    
    const methodologyText = `REPORTING STANDARDS COMPLIANCE:

This report has been prepared in accordance with:
• GHG Protocol Corporate Accounting and Reporting Standard
• ISO 14064-1:2018 Greenhouse gases — Part 1: Quantification and reporting
• Task Force on Climate-related Financial Disclosures (TCFD) recommendations
• UK Companies Act 2006 (Strategic Report and Directors' Report) Regulations 2013

ORGANIZATIONAL BOUNDARY:
Operational control approach has been used to define the organizational boundary. All facilities and operations under direct operational control are included.

OPERATIONAL BOUNDARY:
• Scope 1: All direct GHG emissions from sources owned or controlled
• Scope 2: Indirect GHG emissions from purchased electricity (location-based method)
• Scope 3: Selected categories of other indirect emissions (business travel, employee commuting, waste)

BASE YEAR:
Base year: 2024 (first year of comprehensive reporting)
Base year emissions will not be recalculated unless significant structural changes occur.

DATA QUALITY:
• Primary data used for all Scope 1 and 2 emissions
• Activity data collected monthly and aggregated annually
• Emission factors sourced from DEFRA 2024 conversion factors
• Third-party verification of carbon offset claims

OFFSET METHODOLOGY:
All carbon offsets applied meet the following criteria:
• Third-party verified to international standards (Gold Standard, VCS)
• Additional (would not have occurred without offset funding)
• Permanent (for sequestration projects) or with leakage safeguards
• Transparent tracking and registry systems

For questions about this methodology or to request additional information, please contact SCN's sustainability team.`;

    this.addWrappedText(methodologyText, 9);
    
    // Footer with contact information
    this.currentY = this.pageHeight - 30;
    this.pdf.setFontSize(8);
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.text('Generated by Verdant By SCN | hello@donatecomputers.uk | www.verdant.scn.com', this.margin, this.currentY);
  }

  private addNewPage(): void {
    this.pdf.addPage();
    this.currentY = 20;
  }

  private addSectionHeader(title: string): void {
    this.pdf.setFontSize(18);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(51, 65, 85); // slate-700
    this.pdf.text(title, this.margin, this.currentY);
    this.currentY += 15;
    
    // Underline
    this.pdf.setDrawColor(34, 197, 94); // green-500
    this.pdf.setLineWidth(2);
    this.pdf.line(this.margin, this.currentY - 5, this.pageWidth - this.margin, this.currentY - 5);
    this.currentY += 5;
  }

  private addSubsectionHeader(title: string): void {
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text(title, this.margin, this.currentY);
    this.currentY += 12;
  }

  private addWrappedText(text: string, fontSize: number = 10): void {
    this.pdf.setFontSize(fontSize);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(0, 0, 0);
    
    const lines = this.pdf.splitTextToSize(text, this.pageWidth - 2 * this.margin);
    lines.forEach((line: string) => {
      this.checkPageBreak();
      this.pdf.text(line, this.margin, this.currentY);
      this.currentY += fontSize * 0.4;
    });
    this.currentY += 10;
  }

  private checkPageBreak(requiredSpace: number = 20): void {
    if (this.currentY + requiredSpace > this.pageHeight - 30) {
      this.addNewPage();
    }
  }
}

export const pdfService = new PDFReportService();
