import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, LogIn } from "lucide-react";
import { supabase } from "../services/supabase";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirect = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function fazerLogin(event) {
    event.preventDefault();

    if (carregando) return;

    setCarregando(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: senha,
    });

    if (error) {
      setCarregando(false);
      alert("E-mail ou senha inválidos.");
      return;
    }

    const user = data.user;

    // ADMIN
    const { data: admin } = await supabase
  .from("admin_users")
  .select("*")
  .or(`auth_id.eq.${user.id},email.eq.${user.email}`)
  .maybeSingle();
  
    if (admin) {
      setCarregando(false);
      navigate("/admin");
      return;
    }

    // PARCEIRO
    const { data: restaurante } = await supabase
      .from("restaurants")
      .select("*")
      .eq("auth_id", user.id)
      .maybeSingle();

    if (restaurante) {
      setCarregando(false);
      navigate("/parceiro/painel");
      return;
    }

    // CLIENTE NORMAL
    setCarregando(false);

    if (redirect) {
      navigate(redirect);
      return;
    }

    navigate("/");
  }

  return (
    <main className="min-h-screen bg-[#F7F7F7] px-5 py-6">
      <Link
        to={redirect || "/"}
        className="bg-white w-11 h-11 rounded-full flex items-center justify-center shadow-sm"
      >
        <ArrowLeft size={22} />
      </Link>

      <section className="mt-8">
        <div className="bg-[#1C1C1C] text-white rounded-[32px] p-6">
          <div className="bg-[#FF5A1F] w-14 h-14 rounded-2xl flex items-center justify-center mb-5">
            <LogIn size={28} />
          </div>

          <h1 className="text-3xl font-black">Entrar</h1>

          <p className="text-zinc-300 mt-2">
            {redirect
              ? "Entre para continuar e resgatar essa promoção."
              : "Acesse sua conta e continue aproveitando promoções."}
          </p>
        </div>

        <form onSubmit={fazerLogin} className="mt-6 space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Seu e-mail"
            className="w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm"
          />

          <div className="relative">
            <input
              type={mostrarSenha ? "text" : "password"}
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Sua senha"
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
            className="w-full bg-[#FF5A1F] text-white py-4 rounded-2xl font-black text-lg disabled:opacity-60"
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>

          <p className="text-center text-sm text-zinc-500">
            Ainda não tem conta?{" "}
            <Link
              to={
                redirect
                  ? `/cadastro?redirect=${encodeURIComponent(redirect)}`
                  : "/cadastro"
              }
              className="font-black text-[#FF5A1F]"
            >
              Criar conta
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}