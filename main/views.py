import json
import time
from django.shortcuts import render, redirect, get_object_or_404
from django.http import StreamingHttpResponse, JsonResponse
from django.views.decorators.http import require_http_methods
from django.utils import timezone

from .models import ChatDocument, Session
from .forms import ChatUploadForm
from .services.parser import parse_chat, validate_parsed_sessions
from .services.labeler import generate_label


def home(request):
    """Home page with upload form and recent documents"""
    recent_documents = ChatDocument.objects.all()[:10]
    return render(request, 'main/home.html', {
        'recent_documents': recent_documents
    })


@require_http_methods(["POST"])
def upload(request):
    """Handle chat upload"""
    form = ChatUploadForm(request.POST)

    if form.is_valid():
        document = ChatDocument.objects.create(
            title=form.cleaned_data.get('title', ''),
            original_content=form.cleaned_data['content'],
            status='uploaded'
        )
        return redirect('document_detail', document_id=document.id)

    # If form is invalid, return to home with errors
    recent_documents = ChatDocument.objects.all()[:10]
    return render(request, 'main/home.html', {
        'form': form,
        'recent_documents': recent_documents
    })


def document_detail(request, document_id):
    """View a document with its parsed sessions"""
    document = get_object_or_404(ChatDocument, id=document_id)
    sessions = document.sessions.all()

    return render(request, 'main/document_detail.html', {
        'document': document,
        'sessions': sessions
    })


def generate_index(request, document_id):
    """
    Generate index for a document using Server-Sent Events.
    Parses the chat and labels each session, streaming progress.
    """
    document = get_object_or_404(ChatDocument, id=document_id)

    def event_stream():
        try:
            # Update status to parsing
            document.status = 'parsing'
            document.save()

            yield f"data: {json.dumps({'type': 'progress', 'message': 'Parsing chat...', 'current': 0, 'total': 1})}\n\n"

            # Parse the chat
            parsed_sessions = parse_chat(document.original_content)

            # Validate
            is_valid, error_msg = validate_parsed_sessions(parsed_sessions)
            if not is_valid:
                document.status = 'error'
                document.error_message = error_msg
                document.save()
                yield f"data: {json.dumps({'type': 'error', 'message': error_msg})}\n\n"
                return

            total_sessions = len(parsed_sessions)
            yield f"data: {json.dumps({'type': 'progress', 'message': f'Found {total_sessions} sessions. Creating...', 'current': 0, 'total': total_sessions})}\n\n"

            # Clear existing sessions
            document.sessions.all().delete()

            # Create session objects
            session_objects = []
            for parsed in parsed_sessions:
                session = Session.objects.create(
                    chat_document=document,
                    order=parsed.order,
                    question=parsed.question,
                    answer=parsed.answer,
                    label=''
                )
                session_objects.append(session)

            # Update status to labeling
            document.status = 'labeling'
            document.save()

            # Label each session
            for i, session in enumerate(session_objects, 1):
                yield f"data: {json.dumps({'type': 'progress', 'message': f'Labeling session {i}/{total_sessions}...', 'current': i, 'total': total_sessions})}\n\n"

                try:
                    label = generate_label(session.question, session.answer)
                    session.label = label
                    session.save()
                except Exception as e:
                    session.label = f"Session {session.order}"
                    session.save()

            # Mark as completed
            document.status = 'completed'
            document.completed_at = timezone.now()
            document.save()

            yield f"data: {json.dumps({'type': 'complete', 'message': 'Done!'})}\n\n"

        except Exception as e:
            document.status = 'error'
            document.error_message = str(e)
            document.save()
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    response = StreamingHttpResponse(
        event_stream(),
        content_type='text/event-stream'
    )
    response['Cache-Control'] = 'no-cache'
    response['X-Accel-Buffering'] = 'no'
    return response
