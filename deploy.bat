@echo off
echo ============================================
echo   Deploying WiFi Pay ke Firebase Hosting...
echo ============================================
firebase deploy --only hosting --project [PROJECT_ID_WIFIPAY]
echo.
echo ============================================
echo   Deploy selesai!
echo ============================================
pause
