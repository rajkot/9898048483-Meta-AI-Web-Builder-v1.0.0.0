import React from 'react';
import {
  X,
  Sparkles,
  Copy,
  MessageSquare,
  Sparkle,
  ArrowRight,
  Puzzle,
  CheckCircle2,
  ExternalLink,
  Zap,
} from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenExtensionModal?: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({
  isOpen,
  onClose,
  onOpenExtensionModal,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 bg-slate-800 rounded-xl border border-slate-700 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              100% Zero-API Workflow
            </span>
            <span className="px-2.5 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-mono rounded-full">
              Free Web AI Prompt Bridge
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            How Meta-AI Builder Works
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
            Build full-stack applications through a multi-stage AI pipeline using your free, logged-in browser accounts on <strong className="text-indigo-300">Gemini</strong>, <strong className="text-cyan-300">DeepSeek</strong>, <strong className="text-amber-300">Claude</strong>, and <strong className="text-emerald-300">ChatGPT</strong>. No expensive API keys required!
          </p>
        </div>

        {/* 3 Step Visual Guide Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1 */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 font-bold flex items-center justify-center text-sm">
                1
              </div>
              <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                <Copy className="w-4 h-4 text-indigo-400" />
                Pick Stack & Copy Prompt
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Choose your target technology stack (React, Static, Node, or Flutter). Click <strong className="text-indigo-300">Copy Prompt</strong> to copy the engineered Master Prompt for the active stage.
              </p>
            </div>
            <div className="pt-2">
              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/80 px-2 py-1 rounded border border-indigo-900 block truncate">
                Stage 1 → Gemini Web
              </span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-600/20 border border-cyan-500/40 text-cyan-400 font-bold flex items-center justify-center text-sm">
                2
              </div>
              <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                Paste in Web AI Tab
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Open your free logged-in AI tab (gemini.google.com, chat.deepseek.com, claude.ai, chatgpt.com). Paste the prompt and let the AI generate the structured response.
              </p>
            </div>
            <div className="pt-2">
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-1 rounded border border-cyan-900 block truncate">
                Zero API Latency / Costs
              </span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 font-bold flex items-center justify-center text-sm">
                3
              </div>
              <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-400" />
                Paste Back & Render
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Copy the AI output back into Meta-AI Builder to render live strategy cards, domain questions, Master Specs, or executable code in the sandbox preview!
              </p>
            </div>
            <div className="pt-2">
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-1 rounded border border-emerald-900 block truncate">
                Live Iframe Workbench
              </span>
            </div>
          </div>
        </div>

        {/* Chrome Extension Auto-Bridge Callout */}
        <div className="p-4 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-cyan-950/80 border border-indigo-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Puzzle className="w-4 h-4 text-cyan-400" />
              <h4 className="font-bold text-white text-sm">Want 1-Click Auto-Bridging?</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Skip manual copying! Our free Manifest V3 Chrome Extension auto-detects AI responses on Gemini, DeepSeek, Claude & ChatGPT and bridges them directly to this app.
            </p>
          </div>

          {onOpenExtensionModal && (
            <button
              onClick={() => {
                onClose();
                onOpenExtensionModal();
              }}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg transition shrink-0 cursor-pointer flex items-center gap-2"
            >
              <Puzzle className="w-4 h-4" />
              Install Chrome Extension
            </button>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Got It! Start Building
          </button>
        </div>
      </div>
    </div>
  );
};
