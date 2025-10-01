import { useState } from "react";
import { register } from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    dni: "",
    phone_number: "",
    birth_date: "",
    user_type: "resident" // 👈 Campo obligatorio agregado
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
    setError(""); // Limpiar error al cambiar campos
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validación básica
    if (!formData.dni.trim()) {
      setError("El DNI es obligatorio");
      setLoading(false);
      return;
    }

    try {
      console.log("Enviando datos:", formData);
      await register(formData);
      navigate("/login");
    } catch (err) {
      console.error("Error completo:", err);
      
      // Manejo detallado de errores
      if (err.response?.data) {
        const errorData = err.response.data;
        
        if (typeof errorData === 'object') {
          // Unir todos los mensajes de error
          const errorMessages = Object.values(errorData).flat().join(', ');
          setError(`Errores: ${errorMessages}`);
        } else if (errorData.detail) {
          setError(errorData.detail);
        } else {
          setError("Error en el registro. Verifica los datos.");
        }
      } else if (err.message === "Network Error") {
        setError("Error de conexión. Verifica que el servidor esté ejecutándose.");
      } else {
        setError("Error al registrar usuario");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
          width: "100%",
          maxWidth: "500px",
          border: "1px solid #e9ecef",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h2 style={{ 
            color: "#2c3e50", 
            marginBottom: "8px",
            fontWeight: "600",
            fontSize: "28px"
          }}>
            Crear Cuenta
          </h2>
          <p style={{ 
            color: "#7f8c8d", 
            fontSize: "16px",
            margin: 0
          }}>
            Regístrate en Smart Condominium
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "#fee",
              color: "#c53030",
              padding: "12px 16px",
              borderRadius: "6px",
              marginBottom: "20px",
              border: "1px solid #fed7d7",
              fontSize: "14px",
              textAlign: "center"
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Usuario y Email */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", color: "#2c3e50", fontSize: "14px" }}>
                Usuario *
              </label>
              <input
                type="text"
                name="username"
                placeholder="Nombre de usuario"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={loading}
                style={inputStyle}
              />
            </div>
            
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", color: "#2c3e50", fontSize: "14px" }}>
                Email *
              </label>
              <input
                type="email"
                name="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Nombre y Apellido */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", color: "#2c3e50", fontSize: "14px" }}>
                Nombre
              </label>
              <input
                type="text"
                name="first_name"
                placeholder="Tu nombre"
                value={formData.first_name}
                onChange={handleChange}
                disabled={loading}
                style={inputStyle}
              />
            </div>
            
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", color: "#2c3e50", fontSize: "14px" }}>
                Apellido
              </label>
              <input
                type="text"
                name="last_name"
                placeholder="Tu apellido"
                value={formData.last_name}
                onChange={handleChange}
                disabled={loading}
                style={inputStyle}
              />
            </div>
          </div>

          {/* DNI y Teléfono */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", color: "#2c3e50", fontSize: "14px" }}>
                DNI *
              </label>
              <input
                type="text"
                name="dni"
                placeholder="Número de DNI"
                value={formData.dni}
                onChange={handleChange}
                required
                disabled={loading}
                style={inputStyle}
              />
            </div>
            
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", color: "#2c3e50", fontSize: "14px" }}>
                Teléfono
              </label>
              <input
                type="tel"
                name="phone_number"
                placeholder="+123456789"
                value={formData.phone_number}
                onChange={handleChange}
                disabled={loading}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Contraseña */}
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", color: "#2c3e50", fontSize: "14px" }}>
              Contraseña *
            </label>
            <input
              type="password"
              name="password"
              placeholder="Mínimo 8 caracteres"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="8"
              disabled={loading}
              style={inputStyle}
            />
          </div>

          {/* Tipo de Usuario y Fecha de Nacimiento */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", color: "#2c3e50", fontSize: "14px" }}>
                Tipo de Usuario *
              </label>
              <select
                name="user_type"
                value={formData.user_type}
                onChange={handleChange}
                disabled={loading}
                style={inputStyle}
              >
                <option value="resident">Residente</option>
                <option value="security">Seguridad</option>
                <option value="maintenance">Mantenimiento</option>
                {/* admin solo se puede asignar manualmente */}
              </select>
            </div>
            
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", color: "#2c3e50", fontSize: "14px" }}>
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleChange}
                disabled={loading}
                style={inputStyle}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: loading ? "#95a5a6" : "#2ecc71",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background-color 0.2s",
              marginBottom: "20px"
            }}
          >
            {loading ? "🔄 Registrando..." : "🚀 Crear Cuenta"}
          </button>
        </form>

        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#7f8c8d", fontSize: "14px", margin: 0 }}>
            ¿Ya tienes cuenta?{" "}
            <Link 
              to="/login" 
              style={{ 
                color: "#3498db", 
                textDecoration: "none",
                fontWeight: "500"
              }}
            >
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Estilos reutilizables
const inputStyle = {
  width: "100%",
  padding: "12px",
  border: "1px solid #ddd",
  borderRadius: "6px",
  fontSize: "16px",
  transition: "border-color 0.2s",
  backgroundColor: "white",
  boxSizing: "border-box"
};