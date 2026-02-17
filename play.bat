@echo off
title Who is the Imposter?
echo Installing dependencies...
pip install colorama >nul 2>&1
echo.
python "%~dp0imposter.py"
pause
