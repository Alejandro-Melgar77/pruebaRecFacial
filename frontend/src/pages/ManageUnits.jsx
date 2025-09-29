import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

export default function ManageUnits() {
  const { user } = useContext(AuthContext);
  const [units, setUnits] = useState([]);
  const [users, setUsers] = useState([]);
  const [newUnit, setNewUnit] = useState({
    number: "",
    floor: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("access");

  // Cargar unidades y usuarios
  useEffect(() => {
    const fetchUnitsAndUsers = async () => {
      try {
        const [unitsRes, usersRes] = await Promise.all([
          axios.get("http://localhost:8000/api/auth/units/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:8000/api/auth/users/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setUnits(unitsRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        setError("Error al cargar unidades o usuarios");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUnitsAndUsers();
  }, []);

  // Crear nueva unidad
  const handleCreateUnit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8000/api/auth/units/",
        newUnit,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUnits([...units, response.data]);
      setNewUnit({ number: "", floor: "" });
    } catch (err) {
      setError("Error al crear unidad");
      console.error(err);
    }
  };

  // Asignar residente a unidad
  const handleAssignResident = async (unitId, userId) => {
    try {
      // Suponiendo que tienes un endpoint para asignar residente a unidad
      // Este endpoint no está en tus vistas actuales, pero puedes crearlo
      // Ejemplo: PATCH /api/auth/units/{id}/assign-resident/
      await axios.patch(
        `http://localhost:8000/api/auth/units/${unitId}/assign-resident/`,
        { user_id: userId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Actualizar unidades localmente (simulación)
      setUnits(
        units.map((u) =>
          u.id === unitId
            ? { ...u, residents: [...u.residents, users.find((usr) => usr.id === userId)] }
            : u
        )
      );
    } catch (err) {
      setError("Error al asignar residente");
      console.error(err);
    }
  };

  if (loading) return <div>Cargando unidades...</div>;

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
        Gestionar Unidades
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

      {/* Formulario para crear nueva unidad */}
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          marginBottom: "30px",
        }}
      >
        <h3>Crear Nueva Unidad</h3>
        <form onSubmit={handleCreateUnit}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Número (ej. 101)"
              value={newUnit.number}
              onChange={(e) =>
                setNewUnit({ ...newUnit, number: e.target.value })
              }
              required
              style={inputStyle}
            />
            <input
              type="number"
              placeholder="Piso"
              value={newUnit.floor}
              onChange={(e) =>
                setNewUnit({ ...newUnit, floor: e.target.value })
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
            Crear Unidad
          </button>
        </form>
      </div>

      {/* Listado de unidades */}
      <div>
        <h3>Unidades Registradas</h3>
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
              <th style={thStyle}>Número</th>
              <th style={thStyle}>Piso</th>
              <th style={thStyle}>Residentes</th>
              <th style={thStyle}>Asignar Residente</th>
            </tr>
          </thead>
          <tbody>
            {units.map((unit) => (
              <tr key={unit.id}>
                <td style={tdStyle}>{unit.number}</td>
                <td style={tdStyle}>{unit.floor}</td>
                <td style={tdStyle}>
                  {unit.residents && unit.residents.length > 0 ? (
                    <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                      {unit.residents.map((res) => (
                        <li key={res.id} style={{ marginBottom: "5px" }}>
                          {res.username}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span style={{ color: "#95a5a6" }}>Sin residentes</span>
                  )}
                </td>
                <td style={tdStyle}>
                  <select
                    onChange={(e) =>
                      handleAssignResident(unit.id, e.target.value)
                    }
                    style={{
                      padding: "5px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                    }}
                  >
                    <option value="">Seleccionar residente</option>
                    {users
                      .filter(
                        (usr) =>
                          !unit.residents ||
                          !unit.residents.some((r) => r.id === usr.id)
                      )
                      .map((usr) => (
                        <option key={usr.id} value={usr.id}>
                          {usr.username}
                        </option>
                      ))}
                  </select>
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