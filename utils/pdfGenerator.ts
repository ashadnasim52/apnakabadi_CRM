import jsPDF from 'jspdf';
import { Bill, CompanySettings } from '../types';

export const generateBillPDF = (bill: Bill, company: CompanySettings, action: 'download' | 'print' = 'download') => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  let y = margin;

  // Design Colors
  const colors = {
    primary: [30, 58, 138], // Dark Blue (Blue 900)
    secondary: [59, 130, 246], // Blue 500
    slate: [51, 65, 85], // Slate 700
    gray: [100, 116, 139], // Slate 500
    lightGray: [248, 250, 252], // Slate 50
    border: [226, 232, 240], // Slate 200
  };

  // Helper for right aligned text
  const rightText = (text: string, yPos: number, x: number = pageWidth - margin, fontSize: number = 10, font: string = 'normal', color: number[] = [0, 0, 0]) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', font);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(text, x, yPos, { align: 'right' });
  };

  // --- HEADER SECTION ---
  
  // Background Accent
  doc.setFillColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Left: Company Logo/Name
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(company.name.toUpperCase(), margin, y + 8);
  
  // Right: Invoice Label
  const title = bill.transactionType === 'SALE' ? 'SALES INVOICE' : 'PURCHASE RECEIPT';
  doc.setTextColor(colors.slate[0], colors.slate[1], colors.slate[2]);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title, pageWidth - margin, y + 8, { align: 'right' });

  y += 18;

  // Company Details (Left) vs Bill Details (Right)
  doc.setTextColor(colors.slate[0], colors.slate[1], colors.slate[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  const headerInfoY = y;
  // Company Info
  if (company.subtitle) {
      doc.setFont('helvetica', 'bold');
      doc.text(company.subtitle, margin, y);
      doc.setFont('helvetica', 'normal');
      y += 4.5;
  }
  doc.text(company.address, margin, y);
  doc.text(`Phone: ${company.phone}`, margin, y + 4.5);
  if (company.email) doc.text(`Email: ${company.email}`, margin, y + 9);

  // Bill Info (Right Aligned)
  let infoY = headerInfoY;
  rightText(`Bill No: ${bill.billNo}`, infoY, pageWidth - margin, 10, 'bold', colors.primary);
  rightText(`Date: ${new Date(bill.date).toLocaleDateString()}`, infoY + 5, pageWidth - margin, 10, 'normal');
  rightText(`Time: ${new Date(bill.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`, infoY + 10, pageWidth - margin, 9, 'normal', colors.gray);

  y = Math.max(y + 15, infoY + 15);

  // Divider
  doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // --- CUSTOMER SECTION ---
  const customerStartY = y;
  doc.setFontSize(10);
  doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO', margin, y);
  
  // Status Badge (Right side)
  const statusColor = bill.paymentStatus === 'Paid' ? [22, 163, 74] : [220, 38, 38];
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.roundedRect(pageWidth - margin - 25, y - 5, 25, 7, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(bill.paymentStatus.toUpperCase(), pageWidth - margin - 12.5, y - 0.2, { align: 'center' });

  y += 7;
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(bill.customerName, margin, y);
  
  y += 5.5;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.slate[0], colors.slate[1], colors.slate[2]);
  doc.text(`Phone: ${bill.customerPhone}`, margin, y);
  if (bill.customerAddress) {
    y += 5;
    const splitAddr = doc.splitTextToSize(bill.customerAddress, 80);
    doc.text(splitAddr, margin, y);
    y += (splitAddr.length * 4);
  } else {
    y += 6;
  }

  y += 5;

  // --- TABLE HEADER ---
  const cols = {
    item: margin + 3,
    rate: pageWidth - margin - 80,
    weight: pageWidth - margin - 45,
    amount: pageWidth - margin - 3
  };

  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.roundedRect(margin, y, contentWidth, 10, 1, 1, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('ITEM DESCRIPTION', cols.item, y + 6.5);
  doc.text('RATE (Rs)', cols.rate, y + 6.5, { align: 'right' });
  doc.text('WEIGHT (Kg)', cols.weight, y + 6.5, { align: 'right' });
  doc.text('AMOUNT (Rs)', cols.amount, y + 6.5, { align: 'right' });

  y += 15;

  // --- TABLE ROWS ---
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.slate[0], colors.slate[1], colors.slate[2]);
  let totalWeight = 0;

  bill.items.forEach((item, index) => {
    let itemName = item.itemName || item.customName || 'Item';
    let vehicleSubtext = '';
    
    if (item.vehicleInfo) {
      vehicleSubtext = `Vehicle: ${item.vehicleInfo.vehicleName} | Reg: ${item.vehicleInfo.registrationNumber}`;
      if (item.vehicleInfo.chassisNumber) vehicleSubtext += `\nChassis: ${item.vehicleInfo.chassisNumber}`;
      if (item.vehicleInfo.engineNumber) vehicleSubtext += ` | Engine: ${item.vehicleInfo.engineNumber}`;
    }
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(itemName, cols.item, y);
    
    let textOffset = 5;
    if (vehicleSubtext) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
        const splitVehicle = doc.splitTextToSize(vehicleSubtext, cols.rate - cols.item - 5);
        doc.text(splitVehicle, cols.item, y + 4);
        textOffset += (splitVehicle.length * 4);
    }

    // Numbers
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.slate[0], colors.slate[1], colors.slate[2]);
    doc.text(item.rate.toFixed(2), cols.rate, y, { align: 'right' });
    
    const itemWeight = item.totalWeight || item.weight;
    if (item.vehicleInfo) {
        doc.text('Flat', cols.weight, y, { align: 'right' });
    } else {
        doc.text(itemWeight.toFixed(2), cols.weight, y, { align: 'right' });
        totalWeight += itemWeight;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(item.amount.toFixed(2), cols.amount, y, { align: 'right' });

    y += textOffset + 2;
    
    // Page break check
    if (y > pageHeight - 60) {
        doc.addPage();
        y = margin + 10;
    }

    // Row Line
    doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
    doc.setLineWidth(0.1);
    doc.line(margin, y - 2, pageWidth - margin, y - 2);
    y += 4;
  });

  y += 5;

  // --- SUMMARY SECTION ---
  
  const summaryWidth = 70;
  const summaryX = pageWidth - margin - summaryWidth;
  
  // Draw Total Box
  doc.setFillColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
  doc.roundedRect(summaryX, y, summaryWidth, 30, 2, 2, 'F');
  doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
  doc.roundedRect(summaryX, y, summaryWidth, 30, 2, 2, 'S');
  
  let sy = y + 7;
  doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
  doc.setFontSize(9);
  
  doc.text(`Total Items:`, summaryX + 5, sy);
  doc.text(`${bill.items.length}`, pageWidth - margin - 5, sy, { align: 'right' });
  
  sy += 6;
  doc.text(`Total Weight:`, summaryX + 5, sy);
  doc.text(`${totalWeight.toFixed(2)} Kg`, pageWidth - margin - 5, sy, { align: 'right' });
  
  sy += 4;
  doc.line(summaryX + 5, sy, pageWidth - margin - 5, sy);
  
  sy += 8;
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`GRAND TOTAL:`, summaryX + 5, sy);
  doc.text(`Rs. ${bill.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, pageWidth - margin - 5, sy, { align: 'right' });

  // --- FOOTER & SIGNATURE ---
  
  const footerY = pageHeight - 45;
  
  // Terms & Conditions (Left)
  doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('TERMS & CONDITIONS:', margin, footerY);
  doc.setFont('helvetica', 'normal');
  doc.text('1. All items are purchased as scrap material.', margin, footerY + 5);
  doc.text('2. Subject to Ranchi jurisdiction only.', margin, footerY + 9);
  doc.text('3. This is a computer generated document.', margin, footerY + 13);

  // Signature
  let sigY = footerY;
  if (company.signatureUrl) {
    try {
        doc.addImage(company.signatureUrl, 'PNG', pageWidth - margin - 40, sigY - 10, 35, 12);
    } catch(e) { /* ignore */ }
  }
  
  doc.setDrawColor(colors.slate[0], colors.slate[1], colors.slate[2]);
  doc.setLineWidth(0.5);
  doc.line(pageWidth - margin - 50, footerY + 10, pageWidth - margin, footerY + 10);
  
  doc.setTextColor(colors.slate[0], colors.slate[1], colors.slate[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Authorized Signatory', pageWidth - margin - 25, footerY + 15, { align: 'center' });

  // Bottom Branding
  doc.setFontSize(8);
  doc.setTextColor(180, 180, 180);
  const bottomY = pageHeight - 10;
  doc.text('Thank you for choosing Apna Kabadi - Premier Scrap Solutions', pageWidth / 2, bottomY, { align: 'center' });

  // Output
  if (action === 'print') {
    doc.autoPrint();
    const blob = doc.output('bloburl');
    window.open(blob, '_blank');
  } else {
    doc.save(`${bill.transactionType}_${bill.billNo}.pdf`);
  }
};

export const generateScrapCertificate = (bill: Bill, item: any, company: CompanySettings) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Add a nice border
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(2);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
  
  // Design Elements
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235); // Blue
  doc.text('VEHICLE SCRAPPING CERTIFICATE', pageWidth / 2, 40, { align: 'center' });
  
  doc.setFontSize(18);
  doc.setTextColor(50, 50, 50);
  doc.text(company.name.toUpperCase(), pageWidth / 2, 52, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Certificate No: SCRAP-${bill.billNo}-${item.id.slice(-4)}`, margin + 10, 70);
  doc.text(`Date of Scrapping: ${new Date(bill.date).toLocaleDateString()}`, pageWidth - margin - 10, 70, { align: 'right' });

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(margin + 10, 78, pageWidth - margin - 10, 78);

  doc.setFontSize(14);
  doc.text('This is to certify that the following vehicle has been purchased for scrapping', margin + 10, 95);
  doc.text(`by ${company.name} from:`, margin + 10, 103);
  
  doc.setFont('helvetica', 'bold');
  doc.text(`Customer Name: ${bill.customerName}`, margin + 10, 115);
  doc.setFont('helvetica', 'normal');
  
  if (item.vehicleInfo) {
    const vY = 135;
    
    // Background box for vehicle info
    doc.setFillColor(248, 250, 252);
    doc.rect(margin + 10, vY - 10, 150, 50, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin + 10, vY - 10, 150, 50, 'S');

    doc.setFont('helvetica', 'bold');
    doc.text('Vehicle Details:', margin + 15, vY - 2);
    doc.setFont('helvetica', 'normal');

    doc.text(`Vehicle Name: ${item.vehicleInfo.vehicleName}`, margin + 15, vY + 8);
    doc.text(`Registration No: ${item.vehicleInfo.registrationNumber}`, margin + 15, vY + 16);
    doc.text(`Chassis No: ${item.vehicleInfo.chassisNumber}`, margin + 15, vY + 24);
    doc.text(`Engine No: ${item.vehicleInfo.engineNumber}`, margin + 15, vY + 32);
  }

  doc.setFontSize(12);
  const disclaimerY = 160;
  doc.text('The above vehicle has been handed over for safe dismantling and scrapping in accordance', margin + 10, disclaimerY);
  doc.text('with environmental regulations. This certificate is issued for record purposes.', margin + 10, disclaimerY + 8);

  // Signatures
  const sigY = pageHeight - 35;
  doc.setDrawColor(100);
  doc.line(margin + 10, sigY, margin + 70, sigY);
  doc.line(pageWidth - margin - 70, sigY, pageWidth - margin - 10, sigY);

  doc.setFontSize(11);
  doc.text('Customer Signature', margin + 40, sigY + 6, { align: 'center' });
  doc.setFontSize(9);
  doc.text(bill.customerName, margin + 40, sigY + 12, { align: 'center' });

  doc.setFontSize(11);
  doc.text('Authorized Signatory', pageWidth - margin - 40, sigY + 6, { align: 'center' });
  doc.setFontSize(9);
  doc.text(company.name, pageWidth - margin - 40, sigY + 12, { align: 'center' });

  doc.save(`Scrap_Certificate_${item.vehicleInfo?.registrationNumber || item.id}.pdf`);
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