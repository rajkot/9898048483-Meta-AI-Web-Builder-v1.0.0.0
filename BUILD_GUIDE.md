# Multi-Platform Executable & Native Binary Build Guide

This codebase includes built-in support for compiling native desktop binaries (**Windows .exe**, **macOS .dmg**, **Linux .AppImage**) via **Tauri** and mobile native packages (**Android .apk**) via **Capacitor**.

---

## ⚡ Single-Command Local Builds

Make sure Node.js (v18+) is installed. Run the following commands from the project root:

### 1. Windows Executable (.exe & .msi)
```bash
npm run build:win
```
> **Output Path**: `src-tauri/target/release/bundle/msi/*.msi` & `*.exe`

### 2. macOS App & Disk Image (.dmg & .app)
```bash
npm run build:mac
```
> **Output Path**: `src-tauri/target/release/bundle/dmg/*.dmg`

### 3. Linux AppImage & Debian Package (.AppImage & .deb)
```bash
npm run build:linux
```
> **Output Path**: `src-tauri/target/release/bundle/appimage/*.AppImage`

### 4. Android Native Package (.apk)
```bash
npm run build:android
```
> **Output Path**: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🛠️ One-Click Build Scripts

- **macOS / Linux**: Run `./build-all.sh`
- **Windows**: Double click `build-all.bat`

---

## 🤖 Automatic Multi-OS GitHub Actions CI/CD

When you push this repository to GitHub, the included workflow `.github/workflows/build-executables.yml` automatically compiles binaries across all 4 OS platforms in parallel:
- **Windows runner** compiles `.exe` & `.msi`
- **macOS runner** compiles `.dmg` for Apple Silicon & Intel
- **Ubuntu runner** compiles `.AppImage` & `.deb`
- **Android runner** compiles `.apk`

Download your compiled binaries directly from the **GitHub Actions > Artifacts** tab!
