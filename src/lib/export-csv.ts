/**
 * Exports data array to CSV file with UTF-8 BOM so Bangla characters display properly in MS Excel and spreadsheet tools
 */
export function exportToCsv<T extends Record<string, any>>(
  filename: string,
  rows: T[],
  headers: { key: keyof T | string; label: string; formatter?: (value: any, row: T) => string }[]
): void {
  if (!rows || !rows.length) {
    alert('রপ্তানি করার মতো কোনো তথ্য নেই (No data to export)');
    return;
  }

  // Header row
  const headerLine = headers.map(h => `"${h.label.replace(/"/g, '""')}"`).join(',');

  // Data rows
  const dataLines = rows.map(row => {
    return headers
      .map(h => {
        let val = (row as any)[h.key];
        if (h.formatter) {
          val = h.formatter(val, row);
        }
        if (val === null || val === undefined) {
          val = '';
        }
        const strVal = String(val).replace(/"/g, '""');
        return `"${strVal}"`;
      })
      .join(',');
  });

  const csvContent = '\uFEFF' + [headerLine, ...dataLines].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
