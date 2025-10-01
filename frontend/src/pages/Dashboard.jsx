import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { getExpenses, getReservations, getNotifications } from "../api";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [expenses, setExpenses] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 👇 Obtener el tipo de usuario de manera compatible
  const getUserType = () => {
    return user?.user_type || user?.role || 'Usuario';
  };

  // Cargar datos del usuario
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError("");

        // Cargar expensas
        try {
          const expensesRes = await getExpenses();
          setExpenses(expensesRes.data.slice(0, 5)); // Últimas 5 expensas
        } catch (err) {
          console.warn("No se pudieron cargar las expensas:", err);
        }

        // Cargar reservas
        try {
          const reservationsRes = await getReservations();
          // Filtrar reservas del usuario actual
          const userReservations = reservationsRes.data.filter(
            r => r.user?.id === user?.id || r.user === user?.id
          );
          setReservations(userReservations.slice(0, 3)); // Próximas 3 reservas
        } catch (err) {
          console.warn("No se pudieron cargar las reservas:", err);
        }

        // Cargar notificaciones
        try {
          const notificationsRes = await getNotifications();
          setNotifications(notificationsRes.data.slice(0, 5)); // Últimas 5 notificaciones
        } catch (err) {
          console.warn("No se pudieron cargar las notificaciones:", err);
        }

      } catch (err) {
        console.error("Error general:", err);
        setError("Error al cargar los datos del dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        fontSize: '18px',
        color: '#2c3e50'
      }}>
        <div>🔄 Cargando dashboard...</div>
      </div>
    );
  }

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
        <div>
          <h1
            style={{
              margin: "0 0 5px 0",
              fontSize: "24px",
              fontWeight: "600",
              color: "#2c3e50",
            }}
          >
            🏠 Bienvenido, {user?.first_name || user?.username}
          </h1>
          <span
            style={{
              color: "#7f8c8d",
              fontSize: "14px",
            }}
          >
            Rol: {getUserType()}
          </span>
        </div>
        
        {/* Acciones rápidas según el tipo de usuario */}
        <div style={{ display: "flex", gap: "10px" }}>
          {(getUserType() === 'resident' || getUserType() === 'admin') && (
            <Link 
              to="/reserve-area" 
              style={{
                padding: "8px 16px",
                backgroundColor: "#3498db",
                color: "white",
                textDecoration: "none",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            >
              🗓️ Reservar Área
            </Link>
          )}
          
          <Link 
            to="/view-bills" 
            style={{
              padding: "8px 16px",
              backgroundColor: "#2ecc71",
              color: "white",
              textDecoration: "none",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          >
            💰 Ver Expensas
          </Link>
        </div>
      </header>

      {error && (
        <div
          style={{
            backgroundColor: "#fee",
            color: "#c53030",
            padding: "12px 16px",
            borderRadius: "6px",
            marginBottom: "20px",
            border: "1px solid #fed7d7",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      <main>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          {/* Notificaciones */}
          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>
              🔔 Notificaciones Recientes
            </h2>
            {notifications.length > 0 ? (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {notifications.map((notification) => (
                  <li key={notification.id} style={listItemStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ margin: "0 0 5px 0", color: "#2c3e50", fontSize: "14px" }}>
                          {notification.title}
                        </h4>
                        <p style={{ margin: 0, color: "#7f8c8d", fontSize: "12px" }}>
                          {notification.message}
                        </p>
                      </div>
                      <span style={{ color: "#bdc3c7", fontSize: "11px", whiteSpace: 'nowrap' }}>
                        {new Date(notification.sent_at).toLocaleDateString()}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: "#7f8c8d", textAlign: "center", margin: "20px 0" }}>
                No hay notificaciones recientes
              </p>
            )}
          </section>

          {/* Próximas Expensas */}
          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>
              💰 Próximas Expensas
            </h2>
            {expenses.length > 0 ? (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {expenses.map((expense) => (
                  <li key={expense.id} style={listItemStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ margin: "0 0 5px 0", color: "#2c3e50", fontSize: "14px" }}>
                          {expense.period} - {expense.description}
                        </h4>
                        <p style={{ margin: 0, color: "#7f8c8d", fontSize: "12px" }}>
                          Vence: {new Date(expense.due_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <strong style={{ color: "#e74c3c", fontSize: "14px" }}>
                          ${expense.amount}
                        </strong>
                        <div style={{ 
                          fontSize: "10px", 
                          padding: "2px 6px", 
                          borderRadius: "10px", 
                          backgroundColor: expense.status === 'PAGADA' ? "#d4edda" : "#f8d7da",
                          color: expense.status === 'PAGADA' ? "#155724" : "#721c24",
                          marginTop: "4px"
                        }}>
                          {expense.status}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: "#7f8c8d", textAlign: "center", margin: "20px 0" }}>
                No hay expensas pendientes
              </p>
            )}
          </section>
        </div>

        {/* Próximas Reservas */}
        <section style={sectionStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ ...sectionTitleStyle, margin: 0 }}>
              🗓️ Tus Próximas Reservas
            </h2>
            <Link 
              to="/reserve-area" 
              style={{
                padding: "6px 12px",
                backgroundColor: "#3498db",
                color: "white",
                textDecoration: "none",
                borderRadius: "4px",
                fontSize: "12px",
              }}
            >
              Nueva Reserva
            </Link>
          </div>
          
          {reservations.length > 0 ? (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {reservations.map((reservation) => (
                <li key={reservation.id} style={listItemStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: "0 0 5px 0", color: "#2c3e50", fontSize: "14px" }}>
                        {reservation.area?.name || 'Área común'}
                      </h4>
                      <p style={{ margin: 0, color: "#7f8c8d", fontSize: "12px" }}>
                        📅 {new Date(reservation.date).toLocaleDateString()} 
                        <br />
                        ⏰ {reservation.start_time} - {reservation.end_time}
                      </p>
                    </div>
                    <span style={{ 
                      fontSize: "10px", 
                      padding: "4px 8px", 
                      borderRadius: "12px", 
                      backgroundColor: "#d4edda",
                      color: "#155724"
                    }}>
                      Confirmada
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <p style={{ color: "#7f8c8d", margin: "0 0 15px 0" }}>
                No tienes reservas programadas
              </p>
              <Link 
                to="/reserve-area" 
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#2ecc71",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              >
                🗓️ Hacer mi primera reserva
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

// Estilos reutilizables
const sectionStyle = {
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
};

const sectionTitleStyle = {
  fontSize: "18px",
  color: "#2c3e50",
  marginBottom: "15px",
  fontWeight: "600",
};

const listItemStyle = {
  padding: "12px 0",
  borderBottom: "1px solid #eee",
};

// Estilo para el último item sin borde
const lastListItemStyle = {
  ...listItemStyle,
  borderBottom: "none",
};