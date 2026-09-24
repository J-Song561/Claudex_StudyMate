# CLAUDE.md

## Общение

- Отвечай пользователю **на русском**.
- Код, комментарии в коде, docstrings, commit messages и имена переменных — **на английском**.
- Это учебный проект: после изменений кратко объясняй, *что* сделано и *почему* (2–5 предложений), без длинных лекций.

## О проекте

**Claudex StudyMate** — Django-приложение, превращающее экспорт AI-чата (Claude / ChatGPT / Gemini) в оглавление учебных тем.

Поток данных:
1. Пользователь запускает scraper в консоли браузера на странице чата → получает JSON (или вставляет обычный текст).
2. `upload` сохраняет `ChatDocument` со статусом `uploaded`.
3. `generate_index` (Server-Sent Events) парсит чат в пары вопрос–ответ (`Session`), затем для каждой генерирует label через Gemini, стримя прогресс в браузер.
4. Статусы документа: `uploaded → parsing → labeling → completed` (или `error`).

## Стек

- Python 3.11+, Django 5.1, SQLite (`db.sqlite3`, в .gitignore)
- `google-generativeai` (Gemini API), `python-dotenv`
- Фронтенд: Django templates + vanilla JS/CSS, без сборщика

## Структура

```
Claudex/            # Django project: settings.py, urls.py
main/               # единственное приложение
  models.py         # ChatDocument, Session
  views.py          # home, upload, document_detail, generate_index (SSE)
  forms.py          # ChatUploadForm
  services/
    parser.py       # JSON (scraper) → Gemini AI → heuristic fallback
    labeler.py      # generate_label() через Gemini
  tests.py          # пока пусто
templates/main/     # home.html, document_detail.html, scraper_script.html
static/js/scraper.js  # читаемый исходник scraper'а
static/css/style.css
```

## Команды

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
python manage.py test main          # тесты
python manage.py makemigrations main
python manage.py check
```

## Переменные окружения

Загружаются из `env/gemini_api_key.env` (папка `env/` в .gitignore):

- `GOOGLE_API_KEY` — ключ Gemini (без него labeling падает, парсер переходит на fallback)
- `DJANGO_SECRET_KEY`, `DEBUG` (по умолчанию `True`), `ALLOWED_HOSTS`

## Правила работы

- **Секреты**: никогда не коммить `env/`, `.env`, `db.sqlite3` и API-ключи; не выводи значения ключей в чат и логи.
- **Модели**: после изменения `main/models.py` запускай `makemigrations` и коммить миграцию вместе с моделью. Не редактируй уже применённые миграции.
- **Тесты**: для новой/изменённой логики в `parser.py`, `views.py`, `forms.py` добавляй тесты в `main/tests.py`. Вызовы Gemini в тестах мокай (`unittest.mock.patch`) — тесты не должны ходить в сеть и требовать ключ.
- Перед коммитом: `python manage.py check` и `python manage.py test main`.
- Бизнес-логику держи в `main/services/`, views — тонкими.
- Внешние вызовы (Gemini) должны деградировать мягко: fallback вместо падения всего запроса.
- Не добавляй новые зависимости без необходимости; если добавил — обнови `requirements.txt` с точной версией.

## Подводные камни

- **Scraper существует в двух копиях**: `static/js/scraper.js` (читаемый) и `templates/main/scraper_script.html` (минифицированный, именно он вставляется на страницу через `{% include %}`). Меняя логику scraper'а, обновляй обе.
- **Разные модели Gemini**: `parser.py` использует `gemini-1.5-flash`, `labeler.py` — `gemini-2.5-flash-lite`. Учитывай это при изменениях.
- `.env` грузится и в `settings.py`, и повторно в `labeler.get_client()`.
- `generate_index` — генератор SSE: исключения внутри него не превращаются в HTTP-ошибку, их нужно ловить и отправлять событием `{"type": "error"}`.
- Повторный `generate_index` удаляет все существующие `Session` документа перед созданием новых.
