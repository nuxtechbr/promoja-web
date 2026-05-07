import { useEffect, useState } from "react";
import { Ticket, Calendar, Hash } from "lucide-react";
import BottomNav from "../components/BottomNav";
import { supabase } from "../services/supabase";

export default function MeusResgates() {
  const [resgates, setResgates] = useState([]);

  async function carregarResgates() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Faça login.");
      window.location.href = "/login";
      return;
    }

    const { data, error } = await supabase
      .from("redemptions")
      .select("*")
      .eq("auth_user_id", user.id)
      .order("id", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setResgates(data);
  }

  useEffect(() => {
    carregarResgates();
  }, []);

  return (
    <main className="min-h-screen bg-[#F7F7F7] px-5 py-6 pb-28">
      <section className="bg-[#1C1C1C] text-white rounded-[32px] p-6 shadow-xl">

        {/* TOPO */}
        <div className="flex items-center justify-between mb-6">
          <img
            src="/logo-promoja.png"
            alt="PromoJá"
            className="h-20 object-contain"
          />

          <span className="text-xs font-bold bg-[#FF5A1F] text-white px-3 py-1 rounded-full">
            PromoJá
          </span>
        </div>

        <h1 className="text-3xl font-black">
          Meus Resgates
        </h1>

        <p className="text-sm text-zinc-300 mt-2">
          Histórico das promoções que você resgatou.
        </p>
      </section>

      <section className="mt-6 space-y-4">
        {resgates.length === 0 && (
          <div className="bg-white rounded-3xl p-6 text-center shadow-sm">

            <div className="bg-[#FFE5DB] w-16 h-16 rounded-3xl flex items-center justify-center mx-auto">
              <Ticket className="text-[#FF5A1F]" size={30} />
            </div>

            <h2 className="font-black text-xl mt-4">
              Nenhum resgate ainda
            </h2>

            <p className="text-sm text-zinc-500 mt-2">
              Quando você resgatar uma promoção, ela aparecerá aqui.
            </p>
          </div>
        )}

        {resgates.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl p-5 shadow-sm border border-zinc-100"
          >
            <div className="flex items-center gap-3">

              <div className="bg-[#FF5A1F] w-14 h-14 rounded-2xl flex items-center justify-center text-white">
                <Ticket size={26} />
              </div>

              <div>
                <p className="text-xs text-zinc-500 font-bold">
                  Cupom resgatado
                </p>

                <p className="font-black text-lg">
                  {item.codigo}
                </p>
              </div>
            </div>

            <div className="mt-4 bg-[#F7F7F7] rounded-2xl p-4 space-y-2">

              <p className="text-sm text-zinc-600 flex items-center gap-2">
                <Hash size={16} className="text-[#FF5A1F]" />
                Promoção ID: {item.promotion_id}
              </p>

              <p className="text-sm text-zinc-600 flex items-center gap-2">
                <Calendar size={16} className="text-[#FF5A1F]" />
                {new Date(item.created_at).toLocaleDateString("pt-BR")}
              </p>

            </div>
          </div>
        ))}
      </section>

      <BottomNav />
    </main>
  );
}