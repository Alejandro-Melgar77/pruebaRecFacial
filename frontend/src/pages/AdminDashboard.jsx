import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react"; // 👈 Agregados
import { AuthContext } from "../context/AuthContext";
import { getUsers, getUnits, getSecurityEvents } from "../api"; // 👈 Importaciones nuevas

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [stats, setStats] = useState({ // 👈 Estado para estadísticas
    users: 0,
    units: 0,
    securityEvents: 0
  });
  const [loading, setLoading] = useState(true);

  // 👇 Cargar estadísticas
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, unitsRes, eventsRes] = await Promise.all([
          getUsers(),
          getUnits(),
          getSecurityEvents()
        ]);
        
        setStats({
          users: usersRes.data.length,
          units: unitsRes.data.length,
          securityEvents: eventsRes.data.length
        });
      } catch (error) {
        console.error("Error cargando estadísticas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // 👇 Obtener el tipo de usuario de manera compatible
  const getUserType = () => {
    return user?.user_type || user?.role || 'Usuario';
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
          🛠️ Panel de Administración
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <span
            style={{
              color: "#7f8c8d",
              fontSize: "14px",
            }}
          >
            👤 {user?.first_name || user?.username} ({getUserType()})
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
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          {/* Gestión de Usuarios */}
          <Link to="/manage-users" style={cardStyle}>
            <div style={iconStyle}>👥</div>
            <h3>Gestionar Usuarios</h3>
            <p>Administrar roles, permisos y perfiles de usuarios</p>
          </Link>

          {/* Gestión de Unidades */}
          <Link to="/manage-units" style={cardStyle}>
            <div style={iconStyle}>🏢</div>
            <h3>Gestionar Unidades</h3>
            <p>Administrar unidades y asignar residentes</p>
          </Link>

          {/* Áreas Comunes */}
          <Link to="/manage-areas" style={cardStyle}>
            <div style={iconStyle}>🏊</div>
            <h3>Áreas Comunes</h3>
            <p>Configurar y gestionar áreas comunes</p>
          </Link>

          {/* Reconocimiento Facial */}
          <Link to="/face-register" style={cardStyle}>
            <div style={iconStyle}>📸</div>
            <h3>Registrar Rostros</h3>
            <p>Gestionar registros faciales de usuarios</p>
          </Link>

          {/* Reconocimiento Facial - Live */}
          <Link to="/face-recognize" style={cardStyle}>
            <div style={iconStyle}>👁️</div>
            <h3>Reconocer Rostros</h3>
            <p>Sistema de reconocimiento facial en vivo</p>
          </Link>

          {/* Seguridad */}
          <Link to="/security-events" style={cardStyle}>
            <div style={iconStyle}>🚨</div>
            <h3>Eventos de Seguridad</h3>
            <p>Monitorear eventos y accesos del sistema</p>
          </Link>

          {/* Visitantes */}
          <Link to="/view-visitors" style={cardStyle}>
            <div style={iconStyle}>👋</div>
            <h3>Gestión de Visitantes</h3>
            <p>Administrar visitas y accesos temporales</p>
          </Link>

          {/* Reportes */}
          <Link to="/view-reports" style={cardStyle}>
            <div style={iconStyle}>📊</div>
            <h3>Reportes y Estadísticas</h3>
            <p>Generar reportes financieros y de seguridad</p>
          </Link>

          {/* Expensas */}
          <Link to="/view-bills" style={cardStyle}>
            <div style={iconStyle}>💰</div>
            <h3>Gestión de Expensas</h3>
            <p>Administrar expensas y estados de cuenta</p>
          </Link>
        </div>

        {/* Estadísticas rápidas */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "15px",
            marginTop: "30px",
          }}
        >
          <div style={statCardStyle}>
            <h4 style={{ margin: "0 0 10px 0", color: "#2c3e50" }}>Usuarios Totales</h4>
            <p style={{ margin: 0, fontSize: "24px", fontWeight: "bold", color: "#3498db" }}>
              {loading ? "..." : stats.users}
            </p>
          </div>
          
          <div style={statCardStyle}>
            <h4 style={{ margin: "0 0 10px 0", color: "#2c3e50" }}>Unidades</h4>
            <p style={{ margin: 0, fontSize: "24px", fontWeight: "bold", color: "#2ecc71" }}>
              {loading ? "..." : stats.units}
            </p>
          </div>
          
          <div style={statCardStyle}>
            <h4 style={{ margin: "0 0 10px 0", color: "#2c3e50" }}>Eventos Hoy</h4>
            <p style={{ margin: 0, fontSize: "24px", fontWeight: "bold", color: "#e74c3c" }}>
              {loading ? "..." : stats.securityEvents}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

// Estilos para las tarjetas
const cardStyle = {
  backgroundColor: "white",
  padding: "25px 20px",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
  textAlign: "center",
  textDecoration: "none",
  color: "inherit",
  transition: "transform 0.2s, box-shadow 0.2s",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  border: "1px solid #e9ecef",
};

const iconStyle = {
  fontSize: "48px",
  marginBottom: "15px",
};

const statCardStyle = {
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
  textAlign: "center",
};