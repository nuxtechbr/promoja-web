import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle,
  XCircle,
  Store,
  Ticket,
  Users,
  Clock,
  MessageCircle,
  MoreVertical,
  LogOut,
  Eye,
  Search,
  ShieldCheck,
  BarChart3,
  Flame,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  BadgeCheck,
} from "lucide-react";
import { supabase } from "../services/supabase";

const WEBHOOK_RESTAURANTE_APROVADO =
  "https://nuxtechbr.app.n8n.cloud/webhook/promoja-restaurante-aprovado";

const WEBHOOK_RESTAURANTE_RECUSADO =
  "https://nuxtechbr.app.n8n.cloud/webhook/promoja-restaurante-recusado";

const WEBHOOK_PROMOCAO_APROVADA =
  "https://nuxtechbr.app.n8n.cloud/webhook/promoja-promocao-aprovada";

const WEBHOOK_PROMOCAO_RECUSADA =
  "https://nuxtechbr.app.n8n.cloud/webhook/promoja-promocao-recusada";

export default function AdminDashboard() {
  const [promocoesPendentes, setPromocoesPendentes] = useState([]);
  const [restaurantesPendentes, setRestaurantesPendentes] = useState([]);
  const [todosRestaurantes, setTodosRestaurantes] = useState([]);
  const [todasPromocoes, setTodasPromocoes] = useState([]);
  const [todosResgates, setTodosResgates] = useState([]);

  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [totalRestaurantes, setTotalRestaurantes] = useState(0);
  const [totalPromocoes, setTotalPromocoes] = useState(0);
  const [totalResgates, setTotalResgates] = useState(0);

  const [carregando, setCarregando] = useState(true);
  const [menuAberto, setMenuAberto] = useState(false);
  const [aba, setAba] = useState("pendencias");
  const [busca, setBusca] = useState("");

  const [restauranteSelecionado, setRestauranteSelecionado] = useState(null);
  const [promoSelecionada, setPromoSelecionada] = useState(null);

  async function verificarAdmin() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/admin-login";
      return false;
    }

    const { data: admin } = await supabase
      .from("admin_users")
      .select("*")
      .eq("auth_id", user.id)
      .maybeSingle();

    if (!admin) {
      await supabase.auth.signOut();
      window.location.href = "/admin-login";
      return false;
    }

    return true;
  }

  async function sair() {
    await supabase.auth.signOut();
    window.location.href = "/admin-login";
  }

  async function carregarAdmin() {
    setCarregando(true);

    const permitido = await verificarAdmin();
    if (!permitido) return;

    const { data: clientes } = await supabase.from("clientes").select("*");

    const { data: restaurantes } = await supabase
      .from("restaurants")
      .select("*")
      .order("id", { ascending: false });

    const { data: promocoes } = await supabase
      .from("promotions")
      .select("*")
      .order("id", { ascending: false });

    const { data: resgates } = await supabase
      .from("redemptions")
      .select("*")
      .order("id", { ascending: false });

    const pendentesPromocoes = (promocoes || []).filter(
      (p) => String(p.status || "").toLowerCase() === "pendente"
    );

    const pendentesRestaurantes = (restaurantes || []).filter(
      (r) => String(r.status || "").toLowerCase() === "pendente"
    );

    setTotalUsuarios(clientes?.length || 0);
    setTotalRestaurantes(restaurantes?.length || 0);
    setTotalPromocoes(promocoes?.length || 0);
    setTotalResgates(resgates?.length || 0);

    setTodosRestaurantes(restaurantes || []);
    setTodasPromocoes(promocoes || []);
    setTodosResgates(resgates || []);

    setPromocoesPendentes(pendentesPromocoes || []);
    setRestaurantesPendentes(pendentesRestaurantes || []);

    setCarregando(false);
  }

  async function enviarWebhook(url, dados) {
    try {
      const resposta = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dados),
      });

      if (!resposta.ok) {
        const texto = await resposta.text();
        console.log("Erro no webhook:", resposta.status, texto);
        return false;
      }

      return true;
    } catch (error) {
      console.log("Erro ao chamar webhook:", error);
      return false;
    }
  }

  function limparTelefone(telefone) {
    const numero = String(telefone || "").replace(/\D/g, "");

    if (!numero) return "";

    if (numero.startsWith("55")) {
      return numero;
    }

    return `55${numero}`;
  }

  function statusNormalizado(valor) {
    return String(valor || "").toLowerCase();
  }

  function formatarData(valor) {
    if (!valor) return "Não informado";

    try {
      return new Date(valor).toLocaleString("pt-BR");
    } catch {
      return "Não informado";
    }
  }

  function formatarMoeda(valor) {
    const numero = Number(
      String(valor || "0")
        .replace("R$", "")
        .replace(/\./g, "")
        .replace(",", ".")
    );

    return Number.isNaN(numero)
      ? "R$ 0,00"
      : numero.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });
  }

  async function aprovarRestaurante(restaurante) {
    const { error } = await supabase
      .from("restaurants")
      .update({ status: "ativo" })
      .eq("id", restaurante.id);

    if (error) {
      alert(error.message);
      return;
    }

    const enviado = await enviarWebhook(WEBHOOK_RESTAURANTE_APROVADO, {
      nome: restaurante.nome,
      responsavel: restaurante.responsavel,
      whatsapp: limparTelefone(restaurante.whatsapp_comercial),
      email: restaurante.email,
      cidade: restaurante.cidade,
      bairro: restaurante.bairro,
      categoria: restaurante.categoria,
      status: "ativo",
      login_url: "https://usepromoja.com.br/parceiro/login",
      mensagem:
        "🎉 Parabéns! Seu cadastro no PromoJá foi aprovado.\n\nAgora você já pode acessar o painel do parceiro, criar suas promoções e começar a aparecer para clientes da sua região.\n\nAcesse aqui:\nhttps://usepromoja.com.br/parceiro/login",
    });

    if (enviado) {
      alert("Restaurante aprovado! Mensagem automática enviada.");
    } else {
      alert("Restaurante aprovado, mas a mensagem automática falhou.");
    }

    setRestauranteSelecionado(null);
    carregarAdmin();
  }

  async function recusarRestaurante(id) {
    if (!window.confirm("Tem certeza que deseja recusar este restaurante?")) {
      return;
    }

    const restaurante =
      restauranteSelecionado || restaurantesPendentes.find((r) => r.id === id);

    const { error } = await supabase
      .from("restaurants")
      .update({ status: "recusado" })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    let enviado = true;

    if (restaurante) {
      enviado = await enviarWebhook(WEBHOOK_RESTAURANTE_RECUSADO, {
        nome: restaurante.nome,
        responsavel: restaurante.responsavel,
        whatsapp: limparTelefone(restaurante.whatsapp_comercial),
        email: restaurante.email,
        cidade: restaurante.cidade,
        bairro: restaurante.bairro,
        categoria: restaurante.categoria,
        status: "recusado",
        mensagem:
          "❌ Seu cadastro no PromoJá não foi aprovado neste momento.\n\nVocê pode ajustar as informações e tentar novamente futuramente.",
      });
    }

    if (enviado) {
      alert("Restaurante recusado! Mensagem automática enviada.");
    } else {
      alert("Restaurante recusado, mas a mensagem automática falhou.");
    }

    setRestauranteSelecionado(null);
    carregarAdmin();
  }

  async function aprovarPromocao(id) {
    const promocao = promoSelecionada || promocoesPendentes.find((p) => p.id === id);

    const { error } = await supabase
      .from("promotions")
      .update({ status: "ativa" })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    let enviado = true;

    if (promocao?.restaurant_id) {
      const { data: restaurante } = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", promocao.restaurant_id)
        .maybeSingle();

      enviado = await enviarWebhook(WEBHOOK_PROMOCAO_APROVADA, {
        titulo: promocao.titulo,
        descricao: promocao.descricao,
        preco_antigo: promocao.preco_antigo,
        preco_promocional: promocao.preco_promocional,
        imagem_url: promocao.imagem_url,
        restaurante: restaurante?.nome,
        responsavel: restaurante?.responsavel,
        whatsapp: limparTelefone(restaurante?.whatsapp_comercial),
        email: restaurante?.email,
        status: "ativa",
        mensagem:
          "🎉 Sua promoção foi aprovada no PromoJá!\n\nEla já está visível para os clientes da sua região 🚀",
      });
    }

    if (enviado) {
      alert("Promoção aprovada! Mensagem automática enviada.");
    } else {
      alert("Promoção aprovada, mas a mensagem automática falhou.");
    }

    setPromoSelecionada(null);
    carregarAdmin();
  }

  async function recusarPromocao(id) {
    if (!window.confirm("Tem certeza que deseja recusar esta promoção?")) {
      return;
    }

    const promocao = promoSelecionada || promocoesPendentes.find((p) => p.id === id);

    const { error } = await supabase
      .from("promotions")
      .update({ status: "recusada" })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    let enviado = true;

    if (promocao?.restaurant_id) {
      const { data: restaurante } = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", promocao.restaurant_id)
        .maybeSingle();

      enviado = await enviarWebhook(WEBHOOK_PROMOCAO_RECUSADA, {
        titulo: promocao.titulo,
        restaurante: restaurante?.nome,
        responsavel: restaurante?.responsavel,
        whatsapp: limparTelefone(restaurante?.whatsapp_comercial),
        email: restaurante?.email,
        status: "recusada",
        mensagem:
          "❌ Sua promoção não foi aprovada desta vez.\n\nVerifique as informações e tente novamente no painel do parceiro.",
      });
    }

    if (enviado) {
      alert("Promoção recusada! Mensagem automática enviada.");
    } else {
      alert("Promoção recusada, mas a mensagem automática falhou.");
    }

    setPromoSelecionada(null);
    carregarAdmin();
  }

  useEffect(() => {
    carregarAdmin();
  }, []);

  const restaurantesFiltrados = useMemo(() => {
    const termo = busca.toLowerCase();

    return todosRestaurantes.filter((item) => {
      return (
        String(item.nome || "").toLowerCase().includes(termo) ||
        String(item.responsavel || "").toLowerCase().includes(termo) ||
        String(item.cidade || "").toLowerCase().includes(termo) ||
        String(item.bairro || "").toLowerCase().includes(termo) ||
        String(item.categoria || "").toLowerCase().includes(termo)
      );
    });
  }, [todosRestaurantes, busca]);

  const promocoesFiltradas = useMemo(() => {
    const termo = busca.toLowerCase();

    return todasPromocoes.filter((item) => {
      return (
        String(item.titulo || "").toLowerCase().includes(termo) ||
        String(item.descricao || "").toLowerCase().includes(termo) ||
        String(item.categoria || "").toLowerCase().includes(termo) ||
        String(item.status || "").toLowerCase().includes(termo)
      );
    });
  }, [todasPromocoes, busca]);

  const resgatesConfirmados = todosResgates.filter((r) =>
    ["confirmado", "confirmada", "validado", "validada", "utilizado"].includes(
      statusNormalizado(r.status)
    )
  ).length;

  const restaurantesAtivos = todosRestaurantes.filter((r) =>
    ["ativo", "ativa", "aprovado", "aprovada"].includes(statusNormalizado(r.status))
  ).length;

  const promocoesAtivas = todasPromocoes.filter((p) =>
    ["ativo", "ativa", "aprovado", "aprovada"].includes(statusNormalizado(p.status))
  ).length;

  if (carregando) {
    return (
      <main className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <p className="font-black text-[#FF5A1F]">Carregando admin...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F7F7] px-5 py-6 pb-10">
      <header className="relative bg-[#1C1C1C] text-white rounded-[32px] p-6 shadow-xl overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#FF5A1F]/20 rounded-full blur-2xl" />

        <button
          onClick={() => setMenuAberto(!menuAberto)}
          className="absolute top-5 right-5 bg-white/10 w-11 h-11 rounded-2xl flex items-center justify-center z-10"
        >
          <MoreVertical size={22} />
        </button>

        {menuAberto && (
          <div className="absolute top-20 right-5 bg-white text-[#1C1C1C] rounded-2xl shadow-xl p-2 w-44 z-20">
            <button
              onClick={carregarAdmin}
              className="w-full flex items-center gap-2 px-4 py-3 rounded-xl hover:bg-zinc-100 font-bold"
            >
              <RefreshCw size={18} />
              Atualizar
            </button>

            <button
              onClick={sair}
              className="w-full flex items-center gap-2 px-4 py-3 rounded-xl hover:bg-zinc-100 font-bold"
            >
              <LogOut size={18} />
              Sair
            </button>
          </div>
        )}

        <img
          src="/logo-promoja.png"
          alt="PromoJá"
          className="h-20 object-contain mx-auto mb-4 relative z-10"
        />

        <div className="relative z-10">
          <p className="text-sm text-zinc-300">Admin PromoJá</p>

          <h1 className="text-3xl font-black mt-1">
            Central de Controle
          </h1>

          <p className="text-sm text-zinc-300 mt-2">
            Aprove restaurantes, ofertas e acompanhe a operação do SaaS.
          </p>

          <div className="flex flex-wrap gap-2 mt-4">
            <span className="bg-yellow-400 text-[#1C1C1C] px-3 py-2 rounded-full text-xs font-black">
              {restaurantesPendentes.length} restaurantes pendentes
            </span>

            <span className="bg-[#FF5A1F] text-white px-3 py-2 rounded-full text-xs font-black">
              {promocoesPendentes.length} promoções pendentes
            </span>

            <span className="bg-white/10 text-white px-3 py-2 rounded-full text-xs font-black">
              Operação ativa
            </span>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <Card icon={<Users />} number={totalUsuarios} label="Usuários" />
        <Card icon={<Store />} number={totalRestaurantes} label="Restaurantes" />
        <Card icon={<Ticket />} number={totalPromocoes} label="Promoções" />
        <Card icon={<CheckCircle />} number={totalResgates} label="Resgates" />
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <Card icon={<BadgeCheck />} number={restaurantesAtivos} label="Rest. ativos" pequeno />
        <Card icon={<Flame />} number={promocoesAtivas} label="Promoções ativas" pequeno />
        <Card icon={<ShieldCheck />} number={resgatesConfirmados} label="Validados" pequeno />
        <Card
          icon={<AlertCircle />}
          number={restaurantesPendentes.length + promocoesPendentes.length}
          label="Pendências"
          pequeno
        />
      </section>

      <section className="bg-white rounded-[28px] p-4 shadow-sm mt-6">
        <div className="flex items-center gap-2 bg-[#F7F7F7] rounded-2xl px-4 py-4">
          <Search size={18} className="text-zinc-400" />

          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar restaurante, promoção, cidade, status..."
            className="bg-transparent outline-none w-full font-bold"
          />
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4">
          <AbaBotao ativo={aba === "pendencias"} onClick={() => setAba("pendencias")}>
            Pendências
          </AbaBotao>

          <AbaBotao ativo={aba === "restaurantes"} onClick={() => setAba("restaurantes")}>
            Restaurantes
          </AbaBotao>

          <AbaBotao ativo={aba === "promocoes"} onClick={() => setAba("promocoes")}>
            Promoções
          </AbaBotao>
        </div>
      </section>

      {aba === "pendencias" && (
        <>
          <section className="mt-8">
            <Titulo icon={<Store />} texto="Restaurantes aguardando aprovação" />

            {restaurantesPendentes.length === 0 && (
              <Box texto="Nenhum restaurante pendente." />
            )}

            <div className="space-y-5">
              {restaurantesPendentes.map((restaurante) => (
                <CardRestaurante
                  key={restaurante.id}
                  restaurante={restaurante}
                  onDetalhes={() => setRestauranteSelecionado(restaurante)}
                  onAprovar={() => aprovarRestaurante(restaurante)}
                  onRecusar={() => recusarRestaurante(restaurante.id)}
                />
              ))}
            </div>
          </section>

          <section className="mt-8">
            <Titulo icon={<Clock />} texto="Promoções aguardando aprovação" />

            {promocoesPendentes.length === 0 && (
              <Box texto="Nenhuma oferta pendente." />
            )}

            <div className="space-y-5">
              {promocoesPendentes.map((promo) => (
                <CardPromocao
                  key={promo.id}
                  promo={promo}
                  onDetalhes={() => setPromoSelecionada(promo)}
                  onAprovar={() => aprovarPromocao(promo.id)}
                  onRecusar={() => recusarPromocao(promo.id)}
                  formatarMoeda={formatarMoeda}
                />
              ))}
            </div>
          </section>
        </>
      )}

      {aba === "restaurantes" && (
        <section className="mt-8">
          <Titulo icon={<Store />} texto="Todos os restaurantes" />

          {restaurantesFiltrados.length === 0 && (
            <Box texto="Nenhum restaurante encontrado." />
          )}

          <div className="space-y-5">
            {restaurantesFiltrados.map((restaurante) => (
              <CardRestaurante
                key={restaurante.id}
                restaurante={restaurante}
                onDetalhes={() => setRestauranteSelecionado(restaurante)}
                onAprovar={() => aprovarRestaurante(restaurante)}
                onRecusar={() => recusarRestaurante(restaurante.id)}
              />
            ))}
          </div>
        </section>
      )}

      {aba === "promocoes" && (
        <section className="mt-8">
          <Titulo icon={<Ticket />} texto="Todas as promoções" />

          {promocoesFiltradas.length === 0 && (
            <Box texto="Nenhuma promoção encontrada." />
          )}

          <div className="space-y-5">
            {promocoesFiltradas.map((promo) => (
              <CardPromocao
                key={promo.id}
                promo={promo}
                onDetalhes={() => setPromoSelecionada(promo)}
                onAprovar={() => aprovarPromocao(promo.id)}
                onRecusar={() => recusarPromocao(promo.id)}
                formatarMoeda={formatarMoeda}
              />
            ))}
          </div>
        </section>
      )}

      {restauranteSelecionado && (
        <Modal onClose={() => setRestauranteSelecionado(null)}>
          <h2 className="text-2xl font-black mb-4">Detalhes do restaurante</h2>

          {restauranteSelecionado.logo_url && (
            <img
              src={restauranteSelecionado.logo_url}
              alt={restauranteSelecionado.nome}
              className="w-24 h-24 rounded-3xl object-cover mb-4 border"
            />
          )}

          <Detalhe label="Nome" valor={restauranteSelecionado.nome} />
          <Detalhe label="Responsável" valor={restauranteSelecionado.responsavel} />
          <Detalhe label="WhatsApp" valor={restauranteSelecionado.whatsapp_comercial} />
          <Detalhe label="Cidade" valor={restauranteSelecionado.cidade} />
          <Detalhe label="Bairro" valor={restauranteSelecionado.bairro} />
          <Detalhe label="Categoria" valor={restauranteSelecionado.categoria} />
          <Detalhe label="Instagram" valor={restauranteSelecionado.instagram} />
          <Detalhe label="Endereço" valor={restauranteSelecionado.endereco} />
          <Detalhe label="Email" valor={restauranteSelecionado.email} />
          <Detalhe label="Status" valor={restauranteSelecionado.status} />
          <Detalhe label="Criado em" valor={formatarData(restauranteSelecionado.created_at)} />

          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              onClick={() => aprovarRestaurante(restauranteSelecionado)}
              className="bg-green-600 text-white py-4 rounded-2xl font-black"
            >
              Aprovar
            </button>

            <button
              onClick={() => recusarRestaurante(restauranteSelecionado.id)}
              className="bg-red-600 text-white py-4 rounded-2xl font-black"
            >
              Recusar
            </button>
          </div>
        </Modal>
      )}

      {promoSelecionada && (
        <Modal onClose={() => setPromoSelecionada(null)}>
          <img
            src={promoSelecionada.imagem_url || "/logo-promoja.png"}
            alt={promoSelecionada.titulo}
            className="w-full h-56 object-cover rounded-3xl bg-zinc-100 mb-5"
          />

          <h2 className="text-2xl font-black">{promoSelecionada.titulo}</h2>

          <p className="text-zinc-600 mt-3">
            {promoSelecionada.descricao || "Sem descrição"}
          </p>

          <div className="mt-5 bg-[#F7F7F7] rounded-2xl p-4">
            <Detalhe
              label="Preço antigo"
              valor={`R$ ${promoSelecionada.preco_antigo || "0,00"}`}
            />
            <Detalhe
              label="Preço promocional"
              valor={`R$ ${promoSelecionada.preco_promocional || "0,00"}`}
            />
            <Detalhe label="Categoria" valor={promoSelecionada.categoria} />
            <Detalhe label="Status" valor={promoSelecionada.status} />
            <Detalhe label="Tipo" valor={promoSelecionada.tipo_promocao} />
            <Detalhe label="Validade" valor={formatarData(promoSelecionada.validade)} />
            <Detalhe label="Criada em" valor={formatarData(promoSelecionada.created_at)} />
            <Detalhe label="Cupons totais" valor={promoSelecionada.quantidade_total} />
            <Detalhe label="Cupons resgatados" valor={promoSelecionada.quantidade_resgatada} />
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              onClick={() => aprovarPromocao(promoSelecionada.id)}
              className="bg-green-600 text-white py-4 rounded-2xl font-black"
            >
              Aprovar
            </button>

            <button
              onClick={() => recusarPromocao(promoSelecionada.id)}
              className="bg-red-600 text-white py-4 rounded-2xl font-black"
            >
              Recusar
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}

function CardRestaurante({ restaurante, onDetalhes, onAprovar, onRecusar }) {
  const status = String(restaurante.status || "pendente").toLowerCase();

  return (
    <div className="bg-white rounded-[28px] p-5 shadow-sm border border-zinc-100">
      <div className="flex items-start gap-4">
        {restaurante.logo_url ? (
          <img
            src={restaurante.logo_url}
            alt={restaurante.nome}
            className="w-16 h-16 rounded-3xl object-cover border"
          />
        ) : (
          <div className="bg-[#FFF3EE] w-16 h-16 rounded-3xl flex items-center justify-center">
            <Store className="text-[#FF5A1F]" />
          </div>
        )}

        <div className="flex-1">
          <span
            className={`text-xs font-black px-3 py-1 rounded-full ${
              status === "ativo"
                ? "bg-green-100 text-green-700"
                : status === "recusado"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {status}
          </span>

          <h3 className="text-xl font-black mt-3">{restaurante.nome}</h3>

          <p className="text-sm text-zinc-500 mt-1">
            Responsável: {restaurante.responsavel}
          </p>

          <p className="text-sm text-zinc-500">
            {restaurante.bairro} • {restaurante.cidade}
          </p>

          <p className="text-sm text-zinc-500">
            Categoria: {restaurante.categoria}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-5">
        <button
          onClick={onDetalhes}
          className="bg-[#1C1C1C] text-white py-3 rounded-2xl font-black flex items-center justify-center gap-1"
        >
          <Eye size={18} />
          Ver
        </button>

        <button
          onClick={onAprovar}
          className="bg-green-600 text-white py-3 rounded-2xl font-black flex items-center justify-center gap-1"
        >
          <CheckCircle size={18} />
          Aprovar
        </button>

        <button
          onClick={onRecusar}
          className="bg-red-50 text-red-600 py-3 rounded-2xl font-black flex items-center justify-center gap-1"
        >
          <XCircle size={18} />
          Recusar
        </button>
      </div>
    </div>
  );
}

function CardPromocao({ promo, onDetalhes, onAprovar, onRecusar, formatarMoeda }) {
  const status = String(promo.status || "pendente").toLowerCase();

  return (
    <div className="bg-white rounded-[28px] overflow-hidden shadow-sm border border-zinc-100">
      <img
        src={promo.imagem_url || "/logo-promoja.png"}
        alt={promo.titulo}
        className="h-48 w-full object-cover bg-zinc-100"
      />

      <div className="p-5">
        <span
          className={`text-xs font-black px-3 py-1 rounded-full ${
            status === "ativa" || status === "ativo"
              ? "bg-green-100 text-green-700"
              : status === "recusada" || status === "recusado"
              ? "bg-red-100 text-red-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {status}
        </span>

        <h3 className="text-xl font-black mt-3">{promo.titulo}</h3>

        <p className="text-zinc-600 mt-2 line-clamp-2">
          {promo.descricao || "Sem descrição"}
        </p>

        <div className="mt-4 bg-[#F7F7F7] rounded-2xl p-4">
          <p className="text-sm line-through text-zinc-400">
            {formatarMoeda(promo.preco_antigo)}
          </p>

          <p className="text-3xl font-black text-[#FF5A1F]">
            {formatarMoeda(promo.preco_promocional)}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-5">
          <button
            onClick={onDetalhes}
            className="bg-[#1C1C1C] text-white py-3 rounded-2xl font-black flex items-center justify-center gap-1"
          >
            <Eye size={18} />
            Ver
          </button>

          <button
            onClick={onAprovar}
            className="bg-green-600 text-white py-3 rounded-2xl font-black flex items-center justify-center gap-1"
          >
            <CheckCircle size={18} />
            Aprovar
          </button>

          <button
            onClick={onRecusar}
            className="bg-red-50 text-red-600 py-3 rounded-2xl font-black flex items-center justify-center gap-1"
          >
            <XCircle size={18} />
            Recusar
          </button>
        </div>
      </div>
    </div>
  );
}

function Card({ icon, number, label, pequeno }) {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm">
      <div className="text-[#FF5A1F]">{icon}</div>

      <p className={`${pequeno ? "text-2xl" : "text-3xl"} font-black mt-3`}>
        {number}
      </p>

      <p className="text-sm text-zinc-500">{label}</p>
    </div>
  );
}

function Titulo({ icon, texto }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="text-[#FF5A1F]">{icon}</div>
      <h2 className="text-xl font-black">{texto}</h2>
    </div>
  );
}

function Box({ texto }) {
  return (
    <div className="bg-white rounded-3xl p-6 text-center shadow-sm">
      <p className="font-black">{texto}</p>
    </div>
  );
}

function Detalhe({ label, valor }) {
  return (
    <div className="mb-3">
      <p className="text-xs text-zinc-500 font-bold">{label}</p>
      <p className="font-black">{valor || "Não informado"}</p>
    </div>
  );
}

function AbaBotao({ children, ativo, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`py-3 rounded-2xl font-black text-sm ${
        ativo ? "bg-[#FF5A1F] text-white" : "bg-[#F7F7F7] text-zinc-700"
      }`}
    >
      {children}
    </button>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center p-4">
      <div className="bg-white text-[#1C1C1C] w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[32px] p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="float-right bg-[#1C1C1C] text-white w-10 h-10 rounded-2xl flex items-center justify-center mb-4"
        >
          <XCircle size={20} />
        </button>

        <div className="clear-both">{children}</div>
      </div>
    </div>
  );
}