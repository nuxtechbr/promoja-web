import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, Star, Flame, Store, ChevronRight } from "lucide-react";
import { supabase } from "../services/supabase";

export default function Ranking() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  function normalizarStatus(valor) {
    return String(valor || "").toLowerCase();
  }

  function statusAtivo(valor) {
    return ["ativo", "ativa", "aprovado", "aprovada"].includes(
      normalizarStatus(valor)
    );
  }

  function getRestaurantId(item) {
    return item.restaurant_id || item.id;
  }

  function getNota(item) {
    return Number(item.average_rating || 0).toFixed(1);
  }

  async function carregarRanking() {
    setLoading(true);

    const { data, error } = await supabase
      .from("restaurant_ranking")
      .select("*")
      .order("average_rating", { ascending: false });

    if (error) {
      console.error("Erro ao carregar ranking:", error);
      setRanking([]);
      setLoading(false);
      return;
    }

    const idsRanking = (data || [])
      .map((item) => getRestaurantId(item))
      .filter(Boolean);

    if (idsRanking.length === 0) {
      setRanking([]);
      setLoading(false);
      return;
    }

    const { data: restaurantesAtivos, error: restaurantesError } = await supabase
      .from("restaurants")
      .select("id,status")
      .in("id", idsRanking)
      .in("status", ["ativo", "ativa", "aprovado", "aprovada"]);

    if (restaurantesError) {
      console.error("Erro ao validar restaurantes ativos:", restaurantesError);
      setRanking([]);
      setLoading(false);
      return;
    }

    const idsAtivos = new Set(
      (restaurantesAtivos || [])
        .filter((restaurante) => statusAtivo(restaurante.status))
        .map((restaurante) => Number(restaurante.id))
    );

    const rankingFiltrado = (data || []).filter((item) =>
      idsAtivos.has(Number(getRestaurantId(item)))
    );

    setRanking(rankingFiltrado);
    setLoading(false);
  }

  useEffect(() => {
    carregarRanking();
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F5F2] px-4 py-6 pb-24">
      <div className="max-w-xl mx-auto">
        <div className="bg-gradient-to-br from-[#FF5A1F] to-[#ff7a3d] rounded-[2rem] p-6 text-white shadow-xl mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Trophy size={26} />
            </div>

            <div>
              <h1 className="text-2xl font-black">Ranking PromoJá</h1>
              <p className="text-sm text-white/90">
                Restaurantes que estão bombando na cidade
              </p>
            </div>
          </div>

          <p className="text-sm text-white/90">
            Clique em uma loja para ver as promoções disponíveis.
          </p>
        </div>

        {loading && (
          <div className="bg-white rounded-3xl p-6 text-center shadow-sm">
            <p className="font-bold text-zinc-600">Carregando ranking...</p>
          </div>
        )}

        {!loading && ranking.length === 0 && (
          <div className="bg-white rounded-3xl p-6 text-center shadow-sm">
            <Store className="mx-auto mb-3 text-zinc-400" size={32} />

            <p className="font-black text-zinc-700">
              Nenhum restaurante no ranking ainda.
            </p>

            <p className="text-sm text-zinc-500 mt-1">
              Em breve os restaurantes mais movimentados aparecerão aqui.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {ranking.map((item, index) => {
            const restaurantId = getRestaurantId(item);

            return (
              <Link
                key={`${restaurantId}-${index}`}
                to={`/loja/${restaurantId}`}
                className="block bg-white rounded-[1.7rem] p-4 shadow-sm border border-orange-100 active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg ${
                      index === 0
                        ? "bg-[#FF5A1F] text-white"
                        : "bg-[#FFF0E8] text-[#FF5A1F]"
                    }`}
                  >
                    #{index + 1}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="font-black text-[#1C1C1C] leading-tight">
                        {item.restaurant_name || "Restaurante"}
                      </h2>

                      {index === 0 && (
                        <span className="bg-[#FF5A1F] text-white text-[10px] px-2 py-1 rounded-full font-black flex items-center gap-1">
                          <Flame size={12} />
                          TOP
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-2 text-sm">
                      <div className="flex items-center gap-1 text-yellow-500 font-black">
                        <Star size={16} fill="currentColor" />
                        {getNota(item)}
                      </div>

                      <span className="text-zinc-400">•</span>

                      <span className="text-zinc-500 font-bold">
                        {item.total_reviews || 0} avaliações
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 mt-1">
                      Toque para ver promoções dessa loja
                    </p>
                  </div>

                  <ChevronRight className="text-zinc-300" size={22} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}