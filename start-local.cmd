@echo off
set "PROJECT_DIR=E:\简历\AI漫剧生成器"
set "NPM_CMD=C:\Program Files\nodejs\npm.cmd"

start "Manzao API" /D "%PROJECT_DIR%" "%ComSpec%" /k ""%NPM_CMD%" run api"
start "Manzao Frontend" /D "%PROJECT_DIR%" "%ComSpec%" /k ""%NPM_CMD%" run dev -- --host 127.0.0.1"

exit /b 0
