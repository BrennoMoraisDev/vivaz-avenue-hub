const AdminDashboard = () => (
  <div className="container py-8">
    <h1 className="font-heading text-2xl font-bold text-gradient-gold">Painel Admin</h1>
    <p className="mt-2 text-muted-foreground">Gerencie barbeiros, serviços, clientes e agendamentos.</p>
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {['Barbeiros', 'Serviços', 'Categorias', 'Clientes', 'Agenda', 'Configurações'].map((item) => (
        <div key={item} className="rounded-xl border border-border bg-card p-6 text-center transition-colors hover:border-primary/50">
          <h3 className="font-heading font-semibold text-foreground">{item}</h3>
          <p className="mt-1 text-xs text-muted-foreground">Em breve</p>
        </div>
      ))}
    </div>
  </div>
);
export default AdminDashboard;
