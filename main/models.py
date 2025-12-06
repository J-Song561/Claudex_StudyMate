from django.db import models


class ChatDocument(models.Model):
    """Stores the original uploaded chat content"""

    STATUS_CHOICES = [
        ('uploaded', 'Uploaded'),
        ('parsing', 'Parsing'),
        ('labeling', 'Labeling'),
        ('completed', 'Completed'),
        ('error', 'Error'),
    ]

    title = models.CharField(max_length=255, blank=True)
    original_content = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='uploaded')
    error_message = models.TextField(blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return self.title or f"Chat {self.id}"

    @property
    def session_count(self):
        return self.sessions.count()

    @property
    def labeled_count(self):
        return self.sessions.exclude(label='').count()


class Session(models.Model):
    """A single Q&A pair extracted from a chat"""

    chat_document = models.ForeignKey(
        ChatDocument,
        on_delete=models.CASCADE,
        related_name='sessions'
    )
    order = models.PositiveIntegerField()
    question = models.TextField()
    answer = models.TextField()
    label = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ['order']
        unique_together = ['chat_document', 'order']

    def __str__(self):
        return f"{self.label or f'Session {self.order}'}"

    @property
    def question_preview(self):
        """First 100 chars of question for display"""
        return self.question[:100] + '...' if len(self.question) > 100 else self.question
