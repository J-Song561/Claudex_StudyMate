import re
from dataclasses import dataclass
from datetime import datetime, time, timedelta

from .models import Task

MONTHS = {
    'январ': 1, 'феврал': 2, 'март': 3, 'апрел': 4, 'ма': 5, 'июн': 6,
    'июл': 7, 'август': 8, 'сентябр': 9, 'октябр': 10, 'ноябр': 11, 'декабр': 12,
}
MONTHS_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля',
              'августа', 'сентября', 'октября', 'ноября', 'декабря']
WEEKDAYS = [
    (r'понедельник|пн', 0), (r'вторник|вт', 1), (r'сред[ау]|ср', 2), (r'четверг|чт', 3),
    (r'пятниц[ау]|пт', 4), (r'суббот[ау]|сб', 5), (r'воскресенье|вс', 6),
]
WEEKDAY_NAMES = ['понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота', 'воскресенье']

W = r'(?<![\w])'
E = r'(?![\w])'


@dataclass
class ParsedTask:
    title: str
    note: str = ''
    due_at: datetime | None = None
    has_time: bool = False
    priority: str = Task.MEDIUM


def _cut(text, match):
    return (text[:match.start()] + ' ' + text[match.end():]).strip()


def _extract_priority(text):
    priority = Task.MEDIUM
    m = re.search(r'(?:^|\s)!{1,3}(?=\s|$)|(?<=\w)!{1,3}(?=\s|$)', text)
    if m:
        return Task.HIGH, _cut(text, m)
    m = re.search(W + r'(срочно|важно)' + E, text, re.I)
    if m:
        return Task.HIGH, _cut(text, m)
    m = re.search(r'(?:^|\s)~(?=\s|$)', text)
    if m:
        return Task.LOW, _cut(text, m)
    return priority, text


def _extract_date(text, now):
    today = now.date()

    m = re.search(W + r'(послезавтра|завтра|сегодня)' + E, text, re.I)
    if m:
        shift = {'сегодня': 0, 'завтра': 1, 'послезавтра': 2}[m.group(1).lower()]
        return today + timedelta(days=shift), None, _cut(text, m)

    m = re.search(W + r'через\s+(\d+\s+)?(минут[уы]?|час(?:а|ов)?|д(?:ень|ня|ней)|недел[юиь])' + E, text, re.I)
    if m:
        n = int(m.group(1)) if m.group(1) else 1
        unit = m.group(2).lower()
        if unit.startswith('мин'):
            dt = now + timedelta(minutes=n)
            return dt.date(), dt.time().replace(second=0, microsecond=0), _cut(text, m)
        if unit.startswith('час'):
            dt = now + timedelta(hours=n)
            return dt.date(), dt.time().replace(second=0, microsecond=0), _cut(text, m)
        days = n * 7 if unit.startswith('недел') else n
        return today + timedelta(days=days), None, _cut(text, m)

    for pattern, weekday in WEEKDAYS:
        m = re.search(W + r'(?:во?\s+)?(?:' + pattern + r')' + E, text, re.I)
        if m:
            ahead = (weekday - today.weekday()) % 7 or 7
            return today + timedelta(days=ahead), None, _cut(text, m)

    m = re.search(W + r'(\d{1,2})\.(\d{1,2})(?:\.(\d{2,4}))?' + E, text)
    if m:
        day, month = int(m.group(1)), int(m.group(2))
        year = int(m.group(3)) if m.group(3) else today.year
        if year < 100:
            year += 2000
        date = _safe_date(year, month, day)
        if date:
            if not m.group(3) and date < today:
                date = _safe_date(year + 1, month, day) or date
            return date, None, _cut(text, m)

    m = re.search(W + r'(\d{1,2})\s+([а-яё]+)' + E, text, re.I)
    if m:
        word = m.group(2).lower()
        month = next((num for stem, num in MONTHS.items()
                      if word.startswith(stem) and (stem != 'ма' or word in ('мая', 'май'))), None)
        if month:
            date = _safe_date(today.year, month, int(m.group(1)))
            if date:
                if date < today:
                    date = _safe_date(today.year + 1, month, date.day) or date
                return date, None, _cut(text, m)

    return None, None, text


def _safe_date(year, month, day):
    try:
        return datetime(year, month, day).date()
    except ValueError:
        return None


def _extract_time(text):
    m = re.search(W + r'(?:в\s+)?(\d{1,2}):(\d{2})' + E, text, re.I)
    if m:
        h, mi = int(m.group(1)), int(m.group(2))
        if h < 24 and mi < 60:
            return time(h, mi), _cut(text, m)

    m = re.search(W + r'в\s+(\d{1,2})(?:\s*ч(?:ас(?:а|ов)?)?)?(?:\s+(утра|дня|вечера|ночи))?' + E, text, re.I)
    if m:
        h = int(m.group(1))
        part = (m.group(2) or '').lower()
        if part in ('дня', 'вечера') and h < 12:
            h += 12
        elif part == 'ночи' and h == 12:
            h = 0
        if h < 24:
            return time(h, 0), _cut(text, m)

    return None, text


def parse_task(text, now):
    """`now` must be an aware datetime in the user's local timezone."""
    note = ''
    if '//' in text:
        text, note = (part.strip() for part in text.split('//', 1))

    priority, text = _extract_priority(text)
    date, rel_time, text = _extract_date(text, now)
    clock, text = _extract_time(text)
    clock = clock or rel_time

    due_at = None
    if clock and not date:
        date = now.date()
        if datetime.combine(date, clock, now.tzinfo) <= now:
            date += timedelta(days=1)
    if date:
        # Date-only tasks sit at noon so a different device timezone doesn't shift the day.
        due_at = datetime.combine(date, clock or time(12, 0), now.tzinfo)

    title = re.sub(r'\s+', ' ', text).strip(' ,.;:-—')
    if title:
        title = title[0].upper() + title[1:]
    return ParsedTask(title=title, note=note, due_at=due_at, has_time=clock is not None, priority=priority)


def format_due(task, now):
    if not task.due_at:
        return ''
    local = task.due_at.astimezone(now.tzinfo)
    delta = (local.date() - now.date()).days
    if delta == 0:
        day = 'сегодня'
    elif delta == 1:
        day = 'завтра'
    elif delta == -1:
        day = 'вчера'
    elif 1 < delta < 7:
        day = WEEKDAY_NAMES[local.weekday()]
    else:
        day = f'{local.day} {MONTHS_GEN[local.month - 1]}'
        if local.year != now.year:
            day += f' {local.year}'
    return f'{day}, {local:%H:%M}' if task.has_time else day
