@echo off
rem Multi-Platform Binary Compilation Runner Script for Windows
echo ===============================================
echo  Building Multi-OS Binary Suite for Meta-AI Builder (Windows)
echo ===============================================

echo [1/3] Compiling Web Assets with Vite...
call npm run build

echo [2/3] Compiling Windows Executable (.exe / .msi)...
call npm run build:win

echo [3/3] Syncing & Compiling Android Debug APK (.apk)...
call npm run build:android

echo ===============================================
echo  Build Process Complete!
echo  Executable outputs saved in src-tauri\target\release\bundle
echo ===============================================
pause
