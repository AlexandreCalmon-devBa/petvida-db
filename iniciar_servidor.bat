@echo off
color 0A
title Servidor PetVida API

echo ========================================================
echo   Iniciando o Servidor PetVida (Node.js)
echo ========================================================
echo.
echo Se o MySQL estiver rodando, a API ficara disponivel na porta 3000.
echo Para desligar o servidor, feche esta janela.
echo.

npm run dev

pause
