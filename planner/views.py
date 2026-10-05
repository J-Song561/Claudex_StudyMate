import json

from django.http import HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404, render
from django.templatetags.static import static
from django.urls import reverse
from django.utils import timezone
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_http_methods, require_POST

from . import chat
from .models import ChatMessage, Task
from .parser import format_due

TOP_SIZE = 3


def _task_json(task, now):
    return {
        'id': task.id,
        'title': task.title,
        'note': task.note,
        'priority': task.priority,
        'due': format_due(task, now),
        'due_at': task.due_at.isoformat() if task.due_at else None,
        'overdue': bool(task.due_at and task.due_at < now and not task.done),
        'done': task.done,
    }


def _message_json(message):
    return {'id': message.id, 'role': message.role, 'text': message.text}


def _tasks_payload(now):
    tasks = [_task_json(t, now) for t in Task.objects.open().by_priority()]
    return {'top': tasks[:TOP_SIZE], 'tasks': tasks, 'open_count': len(tasks)}


@ensure_csrf_cookie
def index(request):
    return render(request, 'planner/index.html')


@require_GET
def state(request):
    now = timezone.localtime()
    messages = ChatMessage.objects.order_by('-id')[:200]
    return JsonResponse({
        **_tasks_payload(now),
        'messages': [_message_json(m) for m in reversed(messages)],
    })


@require_GET
def top(request):
    now = timezone.localtime()
    payload = _tasks_payload(now)
    del payload['tasks']
    return JsonResponse(payload)


@require_POST
def send(request):
    try:
        text = str(json.loads(request.body).get('text', '')).strip()[:1000]
    except (ValueError, AttributeError):
        return JsonResponse({'error': 'bad request'}, status=400)
    if not text:
        return JsonResponse({'error': 'empty'}, status=400)

    user_msg = ChatMessage.objects.create(role=ChatMessage.USER, text=text)
    reply = chat.handle(text)
    if reply is None:
        return JsonResponse({'cleared': True, 'messages': [], **_tasks_payload(timezone.localtime())})

    bot_msg = ChatMessage.objects.create(role=ChatMessage.BOT, text=reply)
    return JsonResponse({
        'messages': [_message_json(user_msg), _message_json(bot_msg)],
        **_tasks_payload(timezone.localtime()),
    })


@require_http_methods(['PATCH', 'DELETE'])
def task_detail(request, task_id):
    task = get_object_or_404(Task, id=task_id)
    if request.method == 'DELETE':
        task.delete()
    else:
        try:
            data = json.loads(request.body)
        except ValueError:
            return JsonResponse({'error': 'bad request'}, status=400)
        if 'done' in data:
            task.done = bool(data['done'])
            task.done_at = timezone.now() if task.done else None
            task.save(update_fields=['done', 'done_at'])
    return JsonResponse(_tasks_payload(timezone.localtime()))


def manifest(request):
    icon = lambda size: {'src': static(f'planner/icon-{size}.png'), 'sizes': f'{size}x{size}', 'type': 'image/png'}
    data = {
        'name': 'Planner',
        'short_name': 'Planner',
        'start_url': reverse('planner:index'),
        'scope': reverse('planner:index'),
        'display': 'standalone',
        'background_color': '#1f2a26',
        'theme_color': '#1f2a26',
        'icons': [icon(192), icon(512), {**icon(512), 'purpose': 'maskable'}],
    }
    return JsonResponse(data, content_type='application/manifest+json')


def service_worker(request):
    response = render(request, 'planner/sw.js', content_type='application/javascript')
    response['Cache-Control'] = 'no-cache'
    return response
