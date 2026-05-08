import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Store, MapPin, Flame, ArrowLeft } from "lucide-react";
import { supabase } from "../services/supabase";

export default function RestaurantePublico() {
  const { id } = useParams();
  const [restaurante, setRestaurante] = useState(null);
  const [promocoes, setPromocoes] = useState([]);

  function dentroDe24h(data) {
    if (!data) return true;
    return Date.now() - new Date(data).getTime() <= 24 * 60 * 60 * 1000;
  }

  function promocaoEsgotada(promo) {
    const total = Number(promo.quantidade_total || 0);
    const resgatada = Number(promo.quantidade_resgatada || 0);
    return total > 0 && resgatada >= total;
  }

  function promocaoVisivel(promo) {
    if (promo.status !== "Ativa") return false;

    const esgotada = promocaoEsgotada(promo);

    if (esgotada) {
      return dentroDe24h(promo.esgotada_em);
    }

    if (promo.validade && new Date(promo.validade).getTime() <= Date.now()) {
      return dentroDe24h(promo.validade);
    }

    return true;
  }

  async function carregarDados() {
    const { data: rest } = await supabase
      .from("restaurants")
      .select("*")
      .eq("id", id)
      .single();

    setRestaurante(rest);

    const { data: promos } = await supabase
      .from("promotions")
      .select("*")
      .eq("restaurant_id", id)
      .order("id", { ascending: false });

    setPromocoes((promos || []).filter(promocaoVisivel));
  }

  useEffect(() => {
    carregarDados();
  }, []);

  return (
    <main className="min-h-screen bg-[#F7F7F7] pb-10">
      <section className="bg-[#1C1C1C] text-white px-5 pt-6 pb-10 rounded-b-[36px]">
        <Link
          to="/"
          className="bg-white/10 w-11 h-11 rounded-2xl flex items-center justify-center mb-6"
        >
          <ArrowLeft size={22} />
        </Link>

        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-3xl bg-white overflow-hidden flex items-center justify-center">
            {restaurante?.logo_url ? (
              <img
                src={restaurante.logo_url}
                alt={restaurante.nome}
                className="w-full h-full object-cover"
              />
            ) : (
              <Store className="text-[#FF5A1F]" size={36} />
            )}
          </div>

          <div>
            <h1 className="text-3xl font-black">{restaurante?.nome}</h1>
            <p className="text-sm text-zinc-300 flex items-center gap-1 mt-1">
              <MapPin size={14} />
              {restaurante?.bairro} • {restaurante?.cidade}
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="text-[#FF5A1F]" />
          <h2 className="text-xl font-black">Promoções da loja</h2>
        </div>

        <div className="space-y-5">
          {promocoes.length === 0 && (
            <div className="bg-white rounded-3xl p-6 text-center shadow-sm">
              <p className="font-black">Nenhuma promoção disponível agora.</p>
            </div>
          )}

          {promocoes.map((promo) => {
            const esgotada = promocaoEsgotada(promo);

            return (
              <div
                key={promo.id}
                className={`bg-white rounded-[28px] overflow-hidden shadow-sm ${
                  esgotada ? "opacity-60 grayscale" : ""
                }`}
              >
                <div className="relative">
                  <img
                    src={promo.imagem_url}
                    alt={promo.titulo}
                    className="h-44 w-full object-cover"
                  />

                  {esgotada && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="bg-red-600 text-white px-5 py-3 rounded-2xl font-black">
                        ESGOTADA
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-black">{promo.titulo}</h3>

                  <p className="text-sm text-zinc-500 mt-1">
                    {promo.descricao}
                  </p>

                  <div className="flex items-end justify-between mt-4">
                    <div>
                      <p className="text-sm line-through text-zinc-400">
                        R$ {promo.preco_antigo}
                      </p>

                      <p className="text-2xl font-black text-[#FF5A1F]">
                        R$ {promo.preco_promocional}
                      </p>
                    </div>

                    {esgotada ? (
                      <button
                        disabled
                        className="bg-zinc-200 text-zinc-500 px-5 py-3 rounded-2xl font-black text-sm"
                      >
                        Encerrada
                      </button>
                    ) : (
                      <Link
                        to={`/promocao/${promo.id}`}
                        className="bg-[#1C1C1C] text-white px-5 py-3 rounded-2xl font-black text-sm"
                      >
                        Pegar agora
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}