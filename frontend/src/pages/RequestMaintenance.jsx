import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

export default function RequestMaintenance() {
  const { user } = useContext(AuthContext);
  const [solicitudes, setSolicitudes] = useState([]);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("access");

  // Cargar solicitudes del usuario
  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/auth/maintenance-requests/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setSolicitudes(response.data);
      } catch (err) {
        setError("Error al cargar solicitudes de mantenimiento");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchSolicitudes();
    }
  }, [user]);

  // Manejar envío de nueva solicitud
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const formData = new FormData();
    formData.append("description", description);
    if (image) {
      formData.append("image", image);
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/api/auth/maintenance-requests/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSolicitudes([response.data, ...solicitudes]);
      setDescription("");
      setImage(null);
    } catch (err) {
      setError("Error al enviar solicitud de mantenimiento");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
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
        Solicitar Mantenimiento
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

      {/* Formulario */}
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          marginBottom: "30px",
        }}
      >
        <h3>Nueva Solicitud</h3>
        <form onSubmit={handleSubmit}>
          <textarea
            placeholder="Describe el problema..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              minHeight: "100px",
              marginBottom: "10px",
            }}
          />
          <div style={{ marginBottom: "10px" }}>
            <label
              style={{
                padding: "10px 15px",
                backgroundColor: "#9b59b6",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Adjuntar Imagen (opcional)
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                style={{ display: "none" }}
              />
            </label>
            {image && (
              <span
                style={{
                  marginLeft: "10px",
                  fontSize: "14px",
                  color: "#7f8c8d",
                }}
              >
                {image.name}
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: "10px 15px",
              backgroundColor: "#2ecc71",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Enviando..." : "Enviar Solicitud"}
          </button>
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
          Historial de Solicitudes
        </h2>
        {solicitudes.length > 0 ? (
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
                <th style={thStyle}>Descripción</th>
                <th style={thStyle}>Estado</th>
                <th style={thStyle}>Imagen</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((solicitud) => (
                <tr key={solicitud.id}>
                  <td style={tdStyle}>
                    {new Date(solicitud.created_at).toLocaleDateString()}
                  </td>
                  <td style={tdStyle}>{solicitud.description}</td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        backgroundColor:
                          solicitud.status === "PENDIENTE"
                            ? "#f39c12"
                            : solicitud.status === "EN PROCESO"
                            ? "#3498db"
                            : "#27ae60",
                        color: "white",
                        fontSize: "12px",
                      }}
                    >
                      {solicitud.status}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    {solicitud.image ? (
                      <a
                        href={`http://localhost:8000${solicitud.image}`}
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
          <p>No tienes solicitudes de mantenimiento.</p>
        )}
      </div>
    </div>
  );
}

const thStyle = {
  padding: "12px 15px",
  textAlign: "left",
};

const tdStyle = {
  padding: "12px 15px",
  borderBottom: "1px solid #eee",
};