import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

export default function ViewVisitors() {
  const { user } = useContext(AuthContext);
  const [visitors, setVisitors] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    unit_id: "",
    status: "",
    start_date: "",
    end_date: "",
  });

  const token = localStorage.getItem("access");

  // Cargar visitantes y unidades
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [visitorsRes, unitsRes] = await Promise.all([
          axios.get("http://localhost:8000/api/auth/visitors/", {
            headers: { Authorization: `Bearer ${token}` },
            params: filters,
          }),
          axios.get("http://localhost:8000/api/auth/units/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setVisitors(visitorsRes.data);
        setUnits(unitsRes.data);
      } catch (err) {
        setError("Error al cargar visitantes o unidades");
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

  if (loading) return <div>Cargando visitantes...</div>;

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
        Historial de Visitantes
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
        <h3>Filtrar Visitantes</h3>
        <form onSubmit={applyFilters}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <select
              name="unit_id"
              value={filters.unit_id}
              onChange={handleFilterChange}
              style={inputStyle}
            >
              <option value="">Todas las unidades</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.number}
                </option>
              ))}
            </select>

            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              style={inputStyle}
            >
              <option value="">Todos los estados</option>
              <option value="CREADA">Creada</option>
              <option value="VALIDADA">Validada</option>
              <option value="DENEGADA">Denegada</option>
              <option value="CADUCADA">Caducada</option>
            </select>

            <input
              type="date"
              name="start_date"
              value={filters.start_date}
              onChange={handleFilterChange}
              style={inputStyle}
            />

            <input
              type="date"
              name="end_date"
              value={filters.end_date}
              onChange={handleFilterChange}
              style={inputStyle}
            />

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

      {/* Listado de visitantes */}
      <div>
        <h2
          style={{
            fontSize: "20px",
            color: "#2c3e50",
            marginBottom: "15px",
          }}
        >
          Visitantes Registrados
        </h2>
        {visitors.length > 0 ? (
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
                <th style={thStyle}>Documento</th>
                <th style={thStyle}>Unidad</th>
                <th style={thStyle}>Programado</th>
                <th style={thStyle}>Entrada</th>
                <th style={thStyle}>Salida</th>
                <th style={thStyle}>Estado</th>
                <th style={thStyle}>QR</th>
              </tr>
            </thead>
            <tbody>
              {visitors.map((visitor) => (
                <tr key={visitor.id}>
                  <td style={tdStyle}>{visitor.name}</td>
                  <td style={tdStyle}>{visitor.dni}</td>
                  <td style={tdStyle}>{visitor.visited_unit.number}</td>
                  <td style={tdStyle}>
                    {new Date(visitor.scheduled_at).toLocaleString()}
                  </td>
                  <td style={tdStyle}>
                    {visitor.entry_time
                      ? new Date(visitor.entry_time).toLocaleString()
                      : "N/A"}
                  </td>
                  <td style={tdStyle}>
                    {visitor.exit_time
                      ? new Date(visitor.exit_time).toLocaleString()
                      : "N/A"}
                  </td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        backgroundColor:
                          visitor.status === "VALIDADA"
                            ? "#27ae60"
                            : visitor.status === "DENEGADA"
                            ? "#e74c3c"
                            : visitor.status === "CADUCADA"
                            ? "#f39c12"
                            : "#3498db",
                        color: "white",
                        fontSize: "12px",
                      }}
                    >
                      {visitor.status}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    {visitor.qr_code ? (
                      <a
                        href={`http://localhost:8000${visitor.qr_code}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Ver QR
                      </a>
                    ) : (
                      "Sin QR"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No hay visitantes registrados con los filtros aplicados.</p>
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