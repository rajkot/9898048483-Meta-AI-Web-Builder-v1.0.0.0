export interface TargetOSOptions {
  windows: boolean;
  macos: boolean;
  linux: boolean;
  android: boolean;
}

export function injectExecutableConfigs(
  files: Record<string, string>,
  projectName: string = 'meta-ai-app',
  targetOS: TargetOSOptions = { windows: true, macos: true, linux: true, android: true }
): Record<string, string> {
  const enriched: Record<string, string> = { ...files };
  const sanitizedName = projectName.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const isAnyDesktop = targetOS.windows || targetOS.macos || targetOS.linux;

  // 1. Update or inject package.json with selected target build scripts
  if (enriched['package.json']) {
    try {
      const pkg = JSON.parse(enriched['package.json']);
      pkg.scripts = pkg.scripts || {};
      pkg.scripts.build = pkg.scripts.build || 'vite build';

      if (targetOS.windows) {
        pkg.scripts['build:win'] = 'tauri build --target x86_64-pc-windows-msvc';
      } else {
        delete pkg.scripts['build:win'];
      }

      if (targetOS.macos) {
        pkg.scripts['build:mac'] = 'tauri build --target universal-apple-darwin';
      } else {
        delete pkg.scripts['build:mac'];
      }

      if (targetOS.linux) {
        pkg.scripts['build:linux'] = 'tauri build --target x86_64-unknown-linux-gnu';
      } else {
        delete pkg.scripts['build:linux'];
      }

      if (isAnyDesktop) {
        pkg.scripts.tauri = 'tauri';
        pkg.devDependencies = pkg.devDependencies || {};
        pkg.devDependencies['@tauri-apps/cli'] = '^1.6.0';
        pkg.dependencies = pkg.dependencies || {};
        pkg.dependencies['@tauri-apps/api'] = '^1.6.0';
      }

      if (targetOS.android) {
        pkg.scripts['build:android'] = 'cap sync android && cd android && ./gradlew assembleDebug';
        pkg.scripts['cap:sync'] = 'cap sync';
        pkg.devDependencies = pkg.devDependencies || {};
        pkg.devDependencies['@capacitor/cli'] = '^6.0.0';
        pkg.dependencies = pkg.dependencies || {};
        pkg.dependencies['@capacitor/core'] = '^6.0.0';
        pkg.dependencies['@capacitor/android'] = '^6.0.0';
      } else {
        delete pkg.scripts['build:android'];
        delete pkg.scripts['cap:sync'];
      }

      enriched['package.json'] = JSON.stringify(pkg, null, 2);
    } catch (_) {
      // Ignore JSON parse errors
    }
  }

  // 2. Android Capacitor configurations (capacitor.config.ts & capacitor.config.json)
  if (targetOS.android) {
    enriched['capacitor.config.json'] = JSON.stringify(
      {
        appId: `com.metaai.${sanitizedName}`,
        appName: projectName,
        webDir: 'dist',
        bundledWebRuntime: false,
        server: {
          androidScheme: 'https',
        },
      },
      null,
      2
    );

    enriched['capacitor.config.ts'] = `import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.metaai.${sanitizedName}',
  appName: '${projectName}',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
`;
  } else {
    delete enriched['capacitor.config.json'];
    delete enriched['capacitor.config.ts'];
  }

  // 3. Desktop Rust/Tauri & Electron native boilerplate
  if (isAnyDesktop) {
    enriched['electron-builder.json'] = JSON.stringify(
      {
        appId: `com.metaai.${sanitizedName}`,
        productName: projectName,
        directories: {
          output: 'dist-electron',
        },
        files: ['dist/**/*', 'electron-main.js', 'package.json'],
        win: {
          target: ['exe', 'zip'],
        },
        mac: {
          target: ['dmg', 'zip'],
        },
        linux: {
          target: ['AppImage'],
        },
      },
      null,
      2
    );

    enriched['electron-main.js'] = `const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.loadFile(path.join(__dirname, 'dist', 'index.html'));
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
`;

    enriched['src-tauri/tauri.conf.json'] = JSON.stringify(
      {
        $schema: 'https://raw.githubusercontent.com/tauri-apps/tauri/dev/tooling/cli/schema.json',
        build: {
          beforeDevCommand: 'npm run dev',
          beforeBuildCommand: 'npm run build',
          devPath: 'http://localhost:3000',
          distDir: '../dist',
        },
        package: {
          productName: projectName,
          version: '1.0.0',
        },
        tauri: {
          allowlist: {
            all: false,
            shell: {
              all: false,
              open: true,
            },
          },
          bundle: {
            active: true,
            category: 'DeveloperTool',
            copyright: 'Generated by Meta-AI Builder',
            deb: {
              depends: [],
            },
            externalBin: [],
            icon: ['icons/32x32.png', 'icons/128x128.png', 'icons/icon.icns', 'icons/icon.ico'],
            identifier: `com.metaai.${sanitizedName}`,
            targets: 'all',
            windows: {
              certificateThumbprint: null,
              digestAlgorithm: 'sha256',
              timestampUrl: '',
            },
          },
          security: {
            csp: null,
          },
          windows: [
            {
              fullscreen: false,
              height: 768,
              resizable: true,
              title: projectName,
              width: 1280,
            },
          ],
        },
      },
      null,
      2
    );

    enriched['src-tauri/Cargo.toml'] = `[package]
name = "${sanitizedName}"
version = "1.0.0"
description = "Desktop wrapper for ${projectName}"
authors = ["Meta-AI Builder"]
license = "MIT"
repository = ""
edition = "2021"

[build-dependencies]
tauri-build = { version = "1.5", features = [] }

[dependencies]
tauri = { version = "1.6", features = ["shell-open"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"

[features]
default = ["custom-protocol"]
custom-protocol = ["tauri/custom-protocol"]
`;

    enriched['src-tauri/src/main.rs'] = `#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
  tauri::Builder::default()
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
`;
  } else {
    delete enriched['src-tauri/tauri.conf.json'];
    delete enriched['src-tauri/Cargo.toml'];
    delete enriched['src-tauri/src/main.rs'];
  }

  // 4. Downloadable Desktop & Mobile CLI Runner Scripts
  enriched['build-all.sh'] = `#!/bin/bash
# Multi-Platform Binary Compilation Runner Script for macOS / Linux
echo "==============================================="
echo " Building Multi-OS Binary Suite for ${projectName}"
echo "==============================================="

echo "[1/3] Compiling Web Assets with Vite..."
npm run build

${
  targetOS.macos
    ? `echo "[2/3] Compiling macOS Desktop App (.dmg / .app)..."
npm run build:mac 2>/dev/null || echo "Skipped macOS desktop build (run on macOS with Rust installed)"`
    : ''
}

${
  targetOS.linux
    ? `echo "[2/3] Compiling Linux AppImage (.AppImage / .deb)..."
npm run build:linux 2>/dev/null || echo "Skipped Linux desktop build (run on Linux with Rust installed)"`
    : ''
}

${
  targetOS.android
    ? `echo "[3/3] Compiling Android Debug Package (.apk)..."
npm run build:android 2>/dev/null || echo "Skipped Android APK build (requires Capacitor & Android SDK)"`
    : ''
}

echo "==============================================="
echo " Build Suite Execution Complete!"
echo " Outputs located in dist/, src-tauri/target/release/bundle, and android/"
echo "==============================================="
`;

  enriched['build-all.bat'] = `@echo off
rem Multi-Platform Binary Compilation Runner Script for Windows
echo ===============================================
echo  Building Multi-OS Binary Suite for ${projectName} (Windows)
echo ===============================================

echo [1/3] Compiling Web Assets with Vite...
call npm run build

${
  targetOS.windows
    ? `echo [2/3] Compiling Windows Executable (.exe / .msi)...
call npm run build:win`
    : `echo [2/3] Windows target skipped.`
}

${
  targetOS.android
    ? `echo [3/3] Syncing & Compiling Android Debug APK (.apk)...
call npm run build:android`
    : `echo [3/3] Android target skipped.`
}

echo ===============================================
echo  Build Process Complete!
echo  Executable outputs saved in src-tauri\\target\\release\\bundle
echo ===============================================
pause
`;

  // 5. GitHub Actions multi-OS binary build CI/CD workflow
  const matrixIncludes: string[] = [];
  if (targetOS.windows) {
    matrixIncludes.push(`          - os: windows-latest\n            platform: windows`);
  }
  if (targetOS.macos) {
    matrixIncludes.push(`          - os: macos-latest\n            platform: macos`);
  }
  if (targetOS.linux) {
    matrixIncludes.push(`          - os: ubuntu-latest\n            platform: linux`);
  }

  const desktopJob = matrixIncludes.length > 0 ? `  build-desktop:
    name: Build Desktop Executables (\${{ matrix.platform }})
    runs-on: \${{ matrix.os }}
    strategy:
      fail-fast: false
      matrix:
        include:
${matrixIncludes.join('\n')}

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install Linux Dependencies
        if: matrix.os == 'ubuntu-latest'
        run: |
          sudo apt-get update
          sudo apt-get install -y fuse libfuse2 desktop-file-utils libgtk-3-dev

      - name: Install Node Dependencies
        run: npm install --legacy-peer-deps

      - name: Build Web Application
        run: npm run build

      - name: Inject Electron Configs into package.json
        shell: bash
        run: |
          node -e "
          const fs = require('fs');
          const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
          pkg.main = 'electron-main.js';
          pkg.author = pkg.author || 'Meta-AI';
          pkg.description = pkg.description || 'Meta-AI Web Builder App';
          fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
          "

          cat << 'EOF' > electron-main.js
          const { app, BrowserWindow } = require('electron');
          const path = require('path');

          function createWindow() {
            const win = new BrowserWindow({
              width: 1280,
              height: 800,
              webPreferences: { nodeIntegration: true, contextIsolation: false }
            });
            win.loadFile(path.join(__dirname, 'dist/index.html'));
          }

          app.whenReady().then(createWindow);
          app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
          EOF

          cat << 'EOF' > electron-builder.json
          {
            "appId": "com.metaai.webbuilder",
            "productName": "${projectName}",
            "directories": { "output": "release-builds" },
            "files": ["dist/**/*", "electron-main.js", "package.json"],
            "win": { "target": ["zip", "portable"] },
            "mac": { "target": ["dmg", "zip"] },
            "linux": { "target": ["AppImage"] }
          }
          EOF

      - name: Install Electron Builder CLI
        run: npm install --no-save electron@30.0.0 electron-builder@24.13.3

      - name: Compile Desktop Executables
        shell: bash
        run: |
          if [ "\${{ matrix.platform }}" == "windows" ]; then
            npx electron-builder --win --config electron-builder.json
          elif [ "\${{ matrix.platform }}" == "macos" ]; then
            npx electron-builder --mac --config electron-builder.json
          else
            npx electron-builder --linux --config electron-builder.json
          fi

      - name: Upload Desktop Binaries
        uses: actions/upload-artifact@v4
        with:
          name: ${sanitizedName}-\${{ matrix.platform }}-binary
          if-no-files-found: warn
          path: release-builds/*
` : '';

  const androidJob = targetOS.android ? `  build-android:
    name: Build Android APK (.apk)
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Java JDK 17
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install Node Dependencies
        run: npm install --legacy-peer-deps

      - name: Build Web Application
        run: npm run build

      - name: Auto-Scaffold Android Project if Missing
        run: |
          if [ ! -d "android" ]; then
            npx cap init MetaAIBuilder com.metaai.builder --web-dir dist
            npm install @capacitor/core @capacitor/cli @capacitor/android
            npx cap add android
          fi
          npx cap sync android || true

      - name: Compile Android Debug APK
        run: |
          if [ -d "android" ]; then
            cd android
            chmod +x gradlew
            ./gradlew assembleDebug
          fi

      - name: Upload Android APK
        uses: actions/upload-artifact@v4
        with:
          name: ${sanitizedName}-android-apk
          if-no-files-found: warn
          path: android/app/build/outputs/apk/debug/app-debug.apk
` : '';

  enriched['.github/workflows/build-executables.yml'] = `name: Multi-Platform Binary Compilation (.exe, .dmg, .AppImage, .apk)

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
${desktopJob}${androidJob}`;

  // 6. BUILD_GUIDE.md
  enriched['BUILD_GUIDE.md'] = `# Multi-Platform Executable & Native Binary Build Guide

This codebase includes built-in support for compiling native desktop binaries and mobile native packages.

---

## ⚡ Single-Command Local Builds

Make sure Node.js (v18+) is installed. Run the following commands from the project root:

${
  targetOS.windows
    ? `### 1. Windows Executable (.exe & .msi)
\`\`\`bash
npm run build:win
\`\`\`
> **Output Path**: \`src-tauri/target/release/bundle/msi/*.msi\` & \`*.exe\`
`
    : ''
}
${
  targetOS.macos
    ? `### 2. macOS App & Disk Image (.dmg & .app)
\`\`\`bash
npm run build:mac
\`\`\`
> **Output Path**: \`src-tauri/target/release/bundle/dmg/*.dmg\`
`
    : ''
}
${
  targetOS.linux
    ? `### 3. Linux AppImage & Debian Package (.AppImage & .deb)
\`\`\`bash
npm run build:linux
\`\`\`
> **Output Path**: \`src-tauri/target/release/bundle/appimage/*.AppImage\`
`
    : ''
}
${
  targetOS.android
    ? `### 4. Android Native Package (.apk)
\`\`\`bash
npm run build:android
\`\`\`
> **Output Path**: \`android/app/build/outputs/apk/debug/app-debug.apk\`
`
    : ''
}

---

## 🛠️ One-Click Build Scripts

- **macOS / Linux**: Run \`./build-all.sh\`
- **Windows**: Double click \`build-all.bat\`

---

## 🤖 Automatic Multi-OS GitHub Actions CI/CD

When you push this repository to GitHub, the included workflow \`.github/workflows/build-executables.yml\` automatically compiles binaries across all enabled OS platforms in parallel!
Download compiled binaries directly from the **GitHub Actions > Artifacts** tab.
`;

  return enriched;
}
