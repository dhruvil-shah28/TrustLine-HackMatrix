import jsPDF from 'jspdf';

export interface CaseExportData {
  caseCode: string;
  title: string;
  severity: string;
  status: string;
  assignedInvestigator: string;
  createdAt: string;
  summary: string;
  alerts: Array<{
    alertCode: string;
    title: string;
    severity: string;
    riskExplanation: string;
    detectionMethod: string;
    signals: Array<{ title: string; evidenceCategory: string; observedValue: string }>;
  }>;
  evidenceItems: Array<{
    title: string;
    evidenceType: string;
    contentJson: string;
  }>;
  auditLogs: Array<{
    actorName: string;
    action: string;
    timestamp: string;
    details: string;
  }>;
}

export function exportCaseReportPDF(data: CaseExportData) {
  const doc = new jsPDF();

  // Header Banner
  doc.setFillColor(15, 23, 42); // Navy background
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('HACKMATRIX 5.0 - FINANCIAL CRIME DOSSIER', 14, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text(`CONFIDENTIAL EVIDENCE PACKAGE | CASE: ${data.caseCode}`, 14, 24);

  // Metadata Table
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');

  let y = 42;
  doc.text(`Case Title: ${data.title}`, 14, y);
  y += 7;
  doc.text(`Severity: ${data.severity.toUpperCase()}   |   Status: ${data.status}   |   Investigator: ${data.assignedInvestigator}`, 14, y);
  y += 7;
  doc.text(`Date Generated: ${new Date().toLocaleString()}`, 14, y);

  y += 10;
  doc.setLineWidth(0.5);
  doc.setDrawColor(226, 232, 240);
  doc.line(14, y, 196, y);

  // Executive Summary
  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Executive Risk & Anomaly Summary', 14, y);

  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  const splitSummary = doc.splitTextToSize(data.summary, 180);
  doc.text(splitSummary, 14, y);
  y += splitSummary.length * 6 + 6;

  // Alerts & Signals
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Connected Risk Alerts & Evidence Signals', 14, y);
  y += 8;

  data.alerts.forEach((alt, idx) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(225, 29, 72); // Rose accent for alerts
    doc.text(`Alert ${idx + 1}: ${alt.alertCode} - ${alt.title} [${alt.severity}]`, 14, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    const splitExp = doc.splitTextToSize(`Explanation: ${alt.riskExplanation}`, 178);
    doc.text(splitExp, 16, y);
    y += splitExp.length * 5 + 4;

    alt.signals.forEach((sig) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(`• [${sig.evidenceCategory}] ${sig.title}: ${sig.observedValue}`, 20, y);
      y += 5;
    });
    y += 4;
  });

  // Evidence Package Summary
  if (y > 240) {
    doc.addPage();
    y = 20;
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Recorded Case Evidence Items', 14, y);
  y += 8;

  data.evidenceItems.forEach((item) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text(`- ${item.title} (${item.evidenceType})`, 16, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    const contentPreview = item.contentJson.slice(0, 120) + '...';
    doc.text(`  Data: ${contentPreview}`, 18, y);
    y += 6;
  });

  // Footer / Disclaimer
  y += 10;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, y, 196, y);
  y += 7;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('DISCLAIMER: This document is an automatically compiled investigative evidence package for AML compliance review. It represents risk signals and intelligence analysis, not a final legal conclusion or criminal finding.', 14, y, { maxWidth: 180 });

  doc.save(`${data.caseCode}_Evidence_Report.pdf`);
}

export function exportCaseJSON(data: CaseExportData) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.caseCode}_Evidence_Export.json`;
  a.click();
  URL.revokeObjectURL(url);
}
