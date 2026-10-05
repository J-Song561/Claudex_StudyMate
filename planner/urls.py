from django.urls import path

from . import views

app_name = 'planner'

urlpatterns = [
    path('', views.index, name='index'),
    path('manifest.webmanifest', views.manifest, name='manifest'),
    path('sw.js', views.service_worker, name='sw'),
    path('api/state/', views.state, name='state'),
    path('api/top/', views.top, name='top'),
    path('api/chat/', views.send, name='chat'),
    path('api/tasks/<int:task_id>/', views.task_detail, name='task'),
]
