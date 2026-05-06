import { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  Store,
  Ticket,
  Users,
  Clock,
} from "lucide-react";
import { supabase } from "../services/supabase";

export default function AdminDashboard() {
  const [promocoesPendentes, setPromocoesPendentes] = useState([]);
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [totalRestaurantes, setTotalRestaurantes] = useState(0);
  const [totalPromocoes, setTotalPromocoes] = useState(0);
  const [totalResgates, setTotalResgates] = useState(0);
  const [carregando, setCarregando] = useState(true);

  async function carregarAdmin() {
    setCarregando(true);

    const { data: clientes } = await supabase.from("clientes").select("*");
    const { data: restaurantes } = await supabase.from("restaurants").select("*");
    const { data: promocoes } = await supabase.from("promotions").select("*");
    const { data: resgates } = await supabase.from("redemptions").select("*");

    const { data: pendentes, error } = await supabase
      .from("promotions")
      .select("*")
      .eq("status", "pendente")
      .order("id", { ascending: false });

    if (error) {
      console.log(error);
      alert(error.message);
    }

    setTotalUsuarios(clientes?.length || 0);
    setTotalRestaurantes(restaurantes?.length || 0);
    setTotalPromocoes(promocoes?.length || 0);
    setTotalResgates(resgates?.length || 0);
    setPromocoesPendentes(pendentes || []);
    setCarregando(false);
  }

  async function aprovarPromocao(id) {
    const { error } = await supabase
      .from("promotions")
      .update({ status: "Ativa" })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Promoção aprovada!");
    carregarAdmin();
  }

  async function recusarPromocao(id) {
    const confirmar = confirm("Tem certeza que deseja recusar essa promoção?");

    if (!confirmar) return;

    const { error } = await supabase
      .from("promotions")
      .update({ status: "recusada" })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Promoção recusada.");
    carregarAdmin();
  }

  useEffect(() => {
    carregarAdmin();
  }, []);

  return (
    <main className="min-h-screen bg-[#F7F7F7] px-5 py-6 pb-10">
      <header className="bg-[#1C1C1C] text-white rounded-[32px] p-6 shadow-xl">
        

        <p className="text-sm text-zinc-300">Admin PromoJá</p>

        <h1 className="text-3xl font-black mt-1">
          Painel de Controle
        </h1>

        <p className="text-sm text-zinc-300 mt-2">
          Aprove ofertas, acompanhe números e controle o app.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <Users className="text-[#FF5A1F]" />
          <p className="text-3xl font-black mt-3">{totalUsuarios}</p>
          <p className="text-sm text-zinc-500">Usuários</p>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <Store className="text-[#FF5A1F]" />
          <p className="text-3xl font-black mt-3">{totalRestaurantes}</p>
          <p className="text-sm text-zinc-500">Restaurantes</p>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <Ticket className="text-[#FF5A1F]" />
          <p className="text-3xl font-black mt-3">{totalPromocoes}</p>
          <p className="text-sm text-zinc-500">Promoções</p>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <CheckCircle className="text-[#FF5A1F]" />
          <p className="text-3xl font-black mt-3">{totalResgates}</p>
          <p className="text-sm text-zinc-500">Resgates</p>
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="text-[#FF5A1F]" />
          <h2 className="text-xl font-black">
            Ofertas aguardando aprovação
          </h2>
        </div>

        {carregando && (
          <div className="bg-white rounded-3xl p-6 text-center shadow-sm">
            <p className="font-black text-[#FF5A1F]">Carregando...</p>
          </div>
        )}

        {!carregando && promocoesPendentes.length === 0 && (
          <div className="bg-white rounded-3xl p-6 text-center shadow-sm">
            <p className="font-black">Nenhuma oferta pendente.</p>
            <p className="text-sm text-zinc-500 mt-1">
              Quando um restaurante enviar uma promoção, ela aparecerá aqui.
            </p>
          </div>
        )}

        <div className="space-y-5">
          {promocoesPendentes.map((promo) => (
            <div
              key={promo.id}
              className="bg-white rounded-[28px] overflow-hidden shadow-sm border border-zinc-100"
            >
              <img
                src={promo.imagem_url}
                alt={promo.titulo}
                className="h-48 w-full object-cover"
              />

              <div className="p-5">
                <span className="text-xs font-black bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                  Pendente
                </span>

                <h3 className="text-xl font-black mt-3">
                  {promo.titulo}
                </h3>

                <p className="text-sm text-zinc-500 mt-1">
                  Categoria: {promo.categoria || "Sem categoria"}
                </p>

                <p className="text-zinc-600 mt-3">
                  {promo.descricao}
                </p>

                <div className="mt-4 bg-[#F7F7F7] rounded-2xl p-4">
                  <p className="text-sm line-through text-zinc-400">
                    R$ {promo.preco_antigo}
                  </p>

                  <p className="text-3xl font-black text-[#FF5A1F]">
                    R$ {promo.preco_promocional}
                  </p>

                  <p className="text-xs text-zinc-500 mt-2">
                    Validade: {promo.validade}
                  </p>
                </div>

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => aprovarPromocao(promo.id)}
                    className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={20} />
                    Aprovar
                  </button>

                  <button
                    onClick={() => recusarPromocao(promo.id)}
                    className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2"
                  >
                    <XCircle size={20} />
                    Recusar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}