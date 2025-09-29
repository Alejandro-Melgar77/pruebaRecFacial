import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

export default function ViewBills() {
  const { user } = useContext(AuthContext);
  const [expensas, setExpensas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("access");

  // Cargar expensas del usuario
  useEffect(() => {
    const fetchExpensas = async () => {
      try {
        // Endpoint real que devuelve expensas filtradas por unidades del usuario
        const response = await axios.get("http://localhost:8000/api/auth/expenses/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setExpensas(response.data);
      } catch (err) {
        setError("Error al cargar expensas");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchExpensas();
    }
  }, [user]);

  if (loading) return <div>Cargando expensas...</div>;

  // Agrupar expensas por estado
  const pendientes = expensas.filter(e => e.status === "PENDIENTE");
  const pagadas = expensas.filter(e => e.status === "PAGADA");
  const vencidas = expensas.filter(e => e.status === "VENCIDA");

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
        Consultar Expensas
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

      {/* Resumen */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          flexWrap: "wrap",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
            textAlign: "center",
            flex: "1",
            minWidth: "150px",
          }}
        >
          <h3
            style={{
              margin: "0 0 10px 0",
              color: "#e74c3c",
            }}
          >
            Pendientes
          </h3>
          <p
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#2c3e50",
            }}
          >
            {pendientes.length}
          </p>
        </div>
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
            textAlign: "center",
            flex: "1",
            minWidth: "150px",
          }}
        >
          <h3
            style={{
              margin: "0 0 10px 0",
              color: "#27ae60",
            }}
          >
            Pagadas
          </h3>
          <p
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#2c3e50",
            }}
          >
            {pagadas.length}
          </p>
        </div>
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
            textAlign: "center",
            flex: "1",
            minWidth: "150px",
          }}
        >
          <h3
            style={{
              margin: "0 0 10px 0",
              color: "#f39c12",
            }}
          >
            Vencidas
          </h3>
          <p
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#2c3e50",
            }}
          >
            {vencidas.length}
          </p>
        </div>
      </div>

      {/* Listado de expensas */}
      <div>
        <h2
          style={{
            fontSize: "20px",
            color: "#2c3e50",
            marginBottom: "15px",
          }}
        >
          Historial de Expensas
        </h2>
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
              <th style={thStyle}>Período</th>
              <th style={thStyle}>Monto</th>
              <th style={thStyle}>Vencimiento</th>
              <th style={thStyle}>Estado</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {expensas.map((expensa) => (
              <tr key={expensa.id}>
                <td style={tdStyle}>{expensa.period}</td>
                <td style={tdStyle}>${expensa.amount}</td>
                <td style={tdStyle}>{new Date(expensa.due_date).toLocaleDateString()}</td>
                <td style={tdStyle}>
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      backgroundColor:
                        expensa.status === "PAGADA"
                          ? "#27ae60"
                          : expensa.status === "VENCIDA"
                          ? "#e74c3c"
                          : "#f39c12",
                      color: "white",
                      fontSize: "12px",
                    }}
                  >
                    {expensa.status}
                  </span>
                </td>
                <td style={tdStyle}>
                  {expensa.status === "PENDIENTE" && (
                    <button
                      onClick={() => {
                        // Aquí puedes abrir un modal o redirigir a un pago
                        alert(`Ir a pagar expensa de ${expensa.period}`);
                      }}
                      style={{
                        padding: "5px 10px",
                        backgroundColor: "#3498db",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Pagar
                    </button>
                  )}
                  {expensa.status === "PAGADA" && (
                    <button
                      onClick={() => {
                        // Aquí puedes abrir el comprobante
                        alert(`Ver comprobante de ${expensa.period}`);
                      }}
                      style={{
                        padding: "5px 10px",
                        backgroundColor: "#9b59b6",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Comprobante
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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