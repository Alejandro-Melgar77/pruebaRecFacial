import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginApi } from "../api";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const { login: loginContext } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Limpiar error cuando el usuario empiece a escribir
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.username.trim() || !formData.password.trim()) {
      setError("Por favor completa todos los campos");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await loginApi(formData);
      console.log("✅ Login exitoso:", response.data);

      // 👇 Asegurar que los datos del usuario estén normalizados
      const userData = response.data.user || response.data;
      
      loginContext({
        access: response.data.access,
        refresh: response.data.refresh,
        user: userData
      });

      // 👇 Redirigir según el tipo de usuario (usar user_type)
      const userType = userData.user_type || userData.role;
      
      switch (userType) {
        case "admin":
          navigate("/admin-dashboard");
          break;
        case "security":
          navigate("/security-events");
          break;
        case "maintenance":
          navigate("/dashboard");
          break;
        case "resident":
          navigate("/dashboard");
          break;
        default:
          navigate("/dashboard");
      }

    } catch (err) {
      console.error("❌ Error en login:", err);
      
      if (err.response?.status === 401) {
        setError("Usuario o contraseña incorrectos");
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.message === "Network Error") {
        setError("Error de conexión. Verifica que el servidor esté ejecutándose.");
      } else {
        setError("Error al iniciar sesión. Intenta nuevamente.");
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
          maxWidth: "420px",
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
            Bienvenido
          </h2>
          <p style={{ 
            color: "#7f8c8d", 
            fontSize: "16px",
            margin: 0
          }}>
            Inicia sesión en tu cuenta
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
          <div style={{ marginBottom: "20px" }}>
            <label style={{ 
              display: "block", 
              marginBottom: "6px", 
              fontWeight: "500",
              color: "#2c3e50",
              fontSize: "14px"
            }}>
              Usuario
            </label>
            <input
              type="text"
              name="username"
              placeholder="Ingresa tu usuario"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "16px",
                transition: "border-color 0.2s",
                backgroundColor: loading ? "#f8f9fa" : "white"
              }}
              onFocus={(e) => e.target.style.borderColor = "#3498db"}
              onBlur={(e) => e.target.style.borderColor = "#ddd"}
            />
          </div>

          <div style={{ marginBottom: "25px" }}>
            <label style={{ 
              display: "block", 
              marginBottom: "6px", 
              fontWeight: "500",
              color: "#2c3e50",
              fontSize: "14px"
            }}>
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              placeholder="Ingresa tu contraseña"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "16px",
                transition: "border-color 0.2s",
                backgroundColor: loading ? "#f8f9fa" : "white"
              }}
              onFocus={(e) => e.target.style.borderColor = "#3498db"}
              onBlur={(e) => e.target.style.borderColor = "#ddd"}
            />
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
            {loading ? "🔄 Iniciando sesión..." : "🚀 Iniciar Sesión"}
          </button>
        </form>

        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#7f8c8d", fontSize: "14px", margin: 0 }}>
            ¿No tienes cuenta?{" "}
            <a 
              href="/register" 
              style={{ 
                color: "#3498db", 
                textDecoration: "none",
                fontWeight: "500"
              }}
            >
              Regístrate aquí
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}