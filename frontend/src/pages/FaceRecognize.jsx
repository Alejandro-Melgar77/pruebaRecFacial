import { useState, useRef, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

export default function FaceRecognize() {
  const { user } = useContext(AuthContext);
  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const token = localStorage.getItem("access");

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

  // Capturar imagen y enviar al backend
  const recognizeFace = async () => {
    if (!videoRef.current) {
      setError("Cámara no iniciada");
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

      const dataUrl = canvas.toDataURL("image/jpeg");
      setPreview(dataUrl);

      // Convertir imagen a base64
      const base64 = dataUrl.split(",")[1];

      const response = await axios.post(
        "http://localhost:8000/api/auth/face/recognize/",
        { image: base64 },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.user) {
        setMessage(`✅ Rostro reconocido: ${response.data.user.username}`);
      } else {
        setMessage("❌ Rostro no reconocido. Acceso denegado.");
      }
    } catch (err) {
      setError("Error al reconocer rostro");
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
        Reconocimiento Facial en Vivo
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
            color: message.includes("✅") ? "green" : "red",
            textAlign: "center",
            fontSize: "18px",
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
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
            width: "100%",
            maxWidth: "500px",
            textAlign: "center",
          }}
        >
          <h3>Vista de Cámara</h3>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{
              width: "100%",
              maxWidth: "400px",
              borderRadius: "8px",
              border: "1px solid #ddd",
            }}
          />
        </div>

        {/* Botones de control */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={startCamera}
            style={{
              padding: "10px 20px",
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
            onClick={recognizeFace}
            disabled={loading}
            style={{
              padding: "10px 20px",
              backgroundColor: "#2ecc71",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Reconociendo..." : "Reconocer Rostro"}
          </button>

          <button
            onClick={stopCamera}
            style={{
              padding: "10px 20px",
              backgroundColor: "#e74c3c",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
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
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
              width: "100%",
              maxWidth: "500px",
              textAlign: "center",
            }}
          >
            <h3>Imagen Capturada</h3>
            <img
              src={preview}
              alt="Captura facial"
              style={{
                width: "100%",
                maxWidth: "400px",
                borderRadius: "8px",
                border: "1px solid #ddd",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}