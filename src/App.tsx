import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Layouts
import ClienteLayout from "@/components/layout/ClienteLayout";
import BarbeiroLayout from "@/components/layout/BarbeiroLayout";
import AdminLayout from "@/components/layout/AdminLayout";

// Public pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Recover from "./pages/Recover";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

// Cliente pages
import ClienteDashboard from "./pages/cliente/ClienteDashboard";
import ClienteServicos from "./pages/cliente/ClienteServicos";
import ClienteBarbeiros from "./pages/cliente/ClienteBarbeiros";
import ClienteAgendar from "./pages/cliente/ClienteAgendar";
import ClienteHistorico from "./pages/cliente/ClienteHistorico";
import ClienteAvaliar from "./pages/cliente/ClienteAvaliar";
import ClientePerfil from "./pages/cliente/ClientePerfil";

// Barbeiro pages
import BarbeiroDashboard from "./pages/barbeiro/BarbeiroDashboard";
import BarbeiroAgenda from "./pages/barbeiro/BarbeiroAgenda";
import BarbeiroAtendimentoManual from "./pages/barbeiro/BarbeiroAtendimentoManual";
import BarbeiroHistorico from "./pages/barbeiro/BarbeiroHistorico";
import BarbeiroGanhos from "./pages/barbeiro/BarbeiroGanhos";
import BarbeiroPerfil from "./pages/barbeiro/BarbeiroPerfil";

// Admin pages
import AdminAgenda from "./pages/admin/AdminAgenda";
import AdminBarbeiros from "./pages/admin/AdminBarbeiros";
import AdminServicos from "./pages/admin/AdminServicos";
import AdminCategorias from "./pages/admin/AdminCategorias";
import AdminClientes from "./pages/admin/AdminClientes";
import AdminConfiguracoes from "./pages/admin/AdminConfiguracoes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/recover" element={<Recover />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Cliente */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['cliente', 'admin']}>
                  <ClienteLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/cliente/dashboard" element={<ClienteDashboard />} />
              <Route path="/cliente/servicos" element={<ClienteServicos />} />
              <Route path="/cliente/barbeiros" element={<ClienteBarbeiros />} />
              <Route path="/cliente/agendar" element={<ClienteAgendar />} />
              <Route path="/cliente/historico" element={<ClienteHistorico />} />
              <Route path="/cliente/avaliar/:id" element={<ClienteAvaliar />} />
              <Route path="/cliente/perfil" element={<ClientePerfil />} />
            </Route>

            {/* Barbeiro */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['barbeiro', 'admin']}>
                  <BarbeiroLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/barbeiro/dashboard" element={<BarbeiroDashboard />} />
              <Route path="/barbeiro/agenda" element={<BarbeiroAgenda />} />
              <Route path="/barbeiro/atendimento-manual" element={<BarbeiroAtendimentoManual />} />
              <Route path="/barbeiro/historico" element={<BarbeiroHistorico />} />
              <Route path="/barbeiro/ganhos" element={<BarbeiroGanhos />} />
              <Route path="/barbeiro/perfil" element={<BarbeiroPerfil />} />
            </Route>

            {/* Admin */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/admin/agenda" element={<AdminAgenda />} />
              <Route path="/admin/barbeiros" element={<AdminBarbeiros />} />
              <Route path="/admin/servicos" element={<AdminServicos />} />
              <Route path="/admin/categorias" element={<AdminCategorias />} />
              <Route path="/admin/clientes" element={<AdminClientes />} />
              <Route path="/admin/configuracoes" element={<AdminConfiguracoes />} />
            </Route>

            {/* Legacy redirects */}
            <Route path="/cliente/agenda" element={<Navigate to="/cliente/dashboard" replace />} />
            <Route path="/agenda" element={<Navigate to="/cliente/dashboard" replace />} />
            <Route path="/historico" element={<Navigate to="/cliente/historico" replace />} />
            <Route path="/perfil" element={<Navigate to="/cliente/perfil" replace />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
