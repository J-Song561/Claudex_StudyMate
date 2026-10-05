from django.contrib import admin

from .models import ChatMessage, Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'priority', 'due_at', 'done')
    list_filter = ('done', 'priority')


admin.site.register(ChatMessage)
