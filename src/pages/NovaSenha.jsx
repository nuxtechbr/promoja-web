import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { supabase } from "../services/supabase";

export default function NovaSenha() {
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  async function salvarNovaSenha(e) {
    e.preventDefault();

    if (senha.length < 6) {
      alert("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (senha !== confirmarSenha) {
      alert("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: senha,
    });

    setLoading(false);

    if (error) {
      alert("Link inválido ou expirado. Solicite uma nova recuperação.");
      return;
    }

    alert("Senha alterada com sucesso!");
    window.location.href = "/login";
  }

  return (
    <main className="min-h-screen bg-[#F7F7F7] px-5 py-6 flex items-center">
      <section className="w-full">
        <div className="bg-[#1C1C1C] text-white rounded-[32px] p-6">
          <div className="bg-[#FF5A1F] w-16 h-16 rounded-3xl flex items-center justify-center mb-5">
            <Lock size={32} />
          </div>

          <h1 className="text-3xl font-black">Criar nova senha</h1>

          <p className="text-zinc-300 mt-2">
            Digite sua nova senha de acesso.
          </p>
        </div>

        <form onSubmit={salvarNovaSenha} className="mt-6 space-y-4">
          <div className="relative">
            <input
              type={mostrarSenha ? "text" : "password"}
              required
              placeholder="Nova senha"
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

          <div className="relative">
            <input
              type={mostrarConfirmarSenha ? "text" : "password"}
              required
              placeholder="Confirmar nova senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              className="w-full bg-white rounded-2xl px-4 py-4 pr-14 outline-none shadow-sm"
            />

            <button
              type="button"
              onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500"
            >
              {mostrarConfirmarSenha ? <EyeOff size={22} /> : <Eye size={22} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF5A1F] text-white py-4 rounded-2xl font-black text-lg"
          >
            {loading ? "Salvando..." : "Salvar nova senha"}
          </button>
        </form>
      </section>
    </main>
  );
}