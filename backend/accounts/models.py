# accounts/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator
from django.utils import timezone

class User(AbstractUser):
    USER_TYPE_CHOICES = [
        ('admin', 'Administrador'),
        ('resident', 'Residente'),
        ('security', 'Seguridad'),
        ('maintenance', 'Mantenimiento'),
    ]
    dni = models.CharField(max_length=20, unique=True)
    phone_regex = RegexValidator(regex=r'^\+?1?\d{9,15}$', message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed.")
    phone_number = models.CharField(validators=[phone_regex], max_length=17, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='resident')

    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()})"


class Unit(models.Model):
    number = models.CharField(max_length=10, unique=True)
    floor = models.IntegerField()
    residents = models.ManyToManyField(User, related_name='units', blank=True)

    def __str__(self):
        return f"Unit {self.number}"


class CommonArea(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    available_from = models.TimeField()
    available_to = models.TimeField()
    capacity = models.IntegerField()

    def __str__(self):
        return self.name


class Reservation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    area = models.ForeignKey(CommonArea, on_delete=models.CASCADE)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.area.name} - {self.date}"


class Expense(models.Model):
    STATUS_CHOICES = [
        ('PENDIENTE', 'Pendiente'),
        ('PAGADA', 'Pagada'),
        ('VENCIDA', 'Vencida'),
    ]
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE)
    period = models.CharField(max_length=20)  # '2025-03', por ejemplo
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.CharField(max_length=200)
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDIENTE')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.unit.number} - {self.period}"


class Vehicle(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    plate_number = models.CharField(max_length=10, unique=True)
    brand = models.CharField(max_length=50)
    model = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.owner.username} - {self.plate_number}"


from django.db import models
from django.core.validators import RegexValidator
from django.utils import timezone  # 👈 Importamos timezone

class Visitor(models.Model):
    VISITOR_STATUS_CHOICES = [
        ('CREADA', 'Creada'),
        ('VALIDADA', 'Validada'),
        ('DENEGADA', 'Denegada'),
        ('CADUCADA', 'Caducada'),
    ]
    name = models.CharField(max_length=100)
    dni = models.CharField(max_length=20, unique=True)
    phone_regex = RegexValidator(regex=r'^\+?1?\d{9,15}$', message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed.")
    phone_number = models.CharField(validators=[phone_regex], max_length=17, blank=True)
    visited_unit = models.ForeignKey('Unit', on_delete=models.CASCADE)  # 👈 Asegúrate de usar el nombre correcto del modelo
    scheduled_at = models.DateTimeField(default=timezone.now)  # 👈 Cambiado a timezone.now
    entry_time = models.DateTimeField(null=True, blank=True)  # Fecha de entrada real
    exit_time = models.DateTimeField(null=True, blank=True)   # Fecha de salida real
    status = models.CharField(max_length=20, choices=VISITOR_STATUS_CHOICES, default='CREADA')
    qr_code = models.CharField(max_length=200, unique=True, null=True, blank=True)  # Código QR único
    purpose = models.CharField(max_length=200)

    def __str__(self):
        return f"{self.name} - {self.visited_unit.number}"

class FaceRecord(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    face_encoding = models.TextField()  # JSON string of face encoding
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Face of {self.user.username}"


class SecurityEvent(models.Model):
    EVENT_TYPES = [
        ('face_recognition', 'Face Recognition'),
        ('plate_recognition', 'Plate Recognition'),
        ('unauthorized_access', 'Unauthorized Access'),
        ('suspicious_activity', 'Suspicious Activity'),
    ]
    event_type = models.CharField(max_length=30, choices=EVENT_TYPES)
    description = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(upload_to='security_images/', null=True, blank=True)
    user = models.ForeignKey(  # 👈 NUEVO CAMPO AGREGADO
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='security_events'
    )

    def __str__(self):
        return f"{self.event_type} - {self.timestamp}"
    
    # ------------------------
# Notificaciones
# ------------------------

NOTIFICATION_TYPES = [
    ('AVISO', 'Aviso'),
    ('PAGO', 'Pago'),
    ('ALERTA', 'Alerta'),
    ('RESERVA', 'Reserva'),
    ('MANTENIMIENTO', 'Mantenimiento'),
]

STATUS_CHOICES = [
    ('PENDIENTE', 'Pendiente'),
    ('ENVIADA', 'Enviada'),
    ('LEÍDA', 'Leída'),
]

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    payload = models.JSONField()  # Datos extra, como ID de aviso, reserva, etc.
    sent_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDIENTE')

    def __str__(self):
        return f"{self.user.username} - {self.title}"
    

# ------------------------
class MaintenanceRequest(models.Model):
    MAINTENANCE_STATUS_CHOICES = [
        ('PENDIENTE', 'Pendiente'),
        ('EN PROCESO', 'En Proceso'),
        ('FINALIZADA', 'Finalizada'),
    ]
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=MAINTENANCE_STATUS_CHOICES, default='PENDIENTE')
    created_at = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(upload_to='maintenance_requests/', null=True, blank=True)

    def __str__(self):
        return f"{self.unit.number} - {self.description[:30]}..."
    
# Agregar ESTO al final de accounts/models.py

class VehiclePlate(models.Model):
    PLATE_STATUS_CHOICES = [
        ('AUTHORIZED', 'Autorizado'),
        ('PENDING', 'Pendiente'),
        ('REVOKED', 'Revocado'),
    ]
    
    plate_number = models.CharField(max_length=15, unique=True)
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='plates')
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    status = models.CharField(max_length=20, choices=PLATE_STATUS_CHOICES, default='AUTHORIZED')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.plate_number} - {self.owner.username}"

class VehicleAccessLog(models.Model):
    ACCESS_CHOICES = [
        ('GRANTED', 'Acceso Permitido'),
        ('DENIED', 'Acceso Denegado'),
        ('PENDING', 'Pendiente de Validación'),
    ]
    
    plate_number = models.CharField(max_length=15)
    vehicle_image = models.ImageField(upload_to='vehicle_access/')
    confidence_score = models.FloatField()
    is_authorized = models.BooleanField(default=False)
    access_granted = models.BooleanField(default=False)
    access_type = models.CharField(max_length=20, choices=ACCESS_CHOICES, default='PENDING')
    timestamp = models.DateTimeField(auto_now_add=True)
    camera_location = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.plate_number} - {self.access_type} - {self.timestamp}"
