import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import NovaPromocao from "./pages/NovaPromocao";
import Login from "./pages/Login";
import CadastroUsuario from "./pages/CadastroUsuario";
import CadastroRestaurante from "./pages/CadastroRestaurante";
import PainelRestaurante from "./pages/PainelRestaurante";
import AdminDashboard from "./pages/AdminDashboard";
import DetalhePromocao from "./pages/DetalhePromocao";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/parceiro/nova-promocao" element={<NovaPromocao />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<CadastroUsuario />} />
        <Route path="/parceiro/cadastro" element={<CadastroRestaurante />} />
        <Route path="/parceiro/painel" element={<PainelRestaurante />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/promocao/:id" element={<DetalhePromocao />} />
      </Routes>
    </BrowserRouter>
  );
}