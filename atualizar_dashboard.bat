@echo off
echo ===================================================
echo   ATUALIZANDO DASHBOARD DE FATURAMENTO DO COPILOT
echo ===================================================
echo.

:: Navega para o diretorio onde o arquivo .bat esta localizado
cd /d "%~dp0"

echo [1/3] Rodando o scraper do Playwright...
call npm start

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERRO] Ocorreu um erro ao rodar o scraper do Playwright.
    echo Verifique sua conexao ou suas credenciais no arquivo .env.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] Dashboard atualizado com sucesso localmente!
echo.

echo [3/3] Enviando atualizacao para o GitHub...
git add index.html
git commit -m "Auto-update dashboard [%DATE% %TIME%]"
git push

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [AVISO] Nao foi possivel fazer o push para o GitHub. 
    echo Verifique se voce tem conexao, ou se o repositorio remoto esta acessivel.
) else (
    echo.
    echo [SUCESSO] Dashboard enviado para o GitHub com sucesso!
)

echo.
echo ===================================================
echo   PROCESSO CONCLUIDO!
echo ===================================================
timeout /t 5
