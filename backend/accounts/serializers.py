# accounts/serializers.py

from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Expense, User, Unit, CommonArea, Reservation, Vehicle, Visitor, FaceRecord, SecurityEvent, Notification
from rest_framework_simplejwt.tokens import RefreshToken
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
    MaintenanceRequest
)

User = get_user_model()

# ------------------------
# Serializers para modelos
# ------------------------

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'dni',
            'phone_number',
            'birth_date',
            'user_type',
            'is_active',
        ]
        read_only_fields = ['id', 'is_active']


class UnitSerializer(serializers.ModelSerializer):
    residents = UserSerializer(many=True, read_only=True)

    class Meta:
        model = Unit
        fields = ['id', 'number', 'floor', 'residents']


class CommonAreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommonArea
        fields = ['id', 'name', 'description', 'available_from', 'available_to', 'capacity']


class ReservationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    area = CommonAreaSerializer(read_only=True)

    class Meta:
        model = Reservation
        fields = ['id', 'user', 'area', 'date', 'start_time', 'end_time', 'created_at']


class ExpenseSerializer(serializers.ModelSerializer):
    unit = UnitSerializer(read_only=True)

    class Meta:
        model = Expense
        fields = ['id', 'unit', 'period', 'amount', 'description', 'due_date', 'status', 'created_at']


class VehicleSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)

    class Meta:
        model = Vehicle
        fields = ['id', 'owner', 'plate_number', 'brand', 'model']


class VisitorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Visitor
        fields = [
            'id',
            'name',
            'dni',
            'phone_number',
            'visited_unit',
            'scheduled_at',
            'entry_time',
            'exit_time',
            'status',
            'qr_code',
            'purpose',
        ]


class FaceRecordSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = FaceRecord
        fields = ['id', 'user', 'face_encoding', 'created_at']


class SecurityEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = SecurityEvent
        fields = ['id', 'event_type', 'description', 'timestamp', 'image']

# ------------------------
# Serializer para Registro
# ------------------------

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    token = serializers.SerializerMethodField()  # 👈 añadimos campo token

    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'password',
            'first_name',
            'last_name',
            'dni',
            'phone_number',
            'birth_date',
            'user_type',
            'token'
        ]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            dni=validated_data.get('dni', ''),
            phone_number=validated_data.get('phone_number', ''),
            birth_date=validated_data.get('birth_date', None),
            user_type=validated_data.get('user_type', 'resident'),
        )
        return user

    def get_token(self, user):
        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'notification_type', 'title', 'message', 'payload', 'sent_at', 'status']

# ------------------------
class MaintenanceRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaintenanceRequest
        fields = ['id', 'unit', 'description', 'status', 'created_at', 'image']