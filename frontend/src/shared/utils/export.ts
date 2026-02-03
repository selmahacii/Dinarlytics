/**
 * Exports data to CSV file.
 * @param data Array of objects to export
 * @param filename Name of the file
 */
export const exportToCSV = (data: any[], filename: string) => {
    if (!data || !data.length) {
        alert("Aucune donnée à exporter.");
        return;
    }

    // Extract headers
    const headers = Object.keys(data[0]);

    // Create CSV content
    const csvContent = [
        headers.join(','), // Header row
        ...data.map(row =>
            headers.map(fieldName => {
                const value = row[fieldName];
                // Escape quotes and wrap in quotes if contains comma
                const stringValue = JSON.stringify(value === null || value === undefined ? '' : value);
                return stringValue;
            }).join(',')
        )
    ].join('\n');

    // Create Blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportToPDF = (elementId: string, filename: string) => {
    // Placeholder - JSpdf not installed.
    // In a real app we'd use html2canvas + jspdf
    alert("L'export PDF nécessite une bibliothèque supplémentaire (jspdf). Veuillez utiliser l'export CSV ou la fonction d'impression du navigateur.");
    window.print();
};
