import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Ticket,
  Store,
  Lock,
  CheckCircle,
  Clock3,
  Share2,
  Flame,
} from "lucide-react";
import { supabase } from "../services/supabase";

export default function DetalhePromocao() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState(null);
  const [promocao, setPromocao] = useState(null);
  const [restaurante, setRestaurante] = useState(null);
  const [resgatando, setResgatando] = useState(false);
  const [cupomGerado, setCupomGerado] = useState(null);

  useEffect(() => {
    carregarDados();
  }, [id]);

  async function carregarDados() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUsuario(user || null);

    const { data: promoData, error } = await supabase
      .from("promotions")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !promoData) {
      alert("Promoção não encontrada.");
      navigate("/");
      return;
    }

    setPromocao(promoData);

    if (promoData.restaurant_id) {
      const { data: restauranteData } = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", promoData.restaurant_id)
        .maybeSingle();

      setRestaurante(restauranteData || null);
    }

    if (user) {
      const { data: resgateExistente } = await supabase
        .from("redemptions")
        .select("*")
        .eq("promotion_id", promoData.id)
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (resgateExistente) {
        setCupomGerado(resgateExistente);
      }
    }

    setLoading(false);
  }

  function nomeCliente(user) {
    return (
      user?.user_metadata?.nome ||
      user?.user_metadata?.name ||
      user?.user_metadata?.full_name ||
      user?.email?.split("@")?.[0] ||
      "Cliente"
    );
  }

  function statusNormalizado() {
    return String(promocao?.status || "").toLowerCase();
  }

  function promocaoAtiva() {
    return ["ativa", "ativo", "aprovada", "aprovado"].includes(
      statusNormalizado()
    );
  }

  function promocaoPausada() {
    return ["pausada", "desativada", "inativa"].includes(statusNormalizado());
  }

  function promocaoEsgotada() {
    const total = Number(promocao?.quantidade_total || 0);
    const usadas = Number(promocao?.quantidade_resgatada || 0);

    return total > 0 && usadas >= total;
  }

  function quantidadeRestante() {
    const total = Number(promocao?.quantidade_total || 0);
    const usadas = Number(promocao?.quantidade_resgatada || 0);

    if (!total) return null;

    return Math.max(total - usadas, 0);
  }

  function gerarCodigoCupom() {
    const parte1 = String(promocao?.id || "PROMO");
    const parte2 = Math.random().toString(36).substring(2, 7).toUpperCase();

    return `PROMO-${parte1}${parte2}`;
  }

  function irParaLogin() {
    const redirect = `/promocao/${id}`;
    navigate(`/login?redirect=${encodeURIComponent(redirect)}`);
  }

  async function resgatarCupom() {
    if (!usuario) {
      irParaLogin();
      return;
    }

    if (!promocaoAtiva()) {
      alert("Promoção indisponível.");
      return;
    }

    if (promocaoPausada()) {
      alert("Promoção pausada.");
      return;
    }

    if (promocaoEsgotada()) {
      alert("Promoção esgotada.");
      return;
    }

    if (cupomGerado) {
      alert("Você já resgatou essa promoção.");
      return;
    }

    setResgatando(true);

    const codigo = gerarCodigoCupom();

    const payload = {
      promotion_id: Number(promocao.id),
      restaurant_id: Number(promocao.restaurant_id),
      auth_user_id: usuario.id,
      cliente_nome: nomeCliente(usuario),
      cliente_email: usuario.email || "",
      codigo,
      status: "ativo",
      created_at: new Date().toISOString(),
    };

    const { data: novoCupom, error: erroCupom } = await supabase
      .from("redemptions")
      .insert([payload])
      .select()
      .single();

    if (erroCupom) {
      alert(erroCupom.message);
      setResgatando(false);
      return;
    }

    const novaQuantidade = Number(promocao.quantidade_resgatada || 0) + 1;

    await supabase
      .from("promotions")
      .update({
        quantidade_resgatada: novaQuantidade,
      })
      .eq("id", promocao.id);

    setCupomGerado(novoCupom);

    setPromocao((prev) => ({
      ...prev,
      quantidade_resgatada: novaQuantidade,
    }));

    setResgatando(false);
  }

  async function compartilharPromocao() {
    const link = window.location.href;

    if (navigator.share) {
      await navigator.share({
        title: promocao?.titulo || "PromoJá",
        text: "Olha essa promoção no PromoJá 🔥",
        url: link,
      });

      return;
    }

    await navigator.clipboard.writeText(link);
    alert("Link copiado.");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#111] flex items-center justify-center">
        <p className="text-[#FF5A1F] font-black text-xl">
          Carregando promoção...
        </p>
      </main>
    );
  }

  const restante = quantidadeRestante();

  return (
    <main className="min-h-screen bg-[#111] text-white pb-36">
      <div className="relative h-[420px] overflow-hidden">
        {promocao?.imagem_url ? (
          <img
            src={promocao.imagem_url}
            alt={promocao.titulo}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-[#1C1C1C]" />
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-[#111]" />

        <div className="absolute top-5 left-5 right-5 flex justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-12 h-12 rounded-full bg-black/40 backdrop-blur flex items-center justify-center border border-white/10"
          >
            <ArrowLeft size={22} />
          </button>

          <button
            onClick={compartilharPromocao}
            className="w-12 h-12 rounded-full bg-black/40 backdrop-blur flex items-center justify-center border border-white/10"
          >
            <Share2 size={22} />
          </button>
        </div>
      </div>

      <section className="px-4 -mt-24 relative z-20">
        <div className="bg-[#1A1A1A] border border-white/5 rounded-[36px] p-5 shadow-2xl">
          <div className="flex items-center gap-3">
            {restaurante?.logo_url ? (
              <img
                src={restaurante.logo_url}
                alt={restaurante.nome}
                className="w-16 h-16 rounded-3xl object-cover border border-white/10"
              />
            ) : (
              <div className="w-16 h-16 rounded-3xl bg-[#2A2A2A] flex items-center justify-center">
                <Store className="text-[#FF5A1F]" size={28} />
              </div>
            )}

            <div>
              <p className="font-black text-lg">
                {restaurante?.nome || "Parceiro PromoJá"}
              </p>

              <p className="text-sm text-zinc-400">
                {restaurante?.bairro} • {restaurante?.cidade}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-5">
            <span className="bg-[#FF5A1F] text-white px-4 py-2 rounded-full text-xs font-black flex items-center gap-1">
              <Flame size={14} />
              OFERTA EM ALTA
            </span>

            {promocao.tipo_promocao === "drop" && (
              <span className="bg-red-500 text-white px-4 py-2 rounded-full text-xs font-black">
                DROP
              </span>
            )}

            {promocaoEsgotada() ? (
              <span className="bg-zinc-700 text-white px-4 py-2 rounded-full text-xs font-black">
                ESGOTADA
              </span>
            ) : (
              <span className="bg-green-500 text-white px-4 py-2 rounded-full text-xs font-black">
                DISPONÍVEL
              </span>
            )}
          </div>

          <h1 className="text-4xl font-black mt-6 leading-tight">
            {promocao.titulo}
          </h1>

          <p className="text-zinc-400 mt-4 text-base leading-relaxed">
            {promocao.descricao}
          </p>

          <div className="mt-7 flex items-end justify-between">
            <div>
              <p className="line-through text-zinc-500 text-lg">
                R$ {promocao.preco_antigo}
              </p>

              <h2 className="text-6xl font-black text-[#FF5A1F] leading-none">
                R$ {promocao.preco_promocional}
              </h2>
            </div>

            {restante !== null && (
              <div className="bg-[#111] border border-white/5 px-5 py-4 rounded-3xl text-center">
                <p className="text-xs text-zinc-500">Cupons restantes</p>
                <p className="text-3xl font-black text-white">{restante}</p>
              </div>
            )}
          </div>

          {promocao.validade && (
            <div className="mt-6 bg-[#111] border border-white/5 rounded-3xl p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FF5A1F]/15 flex items-center justify-center">
                <Clock3 className="text-[#FF5A1F]" size={22} />
              </div>

              <div>
                <p className="text-sm font-black">Válida até</p>
                <p className="text-sm text-zinc-400">
                  {new Date(promocao.validade).toLocaleString("pt-BR")}
                </p>
              </div>
            </div>
          )}

          {cupomGerado && (
            <div className="mt-6 bg-green-500/10 border border-green-500/20 rounded-[32px] p-5 text-center">
              <CheckCircle className="mx-auto text-green-400 mb-4" size={42} />

              <p className="font-black text-green-400 text-lg">
                Cupom resgatado
              </p>

              <p className="text-zinc-400 text-sm mt-1">
                Mostre esse código no restaurante
              </p>

              <div className="mt-5 bg-black rounded-2xl py-5 px-4 border border-green-500/20">
                <p className="text-3xl font-black tracking-widest">
                  {cupomGerado.codigo}
                </p>
              </div>
            </div>
          )}
        </div>

        <Link
          to="/"
          className="mt-5 block text-center text-sm font-black text-[#FF5A1F]"
        >
          Ver outras promoções no PromoJá
        </Link>
      </section>

      {!cupomGerado && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/95 to-transparent z-50">
          <button
            onClick={resgatarCupom}
            disabled={
              resgatando ||
              promocaoEsgotada() ||
              promocaoPausada() ||
              !promocaoAtiva()
            }
            className="w-full bg-[#FF5A1F] text-white rounded-3xl py-5 font-black text-lg shadow-[0_0_30px_rgba(255,90,31,0.35)] flex items-center justify-center gap-3 disabled:opacity-60"
          >
            {!usuario ? (
              <>
                <Lock size={22} />
                Entrar para resgatar
              </>
            ) : resgatando ? (
              "Resgatando..."
            ) : promocaoEsgotada() ? (
              "Promoção esgotada"
            ) : promocaoPausada() ? (
              "Promoção pausada"
            ) : (
              <>
                <Ticket size={22} />
                Resgatar cupom
              </>
            )}
          </button>

          {!usuario && (
            <p className="text-center text-xs text-zinc-500 mt-3">
              Você pode visualizar a oferta sem conta, mas precisa entrar para
              resgatar.
            </p>
          )}
        </div>
      )}
    </main>
  );
}