@echo off
setlocal
cd /d "%~dp0"

echo Starting To-Do List local server...
echo.
echo   Root version:    http://localhost:8080
echo   My Tasks (basic): http://localhost:8080/basic/
echo.

start "To-Do List Server" /min cmd /c "python -m http.server 8080 || py -m http.server 8080"

timeout /t 2 /nobreak >nul

start "" "http://localhost:8080"
start "" "http://localhost:8080/basic/"

echo Server is running in a separate window titled "To-Do List Server".
echo Close that window (or press Ctrl+C in it) to stop the server.
echo This window can be closed now.
echo.
pause
