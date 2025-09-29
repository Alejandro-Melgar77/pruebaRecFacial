import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

export default function ViewReports() {
  const { user } = useContext(AuthContext);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("access");

  // Generar reporte financiero
  const generateFinancialReport = async () => {
    if (!startDate || !endDate) {
      setError("Selecciona un rango de fechas");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `http://localhost:8000/api/auth/reports/financial/?start_date=${startDate}&end_date=${endDate}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob", // Important for file download
        }
      );

      // Crear enlace para descargar
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "reporte_financiero.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError("Error al generar reporte");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
        Reportes Administrativos
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

      {/* Formulario para generar reporte */}
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          marginBottom: "30px",
        }}
      >
        <h3>Generar Reporte Financiero</h3>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={inputStyle}
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={inputStyle}
          />
          <button
            onClick={generateFinancialReport}
            disabled={loading}
            style={{
              padding: "10px 15px",
              backgroundColor: "#2ecc71",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Generando..." : "Generar PDF"}
          </button>
        </div>
      </div>

      {/* Más tipos de reportes en el futuro */}
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
        }}
      >
        <h3>Tipos de Reportes Disponibles</h3>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
          }}
        >
          <li style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
            <strong>Financiero:</strong> Ingresos, egresos, morosidad.
          </li>
          <li style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
            <strong>Uso de Áreas Comunes:</strong> Estadísticas de reservas.
          </li>
          <li style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
            <strong>Seguridad:</strong> Incidentes, accesos no autorizados.
          </li>
          <li style={{ padding: "10px" }}>
            <strong>Mantenimiento:</strong> Costos, órdenes de trabajo.
          </li>
        </ul>
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