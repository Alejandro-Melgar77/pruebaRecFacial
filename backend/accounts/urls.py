# accounts/urls.py

from django.urls import path
from . import views

urlpatterns = [
    # ------------------------
    # Autenticación
    # ------------------------
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.aCustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', views.TokenRefreshView.as_view(), name='token_refresh'),
    
    # ------------------------
    # Gestión de Usuarios
    # ------------------------
    path('users/', views.UserListView.as_view(), name='user-list'),
    path('users/<int:pk>/', views.UserDetailView.as_view(), name='user-detail'),
    path('users/<int:pk>/role/', views.UpdateUserRoleView.as_view(), name='update-user-role'),

    # ------------------------
    # Unidades y Áreas Comunes
    # ------------------------
    path('units/', views.UnitListView.as_view(), name='unit-list'),
    path('units/<int:pk>/', views.UnitDetailView.as_view(), name='unit-detail'),
    
    path('common-areas/', views.CommonAreaListView.as_view(), name='common-area-list'),
    path('common-areas/<int:pk>/', views.CommonAreaDetailView.as_view(), name='common-area-detail'),

    # ------------------------
    # Reservas
    # ------------------------
    path('reservations/', views.ReservationListView.as_view(), name='reservation-list'),
    path('reservations/<int:pk>/', views.ReservationDetailView.as_view(), name='reservation-detail'),

    # ------------------------
    # Finanzas
    # ------------------------
    path('expenses/', views.ExpenseListView.as_view(), name='expense-list'),
    path('expenses/<int:pk>/', views.ExpenseDetailView.as_view(), name='expense-detail'),
    path('reports/financial/', views.generate_financial_report, name='financial-report'),

    # ------------------------
    # Vehículos y Visitantes
    # ------------------------
    path('vehicles/', views.VehicleListView.as_view(), name='vehicle-list'),
    path('vehicles/<int:pk>/', views.VehicleDetailView.as_view(), name='vehicle-detail'),
    
    path('visitors/', views.VisitorListView.as_view(), name='visitor-list'),
    path('visitors/<int:pk>/', views.VisitorDetailView.as_view(), name='visitor-detail'),

    # ------------------------
    # 🔥 RECONOCIMIENTO FACIAL
    # ------------------------
    path('face/register/', views.register_face, name='register-face'),
    path('face/recognize/', views.recognize_face_view, name='recognize-face'),
    path('face-records/', views.FaceRecordListView.as_view(), name='face-record-list'),
    path('face-records/<int:pk>/', views.FaceRecordDetailView.as_view(), name='face-record-detail'),

    # ------------------------
    # Seguridad
    # ------------------------
    path('security/events/', views.SecurityEventListView.as_view(), name='security-event-list'),
    path('security/events/<int:pk>/', views.SecurityEventDetailView.as_view(), name='security-event-detail'),
    path('security/camera-event/', views.camera_security_event, name='camera-security-event'),

    # ------------------------
    # Notificaciones
    # ------------------------
    path('notifications/', views.NotificationListView.as_view(), name='notification-list'),
    path('notifications/<int:pk>/read/', views.MarkNotificationAsReadView.as_view(), name='notification-read'),

    # ------------------------
    # Mantenimiento
    # ------------------------
    path('maintenance/requests/', views.MaintenanceRequestListView.as_view(), name='maintenance-request-list'),
]