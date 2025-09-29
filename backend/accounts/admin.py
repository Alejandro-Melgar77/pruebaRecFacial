# accounts/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

# Usamos la clase base UserAdmin pero sobre tu modelo
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    # Campos que se mostrarán en la lista
    list_display = (
        'username',
        
        'email',
        'first_name',
        'last_name',
        'user_type',  # 👈 Cambiado de 'role' a 'user_type'
        'is_staff',
        'is_superuser'
    )
    
    # Campos que se pueden usar para buscar
    search_fields = ('username', 'email', 'first_name', 'last_name')
    
    # Campos agrupados por secciones en el formulario de edición
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('dni', 'phone_number', 'birth_date', 'user_type')}),  # 👈 Cambiado 'role' por 'user_type'
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Additional Info', {'fields': ('dni', 'phone_number', 'birth_date', 'user_type')}),  # 👈 Cambiado 'role' por 'user_type'
    )