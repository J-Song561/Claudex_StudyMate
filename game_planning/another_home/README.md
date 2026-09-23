# Another Home — Team 7 (Intro to Game Planning 2026-2)

**Игра:** [Another Home by lane (emiwa)](https://emiwa.itch.io/home) — уютный изометрический «дизайнер комнат» в браузере на itch.io.
**Наш проект:** полноценный релиз в Steam (PC и Steam Deck) за $9.99. Браузерная версия остаётся бесплатной и работает как воронка.
**Бюджет:** $75 000 · **Жанр:** Simulation, sandbox

## Файлы → колонки таблицы курса

| Колонка в таблице курса | Файл | Кто отвечает |
|---|---|---|
| Link (Marketing Overview Document) | `AnotherHome_Marketing_Overview.docx` | Producer — Abdulazizov Abduazim |
| Link (Macro GDD/10 Pages GDD) | `AnotherHome_Macro_GDD.docx` (ровно 10 страниц) | Director — Alexey |
| PitchDeck Link | `AnotherHome_Pitchdeck.pptx` (15 слайдов) | вместе |
| Steam Page Design Link | `AnotherHome_Steam_Page_Design.png` / `.html` | вместе |
| (для слайдов Pitchdeck) | `AnotherHome_Financial_Model.xlsx` | вместе |

Как получить ссылку: загрузить файл в Google Drive → «Открыть в Google Документах / Презентациях» → Настройки доступа → «Все, у кого есть ссылка» → вставить ссылку в таблицу.

## Главные цифры (базовый сценарий)
- Разработка и запуск: $74 580 из $75 000 (72% команда, 19% инструменты и маркетинг, 9% резерв)
- 25 000 вишлистов → 15 000 копий в 1-й год, 27 000 за 3 года
- Валовая выручка: $113k в 1-й год, $207k за 3 года
- Окупаемость на 2-м году, ROI за 3 года +17%
- Пессимистичный сценарий не окупается, оптимистичный окупается в 1-й год

## Что проверить перед сдачей
1. Рейтинг и число оценок Another Home на itch.io. Сайт был недоступен из среды, где собирались файлы.
2. У автора уже есть Steam-версия **diorama** (95% из 83 отзывов положительные). В документах это подано как доказательство спроса. Обсудите с преподавателем, нормально ли это для проекта.
3. Приблизительные цифры рынка (MAU Steam, продажи Townscaper) — проверить и добавить источники.

## Как пересобрать
`python3 build_financial_model.py`, `node build_docs.js`, `node build_pitchdeck.js`, `node build_steam_page.js` (нужны npm-пакеты docx, pptxgenjs, sharp, playwright).
