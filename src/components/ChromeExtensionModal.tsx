import React, { useState } from 'react';
import {
  Puzzle,
  Download,
  Copy,
  Check,
  X,
  ExternalLink,
  Sparkles,
  Zap,
  CheckCircle2,
  Code2,
  FileText,
  Radio,
} from 'lucide-react';
import { downloadChromeExtensionZip, getChromeExtensionCode } from '../utils/chromeExtensionBuilder';

interface ChromeExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulateBridgeResponse?: () => void;
}

export const ChromeExtensionModal: React.FC<ChromeExtensionModalProps> = ({
  isOpen,
  onClose,
  onSimulateBridgeResponse,
}) => {
  const [activeTab, setActiveTab] = useState<'manifest' | 'content' | 'background' | 'readme'>('manifest');
  const [copied, setCopied] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);

  if (!isOpen) return null;

  const codeFiles = getChromeExtensionCode();

  const handleDownload = async () => {
    setIsZipping(true);
    try {
      await downloadChromeExtensionZip();
    } catch (err) {
      console.error('Error downloading extension zip:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const getActiveCode = () => {
    if (activeTab === 'manifest') return codeFiles['manifest.json'];
    if (activeTab === 'content') return codeFiles['content.js'];
    if (activeTab === 'background') return codeFiles['background.js'];
    return codeFiles['README.md'];
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Puzzle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Chrome Extension Auto-Bridge Helper
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-mono">
                  Manifest V3
                </span>
              </h2>
              <p className="text-xs text-slate-400">Zero Manual Copy-Paste Web AI Bridge</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
              <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" /> DOM Listener Engine
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Automatically listens for web prompts via <code className="text-cyan-300">window.postMessage</code>.
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
              <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                <Radio className="w-3.5 h-3.5" /> Target Web AI Tabs
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Connects Gemini, DeepSeek, Claude, and ChatGPT web tabs directly to app UI.
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
              <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Zero Manual Typing
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Extracts Web AI completions via MutationObserver and posts responses back.
              </p>
            </div>
          </div>

          {/* Code File Explorer Tabs */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('manifest')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    activeTab === 'manifest'
                      ? 'bg-cyan-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" /> manifest.json
                </button>
                <button
                  onClick={() => setActiveTab('content')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    activeTab === 'content'
                      ? 'bg-cyan-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" /> content.js
                </button>
                <button
                  onClick={() => setActiveTab('background')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    activeTab === 'background'
                      ? 'bg-cyan-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" /> background.js
                </button>
                <button
                  onClick={() => setActiveTab('readme')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    activeTab === 'readme'
                      ? 'bg-cyan-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" /> README.md
                </button>
              </div>

              <button
                onClick={handleCopyCode}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy File'}
              </button>
            </div>

            <div className="p-4 font-mono text-xs text-slate-300 max-h-60 overflow-y-auto whitespace-pre leading-relaxed">
              {getActiveCode()}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onSimulateBridgeResponse && (
              <button
                onClick={() => {
                  onSimulateBridgeResponse();
                  onClose();
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Simulate Auto-Bridge Signal
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              disabled={isZipping}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-cyan-600/20 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              {isZipping ? 'Archiving ZIP...' : 'Download Unpacked Extension ZIP'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
