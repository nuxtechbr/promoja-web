import { useEffect, useState } from "react";
import {
  Ticket,
  CheckCircle,
  Clock,
  User,
  Store,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../services/supabase";

export default function CuponsRestaurante() {
  const [restaurante, setRestaurante] = useState(null);
  const [cupons, setCupons] = useState([]);
  const [carregando, setCarregando] = useState(true);

  async function carregarCupons() {
    setCarregando(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/parceiro/login";
      return;
    }

    const { data: restauranteData, error: restauranteError } = await supabase
      .from("restaurants")
      .select("*")
      .eq("auth_id", user.id)
      .single();

    if (restauranteError || !restauranteData) {
      alert("Este acesso não pertence a um restaurante parceiro.");
      window.location.href = "/parceiro/login";
      return;
    }

    setRestaurante(restauranteData);

    const { data: promocoesData, error: promocoesError } = await supabase
      .from("promotions")
      .select("*")
      .eq("restaurant_id", restauranteData.id);

    if (promocoesError) {
      console.log(promocoesError);
      alert(promocoesError.message);
      setCarregando(false);
      return;
    }

    const idsPromocoes = (promocoesData || []).map((promo) => promo.id);

    if (idsPromocoes.length === 0) {
      setCupons([]);
      setCarregando(false);
      return;
    }

    const { data: redemptionsData, error: redemptionsError } = await supabase
      .from("redemptions")
      .select("*")
      .in("promotion_id", idsPromocoes)
      .order("id", { ascending: false });

    if (redemptionsError) {
      console.log(redemptionsError);
      alert(redemptionsError.message);
      setCarregando(false);
      return;
    }

    const cuponsCompletos = (redemptionsData || []).map((cupom) => {
      const promocao = promocoesData.find(
        (promo) => Number(promo.id) === Number(cupom.promotion_id)
      );

      return {
        ...cupom,
        promocao,
      };
    });

    setCupons(cuponsCompletos);
    setCarregando(false);
  }

  async function confirmarCupom(id) {
    const confirmar = confirm("Confirmar utilização deste cupom?");

    if (!confirmar) return;

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

  async function sair() {
    await supabase.auth.signOut();
    window.location.href = "/parceiro/login";
  }

  useEffect(() => {
    carregarCupons();
  }, []);

  if (carregando) {
    return (
      <main className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <p className="font-black text-[#FF5A1F]">Carregando cupons...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F7F7] px-5 py-6 pb-10">
      <section className="bg-[#1C1C1C] text-white rounded-[32px] p-6 shadow-xl">
        <img
          src="/logo-promoja.png"
          alt="PromoJá"
          className="h-20 object-contain mx-auto mb-4"
        />

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-300">Área do parceiro</p>

            <h1 className="text-3xl font-black mt-1">
              Cupons recebidos
            </h1>

            <p className="text-sm text-zinc-300 mt-2">
              {restaurante?.nome}
            </p>
          </div>

          <button
            onClick={sair}
            className="bg-white/10 w-11 h-11 rounded-2xl flex items-center justify-center"
          >
            <LogOut size={20} />
          </button>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <Ticket className="text-[#FF5A1F]" />
          <p className="text-3xl font-black mt-3">{cupons.length}</p>
          <p className="text-sm text-zinc-500">Cupons</p>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <ShieldCheck className="text-[#FF5A1F]" />
          <p className="text-3xl font-black mt-3">
            {cupons.filter((cupom) => cupom.status === "utilizado").length}
          </p>
          <p className="text-sm text-zinc-500">Utilizados</p>
        </div>
      </section>

      <Link
        to="/parceiro/painel"
        className="mt-6 w-full bg-[#1C1C1C] text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2"
      >
        <Store size={20} />
        Voltar ao painel
      </Link>

      <section className="mt-6 space-y-5">
        {cupons.length === 0 && (
          <div className="bg-white rounded-3xl p-6 text-center shadow-sm">
            <div className="bg-[#FFF3EE] w-16 h-16 rounded-3xl flex items-center justify-center mx-auto">
              <Ticket className="text-[#FF5A1F]" size={30} />
            </div>

            <h2 className="font-black text-xl mt-4">
              Nenhum cupom recebido
            </h2>

            <p className="text-sm text-zinc-500 mt-2">
              Quando clientes resgatarem promoções do seu restaurante, os cupons aparecerão aqui.
            </p>
          </div>
        )}

        {cupons.map((cupom) => (
          <div
            key={cupom.id}
            className="bg-white rounded-[28px] p-5 shadow-sm border border-zinc-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <span
                  className={`text-xs font-black px-3 py-1 rounded-full ${
                    cupom.status === "utilizado"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {cupom.status || "pendente"}
                </span>

                <h2 className="text-2xl font-black mt-3">
                  {cupom.codigo}
                </h2>
              </div>

              <div className="bg-[#FFF3EE] w-14 h-14 rounded-3xl flex items-center justify-center">
                <Ticket className="text-[#FF5A1F]" />
              </div>
            </div>

            <div className="mt-5 bg-[#F7F7F7] rounded-2xl p-4 space-y-2">
              <p className="font-black">
                {cupom.promocao?.titulo || "Promoção"}
              </p>

              <p className="text-sm text-zinc-500 flex items-center gap-2">
                <User size={16} />
                Cliente autenticado
              </p>

              <p className="text-sm text-zinc-500 flex items-center gap-2">
                <Clock size={16} />
                {new Date(cupom.created_at).toLocaleString("pt-BR")}
              </p>
            </div>

            {cupom.status !== "utilizado" && (
              <button
                onClick={() => confirmarCupom(cupom.id)}
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