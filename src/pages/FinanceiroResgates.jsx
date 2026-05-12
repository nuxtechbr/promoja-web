import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, Search, Ticket, User, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../services/supabase";

export default function FinanceiroResgates() {
  const [restaurante, setRestaurante] = useState(null);
  const [resgates, setResgates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("hoje");
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().slice(0, 10));
  const [dataFim, setDataFim] = useState(new Date().toISOString().slice(0, 10));

  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function parsePreco(valor) {
    if (!valor) return 0;
    if (typeof valor === "number") return valor;

    const limpo = String(valor)
      .replace("R$", "")
      .replace(/\./g, "")
      .replace(",", ".")
      .trim();

    const numero = Number(limpo);
    return Number.isNaN(numero) ? 0 : numero;
  }

  function periodo() {
    const agora = new Date();
    let inicio = new Date();
    let fim = new Date();

    if (filtro === "hoje") {
      inicio.setHours(0, 0, 0, 0);
      fim.setHours(23, 59, 59, 999);
    }

    if (filtro === "7dias") {
      inicio.setDate(agora.getDate() - 6);
      inicio.setHours(0, 0, 0, 0);
      fim.setHours(23, 59, 59, 999);
    }

    if (filtro === "30dias") {
      inicio.setDate(agora.getDate() - 29);
      inicio.setHours(0, 0, 0, 0);
      fim.setHours(23, 59, 59, 999);
    }

    if (filtro === "personalizado") {
      inicio = new Date(`${dataInicio}T00:00:00`);
      fim = new Date(`${dataFim}T23:59:59`);
    }

    return {
      inicio: inicio.toISOString(),
      fim: fim.toISOString(),
    };
  }

  async function buscarRestaurante(user) {
    const { data: porAuth } = await supabase
      .from("restaurants")
      .select("*")
      .eq("auth_id", user.id)
      .maybeSingle();

    if (porAuth) return porAuth;

    const { data: porEmail } = await supabase
      .from("restaurants")
      .select("*")
      .ilike("email", user.email)
      .maybeSingle();

    return porEmail || null;
  }

  async function carregarDados() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/parceiro/login";
      return;
    }

    const restauranteData = await buscarRestaurante(user);

    if (!restauranteData) {
      alert("Restaurante não encontrado.");
      window.location.href = "/parceiro/login";
      return;
    }

    setRestaurante(restauranteData);

    const { inicio, fim } = periodo();

    const { data: redemptionsData, error } = await supabase
      .from("redemptions")
      .select("*")
      .eq("restaurant_id", restauranteData.id)
      .eq("status", "confirmado")
      .gte("validated_at", inicio)
      .lte("validated_at", fim)
      .order("validated_at", { ascending: false });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const lista = redemptionsData || [];

    const idsPromocoes = [...new Set(lista.map((r) => r.promotion_id).filter(Boolean))];

    let mapaPromocoes = {};

    if (idsPromocoes.length > 0) {
      const { data: promocoesData } = await supabase
        .from("promotions")
        .select("id,titulo,preco_promocional")
        .in("id", idsPromocoes);

      mapaPromocoes = (promocoesData || []).reduce((acc, promo) => {
        acc[promo.id] = promo;
        return acc;
      }, {});
    }

    const completos = lista.map((item) => {
      const promo = mapaPromocoes[item.promotion_id];

      return {
        ...item,
        promocao_titulo: promo?.titulo || "Promoção",
        valor_promocao: parsePreco(promo?.preco_promocional),
      };
    });

    setResgates(completos);
    setLoading(false);
  }

  useEffect(() => {
    carregarDados();
  }, [filtro, dataInicio, dataFim]);

  const resgatesFiltrados = resgates.filter((item) => {
    const termo = busca.toLowerCase();

    return (
      String(item.cliente_nome || "").toLowerCase().includes(termo) ||
      String(item.cliente_email || "").toLowerCase().includes(termo) ||
      String(item.codigo || "").toLowerCase().includes(termo) ||
      String(item.promocao_titulo || "").toLowerCase().includes(termo)
    );
  });

  const total = resgatesFiltrados.reduce(
    (acc, item) => acc + Number(item.valor_promocao || 0),
    0
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F5F2] flex items-center justify-center">
        <p className="font-black text-[#FF5A1F]">Carregando financeiro...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F5F2] px-4 py-6 pb-20">
      <div className="max-w-5xl mx-auto">
        <Link
          to="/parceiro/painel"
          className="bg-white w-12 h-12 rounded-full flex items-center justify-center shadow-sm mb-5"
        >
          <ArrowLeft size={22} />
        </Link>

        <section className="bg-[#1C1C1C] text-white rounded-[2rem] p-6 shadow-xl">
          <p className="text-sm text-zinc-300">Financeiro do parceiro</p>

          <h1 className="text-3xl font-black mt-1">
            Clientes e resgates confirmados
          </h1>

          <p className="text-sm text-zinc-300 mt-2">
            {restaurante?.nome}
          </p>
        </section>

        <section className="grid md:grid-cols-3 gap-3 mt-5">
          <div className="bg-white rounded-[1.5rem] p-5 shadow-sm">
            <DollarSign className="text-[#FF5A1F]" />
            <p className="text-3xl font-black mt-3">{formatarMoeda(total)}</p>
            <p className="text-sm text-zinc-500">Faturamento filtrado</p>
          </div>

          <div className="bg-white rounded-[1.5rem] p-5 shadow-sm">
            <Ticket className="text-[#FF5A1F]" />
            <p className="text-3xl font-black mt-3">{resgatesFiltrados.length}</p>
            <p className="text-sm text-zinc-500">Cupons confirmados</p>
          </div>

          <div className="bg-white rounded-[1.5rem] p-5 shadow-sm">
            <User className="text-[#FF5A1F]" />
            <p className="text-3xl font-black mt-3">
              {
                new Set(
                  resgatesFiltrados.map(
                    (item) => item.cliente_email || item.auth_user_id
                  )
                ).size
              }
            </p>
            <p className="text-sm text-zinc-500">Clientes únicos</p>
          </div>
        </section>

        <section className="bg-white rounded-[2rem] p-5 shadow-sm mt-5">
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
            <button
              onClick={() => setFiltro("hoje")}
              className={`py-3 rounded-2xl font-black ${
                filtro === "hoje" ? "bg-[#FF5A1F] text-white" : "bg-[#F7F5F2]"
              }`}
            >
              Hoje
            </button>

            <button
              onClick={() => setFiltro("7dias")}
              className={`py-3 rounded-2xl font-black ${
                filtro === "7dias" ? "bg-[#FF5A1F] text-white" : "bg-[#F7F5F2]"
              }`}
            >
              7 dias
            </button>

            <button
              onClick={() => setFiltro("30dias")}
              className={`py-3 rounded-2xl font-black ${
                filtro === "30dias" ? "bg-[#FF5A1F] text-white" : "bg-[#F7F5F2]"
              }`}
            >
              30 dias
            </button>

            <button
              onClick={() => setFiltro("personalizado")}
              className={`py-3 rounded-2xl font-black col-span-3 md:col-span-1 ${
                filtro === "personalizado"
                  ? "bg-[#1C1C1C] text-white"
                  : "bg-[#F7F5F2]"
              }`}
            >
              Personalizado
            </button>
          </div>

          {filtro === "personalizado" && (
            <div className="grid md:grid-cols-2 gap-3 mt-4">
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="bg-[#F7F5F2] rounded-2xl px-4 py-4 outline-none font-bold"
              />

              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="bg-[#F7F5F2] rounded-2xl px-4 py-4 outline-none font-bold"
              />
            </div>
          )}

          <div className="mt-4 flex items-center gap-2 bg-[#F7F5F2] rounded-2xl px-4 py-4">
            <Search className="text-zinc-400" size={18} />

            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por cliente, cupom ou promoção..."
              className="bg-transparent outline-none w-full font-bold"
            />
          </div>
        </section>

        <section className="mt-5 space-y-3">
          {resgatesFiltrados.length === 0 && (
            <div className="bg-white rounded-[2rem] p-6 text-center shadow-sm">
              <CalendarDays className="mx-auto text-zinc-400 mb-3" size={32} />

              <p className="font-black text-zinc-700">
                Nenhum resgate confirmado nesse período.
              </p>
            </div>
          )}

          {resgatesFiltrados.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-[1.5rem] p-5 shadow-sm grid md:grid-cols-[1fr_1fr_auto_auto] gap-4 items-center"
            >
              <div>
                <p className="text-xs text-zinc-500 font-bold">Cliente</p>

                <p className="font-black text-[#1C1C1C]">
                  {item.cliente_nome || "Cliente sem nome"}
                </p>

                <p className="text-xs text-zinc-500">
                  {item.cliente_email || "Sem e-mail"}
                </p>
              </div>

              <div>
                <p className="text-xs text-zinc-500 font-bold">Promoção</p>

                <p className="font-black text-[#1C1C1C]">
                  {item.promocao_titulo}
                </p>

                <p className="text-xs text-zinc-500">
                  Cupom: {item.codigo}
                </p>
              </div>

              <div>
                <p className="text-xs text-zinc-500 font-bold">Valor</p>

                <p className="font-black text-[#FF5A1F]">
                  {formatarMoeda(item.valor_promocao)}
                </p>
              </div>

              <div>
                <p className="text-xs text-zinc-500 font-bold">Validado em</p>

                <p className="font-black text-[#1C1C1C]">
                  {item.validated_at
                    ? new Date(item.validated_at).toLocaleString("pt-BR")
                    : "-"}
                </p>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}