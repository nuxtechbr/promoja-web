import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
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
import Links from "./pages/Links";
import RestaurantePublico from "./pages/RestaurantePublico";
import PromoKit from "./pages/PromoKit";
import Instalar from "./pages/Instalar";
import Ranking from "./pages/Ranking";
import AdminLogin from "./pages/AdminLogin";
import RecuperarSenha from "./pages/RecuperarSenha";
import NovaSenha from "./pages/NovaSenha";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/parceiro/criar-senha" element={<CriarSenhaParceiro />} />
<Route path="/parceiro/login" element={<LoginParceiro />} />
<Route path="/nova-senha" element={<NovaSenha />} />
<Route path="/admin-login" element={<AdminLogin />} />
<Route path="/recuperar-senha" element={<RecuperarSenha />} />
<Route path="/loja/:id" element={<RestaurantePublico />} />
<Route path="/ranking" element={<Ranking />} />
        <Route path="/login" element={<Login />} />
<Route path="/links" element={<Links />} />
<Route path="/instalar" element={<Instalar />} />
        <Route
  path="/parceiro/cupons"
  element={<CuponsRestaurante />}
/>

        <Route path="/cadastro" element={<CadastroUsuario />} />
        <Route path="/promokit" element={<PromoKit />} />

<Route path="/restaurantes" element={<LandingRestaurantes />} />

        <Route path="/perfil" element={<Perfil />} />

        <Route path="/favoritos" element={<Favoritos />} />

        <Route path="/meus-resgates" element={<MeusResgates />} />

        <Route path="/promocao/:id" element={<DetalhePromocao />} />

        <Route path="/parceiro/cadastro" element={<CadastroRestaurante />} />

        <Route path="/parceiro/painel" element={<PainelRestaurante />} />

        <Route path="/parceiro/nova-promocao" element={<NovaPromocao />} />

        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}