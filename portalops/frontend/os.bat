@echo off
setlocal

:: Lấy thư mục hiện hành nơi script được chạy
set "BASE_DIR=%~dp0"

echo.
echo =========================================
echo  Tạo cấu trúc dự án
echo =========================================
echo.
echo Thư mục gốc: %BASE_DIR%

:: Tạo các thư mục chính
echo Đang tạo thư mục: src\api
mkdir "%BASE_DIR%src\api" >nul 2>&1
echo Đang tạo thư mục: src\components\client
mkdir "%BASE_DIR%src\components\client" >nul 2>&1
echo Đang tạo thư mục: src\pages
mkdir "%BASE_DIR%src\pages" >nul 2>&1

echo.
echo Đang tạo các file placeholder...

:: api
echo  - src\api\axiosInstance.js
type nul > "%BASE_DIR%src\api\axiosInstance.js"

:: components/client
echo  - src\components\client\ActionButton.jsx
type nul > "%BASE_DIR%src\components\client\ActionButton.jsx"
echo  - src\components\client\InfoCard.jsx
type nul > "%BASE_DIR%src\components\client\InfoCard.jsx"
echo  - src\components\client\Navbar.jsx
type nul > "%BASE_DIR%src\components\client\Navbar.jsx"
echo  - src\components\client\Section.jsx
type nul > "%BASE_DIR%src\components\client\Section.jsx"
echo  - src\components\client\SnapshotModal.jsx
type nul > "%BASE_DIR%src\components\client\SnapshotModal.jsx"
echo  - src\components\client\UsageBar.jsx
type nul > "%BASE_DIR%src\components\client\UsageBar.jsx"
echo  - src\components\client\VPSDetailHeader.jsx
type nul > "%BASE_DIR%src\components\client\VPSDetailHeader.jsx"
echo  - src\components\client\VPSInfoSection.jsx
type nul > "%BASE_DIR%src\components\client\VPSInfoSection.jsx"
echo  - src\components\client\VPSMonitoringSection.jsx
type nul > "%BASE_DIR%src\components\client\VPSMonitoringSection.jsx"
echo  - src\components\client\VPSNetworkInfoSection.jsx
type nul > "%BASE_DIR%src\components\client\VPSNetworkInfoSection.jsx"
echo  - src\components\client\VPSSnapshotsSection.jsx
type nul > "%BASE_DIR%src\components\client\VPSSnapshotsSection.jsx"
echo  - src\components\client\VPSVolumesSection.jsx
type nul > "%BASE_DIR%src\components\client\VPSVolumesSection.jsx"
echo  - src\components\client\VolumeCard.jsx
type nul > "%BASE_DIR%src\components\client\VolumeCard.jsx"

:: pages
echo  - src\pages\VPSDetailPage.jsx
type nul > "%BASE_DIR%src\pages\VPSDetailPage.jsx"

echo.
echo =========================================
echo  Cấu trúc dự án đã được tạo thành công!
echo =========================================
echo.
pause