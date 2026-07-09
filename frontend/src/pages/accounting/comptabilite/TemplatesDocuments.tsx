import React, { useState } from 'react';
import Card from '@shared/components/UI/Card';
import { DocumentTextIcon, PrinterIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useTranslation } from '@shared/hooks/useTranslation';

const TemplatesDocuments: React.FC = () => {
    const { t } = useTranslation();
    const [selectedTemplate, setSelectedTemplate] = useState('bon_commande');
    const [customCSS, setCustomCSS] = useState(`
    .header { color: #1a56db; }
    .table-header { background-color: #f3f4f6; }
    .total-row { font-weight: bold; }
  `);

    const [customHTML, setCustomHTML] = useState('');

    const handlePrint = () => {
        const printWindow = window.open('', '', 'width=800,height=600');
        if (printWindow) {
            printWindow.document.write(`
        <html>
          <head>
            <style>${customCSS}</style>
          </head>
          <body>
            ${customHTML}
          </body>
        </html>
      `);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">{t('accounting.document_templates.title')}</h1>
                <button
                    onClick={handlePrint}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <PrinterIcon className="h-5 w-5 mr-2" />
                    {t('accounting.document_templates.print_preview')}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title={t('accounting.document_templates.html_editor')}>
                    <textarea
                        value={customHTML}
                        onChange={(e) => setCustomHTML(e.target.value)}
                        className="w-full h-64 p-4 border rounded-lg font-mono text-sm"
                        placeholder={t('accounting.document_templates.html_placeholder')}
                    />
                </Card>

                <Card title={t('accounting.document_templates.css_editor')}>
                    <textarea
                        value={customCSS}
                        onChange={(e) => setCustomCSS(e.target.value)}
                        className="w-full h-64 p-4 border rounded-lg font-mono text-sm"
                        placeholder={t('accounting.document_templates.css_placeholder')}
                    />
                </Card>
            </div>

            <Card title={t('accounting.document_templates.realtime_preview')}>
                <div className="border p-8 rounded-lg bg-white shadow-sm min-h-[400px]">
                    <style>{customCSS}</style>
                    <div dangerouslySetInnerHTML={{ __html: customHTML }} />
                </div>
            </Card>
        </div>
    );
};

export default TemplatesDocuments;

