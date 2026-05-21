@echo off
title Nyan Cat MP4 Loop Compiler
color 0a

echo =======================================================
echo     NYAN CAT MP4 LOOP COMPILER FOR PC CASE SCREENS
echo =======================================================
echo.
echo  This tool searches for downloaded WebM frames/videos
echo  and compiles them into high-compatibility H.264 MP4.
echo.

:: 1. Search for downloaded files
set "WEBM_FILE="
if exist "%USERPROFILE%\Downloads\nyan_cat_1920x462.webm" (
    set "WEBM_FILE=%USERPROFILE%\Downloads\nyan_cat_1920x462.webm"
) else if exist "nyan_cat_1920x462.webm" (
    set "WEBM_FILE=nyan_cat_1920x462.webm"
)

if "%WEBM_FILE%"=="" (
    echo [WARNING] Could not find 'nyan_cat_1920x462.webm' in your 
    echo           Downloads folder or current directory.
    echo.
    echo Please make sure you have:
    echo  1. Opened index.html in your browser.
    echo  2. Clicked "Record WebM Video" and let the download finish.
    echo  3. Placed the webm file in this directory or your Downloads folder.
    echo.
    pause
    exit /b
)

echo [FOUND] WebM Source: %WEBM_FILE%
echo.
echo [INFO] checking for FFmpeg installation...
where ffmpeg >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] FFmpeg is not installed or not in your Windows system PATH.
    echo.
    echo How to resolve:
    echo 1. Download FFmpeg build from https://ffmpeg.org
    echo 2. Extract it and add the 'bin' folder to your Windows System Path,
    echo    or place the 'ffmpeg.exe' directly in this project directory.
    echo.
    echo Fallback: You can also use the convert.py script if you have Python installed.
    echo.
    pause
    exit /b
)

echo [INFO] FFmpeg found! Compiling perfectly looped MP4...
echo.

:: 2. Compile WebM to MP4 with optimal bitrate and pixel format for hardware screens
ffmpeg -y -i "%WEBM_FILE%" -c:v libx264 -pix_fmt yuv420p -b:v 5M -r 24 "nyan_cat_1920x462_loop.mp4"

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to compile video. Check FFmpeg console output above.
    pause
    exit /b
)

echo.
echo =======================================================
echo [SUCCESS] Looping MP4 created successfully!
echo.
echo Output file: nyan_cat_1920x462_loop.mp4
echo.
echo You can now embed this MP4 directly into:
echo   - Wallpaper Engine (Widescreen Case BG)
echo   - Aida64 SensorPanel Backgrounds
echo   - Standard monitoring screen media players
echo =======================================================
echo.
pause
