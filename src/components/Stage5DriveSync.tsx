import React, { useState } from 'react';
import { DriveSyncResult, GeneratedProject } from '../types';
import {
  HardDrive,
  Users,
  CheckCircle2,
  ExternalLink,
  Loader2,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Key,
  ShieldCheck,
} from 'lucide-react';
import { executeClientSideDriveSync } from '../utils/driveClient';

interface Stage5DriveSyncProps {
  project: GeneratedProject | null;
  syncResult: DriveSyncResult | null;
  onSetSyncResult: (result: DriveSyncResult) => void;
  onBack: () => void;
  onStartOver: () => void;
  onOpenExtensionModal?: () => void;
}

export const Stage5DriveSync: React.FC<Stage5DriveSyncProps> = ({
  project,
  syncResult,
  onSetSyncResult,
  onBack,
  onStartOver,
  onOpenExtensionModal,
}) => {
  const [targetEmail, setTargetEmail] = useState<string>('athanu000@gmail.com');
  const [accessToken, setAccessToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
    fileName: string;
  } | null>(null);

  const handleExecuteSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    setIsLoading(true);
    setErrorMsg(null);
    setUploadProgress({
      current: 0,
      total: Object.keys(project.files || {}).length,
      fileName: 'Initializing folder...',
    });

    try {
      const result = await executeClientSideDriveSync({
        projectName: project.projectName || 'meta-ai-app',
        files: project.files,
        targetEmail: targetEmail.trim(),
        accessToken: accessToken.trim() || undefined,
        onProgress: (current, total, fileName) => {
          setUploadProgress({ current, total, fileName });
        },
      });

      onSetSyncResult(result);
    } catch (err: any) {
      console.error('Client-side Drive Sync error:', err);
      setErrorMsg(err.message || 'Failed to sync to Google Drive.');
    } finally {
      setIsLoading(false);
      setUploadProgress(null);
    }
  };

  const totalFiles = Object.keys(project?.files || {}).length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5" />
              Stage 5 • Google Drive Client Auto-Sync
            </span>
            <span className="text-xs font-mono bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-cyan-400" />
              Exponential Backoff Resiliency
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenExtensionModal && (
              <button
                onClick={onOpenExtensionModal}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Auto-Bridge
              </button>
            )}

            <button
              onClick={onBack}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-3 py-1 bg-slate-800 rounded-lg border border-slate-700 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Code Workbench
            </button>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Client-Side Google Drive Auto-Sync & Access Control
        </h2>
        <p className="text-slate-400 text-sm mt-2 max-w-3xl leading-relaxed">
          Create a Google Drive project folder, upload all {totalFiles} generated codebase files with automatic retry resiliency, and grant editor permissions to{' '}
          <span className="text-emerald-400 font-semibold">athanu000@gmail.com</span> using client-side OAuth / REST v3 APIs.
        </p>

        {/* Sync Form */}
        <form onSubmit={handleExecuteSync} className="mt-6 max-w-2xl space-y-4">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                Target Access Recipient Email (Editor / Writer Permissions):
              </label>
              <input
                type="email"
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
                required
                placeholder="athanu000@gmail.com"
                className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1 pt-2 border-t border-slate-800/80">
              <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-cyan-400" />
                Optional Google OAuth Access Token (Leave empty for Client Direct Mode):
              </label>
              <input
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="ya29.a0..."
                className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none font-mono"
              />
            </div>

            {/* Visual Upload Progress Bar */}
            {isLoading && uploadProgress && (
              <div className="p-3 bg-slate-900 border border-indigo-500/30 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-cyan-300">
                    Uploading {uploadProgress.current} of {uploadProgress.total} files...
                  </span>
                  <span className="font-mono text-slate-400 truncate max-w-[200px]">
                    {uploadProgress.fileName}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400 transition-all duration-300"
                    style={{
                      width: `${
                        uploadProgress.total > 0
                          ? Math.round((uploadProgress.current / uploadProgress.total) * 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !targetEmail.trim()}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/20 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Batch Uploading Project Files...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Start Client Drive Auto-Sync
                </>
              )}
            </button>

            {errorMsg && (
              <div className="p-4 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-200 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-rose-300">
                  <span>⚠️ Google Drive Sync Warning / Notice</span>
                </div>
                <p className="leading-relaxed">{errorMsg}</p>
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-rose-800 hover:bg-rose-700 text-white rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Retry Drive Sync
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAccessToken('');
                      setErrorMsg(null);
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition cursor-pointer"
                  >
                    Use Zero-API Direct Client Mode
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Sync Status & Audit Console */}
      {syncResult && (
        <div className="space-y-6">
          <div className="p-6 bg-slate-900 border border-emerald-500/40 rounded-2xl shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Google Drive Auto-Sync Completed!</h3>
                  <p className="text-xs text-slate-400">{syncResult.message}</p>
                </div>
              </div>

              {syncResult.folderUrl && (
                <a
                  href={syncResult.folderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-emerald-600/20"
                >
                  Open Google Drive Folder
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Audit Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5">
                <span className="text-slate-500 text-[10px] uppercase font-bold">Drive Folder ID</span>
                <div className="font-mono font-semibold text-emerald-300 truncate">{syncResult.folderId}</div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5">
                <span className="text-slate-500 text-[10px] uppercase font-bold">Files Uploaded</span>
                <div className="font-semibold text-white">{syncResult.filesCount} Code Artifacts</div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5">
                <span className="text-slate-500 text-[10px] uppercase font-bold">Permissions Granted</span>
                <div className="font-semibold text-cyan-300 truncate">{syncResult.grantedEmail} (Writer)</div>
              </div>
            </div>

            {/* Sync Audit Logs */}
            {syncResult.logs && syncResult.logs.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Drive API Execution Audit Logs:
                </span>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-1.5 max-h-48 overflow-y-auto">
                  {syncResult.logs.map((log, lIdx) => (
                    <div key={lIdx} className="flex items-start gap-2">
                      <span className="text-emerald-500">›</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-white">Pipeline Execution Complete</div>
              <p className="text-xs text-slate-400 mt-0.5">
                All 5 stages completed successfully from Strategy Engine to Google Drive Auto-Sync.
              </p>
            </div>

            <button
              onClick={onStartOver}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-400" /> Start New Meta-AI Project
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
