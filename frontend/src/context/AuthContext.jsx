import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // 🔹 Cargar usuario desde localStorage al inicio
  useEffect(() => {
    try {
      const access = localStorage.getItem("access");
      const refresh = localStorage.getItem("refresh");
      const storedUser = localStorage.getItem("user");

      if (access && refresh && storedUser) {
        setUser({
          access,
          refresh,
          ...JSON.parse(storedUser), // 👈 guardamos también los datos del usuario
        });
      }
    } catch (err) {
      console.error("Error cargando user desde localStorage:", err);
      setUser(null);
    }
  }, []);

  // 🔹 Login → guardar en localStorage y en el estado
  const login = (data) => {
    // data debe venir como { access, refresh, user: { username, email, role, ... } }
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
    localStorage.setItem("user", JSON.stringify(data.user));

    setUser({
      access: data.access,
      refresh: data.refresh,
      ...data.user,
    });
  };

  // 🔹 Logout → limpiar todo
  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  console.log("AuthContext user en render:", user);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
