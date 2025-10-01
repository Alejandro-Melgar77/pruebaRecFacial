import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import PrivateRoute from './PrivateRoute' // Asegúrate de la ruta correcta
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import RoleManagement from "./pages/RoleManagement";

// Nuevas vistas que ya creamos
import ManageUsers from "./pages/ManageUsers";
import FaceRegister from "./pages/FaceRegister";
import FaceRecognize from "./pages/FaceRecognize";
import SecurityEvents from "./pages/SecurityEvents";
import ManageUnits from "./pages/ManageUnits";
import ManageAreas from "./pages/ManageAreas";
import ReserveArea from "./pages/ReserveArea";
import ViewBills from "./pages/ViewBills";
import RequestMaintenance from "./pages/RequestMaintenance";
import ViewReports from "./pages/ViewReports";
import ViewVisitors from "./pages/ViewVisitors";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rutas privadas */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/roles"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <RoleManagement />
              </PrivateRoute>
            }
          />
          {/* Nuevas rutas */}
          <Route
            path="/manage-users"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <ManageUsers />
              </PrivateRoute>
            }
          />
          <Route
            path="/face-register"
            element={
              <PrivateRoute allowedRoles={["admin", "security"]}>
                <FaceRegister />
              </PrivateRoute>
            }
          />
          <Route
            path="/face-recognize"
            element={
              <PrivateRoute allowedRoles={["admin", "security"]}>
                <FaceRecognize />
              </PrivateRoute>
            }
          />
          <Route
            path="/security-events"
            element={
              <PrivateRoute allowedRoles={["admin", "security"]}>
                <SecurityEvents />
              </PrivateRoute>
            }
          />
          <Route
            path="/manage-units"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <ManageUnits />
              </PrivateRoute>
            }
          />
          <Route
            path="/manage-areas"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <ManageAreas />
              </PrivateRoute>
            }
          />
          <Route
            path="/reserve-area"
            element={
              <PrivateRoute allowedRoles={["resident"]}>
                <ReserveArea />
              </PrivateRoute>
            }
          />
          <Route
            path="/view-bills"
            element={
              <PrivateRoute allowedRoles={["resident"]}>
                <ViewBills />
              </PrivateRoute>
            }
          />
          <Route
            path="/request-maintenance"
            element={
              <PrivateRoute allowedRoles={["resident"]}>
                <RequestMaintenance />
              </PrivateRoute>
            }
          />
          <Route
            path="/view-reports"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <ViewReports />
              </PrivateRoute>
            }
          />
          <Route
            path="/view-visitors"
            element={
              <PrivateRoute allowedRoles={["admin", "security"]}>
                <ViewVisitors />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;