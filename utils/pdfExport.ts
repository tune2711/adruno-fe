import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

type Receipt = {
  html: string;
  widthPx?: number;
  heightPx?: number;
};

/**
 * Render multiple receipt HTML blocks, capture them with html2canvas and produce a single PDF blob.
 * Returns a Blob that callers can download.
 */
export async function receiptsToPdf(receipts: Receipt[], options?: { filename?: string }) {
  // Create an offscreen container
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-10000px';
  container.style.top = '0';
  container.style.width = '800px';
  container.style.padding = '8px';
  container.style.background = '#fff';
  container.style.boxSizing = 'border-box';
  document.body.appendChild(container);

  try {
    // Insert each receipt into container as its own block
    receipts.forEach(r => {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = r.html;
      // Ensure consistent width for rendering
      wrapper.style.width = (r.widthPx ? `${r.widthPx}px` : '480px');
      wrapper.style.margin = '0 auto 12px auto';
      container.appendChild(wrapper);
    });

    // Wait a tick for fonts/images to load
    await new Promise(resolve => setTimeout(resolve, 500));

    const pages: HTMLCanvasElement[] = [];
    const children = Array.from(container.children) as HTMLElement[];
    for (const child of children) {
      // Use html2canvas to capture each receipt block
      const canvas = await html2canvas(child, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
      pages.push(canvas);
    }

    // Create PDF (A4 portrait) at 72dpi -> 595x842 points; jsPDF default units are 'pt'
    const pdf = new jsPDF({ unit: 'pt', format: 'a4' });

    for (let i = 0; i < pages.length; i++) {
      const canvas = pages[i];
      const imgData = canvas.toDataURL('image/png');
      // Fit image into A4 while preserving aspect
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // calculate dimensions
      const imgW = canvas.width;
      const imgH = canvas.height;
      const ratio = Math.min(pdfWidth / imgW, pdfHeight / imgH);
      const drawW = imgW * ratio;
      const drawH = imgH * ratio;
      const x = (pdfWidth - drawW) / 2;
      const y = 20; // small top margin

      pdf.addImage(imgData, 'PNG', x, y, drawW, drawH);
      if (i < pages.length - 1) pdf.addPage();
    }

    // Return blob
    const blob = pdf.output('blob');
    return blob;
  } finally {
    container.remove();
  }
}

export default receiptsToPdf;
