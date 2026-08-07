import React, { useState } from 'react';
import { ProjectDraft, StageId } from '../types';
import {
  Compass,
  HelpCircle,
  FileCode,
  Code2,
  HardDrive,
  Sparkles,
  ArrowRight,
  FolderSync,
  Trash2,
  PlusCircle,
  ChevronDown,
} from 'lucide-react';

interface HeaderProps {
  currentStage: StageId;
  setStage: (stage: StageId) => void;
  completedStages: Record<StageId, boolean>;
  projectName?: string;
  savedDrafts?: ProjectDraft[];
  activeDraftId?: string | null;
  onLoadDraft?: (draft: ProjectDraft) => void;
  onDeleteDraft?: (draftId: string) => void;
  onNewProject: () => void;
  onOpenExtensionModal?: () => void;
  onOpenHowItWorks?: () => void;
}

export const stages: Array<{ id: StageId; number: number; label: string; agent: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'strategy', number: 1, label: 'Strategy Engine', agent: 'Gemini Web', icon: Compass },
  { id: 'domain', number: 2, label: 'Domain Collector', agent: 'DeepSeek Web', icon: HelpCircle },
  { id: 'spec', number: 3, label: 'Master Spec Architect', agent: 'Claude Web', icon: FileCode },
  { id: 'code', number: 4, label: 'Execution Engine', agent: 'ChatGPT Web', icon: Code2 },
  { id: 'drive', number: 5, label: 'Drive Auto-Sync', agent: 'Drive REST v3', icon: HardDrive },
];

export const Header: React.FC<HeaderProps> = ({
  currentStage,
  setStage,
  completedStages,
  projectName,
  savedDrafts = [],
  activeDraftId,
  onLoadDraft,
  onDeleteDraft,
  onNewProject,
  onOpenExtensionModal,
  onOpenHowItWorks,
}) => {
  const [isDraftsOpen, setIsDraftsOpen] = useState(false);

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand & App Identifier */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={onNewProject}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-md shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-indigo-400">
                <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-white text-lg tracking-tight">Meta-AI Builder</h1>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Zero-API
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <span>Multi-Stage Interactive Web AI Prompt Bridge</span>
                {projectName && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-cyan-400 font-medium truncate max-w-[150px]">{projectName}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            {onOpenHowItWorks && (
              <button
                onClick={onOpenHowItWorks}
                className="text-xs text-indigo-300 hover:text-white px-2 py-1 bg-slate-800 rounded border border-slate-700 flex items-center gap-1"
              >
                <HelpCircle className="w-3 h-3 text-indigo-400" />
                Help
              </button>
            )}
            {onOpenExtensionModal && (
              <button
                onClick={onOpenExtensionModal}
                className="text-xs text-cyan-400 hover:text-white px-2.5 py-1 bg-slate-800 rounded border border-slate-700"
              >
                Auto-Bridge
              </button>
            )}
            <button
              onClick={onNewProject}
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1 bg-slate-800 rounded border border-slate-700"
            >
              New
            </button>
          </div>
        </div>

        {/* Action Controls & Draft History Dropdown */}
        <div className="flex items-center gap-3">
          {/* How to Use (Zero-API) Guide Button */}
          {onOpenHowItWorks && (
            <button
              type="button"
              onClick={onOpenHowItWorks}
              className="px-3 py-1.5 bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-200 border border-indigo-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span>How to Use (Zero-API)</span>
            </button>
          )}
          {/* Saved Drafts Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDraftsOpen(!isDraftsOpen)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
            >
              <FolderSync className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Saved Drafts</span> ({savedDrafts.length})
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isDraftsOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 p-3 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 px-1">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Project Drafts / History
                  </span>
                  <button
                    onClick={() => {
                      onNewProject();
                      setIsDraftsOpen(false);
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                  >
                    <PlusCircle className="w-3 h-3" /> New Project
                  </button>
                </div>

                {savedDrafts.length === 0 ? (
                  <div className="text-xs text-slate-500 py-4 text-center">
                    No saved project drafts yet. Progress auto-saves as you build.
                  </div>
                ) : (
                  <div className="space-y-1 max-h-56 overflow-y-auto">
                    {savedDrafts.map((draft) => {
                      const isActive = activeDraftId === draft.id;
                      return (
                        <div
                          key={draft.id}
                          className={`p-2.5 rounded-xl border transition flex items-center justify-between gap-2 ${
                            isActive
                              ? 'bg-indigo-950/60 border-indigo-500/40 text-white'
                              : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/60 text-slate-300'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              if (onLoadDraft) onLoadDraft(draft);
                              setIsDraftsOpen(false);
                            }}
                            className="text-left flex-1 truncate cursor-pointer"
                          >
                            <div className="font-semibold text-xs truncate">
                              {draft.projectName || 'Untitled Project'}
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span>Stage: {draft.currentStage}</span>
                              <span>•</span>
                              <span>{new Date(draft.updatedAt).toLocaleDateString()}</span>
                            </div>
                          </button>

                          {onDeleteDraft && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteDraft(draft.id);
                              }}
                              className="p-1 hover:bg-rose-950/50 hover:text-rose-400 text-slate-600 rounded transition"
                              title="Delete Draft"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pipeline Stage Stepper */}
          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {stages.map((st, idx) => {
              const isCurrent = currentStage === st.id;
              const isCompleted = completedStages[st.id];
              const isAccessible = isCompleted || isCurrent || idx === 0 || completedStages[stages[idx - 1]?.id];

              return (
                <React.Fragment key={st.id}>
                  <button
                    disabled={!isAccessible}
                    onClick={() => isAccessible && setStage(st.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                      isCurrent
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/30'
                        : isCompleted
                        ? 'bg-slate-800/90 text-indigo-300 hover:bg-slate-800 border border-indigo-500/20'
                        : isAccessible
                        ? 'bg-slate-900 text-slate-300 hover:bg-slate-800/60 border border-slate-800'
                        : 'bg-slate-900/50 text-slate-600 border border-slate-800/40 cursor-not-allowed'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                        isCurrent
                          ? 'bg-white text-indigo-700'
                          : isCompleted
                          ? 'bg-indigo-500/30 text-indigo-300'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isCompleted ? '✓' : st.number}
                    </div>
                    <div className="text-left hidden sm:block">
                      <div className="font-semibold leading-tight">{st.label}</div>
                      <div className="text-[9px] opacity-70 leading-tight">{st.agent}</div>
                    </div>
                  </button>

                  {idx < stages.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-slate-700 shrink-0 hidden lg:block" />
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
