from django import forms
from .models import ChatDocument


class ChatUploadForm(forms.Form):
    """Form for uploading chat content"""

    title = forms.CharField(
        max_length=255,
        required=False,
        widget=forms.TextInput(attrs={
            'placeholder': 'e.g., Machine Learning Study Session',
            'class': 'form-control'
        })
    )

    content = forms.CharField(
        widget=forms.Textarea(attrs={
            'placeholder': 'Paste your Claude chat here (Ctrl+A, Ctrl+C from your chat)...',
            'rows': 15,
            'class': 'form-control'
        })
    )

    def clean_content(self):
        content = self.cleaned_data.get('content', '')
        if len(content.strip()) < 10:
            raise forms.ValidationError("Chat content is too short. Please paste your full chat.")
        return content
