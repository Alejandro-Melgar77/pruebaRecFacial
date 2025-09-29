import { useEffect, useState } from "react";
import axios from "axios";

export default function RoleManagement() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("access");
    axios.get("http://127.0.0.1:8000/api/auth/users/", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setUsers(res.data));
  }, []);

  const updateRole = (id, newRole) => {
    const token = localStorage.getItem("access");
    axios.patch(
      `http://127.0.0.1:8000/api/auth/users/${id}/role/`,
      { role: newRole },
      { headers: { Authorization: `Bearer ${token}` } }
    ).then(res => {
      setUsers(users.map(u => (u.id === id ? res.data : u)));
    });
  };

  return (
    <div>
      <h2>Gestión de Roles</h2>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                <select value={u.role} onChange={e => updateRole(u.id, e.target.value)}>
                  <option value="admin">Administrador</option>
                  <option value="residente">Residente</option>
                  <option value="seguridad">Seguridad</option>
                  <option value="mantenimiento">Mantenimiento</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
