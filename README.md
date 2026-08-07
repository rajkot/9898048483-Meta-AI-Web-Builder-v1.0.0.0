# Meta-AI Web Builder (100% Zero-API Prompt Bridge)

A multi-stage web application builder that leverages free, logged-in Web AI accounts (**Gemini Web**, **DeepSeek Web**, **Claude Web**, and **ChatGPT Web**) to generate application architecture, domain requirements, master specifications, multi-file codebases, and auto-sync deliverables directly to **Google Drive**.

---

## 🌟 Key Architecture & Features

### 1. Zero-API Prompt Bridge
- **No Cost / No API Keys**: Uses engineered prompts designed to be pasted into free web tabs for Gemini, DeepSeek, Claude, and ChatGPT.
- **Chrome Extension Auto-Bridge**: Includes a built-in Manifest V3 Chrome Extension generator that auto-detects AI outputs in active browser tabs and bridges them back to the app via `window.postMessage`.

### 2. Multi-Stage Pipeline
1. **Stage 1: Strategy Engine (Gemini Web)** – Generates 3 tailored architectural strategies based on user prompts and target stacks.
2. **Stage 2: Domain Collector (DeepSeek Web)** – Formulates domain-specific questions to clarify technical requirements and user personas.
3. **Stage 3: Master Spec Architect (Claude Web)** – Produces a comprehensive technical contract and `MASTER_PROMPT.md`.
4. **Stage 4: Execution Engine (ChatGPT Web)** – Generates a complete multi-file code tree rendered inside a live Babel in-browser iframe preview sandbox with `.zip` export capabilities.
5. **Stage 5: Google Drive Auto-Sync (Drive REST API v3)** – Uploads all generated project files into a structured Google Drive folder with automatic permissions granted to `athanu000@gmail.com`.

### 3. Target Tech Stack Switcher
Supports 4 presets that automatically update prompt templates across all 5 stages:
- **React + Tailwind CSS** (Vite SPA Sandbox)
- **Static HTML / CSS / JS** (Vanilla Web)
- **Node.js + Express** (Full-stack API & Backend)
- **Flutter Mobile** (Cross-platform Dart & Mobile)

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+ or 20+
- `npm` or `bun`

### Installation & Execution

```bash
# Clone repository
git clone https://github.com/your-username/meta-ai-web-builder.git
cd meta-ai-web-builder

# Install dependencies
npm install

# Start development server (Port 3000)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧩 Installing the Zero-API Chrome Extension

1. Click **"Auto-Bridge"** or **"Download Extension"** in the top navigation bar.
2. Click **"Download Chrome Extension (.zip)"** to save the generated extension bundle.
3. Unzip the downloaded file on your computer.
4. Open Google Chrome and navigate to `chrome://extensions`.
5. Enable **Developer mode** using the toggle in the top-right corner.
6. Click **"Load unpacked"** and select the unzipped extension directory.
7. Open Gemini, DeepSeek, Claude, or ChatGPT in Chrome—the extension will automatically bridge responses back to Meta-AI Web Builder!

---

## 📁 Google Drive Auto-Sync Setup

1. In **Stage 5 (Google Drive Auto-Sync)**, input a valid Google OAuth Access Token with the `https://www.googleapis.com/auth/drive.file` scope.
2. Click **"Start Google Drive Sync"**.
3. Progress tracks file-by-file (`Uploading X of Y files...`).
4. Upon completion, a folder containing all codebase files is created and automatically shared with `athanu000@gmail.com`.

---

## 🛠️ Technology Stack

- **Framework**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Live Preview Sandbox**: In-browser Babel Standalone transformer & sandboxed iframe runner
- **State & Draft Persistence**: LocalStorage draft engine with history manager
- **Cloud Integration**: Google Drive REST API v3

---

## 🚢 Production Deployment

### Deploy to Vercel
This repository includes a `vercel.json` file configured for single-page Vite applications. Click deploy in Vercel or run:

```bash
npx vercel
```

### Docker / Containerization
A multi-stage `Dockerfile` is included for deployment to Cloud Run, Railway, or Render:

```bash
docker build -t meta-ai-builder .
docker run -p 3000:3000 meta-ai-builder
```

---

## 📦 Pushing to Git Repository (GitHub / GitLab)

All repository configuration files (`.gitignore`, `.gitattributes`, `LICENSE`, `package.json`, `.github/workflows/ci.yml`, `.github/workflows/build-executables.yml`, `build-all.sh`, `build-all.bat`, and `BUILD_GUIDE.md`) are pre-configured.

To push to your Git remote:

```bash
# 1. Initialize git repository (if not already done)
git init

# 2. Stage all files
git add .

# 3. Create initial commit
git commit -m "feat: initial commit of Meta-AI Web Builder with Multi-OS Target Exporter"

# 4. Set main branch & add remote origin
git branch -M main
git remote add origin https://github.com/your-username/meta-ai-web-builder.git

# 5. Push to remote repository
git push -u origin main
```
