import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { supabase } from "../services/supabase";

export default function LoginParceiro() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function entrar(event) {
    event.preventDefault();
    setCarregando(true);

    try {
      const emailFormatado = email.trim().toLowerCase();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailFormatado,
        password: senha,
      });

      if (error || !data?.user) {
        alert("E-mail ou senha inválidos.");
        setCarregando(false);
        return;
      }

      const authId = data.user.id;

      const { data: role } = await supabase
        .from("user_roles")
        .select("*")
        .eq("auth_id", authId)
        .maybeSingle();

      if (role?.tipo === "admin") {
        await supabase.auth.signOut();
        alert("Este e-mail pertence à administração. Use o login administrativo.");
        navigate("/admin-login");
        setCarregando(false);
        return;
      }

      if (role?.tipo === "cliente") {
        await supabase.auth.signOut();
        alert("Este e-mail pertence a uma conta de cliente. Use o login do cliente.");
        navigate("/login");
        setCarregando(false);
        return;
      }

      const { data: restaurante, error: restauranteError } = await supabase
        .from("restaurants")
        .select("*")
        .eq("auth_id", authId)
        .maybeSingle();

      if (restauranteError || !restaurante) {
        await supabase.auth.signOut();
        alert("Este acesso é exclusivo para restaurantes parceiros.");
        setCarregando(false);
        return;
      }

      const statusRestaurante = String(restaurante.status || "").toLowerCase();

      const statusPermitidos = ["ativo", "aprovado", "aprovada", "active"];

      if (!statusPermitidos.includes(statusRestaurante)) {
        await supabase.auth.signOut();
        alert(
          "Seu cadastro ainda está em análise. A equipe PromoJá responderá em até 24h."
        );
        setCarregando(false);
        return;
      }

      setCarregando(false);
      navigate("/parceiro/painel");
    } catch (erro) {
      console.log(erro);
      alert("Erro ao entrar. Tente novamente.");
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F7F7] px-5 py-6">
      <Link
        to="/"
        className="bg-white w-11 h-11 rounded-full flex items-center justify-center shadow-sm"
      >
        <ArrowLeft size={22} />
      </Link>

      <section className="mt-8" translate="no">
        <div className="bg-[#1C1C1C] text-white rounded-[32px] p-6 shadow-xl">
          <img
            src="/logo-promoja.png"
            alt="PromoJá"
            className="h-20 object-contain mx-auto mb-4"
          />

          <div className="bg-[#FF5A1F] w-16 h-16 rounded-3xl flex items-center justify-center mb-5">
            <LogIn size={32} />
          </div>

          <h1 className="text-3xl font-black">Login do parceiro</h1>

          <p className="text-sm text-zinc-300 mt-2">
            Acesse o painel do seu restaurante.
          </p>
        </div>

        <form onSubmit={entrar} className="mt-6 space-y-4">
          <input
            type="email"
            required
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value.toLowerCase())}
            className="w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm"
          />

          <div className="relative">
            <input
              type={mostrarSenha ? "text" : "password"}
              required
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full bg-white rounded-2xl px-4 py-4 pr-14 outline-none shadow-sm"
            />

            <button
              type="button"
              onClick={() => setMostrarSenha(!mostrarSenha)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500"
            >
              {mostrarSenha ? <EyeOff size={22} /> : <Eye size={22} />}
            </button>
          </div>

          <Link
            to="/recuperar-senha"
            className="block text-right text-sm font-bold text-[#FF5A1F]"
          >
            Esqueci minha senha
          </Link>

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-[#FF5A1F] text-white py-4 rounded-2xl font-black text-lg shadow-lg"
          >
            {carregando ? "Entrando..." : "Entrar no painel"}
          </button>

          <p className="text-center text-sm text-zinc-500">
            Ainda não cadastrou seu restaurante?{" "}
            <Link
              to="/parceiro/cadastro"
              className="font-black text-[#FF5A1F]"
            >
              Cadastrar agora
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}