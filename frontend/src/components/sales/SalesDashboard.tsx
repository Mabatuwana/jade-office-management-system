import React, { useState, useEffect } from 'react';
import { metricsApi, driveApi } from '../../services/api';
import { OperationalMetric, FileRecord } from '../../types';
import {
  TrendingUp,
  Target,
  FileCheck,
  FolderSync,
  ExternalLink,
  DollarSign,
  Users,
} from 'lucide-react';

export const SalesDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<OperationalMetric[]>([]);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const [mRes, fRes] = await Promise.all([
        metricsApi.getDepartmentMetrics('TechSales'),
        driveApi.listFiles({ folder: 'Sales' }),
      ]);
      setMetrics(mRes.metrics);
      setFiles(fRes.files);
    } catch (err) {
      console.error('Error fetching sales data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, []);

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
          <span className="liquid-glass-pill rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            Technical & Sales
          </span>
          <span className="text-xs font-medium text-slate-400">| Lead: Nishan Rajapaksha (Technical & Sales Manager)</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Pipeline & Client Proposals
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Enterprise deal pipeline, technical deliverables, and client proposals synchronized to Google Drive
        </p>
      </div>

      {/* Sales Metrics Cards */}
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
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-500/20 backdrop-blur-md">
                  <Target className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-baseline justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {metric.unit === 'LKR' ? `Rs. ${metric.currentValue.toLocaleString()}` : metric.unit === 'USD' ? `$${metric.currentValue.toLocaleString()}` : `${metric.currentValue} ${metric.unit}`}
                  </span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">{pct}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100/80 dark:bg-charcoal-700/60 overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300 shadow-sm"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-2.5 text-[10px] text-slate-400">
                  Target: {metric.unit === 'LKR' ? `Rs. ${metric.targetValue.toLocaleString()}` : metric.unit === 'USD' ? `$${metric.targetValue.toLocaleString()}` : `${metric.targetValue} ${metric.unit}`}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Google Drive Proposals Repository */}
      <div className="liquid-glass rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FolderSync className="h-5 w-5 text-purple-500" />
              Technical & Client Proposals in Google Drive
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Direct access to proposals stored in JADE_System/Sales
            </p>
          </div>
        </div>

        {files.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No proposal documents uploaded yet. Use the top Upload button to sync new proposals.
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
                    Category: {file.category} • {(file.sizeBytes / 1024).toFixed(0)} KB
                  </p>
                </div>
                <a
                  href={file.driveWebView}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50/50 dark:hover:text-purple-400 dark:hover:bg-purple-950/30 transition"
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
