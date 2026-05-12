import { useState } from "react";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { supabase } from "../services/supabase";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  async function entrar(e) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    const emailFormatado = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailFormatado,
      password: senha,
    });

    if (error) {
      setLoading(false);
      alert("E-mail ou senha inválidos.");
      return;
    }

    const user = data.user;

    const { data: admin } = await supabase
      .from("admin_users")
      .select("*")
      .eq("auth_id", user.id)
      .maybeSingle();

    if (admin) {
      setLoading(false);
      window.location.href = "/admin";
      return;
    }

    const { data: restaurante } = await supabase
      .from("restaurants")
      .select("*")
      .eq("auth_id", user.id)
      .maybeSingle();

    await supabase.auth.signOut();
    setLoading(false);

    if (restaurante) {
      alert("Este e-mail pertence a uma conta de parceiro. Use o login do parceiro.");
      window.location.href = "/parceiro/login";
      return;
    }

    alert("Acesso negado. Este usuário não é administrador.");
    window.location.href = "/login";
  }

  return (
    <main className="min-h-screen bg-[#0F0F10] text-white flex items-center justify-center px-5">
      <form
        onSubmit={entrar}
        className="w-full max-w-md bg-[#18181A] border border-white/10 rounded-[32px] p-6 shadow-xl"
      >
        <img
          src="/logo-promoja.png"
          alt="PromoJá"
          className="h-20 object-contain mx-auto mb-6"
        />

        <div className="bg-[#FF5A1F] w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-5">
          <ShieldCheck size={32} />
        </div>

        <h1 className="text-3xl font-black text-center">Admin PromoJá</h1>

        <p className="text-zinc-400 text-sm text-center mt-2 mb-6">
          Acesso exclusivo da administração.
        </p>

        <label className="text-sm font-bold">E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mt-2 mb-4 bg-[#0F0F10] border border-white/10 rounded-2xl px-4 py-4 outline-none focus:border-[#FF5A1F]"
          required
        />

        <label className="text-sm font-bold">Senha</label>

        <div className="relative mt-2 mb-3">
          <input
            type={mostrarSenha ? "text" : "password"}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full bg-[#0F0F10] border border-white/10 rounded-2xl px-4 py-4 pr-14 outline-none focus:border-[#FF5A1F]"
            required
          />

          <button
            type="button"
            onClick={() => setMostrarSenha(!mostrarSenha)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400"
          >
            {mostrarSenha ? <EyeOff size={22} /> : <Eye size={22} />}
          </button>
        </div>

        <a
          href="/recuperar-senha"
          className="block text-right text-sm font-bold text-[#FF5A1F] mb-5"
        >
          Esqueci minha senha
        </a>

        <button
          disabled={loading}
          className="w-full bg-[#FF5A1F] text-white rounded-2xl py-4 font-black disabled:opacity-60"
        >
          {loading ? "Entrando..." : "Entrar no painel"}
        </button>
      </form>
    </main>
  );
}