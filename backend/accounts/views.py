# accounts/views.py

from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenRefreshView
from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
import base64
import io
from PIL import Image
from django.core.exceptions import ValidationError

from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from io import BytesIO
from django.http import HttpResponse

import cv2
import numpy as np
import pytesseract

from .models import (
    User,
    Unit,
    CommonArea,
    Reservation,
    Expense,
    Vehicle,
    Visitor,
    FaceRecord,
    SecurityEvent,
    Notification,  # 👈 Importamos el nuevo modelo
    MaintenanceRequest,  # 👈 Importamos el nuevo modelo
)
from .serializers import (
    UserSerializer,
    UnitSerializer,
    CommonAreaSerializer,
    ReservationSerializer,
    ExpenseSerializer,
    VehicleSerializer,
    VisitorSerializer,
    FaceRecordSerializer,
    SecurityEventSerializer,
    NotificationSerializer,  # 👈 Importamos el nuevo serializador
    MaintenanceRequestSerializer,  # 👈 Importamos el nuevo serializador
    RegisterSerializer,
)

User = get_user_model()

# ------------------------
# Registro de usuario
# ------------------------
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        headers = self.get_success_headers(serializer.data)

        # Devolvemos los datos del usuario recién creado
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED, headers=headers)

# ------------------------
# Listar usuarios (solo admin)
# ------------------------
class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

# ------------------------
# Actualizar rol de usuario (solo admin)
# ------------------------
class UpdateUserRoleView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

# ------------------------
# Login con tokens + datos de usuario
# ------------------------
class aCustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        # Agregamos la info del usuario logueado
        data['user'] = UserSerializer(self.user).data
        print("Datos del usuario en el serializer:", data['user'])
        return data

class aCustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = aCustomTokenObtainPairSerializer

# ------------------------
# CRUD para modelos
# ------------------------

# CRUD User
class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

# CRUD Unit
class UnitListView(generics.ListCreateAPIView):
    queryset = Unit.objects.all()
    serializer_class = UnitSerializer
    permission_classes = [IsAuthenticated]

class UnitDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Unit.objects.all()
    serializer_class = UnitSerializer
    permission_classes = [IsAuthenticated]

# CRUD CommonArea
class CommonAreaListView(generics.ListCreateAPIView):
    queryset = CommonArea.objects.all()
    serializer_class = CommonAreaSerializer
    permission_classes = [IsAuthenticated]

class CommonAreaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CommonArea.objects.all()
    serializer_class = CommonAreaSerializer
    permission_classes = [IsAuthenticated]

# CRUD Reservation
class ReservationListView(generics.ListCreateAPIView):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]

class ReservationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]

# CRUD Expense
class ExpenseListView(generics.ListAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Filtrar expensas de las unidades donde el usuario es residente
        units = Unit.objects.filter(residents=user)
        return Expense.objects.filter(unit__in=units)

class ExpenseDetailView(generics.RetrieveAPIView):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

# CRUD Vehicle
class VehicleListView(generics.ListCreateAPIView):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    permission_classes = [IsAuthenticated]

class VehicleDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    permission_classes = [IsAuthenticated]

# CRUD Visitor
class VisitorListView(generics.ListAPIView):
    serializer_class = VisitorSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Visitor.objects.all().order_by('-scheduled_at')

        # Filtros opcionales
        unit_id = self.request.query_params.get('unit_id', None)
        status = self.request.query_params.get('status', None)
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)

        if unit_id:
            queryset = queryset.filter(visited_unit_id=unit_id)
        if status:
            queryset = queryset.filter(status=status)
        if start_date:
            queryset = queryset.filter(scheduled_at__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(scheduled_at__date__lte=end_date)

        return queryset

class VisitorDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Visitor.objects.all()
    serializer_class = VisitorSerializer
    permission_classes = [IsAuthenticated]

# CRUD FaceRecord
class FaceRecordListView(generics.ListCreateAPIView):
    queryset = FaceRecord.objects.all()
    serializer_class = FaceRecordSerializer
    permission_classes = [IsAuthenticated]

class FaceRecordDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = FaceRecord.objects.all()
    serializer_class = FaceRecordSerializer
    permission_classes = [IsAuthenticated]

# CRUD SecurityEvent
class SecurityEventListView(generics.ListCreateAPIView):
    queryset = SecurityEvent.objects.all()
    serializer_class = SecurityEventSerializer
    permission_classes = [IsAuthenticated]

class SecurityEventDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = SecurityEvent.objects.all()
    serializer_class = SecurityEventSerializer
    permission_classes = [IsAuthenticated]

# CRUD Notification
class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Notification.objects.filter(user=user).order_by('-sent_at')

class MarkNotificationAsReadView(generics.UpdateAPIView):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.status = 'LEÍDA'
        instance.save()
        return Response(self.get_serializer(instance).data)

# CRUD MaintenanceRequest
class MaintenanceRequestListView(generics.ListAPIView):
    serializer_class = MaintenanceRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        units = Unit.objects.filter(residents=user)
        return MaintenanceRequest.objects.filter(unit__in=units).order_by('-created_at')

# ------------------------
# Reportes
# ------------------------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generate_financial_report(request):
    """
    Genera un reporte financiero en PDF
    """
    # Filtrar por rango de fechas si se envían parámetros
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')

    # Aquí puedes filtrar datos de pagos, expensas, etc.
    # Por ahora, datos de ejemplo
    data = [
        ["Fecha", "Unidad", "Monto", "Concepto"],
        ["2025-03-01", "101", "$1000", "Expensa Marzo"],
        ["2025-03-05", "102", "$1200", "Expensa Marzo"],
        ["2025-03-10", "103", "$800", "Multa"],
    ]

    # Crear PDF
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    elements = []

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        spaceAfter=30,
        alignment=1,  # Center
    )

    elements.append(Paragraph("Reporte Financiero", title_style))
    elements.append(Spacer(1, 12))

    # Tabla
    table = Table(data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))

    elements.append(table)
    doc.build(elements)

    buffer.seek(0)
    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="reporte_financiero.pdf"'
    return response

# ------------------------
# Reconocimiento facial
# ------------------------

from .face_recognition_utils import save_face_encoding, recognize_face


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_face(request):
    """
    Vista para registrar el rostro de un usuario.
    Espera recibir una imagen en base64.
    """
    user = request.user
    image_data = request.data.get('image')  # Imagen en base64

    if not image_data:
        return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)

    # Decodificar imagen base64
    try:
        img_binary = base64.b64decode(image_data)
        img = Image.open(io.BytesIO(img_binary))
        img_path = f'/tmp/{user.id}_face.jpg'  # temporal
        img.save(img_path)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    success = save_face_encoding(user, img_path)
    if success:
        return Response({'message': 'Face registered successfully'}, status=status.HTTP_201_CREATED)
    else:
        return Response({'error': 'No face detected in image'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def recognize_face_view(request):
    """
    Vista para reconocer un rostro enviado desde la cámara.
    """
    image_data = request.data.get('image')  # Imagen en base64

    if not image_data:
        return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)

    # Decodificar imagen base64
    try:
        img_binary = base64.b64decode(image_data)
        img = Image.open(io.BytesIO(img_binary))
        img_path = f'/tmp/unknown_face.jpg'  # temporal
        img.save(img_path)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    user = recognize_face(img_path)
    if user:
        return Response({'user': UserSerializer(user).data}, status=status.HTTP_200_OK)
    else:
        return Response({'message': 'Unknown face'}, status=status.HTTP_404_NOT_FOUND)

# ------------------------
# Seguridad - IA
# ------------------------

def recognize_face_from_image(image_path):
    """
    Recibe una imagen y devuelve el usuario si reconoce su rostro.
    """
    # Aquí puedes usar face_recognition o dlib
    # Por ahora, simulamos
    return None  # o un usuario si lo encuentra

def recognize_plate_from_image(image_path):
    """
    Recibe una imagen y devuelve el número de placa detectado.
    """
    image = cv2.imread(image_path)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    # Aquí puedes usar un modelo de detección de placas
    # Por ahora, usamos OCR simple
    text = pytesseract.image_to_string(gray)
    # Filtrar texto que parezca una placa
    import re
    plate = re.findall(r'[A-Z0-9]{3}-[A-Z0-9]{3}', text)  # Patrón simple
    return plate[0] if plate else None

@api_view(['POST'])
def camera_security_event(request):
    """
    Vista para recibir imágenes de cámaras y procesarlas con IA.
    """
    image_data = request.data.get('image')  # Imagen en base64
    camera_id = request.data.get('camera_id', 'unknown')

    if not image_data:
        return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)

    # Decodificar imagen base64
    try:
        img_binary = base64.b64decode(image_data)
        img = Image.open(io.BytesIO(img_binary))
        img_path = f'/tmp/camera_{camera_id}.jpg'  # temporal
        img.save(img_path)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    # Procesar imagen con IA
    recognized_user = recognize_face_from_image(img_path)
    recognized_plate = recognize_plate_from_image(img_path)

    event_type = 'suspicious_activity'
    description = 'Actividad sospechosa detectada.'

    if recognized_user:
        event_type = 'face_recognition'
        description = f'Rostro reconocido: {recognized_user.username}'
    elif recognized_plate:
        event_type = 'plate_recognition'
        description = f'Placa detectada: {recognized_plate}'
    else:
        # Aquí puedes usar un modelo de detección de objetos para "sospechoso"
        # Por ahora, asumimos que si no se reconoce, es sospechoso
        pass

    # Guardar evento
    event = SecurityEvent.objects.create(
        event_type=event_type,
        description=description,
        image=img_path.replace('/tmp/', 'security_images/'),  # Ajusta según tu sistema de archivos
        user=recognized_user,
    )

    return Response(SecurityEventSerializer(event).data, status=status.HTTP_201_CREATED)