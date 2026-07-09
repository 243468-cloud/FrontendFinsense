'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import { downloadCsv, downloadPdf } from '@/services/reportService';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
}

const periodOptions = [
  { id: 'day', label: 'Hoy' },
  { id: 'week', label: 'Esta semana' },
  { id: 'month', label: 'Este mes' },
  { id: 'year', label: 'Este año' },
  { id: 'custom', label: 'Personalizado' },
];

export function ExportModal({ open, onClose }: ExportModalProps) {
  const { addToast } = useUIStore();
  const [period, setPeriod] = useState<string>('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleExport = async (format: 'csv' | 'pdf') => {
    if (period === 'custom' && (!startDate || !endDate)) {
      addToast({ message: 'Por favor, selecciona fecha de inicio y fin', type: 'error' });
      return;
    }

    if (format === 'csv') setIsExportingCsv(true);
    else setIsExportingPdf(true);

    try {
      if (format === 'csv') {
        await downloadCsv(period, startDate, endDate);
      } else {
        await downloadPdf(period, startDate, endDate);
      }
      addToast({ message: `Reporte ${format.toUpperCase()} generado correctamente`, type: 'success' });
      onClose();
    } catch (e) {
      addToast({ message: `Error al generar el reporte ${format.toUpperCase()}`, type: 'error' });
    } finally {
      setIsExportingCsv(false);
      setIsExportingPdf(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="bg-surface w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[90vh]"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="font-syne font-bold text-xl text-text-primary">Exportar Reporte</h2>
                <p className="font-dm text-sm text-text-secondary mt-1">Descarga tus datos</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-2 rounded-xl transition-colors touch-target"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <h3 className="font-dm font-bold text-sm text-text-primary mb-3">1. Selecciona el período</h3>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {periodOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setPeriod(opt.id)}
                    className={cn(
                      "py-2.5 px-3 rounded-xl font-dm text-sm text-center transition-all border",
                      period === opt.id
                        ? "bg-primary border-primary text-white font-bold shadow-md shadow-primary/20"
                        : "bg-surface border-border text-text-secondary hover:bg-surface-2"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {period === 'custom' && (
                <div className="flex gap-3 mb-6">
                  <div className="flex-1">
                    <label className="block font-dm text-xs font-bold text-text-secondary mb-1">Desde</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2.5 font-dm text-sm text-text-primary focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block font-dm text-xs font-bold text-text-secondary mb-1">Hasta</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2.5 font-dm text-sm text-text-primary focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              )}

              <h3 className="font-dm font-bold text-sm text-text-primary mb-3">2. Selecciona el formato</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => handleExport('csv')}
                  disabled={isExportingCsv || isExportingPdf}
                  className="flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-border bg-surface hover:bg-surface-2 transition-all disabled:opacity-50"
                >
                  {isExportingCsv ? <Loader2 className="animate-spin text-primary" size={28} /> : <FileSpreadsheet className="text-success" size={28} />}
                  <span className="font-dm font-bold text-sm text-text-primary">Excel / CSV</span>
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  disabled={isExportingCsv || isExportingPdf}
                  className="flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-border bg-surface hover:bg-surface-2 transition-all disabled:opacity-50"
                >
                  {isExportingPdf ? <Loader2 className="animate-spin text-primary" size={28} /> : <FileText className="text-red-500" size={28} />}
                  <span className="font-dm font-bold text-sm text-text-primary">Reporte PDF</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
