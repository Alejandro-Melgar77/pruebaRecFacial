import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

export default function ViewMaintenanceStatus() {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    status: "",
  });

  const token = localStorage.getItem("access");

  // Cargar solicitudes de mantenimiento
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/auth/maintenance-requests/", {
          headers: { Authorization: `Bearer ${token}` },
          params: filters,
        });

        setRequests(response.data);
      } catch (err) {
        setError("Error al cargar solicitudes de mantenimiento");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, filters]);

  // Manejar cambios en filtros
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  // Aplicar filtros
  const applyFilters = (e) => {
    e.preventDefault();
    // Al actualizar `filters`, useEffect se ejecuta y recarga los datos
  };

  if (loading) return <div>Cargando solicitudes...</div>;

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
        Estado de Solicitudes de Mantenimiento
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

      {/* Filtros */}
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          marginBottom: "30px",
        }}
      >
        <h3>Filtrar Solicitudes</h3>
        <form onSubmit={applyFilters}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              style={inputStyle}
            >
              <option value="">Todos los estados</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="EN PROCESO">En Proceso</option>
              <option value="FINALIZADA">Finalizada</option>
            </select>

            <button
              type="submit"
              style={{
                padding: "10px 15px",
                backgroundColor: "#3498db",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Filtrar
            </button>
          </div>
        </form>
      </div>

      {/* Listado de solicitudes */}
      <div>
        <h2
          style={{
            fontSize: "20px",
            color: "#2c3e50",
            marginBottom: "15px",
          }}
        >
          Solicitudes Registradas
        </h2>
        {requests.length > 0 ? (
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
                <th style={thStyle}>Fecha</th>
                <th style={thStyle}>Unidad</th>
                <th style={thStyle}>Descripción</th>
                <th style={thStyle}>Estado</th>
                <th style={thStyle}>Imagen</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td style={tdStyle}>
                    {new Date(request.created_at).toLocaleDateString()}
                  </td>
                  <td style={tdStyle}>{request.unit.number}</td>
                  <td style={tdStyle}>{request.description}</td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        backgroundColor:
                          request.status === "PENDIENTE"
                            ? "#f39c12"
                            : request.status === "EN PROCESO"
                            ? "#3498db"
                            : "#27ae60",
                        color: "white",
                        fontSize: "12px",
                      }}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    {request.image ? (
                      <a
                        href={`http://localhost:8000${request.image}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Ver Imagen
                      </a>
                    ) : (
                      "Sin imagen"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No tienes solicitudes de mantenimiento con los filtros aplicados.</p>
        )}
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