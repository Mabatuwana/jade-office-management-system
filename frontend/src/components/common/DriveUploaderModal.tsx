import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { driveApi } from '../../services/api';
import { X, UploadCloud, Check, AlertCircle, Loader2, FileText } from 'lucide-react';
import { FileRecord } from '../../types';

interface DriveUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: (file: FileRecord) => void;
  defaultFolder?: 'Finance' | 'Operations' | 'Sales' | 'Profiles' | 'General';
}

export const DriveUploaderModal: React.FC<DriveUploaderModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  defaultFolder = 'General',
}) => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [folder, setFolder] = useState<'Finance' | 'Operations' | 'Sales' | 'Profiles' | 'General'>(
    defaultFolder
  );
  const [category, setCategory] = useState<string>('Report');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a document to upload.');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      const res = await driveApi.uploadDocument(file, folder, category);
      setSuccess(`"${file.name}" uploaded to Google Drive (${folder} folder)`);
      if (onUploadSuccess) {
        onUploadSuccess(res.file);
      }

      setTimeout(() => {
        setSuccess(null);
        setFile(null);
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl liquid-glass border border-white/20 p-6 sm:p-7 shadow-2xl transition-all">
        <div className="flex items-center justify-between border-b border-white/15 dark:border-white/10 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Google Drive Document Upload
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Synchronize office documentation directly to Google Cloud storage
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-white/50 dark:hover:bg-white/10 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-500 dark:text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-600 dark:text-emerald-400">
            <Check className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/40 bg-white/40 p-6 text-center transition hover:border-emerald-500/60 dark:border-white/10 dark:bg-white/[0.02] backdrop-blur-md"
          >
            {file ? (
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/25 dark:text-emerald-400 border border-emerald-500/20 shadow-inner">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[240px]">
                    {file.name}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/25 dark:text-emerald-400 border border-emerald-500/20 shadow-inner">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <p className="mt-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                  Drag & drop file here or click to browse
                </p>
                <p className="text-[11px] text-slate-400">PDF, XLSX, DOCX, Images (up to 25MB)</p>
              </>
            )}

            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileChange}
            />
            <label
              htmlFor="file-upload"
              className="liquid-glass-card mt-3.5 cursor-pointer rounded-xl px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-white/80 dark:text-slate-200 dark:hover:bg-white/10 transition"
            >
              Select File
            </label>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Drive Destination Folder
              </label>
              <select
                value={folder}
                onChange={(e) => setFolder(e.target.value as any)}
                className="liquid-glass-input w-full rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none dark:text-slate-200"
              >
                {(user.role === 'FINANCE_ASSISTANT' || user.role === 'MANAGING_DIRECTOR') && (
                  <option value="Finance">JADE_System / Finance</option>
                )}
                {(user.role === 'OPERATIONAL_MANAGER' || user.role === 'MANAGING_DIRECTOR') && (
                  <option value="Operations">JADE_System / Operations</option>
                )}
                {(user.role === 'TECH_SALES_MANAGER' || user.role === 'MANAGING_DIRECTOR') && (
                  <option value="Sales">JADE_System / Sales</option>
                )}
                <option value="General">JADE_System / General</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Document Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="liquid-glass-input w-full rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none dark:text-slate-200"
              >
                <option value="Invoice">Invoice / Bill</option>
                <option value="Receipt">Receipt / Voucher</option>
                <option value="Proposal">Client Proposal</option>
                <option value="Report">Operational / Audit Report</option>
                <option value="Contract">Legal & Contract</option>
                <option value="General">General Document</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-white/15 dark:border-white/10 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-white/50 dark:text-slate-300 dark:hover:bg-white/10 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || isUploading}
              className="liquid-glass-btn-primary flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-md transition disabled:opacity-50 active:scale-95"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Uploading to Drive...</span>
                </>
              ) : (
                <span>Upload to Google Drive</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
