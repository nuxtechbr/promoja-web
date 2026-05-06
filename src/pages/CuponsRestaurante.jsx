import { useEffect, useState } from "react";
import {
  Ticket,
  CheckCircle,
  Clock,
  User,
} from "lucide-react";
import { supabase } from "../services/supabase";

export default function CuponsRestaurante() {
  const [cupons, setCupons] = useState([]);
  const [carregando, setCarregando] = useState(true);

  async function carregarCupons() {
    setCarregando(true);

    const { data, error } = await supabase
      .from("redemptions")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.log(error);
      alert(error.message);
      return;
    }

    const cuponsCompletos = [];

    for (const cupom of data) {
      const { data: promocao } = await supabase
        .from("promotions")
        .select("*")
        .eq("id", cupom.promotion_id)
        .single();

      cuponsCompletos.push({
        ...cupom,
        promocao,
      });
    }

    setCupons(cuponsCompletos);
    setCarregando(false);
  }

  async function confirmarCupom(id) {
    const { error } = await supabase
      .from("redemptions")
      .update({
        status: "utilizado",
        used_at: new Date(),
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    carregarCupons();
  }

  useEffect(() => {
    carregarCupons();
  }, []);

  return (
    <main className="min-h-screen bg-[#F7F7F7] px-5 py-6 pb-10">
      <section className="bg-[#1C1C1C] text-white rounded-[32px] p-6 shadow-xl">
        <img
          src="/logo-promoja.png"
          alt="PromoJá"
          className="h-20 object-contain mx-auto mb-4"
        />

        <h1 className="text-3xl font-black">
          Cupons recebidos
        </h1>

        <p className="text-sm text-zinc-300 mt-2">
          Valide os cupons enviados pelos clientes.
        </p>
      </section>

      <section className="mt-6 space-y-5">
        {carregando && (
          <div className="bg-white rounded-3xl p-6 text-center">
            Carregando...
          </div>
        )}

        {!carregando &&
          cupons.length === 0 && (
            <div className="bg-white rounded-3xl p-6 text-center">
              Nenhum cupom recebido.
            </div>
          )}

        {cupons.map((cupom) => (
          <div
            key={cupom.id}
            className="bg-white rounded-[28px] p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-black bg-[#FF5A1F] text-white px-3 py-1 rounded-full">
                  {cupom.status}
                </span>

                <h2 className="text-2xl font-black mt-3">
                  {cupom.codigo}
                </h2>
              </div>

              <div className="bg-[#FFF3EE] w-14 h-14 rounded-3xl flex items-center justify-center">
                <Ticket className="text-[#FF5A1F]" />
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <p className="font-black">
                {cupom.promocao?.titulo}
              </p>

              <p className="text-sm text-zinc-500 flex items-center gap-2">
                <User size={16} />
                Cliente autenticado
              </p>

              <p className="text-sm text-zinc-500 flex items-center gap-2">
                <Clock size={16} />
                {new Date(
                  cupom.created_at
                ).toLocaleString()}
              </p>
            </div>

            {cupom.status !== "utilizado" && (
              <button
                onClick={() =>
                  confirmarCupom(cupom.id)
                }
                className="mt-5 w-full bg-green-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2"
              >
                <CheckCircle size={20} />
                Confirmar utilização
              </button>
            )}

            {cupom.status === "utilizado" && (
              <div className="mt-5 bg-[#E8FFF0] text-green-700 py-4 rounded-2xl font-black text-center">
                Cupom utilizado
              </div>
            )}
          </div>
        ))}
      </section>
    </main>
  );
}