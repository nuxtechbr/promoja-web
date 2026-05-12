import { Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Públicas
import Home from "./pages/Home";
import Login from "./pages/Login";
import CadastroUsuario from "./pages/CadastroUsuario";
import RecuperarSenha from "./pages/RecuperarSenha";
import NovaSenha from "./pages/NovaSenha";
import Perfil from "./pages/Perfil";
import Favoritos from "./pages/Favoritos";
import MeusResgates from "./pages/MeusResgates";
import Ranking from "./pages/Ranking";
import DetalhePromocao from "./pages/DetalhePromocao";
import RestaurantePublico from "./pages/RestaurantePublico";
import Links from "./pages/Links";
import Instalar from "./pages/Instalar";
import PromoKit from "./pages/PromoKit";
import LandingRestaurantes from "./pages/LandingRestaurantes";

// Parceiro
import CadastroRestaurante from "./pages/CadastroRestaurante";
import CriarSenhaParceiro from "./pages/CriarSenhaParceiro";
import LoginParceiro from "./pages/LoginParceiro";
import PainelRestaurante from "./pages/PainelRestaurante";
import NovaPromocao from "./pages/NovaPromocao";
import EditarPromocao from "./pages/EditarPromocao";
import CuponsRestaurante from "./pages/CuponsRestaurante";
import HorariosRestaurante from "./pages/HorariosRestaurante";
import FinanceiroResgates from "./pages/FinanceiroResgates";

// Admin
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";

const Loading = () => (
  <div className="min-h-screen bg-gray-950 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<CadastroUsuario />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route path="/nova-senha" element={<NovaSenha />} />

        <Route path="/perfil" element={<Perfil />} />
        <Route path="/favoritos" element={<Favoritos />} />
        <Route path="/meus-resgates" element={<MeusResgates />} />
        <Route path="/ranking" element={<Ranking />} />

        <Route path="/promocao/:id" element={<DetalhePromocao />} />
        <Route path="/loja/:id" element={<RestaurantePublico />} />

        <Route path="/links" element={<Links />} />
        <Route path="/instalar" element={<Instalar />} />
        <Route path="/promokit" element={<PromoKit />} />

        <Route path="/restaurantes" element={<LandingRestaurantes />} />

        <Route path="/parceiro/cadastro" element={<CadastroRestaurante />} />
        <Route path="/parceiro/criar-senha" element={<CriarSenhaParceiro />} />
        <Route path="/parceiro/login" element={<LoginParceiro />} />

        <Route
          path="/parceiro/painel"
          element={
            <ProtectedRoute allowedRoles={["parceiro"]} redirectTo="/parceiro/login">
              <PainelRestaurante />
            </ProtectedRoute>
          }
        />

        <Route
          path="/parceiro/nova-promocao"
          element={
            <ProtectedRoute allowedRoles={["parceiro"]} redirectTo="/parceiro/login">
              <NovaPromocao />
            </ProtectedRoute>
          }
        />

        <Route
          path="/parceiro/editar-promocao/:id"
          element={
            <ProtectedRoute allowedRoles={["parceiro"]} redirectTo="/parceiro/login">
              <EditarPromocao />
            </ProtectedRoute>
          }
        />

        <Route
          path="/parceiro/cupons"
          element={
            <ProtectedRoute allowedRoles={["parceiro"]} redirectTo="/parceiro/login">
              <CuponsRestaurante />
            </ProtectedRoute>
          }
        />

        <Route
          path="/parceiro/horarios"
          element={
            <ProtectedRoute allowedRoles={["parceiro"]} redirectTo="/parceiro/login">
              <HorariosRestaurante />
            </ProtectedRoute>
          }
        />

        <Route
          path="/parceiro/financeiro-resgates"
          element={
            <ProtectedRoute allowedRoles={["parceiro"]} redirectTo="/parceiro/login">
              <FinanceiroResgates />
            </ProtectedRoute>
          }
        />

        <Route path="/admin-login" element={<AdminLogin />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]} redirectTo="/admin-login">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  );
}