@echo off
set PROCESSNAME=EthDcrMiner64.exe

::First save current pids with the wanted process name
setlocal EnableExtensions EnableDelayedExpansion
set "RETPIDS="
set "OLDPIDS=p"


::Check and find processes missing in the old pid list
for /f "TOKENS=1" %%a in ('wmic PROCESS where "Name='%PROCESSNAME%'" get ProcessID ^| findstr [0-9]') do (
if "!OLDPIDS:p%%ap=zz!"=="%OLDPIDS%" (set "RETPIDS=/PID %%a !RETPIDS!")
)

::Kill the new threads (but no other)
taskkill %RETPIDS% /T > NUL 2>&1
endlocal