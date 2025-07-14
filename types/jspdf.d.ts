import 'jspdf';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: {
      startY?: number;
      head?: string[][];
      body?: any[][];
      styles?: {
        fontSize?: number;
        cellPadding?: number;
      };
      headStyles?: {
        fillColor?: number[];
        textColor?: number;
      };
      columnStyles?: {
        [key: string]: {
          cellWidth?: number | 'auto';
        };
      };
    }) => void;
    lastAutoTable: {
      finalY: number;
    };
  }
}
