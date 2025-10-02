import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

// Interceptor para agregar token automáticamente
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers["Content-Type"] = "application/json";
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Endpoints de autenticación
export const register = (data) => API.post("/auth/register/", data);
export const login = (data) => API.post("/auth/login/", data);

// Endpoints de reconocimiento facial
export const registerFace = (imageData) => API.post("/face/register/", { image: imageData });
export const recognizeFace = (imageData) => API.post("/face/recognize/", { image: imageData });

// Endpoints de usuarios
export const getUsers = () => API.get("/users/");
export const updateUserRole = (userId, role) => API.patch(`/users/${userId}/role/`, { user_type: role });

// Endpoints de unidades
export const getUnits = () => API.get("/units/");
export const createUnit = (data) => API.post("/units/", data);
export const updateUnit = (id, data) => API.put(`/units/${id}/`, data);
export const deleteUnit = (id) => API.delete(`/units/${id}/`);

// Endpoints de áreas comunes
export const getCommonAreas = () => API.get("/common-areas/");
export const createReservation = (data) => API.post("/reservations/", data);
export const getReservations = () => API.get("/reservations/");

// Endpoints de expensas
export const getExpenses = () => API.get("/expenses/");

// Endpoints de visitantes
export const getVisitors = () => API.get("/visitors/");
export const createVisitor = (data) => API.post("/visitors/", data);

// Endpoints de seguridad
export const getSecurityEvents = () => API.get("/security/events/");
export const createSecurityEvent = (data) => API.post("/security/events/", data);

// Endpoints de mantenimiento
export const getMaintenanceRequests = () => API.get("/maintenance/requests/");
export const createMaintenanceRequest = (data) => API.post("/maintenance/requests/", data);

// Endpoints de notificaciones
export const getNotifications = () => API.get("/notifications/");
export const markNotificationAsRead = (id) => API.patch("/notifications/${id}/read/");

// ------------------------
// 🔥 OCR - ENDPOINTS DE PLACAS VEHICULARES
// ------------------------

export const vehicleAPI = {
  // Gestión de placas
  getPlates: () => API.get("/vehicle-plates/"),
  createPlate: (data) => API.post("/vehicle-plates/", data),
  updatePlate: (id, data) => API.put(`/vehicle-plates/${id}/`, data),
  deletePlate: (id) => API.delete(`/vehicle-plates/${id}/`),
  
  // Reconocimiento OCR
  recognizePlate: (imageData, cameraId = '') => 
    API.post("/ocr/recognize-plate/", { 
      image: imageData, 
      camera_id: cameraId 
    }),
  
  // Logs de acceso
  getAccessLogs: (params = {}) => API.get("/vehicle-access-logs/", { params }),
};

// Export individual para compatibilidad
export const recognizePlate = (imageData) => vehicleAPI.recognizePlate(imageData);
export const getVehiclePlates = () => vehicleAPI.getPlates();
export const createVehiclePlate = (data) => vehicleAPI.createPlate(data);
export const getVehicleAccessLogs = (params) => vehicleAPI.getAccessLogs(params);