import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { GeneratedProject, MasterSpec, StrategyOption, TargetStackOption } from '../types';
import {
  Code2,
  FileCode,
  FolderOpen,
  Download,
  Copy,
  Check,
  Eye,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Search,
  HardDrive,
  Code,
  ExternalLink,
  ClipboardPaste,
  Monitor,
  Laptop,
  Terminal,
  Smartphone,
  CheckSquare,
  Square,
  Cpu,
  Box,
} from 'lucide-react';
import { generateStage4ChatGPTCodePrompt, extractAndParseJSON } from '../utils/promptGenerators';
import { injectExecutableConfigs, TargetOSOptions } from '../utils/executableConfigInjector';

interface Stage4CodeGeneratorProps {
  userPrompt: string;
  selectedStrategy: StrategyOption;
  masterSpec: MasterSpec | null;
  targetStack?: TargetStackOption;
  project: GeneratedProject | null;
  onSetProject: (project: GeneratedProject) => void;
  onProceedToDriveSync: () => void;
  onBack: () => void;
  onOpenExtensionModal?: () => void;
}

export const Stage4CodeGenerator: React.FC<Stage4CodeGeneratorProps> = ({
  userPrompt,
  selectedStrategy,
  masterSpec,
  targetStack,
  project,
  onSetProject,
  onProceedToDriveSync,
  onBack,
  onOpenExtensionModal,
}) => {
  const [activeFilePath, setActiveFilePath] = useState<string>('src/App.tsx');
  const [activeTab, setActiveTab] = useState<'preview' | 'editor'>('preview');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [fileContents, setFileContents] = useState<Record<string, string>>({});
  const [pastedResponse, setPastedResponse] = useState<string>('');
  const [promptCopied, setPromptCopied] = useState<boolean>(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [targetOS, setTargetOS] = useState<TargetOSOptions>({
    windows: true,
    macos: true,
    linux: true,
    android: true,
  });

  const fallbackMasterSpec: MasterSpec = masterSpec || {
    title: 'Master Specification',
    version: '1.0.0',
    overview: userPrompt,
    targetAudience: 'Developers',
    techStackSummary: targetStack?.name || 'React 18 + Tailwind CSS',
    masterPromptMarkdown: userPrompt,
    technicalJsonSpec: { appStructure: [], coreComponents: [], apiEndpoints: [], dataModels: [], designTokens: { colorPalette: [], typography: '', layoutGrid: '' } },
  };

  const generatedPrompt = generateStage4ChatGPTCodePrompt(userPrompt, selectedStrategy, fallbackMasterSpec, targetStack);

  // Initialize local file contents when project changes
  useEffect(() => {
    if (project?.files) {
      setFileContents(project.files);
      if (project.fileList?.includes('src/App.tsx')) {
        setActiveFilePath('src/App.tsx');
      } else if (project.fileList?.length > 0) {
        setActiveFilePath(project.fileList[0]);
      }
    }
  }, [project]);

  const currentContent = fileContents[activeFilePath] || project?.files?.[activeFilePath] || '';

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleToggleTargetOS = (key: keyof TargetOSOptions) => {
    const updatedOS = { ...targetOS, [key]: !targetOS[key] };
    setTargetOS(updatedOS);

    if (project) {
      const projectName = project.projectName || 'meta-ai-app';
      const currentFiles = Object.keys(fileContents).length > 0 ? fileContents : project.files;
      const reInjected = injectExecutableConfigs(currentFiles, projectName, updatedOS);

      setFileContents(reInjected);
      const updatedProject: GeneratedProject = {
        ...project,
        files: reInjected,
        fileList: Object.keys(reInjected),
      };
      onSetProject(updatedProject);
      showToast(`Updated native wrapper configs for ${key.toUpperCase()}`);
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setPromptCopied(true);
    showToast('Prompt copied to clipboard! Ready to paste into ChatGPT Web.');
    setTimeout(() => setPromptCopied(false), 2000);
  };

  const handleOpenChatGPT = () => {
    navigator.clipboard.writeText(generatedPrompt);
    showToast('Prompt copied to clipboard! Opening ChatGPT Web...');
    setTimeout(() => {
      window.open('https://chatgpt.com', '_blank', 'noopener,noreferrer');
    }, 300);
  };

  const handleFileChange = (newText: string) => {
    setFileContents((prev) => ({
      ...prev,
      [activeFilePath]: newText,
    }));
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleParsePastedResponse = (textToParse?: string) => {
    const text = textToParse || pastedResponse;
    setParseError(null);
    if (!text.trim()) {
      setParseError('Please paste the Web AI code response into the box.');
      return;
    }

    try {
      const parsed = extractAndParseJSON<{
        projectName?: string;
        description?: string;
        files: Record<string, string>;
      }>(text, 'code');

      if (!parsed.files || Object.keys(parsed.files).length === 0) {
        throw new Error('Parsed response missing "files" map.');
      }

      const projectName = parsed.projectName || 'meta-ai-generated-app';
      const enrichedFiles = injectExecutableConfigs(parsed.files, projectName, targetOS);
      const fileList = Object.keys(enrichedFiles);

      const generated: GeneratedProject = {
        projectName,
        description: parsed.description || 'Application synthesized by Zero-API Code Generator',
        files: enrichedFiles,
        fileList,
        masterSpec: fallbackMasterSpec,
        strategyName: selectedStrategy.name,
      };

      onSetProject(generated);
      setFileContents(enrichedFiles);
    } catch (err: any) {
      console.error('Parsing error in Stage 4:', err);
      setParseError(err.message || 'Failed to parse JSON codebase. Ensure you copy the complete Web AI JSON output.');
    }
  };

  const handleAutoFillDemo = () => {
    const rawDemoFiles: Record<string, string> = {
      'package.json': JSON.stringify(
        {
          name: 'meta-ai-web-app',
          version: '1.0.0',
          private: true,
          dependencies: {
            react: '^18.3.1',
            'react-dom': '^18.3.1',
            'lucide-react': '^0.344.0',
          },
        },
        null,
        2
      ),
      'src/App.tsx': `import React, { useState } from 'react';
import { Sparkles, Layout, CheckCircle, Code, Share2, Layers, Cpu, ArrowRight, Activity, Zap, HardDrive } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [counter, setCounter] = useState(0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 sm:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">${selectedStrategy?.name || 'Meta-AI Generated Platform'}</h1>
              <p className="text-xs text-slate-400">Synthesized Codebase • ${userPrompt || 'Custom App Idea'}</p>
            </div>
          </div>
          <span className="text-xs font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full">
            Live Sandbox Active
          </span>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
            <h2 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4" /> Client State Reactive
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Demonstrating live client state updates inside the Babel standalone iframe sandbox.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => setCounter(c => c + 1)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
              >
                Increment: {counter}
              </button>
            </div>
          </div>

          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
            <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4" /> Zero-API Architecture
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              ${selectedStrategy?.architecture || 'Modular client-side architecture with browser prompt bridge.'}
            </p>
          </div>

          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
            <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <HardDrive className="w-4 h-4" /> Drive Auto-Sync
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Codebase ready for client-side Google Drive sync and editor permissions grant to athanu000@gmail.com.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}`,
      'src/components/Header.tsx': `import React from 'react';

export const Header = () => (
  <header className="p-4 bg-slate-900 border-b border-slate-800 text-white font-bold text-sm">
    Meta-AI Generated Component Header
  </header>
);`,
      'README.md': `# Meta-AI Generated Web App
Target Idea: ${userPrompt}
Strategy: ${selectedStrategy?.name}

## Getting Started
1. Extract ZIP contents
2. Run \`npm install\`
3. Run \`npm run dev\`
`,
    };

    const demoFiles = injectExecutableConfigs(rawDemoFiles, 'meta-ai-demo-app', targetOS);

    const demoProject: GeneratedProject = {
      projectName: 'meta-ai-demo-app',
      description: 'Demo synthesized project structure with multi-OS binary build configs',
      files: demoFiles,
      fileList: Object.keys(demoFiles),
      masterSpec: fallbackMasterSpec,
      strategyName: selectedStrategy.name,
    };

    onSetProject(demoProject);
    setFileContents(demoFiles);
    setPastedResponse(JSON.stringify(demoProject, null, 2));
  };

  const handleDownloadZip = async () => {
    if (!project) return;
    setIsZipping(true);

    try {
      const zip = new JSZip();
      const filesToZip = Object.keys(fileContents).length > 0 ? fileContents : project.files;

      Object.entries(filesToZip).forEach(([path, content]) => {
        zip.file(path, String(content ?? ''));
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${project.projectName || 'meta-ai-app'}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating zip:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const generatePreviewSrcDoc = () => {
    const files = Object.keys(fileContents).length > 0 ? fileContents : project?.files || {};
    const appTsx = files['src/App.tsx'] || '';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://unpkg.com/lucide-react@0.300.0/dist/umd/lucide-react.min.js"></script>
  <style>
    body { background-color: #020617; color: #f8fafc; font-family: ui-sans-serif, system-ui, sans-serif; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    try {
      const Lucide = window.LucideReact || {};
      const { Sparkles, Layout, CheckCircle, Code, Share2, Layers, Cpu, ArrowRight, Activity, Zap, HardDrive } = Lucide;

      ${appTsx
        .replace(/import .* from .*/g, '')
        .replace(/export default function App\(\)/g, 'function App()')}

      const rootElement = document.getElementById('root');
      if (rootElement) {
        ReactDOM.createRoot(rootElement).render(<App />);
      }
    } catch (err) {
      document.getElementById('root').innerHTML = '<div style="padding: 24px; color: #f87171; font-family: monospace;"><h3>Preview Render Error:</h3><pre>' + err.message + '</pre></div>';
    }
  </script>
</body>
</html>`;
  };

  const filteredFiles = (project?.fileList || Object.keys(fileContents)).filter((f) =>
    f.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn relative">
      {/* Toast Notification Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-bounce">
          <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold rounded-full flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5" />
              Stage 4 • ChatGPT / Builder Web Code Generator
            </span>
            <span className="text-xs font-mono bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 px-2.5 py-0.5 rounded-full">
              Zero-API Client Parser
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
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Master Spec
            </button>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Generate Codebase & Interactive Workbench
        </h2>
        <p className="text-slate-400 text-sm mt-2 max-w-3xl leading-relaxed">
          Copy the generated Master Prompt for <strong className="text-indigo-300">ChatGPT Web / Builder AI (chatgpt.com)</strong>, run it, and paste the code response back to render the live multi-file workbench and sandbox preview.
        </p>

        {project && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-md shadow-indigo-600/20"
            >
              <Download className="w-3.5 h-3.5" />
              {isZipping ? 'Archiving Suite...' : 'Export Cross-Platform Suite (.zip)'}
            </button>

            <button
              onClick={onProceedToDriveSync}
              className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer"
            >
              <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
              Proceed to Stage 5: Google Drive Sync
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Multi-OS Target Exporter Panel */}
      <div className="bg-slate-900/90 border border-indigo-500/40 rounded-2xl p-6 shadow-2xl space-y-5 relative overflow-hidden backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                Multi-OS Target Exporter & Native Binary Suite
              </span>
              <span className="px-2.5 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-mono rounded-full">
                Cross-Platform Native Wrappers
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-white">
              Select Target Operating Systems for Binary Compilation
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed max-w-4xl">
              Toggle target OS platforms below to dynamically inject Rust/Tauri desktop wrappers, Capacitor Android Gradle builds, local <code className="text-indigo-300 font-mono">build-all.sh/.bat</code> scripts, and GitHub CI/CD Actions into your project.
            </p>
          </div>

          {project && (
            <button
              type="button"
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-indigo-600/20 cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
              {isZipping ? 'Archiving Suite...' : 'Export Cross-Platform Suite (.zip)'}
            </button>
          )}
        </div>

        {/* Target OS Selection Checklist Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Windows Target */}
          <button
            type="button"
            onClick={() => handleToggleTargetOS('windows')}
            className={`p-4 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
              targetOS.windows
                ? 'bg-indigo-950/60 border-indigo-500/60 text-white shadow-md'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Monitor className={`w-4 h-4 ${targetOS.windows ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span className="font-bold text-xs">Windows Desktop</span>
              </div>
              {targetOS.windows ? <CheckSquare className="w-4 h-4 text-indigo-400" /> : <Square className="w-4 h-4 text-slate-600" />}
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Compiles native <strong className="text-slate-300">.exe</strong> & <strong className="text-slate-300">.msi</strong> installers via Tauri Rust framework.
            </p>
            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>Target: x86_64 Win</span>
              <span className={targetOS.windows ? 'text-indigo-300 font-bold' : ''}>npm run build:win</span>
            </div>
          </button>

          {/* macOS Target */}
          <button
            type="button"
            onClick={() => handleToggleTargetOS('macos')}
            className={`p-4 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
              targetOS.macos
                ? 'bg-cyan-950/60 border-cyan-500/60 text-white shadow-md'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Laptop className={`w-4 h-4 ${targetOS.macos ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span className="font-bold text-xs">macOS Desktop</span>
              </div>
              {targetOS.macos ? <CheckSquare className="w-4 h-4 text-cyan-400" /> : <Square className="w-4 h-4 text-slate-600" />}
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Compiles Universal Apple Silicon & Intel <strong className="text-slate-300">.dmg</strong> & <strong className="text-slate-300">.app</strong> bundles.
            </p>
            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>Target: Universal Mac</span>
              <span className={targetOS.macos ? 'text-cyan-300 font-bold' : ''}>npm run build:mac</span>
            </div>
          </button>

          {/* Linux Target */}
          <button
            type="button"
            onClick={() => handleToggleTargetOS('linux')}
            className={`p-4 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
              targetOS.linux
                ? 'bg-amber-950/60 border-amber-500/60 text-white shadow-md'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Terminal className={`w-4 h-4 ${targetOS.linux ? 'text-amber-400' : 'text-slate-500'}`} />
                <span className="font-bold text-xs">Linux Desktop</span>
              </div>
              {targetOS.linux ? <CheckSquare className="w-4 h-4 text-amber-400" /> : <Square className="w-4 h-4 text-slate-600" />}
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Compiles standalone <strong className="text-slate-300">.AppImage</strong> & Debian <strong className="text-slate-300">.deb</strong> linux packages.
            </p>
            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>Target: x86_64 Linux</span>
              <span className={targetOS.linux ? 'text-amber-300 font-bold' : ''}>npm run build:linux</span>
            </div>
          </button>

          {/* Android Mobile Target */}
          <button
            type="button"
            onClick={() => handleToggleTargetOS('android')}
            className={`p-4 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
              targetOS.android
                ? 'bg-emerald-950/60 border-emerald-500/60 text-white shadow-md'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Smartphone className={`w-4 h-4 ${targetOS.android ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span className="font-bold text-xs">Android Mobile</span>
              </div>
              {targetOS.android ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-slate-600" />}
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Generates Capacitor Gradle wrappers for <strong className="text-slate-300">.apk</strong> & <strong className="text-slate-300">.aab</strong> mobile builds.
            </p>
            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>Target: Android Gradle</span>
              <span className={targetOS.android ? 'text-emerald-300 font-bold' : ''}>npm run build:android</span>
            </div>
          </button>
        </div>

        {/* Injected File Badges */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-300">Injected Suite Files:</span>
            <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono text-indigo-300">
              build-all.sh & build-all.bat
            </span>
            <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono text-cyan-300">
              .github/workflows/build-executables.yml
            </span>
            {(targetOS.windows || targetOS.macos || targetOS.linux) && (
              <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono text-amber-300">
                src-tauri/*
              </span>
            )}
            {targetOS.android && (
              <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono text-emerald-300">
                capacitor.config.ts & .json
              </span>
            )}
            <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono text-slate-300">
              BUILD_GUIDE.md
            </span>
          </div>
        </div>
      </div>

      {/* Stage 4 Prompt Bridge Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Box: Generated Prompt */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                <Code className="w-4 h-4" />
                Generated ChatGPT Code Prompt
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
              {promptCopied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              {promptCopied ? 'Copied Prompt!' : 'Copy Prompt for ChatGPT'}
            </button>

            <button
              type="button"
              onClick={handleOpenChatGPT}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              Open ChatGPT
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          </div>
        </div>

        {/* Right Box: Response Extractor */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <ClipboardPaste className="w-4 h-4" />
                Paste ChatGPT / Web AI Response Here
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
              placeholder="Paste the JSON code response received from ChatGPT or Builder AI here..."
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
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/20 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Parse Codebase & Render Live Workbench
          </button>
        </div>
      </div>

      {/* Code Workbench Grid when Project exists */}
      {project && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 min-h-[600px] pt-2">
          {/* File Explorer Sidebar */}
          <div className="lg:col-span-3 border-r border-slate-800 bg-slate-950/80 p-4 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FolderOpen className="w-4 h-4 text-indigo-400" /> File Explorer
                </span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
                  {Object.keys(fileContents).length} Files
                </span>
              </div>

              {/* Filter */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              {/* File Tree List */}
              <div className="space-y-1 overflow-y-auto max-h-[400px]">
                {filteredFiles.map((path) => {
                  const isActive = activeFilePath === path;
                  return (
                    <button
                      key={path}
                      onClick={() => setActiveFilePath(path)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono transition flex items-center justify-between cursor-pointer ${
                        isActive
                          ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                      }`}
                    >
                      <span className="truncate flex items-center gap-1.5">
                        <FileCode className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        {path}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div>Project: <span className="text-white font-medium">{project.projectName}</span></div>
              <div>Strategy: <span className="text-indigo-400 font-medium">{project.strategyName}</span></div>
            </div>
          </div>

          {/* Main Workspace */}
          <div className="lg:col-span-9 flex flex-col bg-slate-950">
            <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    activeTab === 'preview'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" /> Live Sandbox Preview
                </button>
                <button
                  onClick={() => setActiveTab('editor')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    activeTab === 'editor'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" /> Source Code Editor
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-indigo-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  {activeFilePath}
                </span>

                <button
                  onClick={handleCopyCode}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition"
                  title="Copy File Code"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Code Editor View */}
            {activeTab === 'editor' && (
              <div className="flex-1 p-4 bg-slate-950 flex flex-col">
                <textarea
                  value={currentContent}
                  onChange={(e) => handleFileChange(e.target.value)}
                  className="w-full h-full min-h-[500px] bg-slate-950 text-slate-200 font-mono text-xs p-4 focus:outline-none resize-none leading-relaxed border-0"
                  spellCheck={false}
                />
              </div>
            )}

            {/* Live Sandbox Preview View */}
            {activeTab === 'preview' && (
              <div className="flex-1 p-4 bg-slate-950 flex flex-col">
                <div className="w-full h-full min-h-[520px] rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-inner">
                  <iframe
                    title="Live Preview Sandbox"
                    srcDoc={generatePreviewSrcDoc()}
                    className="w-full h-full min-h-[520px] border-0"
                    sandbox="allow-scripts allow-modals"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
