import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [avisos, setAvisos] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("access");

  // Cargar datos del residente
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Avisos
        const avisosRes = await axios.get("http://localhost:8000/api/auth/avisos/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAvisos(avisosRes.data);

        // Unidades asignadas
        const unidadesRes = await axios.get("http://localhost:8000/api/auth/units/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Filtrar unidades donde el usuario es residente
        setUnidades(unidadesRes.data.filter(u => u.residents.some(r => r.id === user.id)));

        // Reservas del usuario
        const reservasRes = await axios.get("http://localhost:8000/api/auth/reservations/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReservas(reservasRes.data.filter(r => r.user.id === user.id));

        // Notificaciones
        // Este endpoint no está en tus vistas actuales, pero puedes crearlo
        // setNotificaciones(...);
      } catch (err) {
        setError("Error al cargar datos del usuario");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  if (loading) return <div>Cargando dashboard...</div>;

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f5f7fa",
        minHeight: "100vh",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "15px 20px",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          marginBottom: "20px",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "24px",
            fontWeight: "600",
            color: "#2c3e50",
          }}
        >
          Bienvenido, {user?.first_name || user?.username}
        </h1>
        <span
          style={{
            color: "#7f8c8d",
            fontSize: "14px",
          }}
        >
          Rol: {user?.user_type}
        </span>
      </header>

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

      <main>
        {/* Avisos recientes */}
        <section
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
            marginBottom: "20px",
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              color: "#2c3e50",
              marginBottom: "15px",
            }}
          >
            Avisos Recientes
          </h2>
          {avisos.length > 0 ? (
            <ul
              style={{
                listStyle: "none",
                padding: 0,
              }}
            >
              {avisos.slice(0, 3).map((aviso) => (
                <li
                  key={aviso.id}
                  style={{
                    padding: "10px",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 5px 0",
                      color: "#34495e",
                    }}
                  >
                    {aviso.titulo}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      color: "#7f8c8d",
                      fontSize: "14px",
                    }}
                  >
                    {new Date(aviso.created_at).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay avisos recientes.</p>
          )}
        </section>

        {/* Unidades asignadas */}
        <section
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
            marginBottom: "20px",
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              color: "#2c3e50",
              marginBottom: "15px",
            }}
          >
            Tus Unidades
          </h2>
          {unidades.length > 0 ? (
            <ul
              style={{
                listStyle: "none",
                padding: 0,
              }}
            >
              {unidades.map((unidad) => (
                <li
                  key={unidad.id}
                  style={{
                    padding: "10px",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <strong>{unidad.number}</strong> - Piso {unidad.floor}
                </li>
              ))}
            </ul>
          ) : (
            <p>No tienes unidades asignadas.</p>
          )}
        </section>

        {/* Próximas reservas */}
        <section
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              color: "#2c3e50",
              marginBottom: "15px",
            }}
          >
            Tus Próximas Reservas
          </h2>
          {reservas.length > 0 ? (
            <ul
              style={{
                listStyle: "none",
                padding: 0,
              }}
            >
              {reservas.slice(0, 3).map((reserva) => (
                <li
                  key={reserva.id}
                  style={{
                    padding: "10px",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <strong>{reserva.area.name}</strong> - {new Date(reserva.date).toLocaleDateString()} de {reserva.start_time} a {reserva.end_time}
                </li>
              ))}
            </ul>
          ) : (
            <p>No tienes reservas próximas.</p>
          )}
        </section>
      </main>
    </div>
  );
}