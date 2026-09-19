import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Save,
  HardDrive,
  Cloud,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  X,
  FileCheck,
  ShieldCheck,
} from 'lucide-react';
import { GameSaveData, exportDataToFile, importDataFromFile, resetAllData } from '../utils/storageSystem';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  lastSavedAt: string | null;
  serverSynced: boolean;
  onManualSave: () => Promise<void>;
  getCurrentSaveData: () => GameSaveData;
  onRestoreData: (data: GameSaveData) => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  isOpen,
  onClose,
  lastSavedAt,
  serverSynced,
  onManualSave,
  getCurrentSaveData,
  onRestoreData,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSaveClick = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    try {
      await onManualSave();
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 3000);
    } catch (err: any) {
      setErrorMessage('Error al guardar: ' + (err.message || 'Error desconocido'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    try {
      const data = getCurrentSaveData();
      exportDataToFile(data);
    } catch (err: any) {
      setErrorMessage('No se pudo exportar la partida: ' + err.message);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMessage(null);

    try {
      const restored = await importDataFromFile(file);
      onRestoreData(restored);
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 3000);
    } catch (err: any) {
      setErrorMessage('Archivo inválido: ' + (err.message || 'Error al procesar JSON.'));
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleResetConfirm = async () => {
    try {
      await resetAllData();
      window.location.reload();
    } catch (err: any) {
      setErrorMessage('No se pudo reiniciar: ' + err.message);
    }
  };

  const formattedDate = lastSavedAt
    ? new Date(lastSavedAt).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: 'short',
      })
    : 'Guardando automáticamente...';

  return (
    <AnimatePresence>
      <div
        id="data-management-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          id="data-management-modal-card"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100 font-serif">
                  Gestión de Datos y Guardado
                </h3>
                <p className="text-xs text-slate-400">
                  Tu progreso se guarda automáticamente en memoria local y servidor
                </p>
              </div>
            </div>
            <button
              id="close-data-modal-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            {/* Status Card */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Estado de Sincronización:</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Activo y Seguro
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <HardDrive className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="truncate">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Local</p>
                    <p className="text-slate-200 font-semibold truncate">Navegador persistente</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <Cloud className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div className="truncate">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Servidor</p>
                    <p className="text-slate-200 font-semibold truncate">
                      {serverSynced ? 'Copia en disco' : 'Sincronizando...'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
                <span>Último guardado confirmado:</span>
                <span className="font-mono text-slate-200">{formattedDate}</span>
              </div>
            </div>

            {/* Success or Error Notice */}
            {saveSuccessNotice && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>¡Toda tu información ha sido guardada exitosamente!</span>
              </motion.div>
            )}

            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2.5">
              {/* Manual Save Now */}
              <button
                id="btn-save-now"
                onClick={handleSaveClick}
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Guardando partida...' : 'Guardar Información Ahora'}
              </button>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Export JSON */}
                <button
                  id="btn-export-backup"
                  onClick={handleExport}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-medium text-xs transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Exportar Copia (JSON)</span>
                </button>

                {/* Import JSON */}
                <button
                  id="btn-import-backup"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-medium text-xs transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-cyan-400" />
                  <span>Importar Copia (JSON)</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept=".json"
                  className="hidden"
                />
              </div>
            </div>

            {/* Reset Section */}
            <div className="pt-2 border-t border-slate-800">
              {!confirmReset ? (
                <button
                  id="btn-trigger-reset-flow"
                  onClick={() => setConfirmReset(true)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-red-400/80 hover:text-red-400 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reiniciar todos los datos de la partida</span>
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-red-400 text-xs font-semibold">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    ¿Estás seguro de reiniciar todo el progreso?
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Se borrarán los niveles, hábitos y estadísticas tanto del navegador como del servidor.
                  </p>
                  <div className="flex gap-2 justify-end pt-1">
                    <button
                      onClick={() => setConfirmReset(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                    >
                      Cancelar
                    </button>
                    <button
                      id="btn-confirm-full-reset"
                      onClick={handleResetConfirm}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs"
                    >
                      Sí, reiniciar partida
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
