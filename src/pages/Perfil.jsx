import { useEffect, useState } from "react";
import { Mail, LogOut, Ticket, Wallet } from "lucide-react";
import BottomNav from "../components/BottomNav";
import { supabase } from "../services/supabase";

export default function Perfil() {
  const [usuario, setUsuario] = useState(null);
  const [totalResgates, setTotalResgates] = useState(0);

  async function carregarPerfil() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUsuario(user);

    if (user) {
      const { data } = await supabase
        .from("redemptions")
        .select("*")
        .eq("auth_user_id", user.id);

      setTotalResgates(data?.length || 0);
    }
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
      <section className="bg-[#1C1C1C] text-white rounded-[32px] p-6 shadow-xl">
        

        <div className="bg-[#FF5A1F] w-20 h-20 rounded-[28px] flex items-center justify-center mx-auto text-3xl font-black">
          {usuario?.email?.charAt(0).toUpperCase() || "U"}
        </div>

        <h1 className="text-2xl font-black text-center mt-4">
          {usuario?.email?.split("@")[0] || "Usuário"}
        </h1>

        <p className="text-zinc-300 text-center text-sm mt-1 flex items-center justify-center gap-2">
          <Mail size={16} />
          {usuario?.email || "email não encontrado"}
        </p>
      </section>

      <section className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <Ticket className="text-[#FF5A1F]" />
          <p className="text-3xl font-black mt-3">{totalResgates}</p>
          <p className="text-sm text-zinc-500">Resgates</p>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <Wallet className="text-[#FF5A1F]" />
          <p className="text-3xl font-black mt-3">R$ 0</p>
          <p className="text-sm text-zinc-500">Economia</p>
        </div>
      </section>

      <button
        onClick={sair}
        className="mt-6 w-full bg-[#FF5A1F] text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2"
      >
        <LogOut size={20} />
        Sair da conta
      </button>

      <BottomNav />
    </main>
  );
}