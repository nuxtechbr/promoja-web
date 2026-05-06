import { useEffect, useState } from "react";
import { Heart, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import { supabase } from "../services/supabase";

export default function Favoritos() {
  const [favoritos, setFavoritos] = useState([]);

  async function carregarFavoritos() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Faça login para ver seus favoritos.");
      window.location.href = "/login";
      return;
    }

    const { data, error } = await supabase
      .from("favorites")
      .select("*")
      .eq("auth_user_id", user.id)
      .order("id", { ascending: false });

    if (error) {
      console.log(error);
      alert(error.message);
      return;
    }

    const favoritosComPromocao = [];

    for (const favorito of data) {
      const { data: promocao } = await supabase
        .from("promotions")
        .select("*")
        .eq("id", favorito.promotion_id)
        .single();

      if (promocao) {
        favoritosComPromocao.push({
          ...favorito,
          promocao,
        });
      }
    }

    setFavoritos(favoritosComPromocao);
  }

  useEffect(() => {
    carregarFavoritos();
  }, []);

  return (
    <main className="min-h-screen bg-[#F7F7F7] px-5 py-6 pb-28">
      <section className="bg-[#1C1C1C] text-white rounded-[32px] p-6 shadow-xl">
        <img
          src="/logo-promoja.png"
          alt="PromoJá"
          className="h-20 object-contain mx-auto mb-4"
        />

        <h1 className="text-3xl font-black">Favoritos</h1>

        <p className="text-sm text-zinc-300 mt-2">
          Suas promoções salvas ficam aqui.
        </p>
      </section>

      <section className="mt-6 space-y-5">
        {favoritos.length === 0 && (
          <div className="bg-white rounded-3xl p-6 text-center shadow-sm">
            <div className="bg-[#FFE5DB] w-16 h-16 rounded-3xl flex items-center justify-center mx-auto">
              <Heart className="text-[#FF5A1F]" size={30} />
            </div>

            <h2 className="font-black text-xl mt-4">
              Nenhum favorito ainda
            </h2>

            <p className="text-sm text-zinc-500 mt-2">
              Toque no coração de uma promoção para salvar aqui.
            </p>
          </div>
        )}

        {favoritos.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-[28px] overflow-hidden shadow-sm"
          >
            <img
              src={item.promocao.imagem_url}
              alt={item.promocao.titulo}
              className="h-44 w-full object-cover"
            />

            <div className="p-4">
              <span className="text-xs font-black bg-[#FF5A1F] text-white px-3 py-1 rounded-full">
                ❤️ Favorito
              </span>

              <h3 className="text-lg font-black mt-3">
                {item.promocao.titulo}
              </h3>

              <p className="text-sm text-zinc-500 flex items-center gap-1 mt-1">
                <MapPin size={14} />
                {item.promocao.categoria || "Promoção"}
              </p>

              <div className="flex items-end justify-between mt-4">
                <div>
                  <p className="text-sm line-through text-zinc-400">
                    R$ {item.promocao.preco_antigo}
                  </p>

                  <p className="text-2xl font-black text-[#FF5A1F]">
                    R$ {item.promocao.preco_promocional}
                  </p>
                </div>

                <Link
                  to={`/promocao/${item.promocao.id}`}
                  className="bg-[#1C1C1C] text-white px-5 py-3 rounded-2xl font-black text-sm"
                >
                  Ver
                </Link>
              </div>
            </div>
          </div>
        ))}
      </section>

      <BottomNav />
    </main>
  );
}