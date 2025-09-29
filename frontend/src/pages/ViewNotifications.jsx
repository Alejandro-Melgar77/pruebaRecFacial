import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

export default function ViewNotifications() {
  const { user } = useContext(AuthContext);
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("access");

  // Cargar notificaciones del usuario
  useEffect(() => {
    const fetchNotificaciones = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/auth/notifications/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setNotificaciones(response.data);
      } catch (err) {
        setError("Error al cargar notificaciones");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchNotificaciones();
    }
  }, [user]);

  // Marcar notificación como leída
  const marcarComoLeida = async (id) => {
    try {
      await axios.patch(
        `http://localhost:8000/api/auth/notifications/${id}/read/`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNotificaciones(
        notificaciones.map((n) =>
          n.id === id ? { ...n, status: "LEÍDA" } : n
        )
      );
    } catch (err) {
      setError("Error al marcar como leída");
      console.error(err);
    }
  };

  if (loading) return <div>Cargando notificaciones...</div>;

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
        Notificaciones
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
          display: "flex",
          flexDirection: "column",
          gap: "15px",
        }}
      >
        {notificaciones.length > 0 ? (
          notificaciones.map((noti) => (
            <div
              key={noti.id}
              style={{
                backgroundColor: "white",
                padding: "15px",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                borderLeft: noti.status === "PENDIENTE" ? "4px solid #3498db" : "4px solid #95a5a6",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3
                  style={{
                    margin: "0",
                    color: noti.status === "PENDIENTE" ? "#2c3e50" : "#7f8c8d",
                  }}
                >
                  {noti.title}
                </h3>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#7f8c8d",
                  }}
                >
                  {new Date(noti.sent_at).toLocaleDateString()}
                </span>
              </div>
              <p
                style={{
                  margin: "10px 0",
                  color: "#34495e",
                }}
              >
                {noti.message}
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                }}
              >
                <span
                  style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    backgroundColor: noti.status === "LEÍDA" ? "#27ae60" : "#f39c12",
                    color: "white",
                    fontSize: "12px",
                  }}
                >
                  {noti.status === "LEÍDA" ? "Leída" : "No leída"}
                </span>
                {noti.status === "PENDIENTE" && (
                  <button
                    onClick={() => marcarComoLeida(noti.id)}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#3498db",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Marcar como leída
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>No tienes notificaciones.</p>
        )}
      </div>
    </div>
  );
}