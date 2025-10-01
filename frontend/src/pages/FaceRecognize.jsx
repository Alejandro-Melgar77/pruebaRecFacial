import { useState, useRef, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { recognizeFace } from "../api";

export default function FaceRecognize() {
  const { user } = useContext(AuthContext);
  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cameraActive, setCameraActive] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Limpiar cámara al desmontar el componente
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

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

  // Capturar imagen y enviar al backend
  const handleRecognizeFace = async () => {
    if (!videoRef.current || !cameraActive) {
      setError("Cámara no iniciada o no disponible");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
      setPreview(dataUrl);

      // Convertir imagen a base64
      const base64 = dataUrl.split(",")[1];

      const response = await recognizeFace(base64);

      if (response.data.user) {
        setMessage(`✅ Rostro reconocido: ${response.data.user.first_name} ${response.data.user.last_name} (${response.data.user.username})`);
      } else {
        setMessage("❌ Rostro no reconocido. Acceso denegado.");
      }
    } catch (err) {
      console.error("Error en reconocimiento facial:", err);
      if (err.response?.data?.error) {
        setError(`Error: ${err.response.data.error}`);
      } else if (err.response?.data?.message) {
        setMessage(`❌ ${err.response.data.message}`);
      } else {
        setError("Error al conectar con el servidor de reconocimiento facial");
      }
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
        Reconocimiento Facial en Vivo
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
            backgroundColor: message.includes("✅") ? "#2ecc71" : "#e74c3c",
            padding: "10px",
            borderRadius: "4px",
            textAlign: "center",
            marginBottom: "15px",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          {message}
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
        }}
      >
        {/* Vista previa de la cámara */}
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            width: "100%",
            maxWidth: "500px",
            textAlign: "center",
          }}
        >
          <h3 style={{ color: "#2c3e50", marginBottom: "15px" }}>Vista de Cámara</h3>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: "100%",
              maxWidth: "400px",
              borderRadius: "8px",
              border: "2px solid #ddd",
              backgroundColor: "#000",
            }}
          />
          <p style={{ color: "#7f8c8d", marginTop: "10px", fontSize: "14px" }}>
            {cameraActive ? "Cámara activa" : "Cámara inactiva"}
          </p>
        </div>

        {/* Botones de control */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
          <button
            onClick={startCamera}
            disabled={cameraActive}
            style={{
              padding: "12px 20px",
              backgroundColor: cameraActive ? "#95a5a6" : "#3498db",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: cameraActive ? "not-allowed" : "pointer",
              fontWeight: "bold",
              minWidth: "140px",
            }}
          >
            {cameraActive ? "Cámara Activa" : "Iniciar Cámara"}
          </button>

          <button
            onClick={handleRecognizeFace}
            disabled={loading || !cameraActive}
            style={{
              padding: "12px 20px",
              backgroundColor: loading ? "#95a5a6" : "#2ecc71",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: (loading || !cameraActive) ? "not-allowed" : "pointer",
              fontWeight: "bold",
              minWidth: "140px",
            }}
          >
            {loading ? "🔍 Reconociendo..." : "👤 Reconocer Rostro"}
          </button>

          <button
            onClick={stopCamera}
            disabled={!cameraActive}
            style={{
              padding: "12px 20px",
              backgroundColor: !cameraActive ? "#95a5a6" : "#e74c3c",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: !cameraActive ? "not-allowed" : "pointer",
              fontWeight: "bold",
              minWidth: "140px",
            }}
          >
            Detener Cámara
          </button>
        </div>

        {/* Vista previa de la imagen capturada */}
        {preview && (
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              width: "100%",
              maxWidth: "500px",
              textAlign: "center",
            }}
          >
            <h3 style={{ color: "#2c3e50", marginBottom: "15px" }}>Imagen Capturada</h3>
            <img
              src={preview}
              alt="Captura facial para reconocimiento"
              style={{
                width: "100%",
                maxWidth: "300px",
                borderRadius: "8px",
                border: "2px solid #ddd",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}