import React, { useRef, useState } from 'react';
import { vehicleAPI } from '../api';

const PlateRecognition = () => {
  const fileInputRef = useRef();
  const videoRef = useRef();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');

  // Capturar desde cámara
  const startCamera = async () => {
    try {
      setCameraError('');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment' // Usar cámara trasera si está disponible
        } 
      });
      videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError('No se pudo acceder a la cámara. Asegúrate de permitir el acceso a la cámara.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const captureFromCamera = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    processImage(imageData);
  };

  // Procesar imagen
  const processImage = async (imageData) => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await vehicleAPI.recognizePlate(imageData);
      setResult(response.data);
    } catch (error) {
      console.error('Error recognizing plate:', error);
      alert('Error al procesar la imagen: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido');
        return;
      }

      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen es demasiado grande. Máximo 5MB permitido.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        processImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetAll = () => {
    stopCamera();
    setResult(null);
    setCameraError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Reconocimiento de Placas Vehiculares
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sección de captura */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Capturar Imagen</h3>
            
            {/* Cámara */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={startCamera}
                  disabled={cameraActive}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 transition duration-200"
                >
                  Activar Cámara
                </button>
                <button
                  onClick={stopCamera}
                  disabled={!cameraActive}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400 transition duration-200"
                >
                  Detener Cámara
                </button>
                <button
                  onClick={captureFromCamera}
                  disabled={!cameraActive}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 transition duration-200"
                >
                  Capturar Placa
                </button>
                <button
                  onClick={resetAll}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition duration-200"
                >
                  Reiniciar
                </button>
              </div>
              
              {cameraError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  {cameraError}
                </div>
              )}
              
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-48 bg-gray-200 rounded-lg object-cover"
              />
              {cameraActive && (
                <p className="text-sm text-gray-600 mt-2 text-center">
                  Apunta la cámara hacia la placa del vehículo y haz clic en "Capturar Placa"
                </p>
              )}
            </div>

            {/* Subir archivo */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                O subir imagen desde archivo:
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Formatos soportados: JPG, PNG, WEBP. Máximo 5MB.
              </p>
            </div>
          </div>

          {/* Resultados */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resultado del Reconocimiento</h3>
            
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600 font-medium">Procesando imagen...</p>
                <p className="text-sm text-gray-500">Analizando placa vehicular</p>
              </div>
            )}

            {result && (
              <div className={`p-6 rounded-lg border-2 ${
                result.success 
                  ? (result.access_granted ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50')
                  : 'border-yellow-500 bg-yellow-50'
              }`}>
                {result.success ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xl font-bold text-gray-800">
                        Placa: <span className="font-mono bg-white px-2 py-1 rounded border">{result.plate_number}</span>
                      </h4>
                      <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                        result.access_granted 
                          ? 'bg-green-500 text-white' 
                          : 'bg-red-500 text-white'
                      }`}>
                        {result.access_granted ? '✅ ACCESO PERMITIDO' : '❌ ACCESO DENEGADO'}
                      </span>
                    </div>
                    
                    <div className="space-y-3 text-sm bg-white p-4 rounded border">
                      <div className="flex justify-between">
                        <span className="font-semibold">Confianza:</span>
                        <span className="font-mono">{(result.confidence * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Autorizado en sistema:</span>
                        <span>{result.is_authorized ? '✅ Sí' : '❌ No'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Estado:</span>
                        <span className={result.access_granted ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                          {result.access_granted ? 'Acceso concedido' : 'Acceso bloqueado'}
                        </span>
                      </div>
                      {result.log_id && (
                        <div className="flex justify-between">
                          <span className="font-semibold">ID de registro:</span>
                          <span className="font-mono text-xs">{result.log_id}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-sm text-blue-800">
                        {result.access_granted 
                          ? '✅ El vehículo puede proceder al ingreso.' 
                          : '❌ El vehículo no está autorizado para ingresar.'}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <div className="text-4xl mb-3">🔍</div>
                    <h4 className="text-lg font-semibold text-yellow-800 mb-2">
                      No se pudo reconocer la placa
                    </h4>
                    <p className="text-yellow-700">{result.message}</p>
                    <p className="text-sm text-yellow-600 mt-2">
                      Intenta con una imagen más clara o desde otro ángulo.
                    </p>
                  </div>
                )}
              </div>
            )}

            {!loading && !result && (
              <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-4xl mb-3">📷</div>
                <p className="font-medium">Captura o sube una imagen para reconocer la placa</p>
                <p className="text-sm mt-1">La imagen debe mostrar claramente la placa del vehículo</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlateRecognition;