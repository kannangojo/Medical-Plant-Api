from django.urls import path

from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('profile/', views.profile, name='profile'),
    path('plants/', views.plant_list, name='plant-list'),
    path('plants/<int:plant_id>/', views.plant_detail, name='plant-detail'),
    path('chatbot/', views.chatbot, name='chatbot'),
]
