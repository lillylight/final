import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface AncestryDatum {
  region: string;
  percent: number;
}

function renderMarkdownTable(doc: jsPDF, lines: string[], pageWidth: number, startY: number): number {
  const headerLineIdx = lines.findIndex(l => l.trim().startsWith('|') && l.includes('---'));
  if (headerLineIdx < 1) return startY;
  const headerTitles = lines[headerLineIdx-1].split('|').map(s => s.trim()).filter(Boolean);
  const bodyLines = lines.slice(headerLineIdx+1).filter(l => l.trim().startsWith('|'));
  const body = bodyLines.map(row => row.split('|').map(s => s.trim()).filter(Boolean));
  autoTable(doc, {
    startY,
    margin: { left: 60, right: 60 },
    head: [headerTitles],
    body,
    styles: { font: 'helvetica', fontSize: 14, cellPadding: 12, halign: 'center', valign: 'middle', textColor: '#111', fillColor: [255, 255, 255] },
    headStyles: { fillColor: [235, 238, 245], textColor: '#111', fontStyle: 'bold', fontSize: 15 },
    tableLineColor: [200, 200, 200],
    tableLineWidth: 0.8,
    theme: 'grid',
  });
  return (doc as any).lastAutoTable?.finalY || (startY + 40);
}

function renderParagraphsWithBoldSpans(doc: jsPDF, paragraphs: string[], pageWidth: number, y: number, opts?: { fontSize?: number, color?: string, justify?: boolean }): number {
  const normalFontSize = opts?.fontSize || 15;
  const boldFontSize = normalFontSize - 2;
  const headingFontSize = normalFontSize - 1 + 1;
  const indent = 32;
  const marginBottom = 60;
  const pageBottom = 812 - marginBottom;
  for (let idx = 0; idx < paragraphs.length; idx++) {
    let para = paragraphs[idx].replace(/^[-•]\s*/, '');
    if (!para.trim()) { y += 18; continue; }
    const isHeadingLine = isHeading(para);
    const genericBoldMatch = para.match(/^(\s*)([A-Za-z0-9&'()\/-\s]+:)(.*)$/);
    if (genericBoldMatch) {
      const boldPart = genericBoldMatch[2];
      let rest = genericBoldMatch[3] || '';
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(boldFontSize);
      doc.setTextColor(opts?.color || '#111');
      if (y > pageBottom) { doc.addPage(); y = marginBottom; }
      doc.text(boldPart, 60, y, { align: 'left' });
      y += 20;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(normalFontSize);
      doc.setTextColor(opts?.color || '#111');
      const restLines = doc.splitTextToSize(rest.trim(), pageWidth - 120 - indent);
      for (let i = 0; i < restLines.length; i++) {
        if (y > pageBottom) { doc.addPage(); y = marginBottom; }
        doc.text(restLines[i], 60 + indent, y, { align: 'justify', maxWidth: pageWidth - 120 - indent });
        y += 22;
      }
      y += 6;
      continue;
    }
    const structureMatch = para.match(/^(\s*)([A-Za-z0-9&'()\/-]+ Structure:)(.*)$/i);
    if (structureMatch) {
      const boldPart = structureMatch[2];
      let rest = structureMatch[3] || '';
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(boldFontSize);
      doc.setTextColor(opts?.color || '#111');
      if (y > pageBottom) { doc.addPage(); y = marginBottom; }
      doc.text(boldPart, 60, y, { align: 'left' });
      y += 20;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(normalFontSize);
      doc.setTextColor(opts?.color || '#111');
      const restLines = doc.splitTextToSize(rest.trim(), pageWidth - 120 - indent);
      for (let i = 0; i < restLines.length; i++) {
        if (y > pageBottom) { doc.addPage(); y = marginBottom; }
        doc.text(restLines[i], 60 + indent, y, { align: 'justify', maxWidth: pageWidth - 120 - indent });
        y += 22;
      }
      y += 6;
      continue;
    }
    const match = para.match(/^(\s*)([A-Za-z0-9\s'()\/-]+:)(.*)$/);
    if (match) {
      const boldPart = match[2];
      let rest = match[3] || '';
      if (isHeadingLine) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(headingFontSize);
        doc.setTextColor('#23252b');
        if (y > pageBottom) { doc.addPage(); y = marginBottom; }
        doc.text(boldPart, 60, y, { align: 'left' });
        y += 22;
        if (rest.trim()) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(normalFontSize);
          doc.setTextColor(opts?.color || '#111');
          const restLines = doc.splitTextToSize(rest.trim(), pageWidth - 120 - indent);
          for (let i = 0; i < restLines.length; i++) {
            if (y > pageBottom) { doc.addPage(); y = marginBottom; }
            doc.text(restLines[i], 60 + indent, y, { align: 'justify', maxWidth: pageWidth - 120 - indent });
            y += 22;
          }
        }
        y += 6;
        continue;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(boldFontSize);
      doc.setTextColor(opts?.color || '#111');
      if (y > pageBottom) { doc.addPage(); y = marginBottom; }
      doc.text(boldPart, 60, y, { align: 'left' });
      y += 20;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(normalFontSize);
      doc.setTextColor(opts?.color || '#111');
      const restLines = doc.splitTextToSize(rest.trim(), pageWidth - 120 - indent);
      for (let i = 0; i < restLines.length; i++) {
        if (y > pageBottom) { doc.addPage(); y = marginBottom; }
        doc.text(restLines[i], 60 + indent, y, { align: 'justify', maxWidth: pageWidth - 120 - indent });
        y += 22;
      }
      y += 6;
      continue;
    }
    const lines = doc.splitTextToSize(para, pageWidth - 120);
    for (let i = 0; i < lines.length; i++) {
      if (y > pageBottom) { doc.addPage(); y = marginBottom; }
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(normalFontSize);
      doc.setTextColor(opts?.color || '#111');
      doc.text(lines[i], 60, y, { align: 'justify', maxWidth: pageWidth - 120 });
      y += 22;
    }
    y += 8;
  }
  return y;
}

function isHeading(line: string): boolean {
  return /:$/g.test(line) && !/^[-•]/.test(line.trim());
}

function renderComprehensiveSection(doc: jsPDF, compBlock: string[], pageWidth: number, boldLines: number[]): void {
  let y = 70;
  const marginBottom = 60;
  const pageBottom = 812 - marginBottom;
  for (let idx = 0; idx < compBlock.length; idx++) {
    let para = compBlock[idx].replace(/^[-•]\s*/, '');
    if (!para.trim()) { y += 18; continue; }
    para = para.replace(/([A-Za-z0-9\s\-()]+):\s*(\d{1,3}%)/g, '$1: $2');
    para = para.replace(/([A-Za-z0-9\s\-()]+)(\d{1,3}%)/g, '$1 $2');
    const percentMatch = para.match(/^(.+?)(\d{1,3}%)$/);
    if (percentMatch && percentMatch[1]) {
      let label = percentMatch[1].trim();
      let percent = percentMatch[2];
      if (!label.endsWith(' ')) label += ' ';
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(idx === 0 ? 19 : 14);
      doc.setTextColor(idx === 0 ? '#23252b' : '#111');
      if (y > pageBottom) { doc.addPage(); y = marginBottom; }
      doc.text(label, 60, y, { align: 'left' });
      doc.text(percent, pageWidth - 60, y, { align: 'right' });
      y += 22;
      continue;
    }
    const match = para.match(/^(\s*)([A-Za-z0-9\s'()\/-]+:)(.*)$/);
    if (match) {
      const boldPart = match[2];
      let rest = match[3] || '';
      const boldWidth = doc.getTextWidth(boldPart);
      const spaceWidth = doc.getTextWidth(' ');
      let restLines = doc.splitTextToSize(rest.trim(), pageWidth - 120 - boldWidth - spaceWidth);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(idx === 0 ? 19 : 14);
      doc.setTextColor(idx === 0 ? '#23252b' : '#111');
      if (y > pageBottom) { doc.addPage(); y = marginBottom; }
      doc.text(boldPart, 60, y, { align: 'left' });
      doc.setFont('helvetica', 'normal');
      let x = 60 + boldWidth + spaceWidth;
      if (restLines.length > 0) {
        doc.text(restLines[0], x, y, { align: 'left', maxWidth: pageWidth - x - 60 });
      }
      y += 22;
      for (let i = 1; i < restLines.length; i++) {
        if (y > pageBottom) { doc.addPage(); y = marginBottom; }
        doc.text(restLines[i], 60, y, { align: 'left', maxWidth: pageWidth - 120 });
        y += 22;
      }
      y += 8;
      continue;
    }
    const lines = doc.splitTextToSize(para, pageWidth - 120);
    for (let i = 0; i < lines.length; i++) {
      if (y > pageBottom) { doc.addPage(); y = marginBottom; }
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(15);
      doc.setTextColor('#111');
      doc.text(lines[i], 60, y, { align: 'justify', maxWidth: pageWidth - 120 });
      y += 22;
    }
    y += 8;
  }
  doc.addPage();
}

function renderAncestryBreakdownBlocks(doc: jsPDF, ancestryBlocks: { region: string, percent: number, description: string }[], pageWidth: number, y: number): number {
  const normalFontSize = 15;
  const boldFontSize = 13;
  const indent = 32;
  const marginBottom = 60;
  const pageBottom = 812 - marginBottom;
  ancestryBlocks.forEach(block => {
    // Region (left, bold) + percent (right, bold)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(boldFontSize);
    doc.setTextColor('#23252b');
    if (y > pageBottom) { doc.addPage(); y = marginBottom; }
    doc.text(block.region + ':', 60, y, { align: 'left' });
    doc.text(block.percent + '%', pageWidth - 60, y, { align: 'right' });
    y += 20;
    // Description (indented, justified)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(normalFontSize);
    doc.setTextColor('#111');
    const descLines = doc.splitTextToSize(block.description, pageWidth - 120 - indent);
    for (let i = 0; i < descLines.length; i++) {
      if (y > pageBottom) { doc.addPage(); y = marginBottom; }
      doc.text(descLines[i], 60 + indent, y, { align: 'justify', maxWidth: pageWidth - 120 - indent });
      y += 22;
    }
    y += 12; // extra space between blocks
  });
  return y;
}

export function downloadAnalysisAsPDF(
  result: string,
  ancestryData: AncestryDatum[],
  pieChartDataUrl?: string
) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(245, 246, 250);
  doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(32);
  doc.setTextColor('#23252b');
  doc.text('Ancestry Analysis Report', pageWidth / 2, 120, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(16);
  doc.setTextColor('#555');
  doc.text('Generated with AI Ancestry', pageWidth / 2, 155, { align: 'center' });
  doc.setFontSize(12);
  doc.setTextColor('#888');
  doc.text('Date: ' + new Date().toLocaleDateString(), pageWidth / 2, 185, { align: 'center' });
  
  const lines = result.split(/\n/);
  let i = 0;
  let summaryTableBlock: string[] = [];
  let summaryTableFound = false;
  let analysisParas: string[] = [];
  let analysisBoldLines: number[] = [];
  let conclusionParas: string[] = [];
  let afterConclusion: string[] = [];
  let compAncestryBlock: string[] = [];
  let compAncestryBoldLines: number[] = [];
  let inConclusion = false;
  let inAfterConclusion = false;
  let inCompAncestry = false;

  while (i < lines.length) {
    const line = lines[i].trim();
    if (/^Comprehensive Ancestry Percentage/i.test(line)) {
      inCompAncestry = true;
      compAncestryBlock.push(line);
      compAncestryBoldLines.push(compAncestryBlock.length - 1);
      i++;
      continue;
    }
    
    if (inCompAncestry && line) {
      let fixedLine = line.replace(/([A-Za-z\s-]+):(\d{1,3}%)/g, '$1: $2');
      fixedLine = fixedLine.replace(/([A-Za-z\s-]+)(\d{1,3}%)/g, '$1 $2');
      
      if (/^[-*]/.test(fixedLine) || fixedLine.startsWith(' ') || isHeading(fixedLine)) {
        compAncestryBlock.push(fixedLine);
        if (isHeading(fixedLine)) compAncestryBoldLines.push(compAncestryBlock.length - 1);
        i++;
        continue;
      } else {
        inCompAncestry = false;
      }
    }
    
    if (/^#+\s?SUMMARY TABLE/i.test(line)) {
      summaryTableFound = true;
      i++;
      continue;
    }
    if (summaryTableFound && (line.startsWith('|') || line.includes('---'))) {
      summaryTableBlock.push(lines[i]);
      i++;
      continue;
    }
    if (/^Conclusion:?$/i.test(line) || /^\*\*?Conclusion:?\*\*?/i.test(line)) {
      inConclusion = true;
      inAfterConclusion = false;
      i++;
      continue;
    }
    if (inConclusion && !line) {
      inConclusion = false;
      inAfterConclusion = true;
      i++;
      continue;
    }
    if (inConclusion) {
      conclusionParas.push(line.replace(/\*\*/g, ''));
      i++;
      continue;
    }
    if (inAfterConclusion) {
      afterConclusion.push(line.replace(/\*\*/g, ''));
      i++;
      continue;
    }
    if (!summaryTableFound && !inCompAncestry) {
      analysisParas.push(line.replace(/\*\*/g, ''));
      if (isHeading(line)) analysisBoldLines.push(analysisParas.length - 1);
    } else if (!inConclusion && !inAfterConclusion && !inCompAncestry) {
      // skip summary table and comp ancestry lines
    }
    i++;
  }

  let y = 70;
  const marginBottom = 60;
  const pageBottom = 812 - marginBottom;
  
  doc.addPage();
  y = renderParagraphsWithBoldSpans(doc, analysisParas, pageWidth, y, { fontSize: 15, color: '#111', justify: true });
  
  if (compAncestryBlock.length > 0) {
    doc.addPage();
    doc.setFillColor(252, 252, 255);
    doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');
    let yComp = 70;
    yComp = renderParagraphsWithBoldSpans(doc, compAncestryBlock, pageWidth, yComp, { fontSize: 15, color: '#111', justify: true });
  }

  if (summaryTableBlock.length > 0) {
    doc.addPage();
    doc.setFillColor(252, 252, 255);
    doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(21);
    doc.setTextColor('#888');
    doc.text('SUMMARY TABLE', 60, 70, { align: 'left' });
    renderMarkdownTable(doc, summaryTableBlock, pageWidth, 110);
  }

  if (conclusionParas.length > 0) {
    doc.addPage();
    let cy = 70;
    cy = renderParagraphsWithBoldSpans(doc, conclusionParas, pageWidth, cy, { fontSize: 15, color: '#111', justify: true });
  }

  if (ancestryData && ancestryData.length > 0) {
    doc.addPage();
    doc.setFillColor(252, 252, 255);
    doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor('#23252b');
    doc.text('Ancestry Breakdown', pageWidth / 2, 90, { align: 'center' });
    
    // Use the image-based pie chart approach which was working correctly
    if (pieChartDataUrl) {
      try {
        const chartWidth = 320;
        const chartHeight = 220;
        const chartX = (pageWidth - chartWidth) / 2;
        doc.addImage(pieChartDataUrl, 'PNG', chartX, 120, chartWidth, chartHeight, undefined, 'FAST');
        let legendY = 360;
        const legendBlockWidth = 340;
        const legendX = (pageWidth - legendBlockWidth) / 2 + 24;
        ancestryData.forEach((item, i) => {
          const color = ['#2f80ed','#f2994a','#27ae60','#eb5757','#9b51e0','#56ccf2','#f2c94c','#6fcf97','#bb6bd9'][i%9];
          doc.setFillColor(color);
          doc.circle(legendX, legendY, 6, 'F');
          doc.setFontSize(15);
          doc.setTextColor('#23252b');
          let label = `${item.region}`;
          if (!/\s$/.test(label)) label += ' ';
          doc.text(`${label}(${item.percent}%)`, legendX + 15, legendY + 5);
          legendY += 28;
        });
      } catch (e) {
        console.error('Error rendering pie chart in PDF:', e);
        // Fallback if chart rendering fails
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(18);
        doc.setTextColor('#888');
        doc.text('Pie chart unavailable', pageWidth / 2, 220, { align: 'center' });
      }
    } else {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(18);
      doc.setTextColor('#888');
      doc.text('Pie chart unavailable', pageWidth / 2, 220, { align: 'center' });
    }
    
    // Add text breakdown
    const ancestryBlocks = ancestryData.map(item => ({ 
      region: item.region, 
      percent: item.percent, 
      description: '' 
    }));
    
    let y = 400; // Start after the chart
    y = renderAncestryBreakdownBlocks(doc, ancestryBlocks, pageWidth, y);
  }

  doc.save('ancestry-analysis-report.pdf');
}