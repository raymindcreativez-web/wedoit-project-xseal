@echo off
setlocal EnableDelayedExpansion

echo =====================================
echo DOCX to Markdown Converter
echo =====================================
echo.

where pandoc >nul 2>&1
if errorlevel 1 (
    echo ERROR: Pandoc is not installed or not in PATH.
    pause
    exit /b
)

set /p CREATEFOLDER=Create markdown folder? (Y/N):

if /I "%CREATEFOLDER%"=="Y" (
    if not exist "markdown" mkdir "markdown"

    for %%F in (*.docx) do (
        echo Converting %%F...
        pandoc "%%F" -t gfm -o "markdown\%%~nF.md"
    )

    echo.
    echo Finished.
    echo Output: markdown\
) else (
    for %%F in (*.docx) do (
        echo Converting %%F...
        pandoc "%%F" -t gfm -o "%%~nF.md"
    )

    echo.
    echo Finished.
    echo Output: Current folder
)

pause