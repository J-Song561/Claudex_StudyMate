import re

from django.utils import timezone

from .models import ChatMessage, Task
from .parser import format_due, parse_task

PRIORITY_LABEL = {Task.HIGH: 'высокий', Task.MEDIUM: 'средний', Task.LOW: 'низкий'}

HELP = (
    'Просто напиши задачу:\n'
    '  завтра в 15:00 созвон с куратором !\n'
    '  в пятницу сдать курсовую // глава 2 и список литературы\n'
    '  через 2 часа позвонить маме ~\n'
    '\n'
    '! — высокий приоритет, ~ — низкий, // — заметка.\n'
    'Даты: сегодня, завтра, в пятницу, 12.10, 12 октября, через 3 дня.\n'
    '\n'
    'Команды:\n'
    '  задачи — все открытые задачи\n'
    '  готово 4 — отметить задачу #4\n'
    '  удали 4 — удалить задачу #4\n'
    '  очисти чат — стереть переписку'
)


def describe(task, now):
    priority = '' if task.priority == Task.MEDIUM else f'{PRIORITY_LABEL[task.priority]} приоритет'
    details = ' · '.join(p for p in (format_due(task, now), priority) if p)
    return f'{task.title}  #{task.id}' + (f'\n{details}' if details else '')


def _list(now):
    tasks = list(Task.objects.open().by_priority())
    if not tasks:
        return 'Открытых задач нет.'
    lines = []
    for t in tasks:
        due = format_due(t, now)
        marker = {Task.HIGH: '●', Task.MEDIUM: '◐', Task.LOW: '○'}[t.priority]
        lines.append(f'{marker} #{t.id} {t.title}' + (f' — {due}' if due else ''))
    return '\n'.join(lines)


def _find(task_id):
    return Task.objects.filter(id=int(task_id)).first()


def handle(text, now=None):
    now = now or timezone.localtime()
    text = text.strip()
    low = text.lower()

    if low in ('помощь', 'help', '?', '/help', '/start'):
        return HELP

    if low in ('задачи', 'список', 'все', 'все задачи', 'покажи задачи', '/list'):
        return _list(now)

    if low in ('очисти чат', 'очистить чат', '/clear'):
        ChatMessage.objects.all().delete()
        return None

    m = re.fullmatch(r'(готово|сделано|выполнено|done)\s+#?(\d+)', low)
    if m:
        task = _find(m.group(2))
        if not task:
            return f'Задачи #{m.group(2)} нет.'
        task.done, task.done_at = True, now
        task.save(update_fields=['done', 'done_at'])
        return f'Готово: {task.title}'

    m = re.fullmatch(r'(удали|удалить|delete)\s+#?(\d+)', low)
    if m:
        task = _find(m.group(2))
        if not task:
            return f'Задачи #{m.group(2)} нет.'
        task.delete()
        return f'Удалил: {task.title}'

    parsed = parse_task(text, now)
    if not parsed.title:
        return 'Не понял, что за задача. Напиши «помощь», чтобы увидеть примеры.'
    task = Task.objects.create(
        title=parsed.title, note=parsed.note, due_at=parsed.due_at,
        has_time=parsed.has_time, priority=parsed.priority,
    )
    reply = 'Добавил: ' + describe(task, now)
    if task.note:
        reply += f'\n— {task.note}'
    return reply
