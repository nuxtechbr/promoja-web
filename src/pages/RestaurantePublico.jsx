import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Flame, Ticket, Store, Clock3 } from "lucide-react";
import { supabase } from "../services/supabase";

export default function RestaurantePublico() {
  const { id } = useParams();

  const [restaurante, setRestaurante] = useState(null);
  const [promocoes, setPromocoes] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [abertoAgora, setAbertoAgora] = useState(false);
  const [loading, setLoading] = useState(true);

  function normalizarStatus(valor) {
    return String(valor || "").toLowerCase();
  }

  function statusAtivo(valor) {
    return ["ativo", "ativa", "aprovado", "aprovada"].includes(
      normalizarStatus(valor)
    );
  }

  function horaParaMinutos(hora) {
    if (!hora) return null;

    const partes = String(hora).slice(0, 5).split(":");
    return Number(partes[0]) * 60 + Number(partes[1]);
  }

  function restauranteAbertoAgora(horariosRestaurante = []) {
    if (!horariosRestaurante || horariosRestaurante.length === 0) return false;

    const agora = new Date();
    const diaAtual = agora.getDay();
    const diaAnterior = diaAtual === 0 ? 6 : diaAtual - 1;
    const minutoAtual = agora.getHours() * 60 + agora.getMinutes();

    const horarioHoje = horariosRestaurante.find(
      (item) => Number(item.dia_semana) === diaAtual && item.ativo === true
    );

    if (horarioHoje) {
      const abre = horaParaMinutos(horarioHoje.abre_em);
      const fecha = horaParaMinutos(horarioHoje.fecha_em);

      if (abre !== null && fecha !== null) {
        if (abre < fecha && minutoAtual >= abre && minutoAtual <= fecha) {
          return true;
        }

        if (abre > fecha && minutoAtual >= abre) {
          return true;
        }
      }
    }

    const horarioOntem = horariosRestaurante.find(
      (item) => Number(item.dia_semana) === diaAnterior && item.ativo === true
    );

    if (horarioOntem) {
      const abreOntem = horaParaMinutos(horarioOntem.abre_em);
      const fechaOntem = horaParaMinutos(horarioOntem.fecha_em);

      if (
        abreOntem !== null &&
        fechaOntem !== null &&
        abreOntem > fechaOntem &&
        minutoAtual <= fechaOntem
      ) {
        return true;
      }
    }

    return false;
  }

  function horarioHojeTexto(horariosRestaurante = []) {
    const hoje = new Date().getDay();

    const horarioHoje = horariosRestaurante.find(
      (item) => Number(item.dia_semana) === hoje && item.ativo === true
    );

    if (!horarioHoje) return "Fechado hoje";

    return `${String(horarioHoje.abre_em).slice(0, 5)} às ${String(
      horarioHoje.fecha_em
    ).slice(0, 5)}`;
  }

  function promocaoEsgotada(promo) {
    const total = Number(promo.quantidade_total || 0);
    const resgatada = Number(promo.quantidade_resgatada || 0);

    return total > 0 && resgatada >= total;
  }

  function promocaoVencida(promo) {
    if (!promo.validade) return false;

    return new Date(promo.validade).getTime() <= Date.now();
  }

  function quantidadeRestante(promo) {
    const total = Number(promo.quantidade_total || 0);
    const resgatada = Number(promo.quantidade_resgatada || 0);

    if (!total) return null;

    return Math.max(total - resgatada, 0);
  }

  function horarioDropValido(promo) {
    if (promo.tipo_promocao !== "drop") return null;
    if (!promo.horario_drop) return null;

    const data = new Date(promo.horario_drop);

    if (Number.isNaN(data.getTime())) return null;

    return data;
  }

  function dropLiberado(promo) {
    if (promo.tipo_promocao !== "drop") return true;

    const horario = horarioDropValido(promo);

    if (!horario) return false;

    return horario.getTime() <= Date.now();
  }

  function textoDrop(promo) {
    const horario = horarioDropValido(promo);

    if (promo.tipo_promocao !== "drop") return null;

    if (!horario) return "⚡ DROP EM BREVE";

    if (dropLiberado(promo)) return "⚡ DROP AO VIVO";

    const hora = horario.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return `⚡ DROP às ${hora}`;
  }

  function statusPromocao(promo) {
    const restantes = quantidadeRestante(promo);

    if (promo.tipo_promocao === "drop") {
      return {
        texto: textoDrop(promo),
        classe: dropLiberado(promo)
          ? "bg-[#FF5A1F] text-white"
          : "bg-purple-600 text-white",
      };
    }

    if (restantes !== null && restantes >= 6 && restantes <= 10) {
      return {
        texto: "🔥 Bombando agora",
        classe: "bg-[#1C1C1C] text-white",
      };
    }

    if (restantes !== null && restantes >= 3 && restantes <= 5) {
      return {
        texto: "⚠️ Últimos cupons",
        classe: "bg-yellow-400 text-[#1C1C1C]",
      };
    }

    if (restantes !== null && restantes >= 1 && restantes <= 2) {
      return {
        texto: "⏳ Acabando AGORA",
        classe: "bg-red-500 text-white",
      };
    }

    return null;
  }

  function frasePromocao(promo) {
    if (promo.tipo_promocao === "drop") {
      return dropLiberado(promo)
        ? "Drop liberado agora. Resgate antes que acabe."
        : "Esse drop será liberado no horário marcado.";
    }

    const restantes = quantidadeRestante(promo);

    if (restantes !== null && restantes <= 2) {
      return "Pouquíssimos cupons disponíveis.";
    }

    if (restantes !== null && restantes <= 5) {
      return "Últimas unidades disponíveis hoje.";
    }

    return "Oferta limitada por tempo determinado.";
  }

  async function carregarDados() {
    setLoading(true);

    const { data: restauranteData, error: restauranteError } = await supabase
      .from("restaurants")
      .select("*")
      .eq("id", Number(id))
      .maybeSingle();

    if (restauranteError || !restauranteData || !statusAtivo(restauranteData.status)) {
      setRestaurante(null);
      setPromocoes([]);
      setLoading(false);
      return;
    }

    setRestaurante(restauranteData);

    const { data: horariosData } = await supabase
      .from("restaurant_hours")
      .select("*")
      .eq("restaurant_id", Number(id));

    const listaHorarios = horariosData || [];

    setHorarios(listaHorarios);
    setAbertoAgora(restauranteAbertoAgora(listaHorarios));

    const { data: promocoesData, error: promocoesError } = await supabase
      .from("promotions")
      .select("*")
      .eq("restaurant_id", Number(id))
      .in("status", ["ativa", "Ativa", "ativo", "aprovada", "aprovado"])
      .order("id", { ascending: false });

    if (promocoesError) {
      console.log(promocoesError);
      setPromocoes([]);
      setLoading(false);
      return;
    }

    const promocoesValidas = (promocoesData || []).filter((promo) => {
      if (!statusAtivo(promo.status)) return false;
      if (promo.ocultar === true) return false;
      if (promocaoVencida(promo)) return false;

      return true;
    });

    setPromocoes(promocoesValidas);
    setLoading(false);
  }

  useEffect(() => {
    carregarDados();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F2] flex items-center justify-center">
        <p className="font-black text-zinc-600">Carregando loja...</p>
      </div>
    );
  }

  if (!restaurante) {
    return (
      <div className="min-h-screen bg-[#F7F5F2] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-6 text-center shadow-sm max-w-sm w-full">
          <Store size={40} className="mx-auto text-zinc-400 mb-3" />

          <h1 className="text-2xl font-black text-[#1C1C1C]">
            Loja não encontrada
          </h1>

          <p className="text-sm text-zinc-500 mt-2">
            Esse restaurante não está disponível no PromoJá.
          </p>

          <Link
            to="/"
            className="mt-5 inline-block bg-[#FF5A1F] text-white px-6 py-3 rounded-2xl font-black"
          >
            Voltar para Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5F2] pb-24">
      <div className="max-w-xl mx-auto">
        <header className="bg-gradient-to-br from-[#FF5A1F] to-[#ff7a3d] px-4 pt-5 pb-10 text-white rounded-b-[2.5rem] shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/"
              className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center"
            >
              <ArrowLeft size={22} />
            </Link>

            <span
              className={`px-4 py-2 rounded-full text-xs font-black flex items-center gap-1 ${
                abertoAgora
                  ? "bg-green-500 text-white"
                  : "bg-[#1C1C1C] text-white"
              }`}
            >
              <Clock3 size={14} />
              {abertoAgora ? "Aberto agora" : "Fechado agora"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {restaurante.logo_url ? (
              <img
                src={restaurante.logo_url}
                alt={restaurante.nome}
                className="w-20 h-20 rounded-3xl object-cover border-4 border-white"
              />
            ) : (
              <div className="w-20 h-20 rounded-3xl bg-white/20 border-4 border-white flex items-center justify-center">
                <Store size={34} />
              </div>
            )}

            <div>
              <h1 className="text-3xl font-black leading-tight">
                {restaurante.nome}
              </h1>

              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="bg-[#1C1C1C] px-3 py-1 rounded-full text-xs font-black flex items-center gap-1">
                  <Flame size={14} />
                  Loja parceira
                </span>

                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1">
                  <Clock3 size={14} />
                  Hoje: {horarioHojeTexto(horarios)}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 -mt-6 relative z-10">
          <div className="bg-white rounded-[2rem] p-5 shadow-lg mb-5">
            <h2 className="text-xl font-black text-[#1C1C1C]">
              Promoções da loja
            </h2>

            <p className="text-sm text-zinc-500 mt-1">
              {abertoAgora
                ? "Resgate o cupom e finalize o pedido pelo WhatsApp."
                : "A loja está fechada agora. As promoções voltam quando ela abrir."}
            </p>
          </div>

          {promocoes.length === 0 && (
            <div className="bg-white rounded-3xl p-6 text-center shadow-sm">
              <p className="font-black text-zinc-700">
                Nenhuma promoção disponível.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {promocoes.map((promo) => {
              const esgotada = promocaoEsgotada(promo);
              const restantes = quantidadeRestante(promo);
              const status = statusPromocao(promo);

              const bloqueada =
                esgotada ||
                !abertoAgora ||
                (promo.tipo_promocao === "drop" && !dropLiberado(promo));

              return (
                <div
                  key={promo.id}
                  className={`bg-white rounded-[2rem] overflow-hidden shadow-sm border border-orange-100 ${
                    !abertoAgora ? "opacity-80" : ""
                  }`}
                >
                  <div className="relative">
                    {status && (
                      <div
                        className={`absolute top-3 left-3 px-3 py-2 rounded-full text-xs font-black z-20 ${status.classe}`}
                      >
                        {status.texto}
                      </div>
                    )}

                    {promo.imagem_url ? (
                      <img
                        src={promo.imagem_url}
                        alt={promo.titulo}
                        className={`w-full h-48 object-cover ${
                          bloqueada ? "grayscale opacity-70" : ""
                        }`}
                      />
                    ) : (
                      <div className="w-full h-48 bg-[#FFF0E8] flex items-center justify-center">
                        <Ticket size={40} className="text-[#FF5A1F]" />
                      </div>
                    )}

                    {bloqueada && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-white text-[#1C1C1C] px-4 py-2 rounded-full font-black text-sm">
                          {esgotada
                            ? "ESGOTADA"
                            : !abertoAgora
                            ? "LOJA FECHADA"
                            : "AGUARDANDO DROP"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="text-2xl font-black text-[#1C1C1C]">
                      {promo.titulo}
                    </h3>

                    <p className="text-sm text-zinc-500 mt-2">
                      {promo.descricao}
                    </p>

                    <p className="text-sm text-zinc-500 mt-3">
                      {frasePromocao(promo)}
                    </p>

                    {restantes !== null && !esgotada && (
                      <div className="mt-4 bg-[#FFF3EE] border border-[#FFD5C7] rounded-2xl p-3">
                        <p className="text-sm font-black text-[#FF5A1F]">
                          {restantes <= 2
                            ? `⏳ Restam apenas ${restantes} cupons`
                            : restantes <= 5
                            ? `⚠️ Últimos ${restantes} cupons disponíveis hoje`
                            : `🔥 Ainda restam ${restantes} cupons disponíveis`}
                        </p>
                      </div>
                    )}

                    <div className="flex items-end gap-3 mt-5">
                      <p className="text-sm line-through text-zinc-400 font-bold">
                        R$ {promo.preco_antigo}
                      </p>

                      <p className="text-3xl font-black text-[#FF5A1F]">
                        R$ {promo.preco_promocional}
                      </p>
                    </div>

                    {bloqueada ? (
                      <button
                        disabled
                        className="mt-5 block w-full bg-zinc-200 text-zinc-500 text-center rounded-2xl py-4 font-black"
                      >
                        {esgotada
                          ? "Encerrada"
                          : !abertoAgora
                          ? "Disponível quando abrir"
                          : "Disponível no horário do drop"}
                      </button>
                    ) : (
                      <Link
                        to={`/promocao/${promo.id}`}
                        className="mt-5 block w-full bg-[#FF5A1F] text-white text-center rounded-2xl py-4 font-black active:scale-95 transition-all"
                      >
                        Resgatar promoção
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}