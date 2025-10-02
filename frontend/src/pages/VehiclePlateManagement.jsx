import React, { useState, useEffect } from 'react';
import { vehicleAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const VehiclePlateManagement = () => {
  const { user } = useAuth();
  const [plates, setPlates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    plate_number: '',
    vehicle: '',
    unit: ''
  });
  const [vehicles, setVehicles] = useState([]);
  const [units, setUnits] = useState([]);

  const fetchPlates = async () => {
    try {
      setLoading(true);
      const response = await vehicleAPI.getPlates();
      setPlates(response.data);
    } catch (error) {
      console.error('Error fetching plates:', error);
      alert('Error al cargar las placas');
    } finally {
      setLoading(false);
    }
  };

  const fetchVehiclesAndUnits = async () => {
    try {
      // En un caso real, aquí harías llamadas a las APIs de vehicles y units
      // Por ahora simulamos datos de ejemplo
      setVehicles([
        { id: 1, plate_number: 'ABC123', brand: 'Toyota', model: 'Corolla' },
        { id: 2, plate_number: 'XYZ789', brand: 'Honda', model: 'Civic' }
      ]);
      
      setUnits([
        { id: 1, number: '101' },
        { id: 2, number: '102' },
        { id: 3, number: '201' }
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await vehicleAPI.createPlate(formData);
      setFormData({ plate_number: '', vehicle: '', unit: '' });
      fetchPlates();
      alert('Placa registrada exitosamente');
    } catch (error) {
      console.error('Error creating plate:', error);
      alert('Error al registrar la placa: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta placa?')) {
      try {
        await vehicleAPI.deletePlate(id);
        fetchPlates();
        alert('Placa eliminada exitosamente');
      } catch (error) {
        console.error('Error deleting plate:', error);
        alert('Error al eliminar la placa');
      }
    }
  };

  useEffect(() => {
    fetchPlates();
    fetchVehiclesAndUnits();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Gestión de Placas Vehiculares
        </h2>

        {/* Formulario de registro */}
        {user?.user_type === 'admin' && (
          <div className="mb-8 p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Registrar Nueva Placa</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Placa
                </label>
                <input
                  type="text"
                  value={formData.plate_number}
                  onChange={(e) => setFormData({...formData, plate_number: e.target.value.toUpperCase()})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ABC123"
                  required
                  pattern="[A-Z0-9-]{3,10}"
                  title="Formato de placa válido: ABC123, AB123CD, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehículo
                </label>
                <select
                  value={formData.vehicle}
                  onChange={(e) => setFormData({...formData, vehicle: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar vehículo</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.brand} {vehicle.model} - {vehicle.plate_number}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unidad
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar unidad</option>
                  {units.map(unit => (
                    <option key={unit.id} value={unit.id}>
                      Unidad {unit.number}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="md:col-span-3">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                >
                  Registrar Placa
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de placas */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Placas Registradas</h3>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Cargando placas...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 border-b text-left font-semibold">Placa</th>
                    <th className="px-4 py-3 border-b text-left font-semibold">Propietario</th>
                    <th className="px-4 py-3 border-b text-left font-semibold">Unidad</th>
                    <th className="px-4 py-3 border-b text-left font-semibold">Estado</th>
                    {user?.user_type === 'admin' && (
                      <th className="px-4 py-3 border-b text-left font-semibold">Acciones</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {plates.map((plate) => (
                    <tr key={plate.id} className="hover:bg-gray-50 transition duration-150">
                      <td className="px-4 py-3 border-b font-mono text-sm">{plate.plate_number}</td>
                      <td className="px-4 py-3 border-b">{plate.owner?.username || 'N/A'}</td>
                      <td className="px-4 py-3 border-b">{plate.unit?.number || 'N/A'}</td>
                      <td className="px-4 py-3 border-b">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          plate.status === 'AUTHORIZED' 
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : plate.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {plate.status === 'AUTHORIZED' ? 'AUTORIZADO' : 
                           plate.status === 'PENDING' ? 'PENDIENTE' : 'REVOCADO'}
                        </span>
                      </td>
                      {user?.user_type === 'admin' && (
                        <td className="px-4 py-3 border-b">
                          <button
                            onClick={() => handleDelete(plate.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm transition duration-200"
                            title="Eliminar placa"
                          >
                            Eliminar
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {plates.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay placas registradas en el sistema</p>
                  <p className="text-sm mt-1">Usa el formulario arriba para registrar la primera placa</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehiclePlateManagement;