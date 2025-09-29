import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

export default function SecurityEvents() {
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("access");

  // Cargar eventos de seguridad
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/auth/security-events/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvents(response.data);
      } catch (err) {
        setError("Error al cargar eventos de seguridad");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) return <div>Cargando eventos de seguridad...</div>;

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
        Eventos de Seguridad
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

      <div
        style={{
          display: "grid",
          gap: "20px",
        }}
      >
        {events.map((event) => (
          <div
            key={event.id}
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  color: "#e74c3c",
                  textTransform: "capitalize",
                }}
              >
                {event.event_type.replace('_', ' ')}
              </h3>
              <span
                style={{
                  fontSize: "14px",
                  color: "#7f8c8d",
                }}
              >
                {new Date(event.timestamp).toLocaleString()}
              </span>
            </div>
            <p
              style={{
                color: "#34495e",
                marginBottom: "10px",
              }}
            >
              {event.description}
            </p>
            {event.image && (
              <div>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#7f8c8d",
                    marginBottom: "5px",
                  }}
                >
                  Evidencia:
                </p>
                <img
                  src={`http://localhost:8000${event.image}`} // Ajusta la URL según tu backend
                  alt="Evidencia de seguridad"
                  style={{
                    width: "100%",
                    maxWidth: "300px",
                    borderRadius: "8px",
                    border: "1px solid #eee",
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}