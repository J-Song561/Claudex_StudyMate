from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('upload/', views.upload, name='upload'),
    path('document/<int:document_id>/', views.document_detail, name='document_detail'),
    path('document/<int:document_id>/generate/', views.generate_index, name='generate_index'),
]
