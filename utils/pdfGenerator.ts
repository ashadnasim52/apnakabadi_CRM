import jsPDF from 'jspdf';
import { Bill, CompanySettings } from '../types';

export const generateBillPDF = (bill: Bill, company: CompanySettings, action: 'download' | 'print' = 'download') => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  const contentWidth = pageWidth - (margin * 2);
  let y = margin;

  // Design Colors
  const colors = {
    primary: [37, 99, 235], // Blue 600
    slate: [51, 65, 85], // Slate 700
    gray: [100, 116, 139], // Slate 500
    lightGray: [248, 250, 252], // Slate 50
    border: [226, 232, 240], // Slate 200
  };

  // Helper for right aligned text
  const rightText = (text: string, y: number, x: number = pageWidth - margin, fontSize: number = 10, font: string = 'normal') => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', font);
    doc.text(text, x, y, { align: 'right' });
  };

  // --- HEADER SECTION ---
  
  // Left: Company Logo/Name
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(company.name.toUpperCase(), margin, y + 6);
  
  // Right: Invoice Label
  const title = bill.transactionType === 'SALE' ? 'SALES INVOICE' : 'PURCHASE RECEIPT';
  doc.setTextColor(colors.slate[0], colors.slate[1], colors.slate[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(title, pageWidth - margin, y + 6, { align: 'right' });

  y += 14;

  // Company Details (Left) vs Bill Details (Right)
  doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  
  // Company Info
  if (company.subtitle) {
      doc.text(company.subtitle, margin, y);
      y += 4;
  }
  doc.text(company.address, margin, y);
  doc.text(`Phone: ${company.phone}`, margin, y + 4);

  // Bill Info (Right Aligned - Reset Y to align with top of details)
  let infoY = y - (company.subtitle ? 4 : 0);
  doc.setTextColor(0);
  rightText(`Bill No: ${bill.billNo}`, infoY, pageWidth - margin, 9, 'bold');
  rightText(`Date: ${new Date(bill.date).toLocaleDateString()}`, infoY + 4, pageWidth - margin, 9, 'normal');
  
  doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
  rightText(`${new Date(bill.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`, infoY + 8, pageWidth - margin, 8, 'normal');

  y += 10;

  // Divider
  doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // --- CUSTOMER SECTION ---
  const customerY = y;
  doc.setFontSize(9);
  doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', margin, y);
  
  // Status Badge (Right side)
  const statusColor = bill.paymentStatus === 'Paid' ? [22, 163, 74] : [220, 38, 38];
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.roundedRect(pageWidth - margin - 20, y - 4, 20, 5, 1, 1, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text(bill.paymentStatus.toUpperCase(), pageWidth - margin - 10, y - 0.5, { align: 'center' });

  y += 5;
  doc.setTextColor(0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(bill.customerName, margin, y);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
  doc.text(bill.customerPhone, margin, y + 4);
  if (bill.customerAddress) {
    doc.text(bill.customerAddress, margin, y + 8);
    y += 4;
  }

  y += 12;

  // --- TABLE HEADER ---
  const cols = {
    item: margin + 2,
    rate: 85,
    weight: 110,
    amount: pageWidth - margin - 2
  };

  doc.setFillColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
  doc.line(margin, y, pageWidth - margin, y); 
  doc.line(margin, y + 7, pageWidth - margin, y + 7);
  
  doc.setTextColor(colors.slate[0], colors.slate[1], colors.slate[2]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('ITEM DESCRIPTION', cols.item, y + 4.5);
  doc.text('RATE', cols.rate, y + 4.5, { align: 'right' });
  doc.text('TOTAL WEIGHT', cols.weight, y + 4.5, { align: 'right' });
  doc.text('AMOUNT', cols.amount, y + 4.5, { align: 'right' });

  y += 10;

  // --- TABLE ROWS ---
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0);
  let totalWeight = 0;

  bill.items.forEach((item, index) => {
    const itemName = item.itemName || item.customName || 'Item';
    
    // Auto wrap text
    const maxNameWidth = 60;
    const splitText = doc.splitTextToSize(itemName, maxNameWidth);
    const rows = splitText.length;
    const rowHeight = Math.max(6, rows * 4 + 2);

    // Check page break
    if (y + rowHeight > pageHeight - 40) {
       doc.addPage();
       y = margin;
       // Optional: Redraw header here
    }

    doc.setFontSize(9);
    doc.text(splitText, cols.item, y);
    doc.text(item.rate.toFixed(2), cols.rate, y, { align: 'right' });
    
    const itemWeight = item.totalWeight || item.weight;
    doc.text(itemWeight.toFixed(2), cols.weight, y, { align: 'right' });
    
    doc.setFont('helvetica', 'bold');
    doc.text(item.amount.toFixed(2), cols.amount, y, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    totalWeight += itemWeight;
    y += rowHeight;
    
    // Light separator line
    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y - rowHeight + 2, pageWidth - margin, y - rowHeight + 2);
  });

  y += 2;

  // --- SUMMARY SECTION ---
  
  // Summary Box Background
  const summaryHeight = 22;
  // Check page break for summary
  if (y + summaryHeight > pageHeight - 30) {
    doc.addPage();
    y = margin;
  }

  // Draw background for total
  doc.setFillColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
  doc.roundedRect(pageWidth - margin - 60, y, 60, summaryHeight, 2, 2, 'F');
  
  // Stats inside box
  let sy = y + 5;
  doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
  doc.setFontSize(8);
  
  doc.text(`Total Items:`, pageWidth - margin - 55, sy);
  doc.text(`${bill.items.length}`, pageWidth - margin - 5, sy, { align: 'right' });
  
  sy += 5;
  doc.text(`Total Weight:`, pageWidth - margin - 55, sy);
  doc.text(`${totalWeight.toFixed(2)} Kg`, pageWidth - margin - 5, sy, { align: 'right' });
  
  // Divider inside box
  sy += 3;
  doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
  doc.line(pageWidth - margin - 55, sy, pageWidth - margin - 5, sy);
  
  // Grand Total
  sy += 6;
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total:`, pageWidth - margin - 55, sy);
  doc.text(`Rs. ${bill.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, pageWidth - margin - 5, sy, { align: 'right' });

  // --- FOOTER & SIGNATURE ---
  
  // Push footer to bottom
  const footerH = 30;
  let footerY = pageHeight - margin - footerH;
  
  // If content overlaps footer, add page
  if (y + summaryHeight + 10 > footerY) {
      doc.addPage();
      footerY = pageHeight - margin - footerH;
  }

  // Signature
  let sigY = footerY;
  if (company.signatureUrl) {
    try {
        doc.addImage(company.signatureUrl, 'PNG', pageWidth - margin - 35, sigY, 30, 10);
        sigY += 10;
    } catch(e) { /* ignore */ }
  } else {
    sigY += 10;
  }
  
  doc.setTextColor(0);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Authorized Signature', pageWidth - margin - 20, sigY + 4, { align: 'center' });

  // Bottom Branding
  doc.setFontSize(7);
  doc.setTextColor(150);
  const bottomY = pageHeight - 8;
  doc.text('Thank you for your business!', pageWidth / 2, bottomY - 3, { align: 'center' });
  doc.text('Generated by Apna Kabadi Manager', pageWidth / 2, bottomY, { align: 'center' });

  // Output
  if (action === 'print') {
    doc.autoPrint();
    const blob = doc.output('bloburl');
    window.open(blob, '_blank');
  } else {
    doc.save(`${bill.transactionType}_${bill.billNo}.pdf`);
  }
};

export const generateSummaryReportPDF = (bills: Bill[], company: CompanySettings, startDate: string, endDate: string) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const margin = 15;
  const pageWidth = 210;
  const contentWidth = pageWidth - (margin * 2);
  let y = margin;

  // Colors
  const colors = {
    primary: [37, 99, 235],
    slate: [51, 65, 85],
    light: [248, 250, 252]
  };

  // --- HEADER ---
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text(company.name.toUpperCase(), margin, y);
  
  y += 8;
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text("Business Summary Report", margin, y);
  doc.setTextColor(0);

  doc.setFontSize(10);
  doc.text(`Period: ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`, pageWidth - margin, y - 8, { align: 'right' });
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - margin, y, { align: 'right' });

  y += 10;
  doc.setDrawColor(200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // --- SUMMARY CARDS ---
  const totalPurchases = bills.filter(b => b.transactionType === 'PURCHASE').reduce((sum, b) => sum + b.totalAmount, 0);
  const totalSales = bills.filter(b => b.transactionType === 'SALE').reduce((sum, b) => sum + b.totalAmount, 0);
  const netFlow = totalSales - totalPurchases;

  // Draw Summary Boxes
  const boxWidth = contentWidth / 3 - 4;
  
  // Helper to draw box
  const drawBox = (x: number, title: string, amount: number, color: number[]) => {
      doc.setFillColor(color[0], color[1], color[2]); // BG
      doc.roundedRect(x, y, boxWidth, 25, 2, 2, 'F');
      
      doc.setFontSize(9);
      doc.setTextColor(colors.slate[0], colors.slate[1], colors.slate[2]);
      doc.text(title, x + 5, y + 8);
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0);
      doc.text(`Rs. ${amount.toLocaleString('en-IN')}`, x + 5, y + 18);
  };

  drawBox(margin, "Total Purchases", totalPurchases, [239, 246, 255]);
  drawBox(margin + boxWidth + 6, "Total Sales", totalSales, [236, 253, 245]);
  drawBox(margin + (boxWidth * 2) + 12, "Net Cash Flow", netFlow, [255, 251, 235]);

  y += 35;

  // --- TRANSACTIONS TABLE ---
  doc.setFontSize(12);
  doc.setTextColor(colors.slate[0], colors.slate[1], colors.slate[2]);
  doc.setFont('helvetica', 'bold');
  doc.text("Transaction History", margin, y);
  y += 6;

  // Headers
  const cols = {
    date: margin + 2,
    billNo: margin + 30,
    type: margin + 70,
    customer: margin + 100,
    amount: pageWidth - margin - 2
  };

  doc.setFillColor(colors.slate[0], colors.slate[1], colors.slate[2]);
  doc.rect(margin, y, contentWidth, 9, 'F');
  doc.setTextColor(255);
  doc.setFontSize(9);
  doc.text("Date", cols.date, y + 6);
  doc.text("Bill No", cols.billNo, y + 6);
  doc.text("Type", cols.type, y + 6);
  doc.text("Customer", cols.customer, y + 6);
  doc.text("Amount", cols.amount, y + 6, { align: 'right' });

  y += 10;

  // Rows
  doc.setTextColor(0);
  doc.setFont('helvetica', 'normal');

  // Sort bills by date desc
  const sortedBills = [...bills].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  sortedBills.forEach((bill, index) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    if (index % 2 !== 0) {
      doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
      doc.rect(margin, y, contentWidth, 8, 'F');
    }

    doc.text(new Date(bill.date).toLocaleDateString(), cols.date, y + 5);
    doc.text(bill.billNo, cols.billNo, y + 5);
    
    // Type colored
    if (bill.transactionType === 'PURCHASE') {
      doc.setTextColor(37, 99, 235);
      doc.text("PURCHASE", cols.type, y + 5);
    } else {
      doc.setTextColor(5, 150, 105);
      doc.text("SALE", cols.type, y + 5);
    }
    
    doc.setTextColor(0);
    doc.text(bill.customerName.substring(0, 20), cols.customer, y + 5);
    doc.text(bill.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }), cols.amount, y + 5, { align: 'right' });

    y += 8;
  });

  doc.save(`Report_${startDate}_${endDate}.pdf`);
};