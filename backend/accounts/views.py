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
    Notification,
    MaintenanceRequest,
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
    NotificationSerializer,
    MaintenanceRequestSerializer,
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
# Reconocimiento facial CORREGIDO
# ------------------------

from .face_recognition_utils import save_face_encoding, recognize_face, get_face_encoding_from_base64, compare_faces

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

    try:
        # Procesar imagen directamente en memoria
        encoding = get_face_encoding_from_base64(image_data)
        
        if encoding is not None:
            # Convertir encoding numpy array a string
            encoding_str = ','.join(map(str, encoding))
            
            # Crear o actualizar registro facial
            face_record, created = FaceRecord.objects.get_or_create(user=user)
            face_record.face_encoding = encoding_str
            face_record.save()
            
            return Response({
                'message': 'Face registered successfully',
                'face_record_id': face_record.id
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'error': 'No face detected in image'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        print(f"Error in register_face: {str(e)}")
        return Response({
            'error': f'Error processing image: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def recognize_face_view(request):
    """
    Vista para reconocer un rostro enviado desde la cámara.
    """
    image_data = request.data.get('image')

    if not image_data:
        return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Procesar imagen en memoria
        unknown_encoding = get_face_encoding_from_base64(image_data)
        
        if unknown_encoding is None:
            return Response({
                'message': 'No face detected in image'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Comparar con todos los rostros registrados
        face_records = FaceRecord.objects.select_related('user').all()
        
        recognized_user = None
        confidence = 0

        for record in face_records:
            try:
                known_encoding = np.array(list(map(float, record.face_encoding.split(','))))
                result, distance = compare_faces(known_encoding, unknown_encoding)
                
                if result and distance < 0.6:  # Tolerancia ajustable
                    recognized_user = record.user
                    confidence = float(1 - distance)
                    break
                    
            except (ValueError, IndexError) as e:
                print(f"Error processing face record for user {record.user.id}: {e}")
                continue

        if recognized_user:
            # Registrar evento de seguridad CON usuario
            SecurityEvent.objects.create(
                event_type='face_recognition',
                description=f'Rostro reconocido: {recognized_user.username}',
                user=recognized_user  # 👈 Usuario reconocido
            )
            
            return Response({
                'user': UserSerializer(recognized_user).data,
                'confidence': confidence,
                'message': 'Face recognized successfully'
            }, status=status.HTTP_200_OK)
        else:
            # Registrar evento de seguridad SIN usuario (acceso no autorizado)
            SecurityEvent.objects.create(
                event_type='unauthorized_access',
                description='Intento de acceso con rostro no reconocido'
                # 👈 No pasamos 'user' aquí porque es acceso no autorizado
            )
            
            return Response({
                'message': 'Unknown face'
            }, status=status.HTTP_404_NOT_FOUND)

    except Exception as e:
        print(f"Error in recognize_face_view: {str(e)}")
        return Response({
            'error': f'Error processing image: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ------------------------
# Seguridad - IA
# ------------------------

def recognize_face_from_image(image_path):
    """
    Recibe una imagen y devuelve el usuario si reconoce su rostro.
    """
    try:
        unknown_encoding = get_face_encoding(image_path)
        if unknown_encoding is None:
            return None

        face_records = FaceRecord.objects.select_related('user').all()
        
        for record in face_records:
            try:
                known_encoding = np.array(list(map(float, record.face_encoding.split(','))))
                result, distance = compare_faces(known_encoding, unknown_encoding)
                
                if result and distance < 0.6:
                    return record.user
                    
            except (ValueError, IndexError) as e:
                print(f"Error processing face record for user {record.user.id}: {e}")
                continue

        return None
    except Exception as e:
        print(f"Error in recognize_face_from_image: {str(e)}")
        return None

def recognize_plate_from_image(image_path):
    """
    Recibe una imagen y devuelve el número de placa detectado.
    """
    try:
        image = cv2.imread(image_path)
        if image is None:
            return None
            
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        # Aquí puedes usar un modelo de detección de placas
        # Por ahora, usamos OCR simple
        text = pytesseract.image_to_string(gray)
        # Filtrar texto que parezca una placa
        import re
        plate = re.findall(r'[A-Z0-9]{3}-[A-Z0-9]{3}', text)  # Patrón simple
        return plate[0] if plate else None
    except Exception as e:
        print(f"Error in recognize_plate_from_image: {str(e)}")
        return None

@api_view(['POST'])
@permission_classes([IsAuthenticated])
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
        # Procesar imagen en memoria sin guardar archivo temporal
        encoding = get_face_encoding_from_base64(image_data)
        recognized_user = None
        
        if encoding is not None:
            # Buscar usuario reconocido
            face_records = FaceRecord.objects.select_related('user').all()
            for record in face_records:
                try:
                    known_encoding = np.array(list(map(float, record.face_encoding.split(','))))
                    result, distance = compare_faces(known_encoding, encoding)
                    if result and distance < 0.6:
                        recognized_user = record.user
                        break
                except (ValueError, IndexError) as e:
                    continue

        # Procesar placa (simulado)
        recognized_plate = None  # recognize_plate_from_image no funciona sin archivo temporal

        event_type = 'suspicious_activity'
        description = 'Actividad sospechosa detectada.'

        if recognized_user:
            event_type = 'face_recognition'
            description = f'Rostro reconocido: {recognized_user.username}'
        elif recognized_plate:
            event_type = 'plate_recognition'
            description = f'Placa detectada: {recognized_plate}'

        # Guardar evento
        event = SecurityEvent.objects.create(
            event_type=event_type,
            description=description,
            user=recognized_user,  # 👈 Puede ser None
        )

        return Response(SecurityEventSerializer(event).data, status=status.HTTP_201_CREATED)

    except Exception as e:
        print(f"Error in camera_security_event: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# ------------------------
# Vista para crear MaintenanceRequest
# ------------------------

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_maintenance_request(request):
    """
    Vista para crear una solicitud de mantenimiento
    """
    try:
        serializer = MaintenanceRequestSerializer(data=request.data)
        if serializer.is_valid():
            # Asignar el usuario autenticado
            maintenance_request = serializer.save()
            return Response(MaintenanceRequestSerializer(maintenance_request).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(f"Error in create_maintenance_request: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ------------------------
# Vista para crear Reservation
# ------------------------

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_reservation(request):
    """
    Vista para crear una reserva
    """
    try:
        serializer = ReservationSerializer(data=request.data)
        if serializer.is_valid():
            # Asignar el usuario autenticado
            reservation = serializer.save(user=request.user)
            return Response(ReservationSerializer(reservation).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(f"Error in create_reservation: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)