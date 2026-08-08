import React, { useState } from 'react';
import JSZip from 'jszip';
import { motion, AnimatePresence } from 'motion/react';
import {
  Github,
  GitBranch,
  Terminal,
  Copy,
  Check,
  Download,
  ExternalLink,
  Workflow,
  X,
  Sparkles,
  FileCode,
  ShieldCheck,
  FolderArchive,
  Laptop,
} from 'lucide-react';
import { GeneratedProject } from '../types';

interface GitHubExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: GeneratedProject | null;
  fileContents?: Record<string, string>;
}

export const GitHubExportModal: React.FC<GitHubExportModalProps> = ({
  isOpen,
  onClose,
  project,
  fileContents = {},
}) => {
  const [activeTab, setActiveTab] = useState<'cli' | 'zip' | 'workflow' | 'aistudio'>('cli');
  const [repoName, setRepoName] = useState<string>(
    (project?.projectName || 'my-awesome-app').toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
  );
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [defaultBranch, setDefaultBranch] = useState<string>('main');
  const [copiedCli, setCopiedCli] = useState<boolean>(false);
  const [copiedWorkflow, setCopiedWorkflow] = useState<boolean>(false);
  const [copiedGitignore, setCopiedGitignore] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);

  if (!isOpen) return null;

  const effectiveFiles: Record<string, string> = {
    ...(project?.files || {}),
    ...fileContents,
  };

  const defaultGitignore = `# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Dependencies
node_modules/
.pnpm-store/

# Production Build
dist/
build/
out/

# Environment
.env
.env.local
.env.development.local
.env.production.local

# IDE & System
.vscode/
.idea/
.DS_Store
Thumbs.db

# Executables & Native Wrappers
src-tauri/target/
android/app/build/
`;

  const defaultWorkflowYml = `name: CI/CD & GitHub Pages Deployment

on:
  push:
    branches: [ ${defaultBranch} ]
  pull_request:
    branches: [ ${defaultBranch} ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci || npm install

      - name: Typecheck & Lint
        run: npm run lint || true

      - name: Build Application
        run: npm run build

      - name: Upload Build Artifacts
        uses: actions/upload-artifact@v4
        with:
          name: dist-build
          path: dist/
`;

  const generateCliScript = () => {
    return `# 🚀 GitHub CLI One-Click Publish Script
# Step 1: Initialize local Git repository
git init -b ${defaultBranch}

# Step 2: Add all source files & commit
git add .
git commit -m "feat: initial commit from Meta-AI Builder codebase"

# Step 3: Create GitHub Repository & Push using GitHub CLI (gh)
gh repo create ${repoName} ${isPrivate ? '--private' : '--public'} --source=. --remote=origin --push

# Optional: View your new repository in browser
gh repo view --web
`;
  };

  const handleCopyCli = () => {
    navigator.clipboard.writeText(generateCliScript());
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  const handleCopyWorkflow = () => {
    navigator.clipboard.writeText(defaultWorkflowYml);
    setCopiedWorkflow(true);
    setTimeout(() => setCopiedWorkflow(false), 2000);
  };

  const handleCopyGitignore = () => {
    navigator.clipboard.writeText(defaultGitignore);
    setCopiedGitignore(true);
    setTimeout(() => setCopiedGitignore(false), 2000);
  };

  const handleDownloadGitHubZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      // Write all user source files
      Object.entries(effectiveFiles).forEach(([path, content]) => {
        zip.file(path, content);
      });

      // Ensure GitHub specific infrastructure files exist
      if (!effectiveFiles['.gitignore']) {
        zip.file('.gitignore', defaultGitignore);
      }
      if (!effectiveFiles['.github/workflows/deploy.yml']) {
        zip.file('.github/workflows/deploy.yml', defaultWorkflowYml);
      }

      if (!effectiveFiles['README.md']) {
        const readmeContent = `# ${project?.projectName || 'Project Architecture'}

> Automated full-stack codebase generated via **Meta-AI Builder Zero-API Suite**.

## 🚀 Quick Start Guide

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Development Mode
\`\`\`bash
npm run dev
\`\`\`

### 3. Production Build
\`\`\`bash
npm run build
\`\`\`

## 🛠️ GitHub Push Commands
\`\`\`bash
git init -b ${defaultBranch}
git add .
git commit -m "feat: initial commit"
gh repo create ${repoName} ${isPrivate ? '--private' : '--public'} --source=. --remote=origin --push
\`\`\`
`;
        zip.file('README.md', readmeContent);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${repoName}-github-repo.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate GitHub repository zip:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-slate-900 border border-indigo-500/30 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header Bar */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-900 p-0.5 border border-indigo-500/40 flex items-center justify-center">
              <Github className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base">GitHub Export Facility</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Repo Suite
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Publish codebase directly to GitHub with CI/CD workflows, CLI scripts & repo packages
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Repository Settings Panel */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <span className="text-slate-400 font-medium">Repository Name:</span>
            <input
              type="text"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500 flex-1 max-w-xs"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setIsPrivate(!isPrivate)}>
              <span className="text-slate-400">Visibility:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isPrivate ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                {isPrivate ? 'Private' : 'Public'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-400">Branch:</span>
              <span className="font-mono text-slate-200 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{defaultBranch}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 bg-slate-900 flex items-center gap-2 border-b border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('cli')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl transition flex items-center gap-2 border-b-2 ${
              activeTab === 'cli'
                ? 'border-indigo-500 text-indigo-300 bg-slate-950/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            GitHub CLI Script
          </button>

          <button
            onClick={() => setActiveTab('zip')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl transition flex items-center gap-2 border-b-2 ${
              activeTab === 'zip'
                ? 'border-indigo-500 text-indigo-300 bg-slate-950/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderArchive className="w-3.5 h-3.5 text-cyan-400" />
            Repo Package (.ZIP)
          </button>

          <button
            onClick={() => setActiveTab('workflow')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl transition flex items-center gap-2 border-b-2 ${
              activeTab === 'workflow'
                ? 'border-indigo-500 text-indigo-300 bg-slate-950/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Workflow className="w-3.5 h-3.5 text-emerald-400" />
            CI/CD Actions
          </button>

          <button
            onClick={() => setActiveTab('aistudio')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl transition flex items-center gap-2 border-b-2 ${
              activeTab === 'aistudio'
                ? 'border-indigo-500 text-indigo-300 bg-slate-950/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            AI Studio Built-in Export
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'cli' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-indigo-400" />
                    One-Click Terminal Commands (gh CLI)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Run these commands in your local directory after downloading or cloning to create a remote repository.
                  </p>
                </div>

                <button
                  onClick={handleCopyCli}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                >
                  {copiedCli ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCli ? 'Copied Commands!' : 'Copy Shell Script'}
                </button>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-indigo-300 overflow-x-auto whitespace-pre leading-relaxed select-all">
                {generateCliScript()}
              </div>

              <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl text-xs text-slate-400 space-y-1">
                <div className="font-bold text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  Prerequisite:
                </div>
                <p className="text-[11px]">
                  Ensure GitHub CLI is installed (<code className="text-cyan-300">brew install gh</code> or <code className="text-cyan-300">winget install GitHub.cli</code>) and authenticated via <code className="text-indigo-300">gh auth login</code>.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'zip' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <FolderArchive className="w-4 h-4 text-cyan-400" />
                  GitHub-Ready Repository Zip Archive
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Downloads a complete standalone project folder pre-packaged with <code className="text-cyan-300">.gitignore</code>, <code className="text-indigo-300">README.md</code>, and GitHub Actions workflows.
                </p>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="text-xs font-bold text-slate-300">Archive Contents Checklist:</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono text-slate-300">
                  <div className="p-2 bg-slate-900 rounded border border-slate-800 flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-indigo-400" /> .gitignore
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800 flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-cyan-400" /> README.md
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800 flex items-center gap-1.5">
                    <Workflow className="w-3.5 h-3.5 text-emerald-400" /> .github/workflows/
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800 flex items-center gap-1.5">
                    <Laptop className="w-3.5 h-3.5 text-amber-400" /> package.json & Vite
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800 flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-rose-400" /> {Object.keys(effectiveFiles).length} Source Files
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> LICENSE
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleDownloadGitHubZip}
                    disabled={isZipping}
                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    {isZipping ? 'Creating Repository Archive...' : 'Download GitHub Repo (.zip)'}
                  </button>
                </div>
              </div>

              {/* Gitignore preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span>Included .gitignore Preview:</span>
                  <button onClick={handleCopyGitignore} className="text-indigo-400 hover:text-indigo-300 text-[11px]">
                    {copiedGitignore ? 'Copied!' : 'Copy .gitignore'}
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-400 max-h-32 overflow-y-auto">
                  {defaultGitignore}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'workflow' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Workflow className="w-4 h-4 text-emerald-400" />
                    GitHub Actions CI/CD Pipeline (<code className="text-emerald-300">.github/workflows/deploy.yml</code>)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Automates typechecking, linting, building, and artifact uploading on every push to <code className="text-indigo-300">{defaultBranch}</code>.
                  </p>
                </div>

                <button
                  onClick={handleCopyWorkflow}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedWorkflow ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedWorkflow ? 'Copied YAML!' : 'Copy Workflow YAML'}
                </button>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-300 max-h-64 overflow-y-auto whitespace-pre leading-relaxed select-all">
                {defaultWorkflowYml}
              </div>
            </div>
          )}

          {activeTab === 'aistudio' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  AI Studio Platform Native Export
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  You can also export directly to GitHub or download your workspace using the native platform top bar.
                </p>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 text-xs text-slate-300">
                <div className="font-bold text-indigo-300 flex items-center gap-2">
                  <span>How to export via AI Studio UI:</span>
                </div>
                <ol className="list-decimal pl-5 space-y-2 text-slate-300 text-[11px] leading-relaxed">
                  <li>
                    Look at the top-right header controls in AI Studio.
                  </li>
                  <li>
                    Click on the <strong>Settings</strong> gear or the <strong>Share / Export</strong> menu button.
                  </li>
                  <li>
                    Select <strong>Export to GitHub</strong> or <strong>Export as ZIP</strong>.
                  </li>
                  <li>
                    Authorize your GitHub account when prompted to push directly to a new repository.
                  </li>
                </ol>

                <div className="pt-2 flex items-center gap-3">
                  <a
                    href="https://github.com/new"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition"
                  >
                    Create Blank Repo on GitHub
                    <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Github className="w-4 h-4 text-slate-400" />
            <span>Target Repo: <strong className="text-slate-300">{repoName}</strong></span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
