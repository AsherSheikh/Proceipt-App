export function convertToCSV<T extends Record<string, string | number>>(
  data: T[],
) {
  // Extract headers from the first object
  const headers = Object.keys(data[0]);

  // Create CSV rows
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers
        .map(
          header =>
            `"${(row[header] as string | number)
              .toString()
              .replace(/"/g, '""')}"`,
        )
        .join(','),
    ),
  ];

  // Combine headers and rows
  return csvRows.join('\n');
}
