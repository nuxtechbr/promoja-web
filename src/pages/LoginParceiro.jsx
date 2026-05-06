import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, ArrowLeft } from "lucide-react";
import { supabase } from "../services/supabase";

export default function LoginParceiro() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar(event) {
    event.preventDefault();
    setCarregando(true);

    const emailFormatado = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailFormatado,
      password: senha,
    });

    if (error) {
      alert("E-mail ou senha inválidos.");
      setCarregando(false);
      return;
    }

    const authId = data.user.id;

    const { data: restaurante, error: restauranteError } = await supabase
      .from("restaurants")
      .select("*")
      .eq("auth_id", authId)
      .single();

    setCarregando(false);

    if (restauranteError || !restaurante) {
      alert("Este login não pertence a um restaurante parceiro.");
      return;
    }

    navigate("/parceiro/painel");
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

          <input
            type="password"
            required
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm"
          />

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