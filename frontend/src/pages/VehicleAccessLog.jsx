import React, { useState, useEffect } from 'react';
import { vehicleAPI } from '../api';

const VehicleAccessLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    plate_number: '',
    start_date: '',
    end_date: '',
    access_type: ''
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await vehicleAPI.getAccessLogs(filters);
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching access logs:', error);
      alert('Error al cargar los registros de acceso');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      plate_number: '',
      start_date: '',
      end_date: '',
      access_type: ''
    });
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getStatusBadge = (accessType, isAuthorized) => {
    if (accessType === 'GRANTED') {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold border border-green-200">
          ✅ PERMITIDO
        </span>
      );
    } else if (accessType === 'DENIED') {
      return (
        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold border border-red-200">
          ❌ DENEGADO
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold border border-yellow-200">
          ⏳ PENDIENTE
        </span>
      );
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600 font-semibold';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Registros de Acceso Vehicular
        </h2>

        {/* Filtros */}
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Filtros de Búsqueda</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Placa
              </label>
              <input
                type="text"
                value={filters.plate_number}
                onChange={(e) => handleFilterChange('plate_number', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: ABC123"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha desde
              </label>
              <input
                type="date"
                value={filters.start_date}
                onChange={(e) => handleFilterChange('start_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha hasta
              </label>
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange('end_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Acceso
              </label>
              <select
                value={filters.access_type}
                onChange={(e) => handleFilterChange('access_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los tipos</option>
                <option value="GRANTED">Acceso Permitido</option>
                <option value="DENIED">Acceso Denegado</option>
                <option value="PENDING">Pendiente</option>
              </select>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <button
              onClick={fetchLogs}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            >
              🔍 Aplicar Filtros
            </button>
            <button
              onClick={clearFilters}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-200"
            >
              🗑️ Limpiar
            </button>
            <button
              onClick={fetchLogs}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
            >
              🔄 Actualizar
            </button>
          </div>
        </div>

        {/* Lista de registros */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Historial de Accesos</h3>
            <span className="text-sm text-gray-600">
              Total: {logs.length} registros
            </span>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Cargando registros...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 border-b text-left font-semibold text-gray-700">Placa</th>
                    <th className="px-4 py-3 border-b text-left font-semibold text-gray-700">Fecha/Hora</th>
                    <th className="px-4 py-3 border-b text-left font-semibold text-gray-700">Confianza</th>
                    <th className="px-4 py-3 border-b text-left font-semibold text-gray-700">Autorizado</th>
                    <th className="px-4 py-3 border-b text-left font-semibold text-gray-700">Acceso</th>
                    <th className="px-4 py-3 border-b text-left font-semibold text-gray-700">Cámara</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition duration-150">
                      <td className="px-4 py-3 border-b font-mono text-sm">
                        {log.plate_number}
                      </td>
                      <td className="px-4 py-3 border-b">
                        <div className="text-sm">
                          {new Date(log.timestamp).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-4 py-3 border-b">
                        <span className={`text-sm ${getConfidenceColor(log.confidence_score)}`}>
                          {(log.confidence_score * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 border-b">
                        {log.is_authorized ? (
                          <span className="text-green-600 font-semibold">✅ Sí</span>
                        ) : (
                          <span className="text-red-600 font-semibold">❌ No</span>
                        )}
                      </td>
                      <td className="px-4 py-3 border-b">
                        {getStatusBadge(log.access_type, log.is_authorized)}
                      </td>
                      <td className="px-4 py-3 border-b text-sm text-gray-600">
                        {log.camera_location || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {logs.length === 0 && (
                <div className="text-center py-12 text-gray-500 border border-gray-200 rounded-lg">
                  <div className="text-4xl mb-3">📊</div>
                  <p className="font-medium">No hay registros de acceso</p>
                  <p className="text-sm mt-1">
                    {Object.values(filters).some(val => val !== '') 
                      ? 'Intenta con otros filtros de búsqueda' 
                      : 'Los registros aparecerán aquí cuando se realicen reconocimientos de placas'
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleAccessLog;