import { useState, useRef, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { registerFace, getUsers } from "../api";

export default function FaceRegister() {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [cameraActive, setCameraActive] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Cargar usuarios al montar el componente
  useEffect(() => {
    fetchUsers();
    return () => {
      stopCamera();
    };
  }, []);

  // Cargar usuarios
  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      setUsers(response.data);
    } catch (err) {
      setError("Error al cargar usuarios");
      console.error("Error fetching users:", err);
    }
  };

  // Iniciar cámara
  const startCamera = async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user" 
        } 
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      setCameraActive(true);
      setPreview(""); // Limpiar preview anterior
    } catch (err) {
      setError("No se pudo acceder a la cámara. Asegúrate de permitir el acceso.");
      console.error("Error al acceder a la cámara:", err);
    }
  };

  // Detener cámara
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Capturar imagen de la cámara
  const captureImage = () => {
    if (!videoRef.current || !cameraActive) {
      setError("Cámara no activa");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setPreview(dataUrl);
    setImage(dataUrl);
    stopCamera();
  };

  // Manejar archivo subido
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setError("Por favor selecciona un archivo de imagen válido");
        return;
      }

      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("La imagen debe ser menor a 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
        setImage(reader.result);
        setError("");
      };
      reader.readAsDataURL(file);
    }
  };

  // Enviar imagen al backend
  const handleSubmit = async () => {
    if (!selectedUser || !image) {
      setError("Debes seleccionar un usuario y una imagen");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      // Convertir imagen a base64
      const base64 = image.split(",")[1];

      await registerFace(base64);

      setMessage("✅ Rostro registrado exitosamente");
      setImage(null);
      setPreview("");
      setSelectedUser("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Error al registrar rostro:", err);
      if (err.response?.data?.error) {
        setError(`Error: ${err.response.data.error}`);
      } else {
        setError("Error al registrar el rostro. Intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedUserData = users.find(u => u.id.toString() === selectedUser);

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
        <div
          style={{
            color: "white",
            backgroundColor: "#e74c3c",
            padding: "10px",
            borderRadius: "4px",
            textAlign: "center",
            marginBottom: "15px",
          }}
        >
          {error}
        </div>
      )}

      {message && (
        <div
          style={{
            color: "white",
            backgroundColor: "#2ecc71",
            padding: "10px",
            borderRadius: "4px",
            textAlign: "center",
            marginBottom: "15px",
          }}
        >
          {message}
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          alignItems: "center",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        {/* Información del usuario seleccionado */}
        {selectedUserData && (
          <div
            style={{
              backgroundColor: "white",
              padding: "15px",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              width: "100%",
              textAlign: "center",
            }}
          >
            <h4 style={{ color: "#2c3e50", margin: "0" }}>
              Usuario seleccionado: {selectedUserData.first_name} {selectedUserData.last_name}
            </h4>
            <p style={{ color: "#7f8c8d", margin: "5px 0 0 0" }}>
              {selectedUserData.username} • {selectedUserData.user_type}
            </p>
          </div>
        )}

        {/* Seleccionar usuario */}
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            width: "100%",
          }}
        >
          <h3 style={{ color: "#2c3e50", marginBottom: "15px" }}>Seleccionar Usuario</h3>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              fontSize: "16px",
            }}
          >
            <option value="">Selecciona un usuario</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.first_name} {u.last_name} ({u.username}) - {u.user_type}
              </option>
            ))}
          </select>
        </div>

        {/* Captura de imagen */}
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            width: "100%",
          }}
        >
          <h3 style={{ color: "#2c3e50", marginBottom: "15px" }}>Capturar o Subir Imagen</h3>

          {/* Vista previa */}
          {preview && (
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <h4 style={{ color: "#2c3e50", marginBottom: "10px" }}>Vista Previa</h4>
              <img
                src={preview}
                alt="Vista previa para registro facial"
                style={{
                  width: "100%",
                  maxWidth: "300px",
                  borderRadius: "8px",
                  border: "2px solid #ddd",
                }}
              />
            </div>
          )}

          {/* Cámara */}
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <h4 style={{ color: "#2c3e50", marginBottom: "10px" }}>Cámara Web</h4>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: "100%",
                maxWidth: "300px",
                borderRadius: "8px",
                border: "2px solid #ddd",
                backgroundColor: "#000",
                display: cameraActive ? "block" : "none",
                margin: "0 auto",
              }}
            />
            
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "15px", flexWrap: "wrap" }}>
              <button
                onClick={startCamera}
                disabled={cameraActive}
                style={{
                  padding: "10px 15px",
                  backgroundColor: cameraActive ? "#95a5a6" : "#3498db",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: cameraActive ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                }}
              >
                {cameraActive ? "Cámara Activa" : "Iniciar Cámara"}
              </button>
              <button
                onClick={captureImage}
                disabled={!cameraActive}
                style={{
                  padding: "10px 15px",
                  backgroundColor: !cameraActive ? "#95a5a6" : "#2ecc71",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: !cameraActive ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                }}
              >
                Capturar Imagen
              </button>
            </div>
          </div>

          {/* Subir archivo */}
          <div style={{ textAlign: "center" }}>
            <h4 style={{ color: "#2c3e50", marginBottom: "10px" }}>O Subir Archivo</h4>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: "12px 20px",
                backgroundColor: "#9b59b6",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              📁 Seleccionar Imagen
            </button>
            <p style={{ color: "#7f8c8d", fontSize: "14px", marginTop: "8px" }}>
              Formatos: JPG, PNG, WEBP • Máx: 5MB
            </p>
          </div>
        </div>

        {/* Botón para enviar */}
        <button
          onClick={handleSubmit}
          disabled={loading || !selectedUser || !image}
          style={{
            padding: "15px 30px",
            backgroundColor: loading ? "#95a5a6" : "#e67e22",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: (loading || !selectedUser || !image) ? "not-allowed" : "pointer",
            opacity: (loading || !selectedUser || !image) ? 0.7 : 1,
            fontWeight: "bold",
            fontSize: "16px",
            minWidth: "200px",
          }}
        >
          {loading ? "⏳ Registrando..." : "✅ Registrar Rostro"}
        </button>
      </div>
    </div>
  );
}