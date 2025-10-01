import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 👈 NUEVO: estado de loading

  // 🔹 Cargar usuario desde localStorage al inicio
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const access = localStorage.getItem("access");
        const storedUser = localStorage.getItem("user");

        if (access && storedUser) {
          const userData = JSON.parse(storedUser);
          
          // 👇 Aseguramos que user_type esté disponible como role para compatibilidad
          const normalizedUser = {
            ...userData,
            role: userData.user_type, // 👈 Mantener compatibilidad
            user_type: userData.user_type // 👈 Mantener original
          };

          setUser({
            access,
            refresh: localStorage.getItem("refresh"),
            ...normalizedUser,
          });
        }
      } catch (err) {
        console.error("Error cargando user desde localStorage:", err);
        localStorage.clear();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // 🔹 Login → guardar en localStorage y en el estado
  const login = (data) => {
    // Normalizar datos del usuario para compatibilidad
    const normalizedUser = {
      ...data.user,
      role: data.user.user_type, // 👈 Para compatibilidad con componentes existentes
      user_type: data.user.user_type // 👈 Mantener original
    };

    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
    localStorage.setItem("user", JSON.stringify(normalizedUser));

    setUser({
      access: data.access,
      refresh: data.refresh,
      ...normalizedUser,
    });
  };

  // 🔹 Logout → limpiar todo
  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    setUser(null);
  };

  // 🔹 Actualizar datos del usuario
  const updateUser = (userData) => {
    const normalizedUser = {
      ...userData,
      role: userData.user_type,
      user_type: userData.user_type
    };
    
    localStorage.setItem("user", JSON.stringify(normalizedUser));
    setUser(prev => ({
      ...prev,
      ...normalizedUser
    }));
  };

  console.log("AuthContext user:", user);

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      updateUser,
      loading // 👈 Exportar loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};