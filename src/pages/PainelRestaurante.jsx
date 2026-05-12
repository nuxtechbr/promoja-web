import { useEffect, useState } from "react";
import {
  Plus,
  Clock3,
  Ticket,
  Eye,
  Copy,
  Trash2,
  Edit,
  LogOut,
  Store,
  Flame,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Camera,
  PauseCircle,
  PlayCircle,
  Ban,
  DollarSign,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../services/supabase";

export default function PainelRestaurante() {
  const [restaurante, setRestaurante] = useState(null);
  const [promocoes, setPromocoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);
  const [enviandoLogo, setEnviandoLogo] = useState(false);
  const [nomeRestaurante, setNomeRestaurante] = useState("");

  const [filtroFinanceiro, setFiltroFinanceiro] = useState("hoje");
  const [dataInicio, setDataInicio] = useState(formatarDataInput(new Date()));
  const [dataFim, setDataFim] = useState(formatarDataInput(new Date()));
  const [loadingFinanceiro, setLoadingFinanceiro] = useState(false);
  const [financeiro, setFinanceiro] = useState({
    faturamento: 0,
    cuponsConfirmados: 0,
    clientes: 0,
    promocaoMaisResgatada: "Nenhuma ainda",
  });

  function formatarDataInput(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
  }

  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function parsePreco(valor) {
    if (valor === null || valor === undefined) return 0;
    if (typeof valor === "number") return valor;

    const limpo = String(valor)
      .replace("R$", "")
      .replace(/\./g, "")
      .replace(",", ".")
      .trim();

    const numero = Number(limpo);
    return Number.isNaN(numero) ? 0 : numero;
  }

  function periodoFinanceiro() {
    const agora = new Date();
    let inicio = new Date();
    let fim = new Date();

    if (filtroFinanceiro === "hoje") {
      inicio.setHours(0, 0, 0, 0);
      fim.setHours(23, 59, 59, 999);
    }

    if (filtroFinanceiro === "7dias") {
      inicio.setDate(agora.getDate() - 6);
      inicio.setHours(0, 0, 0, 0);
      fim.setHours(23, 59, 59, 999);
    }

    if (filtroFinanceiro === "30dias") {
      inicio.setDate(agora.getDate() - 29);
      inicio.setHours(0, 0, 0, 0);
      fim.setHours(23, 59, 59, 999);
    }

    if (filtroFinanceiro === "personalizado") {
      inicio = new Date(`${dataInicio}T00:00:00`);
      fim = new Date(`${dataFim}T23:59:59`);
    }

    return {
      inicio: inicio.toISOString(),
      fim: fim.toISOString(),
    };
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

    let { data: restauranteData } = await supabase
      .from("restaurants")
      .select("*")
      .eq("auth_id", user.id)
      .maybeSingle();

    if (!restauranteData) {
      const { data: porEmail } = await supabase
        .from("restaurants")
        .select("*")
        .ilike("email", user.email)
        .maybeSingle();

      restauranteData = porEmail;
    }

    if (!restauranteData) {
      alert("Restaurante não encontrado.");
      window.location.href = "/parceiro/login";
      return;
    }

    setRestaurante(restauranteData);
    setNomeRestaurante(restauranteData.nome || "");

    const { data: promocoesData, error } = await supabase
      .from("promotions")
      .select("*")
      .eq("restaurant_id", restauranteData.id)
      .order("id", { ascending: false });

    if (error) console.log(error);

    setPromocoes(promocoesData || []);
    setLoading(false);
  }

  async function carregarFinanceiro(restauranteAtual) {
    if (!restauranteAtual) return;

    setLoadingFinanceiro(true);

    const { inicio, fim } = periodoFinanceiro();

    const statusConfirmados = [
      "confirmado",
      "confirmada",
      "Confirmado",
      "Confirmada",
      "validado",
      "validada",
      "Validado",
      "Validada",
      "usado",
      "usada",
      "Usado",
      "Usada",
    ];

    const { data: resgates, error } = await supabase
      .from("redemptions")
      .select("*")
      .eq("restaurant_id", restauranteAtual.id)
      .in("status", statusConfirmados)
      .gte("created_at", inicio)
      .lte("created_at", fim)
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      setFinanceiro({
        faturamento: 0,
        cuponsConfirmados: 0,
        clientes: 0,
        promocaoMaisResgatada: "Nenhuma ainda",
      });
      setLoadingFinanceiro(false);
      return;
    }

    const listaResgates = resgates || [];

    const idsPromocoes = [
      ...new Set(listaResgates.map((r) => r.promotion_id).filter(Boolean)),
    ];

    let mapaPromocoes = {};

    if (idsPromocoes.length > 0) {
      const { data: promocoesFinanceiro } = await supabase
        .from("promotions")
        .select("id,titulo,preco_promocional")
        .in("id", idsPromocoes);

      mapaPromocoes = (promocoesFinanceiro || []).reduce((acc, promo) => {
        acc[promo.id] = promo;
        return acc;
      }, {});
    }

    const resgatesComDados = listaResgates.map((resgate) => {
      const promo = mapaPromocoes[resgate.promotion_id];

      return {
        ...resgate,
        promocao_titulo: promo?.titulo || "Promoção",
        valor_promocao: parsePreco(promo?.preco_promocional),
      };
    });

    const faturamento = resgatesComDados.reduce(
      (acc, item) => acc + Number(item.valor_promocao || 0),
      0
    );

    const clientesUnicos = new Set(
      resgatesComDados.map(
        (item) => item.cliente_email || item.auth_user_id || item.cliente_nome
      )
    );

    const contadorPromocoes = {};

    resgatesComDados.forEach((item) => {
      const nome = item.promocao_titulo || "Promoção";
      contadorPromocoes[nome] = (contadorPromocoes[nome] || 0) + 1;
    });

    const promocaoMaisResgatada =
      Object.entries(contadorPromocoes).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      "Nenhuma ainda";

    setFinanceiro({
      faturamento,
      cuponsConfirmados: resgatesComDados.length,
      clientes: clientesUnicos.size,
      promocaoMaisResgatada,
    });

    setLoadingFinanceiro(false);
  }

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    if (restaurante) carregarFinanceiro(restaurante);
  }, [restaurante, filtroFinanceiro, dataInicio, dataFim]);

  function quantidadeRestante(promo) {
    const total = Number(promo.quantidade_total || 0);
    const resgatada = Number(promo.quantidade_resgatada || 0);

    if (!total) return null;

    return Math.max(total - resgatada, 0);
  }

  function promocaoEsgotada(promo) {
    const total = Number(promo.quantidade_total || 0);
    const resgatada = Number(promo.quantidade_resgatada || 0);

    return total > 0 && resgatada >= total;
  }

  function statusNormalizado(promo) {
    return String(promo.status || "").toLowerCase();
  }

  function statusBadge(promo) {
    const status = statusNormalizado(promo);

    if (status === "pendente") {
      return {
        texto: "⏳ Em análise",
        classe: "bg-yellow-100 text-yellow-700",
      };
    }

    if (status === "recusada" || status === "recusado") {
      return {
        texto: "❌ Recusada",
        classe: "bg-red-100 text-red-700",
      };
    }

    if (status === "desativada" || status === "inativa" || status === "pausada") {
      return {
        texto: "⏸️ Pausada",
        classe: "bg-zinc-200 text-zinc-700",
      };
    }

    if (status === "encerrada") {
      return {
        texto: "🔒 Encerrada",
        classe: "bg-zinc-900 text-white",
      };
    }

    if (promocaoEsgotada(promo)) {
      return {
        texto: "🎟️ Esgotada",
        classe: "bg-zinc-900 text-white",
      };
    }

    if (promo.tipo_promocao === "drop") {
      return {
        texto: "⚡ Drop ativo",
        classe: "bg-[#FF5A1F] text-white",
      };
    }

    return {
      texto: "✅ Ativa",
      classe: "bg-green-100 text-green-700",
    };
  }

  function botaoStatus(promo) {
    const status = statusNormalizado(promo);

    if (status === "pendente") {
      return {
        texto: "Em análise",
        icon: <Clock3 size={16} />,
        classe: "bg-yellow-50 text-yellow-700 cursor-not-allowed",
        bloqueado: true,
      };
    }

    if (status === "recusada" || status === "recusado") {
      return {
        texto: "Recusada",
        icon: <Ban size={16} />,
        classe: "bg-red-50 text-red-600 cursor-not-allowed",
        bloqueado: true,
      };
    }

    if (status === "encerrada" || promocaoEsgotada(promo)) {
      return {
        texto: "Encerrada",
        icon: <Ban size={16} />,
        classe: "bg-zinc-100 text-zinc-500 cursor-not-allowed",
        bloqueado: true,
      };
    }

    if (status === "desativada" || status === "inativa" || status === "pausada") {
      return {
        texto: "Reativar",
        icon: <PlayCircle size={16} />,
        classe: "bg-green-50 text-green-700",
        bloqueado: false,
      };
    }

    return {
      texto: "Pausar",
      icon: <PauseCircle size={16} />,
      classe: "bg-orange-50 text-[#FF5A1F]",
      bloqueado: false,
    };
  }

  async function salvarPerfil() {
    if (!restaurante) return;

    if (!nomeRestaurante.trim()) {
      alert("Informe o nome do restaurante.");
      return;
    }

    setSalvandoPerfil(true);

    const { error } = await supabase
      .from("restaurants")
      .update({
        nome: nomeRestaurante.trim(),
      })
      .eq("id", restaurante.id);

    if (error) {
      alert(error.message);
      setSalvandoPerfil(false);
      return;
    }

    alert("Perfil salvo com sucesso.");
    setSalvandoPerfil(false);
    carregarDados();
  }

  async function uploadLogoRestaurante(e) {
    const file = e.target.files?.[0];
    if (!file || !restaurante) return;

    setEnviandoLogo(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `restaurante-${restaurante.id}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("restaurants")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      alert(uploadError.message);
      setEnviandoLogo(false);
      return;
    }

    const { data } = supabase.storage.from("restaurants").getPublicUrl(fileName);

    const { error } = await supabase
      .from("restaurants")
      .update({
        logo_url: data.publicUrl,
      })
      .eq("id", restaurante.id);

    if (error) {
      alert(error.message);
      setEnviandoLogo(false);
      return;
    }

    alert("Foto da loja atualizada.");
    setEnviandoLogo(false);
    carregarDados();
  }

  async function alternarStatusPromocao(promo) {
    const status = statusNormalizado(promo);

    if (status === "pendente") {
      alert("Essa promoção ainda está em análise.");
      return;
    }

    if (status === "recusada" || status === "recusado") {
      alert("Essa promoção foi recusada e não pode ser reativada.");
      return;
    }

    if (status === "encerrada" || promocaoEsgotada(promo)) {
      alert("Essa promoção já foi encerrada ou esgotada.");
      return;
    }

    const estaPausada =
      status === "desativada" || status === "inativa" || status === "pausada";

    const novoStatus = estaPausada ? "ativa" : "pausada";

    const confirmar = window.confirm(
      estaPausada
        ? "Deseja reativar essa promoção? Ela voltará a aparecer para os clientes."
        : "Deseja pausar essa promoção? Ela ficará invisível para os clientes, mas continuará salva."
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("promotions")
      .update({
        status: novoStatus,
      })
      .eq("id", promo.id)
      .eq("restaurant_id", restaurante.id);

    if (error) {
      alert(error.message);
      return;
    }

    alert(estaPausada ? "Promoção reativada." : "Promoção pausada.");
    carregarDados();
  }

  async function excluirPromocao(promo) {
    const confirmar = window.confirm(
      `Tem certeza que deseja excluir a promoção "${promo.titulo}"? Essa ação não pode ser desfeita.`
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("promotions")
      .delete()
      .eq("id", promo.id)
      .eq("restaurant_id", restaurante.id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Promoção excluída com sucesso.");
    carregarDados();
  }

  function copiarLinkLoja() {
    if (!restaurante) return;

    const link = `${window.location.origin}/loja/${
      restaurante.slug || restaurante.id
    }`;

    navigator.clipboard.writeText(link);
    alert("Link da loja copiado.");
  }

  function copiarLinkPromocao(promo) {
    const link = `${window.location.origin}/promocao/${promo.id}`;

    navigator.clipboard.writeText(link);
    alert("Link da promoção copiado.");
  }

  async function sair() {
    await supabase.auth.signOut();
    window.location.href = "/parceiro/login";
  }

  const totalPromocoes = promocoes.length;

  const ativas = promocoes.filter((p) =>
    ["ativa", "ativo", "aprovada", "aprovado"].includes(statusNormalizado(p))
  ).length;

  const pendentes = promocoes.filter(
    (p) => statusNormalizado(p) === "pendente"
  ).length;

  const pausadas = promocoes.filter((p) =>
    ["desativada", "inativa", "pausada"].includes(statusNormalizado(p))
  ).length;

  const totalResgatados = promocoes.reduce(
    (acc, p) => acc + Number(p.quantidade_resgatada || 0),
    0
  );

  const totalVisualizacoes = promocoes.reduce(
    (acc, p) => acc + Number(p.visualizacoes || 0),
    0
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F5F2] flex items-center justify-center">
        <p className="font-black text-[#FF5A1F]">Carregando painel...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F5F2] px-4 py-5 pb-20">
      <div className="max-w-6xl mx-auto">
        <section className="bg-[#1C1C1C] text-white rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#FF5A1F]/20 rounded-full blur-2xl" />

          <div className="flex items-start justify-between gap-4 relative z-10">
            <div className="flex items-start gap-4">
              {restaurante?.logo_url ? (
                <img
                  src={restaurante.logo_url}
                  alt={restaurante.nome}
                  className="w-20 h-20 rounded-3xl object-cover bg-white"
                />
              ) : (
                <div className="w-20 h-20 rounded-3xl bg-white/10 flex items-center justify-center">
                  <Store size={32} />
                </div>
              )}

              <div>
                <img
                  src="/logo-promoja.png"
                  alt="PromoJá"
                  className="h-14 object-contain mb-5"
                />

                <p className="text-xs text-zinc-400 font-bold">
                  Painel do parceiro
                </p>

                <h1 className="text-3xl font-black mt-1">
                  {restaurante?.nome}
                </h1>

                <p className="text-sm text-zinc-300 mt-2">
                  Gerencie promoções, pausas, horários, cupons e financeiro.
                </p>

                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="bg-green-500 text-white px-3 py-2 rounded-full text-xs font-black">
                    Loja cadastrada
                  </span>

                  <span className="bg-white/10 text-white px-3 py-2 rounded-full text-xs font-black">
                    Plano grátis
                  </span>

                  {pendentes > 0 && (
                    <span className="bg-yellow-400 text-[#1C1C1C] px-3 py-2 rounded-full text-xs font-black">
                      {pendentes} em análise
                    </span>
                  )}

                  {pausadas > 0 && (
                    <span className="bg-zinc-700 text-white px-3 py-2 rounded-full text-xs font-black">
                      {pausadas} pausada(s)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={sair}
              className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center active:scale-95"
            >
              <LogOut size={20} />
            </button>
          </div>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-5">
          <CardMetrica icon={<Flame size={20} />} titulo="Promoções" valor={totalPromocoes} />
          <CardMetrica icon={<CheckCircle size={20} />} titulo="Ativas" valor={ativas} />
          <CardMetrica icon={<PauseCircle size={20} />} titulo="Pausadas" valor={pausadas} />
          <CardMetrica icon={<Ticket size={20} />} titulo="Resgates" valor={totalResgatados} />
          <CardMetrica icon={<Eye size={20} />} titulo="Visualizações" valor={totalVisualizacoes} />
        </section>

        <section className="bg-white rounded-[2rem] p-5 shadow-sm mt-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF0E8] text-[#FF5A1F] flex items-center justify-center">
              <DollarSign size={24} />
            </div>

            <div>
              <h2 className="text-xl font-black text-[#1C1C1C]">
                Financeiro
              </h2>
              <p className="text-sm text-zinc-500">
                Valores baseados apenas em cupons confirmados/validados.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
            <button
              onClick={() => setFiltroFinanceiro("hoje")}
              className={`py-3 rounded-2xl font-black text-sm ${
                filtroFinanceiro === "hoje"
                  ? "bg-[#FF5A1F] text-white"
                  : "bg-[#F7F5F2] text-zinc-700"
              }`}
            >
              Hoje
            </button>

            <button
              onClick={() => setFiltroFinanceiro("7dias")}
              className={`py-3 rounded-2xl font-black text-sm ${
                filtroFinanceiro === "7dias"
                  ? "bg-[#FF5A1F] text-white"
                  : "bg-[#F7F5F2] text-zinc-700"
              }`}
            >
              7 dias
            </button>

            <button
              onClick={() => setFiltroFinanceiro("30dias")}
              className={`py-3 rounded-2xl font-black text-sm ${
                filtroFinanceiro === "30dias"
                  ? "bg-[#FF5A1F] text-white"
                  : "bg-[#F7F5F2] text-zinc-700"
              }`}
            >
              30 dias
            </button>

            <button
              onClick={() => setFiltroFinanceiro("personalizado")}
              className={`py-3 rounded-2xl font-black text-sm col-span-3 md:col-span-1 ${
                filtroFinanceiro === "personalizado"
                  ? "bg-[#1C1C1C] text-white"
                  : "bg-[#F7F5F2] text-zinc-700"
              }`}
            >
              Personalizado
            </button>
          </div>

          {filtroFinanceiro === "personalizado" && (
            <div className="grid md:grid-cols-2 gap-3 mt-4">
              <div>
                <label className="text-xs font-black text-zinc-500">
                  Data inicial
                </label>

                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="w-full mt-2 bg-[#F7F5F2] rounded-2xl px-4 py-4 outline-none font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-black text-zinc-500">
                  Data final
                </label>

                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="w-full mt-2 bg-[#F7F5F2] rounded-2xl px-4 py-4 outline-none font-bold"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
            <CardFinanceiro
              icon={<DollarSign size={20} />}
              titulo="Faturamento"
              valor={formatarMoeda(financeiro.faturamento)}
            />

            <CardFinanceiro
              icon={<Ticket size={20} />}
              titulo="Cupons confirmados"
              valor={financeiro.cuponsConfirmados}
            />

            <CardFinanceiro
              icon={<Users size={20} />}
              titulo="Clientes"
              valor={financeiro.clientes}
            />

            <CardFinanceiro
              icon={<Flame size={20} />}
              titulo="Mais resgatada"
              valor={financeiro.promocaoMaisResgatada}
              pequeno
            />
          </div>

          <Link
            to="/parceiro/financeiro-resgates"
            className="mt-5 w-full bg-[#1C1C1C] text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2"
          >
            {loadingFinanceiro
              ? "Atualizando financeiro..."
              : "Ver lista completa de clientes e resgates"}
          </Link>
        </section>

        <section className="bg-white rounded-[2rem] p-5 shadow-sm mt-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF0E8] text-[#FF5A1F] flex items-center justify-center">
              <Store size={24} />
            </div>

            <div>
              <h2 className="text-xl font-black text-[#1C1C1C]">
                Perfil da loja
              </h2>
              <p className="text-sm text-zinc-500">
                Edite nome e foto da sua loja.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4">
            {restaurante?.logo_url ? (
              <img
                src={restaurante.logo_url}
                alt={restaurante.nome}
                className="w-24 h-24 rounded-3xl object-cover border border-orange-100 bg-white"
              />
            ) : (
              <div className="w-24 h-24 rounded-3xl bg-[#FFF0E8] flex items-center justify-center">
                <Store className="text-[#FF5A1F]" size={34} />
              </div>
            )}

            <label className="bg-[#1C1C1C] text-white px-5 py-4 rounded-2xl font-black flex items-center gap-2 cursor-pointer active:scale-95">
              <Camera size={18} />
              {enviandoLogo ? "Enviando..." : "Alterar foto"}
              <input
                type="file"
                accept="image/*"
                onChange={uploadLogoRestaurante}
                className="hidden"
              />
            </label>
          </div>

          <input
            value={nomeRestaurante}
            onChange={(e) => setNomeRestaurante(e.target.value)}
            className="w-full bg-[#F7F5F2] rounded-2xl px-4 py-4 outline-none font-bold"
            placeholder="Nome do restaurante"
          />

          <div className="grid md:grid-cols-2 gap-3 mt-4">
            <button
              onClick={copiarLinkLoja}
              className="bg-[#1C1C1C] text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2"
            >
              <Copy size={18} />
              Copiar link da loja
            </button>

            <button
              onClick={salvarPerfil}
              disabled={salvandoPerfil}
              className="bg-[#FF5A1F] text-white py-4 rounded-2xl font-black disabled:opacity-60"
            >
              {salvandoPerfil ? "Salvando..." : "Salvar perfil"}
            </button>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-3 mt-5">
          <Link
            to="/parceiro/nova-promocao"
            className="bg-[#FF5A1F] text-white rounded-[2rem] p-5 font-black flex items-center justify-center gap-2 shadow-lg active:scale-95"
          >
            <Plus size={22} />
            Criar nova promoção
          </Link>

          <Link
            to="/parceiro/cupons"
            className="bg-[#1C1C1C] text-white rounded-[2rem] p-5 font-black flex items-center justify-center gap-2 shadow-lg active:scale-95"
          >
            <Ticket size={22} />
            Validar cupons
          </Link>

          <Link
            to="/parceiro/horarios"
            className="bg-white border border-orange-100 text-[#FF5A1F] rounded-[2rem] p-5 font-black flex items-center justify-center gap-2 shadow-sm active:scale-95"
          >
            <Clock3 size={22} />
            Horários
          </Link>
        </section>

        <section className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-2xl font-black text-[#1C1C1C]">
                Minhas promoções
              </h2>

              <p className="text-sm text-zinc-500">
                Pause, reative, edite ou exclua suas ofertas.
              </p>
            </div>
          </div>

          {promocoes.length === 0 && (
            <div className="bg-white rounded-[2rem] p-6 text-center shadow-sm">
              <AlertCircle className="mx-auto text-zinc-400 mb-3" size={34} />

              <p className="font-black text-zinc-700">
                Nenhuma promoção criada ainda.
              </p>

              <Link
                to="/parceiro/nova-promocao"
                className="mt-4 inline-block bg-[#FF5A1F] text-white px-6 py-3 rounded-2xl font-black"
              >
                Criar primeira promoção
              </Link>
            </div>
          )}

          <div className="space-y-4">
            {promocoes.map((promo) => {
              const badge = statusBadge(promo);
              const botao = botaoStatus(promo);
              const restantes = quantidadeRestante(promo);
              const total = Number(promo.quantidade_total || 0);
              const resgatados = Number(promo.quantidade_resgatada || 0);
              const progresso =
                total > 0 ? Math.min((resgatados / total) * 100, 100) : 0;

              return (
                <div
                  key={promo.id}
                  className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-orange-100"
                >
                  <div className="grid md:grid-cols-[220px_1fr]">
                    <div className="relative">
                      {promo.imagem_url ? (
                        <img
                          src={promo.imagem_url}
                          alt={promo.titulo}
                          className="w-full h-56 md:h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-56 md:h-full bg-[#FFF0E8] flex items-center justify-center">
                          <Ticket size={42} className="text-[#FF5A1F]" />
                        </div>
                      )}

                      <span
                        className={`absolute top-3 left-3 px-3 py-2 rounded-full text-xs font-black ${badge.classe}`}
                      >
                        {badge.texto}
                      </span>
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-2xl font-black text-[#1C1C1C]">
                            {promo.titulo}
                          </h3>

                          <p className="text-sm text-zinc-500 mt-1">
                            {promo.categoria || "Promoção"} •{" "}
                            {promo.tipo_promocao === "drop" ? "Drop" : "Normal"}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-zinc-400 line-through">
                            R$ {promo.preco_antigo}
                          </p>

                          <p className="text-2xl font-black text-[#FF5A1F]">
                            R$ {promo.preco_promocional}
                          </p>
                        </div>
                      </div>

                      <p className="text-sm text-zinc-500 mt-3 line-clamp-2">
                        {promo.descricao}
                      </p>

                      <div className="mt-5 bg-[#F7F5F2] rounded-2xl p-4">
                        <div className="flex items-center justify-between text-sm font-bold">
                          <span>Cupons usados</span>
                          <span>
                            {resgatados}/{total || "∞"}
                          </span>
                        </div>

                        <div className="w-full h-3 bg-white rounded-full mt-3 overflow-hidden">
                          <div
                            className="h-full bg-[#FF5A1F] rounded-full"
                            style={{ width: `${progresso}%` }}
                          />
                        </div>

                        {restantes !== null && (
                          <p className="text-xs text-zinc-500 mt-2">
                            {restantes} cupons restantes
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-5">
                        <button
                          type="button"
                          disabled={botao.bloqueado}
                          onClick={() => alternarStatusPromocao(promo)}
                          className={`${botao.classe} rounded-2xl py-3 font-black flex items-center justify-center gap-1 disabled:opacity-70`}
                        >
                          {botao.icon}
                          {botao.texto}
                        </button>

                        <Link
                          to={`/parceiro/editar-promocao/${promo.id}`}
                          className="bg-[#1C1C1C] text-white rounded-2xl py-3 font-black flex items-center justify-center gap-1"
                        >
                          <Edit size={16} />
                          Editar
                        </Link>

                        <button
                          type="button"
                          onClick={() => copiarLinkPromocao(promo)}
                          className="bg-[#FFF0E8] text-[#FF5A1F] rounded-2xl py-3 font-black flex items-center justify-center gap-1"
                        >
                          <Copy size={16} />
                          Link
                        </button>

                        <Link
                          to={`/promocao/${promo.id}`}
                          className="bg-zinc-100 text-zinc-700 rounded-2xl py-3 font-black flex items-center justify-center gap-1"
                        >
                          <Eye size={16} />
                          Ver
                        </Link>

                        <button
                          type="button"
                          onClick={() => excluirPromocao(promo)}
                          className="bg-red-50 text-red-600 rounded-2xl py-3 font-black flex items-center justify-center gap-1"
                        >
                          <Trash2 size={16} />
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-6 bg-[#1C1C1C] text-white rounded-[2rem] p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#FF5A1F] rounded-2xl flex items-center justify-center">
              <BarChart3 size={24} />
            </div>

            <div>
              <h3 className="font-black text-xl">Plano Pro em breve</h3>

              <p className="text-sm text-zinc-300 mt-1">
                Promoções ilimitadas, destaque na Home, analytics e drops avançados.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function CardMetrica({ icon, titulo, valor }) {
  return (
    <div className="bg-white rounded-[1.5rem] p-4 shadow-sm border border-orange-50">
      <div className="w-10 h-10 rounded-2xl bg-[#FFF0E8] text-[#FF5A1F] flex items-center justify-center mb-3">
        {icon}
      </div>

      <p className="text-2xl font-black text-[#1C1C1C]">{valor}</p>

      <p className="text-xs font-bold text-zinc-500 mt-1">{titulo}</p>
    </div>
  );
}

function CardFinanceiro({ icon, titulo, valor, pequeno }) {
  return (
    <div className="bg-[#F7F5F2] rounded-[1.5rem] p-4 border border-orange-50">
      <div className="w-10 h-10 rounded-2xl bg-white text-[#FF5A1F] flex items-center justify-center mb-3">
        {icon}
      </div>

      <p
        className={`font-black text-[#1C1C1C] ${
          pequeno ? "text-sm line-clamp-2" : "text-xl"
        }`}
      >
        {valor}
      </p>

      <p className="text-xs font-bold text-zinc-500 mt-1">{titulo}</p>
    </div>
  );
}