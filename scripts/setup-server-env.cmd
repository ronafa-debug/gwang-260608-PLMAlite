@echo off
cd /d %~dp0..
powershell -ExecutionPolicy Bypass -File .\scripts\setup-server-env.ps1
pause
