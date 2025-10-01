import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  // 👇 Función para determinar si el usuario tiene un rol específico
  const hasRole = (role) => {
    if (!user) return false;
    // Compatibilidad con role (viejo) y user_type (nuevo)
    return user.role === role || user.user_type === role;
  };

  // 👇 Función para obtener el tipo de usuario (prioriza user_type)
  const getUserType = () => {
    return user?.user_type || user?.role || 'unknown';
  };

  return (
    <nav style={{ 
      padding: "15px 20px", 
      backgroundColor: "#2c3e50", 
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <Link to="/" style={{ color: "white", textDecoration: "none", fontWeight: "bold" }}>
          🏠 Smart Condominium
        </Link>

        {/* Si hay usuario → mostrar enlaces según rol */}
        {user && (
          <div style={{ display: "flex", gap: "15px", alignItems: "center", flexWrap: "wrap" }}>
            {/* Enlaces para todos los usuarios autenticados */}
            <Link to="/dashboard" style={{ color: "white", textDecoration: "none" }}>
              Dashboard
            </Link>

            {/* Enlaces para Admin */}
            {hasRole("admin") && (
              <>
                <Link to="/admin-dashboard" style={{ color: "white", textDecoration: "none" }}>
                  Admin Panel
                </Link>
                <Link to="/manage-users" style={{ color: "white", textDecoration: "none" }}>
                  Gestionar Usuarios
                </Link>
                <Link to="/manage-units" style={{ color: "white", textDecoration: "none" }}>
                  Unidades
                </Link>
                <Link to="/view-reports" style={{ color: "white", textDecoration: "none" }}>
                  Reportes
                </Link>
              </>
            )}

            {/* Enlaces para Admin y Security */}
            {(hasRole("admin") || hasRole("security")) && (
              <>
                <Link to="/face-register" style={{ color: "white", textDecoration: "none" }}>
                  Registrar Rostros
                </Link>
                <Link to="/face-recognize" style={{ color: "white", textDecoration: "none" }}>
                  Reconocer Rostros
                </Link>
                <Link to="/security-events" style={{ color: "white", textDecoration: "none" }}>
                  Eventos Seguridad
                </Link>
                <Link to="/view-visitors" style={{ color: "white", textDecoration: "none" }}>
                  Visitantes
                </Link>
              </>
            )}

            {/* Enlaces para Residentes */}
            {hasRole("resident") && (
              <>
                <Link to="/reserve-area" style={{ color: "white", textDecoration: "none" }}>
                  Reservar Áreas
                </Link>
                <Link to="/view-bills" style={{ color: "white", textDecoration: "none" }}>
                  Mis Expensas
                </Link>
                <Link to="/request-maintenance" style={{ color: "white", textDecoration: "none" }}>
                  Mantenimiento
                </Link>
              </>
            )}
          </div>
        )}
      </div>

      {/* Información del usuario y logout */}
      {user && (
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <span style={{ fontSize: "14px", color: "#ecf0f1" }}>
            👤 {user.first_name || user.username} ({getUserType()})
          </span>
          <button
            onClick={logout}
            style={{ 
              padding: "8px 16px", 
              backgroundColor: "#e74c3c",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      )}

      {/* Si no hay usuario → mostrar Login/Registro */}
      {!user && (
        <div style={{ display: "flex", gap: "15px" }}>
          <Link to="/login" style={{ color: "white", textDecoration: "none" }}>
            Login
          </Link>
          <Link to="/register" style={{ color: "white", textDecoration: "none" }}>
            Registro
          </Link>
        </div>
      )}
    </nav>
  );
}