import { useEffect, useState } from "react";
import { Trophy, Star } from "lucide-react";
import { supabase } from "../services/supabase";

export default function Ranking() {
  const [ranking, setRanking] = useState([]);

  async function carregarRanking() {
    const { data, error } = await supabase
      .from("restaurant_ranking")
      .select("*");

    if (error) {
      console.error(error);
      return;
    }

    setRanking(data || []);
  }

  useEffect(() => {
    carregarRanking();
  }, []);

  return (
    <main className="min-h-screen bg-[#0F0F10] text-white px-5 py-8">
      <section className="max-w-md mx-auto">

        <div className="flex items-center gap-3 mb-2">
          
          <div className="w-14 h-14 rounded-3xl bg-[#FF5A1F] flex items-center justify-center">
            <Trophy size={28} />
          </div>

          <div>
            <h1 className="text-3xl font-black">
              Ranking PromoJá
            </h1>

            <p className="text-zinc-400 text-sm">
              Restaurantes mais bem avaliados
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {ranking.map((item, index) => (
            <div
              key={item.restaurant_id}
              className="bg-[#18181A] border border-white/10 rounded-[28px] p-4 flex items-center gap-4"
            >
              
              <div className="w-12 h-12 rounded-2xl bg-[#FF5A1F] flex items-center justify-center font-black text-lg shrink-0">
                #{index + 1}
              </div>

              <img
                src={
                  item.logo_url ||
                  "/logo-promoja.png"
                }
                alt={item.restaurant_name}
                className="w-16 h-16 rounded-2xl object-cover bg-white border border-white/10"
              />

              <div className="flex-1">
                
                <h2 className="font-black text-lg leading-tight">
                  {item.restaurant_name}
                </h2>

                <div className="flex items-center gap-2 mt-1">
                  <Star
                    size={16}
                    className="text-[#FF5A1F] fill-[#FF5A1F]"
                  />

                  <p className="text-sm text-zinc-300">
                    {item.average_rating || 0} estrelas
                  </p>
                </div>

                <p className="text-xs text-zinc-500 mt-1">
                  {item.total_reviews} avaliações recebidas
                </p>
              </div>
            </div>
          ))}
        </div>

      </section>
    </main>
  );
}