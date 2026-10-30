@echo off
cd /d "%~dp0"
echo === Добавляю файлы ===
git add .
echo.
echo === Коммичу ===
git commit -m "auto sync %date% %time%"
echo.
echo === Подтягиваю с GitHub ===
git pull --rebase
echo.
echo === Отправляю на GitHub ===
git push
echo.
echo === Готово ===
pause