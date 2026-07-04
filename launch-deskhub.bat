@echo off
chcp 65001 > nul
title DeskHub Launcher v2.0

echo.
echo ============================================================
echo   DeskHub Launcher v2.0
echo   Starting interactive menu...
echo ============================================================
echo.

cd /d "%~dp0"

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0launch-deskhub.ps1"

if errorlevel 1 (
    echo.
    echo [ERROR] Launcher returned non-zero exit code.
    pause
)
