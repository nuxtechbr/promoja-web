import { useEffect, useState } from "react";
import { Search, Flame, MapPin } from "lucide-react";
import { supabase } from "../services/supabase";

export default function Home() {

  const [promocoes, setPromocoes] = useState([]);

  async function carregarPromocoes() {

    const { data, error } = await supabase
      .from("promotions")
      .select("*")
      .eq("status", "pendente")
      .order("id", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setPromocoes(data);
  }

  useEffect(() => {
    carregarPromocoes();
  }, []);

  return (
    <main className="min-h-screen bg-[#F7F7F7] pb-10">

      <header className="bg-[#1C1C1C] text-white px-5 pt-8 pb-6 rounded-b-[32px]">

        <div className="flex items-center justify-between">

          <div>
            <h1 className="text-3xl font-black">
              Promo<span className="text-[#FF5A1F]">Já</span>
            </h1>

            <p className="text-sm text-zinc-300 mt-1">
              Promoções relâmpago da sua cidade
            </p>
          </div>

          <div className="bg-[#FF5A1F] w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl">
            %
          </div>

        </div>

        <div className="mt-5 bg-white rounded-2xl px-4 py-3 flex items-center gap-2 text-zinc-700">

          <Search size={18} />

          <input
            placeholder="Buscar promoção..."
            className="outline-none w-full text-sm bg-transparent"
          />

        </div>

      </header>

      <section className="px-5 mt-6">

        <div className="flex items-center gap-2 mb-4">
          <Flame className="text-[#FF5A1F]" />
          <h2 className="font-black text-xl">
            Promoções em alta
          </h2>
        </div>

        <div className="space-y-5">

          {promocoes.map((promo) => (

            <div
              key={promo.id}
              className="bg-white rounded-[28px] overflow-hidden shadow-sm"
            >

              <img
                src={promo.imagem_url}
                className="h-44 w-full object-cover"
                alt={promo.titulo}
              />

              <div className="p-4">

                <span className="text-xs font-black bg-[#FF5A1F] text-white px-3 py-1 rounded-full">
                  🔥 Promoção
                </span>

                <h3 className="text-lg font-black mt-3">
                  {promo.titulo}
                </h3>

                <p className="text-sm text-zinc-500 flex items-center gap-1 mt-1">
                  <MapPin size={14} />
                  PromoJá
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

                  <a
                    href={`/promocao/${promo.id}`}
                    className="bg-[#1C1C1C] text-white px-5 py-3 rounded-2xl font-black text-sm"
                  >
                    Pegar agora
                  </a>

                </div>

              </div>

            </div>

          ))}

        </div>

      </section>

    </main>
  );
}