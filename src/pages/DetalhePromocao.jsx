import { useEffect, useState } from "react";
import { ArrowLeft, Clock, MapPin, Ticket } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../services/supabase";

export default function DetalhePromocao() {
  const { id } = useParams();

  const [promocao, setPromocao] = useState(null);
  const [restaurante, setRestaurante] = useState(null);
  const [carregando, setCarregando] = useState(true);

  async function carregarPromocao() {
    const { data, error } = await supabase
      .from("promotions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.log(error);
      alert("Erro ao carregar promoção.");
      setCarregando(false);
      return;
    }

    setPromocao(data);

    const { data: restauranteData, error: restauranteError } = await supabase
      .from("restaurants")
      .select("*")
      .eq("id", data.restaurant_id)
      .single();

    if (restauranteError) {
      console.log(restauranteError);
      alert("Erro ao carregar restaurante.");
      setCarregando(false);
      return;
    }

    setRestaurante(restauranteData);

console.log("PROMOÇÃO:", data);
console.log("RESTAURANTE:", restauranteData);

setCarregando(false);
  }

  async function resgatarPromocao() {
    const codigo = "PROMO-" + Math.floor(1000 + Math.random() * 9000);

    const { error } = await supabase.from("redemptions").insert([
      {
        user_id: 8,
        promotion_id: promocao.id,
        codigo,
        clicou_whatsapp: true,
        created_at: new Date(),
      },
    ]);

    if (error) {
      console.log(error);
      alert(error.message);
      return;
    }

    const mensagem = encodeURIComponent(
      `Olá! Resgatei uma promoção pelo app PromoJá.\n\nPromoção: ${promocao.titulo}\nCódigo: ${codigo}\n\nGostaria de fazer meu pedido.`
    );

    const whatsappRestaurante = restaurante?.whatsapp_comercial;

    if (!whatsappRestaurante) {
      alert("WhatsApp do restaurante não encontrado.");
      return;
    }

    window.location.href = `https://wa.me/55${whatsappRestaurante}?text=${mensagem}`;
  }

  useEffect(() => {
    carregarPromocao();
  }, []);

  if (carregando) {
    return (
      <main className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <p className="font-black text-[#FF5A1F]">Carregando promoção...</p>
      </main>
    );
  }

  if (!promocao) {
    return (
      <main className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <p className="font-black">Promoção não encontrada.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F7F7] pb-10">
      <div className="relative">
        <img
          src={promocao.imagem_url}
          className="h-72 w-full object-cover"
          alt={promocao.titulo}
        />

        <Link
          to="/"
          className="absolute top-5 left-5 bg-white w-11 h-11 rounded-full flex items-center justify-center shadow"
        >
          <ArrowLeft size={22} />
        </Link>
      </div>

      <section className="-mt-8 relative z-10 bg-white rounded-t-[32px] px-5 pt-6 pb-8">
        <span className="text-xs font-black bg-[#FF5A1F] text-white px-3 py-1 rounded-full">
          ⚡ Promoção relâmpago
        </span>

        <h1 className="text-3xl font-black mt-4">{promocao.titulo}</h1>

        <p className="text-zinc-500 flex items-center gap-1 mt-2">
          <MapPin size={16} />
          {restaurante?.nome || "Restaurante"} • {restaurante?.bairro || "Local"}
        </p>

        <div className="mt-5 bg-[#F7F7F7] rounded-2xl p-4 flex items-center gap-3">
          <Clock className="text-[#FF5A1F]" />
          <div>
            <p className="font-black">Válida até {promocao.validade}</p>
            <p className="text-sm text-zinc-500">
              Enquanto durar o estoque da promoção.
            </p>
          </div>
        </div>

        <p className="mt-5 text-zinc-700 leading-relaxed">
          {promocao.descricao}
        </p>

        <div className="mt-6">
          <p className="text-sm line-through text-zinc-400">
            R$ {promocao.preco_antigo}
          </p>
          <p className="text-4xl font-black text-[#FF5A1F]">
            R$ {promocao.preco_promocional}
          </p>
        </div>

        <button
          onClick={resgatarPromocao}
          className="mt-7 w-full bg-[#FF5A1F] text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2"
        >
          <Ticket size={22} />
          Resgatar e chamar no WhatsApp
        </button>

        <p className="text-xs text-zinc-400 text-center mt-3">
          Ao resgatar, você será direcionado ao WhatsApp do restaurante.
        </p>
      </section>
    </main>
  );
}