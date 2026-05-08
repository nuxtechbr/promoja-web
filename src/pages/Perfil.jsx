import { useEffect, useState } from "react";
import { Mail, LogOut, Ticket, Wallet } from "lucide-react";
import BottomNav from "../components/BottomNav";
import { supabase } from "../services/supabase";
import { Link } from "react-router-dom";

export default function Perfil() {
  const [usuario, setUsuario] = useState(null);
  const [totalResgates, setTotalResgates] = useState(0);

  async function carregarPerfil() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setUsuario(null);
      setTotalResgates(0);
      return;
    }

    setUsuario(user);

    const { data } = await supabase
      .from("redemptions")
      .select("*")
      .eq("auth_user_id", user.id);

    setTotalResgates(data?.length || 0);
  }

  async function sair() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  useEffect(() => {
    carregarPerfil();
  }, []);

  return (
    <main className="min-h-screen bg-[#F7F7F7] px-5 py-6 pb-28">

      {/* HEADER */}
      <section className="bg-[#1C1C1C] text-white rounded-[32px] p-6 shadow-xl">

        {/* TOPO */}
        <div className="flex items-center justify-between mb-6">
          <img
            src="/logo-promoja.png"
            alt="PromoJá"
            className="h-20 object-contain"
          />

          <span className="text-xs font-bold bg-[#FF5A1F] text-white px-3 py-1 rounded-full">
            Meu Perfil
          </span>
        </div>

        {/* USUÁRIO LOGADO */}
        {usuario ? (
          <>
            {/* AVATAR */}
            <div className="bg-[#FF5A1F] w-20 h-20 rounded-[28px] flex items-center justify-center mx-auto text-3xl font-black">
              {usuario?.email?.charAt(0).toUpperCase()}
            </div>

            {/* NOME */}
            <h1 className="text-2xl font-black text-center mt-4">
              {usuario?.email?.split("@")[0]}
            </h1>

            {/* EMAIL */}
            <p className="text-zinc-300 text-center text-sm mt-1 flex items-center justify-center gap-2">
              <Mail size={16} />
              {usuario?.email}
            </p>
          </>
        ) : (
          <>
            <div className="bg-[#2A2A2A] w-20 h-20 rounded-[28px] flex items-center justify-center mx-auto text-3xl font-black">
              ?
            </div>

            <h1 className="text-2xl font-black text-center mt-4">
              Você ainda não entrou
            </h1>

            <p className="text-zinc-300 text-center text-sm mt-2">
              Faça login para resgatar promoções e acompanhar seus cupons.
            </p>

            <Link
              to="/login"
              className="mt-6 w-full bg-[#FF5A1F] text-white py-4 rounded-2xl font-black flex items-center justify-center"
            >
              Entrar na minha conta
            </Link>
          </>
        )}
      </section>

      {/* CARDS */}
      <section className="grid grid-cols-2 gap-4 mt-6">

        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <Ticket className="text-[#FF5A1F]" />

          <p className="text-3xl font-black mt-3">
            {usuario ? totalResgates : 0}
          </p>

          <p className="text-sm text-zinc-500">
            Resgates
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <Wallet className="text-[#FF5A1F]" />

          <p className="text-3xl font-black mt-3">
            R$ 0
          </p>

          <p className="text-sm text-zinc-500">
            Economia
          </p>
        </div>

      </section>

      {/* BOTÃO SAIR */}
      {usuario && (
        <button
          onClick={sair}
          className="mt-6 w-full bg-[#FF5A1F] hover:bg-[#e14d17] transition-all duration-300 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg"
        >
          <LogOut size={20} />
          Sair da conta
        </button>
      )}

      <BottomNav />
    </main>
  );
}