import { useState, useRef, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

export default function FaceRegister() {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const token = localStorage.getItem("access");

  // Cargar usuarios
  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/auth/users/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (err) {
      setError("Error al cargar usuarios");
      console.error(err);
    }
  };

  // Iniciar cámara
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
    } catch (err) {
      setError("No se pudo acceder a la cámara");
      console.error(err);
    }
  };

  // Detener cámara
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Capturar imagen de la cámara
  const captureImage = () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg");
    setPreview(dataUrl);
    setImage(dataUrl);
    stopCamera();
  };

  // Manejar archivo subido
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Enviar imagen al backend
  const handleSubmit = async () => {
    if (!selectedUser || !image) {
      setError("Selecciona un usuario y una imagen");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      // Convertir imagen a base64
      const base64 = image.split(",")[1];

      await axios.post(
        "http://localhost:8000/api/auth/face/register/",
        { image: base64 },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setMessage("Rostro registrado exitosamente");
    } catch (err) {
      setError("Error al registrar rostro");
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
        Registrar Rostro
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
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          alignItems: "center",
        }}
      >
        {/* Seleccionar usuario */}
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
            width: "100%",
            maxWidth: "600px",
          }}
        >
          <h3>Seleccionar Usuario</h3>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            onClick={fetchUsers}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          >
            <option value="">Selecciona un usuario</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.username} ({u.user_type})
              </option>
            ))}
          </select>
        </div>

        {/* Cámara o subida de imagen */}
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
            width: "100%",
            maxWidth: "600px",
          }}
        >
          <h3>Capturar o Subir Imagen</h3>

          {/* Vista previa */}
          {preview && (
            <div style={{ textAlign: "center", marginBottom: "15px" }}>
              <img
                src={preview}
                alt="Vista previa"
                style={{
                  width: "100%",
                  maxWidth: "300px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                }}
              />
            </div>
          )}

          {/* Cámara */}
          <div style={{ textAlign: "center", marginBottom: "15px" }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{
                width: "100%",
                maxWidth: "300px",
                borderRadius: "8px",
                border: "1px solid #ddd",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <button
              onClick={startCamera}
              style={{
                padding: "10px 15px",
                backgroundColor: "#3498db",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Iniciar Cámara
            </button>
            <button
              onClick={captureImage}
              style={{
                padding: "10px 15px",
                backgroundColor: "#2ecc71",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Capturar Imagen
            </button>
          </div>

          <div style={{ textAlign: "center", margin: "15px 0" }}>
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
              Subir Imagen
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </label>
          </div>
        </div>

        {/* Botón para enviar */}
        <button
          onClick={handleSubmit}
          disabled={loading || !selectedUser || !image}
          style={{
            padding: "12px 20px",
            backgroundColor: "#e67e22",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Registrando..." : "Registrar Rostro"}
        </button>
      </div>
    </div>
  );
}