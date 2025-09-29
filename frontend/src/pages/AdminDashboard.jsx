export default function AdminDashboard() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Panel de Administración</h1>
      <p>Selecciona una funcionalidad del sistema:</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "15px",
          marginTop: "20px",
        }}
      >
        <button>Gestionar Roles y Permisos</button>
        <button>Gestionar Usuarios</button>
        <button>Gestionar Unidades Habitacionales</button>
        <button>Gestionar Cuotas y Expensas</button>
        <button>Gestionar Multas y Cargos</button>
        <button>Gestionar Comunicados</button>
        <button>Gestión de Mantenimiento</button>
        <button>Gestión de Correspondencia</button>
        <button>Seguridad Informática (IA)</button>
      </div>
    </div>
  );
}
