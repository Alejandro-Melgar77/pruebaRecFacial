# Smart Condominium - Agentes del Sistema

Este documento describe los **agentes del sistema** que interactúan con la aplicación **Smart Condominium**, sus roles, y las funcionalidades del sistema a las que tienen acceso.

---

## 🧍 Actores del Sistema

### 1. **Administrador** (`admin`)

- **Rol**: `user_type = 'admin'`
- **Acceso**: Total al sistema.
- **Funcionalidades disponibles**:
  - Gestionar usuarios y roles.
  - Gestionar unidades habitacionales.
  - Emitir expensas.
  - Publicar avisos.
  - Configurar áreas comunes.
  - Gestionar solicitudes de mantenimiento.
  - Registrar eventos de seguridad.
  - Clasificar eventos con IA.
  - Emitir reportes financieros y de uso de amenidades.
  - Generar y validar QR de visitantes.
  - Asignar órdenes de trabajo.
  - Registrar costos y proveedores.
  - Consultar estado de mantenimiento.
  - Reconocer vehículo por OCR.
  - Reconocer rostro autorizado.
  - Emitir estadísticas de morosidad.
  - Registrar bitácora del sistema.
  - Acceder a clasificados y encuestas.
  - **Reconocimiento facial** (registro y detección).
  - **Google Vision API** (detección de eventos de seguridad desde cámaras).

---

### 2. **Residente** (`resident`)

- **Rol**: `user_type = 'resident'`
- **Acceso**: Parcial al sistema.
- **Funcionalidades disponibles**:
  - Consultar y pagar expensas.
  - Recibir notificaciones push.
  - Leer avisos.
  - Registrar lectura de avisos.
  - Reservar áreas comunes.
  - Cancelar reservas.
  - Consultar historial de pagos.
  - Registrar visitantes.
  - Solicitar mantenimiento.
  - Consultar estado de mantenimiento.
  - Acceder a clasificados y encuestas.
  - **Reconocimiento facial** (registro y detección).

---

### 3. **Guardia** (`security`)

- **Rol**: `user_type = 'security'`
- **Acceso**: Parcial al sistema.
- **Funcionalidades disponibles**:
  - Supervisar accesos.
  - Validar visitantes.
  - Registrar eventos de seguridad.
  - Clasificar eventos con IA.
  - Reconocer vehículo por OCR.
  - Reconocer rostro autorizado.
  - **Reconocimiento facial** (registro y detección).
  - **Google Vision API** (detección de eventos de seguridad desde cámaras).

---

### 4. **Mantenimiento** (`maintenance`)

- **Rol**: `user_type = 'maintenance'`
- **Acceso**: Parcial al sistema.
- **Funcionalidades disponibles**:
  - Atender solicitudes de reparación y mantenimiento.
  - Recibir tareas asignadas.
  - Actualizar el estado de trabajos realizados.
  - Generar reportes de cumplimiento.

---

## 🧠 Inteligencia Artificial (IA)

### 1. **Reconocimiento Facial**

- **Registro de rostros**.
- **Detección de rostros autorizados**.
- **Integración con Google Vision API**.

### 2. **Google Vision API**

- **Detección de eventos de seguridad desde cámaras**.
- **Clasificación de eventos con IA**.

---

## 📱 Aplicación Móvil y Web

- **Aplicación Web**: Para administradores y guardias.
- **Aplicación Móvil**: Para residentes y guardias.

---

## 🗄️ Base de Datos

- **PostgreSQL**: Base de datos relacional.

---

## 🧩 Módulos del Sistema

- **Gestión de usuarios y roles**.
- **Gestión de unidades habitacionales**.
- **Módulo financiero**.
- **Avisos y comunicados**.
- **Notificaciones push**.
- **Reservas de áreas comunes**.
- **Seguridad con IA**.
- **Mantenimiento**.

---

## 🛠️ Tecnologías Utilizadas

- **Backend**: Django, DRF, JWT, PostgreSQL.
- **Frontend**: React, React Router, Axios.
- **IA**: Google Vision API, Reconocimiento Facial.
- **Bases de Datos**: PostgreSQL.
