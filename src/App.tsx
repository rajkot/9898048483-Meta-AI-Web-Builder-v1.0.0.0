import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Stage1Strategy } from './components/Stage1Strategy';
import { Stage2DomainCollector } from './components/Stage2DomainCollector';
import { Stage3MasterSpec } from './components/Stage3MasterSpec';
import { Stage4CodeGenerator } from './components/Stage4CodeGenerator';
import { Stage5DriveSync } from './components/Stage5DriveSync';
import { ChromeExtensionModal } from './components/ChromeExtensionModal';
import { HowItWorksModal } from './components/HowItWorksModal';
import {
  DomainAnswers,
  DomainQuestion,
  DriveSyncResult,
  GeneratedProject,
  MasterSpec,
  ProjectDraft,
  StageId,
  StrategyBreakdown,
  StrategyOption,
  TargetStackOption,
} from './types';
import { TARGET_STACK_PRESETS } from './utils/targetStacks';
import { loadSavedDrafts, saveProjectDraft, deleteProjectDraft } from './utils/storage';
import { extractAndParseJSON } from './utils/promptGenerators';
import { CheckCircle2, Sparkles } from 'lucide-react';

export default function App() {
  const [currentStage, setCurrentStage] = useState<StageId>('strategy');
  const [completedStages, setCompletedStages] = useState<Record<StageId, boolean>>({
    prompt: true,
    strategy: false,
    domain: false,
    spec: false,
    code: false,
    drive: false,
  });

  // Target Stack & Global State
  const [targetStack, setTargetStack] = useState<TargetStackOption>(TARGET_STACK_PRESETS[0]);
  const [userPrompt, setUserPrompt] = useState<string>(
    'A SaaS platform that lets users input app prompts, generates multi-stage architectural options, domain questions, Master Specs, code trees, and auto-syncs to Google Drive with permissions granted to athanu000@gmail.com.'
  );
  const [strategyBreakdown, setStrategyBreakdown] = useState<StrategyBreakdown | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyOption | null>(null);
  const [domainQuestions, setDomainQuestions] = useState<DomainQuestion[]>([]);
  const [domainAnswers, setDomainAnswers] = useState<DomainAnswers>({});
  const [masterSpec, setMasterSpec] = useState<MasterSpec | null>(null);
  const [project, setProject] = useState<GeneratedProject | null>(null);
  const [syncResult, setSyncResult] = useState<DriveSyncResult | null>(null);

  // Persistence Draft State
  const [savedDrafts, setSavedDrafts] = useState<ProjectDraft[]>([]);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);

  const [isExtModalOpen, setIsExtModalOpen] = useState<boolean>(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [extensionNotice, setExtensionNotice] = useState<string | null>(null);

  // Load Saved Drafts on Mount
  useEffect(() => {
    const drafts = loadSavedDrafts();
    setSavedDrafts(drafts);
  }, []);

  // Auto-Save Active Draft when Key States Change
  useEffect(() => {
    const draftId = activeDraftId || `draft-${Date.now()}`;
    if (!activeDraftId) setActiveDraftId(draftId);

    const draft = saveProjectDraft({
      id: draftId,
      title: project?.projectName || selectedStrategy?.name || 'Meta-AI App',
      projectName: project?.projectName || selectedStrategy?.name || 'Meta-AI App',
      updatedAt: Date.now(),
      userPrompt,
      targetStack,
      currentStage,
      completedStages,
      strategyBreakdown,
      selectedStrategy,
      domainQuestions,
      domainAnswers,
      masterSpec,
      project,
      syncResult,
    });

    setSavedDrafts(loadSavedDrafts());
  }, [
    userPrompt,
    targetStack,
    currentStage,
    strategyBreakdown,
    selectedStrategy,
    domainQuestions,
    domainAnswers,
    masterSpec,
    project,
    syncResult,
  ]);

  // Chrome Extension Event Listener
  useEffect(() => {
    const handleExtensionMessage = (event: MessageEvent) => {
      // Allow messages from extensions or window.postMessage
      if (!event.data) return;

      const { type, stage, payload, text, autoAdvance } = event.data;

      if (
        type === 'META_AI_BRIDGE_PAYLOAD' ||
        type === 'META_AI_EXTENSION_RESPONSE' ||
        type === 'META_AI_BRIDGE_SYNC'
      ) {
        console.log('Received Chrome Extension message payload:', event.data);
        const rawContent = payload || text || '';

        if (!rawContent) return;

        try {
          if (stage === 'strategy' || currentStage === 'strategy') {
            const parsed = extractAndParseJSON<StrategyBreakdown>(rawContent, 'strategy');
            if (parsed.options && parsed.options.length > 0) {
              setStrategyBreakdown(parsed);
              setSelectedStrategy(parsed.options[0]);
              setExtensionNotice('Received and parsed Strategy Breakdown from Chrome Extension!');
              if (autoAdvance) {
                setCompletedStages((prev) => ({ ...prev, strategy: true }));
                setCurrentStage('domain');
              }
            }
          } else if (stage === 'domain' || currentStage === 'domain') {
            const parsed = extractAndParseJSON<{ questions: DomainQuestion[] }>(rawContent, 'domain');
            if (parsed.questions && parsed.questions.length > 0) {
              setDomainQuestions(parsed.questions);
              setExtensionNotice('Received and parsed Domain Questions from Chrome Extension!');
              if (autoAdvance) {
                setCompletedStages((prev) => ({ ...prev, domain: true }));
                setCurrentStage('spec');
              }
            }
          } else if (stage === 'spec' || currentStage === 'spec') {
            const parsed = extractAndParseJSON<MasterSpec>(rawContent, 'spec');
            if (parsed.masterPromptMarkdown || parsed.title) {
              setMasterSpec(parsed);
              setExtensionNotice('Received and parsed Master Spec contract from Chrome Extension!');
              if (autoAdvance) {
                setCompletedStages((prev) => ({ ...prev, spec: true }));
                setCurrentStage('code');
              }
            }
          } else if (stage === 'code' || currentStage === 'code') {
            const parsed = extractAndParseJSON<{
              projectName?: string;
              description?: string;
              files: Record<string, string>;
            }>(rawContent, 'code');

            if (parsed.files && Object.keys(parsed.files).length > 0) {
              const fileList = Object.keys(parsed.files);
              const generated: GeneratedProject = {
                projectName: parsed.projectName || 'meta-ai-extension-app',
                description: parsed.description || 'Auto-bridged via Chrome Extension',
                files: parsed.files,
                fileList,
                masterSpec,
                strategyName: selectedStrategy?.name || 'Extension Generated Strategy',
              };
              setProject(generated);
              setExtensionNotice('Received and rendered multi-file Codebase from Chrome Extension!');
              if (autoAdvance) {
                setCompletedStages((prev) => ({ ...prev, code: true }));
                setCurrentStage('drive');
              }
            }
          }
        } catch (err: any) {
          console.error('Error handling Chrome Extension message payload:', err);
          setErrorMessage(`Extension Bridge Parse Notice: ${err.message || 'Check response format.'}`);
        }
      }
    };

    window.addEventListener('message', handleExtensionMessage);
    return () => window.removeEventListener('message', handleExtensionMessage);
  }, [currentStage, masterSpec, selectedStrategy]);

  // Load Draft Handler
  const handleLoadDraft = (draft: ProjectDraft) => {
    setActiveDraftId(draft.id);
    setUserPrompt(draft.userPrompt || '');
    if (draft.targetStack) setTargetStack(draft.targetStack);
    setCurrentStage(draft.currentStage || 'strategy');
    setStrategyBreakdown(draft.strategyBreakdown || null);
    setSelectedStrategy(draft.selectedStrategy || null);
    setDomainQuestions(draft.domainQuestions || []);
    setDomainAnswers(draft.domainAnswers || {});
    setMasterSpec(draft.masterSpec || null);
    setProject(draft.project || null);
    setSyncResult(draft.syncResult || null);
    setExtensionNotice(`Loaded saved draft: ${draft.projectName || 'Project'}`);
  };

  // Delete Draft Handler
  const handleDeleteDraft = (draftId: string) => {
    deleteProjectDraft(draftId);
    setSavedDrafts(loadSavedDrafts());
    if (activeDraftId === draftId) {
      setActiveDraftId(null);
    }
  };

  // Default fallback strategy if user advances before stage 1 parsing
  const activeStrategy: StrategyOption = selectedStrategy || {
    id: 'default-strat',
    name: `High-Speed ${targetStack.name} Architecture`,
    tag: 'Recommended',
    description: `Streamlined ${targetStack.name} application with reactive DOM state and instant iframe sandbox rendering.`,
    architecture: `Client-side ${targetStack.name} with reactive state & local persistence`,
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
  };

  // Stage Navigation Handlers
  const handleProceedToDomain = () => {
    setCompletedStages((prev) => ({ ...prev, strategy: true }));
    setCurrentStage('domain');
  };

  const handleProceedToSpec = () => {
    setCompletedStages((prev) => ({ ...prev, domain: true }));
    setCurrentStage('spec');
  };

  const handleProceedToCode = () => {
    setCompletedStages((prev) => ({ ...prev, spec: true }));
    setCurrentStage('code');
  };

  const handleProceedToDrive = () => {
    setCompletedStages((prev) => ({ ...prev, code: true }));
    setCurrentStage('drive');
  };

  const handleResetAll = () => {
    setActiveDraftId(null);
    setCurrentStage('strategy');
    setCompletedStages({
      prompt: true,
      strategy: false,
      domain: false,
      spec: false,
      code: false,
      drive: false,
    });
    setStrategyBreakdown(null);
    setSelectedStrategy(null);
    setDomainQuestions([]);
    setDomainAnswers({});
    setMasterSpec(null);
    setProject(null);
    setSyncResult(null);
    setErrorMessage(null);
    setExtensionNotice(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">
      {/* Top Header & Pipeline Stepper */}
      <Header
        currentStage={currentStage}
        setStage={setCurrentStage}
        completedStages={completedStages}
        projectName={project?.projectName || selectedStrategy?.name}
        savedDrafts={savedDrafts}
        activeDraftId={activeDraftId}
        onLoadDraft={handleLoadDraft}
        onDeleteDraft={handleDeleteDraft}
        onNewProject={handleResetAll}
        onOpenExtensionModal={() => setIsExtModalOpen(true)}
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Chrome Extension Live Auto-Bridge Toast */}
        {extensionNotice && (
          <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 rounded-xl text-xs flex items-center justify-between shadow-lg animate-fadeIn">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold">{extensionNotice}</span>
            </div>
            <button
              onClick={() => setExtensionNotice(null)}
              className="text-emerald-400 hover:text-white font-bold ml-4 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 bg-red-950/80 border border-red-500/50 text-red-200 rounded-xl text-xs flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-400 hover:text-white font-bold ml-4 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Stage 1: Gemini Strategy Engine */}
        {currentStage === 'strategy' && (
          <Stage1Strategy
            userPrompt={userPrompt}
            setUserPrompt={setUserPrompt}
            targetStack={targetStack}
            setTargetStack={setTargetStack}
            strategyBreakdown={strategyBreakdown}
            selectedStrategy={selectedStrategy}
            setSelectedStrategy={setSelectedStrategy}
            onSetStrategyBreakdown={setStrategyBreakdown}
            onProceed={handleProceedToDomain}
            onOpenExtensionModal={() => setIsExtModalOpen(true)}
          />
        )}

        {/* Stage 2: DeepSeek Domain Collector */}
        {currentStage === 'domain' && (
          <Stage2DomainCollector
            userPrompt={userPrompt}
            selectedStrategy={activeStrategy}
            targetStack={targetStack}
            questions={domainQuestions}
            onSetQuestions={setDomainQuestions}
            domainAnswers={domainAnswers}
            setDomainAnswers={setDomainAnswers}
            onProceed={handleProceedToSpec}
            onBack={() => setCurrentStage('strategy')}
            onOpenExtensionModal={() => setIsExtModalOpen(true)}
          />
        )}

        {/* Stage 3: Claude Master Spec Architect */}
        {currentStage === 'spec' && (
          <Stage3MasterSpec
            userPrompt={userPrompt}
            selectedStrategy={activeStrategy}
            domainAnswers={domainAnswers}
            targetStack={targetStack}
            masterSpec={masterSpec}
            onSetMasterSpec={setMasterSpec}
            onProceed={handleProceedToCode}
            onBack={() => setCurrentStage('domain')}
            onOpenExtensionModal={() => setIsExtModalOpen(true)}
          />
        )}

        {/* Stage 4: ChatGPT Code File Generator */}
        {currentStage === 'code' && (
          <Stage4CodeGenerator
            userPrompt={userPrompt}
            selectedStrategy={activeStrategy}
            masterSpec={masterSpec}
            targetStack={targetStack}
            project={project}
            onSetProject={setProject}
            onProceedToDriveSync={handleProceedToDrive}
            onBack={() => setCurrentStage('spec')}
            onOpenExtensionModal={() => setIsExtModalOpen(true)}
          />
        )}

        {/* Stage 5: Google Drive Auto-Sync */}
        {currentStage === 'drive' && (
          <Stage5DriveSync
            project={project}
            syncResult={syncResult}
            onSetSyncResult={(res) => {
              setSyncResult(res);
              setCompletedStages((prev) => ({ ...prev, drive: true }));
            }}
            onBack={() => setCurrentStage('code')}
            onStartOver={handleResetAll}
            onOpenExtensionModal={() => setIsExtModalOpen(true)}
          />
        )}
      </main>

      {/* Chrome Extension Auto-Bridge Modal */}
      <ChromeExtensionModal
        isOpen={isExtModalOpen}
        onClose={() => setIsExtModalOpen(false)}
        onSimulateBridgeResponse={() => {
          let samplePayload = '';
          if (currentStage === 'strategy') {
            samplePayload = JSON.stringify({
              overallAnalysis: `Analysis for "${userPrompt}" targeting "${targetStack.name}": Excellent product vision with Zero-API Prompt Bridge.`,
              primaryRecommendation: `Option A - High-Speed ${targetStack.name} Architecture`,
              options: [
                {
                  id: 'opt-1',
                  name: `High-Speed ${targetStack.name} Architecture`,
                  tag: 'Fastest & Recommended',
                  description: `Streamlined ${targetStack.name} setup with reactive DOM state.`,
                  architecture: `Modern ${targetStack.name} setup with reactive hooks`,
                  techStack: targetStack.defaultTech,
                  keyFeatures: [
                    'Instant responsive controls',
                    'Zero-API Prompt Bridge for Web AIs',
                    'Automated Google Drive export',
                  ],
                  uxApproach: 'Futuristic Dark Slate UI',
                  targetAudience: 'SaaS Builders',
                  prosCons: { pros: ['Zero API latency'], cons: ['Browser limits'] },
                },
              ],
            });
          } else if (currentStage === 'domain') {
            samplePayload = JSON.stringify({
              questions: [
                {
                  id: 'q1',
                  category: 'User Persona',
                  question: 'Who is the primary end-user persona?',
                  fieldKey: 'targetPersona',
                  hint: 'Define target job role',
                  suggestedAnswers: ['Agile SaaS Developers', 'Product Managers'],
                },
              ],
            });
          } else if (currentStage === 'spec') {
            samplePayload = JSON.stringify({
              title: `Master Spec: ${selectedStrategy?.name || targetStack.name}`,
              version: '1.0.0-PROD',
              overview: `Complete architectural contract for "${userPrompt}"`,
              targetAudience: domainAnswers.targetPersona || 'SaaS Builders',
              techStackSummary: targetStack.name,
              masterPromptMarkdown: `# MASTER_PROMPT.md\n\n## 1. System Goal\nBuild ${userPrompt} with ${targetStack.name}`,
            });
          } else if (currentStage === 'code') {
            samplePayload = JSON.stringify({
              projectName: `meta-ai-${targetStack.id}`,
              description: `Generated ${targetStack.name} codebase`,
              files: {
                'package.json': JSON.stringify(
                  { name: 'meta-ai-app', version: '1.0.0', dependencies: { react: '^18.3.1', 'react-dom': '^18.3.1' } },
                  null,
                  2
                ),
                'src/App.tsx': `import React from 'react';\n\nexport default function App() {\n  return (\n    <div className="p-8 bg-slate-900 text-cyan-300 font-bold font-sans rounded-2xl shadow-xl">\n      🚀 Hello from ${targetStack.name} Zero-API Code Sandbox!\n    </div>\n  );\n}`,
              },
            });
          }

          window.postMessage(
            {
              type: 'META_AI_BRIDGE_PAYLOAD',
              stage: currentStage,
              payload: samplePayload,
              autoAdvance: false,
            },
            '*'
          );
        }}
      />

      {/* How It Works Walkthrough Modal */}
      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
        onOpenExtensionModal={() => setIsExtModalOpen(true)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2 max-w-7xl mx-auto w-full">
        <p>Meta-AI Web Builder Platform • 100% Zero-API Prompt Bridge</p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExtModalOpen(true)}
            className="text-cyan-400 hover:underline cursor-pointer"
          >
            Chrome Extension Bridge
          </button>
          <span>•</span>
          <span>Google Drive Sync Target: athanu000@gmail.com</span>
        </div>
      </footer>
    </div>
  );
}
