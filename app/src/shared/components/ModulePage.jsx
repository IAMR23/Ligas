export function ModulePage({ title, description }) {
  return (
    <main className="content-page">
      <section className="module-header">
        <div>
          <p className="eyebrow">Modulo</p>
          <h1>{title}</h1>
        </div>
        <span className="status-chip">Protegido</span>
      </section>
      <section className="empty-state">
        <h2>{description}</h2>
        <p>Base lista para conectar formularios, tablas y acciones del MVP.</p>
      </section>
    </main>
  );
}
