import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

export default function ManageUsers() {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    dni: "",
    user_type: "resident",
    password: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("access");

  // Cargar usuarios
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/auth/users/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
      } catch (err) {
        setError("Error al cargar usuarios");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Crear nuevo usuario
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8000/api/auth/register/",
        newUser,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUsers([...users, response.data]);
      setNewUser({
        username: "",
        email: "",
        dni: "",
        user_type: "resident",
        password: "",
      });
    } catch (err) {
      setError("Error al crear usuario");
      console.error(err);
    }
  };

  // Actualizar rol de usuario
  const handleUpdateRole = async (userId, newRole) => {
    try {
      const response = await axios.patch(
        `http://localhost:8000/api/auth/users/${userId}/role/`,
        { user_type: newRole },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, user_type: newRole } : u))
      );
    } catch (err) {
      setError("Error al actualizar rol");
      console.error(err);
    }
  };

  if (loading) return <div>Cargando usuarios...</div>;

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f5f7fa",
        minHeight: "100vh",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h1
        style={{
          color: "#2c3e50",
          marginBottom: "20px",
          textAlign: "center",
        }}
      >
        Gestionar Usuarios
      </h1>

      {error && (
        <p
          style={{
            color: "red",
            textAlign: "center",
            marginBottom: "15px",
          }}
        >
          {error}
        </p>
      )}

      {/* Formulario para crear nuevo usuario */}
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          marginBottom: "30px",
        }}
      >
        <h3>Crear Nuevo Usuario</h3>
        <form onSubmit={handleCreateUser}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Usuario"
              value={newUser.username}
              onChange={(e) =>
                setNewUser({ ...newUser, username: e.target.value })
              }
              required
              style={inputStyle}
            />
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
              required
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="DNI"
              value={newUser.dni}
              onChange={(e) =>
                setNewUser({ ...newUser, dni: e.target.value })
              }
              required
              style={inputStyle}
            />
            <select
              value={newUser.user_type}
              onChange={(e) =>
                setNewUser({ ...newUser, user_type: e.target.value })
              }
              style={inputStyle}
            >
              <option value="admin">Administrador</option>
              <option value="resident">Residente</option>
              <option value="security">Seguridad</option>
              <option value="maintenance">Mantenimiento</option>
            </select>
            <input
              type="password"
              placeholder="Contraseña"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
              required
              style={inputStyle}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: "10px 15px",
              backgroundColor: "#2ecc71",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginTop: "10px",
            }}
          >
            Crear Usuario
          </button>
        </form>
      </div>

      {/* Listado de usuarios */}
      <div>
        <h3>Usuarios Registrados</h3>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "white",
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: "#34495e",
                color: "white",
                textAlign: "left",
              }}
            >
              <th style={thStyle}>Usuario</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>DNI</th>
              <th style={thStyle}>Rol</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={tdStyle}>{u.username}</td>
                <td style={tdStyle}>{u.email}</td>
                <td style={tdStyle}>{u.dni}</td>
                <td style={tdStyle}>
                  <select
                    value={u.user_type}
                    onChange={(e) =>
                      handleUpdateRole(u.id, e.target.value)
                    }
                    style={{
                      padding: "5px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                    }}
                  >
                    <option value="admin">Administrador</option>
                    <option value="resident">Residente</option>
                    <option value="security">Seguridad</option>
                    <option value="maintenance">Mantenimiento</option>
                  </select>
                </td>
                <td style={tdStyle}>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          `¿Eliminar a ${u.username}? Esta acción no se puede deshacer.`
                        )
                      ) {
                        // Aquí puedes implementar eliminar usuario
                      }
                    }}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#e74c3c",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: "10px",
  border: "1px solid #ddd",
  borderRadius: "4px",
  flex: "1",
  minWidth: "150px",
};

const thStyle = {
  padding: "12px 15px",
  textAlign: "left",
};

const tdStyle = {
  padding: "12px 15px",
  borderBottom: "1px solid #eee",
};