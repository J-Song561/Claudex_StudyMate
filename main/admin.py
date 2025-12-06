from django.contrib import admin
from .models import ChatDocument, Session


@admin.register(ChatDocument)
class ChatDocumentAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'status', 'session_count', 'uploaded_at']
    list_filter = ['status', 'uploaded_at']
    search_fields = ['title']
    readonly_fields = ['uploaded_at', 'completed_at']


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ['id', 'chat_document', 'order', 'label']
    list_filter = ['chat_document']
    search_fields = ['label', 'question']
