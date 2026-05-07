import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Ticket,
  Flame,
  Store,
  MessageCircle,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../services/supabase";

export default function DetalhePromocao() {
  const { id } = useParams();

  const [promocao, setPromocao] = useState(null);
  const [restaurante, setRestaurante] = useState(null);
  const [carregando, setCarregando] = useState(true);

  function converterPreco(valor) {
    if (!valor) return 0;

    const texto = String(valor).replace("R$", "").trim();

    if (texto.includes(",")) {
      return Number(texto.replace(/\./g, "").replace(",", "."));
    }

    return Number(texto);
  }

  function calcularDesconto() {
    const antigo = converterPreco(promocao?.preco_antigo);
    const novo = converterPreco(promocao?.preco_promocional);

    if (!antigo || !novo || antigo <= novo) return 0;

    return Math.round(((antigo - novo) / antigo) * 100);
  }

  function calcularEconomia() {
    const antigo = converterPreco(promocao?.preco_antigo);
    const novo = converterPreco(promocao?.preco_promocional);

    if (!antigo || !novo || antigo <= novo) return 0;

    return antigo - novo;
  }

  function tempoRestante(validade) {
    const agora = new Date();
    const fim = new Date(validade);
    const diferenca = fim - agora;

    if (diferenca <= 0) return "Expirada";

    const horas = Math.floor(diferenca / (1000 * 60 * 60));
    const minutos = Math.floor((diferenca / (1000 * 60)) % 60);

    if (horas > 0) return `${horas}h ${minutos}min`;

    return `${minutos}min`;
  }

  function cupomEsgotado() {
    const total = Number(promocao?.quantidade_total || 0);
    const resgatada = Number(promocao?.quantidade_resgatada || 0);

    return total > 0 && resgatada >= total;
  }

  function cuponsRestantes() {
    const total = Number(promocao?.quantidade_total || 0);
    const resgatada = Number(promocao?.quantidade_resgatada || 0);

    if (total === 0) return null;

    return Math.max(total - resgatada, 0);
  }

  function limparWhatsapp(numero) {
    if (!numero) return "";

    return String(numero).replace(/\D/g, "");
  }

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
      setRestaurante(null);
      setCarregando(false);
      return;
    }

    setRestaurante(restauranteData);
    setCarregando(false);
  }

  async function resgatarPromocao() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Você precisa estar logado para resgatar.");
      window.location.href = "/login";
      return;
    }

    const whatsappLimpo = limparWhatsapp(restaurante?.whatsapp_comercial);

    if (!whatsappLimpo) {
      alert("WhatsApp do restaurante não encontrado. Tente outra promoção.");
      return;
    }

    const whatsappComPais = whatsappLimpo.startsWith("55")
      ? whatsappLimpo
      : `55${whatsappLimpo}`;

    const total = Number(promocao.quantidade_total || 0);
    const resgatada = Number(promocao.quantidade_resgatada || 0);

    if (total > 0 && resgatada >= total) {
      alert("Essa promoção já foi esgotada.");
      return;
    }

    const inicioDoDia = new Date();
    inicioDoDia.setHours(0, 0, 0, 0);

    const fimDoDia = new Date();
    fimDoDia.setHours(23, 59, 59, 999);

    const { data: resgatesHoje, error: erroResgatesHoje } = await supabase
      .from("redemptions")
      .select("*")
      .eq("auth_user_id", user.id)
      .gte("created_at", inicioDoDia.toISOString())
      .lte("created_at", fimDoDia.toISOString());

    if (erroResgatesHoje) {
      console.log(erroResgatesHoje);
      alert("Erro ao verificar seus resgates.");
      return;
    }

    if (resgatesHoje.length >= 1) {
      alert("Você já resgatou uma promoção hoje. Volte amanhã para pegar outra.");
      return;
    }

    const codigo = "PROMO-" + Math.floor(1000 + Math.random() * 9000);

    const { error } = await supabase.from("redemptions").insert([
      {
        auth_user_id: user.id,
        promotion_id: promocao.id,
        codigo,
        status: "pendente",
        clicou_whatsapp: true,
        created_at: new Date(),
      },
    ]);

    if (error) {
      console.log(error);
      alert(error.message);
      return;
    }

    await supabase
      .from("promotions")
      .update({
        quantidade_resgatada: resgatada + 1,
      })
      .eq("id", promocao.id);

    const mensagem = encodeURIComponent(
      `Olá! Resgatei uma promoção pelo app PromoJá.\n\nPromoção: ${promocao.titulo}\nCódigo: ${codigo}\n\nGostaria de fazer meu pedido.`
    );

    window.location.href = `https://wa.me/${whatsappComPais}?text=${mensagem}`;
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
          className="h-80 w-full object-cover"
          alt={promocao.titulo}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

        <Link
          to="/"
          className="absolute top-5 left-5 bg-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
        >
          <ArrowLeft size={22} />
        </Link>

        <div className="absolute bottom-6 left-5 right-5">
          <span className="inline-flex items-center gap-1 text-xs font-black bg-[#FF5A1F] text-white px-3 py-2 rounded-full">
            <Flame size={14} />
            {calcularDesconto()}% OFF
          </span>

          <h1 className="text-3xl font-black text-white mt-3 leading-tight">
            {promocao.titulo}
          </h1>
        </div>
      </div>

      <section className="-mt-6 relative z-10 bg-white rounded-t-[32px] px-5 pt-6 pb-8">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#F7F7F7] rounded-3xl p-4">
            <Clock className="text-[#FF5A1F]" />
            <p className="text-xs text-zinc-500 mt-2">Termina em</p>
            <p className="font-black text-lg">
              {tempoRestante(promocao.validade)}
            </p>
          </div>

          <div className="bg-[#F7F7F7] rounded-3xl p-4">
            <Ticket className="text-[#FF5A1F]" />
            <p className="text-xs text-zinc-500 mt-2">Você economiza</p>
            <p className="font-black text-lg text-[#FF5A1F]">
              R$ {calcularEconomia().toFixed(2).replace(".", ",")}
            </p>
          </div>
        </div>

        <div className="mt-5 bg-[#1C1C1C] text-white rounded-3xl p-5">
          <p className="text-sm text-zinc-300">Preço promocional</p>

          <div className="flex items-end gap-3 mt-2">
            <p className="text-sm line-through text-zinc-400">
              R$ {promocao.preco_antigo}
            </p>

            <p className="text-4xl font-black text-[#FF5A1F]">
              R$ {promocao.preco_promocional}
            </p>
          </div>
        </div>

        <div className="mt-5 bg-[#F7F7F7] rounded-3xl p-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white shadow-sm border border-zinc-200 flex items-center justify-center">
            {restaurante?.logo_url ? (
              <img
                src={restaurante.logo_url}
                alt={restaurante.nome}
                className="w-full h-full object-cover"
              />
            ) : (
              <Store className="text-[#FF5A1F]" size={28} />
            )}
          </div>

          <div>
            <p className="font-black text-lg">
              {restaurante?.nome || "Restaurante parceiro"}
            </p>

            <p className="text-sm text-zinc-500 flex items-center gap-1 mt-1">
              <MapPin size={14} />
              {restaurante?.bairro || "Local"} • {restaurante?.cidade || "Cidade"}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <h2 className="font-black text-xl">Sobre a promoção</h2>

          <p className="text-zinc-600 leading-relaxed mt-2">
            {promocao.descricao}
          </p>
        </div>

        <div className="mt-5 bg-[#FFF3EE] border border-[#FFD5C7] rounded-3xl p-4">
          <p className="font-black text-[#FF5A1F]">
            {cupomEsgotado()
              ? "Promoção esgotada"
              : `Cupons restantes: ${cuponsRestantes() ?? "Ilimitado"}`}
          </p>

          <p className="text-sm text-zinc-600 mt-1">
            Cada conta pode resgatar 1 promoção por dia no plano gratuito.
          </p>
        </div>

        <button
          onClick={resgatarPromocao}
          disabled={cupomEsgotado()}
          className={`mt-7 w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all ${
            cupomEsgotado()
              ? "bg-zinc-300 text-zinc-500"
              : "bg-[#FF5A1F] text-white"
          }`}
        >
          <MessageCircle size={22} />
          {cupomEsgotado()
            ? "Promoção esgotada"
            : "Resgatar e chamar no WhatsApp"}
        </button>

        <p className="text-xs text-zinc-400 text-center mt-3">
          Ao resgatar, seu cupom será salvo em “Meus Resgates”.
        </p>
      </section>
    </main>
  );
}