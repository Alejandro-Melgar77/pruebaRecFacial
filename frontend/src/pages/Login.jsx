import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";   // 👈 para redirigir
import { login as loginApi } from "../api";      // 👈 renombramos para no chocar con loginContext
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const { login: loginContext } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // 👈 Para mostrar un spinner al enviar

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await loginApi(formData);
      console.log("Respuesta del backend:", res.data.user);

      loginContext(res.data);

      // 🔥 Cambiado de 'role' a 'user_type'
      if (res.data.user.user_type === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Error en login:", err);
      setError("Usuario o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f0f2f5",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "20px",
            color: "#333",
            fontWeight: "600",
          }}
        >
          Iniciar Sesión
        </h2>

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

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <input
              type="text"
              name="username"
              placeholder="Usuario"
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "16px",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "16px",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Iniciando sesión..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}