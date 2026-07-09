import api from '@/lib/apiClient';
import type { Period } from '@/types/analytics.types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { TOKEN_KEY } from '@/lib/constants';

export async function downloadCsv(period: string = 'month', startDate?: string, endDate?: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
  
  let query = `period=${period}`;
  if (period === 'custom' && startDate && endDate) {
    query = `startDate=${startDate}&endDate=${endDate}`;
  }

  const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/reports/csv?${query}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error('Error al generar CSV');

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = `finsense-reporte-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(objectUrl);
}

export async function getSummaryReport(period: string = 'month', startDate?: string, endDate?: string) {
  let query = `period=${period}`;
  if (period === 'custom' && startDate && endDate) {
    query = `startDate=${startDate}&endDate=${endDate}`;
  }
  const res = await api.get(`/reports/summary?${query}`);
  return res.data;
}

export async function downloadPdf(period: string = 'month', startDate?: string, endDate?: string) {
  // Fetch summary data to get all transactions and totals for the PDF
  const data = await getSummaryReport(period, startDate, endDate);
  
  const doc = new jsPDF();

  // Título
  doc.setFontSize(22);
  doc.setTextColor(0, 87, 255); // Color primario
  doc.text('FinSense - Reporte Financiero', 14, 20);

  // Período
  doc.setFontSize(11);
  doc.setTextColor(100);
  let periodText = period;
  if (period === 'custom' && startDate && endDate) {
    periodText = `${startDate} al ${endDate}`;
  }
  doc.text(`Período: ${periodText}`, 14, 28);
  doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-MX')}`, 14, 34);

  // Resumen (Balance)
  doc.setFontSize(14);
  doc.setTextColor(40);
  doc.text('Resumen General', 14, 46);
  
  doc.setFontSize(11);
  doc.setTextColor(0, 150, 0);
  doc.text(`Ingresos: $${data.income?.toFixed(2)}`, 14, 54);
  doc.setTextColor(200, 0, 0);
  doc.text(`Gastos: $${data.expenses?.toFixed(2)}`, 14, 60);
  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.text(`Balance Total: $${data.balance?.toFixed(2)}`, 14, 66);
  doc.setFont('helvetica', 'normal');

  // Tabla de Transacciones
  doc.setFontSize(14);
  doc.setTextColor(40);
  doc.text('Detalle de Transacciones', 14, 80);

  const tableColumn = ["Fecha", "Tipo", "Categoría", "Descripción", "Monto"];
  const tableRows = data.transactions?.map((t: any) => [
    new Date(t.date).toLocaleDateString('es-MX'),
    t.type === 'income' ? 'Ingreso' : 'Gasto',
    t.category,
    t.description || '',
    t.type === 'income' ? `+${t.amount}` : `-${t.amount}`
  ]) || [];

  autoTable(doc, {
    startY: 85,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [0, 87, 255] },
    alternateRowStyles: { fillColor: [245, 245, 245] }
  });

  doc.save(`finsense-reporte-${period}-${new Date().toISOString().slice(0, 10)}.pdf`);
}

