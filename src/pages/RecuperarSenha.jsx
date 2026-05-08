import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { supabase } from "../services/supabase";

export default function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function enviarRecuperacao(e) {
    e.preventDefault();
    setCarregando(true);

    const emailFormatado = email.trim().toLowerCase();

    const { error } = await supabase.auth.resetPasswordForEmail(
      emailFormatado,
      {
        redirectTo: "https://usepromoja.com.br/nova-senha",
      }
    );

    setCarregando(false);

    if (error) {
      alert("Não foi possível enviar o e-mail. Tente novamente.");
      return;
    }

    alert("Enviamos um link de recuperação para seu e-mail.");
  }

  return (
    <main className="min-h-screen bg-[#F7F7F7] px-5 py-6">
      <Link
        to="/login"
        className="bg-white w-11 h-11 rounded-full flex items-center justify-center shadow-sm"
      >
        <ArrowLeft size={22} />
      </Link>

      <section className="mt-8">
        <div className="bg-[#1C1C1C] text-white rounded-[32px] p-6">
          <div className="bg-[#FF5A1F] w-16 h-16 rounded-3xl flex items-center justify-center mb-5">
            <Mail size={32} />
          </div>

          <h1 className="text-3xl font-black">Recuperar senha</h1>

          <p className="text-zinc-300 mt-2">
            Digite o e-mail cadastrado para receber o link de recuperação.
          </p>
        </div>

        <form onSubmit={enviarRecuperacao} className="mt-6 space-y-4">
          <input
            type="email"
            required
            placeholder="E-mail cadastrado"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm"
          />

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-[#FF5A1F] text-white py-4 rounded-2xl font-black text-lg"
          >
            {carregando ? "Enviando..." : "Enviar e-mail de recuperação"}
          </button>
        </form>
      </section>
    </main>
  );
}