import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f5f7fa",
        minHeight: "100vh",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      {/* Barra superior */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "15px 20px",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          marginBottom: "20px",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "24px",
            fontWeight: "600",
            color: "#2c3e50",
          }}
        >
          Panel de Administración
        </h1>
        <div>
          <span
            style={{
              marginRight: "15px",
              color: "#7f8c8d",
              fontSize: "14px",
            }}
          >
            Bienvenido, <strong>{user?.username}</strong>
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 16px",
              backgroundColor: "#e74c3c",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main>
        <p
          style={{
            textAlign: "center",
            fontSize: "16px",
            color: "#7f8c8d",
            marginBottom: "30px",
          }}
        >
          Selecciona una funcionalidad del sistema:
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
          }}
        >
          <Link
            to="/manage-users"
            style={cardStyle}
            className="dashboard-card"
          >
            <div style={iconStyle}>👤</div>
            <h3>Gestionar Usuarios</h3>
            <p>Administrar roles, permisos y perfiles.</p>
          </Link>

          <Link
            to="/manage-units"
            style={cardStyle}
            className="dashboard-card"
          >
            <div style={iconStyle}>🏢</div>
            <h3>Gestionar Unidades</h3>
            <p>Asignar residentes, torres, y más.</p>
          </Link>

          <Link
            to="/manage-areas"
            style={cardStyle}
            className="dashboard-card"
          >
            <div style={iconStyle}>🏊</div>
            <h3>Áreas Comunes</h3>
            <p>Configurar y gestionar reservas.</p>
          </Link>

          <Link
            to="/manage-payments"
            style={cardStyle}
            className="dashboard-card"
          >
            <div style={iconStyle}>💳</div>
            <h3>Gestionar Pagos</h3>
            <p>Expensas, multas, estados de cuenta.</p>
          </Link>

          <Link
            to="/security-events"
            style={cardStyle}
            className="dashboard-card"
          >
            <div style={iconStyle}>🚨</div>
            <h3>Eventos de Seguridad</h3>
            <p>Reconocimiento facial, placas, incidentes.</p>
          </Link>

          <Link
            to="/face-register"
            style={cardStyle}
            className="dashboard-card"
          >
            <div style={iconStyle}>📸</div>
            <h3>Registrar Rostros</h3>
            <p>Agregar rostros autorizados.</p>
          </Link>

          <Link
            to="/manage-maintenance"
            style={cardStyle}
            className="dashboard-card"
          >
            <div style={iconStyle}>🔧</div>
            <h3>Mantenimiento</h3>
            <p>Solicitudes, órdenes de trabajo, proveedores.</p>
          </Link>

          <Link
            to="/manage-avisos"
            style={cardStyle}
            className="dashboard-card"
          >
            <div style={iconStyle}>📢</div>
            <h3>Comunicados</h3>
            <p>Publicar avisos y notificaciones.</p>
          </Link>

          <Link
            to="/reports"
            style={cardStyle}
            className="dashboard-card"
          >
            <div style={iconStyle}>📊</div>
            <h3>Reportes</h3>
            <p>Finanzas, seguridad, uso de áreas.</p>
          </Link>
        </div>
      </main>
    </div>
  );
}

// Estilos para las tarjetas
const cardStyle = {
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
  textAlign: "center",
  textDecoration: "none",
  color: "inherit",
  transition: "transform 0.2s, box-shadow 0.2s",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const iconStyle = {
  fontSize: "40px",
  marginBottom: "15px",
};