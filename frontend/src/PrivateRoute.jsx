import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

export default function PrivateRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useContext(AuthContext);

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        fontSize: '18px',
        color: '#2c3e50'
      }}>
        <div>🔄 Cargando...</div>
      </div>
    );
  }

  // No logueado → redirige a login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Función para verificar si el usuario tiene el rol permitido
  const hasAllowedRole = () => {
    if (allowedRoles.length === 0) return true; // Si no hay restricciones
    
    const userType = user.user_type || user.role;
    return allowedRoles.includes(userType);
  };

  // Si hay roles permitidos y el usuario no tiene permiso → redirige
  if (!hasAllowedRole()) {
    console.warn(`Acceso denegado. Usuario: ${user.user_type || user.role}, Requerido: ${allowedRoles.join(', ')}`);
    return <Navigate to="/dashboard" replace />;
  }

  // Si está logueado y tiene permiso → renderiza el componente
  return children;
}