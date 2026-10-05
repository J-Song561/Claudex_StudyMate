from django.db import models
from django.db.models import Case, IntegerField, Value, When, F


class TaskQuerySet(models.QuerySet):
    def open(self):
        return self.filter(done=False)

    def by_priority(self):
        rank = Case(
            When(priority=Task.HIGH, then=Value(0)),
            When(priority=Task.MEDIUM, then=Value(1)),
            default=Value(2),
            output_field=IntegerField(),
        )
        return self.annotate(rank=rank).order_by(
            'rank', F('due_at').asc(nulls_last=True), 'created_at'
        )


class Task(models.Model):
    HIGH, MEDIUM, LOW = 'high', 'medium', 'low'
    PRIORITY_CHOICES = [(HIGH, 'Высокий'), (MEDIUM, 'Средний'), (LOW, 'Низкий')]

    title = models.CharField(max_length=255)
    note = models.TextField(blank=True)
    due_at = models.DateTimeField(null=True, blank=True)
    has_time = models.BooleanField(default=False)
    priority = models.CharField(max_length=6, choices=PRIORITY_CHOICES, default=MEDIUM)
    done = models.BooleanField(default=False, db_index=True)
    done_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = TaskQuerySet.as_manager()

    def __str__(self):
        return self.title


class ChatMessage(models.Model):
    USER, BOT = 'user', 'bot'

    role = models.CharField(max_length=4, choices=[(USER, 'Я'), (BOT, 'Планировщик')])
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at', 'id']
