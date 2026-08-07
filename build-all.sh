#!/bin/bash
# Multi-Platform Binary Compilation Runner Script for macOS / Linux
echo "==============================================="
echo " Building Multi-OS Binary Suite for Meta-AI Builder"
echo "==============================================="

echo "[1/3] Compiling Web Assets with Vite..."
npm run build

echo "[2/3] Compiling macOS Desktop App (.dmg / .app)..."
npm run build:mac 2>/dev/null || echo "Skipped macOS desktop build (run on macOS with Rust installed)"

echo "[2/3] Compiling Linux AppImage (.AppImage / .deb)..."
npm run build:linux 2>/dev/null || echo "Skipped Linux desktop build (run on Linux with Rust installed)"

echo "[3/3] Compiling Android Debug Package (.apk)..."
npm run build:android 2>/dev/null || echo "Skipped Android APK build (requires Capacitor & Android SDK)"

echo "==============================================="
echo " Build Suite Execution Complete!"
echo " Outputs located in dist/, src-tauri/target/release/bundle, and android/"
echo "==============================================="
