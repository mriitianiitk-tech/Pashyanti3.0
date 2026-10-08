@echo off
:: Navigate to the directory where this script is located
cd /d "%~dp0"

echo =========================================
echo   Pashyanti 3.0 Git Automation Utility
echo =========================================
echo.

:: Stage all changes (handles updates, deletions, and additions)
echo Staging changes...
git add .

:: Ask for a custom commit message
set /p commit_msg="Enter commit message (or press Enter for default 'Updated Pashyanti 3.0'): "

:: Use default message if input is blank
if "%commit_msg%"=="" set commit_msg=Updated Pashyanti 3.0

echo.
echo Committing changes...
git commit -m "%commit_msg%"

echo.
echo Pushing to GitHub (origin main)...
git push -u origin main

echo.
echo =========================================
echo   Push complete!
echo =========================================
pause