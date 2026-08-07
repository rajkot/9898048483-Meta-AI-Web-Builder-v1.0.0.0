import React, { useState, useEffect } from 'react';
import { StrategyBreakdown, StrategyOption, TargetStackOption } from '../types';
import {
  Compass,
  CheckCircle2,
  Layers,
  ArrowRight,
  Code,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  ClipboardPaste,
  Lightbulb,
  Cpu,
  Puzzle,
  Download,
} from 'lucide-react';
import { generateStage1GeminiPrompt, extractAndParseJSON } from '../utils/promptGenerators';
import { TARGET_STACK_PRESETS } from '../utils/targetStacks';

interface Stage1StrategyProps {
  userPrompt: string;
  setUserPrompt: (prompt: string) => void;
  targetStack: TargetStackOption;
  setTargetStack: (stack: TargetStackOption) => void;
  strategyBreakdown: StrategyBreakdown | null;
  selectedStrategy: StrategyOption | null;
  setSelectedStrategy: (option: StrategyOption) => void;
  onSetStrategyBreakdown: (breakdown: StrategyBreakdown) => void;
  onProceed: () => void;
  onOpenExtensionModal?: () => void;
}

const PRESET_PROMPTS = [
  {
    title: 'Meta-AI SaaS Web Builder',
    prompt: 'A SaaS platform that lets users input app prompts, generates multi-stage architectural options, domain questions, Master Specs, code trees, and auto-syncs to Google Drive with permissions granted to athanu000@gmail.com.',
  },
  {
    title: 'Enterprise Analytics Dashboard',
    prompt: 'A real-time business intelligence SaaS dashboard with interactive financial metrics, custom KPI widgets, multi-tenant workspace isolation, data export, and dark/light themes.',
  },
  {
    title: 'AI Customer Support Hub',
    prompt: 'An AI-powered customer support desk with automated ticketing, live chat assistant, knowledge base search grounding, sentiment routing, and team analytics.',
  },
  {
    title: 'FinTech Expense Tracker',
    prompt: 'A personal wealth management app with budget forecasting, portfolio tracking, automated transaction categorization, recurring bill alerts, and CSV/PDF export.',
  },
];

export const Stage1Strategy: React.FC<Stage1StrategyProps> = ({
  userPrompt,
  setUserPrompt,
  targetStack,
  setTargetStack,
  strategyBreakdown,
  selectedStrategy,
  setSelectedStrategy,
  onSetStrategyBreakdown,
  onProceed,
  onOpenExtensionModal,
}) => {
  const [activeInput, setActiveInput] = useState(userPrompt || PRESET_PROMPTS[0].prompt);
  const [pastedResponse, setPastedResponse] = useState('');
  const [copied, setCopied] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Dynamically generated Stage 1 prompt for Gemini Web with target stack
  const generatedPrompt = generateStage1GeminiPrompt(activeInput, targetStack);

  useEffect(() => {
    setUserPrompt(activeInput);
  }, [activeInput, setUserPrompt]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    showToast('Prompt copied to clipboard! Ready to paste into Gemini Web.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenGeminiWeb = () => {
    navigator.clipboard.writeText(generatedPrompt);
    showToast('Prompt copied to clipboard! Opening Gemini Web...');
    setTimeout(() => {
      window.open('https://gemini.google.com/app', '_blank', 'noopener,noreferrer');
    }, 300);
  };

  const handleParsePastedResponse = (textToParse?: string) => {
    const text = textToParse || pastedResponse;
    setParseError(null);
    if (!text.trim()) {
      setParseError('Please paste the Gemini Web AI response into the text box.');
      return;
    }

    try {
      const parsed = extractAndParseJSON<StrategyBreakdown>(text, 'strategy');
      if (!parsed.options || !Array.isArray(parsed.options) || parsed.options.length === 0) {
        throw new Error('Parsed response missing valid "options" array.');
      }
      onSetStrategyBreakdown(parsed);
      setSelectedStrategy(parsed.options[0]);
    } catch (err: any) {
      console.error('Parsing error in Stage 1:', err);
      setParseError(err.message || 'Invalid JSON format. Make sure you copy the entire Gemini response.');
    }
  };

  // Instant Smart Local Synthesis / Demo Auto-Fill
  const handleAutoFillDemo = () => {
    const demoData: StrategyBreakdown = {
      overallAnalysis: `Analysis for "${activeInput}" targeting "${targetStack.name}": Excellent product vision. High growth potential leveraging a modern modular architecture with seamless Google Drive integration.`,
      primaryRecommendation: `Option A - High-Speed ${targetStack.name} Architecture`,
      options: [
        {
          id: 'opt-1',
          name: `High-Speed ${targetStack.name} Architecture`,
          tag: 'Fastest & Recommended',
          description: `Streamlined ${targetStack.name} application with reactive DOM state and instant iframe sandbox rendering.`,
          architecture: `Modern ${targetStack.name} setup with reactive hooks & local persistence`,
          techStack: targetStack.defaultTech,
          keyFeatures: [
            'Instant responsive dashboard with modern components',
            'Zero-API Prompt Bridge for Gemini, DeepSeek, Claude & ChatGPT',
            'Automated Google Drive export with Permissions API integration',
          ],
          uxApproach: 'Futuristic Dark Slate UI with indigo and cyan accents',
          targetAudience: 'Developers, Tech Leads, and Agile SaaS Builders',
          prosCons: {
            pros: ['Zero backend API key latency', '100% private client execution'],
            cons: ['Browser memory limits for ultra-large codebases'],
          },
        },
        {
          id: 'opt-2',
          name: `Enterprise SaaS Platform (${targetStack.name})`,
          tag: 'Maximum Scalability',
          description: 'Multi-tenant architecture with analytics dashboard and cloud sync.',
          architecture: 'Full-stack architecture with REST endpoints & state persistence',
          techStack: [...targetStack.defaultTech, 'Express Node.js', 'Google Drive API'],
          keyFeatures: [
            'Multi-stage wizard orchestration',
            'Integrated Chrome Extension Auto-Bridge',
            'DeepSeek domain collector and Master Spec contract generator',
          ],
          uxApproach: 'Enterprise Dark Neon with compact sidebar navigation',
          targetAudience: 'Corporate IT, Product Teams, and Enterprise Leads',
          prosCons: {
            pros: ['Highly structured multi-role pipeline', 'Robust audit trail'],
            cons: ['Slightly higher setup overhead'],
          },
        },
        {
          id: 'opt-3',
          name: `AI-Native ${targetStack.name} Portal`,
          tag: 'Next-Gen Agentic',
          description: 'Autonomous multi-prompt bridge with Chrome Extension background listener.',
          architecture: 'Event-driven reactive web app with window.postMessage bridge',
          techStack: [...targetStack.defaultTech, 'JSZip', 'Chrome Manifest V3'],
          keyFeatures: [
            'Chrome Extension background DOM MutationObserver listener',
            'Client-side ZIP code export and preview sandbox',
            'Automated permissions grant to athanu000@gmail.com',
          ],
          uxApproach: 'Cyberpunk command console with monospace logs',
          targetAudience: 'AI Engineers, Prompt Architects, and Power Users',
          prosCons: {
            pros: ['Seamless browser extension integration', 'Instant ZIP downloads'],
            cons: ['Requires loading Chrome extension'],
          },
        },
      ],
    };

    onSetStrategyBreakdown(demoData);
    setSelectedStrategy(demoData.options[0]);
    setPastedResponse(JSON.stringify(demoData, null, 2));
  };

  return (
    <div className="space-y-6 animate-fadeIn relative">
      {/* Toast Notification Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-950 border border-indigo-500/50 text-indigo-200 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-bounce">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* One-Click Chrome Extension Installer Banner */}
      {!isBannerDismissed && onOpenExtensionModal && (
        <div className="p-4 bg-gradient-to-r from-indigo-950/90 via-slate-900 to-cyan-950/90 border border-indigo-500/40 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xl animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-cyan-300 shrink-0">
              <Puzzle className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
                Automate stage transitions with our free Zero-API Chrome Extension
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30 font-mono">
                  Recommended
                </span>
              </h4>
              <p className="text-xs text-slate-400">
                Auto-detects AI outputs in Gemini, DeepSeek, Claude & ChatGPT tabs and bridges them directly into your workflow.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenExtensionModal}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Download Extension
            </button>
            <button
              type="button"
              onClick={() => setIsBannerDismissed(true)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              title="Dismiss Banner"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Intro Hero Section */}
      <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold rounded-full flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              Stage 1 • Gemini Web Strategy Engine
            </span>
            <span className="text-xs font-mono bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 px-2.5 py-0.5 rounded-full">
              Zero-API Prompt Bridge
            </span>
          </div>

          {onOpenExtensionModal && (
            <button
              onClick={onOpenExtensionModal}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Chrome Auto-Bridge Helper
            </button>
          )}
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Define Target Stack & App Idea
        </h2>
        <p className="text-slate-400 text-sm mt-2 max-w-3xl leading-relaxed">
          Select target technology stack and product vision. Copy the generated structured prompt for <strong className="text-indigo-300">Gemini Web (gemini.google.com)</strong>, run it in Gemini, and paste the response back to unlock Stage 2.
        </p>

        {/* Target Tech Stack Selector Grid */}
        <div className="mt-6 space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            Select Target Technology Stack:
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {TARGET_STACK_PRESETS.map((stack) => {
              const isChosen = targetStack.id === stack.id;
              return (
                <button
                  key={stack.id}
                  type="button"
                  onClick={() => setTargetStack(stack)}
                  className={`p-3.5 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                    isChosen
                      ? 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/30'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">{stack.name}</span>
                      <span className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded font-mono">
                        {stack.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{stack.description}</p>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap gap-1">
                    {stack.defaultTech.slice(0, 3).map((t, i) => (
                      <span key={i} className="text-[9px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Box & Quick Presets */}
        <div className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Project Application Vision:
            </label>
            <textarea
              rows={3}
              value={activeInput}
              onChange={(e) => setActiveInput(e.target.value)}
              placeholder="Describe your web application idea..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-4 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition resize-none placeholder-slate-600 font-sans"
            />
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              Quick Application Ideas:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {PRESET_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveInput(p.prompt)}
                  className="p-3 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-indigo-500/40 rounded-xl text-left transition group cursor-pointer"
                >
                  <div className="font-semibold text-xs text-slate-200 group-hover:text-indigo-300 flex items-center justify-between">
                    <span>{p.title}</span>
                    <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition" />
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{p.prompt}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stage 1 Prompt Bridge Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Box: Generated Prompt Preview */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                <Code className="w-4 h-4" />
                Generated Gemini Web Prompt ({targetStack.name})
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {generatedPrompt.length} chars
              </span>
            </div>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-300 h-64 overflow-y-auto whitespace-pre-wrap leading-relaxed select-all">
              {generatedPrompt}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleCopyPrompt}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied Prompt!' : 'Copy Prompt for Gemini Web'}
            </button>

            <button
              type="button"
              onClick={handleOpenGeminiWeb}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              Open Gemini Web
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          </div>
        </div>

        {/* Right Box: Response Extractor & Parser */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <ClipboardPaste className="w-4 h-4" />
                Paste Gemini Web AI Response Here
              </div>
              <button
                type="button"
                onClick={handleAutoFillDemo}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Demo Auto-Fill
              </button>
            </div>

            <textarea
              rows={8}
              value={pastedResponse}
              onChange={(e) => setPastedResponse(e.target.value)}
              placeholder="Paste the JSON or Markdown response received from Gemini Web here..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-4 text-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition resize-none placeholder-slate-600 h-64"
            />

            {parseError && (
              <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-300">
                {parseError}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleParsePastedResponse()}
            className="w-full py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-cyan-600/20 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Parse Response & Unlock Strategies
          </button>
        </div>
      </div>

      {/* Strategy Breakdown Display when parsed */}
      {strategyBreakdown && (
        <div className="space-y-6 pt-4 border-t border-slate-800">
          <div className="p-5 bg-indigo-950/40 border border-indigo-500/30 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase font-bold tracking-wider text-indigo-400 mb-1">
                Parsed Gemini Strategy Analysis
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">{strategyBreakdown.overallAnalysis}</p>
            </div>
            <div className="shrink-0 bg-indigo-900/60 border border-indigo-400/30 p-3 rounded-lg text-xs text-indigo-200 font-medium">
              <span className="text-indigo-400 font-bold">Recommended:</span> {strategyBreakdown.primaryRecommendation}
            </div>
          </div>

          {/* Option Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {strategyBreakdown.options.map((option) => {
              const isSelected = selectedStrategy?.id === option.id;

              return (
                <div
                  key={option.id}
                  onClick={() => setSelectedStrategy(option)}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative ${
                    isSelected
                      ? 'bg-slate-900 border-indigo-500 shadow-xl shadow-indigo-500/10 ring-2 ring-indigo-500/20'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute -top-3 right-4 bg-indigo-600 text-white text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                      <CheckCircle2 className="w-3 h-3" /> Selected
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-md">
                        {option.tag}
                      </span>
                      <h3 className="text-lg font-bold text-white mt-2.5">{option.name}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed mt-1">{option.description}</p>
                    </div>

                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-1">
                      <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-indigo-400" /> Architecture
                      </div>
                      <p className="text-xs text-slate-400 leading-tight">{option.architecture}</p>
                    </div>

                    <div>
                      <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
                        <Code className="w-3.5 h-3.5 text-cyan-400" /> Tech Stack
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {option.techStack.map((tech, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 text-[11px] rounded font-mono">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStrategy(option);
                      }}
                      className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                    >
                      {isSelected ? '✓ Selected Strategy' : 'Select Strategy'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Bar */}
          {selectedStrategy && (
            <div className="p-5 bg-slate-900 border border-indigo-500/40 rounded-2xl flex items-center justify-between shadow-xl">
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Selected Strategy:</span>
                  <span className="text-indigo-400">{selectedStrategy.name}</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ready for Stage 2: DeepSeek Domain Collector
                </p>
              </div>

              <button
                onClick={onProceed}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-indigo-600/20 cursor-pointer"
              >
                Proceed to Stage 2: DeepSeek Domain Collector
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
