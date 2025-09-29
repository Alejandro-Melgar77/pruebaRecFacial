import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

export default function ReserveArea() {
  const { user } = useContext(AuthContext);
  const [areas, setAreas] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("access");

  // Cargar áreas comunes y reservas
  useEffect(() => {
    const fetchAreasAndReservas = async () => {
      try {
        const [areasRes, reservasRes] = await Promise.all([
          axios.get("http://localhost:8000/api/auth/common-areas/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:8000/api/auth/reservations/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setAreas(areasRes.data);
        setReservas(reservasRes.data);
      } catch (err) {
        setError("Error al cargar áreas o reservas");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAreasAndReservas();
    }
  }, [user]);

  // Horarios disponibles para el área y fecha seleccionada
  const getAvailableTimes = () => {
    if (!selectedArea || !selectedDate) return [];

    const area = areas.find(a => a.id === parseInt(selectedArea));
    if (!area) return [];

    // Horarios base según disponibilidad del área
    const start = area.available_from;
    const end = area.available_to;

    // Convertir a minutos para facilitar la lógica
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    const startTotalMins = startH * 60 + startM;
    const endTotalMins = endH * 60 + endM;

    let slots = [];
    for (let i = startTotalMins; i < endTotalMins; i += 60) {
      const hour = Math.floor(i / 60);
      const minute = i % 60;
      slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    }

    // Filtrar horarios ya ocupados para la fecha y área
    const ocupados = reservas
      .filter(r => r.area.id === parseInt(selectedArea) && r.date === selectedDate)
      .map(r => r.start_time);

    return slots.filter(slot => !ocupados.includes(slot));
  };

  // Crear nueva reserva
  const handleCreateReservation = async (e) => {
    e.preventDefault();
    if (!selectedArea || !selectedDate || !selectedTime) {
      setError("Selecciona un área, fecha y horario");
      return;
    }

    try {
      await axios.post(
        "http://localhost:8000/api/auth/reservations/",
        {
          area: selectedArea,
          date: selectedDate,
          start_time: selectedTime,
          end_time: addOneHour(selectedTime), // Suponemos 1 hora de reserva
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage("Reserva creada exitosamente");
      // Actualizar listado localmente
      setReservas([
        ...reservas,
        {
          id: Date.now(), // temporal
          area: areas.find(a => a.id === parseInt(selectedArea)),
          date: selectedDate,
          start_time: selectedTime,
          end_time: addOneHour(selectedTime),
          user: user,
        },
      ]);
      setSelectedArea("");
      setSelectedDate("");
      setSelectedTime("");
    } catch (err) {
      setError("Error al crear reserva");
      console.error(err);
    }
  };

  // Función auxiliar para sumar una hora
  const addOneHour = (time) => {
    const [hour, minute] = time.split(':');
    const d = new Date();
    d.setHours(hour, minute, 0, 0);
    d.setHours(d.getHours() + 1);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const availableTimes = getAvailableTimes();

  if (loading) return <div>Cargando áreas y reservas...</div>;

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
        Reservar Área Común
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

      {message && (
        <p
          style={{
            color: "green",
            textAlign: "center",
            marginBottom: "15px",
          }}
        >
          {message}
        </p>
      )}

      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          marginBottom: "30px",
        }}
      >
        <h3>Crear Nueva Reserva</h3>
        <form onSubmit={handleCreateReservation}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              required
              style={inputStyle}
            >
              <option value="">Seleccionar área</option>
              {areas
                .filter(a => a.activo)
                .map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name} (Capacidad: {area.capacity})
                  </option>
                ))}
            </select>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              required
              style={inputStyle}
            />

            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              required
              style={inputStyle}
              disabled={!selectedDate || !selectedArea}
            >
              <option value="">Seleccionar horario</option>
              {availableTimes.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
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
            Reservar Área
          </button>
        </form>
      </div>

      {/* Listado de reservas del usuario */}
      <div>
        <h3>Tus Reservas</h3>
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
              <th style={thStyle}>Área</th>
              <th style={thStyle}>Fecha</th>
              <th style={thStyle}>Horario</th>
              <th style={thStyle}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {reservas
              .filter(r => r.user.id === user.id)
              .map((reserva) => (
                <tr key={reserva.id}>
                  <td style={tdStyle}>{reserva.area.name}</td>
                  <td style={tdStyle}>{new Date(reserva.date).toLocaleDateString()}</td>
                  <td style={tdStyle}>{reserva.start_time} - {reserva.end_time}</td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        backgroundColor: "#3498db",
                        color: "white",
                        fontSize: "12px",
                      }}
                    >
                      Reservada
                    </span>
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