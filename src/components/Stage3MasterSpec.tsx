import React, { useState } from 'react';
import { DomainAnswers, MasterSpec, StrategyOption, TargetStackOption } from '../types';
import {
  FileCode,
  Sparkles,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  Code2,
  FileText,
  Layers,
  Code,
  ExternalLink,
  ClipboardPaste,
} from 'lucide-react';
import { generateStage3ClaudePrompt, extractAndParseJSON } from '../utils/promptGenerators';

interface Stage3MasterSpecProps {
  userPrompt: string;
  selectedStrategy: StrategyOption;
  domainAnswers: DomainAnswers;
  targetStack?: TargetStackOption;
  masterSpec: MasterSpec | null;
  onSetMasterSpec: (spec: MasterSpec) => void;
  onProceed: () => void;
  onBack: () => void;
  onOpenExtensionModal?: () => void;
}

export const Stage3MasterSpec: React.FC<Stage3MasterSpecProps> = ({
  userPrompt,
  selectedStrategy,
  domainAnswers,
  targetStack,
  masterSpec,
  onSetMasterSpec,
  onProceed,
  onBack,
  onOpenExtensionModal,
}) => {
  const [activeTab, setActiveTab] = useState<'markdown' | 'json' | 'components'>('markdown');
  const [pastedResponse, setPastedResponse] = useState('');
  const [copied, setCopied] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const generatedPrompt = generateStage3ClaudePrompt(userPrompt, selectedStrategy, domainAnswers, targetStack);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    showToast('Prompt copied to clipboard! Ready to paste into Claude Web.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenClaudeWeb = () => {
    navigator.clipboard.writeText(generatedPrompt);
    showToast('Prompt copied to clipboard! Opening Claude Web...');
    setTimeout(() => {
      window.open('https://claude.ai/chat', '_blank', 'noopener,noreferrer');
    }, 300);
  };

  const handleParsePastedResponse = (textToParse?: string) => {
    const text = textToParse || pastedResponse;
    setParseError(null);
    if (!text.trim()) {
      setParseError('Please paste the Claude Web response into the box.');
      return;
    }

    try {
      const parsed = extractAndParseJSON<MasterSpec>(text, 'spec');
      if (!parsed.masterPromptMarkdown && !parsed.title) {
        throw new Error('Parsed response missing "masterPromptMarkdown" or "title".');
      }
      onSetMasterSpec(parsed);
    } catch (err: any) {
      console.error('Parsing error in Stage 3:', err);
      setParseError(err.message || 'Failed to parse JSON. Make sure you copy the complete Claude response.');
    }
  };

  const handleAutoFillDemo = () => {
    const demoSpec: MasterSpec = {
      title: `Master Specification: ${selectedStrategy.name}`,
      version: '1.0.0-PROD',
      overview: `Complete architectural contract synthesized for "${userPrompt}". Strategy: ${selectedStrategy.name}. Persona: ${domainAnswers.targetPersona || 'Agile SaaS Builders'}. Stack: ${targetStack?.name || 'React 18 + Tailwind'}.`,
      targetAudience: domainAnswers.targetPersona || 'Agile Developers and SaaS Engineers',
      techStackSummary: targetStack?.defaultTech?.join(' + ') || 'React 18 + TypeScript + Tailwind CSS + Google Drive Permissions API',
      masterPromptMarkdown: `# MASTER_PROMPT.md - Architecture Contract

## 1. Executive Product Contract
Build a production-grade application based on user requirement: "${userPrompt}".
Chosen Strategy: ${selectedStrategy.name} (${selectedStrategy.architecture})
Target Stack: ${targetStack?.name || 'React 18 + Tailwind'}

## 2. Domain & User Persona Requirements
- Target Persona: ${domainAnswers.targetPersona || 'Developers & Engineers'}
- Core Entities: ${domainAnswers.dataEntities || 'Projects, Multi-File Code Trees, Stage Steps'}
- Visual Theme: ${domainAnswers.visualTheme || 'Futuristic Dark Slate UI'}
- Cloud Persistence: ${domainAnswers.cloudIntegrations || 'Google Drive Auto-Sync with Permissions API'}

## 3. System Architecture Specification
- Frontend Engine: ${targetStack?.name || 'React 18 SPA + Vite + Tailwind CSS'}
- Prompt Bridge: 100% Client-Side Zero-API Workflow for Gemini, DeepSeek, Claude & ChatGPT
- Sandbox Execution: Live iframe Babel Standalone Sandbox Renderer
- File Export: Client-side JSZip archive generation + Google Drive REST API v3

## 4. Required Codebase File Tree
- package.json
- src/App.tsx
- src/components/Header.tsx
- README.md
`,
      technicalJsonSpec: {
        appStructure: ['src/App.tsx', 'src/components/Header.tsx', 'package.json', 'README.md'],
        coreComponents: [
          { name: 'App', purpose: 'Root Stage Router & Stage State Orchestrator', stateKeys: ['currentStage', 'project'] },
          { name: 'Header', purpose: 'Stage Stepper Navigation & Drive Status', stateKeys: ['activeStage'] },
          { name: 'SandboxIframe', purpose: 'Live Client Sandbox Babel Preview', stateKeys: ['codeString'] },
        ],
        apiEndpoints: [],
        dataModels: [
          { entity: 'StrategyOption', fields: ['id', 'name', 'architecture', 'techStack'] },
          { entity: 'MasterSpec', fields: ['title', 'overview', 'masterPromptMarkdown'] },
          { entity: 'GeneratedProject', fields: ['projectName', 'files', 'fileList'] },
        ],
        designTokens: {
          colorPalette: ['#020617 (Slate 950)', '#0f172a (Slate 900)', '#6366f1 (Indigo 500)', '#06b6d4 (Cyan 500)'],
          typography: 'Inter / System UI with Monospace Code Display',
          layoutGrid: '12-Column Responsive Dashboard Layout',
        },
      },
    };

    onSetMasterSpec(demoSpec);
    setPastedResponse(JSON.stringify(demoSpec, null, 2));
  };

  return (
    <div className="space-y-8 animate-fadeIn relative">
      {/* Toast Notification Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-amber-950 border border-amber-500/50 text-amber-200 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold rounded-full flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5" />
              Stage 3 • Claude Web Master Spec Architect
            </span>
            <span className="text-xs font-mono bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full">
              Claude 3.7 / GPT-4o Persona
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
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Stage 2
            </button>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Synthesize MASTER_PROMPT.md via Claude Web
        </h2>
        <p className="text-slate-400 text-sm mt-2 max-w-3xl leading-relaxed">
          Copy the generated Master Spec prompt for <strong className="text-amber-300">Claude Web (claude.ai/chat)</strong>, run it, and paste the response back to unlock Stage 4 Code Generation.
        </p>
      </div>

      {/* Stage 3 Prompt Bridge Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Box: Generated Prompt Preview */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Code className="w-4 h-4" />
                Generated Claude Prompt
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
              className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-md shadow-amber-600/20 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied Prompt!' : 'Copy Prompt for Claude Web'}
            </button>

            <button
              type="button"
              onClick={handleOpenClaudeWeb}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              Open Claude Web
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
                Paste Claude Web Response Here
              </div>
              <button
                type="button"
                onClick={handleAutoFillDemo}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Demo Auto-Fill
              </button>
            </div>

            <textarea
              rows={8}
              value={pastedResponse}
              onChange={(e) => setPastedResponse(e.target.value)}
              placeholder="Paste the JSON or Markdown response received from Claude Web here..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-4 text-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition resize-none placeholder-slate-600 h-64"
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
            className="w-full py-3 bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-amber-600/20 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Parse Master Spec & Unlock Code Generator
          </button>
        </div>
      </div>

      {/* Rendered Master Spec Viewer once parsed */}
      {masterSpec && (
        <div className="space-y-6 pt-4 border-t border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Spec Title</div>
              <div className="font-bold text-white text-sm truncate">{masterSpec.title}</div>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Target Persona</div>
              <div className="font-bold text-indigo-300 text-sm truncate">{masterSpec.targetAudience}</div>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Tech Stack</div>
              <div className="font-bold text-cyan-300 text-sm truncate">{masterSpec.techStackSummary}</div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('markdown')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    activeTab === 'markdown'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" /> MASTER_PROMPT.md
                </button>
                <button
                  onClick={() => setActiveTab('json')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    activeTab === 'json'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" /> Technical JSON Spec
                </button>
                <button
                  onClick={() => setActiveTab('components')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    activeTab === 'components'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" /> Component Architecture
                </button>
              </div>
            </div>

            <div className="p-6">
              {activeTab === 'markdown' && (
                <div className="font-mono text-xs text-slate-300 bg-slate-950 p-6 rounded-xl border border-slate-800/80 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[400px]">
                  {masterSpec.masterPromptMarkdown}
                </div>
              )}

              {activeTab === 'json' && (
                <div className="font-mono text-xs text-amber-300 bg-slate-950 p-6 rounded-xl border border-slate-800/80 overflow-x-auto whitespace-pre max-h-[400px]">
                  {JSON.stringify(masterSpec.technicalJsonSpec, null, 2)}
                </div>
              )}

              {activeTab === 'components' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {masterSpec.technicalJsonSpec?.coreComponents?.map((comp, idx) => (
                    <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-indigo-300">{comp.name}</span>
                        <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-mono">
                          Component
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{comp.purpose}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="p-5 bg-slate-900 border border-amber-500/40 rounded-2xl flex items-center justify-between shadow-xl">
            <div>
              <div className="text-sm font-bold text-white">
                Master Specification Locked & Verified
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Ready for Stage 4: ChatGPT / Builder Web Code Generation Engine
              </p>
            </div>

            <button
              onClick={onProceed}
              className="px-6 py-3 bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-amber-600/20 cursor-pointer"
            >
              Proceed to Stage 4: ChatGPT Code Generator
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
