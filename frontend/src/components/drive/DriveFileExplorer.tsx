import React, { useState, useEffect } from 'react';
import { driveApi } from '../../services/api';
import { FileRecord } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  FolderSync,
  Search,
  ExternalLink,
  Download,
  Trash2,
  FileText,
  Filter,
  UploadCloud,
  FileCode,
  FileSpreadsheet,
  Image as ImageIcon,
} from 'lucide-react';

interface DriveFileExplorerProps {
  onOpenUpload: () => void;
}

export const DriveFileExplorer: React.FC<DriveFileExplorerProps> = ({ onOpenUpload }) => {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [folderFilter, setFolderFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const res = await driveApi.listFiles({
        folder: folderFilter,
        category: categoryFilter,
        search: searchQuery || undefined,
      });
      setFiles(res.files);
    } catch (err) {
      console.error('Error fetching drive files:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [folderFilter, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFiles();
  };

  const handleDelete = async (fileId: string) => {
    if (!window.confirm('Delete this file from Google Drive and system records?')) return;
    try {
      await driveApi.deleteFile(fileId);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete file.');
    }
  };

  const getFileIcon = (mime: string) => {
    if (mime.includes('spreadsheet') || mime.includes('excel')) {
      return <FileSpreadsheet className="h-5 w-5 text-emerald-600" />;
    }
    if (mime.startsWith('image/')) {
      return <ImageIcon className="h-5 w-5 text-blue-500" />;
    }
    return <FileText className="h-5 w-5 text-jade-600" />;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="liquid-glass-pill px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Cloud Storage
            </span>
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              Linked Account: umeshmabatuwana@gmail.com
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Google Drive Repository
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Centrally browse, preview, and download documents synced across company departments
          </p>
        </div>

        <button
          onClick={onOpenUpload}
          className="liquid-glass-btn-primary flex items-center gap-2 self-start rounded-xl px-4 py-2 text-xs font-bold text-white shadow-md transition active:scale-95"
        >
          <UploadCloud className="h-4 w-4" />
          <span>Upload New File</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="liquid-glass flex flex-col gap-3.5 rounded-3xl p-4 sm:p-5 shadow-lg sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by file name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="liquid-glass-input w-full rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Folder Filter */}
          <select
            value={folderFilter}
            onChange={(e) => setFolderFilter(e.target.value)}
            className="liquid-glass-input rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="All">All Folders</option>
            <option value="Finance">Finance</option>
            <option value="Operations">Operations</option>
            <option value="Sales">Sales</option>
            <option value="Profiles">Profiles</option>
            <option value="General">General</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="liquid-glass-input rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Invoice">Invoice</option>
            <option value="Receipt">Receipt</option>
            <option value="Proposal">Proposal</option>
            <option value="Report">Report</option>
            <option value="Avatar">Avatar</option>
            <option value="General">General</option>
          </select>
        </div>
      </div>

      {/* Files Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-jade-600 border-t-transparent" />
        </div>
      ) : files.length === 0 ? (
        <div className="liquid-glass rounded-3xl p-12 text-center">
          <FolderSync className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
          <h3 className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-200">No documents found</h3>
          <p className="mt-1 text-xs text-slate-400">Try adjusting your filters or upload a document.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {files.map((file) => {
            const canDelete = user?.role === 'MANAGING_DIRECTOR' || user?.id === file.uploaderId;
            return (
              <div
                key={file.id}
                className="liquid-glass-card group flex flex-col justify-between rounded-3xl p-6 relative overflow-hidden"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 shadow-inner">
                      {getFileIcon(file.mimeType)}
                    </div>
                    <span className="liquid-glass-pill rounded-full px-2.5 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                      {file.driveFolder}
                    </span>
                  </div>

                  <h4 className="mt-4 text-xs font-bold text-slate-900 dark:text-white line-clamp-1" title={file.originalName}>
                    {file.originalName}
                  </h4>
                  <div className="mt-2 space-y-1 text-[11px] text-slate-400">
                    <p>Category: <span className="text-slate-700 dark:text-slate-200 font-semibold">{file.category}</span></p>
                    <p>Uploaded by: {file.uploader?.name || 'Staff'}</p>
                    <p>Size: {(file.sizeBytes / 1024).toFixed(1)} KB • {new Date(file.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-white/20 dark:border-white/10 pt-3.5">
                  <a
                    href={file.driveWebView}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 liquid-glass-pill px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:scale-105 transition"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>View in Drive</span>
                  </a>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={`/api/drive/download/${file.driveFileId}`}
                      className="rounded-xl p-2 text-slate-400 hover:bg-white/60 hover:text-slate-800 dark:hover:bg-white/10 dark:hover:text-white transition"
                      title="Direct Download"
                    >
                      <Download className="h-4 w-4" />
                    </a>

                    {canDelete && (
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="rounded-xl p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 dark:hover:bg-rose-500/20 transition"
                        title="Delete Document"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
