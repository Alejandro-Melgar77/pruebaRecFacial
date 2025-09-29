import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

export default function ManageAreas() {
  const { user } = useContext(AuthContext);
  const [areas, setAreas] = useState([]);
  const [newArea, setNewArea] = useState({
    name: "",
    capacity: "",
    rules: "",
    available_from: "08:00",
    available_to: "22:00",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("access");

  // Cargar áreas comunes
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/auth/common-areas/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAreas(response.data);
      } catch (err) {
        setError("Error al cargar áreas comunes");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAreas();
  }, []);

  // Crear nueva área
  const handleCreateArea = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8000/api/auth/common-areas/",
        newArea,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAreas([...areas, response.data]);
      setNewArea({
        name: "",
        capacity: "",
        rules: "",
        available_from: "08:00",
        available_to: "22:00",
      });
    } catch (err) {
      setError("Error al crear área común");
      console.error(err);
    }
  };

  // Actualizar estado de área (activo/inactivo)
  const handleToggleActive = async (areaId, isActive) => {
    try {
      // Suponiendo que tu backend tiene un campo `activo` o `is_active`
      // Si no, puedes crear un endpoint para actualizarlo
      await axios.patch(
        `http://localhost:8000/api/auth/common-areas/${areaId}/`,
        { activo: !isActive }, // o is_active
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAreas(
        areas.map((area) =>
          area.id === areaId ? { ...area, activo: !isActive } : area
        )
      );
    } catch (err) {
      setError("Error al actualizar estado del área");
      console.error(err);
    }
  };

  if (loading) return <div>Cargando áreas comunes...</div>;

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
        Gestionar Áreas Comunes
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

      {/* Formulario para crear nueva área */}
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          marginBottom: "30px",
        }}
      >
        <h3>Crear Nueva Área Común</h3>
        <form onSubmit={handleCreateArea}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Nombre del área"
              value={newArea.name}
              onChange={(e) =>
                setNewArea({ ...newArea, name: e.target.value })
              }
              required
              style={inputStyle}
            />
            <input
              type="number"
              placeholder="Capacidad"
              value={newArea.capacity}
              onChange={(e) =>
                setNewArea({ ...newArea, capacity: e.target.value })
              }
              required
              style={inputStyle}
            />
            <input
              type="time"
              value={newArea.available_from}
              onChange={(e) =>
                setNewArea({ ...newArea, available_from: e.target.value })
              }
              style={inputStyle}
            />
            <input
              type="time"
              value={newArea.available_to}
              onChange={(e) =>
                setNewArea({ ...newArea, available_to: e.target.value })
              }
              style={inputStyle}
            />
          </div>
          <textarea
            placeholder="Reglas del área (opcional)"
            value={newArea.rules}
            onChange={(e) =>
              setNewArea({ ...newArea, rules: e.target.value })
            }
            style={{
              ...inputStyle,
              minHeight: "60px",
            }}
          />
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
            Crear Área
          </button>
        </form>
      </div>

      {/* Listado de áreas */}
      <div>
        <h3>Áreas Comunes Registradas</h3>
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
              <th style={thStyle}>Nombre</th>
              <th style={thStyle}>Capacidad</th>
              <th style={thStyle}>Horario</th>
              <th style={thStyle}>Reglas</th>
              <th style={thStyle}>Estado</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {areas.map((area) => (
              <tr key={area.id}>
                <td style={tdStyle}>{area.name}</td>
                <td style={tdStyle}>{area.capacity}</td>
                <td style={tdStyle}>
                  {area.available_from} - {area.available_to}
                </td>
                <td style={tdStyle}>
                  {area.rules ? area.rules : <span style={{ color: "#95a5a6" }}>Sin reglas</span>}
                </td>
                <td style={tdStyle}>
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      backgroundColor: area.activo ? "#2ecc71" : "#e74c3c",
                      color: "white",
                      fontSize: "12px",
                    }}
                  >
                    {area.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td style={tdStyle}>
                  <button
                    onClick={() => handleToggleActive(area.id, area.activo)}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: area.activo ? "#e74c3c" : "#2ecc71",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    {area.activo ? "Desactivar" : "Activar"}
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