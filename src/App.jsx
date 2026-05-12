import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import HorariosRestaurante from "./pages/HorariosRestaurante";
import Login from "./pages/Login";
import CadastroUsuario from "./pages/CadastroUsuario";
import Perfil from "./pages/Perfil";
import Favoritos from "./pages/Favoritos";
import MeusResgates from "./pages/MeusResgates";
import DetalhePromocao from "./pages/DetalhePromocao";
import CadastroRestaurante from "./pages/CadastroRestaurante";
import PainelRestaurante from "./pages/PainelRestaurante";
import NovaPromocao from "./pages/NovaPromocao";
import AdminDashboard from "./pages/AdminDashboard";
import CuponsRestaurante from "./pages/CuponsRestaurante";
import CriarSenhaParceiro from "./pages/CriarSenhaParceiro";
import LoginParceiro from "./pages/LoginParceiro";
import LandingRestaurantes from "./pages/LandingRestaurantes";
import EditarPromocao from "./pages/EditarPromocao";
import Links from "./pages/Links";
import RestaurantePublico from "./pages/RestaurantePublico";
import PromoKit from "./pages/PromoKit";
import Instalar from "./pages/Instalar";
import Ranking from "./pages/Ranking";
import AdminLogin from "./pages/AdminLogin";
import RecuperarSenha from "./pages/RecuperarSenha";
import NovaSenha from "./pages/NovaSenha";
import FinanceiroResgates from "./pages/FinanceiroResgates";

export default function App() {
  return (
    <BrowserRouter>
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
        <Route path="/parceiro/painel" element={<PainelRestaurante />} />
        <Route path="/parceiro/nova-promocao" element={<NovaPromocao />} />
        <Route path="/parceiro/editar-promocao/:id" element={<EditarPromocao />} />
        <Route path="/parceiro/cupons" element={<CuponsRestaurante />} />
        <Route path="/parceiro/horarios" element={<HorariosRestaurante />} />
        <Route path="/parceiro/financeiro-resgates" element={<FinanceiroResgates />} />

        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin-login" element={<AdminLogin />} />
      </Routes>
    </BrowserRouter>
  );
}