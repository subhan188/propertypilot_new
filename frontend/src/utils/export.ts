/**
 * Export utilities for generating and downloading reports in various formats
 */

/**
 * Export data as CSV file
 * @param data Array of objects to export
 * @param filename Name of the file to download
 */
export function exportToCSV(data: any[], filename: string = "export.csv") {
  if (!data || data.length === 0) {
    console.warn("No data to export");
    return;
  }

  // Get headers from the first object
  const headers = Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    // Header row
    headers.map((header) => `"${header}"`).join(","),
    // Data rows
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Escape quotes and wrap in quotes if contains comma or quotes
          if (value === null || value === undefined) {
            return '""';
          }
          const stringValue = String(value).replace(/"/g, '""');
          if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
            return `"${stringValue}"`;
          }
          return stringValue;
        })
        .join(",")
    ),
  ].join("\n");

  // Create blob and download
  downloadFile(csvContent, filename, "text/csv");
}

/**
 * Export data as JSON file
 * @param data Object or array to export
 * @param filename Name of the file to download
 */
export function exportToJSON(data: any, filename: string = "export.json") {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, filename, "application/json");
}

/**
 * Export report as PDF (simple text-based PDF)
 * For a production app, use a library like jsPDF or react-pdf
 * @param title Report title
 * @param content Report content as key-value pairs
 * @param filename Name of the file to download
 */
export function exportToPDF(
  title: string,
  content: Record<string, any>,
  filename: string = "report.pdf"
) {
  // Simple text-based PDF generation
  // In production, use jsPDF library for proper PDF formatting

  let pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length ${calculatePDFLength(title, content)} >>
stream
BT
/F1 24 Tf
50 750 Td
(${escapePDFText(title)}) Tj
ET
BT
/F1 12 Tf
50 700 Td
`;

  // Add content to PDF
  let yPosition = 700;
  Object.entries(content).forEach(([key, value]) => {
    if (typeof value === "object") {
      value = JSON.stringify(value);
    }
    yPosition -= 20;
    pdfContent += `(${escapePDFText(key)}: ${escapePDFText(String(value))}) Tj\n`;
    pdfContent += `0 -20 Td\n`;
  });

  pdfContent += `ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000229 00000 n
0000000327 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${pdfContent.length}
%%EOF`;

  downloadFile(pdfContent, filename, "application/pdf");
}

/**
 * Helper function to download file
 */
function downloadFile(
  content: string,
  filename: string,
  mimeType: string
) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Helper function to calculate PDF stream length
 */
function calculatePDFLength(title: string, content: Record<string, any>): number {
  let length = 0;
  length += title.length + 50; // Title section
  Object.entries(content).forEach(([key, value]) => {
    const stringValue = typeof value === "object" ? JSON.stringify(value) : String(value);
    length += key.length + stringValue.length + 30;
  });
  return length;
}

/**
 * Helper function to escape special characters in PDF text
 */
function escapePDFText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .substring(0, 255); // PDF has limitations on text length
}

/**
 * Generate a summary report from properties data
 */
export function generatePropertyReport(properties: any[]) {
  const totalValue = properties.reduce((sum, p) => sum + (p.currentValue || 0), 0);
  const totalProperties = properties.length;
  const averageValue = totalProperties > 0 ? totalValue / totalProperties : 0;

  const propertyTypes = properties.reduce(
    (acc, p) => {
      acc[p.type] = (acc[p.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    "Report Date": new Date().toLocaleDateString(),
    "Total Properties": totalProperties,
    "Total Portfolio Value": `$${totalValue.toLocaleString()}`,
    "Average Property Value": `$${averageValue.toLocaleString()}`,
    "Property Types": JSON.stringify(propertyTypes),
  };
}

/**
 * Generate a summary report from deals data
 */
export function generateDealReport(deals: any[]) {
  const totalDeals = deals.length;
  const dealsByStatus = deals.reduce(
    (acc, d) => {
      acc[d.status || d.column] = (acc[d.status || d.column] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const strategies = deals.reduce(
    (acc, d) => {
      acc[d.strategy] = (acc[d.strategy] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    "Report Date": new Date().toLocaleDateString(),
    "Total Deals": totalDeals,
    "Deals by Status": JSON.stringify(dealsByStatus),
    "Strategies": JSON.stringify(strategies),
  };
}
