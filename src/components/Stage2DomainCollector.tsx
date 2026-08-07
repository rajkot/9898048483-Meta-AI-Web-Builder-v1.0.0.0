import React, { useState, useEffect } from 'react';
import { DomainAnswers, DomainQuestion, StrategyOption, TargetStackOption } from '../types';
import {
  HelpCircle,
  Sparkles,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  ListChecks,
  User,
  Database,
  Palette,
  Share2,
  Code,
  Copy,
  Check,
  ExternalLink,
  ClipboardPaste,
} from 'lucide-react';
import { generateStage2DeepSeekPrompt, extractAndParseJSON } from '../utils/promptGenerators';

interface Stage2DomainCollectorProps {
  userPrompt: string;
  selectedStrategy: StrategyOption;
  targetStack?: TargetStackOption;
  questions: DomainQuestion[];
  onSetQuestions: (questions: DomainQuestion[]) => void;
  domainAnswers: DomainAnswers;
  setDomainAnswers: (answers: DomainAnswers) => void;
  onProceed: () => void;
  onBack: () => void;
  onOpenExtensionModal?: () => void;
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'User Persona': User,
  'Data & Workflow': Database,
  'UX / Visual Branding': Palette,
  'Integrations & Cloud Sync': Share2,
};

const DEFAULT_QUESTIONS: DomainQuestion[] = [
  {
    id: 'q1',
    category: 'User Persona',
    question: 'Who is the primary end-user persona and what is their key goal?',
    fieldKey: 'targetPersona',
    hint: 'Define target job role or user context',
    suggestedAnswers: [
      'Agile Developers & SaaS Engineers seeking automated app builds',
      'Product Managers generating executive architectural specs',
      'Designers and Creators managing media pipelines',
    ],
  },
  {
    id: 'q2',
    category: 'Data & Workflow',
    question: 'What core data entities and workflows require tracking?',
    fieldKey: 'dataEntities',
    hint: 'Identify state models, file trees, or record outputs',
    suggestedAnswers: [
      'Projects, Multi-File Code Trees, and Stage Progress Steps',
      'User Profiles, Subscription Tiers, and Settings Tokens',
      'Workflow Automation Events, Logs, and Execution Timestamps',
    ],
  },
  {
    id: 'q3',
    category: 'UX / Visual Branding',
    question: 'What is the desired visual aesthetic and theme density?',
    fieldKey: 'visualTheme',
    hint: 'Select visual theme palette and layout density',
    suggestedAnswers: [
      'Futuristic Dark Slate (Indigo & Cyan Accents with Slate 950 Canvas)',
      'Clean Glassmorphism SaaS (Emerald & Gray Accents)',
      'High-Density Command Grid (Dark Monospace Terminal)',
    ],
  },
  {
    id: 'q4',
    category: 'Integrations & Cloud Sync',
    question: 'How should generated project artifacts be persisted in the cloud?',
    fieldKey: 'cloudIntegrations',
    hint: 'Define cloud sync target and permission roles',
    suggestedAnswers: [
      'Google Drive Auto-Sync with Editor Permissions to athanu000@gmail.com',
      'Standalone Downloadable ZIP Archive for local development',
      'Chrome Extension Auto-Bridge for background web AI tab sync',
    ],
  },
];

export const Stage2DomainCollector: React.FC<Stage2DomainCollectorProps> = ({
  userPrompt,
  selectedStrategy,
  targetStack,
  questions,
  onSetQuestions,
  domainAnswers,
  setDomainAnswers,
  onProceed,
  onBack,
  onOpenExtensionModal,
}) => {
  const [pastedResponse, setPastedResponse] = useState('');
  const [copied, setCopied] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Default to pre-configured questions if questions array is empty
  useEffect(() => {
    if (questions.length === 0) {
      onSetQuestions(DEFAULT_QUESTIONS);
      // Initialize default domain answers
      const initAnswers: DomainAnswers = {};
      DEFAULT_QUESTIONS.forEach((q) => {
        if (q.suggestedAnswers && q.suggestedAnswers.length > 0) {
          initAnswers[q.fieldKey] = q.suggestedAnswers[0];
        }
      });
      setDomainAnswers(initAnswers);
    }
  }, [questions.length, onSetQuestions, setDomainAnswers]);

  const activeQuestions = questions.length > 0 ? questions : DEFAULT_QUESTIONS;
  const generatedPrompt = generateStage2DeepSeekPrompt(userPrompt, selectedStrategy, targetStack);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    showToast('Prompt copied to clipboard! Ready to paste into DeepSeek Web.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenDeepSeekWeb = () => {
    navigator.clipboard.writeText(generatedPrompt);
    showToast('Prompt copied to clipboard! Opening DeepSeek Web...');
    setTimeout(() => {
      window.open('https://chat.deepseek.com', '_blank', 'noopener,noreferrer');
    }, 300);
  };

  const handleSelectAnswer = (fieldKey: string, value: string) => {
    const updated = { ...domainAnswers, [fieldKey]: value };
    setDomainAnswers(updated);
  };

  const handleParsePastedResponse = (textToParse?: string) => {
    const text = textToParse || pastedResponse;
    setParseError(null);
    if (!text.trim()) {
      setParseError('Please paste the DeepSeek Web response into the box.');
      return;
    }

    try {
      const parsed = extractAndParseJSON<{ questions: DomainQuestion[] }>(text, 'domain');
      if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
        throw new Error('Parsed response missing "questions" array.');
      }
      onSetQuestions(parsed.questions);

      const newAnswers: DomainAnswers = { ...domainAnswers };
      parsed.questions.forEach((q) => {
        if (!newAnswers[q.fieldKey] && q.suggestedAnswers && q.suggestedAnswers.length > 0) {
          newAnswers[q.fieldKey] = q.suggestedAnswers[0];
        }
      });
      setDomainAnswers(newAnswers);
    } catch (err: any) {
      console.error('Parsing error in Stage 2:', err);
      setParseError(err.message || 'Failed to parse JSON. Make sure you copy the entire DeepSeek response.');
    }
  };

  const handleAutoFillDemo = () => {
    onSetQuestions(DEFAULT_QUESTIONS);
    const demoAnswers: DomainAnswers = {};
    DEFAULT_QUESTIONS.forEach((q) => {
      demoAnswers[q.fieldKey] = q.suggestedAnswers?.[0] || '';
    });
    setDomainAnswers(demoAnswers);
    setPastedResponse(JSON.stringify({ questions: DEFAULT_QUESTIONS }, null, 2));
  };

  const isFormComplete =
    activeQuestions.length > 0 && activeQuestions.every((q) => Boolean(domainAnswers[q.fieldKey]?.trim()));

  return (
    <div className="space-y-8 animate-fadeIn relative">
      {/* Toast Notification Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-cyan-950 border border-cyan-500/50 text-cyan-200 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-bounce">
          <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold rounded-full flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              Stage 2 • DeepSeek Web Domain Collector
            </span>
            <span className="text-xs font-mono bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full">
              Strategy: {selectedStrategy.name}
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
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Strategy
            </button>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Fine-Tune Domain Logic with DeepSeek Web
        </h2>
        <p className="text-slate-400 text-sm mt-2 max-w-3xl leading-relaxed">
          Copy the structured prompt below for <strong className="text-cyan-300">DeepSeek Web (chat.deepseek.com)</strong> to generate targeted domain collector questions, or fine-tune answers directly below.
        </p>
      </div>

      {/* Stage 2 Prompt Bridge Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Box: Generated Prompt Preview */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <Code className="w-4 h-4" />
                Generated DeepSeek Prompt
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
              className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-md shadow-cyan-600/20 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied Prompt!' : 'Copy Prompt for DeepSeek Web'}
            </button>

            <button
              type="button"
              onClick={handleOpenDeepSeekWeb}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              Open DeepSeek Web
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          </div>
        </div>

        {/* Right Box: Response Extractor & Parser */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                <ClipboardPaste className="w-4 h-4" />
                Paste DeepSeek Web Response Here
              </div>
              <button
                type="button"
                onClick={handleAutoFillDemo}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Demo Auto-Fill
              </button>
            </div>

            <textarea
              rows={8}
              value={pastedResponse}
              onChange={(e) => setPastedResponse(e.target.value)}
              placeholder="Paste the JSON or Markdown response received from DeepSeek Web here..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-4 text-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition resize-none placeholder-slate-600 h-64"
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
            Parse Questions & Unlock Domain Editor
          </button>
        </div>
      </div>

      {/* Domain Questions Interactive Cards */}
      <div className="space-y-6 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-cyan-400" />
            Interactive Domain Answers Matrix ({activeQuestions.filter((q) => Boolean(domainAnswers[q.fieldKey])).length}/4 Answers Configured)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeQuestions.map((q, idx) => {
            const CategoryIcon = CATEGORY_ICONS[q.category] || ListChecks;
            const currentValue = domainAnswers[q.fieldKey] || '';

            return (
              <div
                key={q.id || idx}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
                      <CategoryIcon className="w-3 h-3" />
                      {q.category}
                    </span>
                    <span className="text-xs font-mono text-slate-500">Q{idx + 1}/4</span>
                  </div>

                  <h4 className="text-sm font-bold text-white leading-snug">{q.question}</h4>
                  <p className="text-xs text-slate-400">{q.hint}</p>

                  {/* Pre-suggested Answer Pills */}
                  {q.suggestedAnswers && q.suggestedAnswers.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-semibold text-slate-400">Select Option:</span>
                      <div className="space-y-1.5">
                        {q.suggestedAnswers.map((opt, oIdx) => {
                          const isChosen = currentValue === opt;
                          return (
                            <button
                              key={oIdx}
                              type="button"
                              onClick={() => handleSelectAnswer(q.fieldKey, opt)}
                              className={`w-full text-left p-2.5 rounded-xl text-xs font-medium border transition flex items-center justify-between cursor-pointer ${
                                isChosen
                                  ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200'
                                  : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                              }`}
                            >
                              <span className="line-clamp-2">{opt}</span>
                              {isChosen && <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 ml-2" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Custom Input */}
                <div className="pt-3 border-t border-slate-800/80">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Custom / Refined Answer:
                  </label>
                  <input
                    type="text"
                    value={currentValue}
                    onChange={(e) => handleSelectAnswer(q.fieldKey, e.target.value)}
                    placeholder="Type custom answer..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Bar */}
        <div className="p-5 bg-slate-900 border border-cyan-500/30 rounded-2xl flex items-center justify-between shadow-xl">
          <div>
            <div className="text-sm font-bold text-white">
              Ready for Stage 3: Master Spec Architect
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Generate Claude Web Master Spec prompt contract with chosen strategy and domain answers.
            </p>
          </div>

          <button
            onClick={onProceed}
            disabled={!isFormComplete}
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-cyan-600/20 cursor-pointer"
          >
            Proceed to Stage 3: Master Spec Architect
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
