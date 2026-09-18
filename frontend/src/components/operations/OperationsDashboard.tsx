import React, { useState, useEffect } from 'react';
import { metricsApi, driveApi } from '../../services/api';
import { OperationalMetric, FileRecord } from '../../types';
import {
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  FolderSync,
  Upload,
  ExternalLink,
  Plus,
  BarChart2,
} from 'lucide-react';

export const OperationsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<OperationalMetric[]>([]);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOpsData = async () => {
    try {
      setLoading(true);
      const [mRes, fRes] = await Promise.all([
        metricsApi.getDepartmentMetrics('Operations'),
        driveApi.listFiles({ folder: 'Operations' }),
      ]);
      setMetrics(mRes.metrics);
      setFiles(fRes.files);
    } catch (err) {
      console.error('Error fetching operations data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpsData();
  }, []);

  const handleUpdateProgress = async (id: string, current: number, target: number) => {
    const nextVal = Math.min(current + 5, target);
    try {
      await metricsApi.updateMetric(id, {
        currentValue: nextVal,
        status: nextVal >= target ? 'COMPLETED' : 'ON_TRACK',
      });
      setMetrics((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, currentValue: nextVal, status: nextVal >= target ? 'COMPLETED' : 'ON_TRACK' } : m
        )
      );
    } catch (err) {
      alert('Failed to update metric progress');
    }
  };

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-jade-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="liquid-glass-pill rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Operations Department
          </span>
          <span className="text-xs font-medium text-slate-400">| Lead: Ridmi Kashani (Operational Manager)</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Operational Board & Milestones
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Track departmental milestones, SLA fulfillment, and operational documentation in Google Drive
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {metrics.map((metric) => {
          const pct = Math.min(Math.round((metric.currentValue / metric.targetValue) * 100), 100);
          return (
            <div
              key={metric.id}
              className="liquid-glass-card rounded-3xl p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {metric.metricType}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {metric.title}
                  </h3>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    metric.status === 'COMPLETED'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {metric.status}
                </span>
              </div>

              <div className="mt-5">
                <div className="flex items-baseline justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {metric.currentValue} / {metric.targetValue} {metric.unit}
                  </span>
                  <span className="font-bold text-jade-600 dark:text-jade-400">{pct}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100/80 dark:bg-charcoal-700/60 overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-jade-500 to-emerald-400 transition-all duration-300 shadow-sm"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  disabled={metric.status === 'COMPLETED'}
                  onClick={() => handleUpdateProgress(metric.id, metric.currentValue, metric.targetValue)}
                  className="rounded-xl border border-slate-200/80 bg-white/60 px-3.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-white hover:text-jade-600 dark:border-charcoal-700/80 dark:bg-charcoal-800/60 dark:text-slate-200 dark:hover:bg-charcoal-700 dark:hover:text-jade-400 disabled:opacity-40 transition backdrop-blur-md"
                >
                  + Increment Progress
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Google Drive Operations Repository */}
      <div className="liquid-glass rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FolderSync className="h-5 w-5 text-amber-500" />
              Operations Google Drive Documents
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Files stored directly in JADE_System/Operations folder
            </p>
          </div>
        </div>

        {files.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No operations documents uploaded yet. Use the top Upload button to add files.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/40 p-3.5 hover:bg-white/70 dark:border-white/5 dark:bg-charcoal-800/40 dark:hover:bg-charcoal-800/70 transition backdrop-blur-md"
              >
                <div className="overflow-hidden">
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {file.originalName}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Uploaded by {file.uploader?.name || 'Operations'} • {(file.sizeBytes / 1024).toFixed(0)} KB
                  </p>
                </div>
                <a
                  href={file.driveWebView}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl p-2 text-slate-400 hover:text-jade-600 hover:bg-jade-50/50 dark:hover:text-jade-400 dark:hover:bg-jade-950/30 transition"
                  title="Open in Google Drive"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
