/**
 * PNG export button component
 */

import { useCallback, useState } from 'react';
import html2canvas from 'html2canvas';

interface ExportButtonProps {
  targetId: string;
  filename?: string;
}

export default function ExportButton({ targetId, filename = 'schedule' }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = useCallback(async () => {
    const element = document.getElementById(targetId);
    if (!element) {
      alert('Export target not found.');
      return;
    }

    setExporting(true);

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const link = document.createElement('a');
      link.download = `${filename}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export image.');
    } finally {
      setExporting(false);
    }
  }, [targetId, filename]);

  return (
    <button
      className="btn-export"
      onClick={handleExport}
      disabled={exporting}
      title="Save as PNG"
    >
      {exporting ? 'Exporting...' : '📷 Save PNG'}
    </button>
  );
}
