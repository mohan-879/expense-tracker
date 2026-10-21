// Lazy loaders for heavy libraries to prevent bloating initial page bundles and slow compiles
async function getXLSX() {
  const mod = await import('xlsx-js-style');
  return mod.default || mod;
}

async function getPDFModules() {
  const [jspdfMod, autoTableMod] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  const jsPDF = jspdfMod.jsPDF || jspdfMod.default || jspdfMod;
  let autoTable = autoTableMod.default || autoTableMod.autoTable || autoTableMod;
  if (typeof autoTable !== 'function' && autoTable && typeof autoTable.default === 'function') {
    autoTable = autoTable.default;
  }
  return { jsPDF, autoTable };
}

/**
 * Generates an Excel file matching the structured spreadsheet model:
 * - Prominent "EXPENSE TRACKER" top heading
 * - Panimalar Engineering College branding
 * - Distinct, colored headers with bold text and styling
 * - Clean cell borders, auto column sizing, proper numeric alignments
 */
export async function exportToStyledExcel({
  filename = `Expense_Tracker_${new Date().toISOString().slice(0, 10)}.xlsx`,
  sheetName = 'Expense_Records',
  reportTitle = 'EXPENSE TRACKER',
  collegeName = 'PANIMALAR ENGINEERING COLLEGE',
  trustName = 'JAI SAKTHI EDUCATIONAL TRUST - AN AUTONOMOUS INSTITUTION',
  metaInfo = '',
  headers = [],
  rows = [],
  columnAlignments = [], // Array of 'left' | 'center' | 'right'
}) {
  const XLSX = await getXLSX();
  const colCount = Math.max(headers.length, 6);

  // Build Array of Arrays (AOA)
  const aoa = [
    [reportTitle],
    [collegeName],
    [trustName],
  ];

  if (metaInfo) {
    aoa.push([metaInfo]);
  }

  aoa.push([]); // Empty spacer row
  aoa.push(headers);

  // Append data rows
  rows.forEach((r) => aoa.push(r));

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Top Title Merges across all columns
  const headerRowIdx = metaInfo ? 5 : 4;
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: colCount - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: colCount - 1 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: colCount - 1 } },
  ];

  if (metaInfo) {
    ws['!merges'].push({ s: { r: 3, c: 0 }, e: { r: 3, c: colCount - 1 } });
  }

  // Row heights
  ws['!rows'] = [
    { hpt: 32 }, // Row 1: EXPENSE TRACKER
    { hpt: 22 }, // Row 2: College Name
    { hpt: 18 }, // Row 3: Trust & Autonomous
  ];

  if (metaInfo) {
    ws['!rows'].push({ hpt: 18 });
  }
  ws['!rows'].push({ hpt: 10 }); // Spacer
  ws['!rows'].push({ hpt: 26 }); // Header row

  // Top Banner Styles
  ws['A1'].s = {
    font: { bold: true, sz: 16, color: { rgb: 'FFFFFF' }, name: 'Arial' },
    fill: { fgColor: { rgb: '0F172A' } }, // Slate 900
    alignment: { horizontal: 'center', vertical: 'center' },
  };

  ws['A2'].s = {
    font: { bold: true, sz: 12, color: { rgb: 'FFFFFF' }, name: 'Arial' },
    fill: { fgColor: { rgb: '1E3A8A' } }, // Deep Royal Blue
    alignment: { horizontal: 'center', vertical: 'center' },
  };

  ws['A3'].s = {
    font: { bold: true, sz: 10, color: { rgb: 'FEF08A' }, name: 'Arial' }, // Yellow accent text
    fill: { fgColor: { rgb: '1E40AF' } }, // Blue 800
    alignment: { horizontal: 'center', vertical: 'center' },
  };

  if (metaInfo && ws['A4']) {
    ws['A4'].s = {
      font: { italic: true, sz: 9, color: { rgb: '475569' }, name: 'Arial' },
      fill: { fgColor: { rgb: 'F1F5F9' } },
      alignment: { horizontal: 'center', vertical: 'center' },
    };
  }

  // Border presets
  const thinBorder = {
    top: { style: 'thin', color: { rgb: 'CBD5E1' } },
    bottom: { style: 'thin', color: { rgb: 'CBD5E1' } },
    left: { style: 'thin', color: { rgb: 'CBD5E1' } },
    right: { style: 'thin', color: { rgb: 'CBD5E1' } },
  };

  // Header row styling with vibrant professional blue fill
  for (let c = 0; c < colCount; c++) {
    const cellRef = XLSX.utils.encode_cell({ r: headerRowIdx, c });
    if (ws[cellRef]) {
      ws[cellRef].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 10, name: 'Arial' },
        fill: { fgColor: { rgb: '2563EB' } }, // Blue 600
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        border: {
          top: { style: 'medium', color: { rgb: '1E3A8A' } },
          bottom: { style: 'medium', color: { rgb: '1E3A8A' } },
          left: { style: 'thin', color: { rgb: '93C5FD' } },
          right: { style: 'thin', color: { rgb: '93C5FD' } },
        },
      };
    }
  }

  // Data rows styling
  const dataStartRow = headerRowIdx + 1;
  for (let r = 0; r < rows.length; r++) {
    const rowIdx = dataStartRow + r;
    const isEven = r % 2 === 1;

    for (let c = 0; c < colCount; c++) {
      const cellRef = XLSX.utils.encode_cell({ r: rowIdx, c });
      if (ws[cellRef]) {
        const align = columnAlignments[c] || (c === 0 ? 'center' : 'left');

        ws[cellRef].s = {
          font: { sz: 9.5, color: { rgb: '0F172A' }, name: 'Arial' },
          fill: isEven ? { fgColor: { rgb: 'F8FAFC' } } : undefined, // Subtle alternate row zebra
          border: thinBorder,
          alignment: {
            vertical: 'center',
            horizontal: align,
            wrapText: false,
          },
        };

        // Format currency numbers if they look like numbers
        if (typeof ws[cellRef].v === 'number') {
          ws[cellRef].z = '#,##0.00';
        }
      }
    }
  }

  // Calculate dynamic auto column widths based on maximum content length
  const colWidths = headers.map((h, colIdx) => {
    let maxLen = String(h).length;
    rows.forEach((row) => {
      const cellVal = row[colIdx];
      if (cellVal !== undefined && cellVal !== null) {
        maxLen = Math.max(maxLen, String(cellVal).length);
      }
    });
    // Return character width with generous padding
    return { wch: Math.min(Math.max(maxLen + 4, 8), 45) };
  });
  ws['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, ws, sheetName);
  XLSX.writeFile(workbook, filename);
}

/**
 * Generates a clean PDF document matching the structured table model:
 * - Prominent "EXPENSE TRACKER" top title
 * - College header and subheadings
 * - Colored table header banner with crisp cell borders and alternate row shading
 */
export async function exportToStyledPDF({
  filename = `Expense_Tracker_${new Date().toISOString().slice(0, 10)}.pdf`,
  reportTitle = 'EXPENSE TRACKER',
  collegeName = 'PANIMALAR ENGINEERING COLLEGE',
  trustName = 'JAI SAKTHI EDUCATIONAL TRUST - AN AUTONOMOUS INSTITUTION',
  metaInfo = '',
  headers = [],
  rows = [],
  orientation = 'landscape',
  columnStyles = {},
}) {
  const { jsPDF, autoTable } = await getPDFModules();
  const doc = new jsPDF(orientation);
  const pageWidth = doc.internal.pageSize.getWidth();

  // Top Dark Heading Banner for EXPENSE TRACKER
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(14, 10, pageWidth - 28, 12, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(reportTitle, pageWidth / 2, 18, { align: 'center' });

  // College & Trust Information
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138); // Deep Blue
  doc.text(collegeName, pageWidth / 2, 28, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setTextColor(185, 28, 28); // Crimson Red
  doc.text(trustName, pageWidth / 2, 33, { align: 'center' });

  if (metaInfo) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(metaInfo, pageWidth / 2, 38, { align: 'center' });
  }

  const startY = metaInfo ? 42 : 37;

  const tableFn = typeof autoTable === 'function' ? autoTable : (typeof doc.autoTable === 'function' ? doc.autoTable.bind(doc) : null);
  if (!tableFn) {
    throw new Error('AutoTable PDF module failed to initialize.');
  }

  tableFn(doc, {
    head: [headers],
    body: rows,
    startY,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      lineColor: [203, 213, 225], // Slate 300 grid border
      lineWidth: 0.1,
      textColor: [15, 23, 42],
    },
    headStyles: {
      fillColor: [37, 99, 235], // Blue 600 header fill
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      lineColor: [30, 58, 138],
      lineWidth: 0.2,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // Slate 50
    },
    columnStyles,
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      // Footer page number
      const pageNumber = doc.internal.getNumberOfPages();
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Page ${data.pageNumber} of ${pageNumber} • Confidential DS Club Financial Report`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 8,
        { align: 'center' }
      );
    },
  });

  doc.save(filename);
}
