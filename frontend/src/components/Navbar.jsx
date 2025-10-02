import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // 👇 Función para obtener el nombre para mostrar del rol
  const getRoleDisplayName = () => {
    const userType = getUserType();
    const roleNames = {
      'admin': 'Administrador',
      'resident': 'Residente',
      'security': 'Seguridad',
      'maintenance': 'Mantenimiento'
    };
    return roleNames[userType] || userType;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav style={{ 
      padding: "15px 20px", 
      backgroundColor: "#2c3e50", 
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      position: "relative"
    }}>
      {/* Logo y menú hamburguesa para móvil */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px", width: "100%", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Link 
            to="/" 
            style={{ 
              color: "white", 
              textDecoration: "none", 
              fontWeight: "bold",
              fontSize: "1.2rem",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            🏠 Smart Condominium
          </Link>
        </div>

        {/* Botón menú hamburguesa para móvil */}
        <button
          onClick={toggleMobileMenu}
          style={{
            display: "none",
            backgroundColor: "transparent",
            border: "none",
            color: "white",
            fontSize: "1.5rem",
            cursor: "pointer",
            padding: "5px"
          }}
          className="mobile-menu-btn"
        >
          ☰
        </button>
      </div>

      {/* Menú de navegación */}
      <div 
        style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "15px", 
          flexWrap: "wrap",
          width: "100%",
          transition: "all 0.3s ease"
        }}
        className={isMobileMenuOpen ? "mobile-menu-open" : "mobile-menu-closed"}
      >
        {/* Si hay usuario → mostrar enlaces según rol */}
        {user && (
          <div style={{ 
            display: "flex", 
            gap: "15px", 
            alignItems: "center", 
            flexWrap: "wrap",
            width: "100%",
            marginTop: "15px"
          }}>
            {/* Enlaces para todos los usuarios autenticados */}
            <Link 
              to="/dashboard" 
              style={{ 
                color: "white", 
                textDecoration: "none",
                padding: "8px 12px",
                borderRadius: "4px",
                transition: "background-color 0.2s"
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.1)"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
            >
              📊 Dashboard
            </Link>

            {/* Enlaces para Admin */}
            {hasRole("admin") && (
              <>
                <Link 
                  to="/admin-dashboard" 
                  style={{ 
                    color: "white", 
                    textDecoration: "none",
                    padding: "8px 12px",
                    borderRadius: "4px",
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.1)"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                >
                  ⚙️ Admin Panel
                </Link>
                <Link 
                  to="/manage-users" 
                  style={{ 
                    color: "white", 
                    textDecoration: "none",
                    padding: "8px 12px",
                    borderRadius: "4px",
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.1)"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                >
                  👥 Gestionar Usuarios
                </Link>
                <Link 
                  to="/manage-units" 
                  style={{ 
                    color: "white", 
                    textDecoration: "none",
                    padding: "8px 12px",
                    borderRadius: "4px",
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.1)"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                >
                  🏢 Unidades
                </Link>
                <Link 
                  to="/view-reports" 
                  style={{ 
                    color: "white", 
                    textDecoration: "none",
                    padding: "8px 12px",
                    borderRadius: "4px",
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.1)"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                >
                  📈 Reportes
                </Link>
              </>
            )}

            {/* 🔥 NUEVO: Enlaces para OCR de Placas (Admin y Security) */}
            {(hasRole("admin") || hasRole("security")) && (
              <div style={{
                display: "flex",
                gap: "15px",
                alignItems: "center",
                padding: "10px",
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: "6px",
                border: "1px solid rgba(255,255,255,0.1)"
              }}>
                <span style={{ 
                  fontSize: "12px", 
                  color: "#bdc3c7",
                  fontWeight: "bold",
                  textTransform: "uppercase"
                }}>
                  🚗 OCR Placas
                </span>
                <Link 
                  to="/plate-recognition" 
                  style={{ 
                    color: "white", 
                    textDecoration: "none",
                    padding: "6px 10px",
                    borderRadius: "4px",
                    fontSize: "14px",
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(52, 152, 219, 0.3)"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                >
                  🔍 Reconocer
                </Link>
                <Link 
                  to="/vehicle-plates" 
                  style={{ 
                    color: "white", 
                    textDecoration: "none",
                    padding: "6px 10px",
                    borderRadius: "4px",
                    fontSize: "14px",
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(52, 152, 219, 0.3)"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                >
                  📋 Gestionar
                </Link>
                <Link 
                  to="/vehicle-access-logs" 
                  style={{ 
                    color: "white", 
                    textDecoration: "none",
                    padding: "6px 10px",
                    borderRadius: "4px",
                    fontSize: "14px",
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(52, 152, 219, 0.3)"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                >
                  📊 Registros
                </Link>
              </div>
            )}

            {/* Enlaces para Admin y Security */}
            {(hasRole("admin") || hasRole("security")) && (
              <>
                <Link 
                  to="/face-register" 
                  style={{ 
                    color: "white", 
                    textDecoration: "none",
                    padding: "8px 12px",
                    borderRadius: "4px",
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.1)"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                >
                  📸 Registrar Rostros
                </Link>
                <Link 
                  to="/face-recognize" 
                  style={{ 
                    color: "white", 
                    textDecoration: "none",
                    padding: "8px 12px",
                    borderRadius: "4px",
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.1)"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                >
                  👁️ Reconocer Rostros
                </Link>
                <Link 
                  to="/security-events" 
                  style={{ 
                    color: "white", 
                    textDecoration: "none",
                    padding: "8px 12px",
                    borderRadius: "4px",
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.1)"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                >
                  🚨 Eventos Seguridad
                </Link>
                <Link 
                  to="/view-visitors" 
                  style={{ 
                    color: "white", 
                    textDecoration: "none",
                    padding: "8px 12px",
                    borderRadius: "4px",
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.1)"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                >
                  👥 Visitantes
                </Link>
              </>
            )}

            {/* Enlaces para Residentes */}
            {hasRole("resident") && (
              <>
                <Link 
                  to="/reserve-area" 
                  style={{ 
                    color: "white", 
                    textDecoration: "none",
                    padding: "8px 12px",
                    borderRadius: "4px",
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.1)"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                >
                  🏟️ Reservar Áreas
                </Link>
                <Link 
                  to="/view-bills" 
                  style={{ 
                    color: "white", 
                    textDecoration: "none",
                    padding: "8px 12px",
                    borderRadius: "4px",
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.1)"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                >
                  💰 Mis Expensas
                </Link>
                <Link 
                  to="/request-maintenance" 
                  style={{ 
                    color: "white", 
                    textDecoration: "none",
                    padding: "8px 12px",
                    borderRadius: "4px",
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.1)"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                >
                  🔧 Mantenimiento
                </Link>
              </>
            )}
          </div>
        )}
      </div>

      {/* Información del usuario y logout */}
      {user && (
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "15px",
          marginTop: "15px",
          width: "100%",
          justifyContent: "flex-end",
          paddingTop: "10px",
          borderTop: "1px solid rgba(255,255,255,0.1)"
        }}>
          <span style={{ 
            fontSize: "14px", 
            color: "#ecf0f1",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <span style={{
              backgroundColor: "rgba(255,255,255,0.1)",
              padding: "4px 8px",
              borderRadius: "12px",
              fontSize: "12px"
            }}>
              👤 {user.first_name || user.username}
            </span>
            <span style={{
              backgroundColor: "#3498db",
              padding: "4px 8px",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: "bold"
            }}>
              {getRoleDisplayName()}
            </span>
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
              fontSize: "14px",
              transition: "background-color 0.2s"
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = "#c0392b"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "#e74c3c"}
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      )}

      {/* Si no hay usuario → mostrar Login/Registro */}
      {!user && (
        <div style={{ 
          display: "flex", 
          gap: "15px",
          width: "100%",
          justifyContent: "flex-end",
          marginTop: "15px"
        }}>
          <Link 
            to="/login" 
            style={{ 
              color: "white", 
              textDecoration: "none",
              padding: "8px 16px",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "4px",
              transition: "background-color 0.2s"
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.1)"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
          >
            🔑 Login
          </Link>
          <Link 
            to="/register" 
            style={{ 
              color: "white", 
              textDecoration: "none",
              padding: "8px 16px",
              backgroundColor: "rgba(46, 204, 113, 0.2)",
              border: "1px solid rgba(46, 204, 113, 0.5)",
              borderRadius: "4px",
              transition: "background-color 0.2s"
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(46, 204, 113, 0.3)"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "rgba(46, 204, 113, 0.2)"}
          >
            📝 Registro
          </Link>
        </div>
      )}

      {/* Estilos CSS para responsive */}
      <style>
        {`
          @media (max-width: 768px) {
            .mobile-menu-btn {
              display: block !important;
            }
            
            .mobile-menu-closed {
              display: none !important;
            }
            
            .mobile-menu-open {
              display: flex !important;
              flex-direction: column;
              align-items: flex-start;
            }
            
            nav > div {
              flex-direction: column;
              align-items: flex-start;
            }
          }
          
          @media (min-width: 769px) {
            .mobile-menu-closed {
              display: flex !important;
            }
            
            .mobile-menu-btn {
              display: none !important;
            }
          }
        `}
      </style>
    </nav>
  );
}