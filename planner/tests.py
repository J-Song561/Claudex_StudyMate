import json
import zoneinfo
from datetime import datetime

from django.test import TestCase

from .chat import handle
from .models import Task
from .parser import parse_task

TZ = zoneinfo.ZoneInfo('Europe/Moscow')
NOW = datetime(2026, 10, 5, 12, 0, tzinfo=TZ)  # Monday


class ParserTests(TestCase):
    def parse(self, text):
        return parse_task(text, NOW)

    def test_tomorrow_with_time_and_priority(self):
        p = self.parse('завтра в 15:00 созвон с куратором !')
        self.assertEqual(p.title, 'Созвон с куратором')
        self.assertEqual(p.due_at, datetime(2026, 10, 6, 15, 0, tzinfo=TZ))
        self.assertTrue(p.has_time)
        self.assertEqual(p.priority, Task.HIGH)

    def test_weekday_and_note(self):
        p = self.parse('в пятницу сдать курсовую // глава 2')
        self.assertEqual(p.title, 'Сдать курсовую')
        self.assertEqual(p.note, 'глава 2')
        self.assertEqual(p.due_at.date(), datetime(2026, 10, 9).date())
        self.assertFalse(p.has_time)

    def test_same_weekday_means_next_week(self):
        self.assertEqual(self.parse('в понедельник отчёт').due_at.date(), datetime(2026, 10, 12).date())

    def test_relative_hours_and_low_priority(self):
        p = self.parse('через 2 часа позвонить маме ~')
        self.assertEqual(p.due_at, datetime(2026, 10, 5, 14, 0, tzinfo=TZ))
        self.assertEqual(p.priority, Task.LOW)

    def test_past_time_today_rolls_to_tomorrow(self):
        self.assertEqual(self.parse('в 9 утра пробежка').due_at, datetime(2026, 10, 6, 9, 0, tzinfo=TZ))

    def test_evening_hour(self):
        self.assertEqual(self.parse('в 7 вечера спортзал').due_at, datetime(2026, 10, 5, 19, 0, tzinfo=TZ))

    def test_dotted_date_in_past_goes_to_next_year(self):
        self.assertEqual(self.parse('12.03 виза').due_at.date(), datetime(2027, 3, 12).date())

    def test_month_name(self):
        p = self.parse('20 октября экзамен по матану')
        self.assertEqual(p.title, 'Экзамен по матану')
        self.assertEqual(p.due_at.date(), datetime(2026, 10, 20).date())
        self.assertEqual(self.parse('3 мая отпуск').due_at.date(), datetime(2027, 5, 3).date())

    def test_plain_text_has_no_date(self):
        p = self.parse('купить молоко')
        self.assertIsNone(p.due_at)
        self.assertEqual(p.priority, Task.MEDIUM)

    def test_numbers_in_title_are_kept(self):
        self.assertEqual(self.parse('прочитать 5 глав').title, 'Прочитать 5 глав')


class ChatAndApiTests(TestCase):
    def test_top_three_ordered_by_priority_then_due(self):
        handle('купить молоко ~', NOW)
        handle('завтра отчёт', NOW)
        handle('сегодня отчёт', NOW)
        handle('эссе !', NOW)
        top = self.client.get('/planner/api/top/').json()
        self.assertEqual([t['title'] for t in top['top']], ['Эссе', 'Отчёт', 'Отчёт'])
        self.assertLess(top['top'][1]['due_at'], top['top'][2]['due_at'])
        self.assertEqual(top['open_count'], 4)

    def test_done_and_delete_commands(self):
        handle('эссе', NOW)
        task = Task.objects.get()
        self.assertIn('Готово', handle(f'готово {task.id}', NOW))
        self.assertTrue(Task.objects.get().done)
        handle(f'удали {task.id}', NOW)
        self.assertFalse(Task.objects.exists())

    def test_chat_endpoint_creates_task_and_messages(self):
        res = self.client.post('/planner/api/chat/', json.dumps({'text': 'завтра эссе'}), content_type='application/json')
        data = res.json()
        self.assertEqual([m['role'] for m in data['messages']], ['user', 'bot'])
        self.assertEqual(data['top'][0]['title'], 'Эссе')

    def test_patch_marks_done(self):
        task = Task.objects.create(title='x')
        res = self.client.patch(f'/planner/api/tasks/{task.id}/', json.dumps({'done': True}), content_type='application/json')
        self.assertEqual(res.json()['open_count'], 0)

    def test_index_and_manifest(self):
        self.assertContains(self.client.get('/planner/'), 'В фокусе')
        self.assertEqual(self.client.get('/planner/manifest.webmanifest').json()['display'], 'standalone')
        self.assertEqual(self.client.get('/planner/sw.js').status_code, 200)
