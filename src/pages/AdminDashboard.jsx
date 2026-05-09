import { useEffect, useState } from "react";
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
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [totalRestaurantes, setTotalRestaurantes] = useState(0);
  const [totalPromocoes, setTotalPromocoes] = useState(0);
  const [totalResgates, setTotalResgates] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [menuAberto, setMenuAberto] = useState(false);
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
    const { data: restaurantes } = await supabase.from("restaurants").select("*");
    const { data: promocoes } = await supabase.from("promotions").select("*");
    const { data: resgates } = await supabase.from("redemptions").select("*");

    const { data: pendentesPromocoes } = await supabase
      .from("promotions")
      .select("*")
      .eq("status", "pendente")
      .order("id", { ascending: false });

    const { data: pendentesRestaurantes } = await supabase
      .from("restaurants")
      .select("*")
      .eq("status", "pendente")
      .order("id", { ascending: false });

    setTotalUsuarios(clientes?.length || 0);
    setTotalRestaurantes(restaurantes?.length || 0);
    setTotalPromocoes(promocoes?.length || 0);
    setTotalResgates(resgates?.length || 0);
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

    if (numero.startsWith("55")) {
      return numero;
    }

    return `55${numero}`;
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
      login_url: "https://usepromoja.com.br/login",
      mensagem:
        "🎉 Parabéns! Seu cadastro no PromoJá foi aprovado.\n\nAgora você já pode acessar o painel do parceiro, criar suas promoções e começar a aparecer para clientes da sua região.\n\nAcesse aqui:\nhttps://usepromoja.com.br/login",
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
    if (!confirm("Tem certeza que deseja recusar este restaurante?")) return;

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
    const promocao =
      promoSelecionada || promocoesPendentes.find((p) => p.id === id);

    const { error } = await supabase
      .from("promotions")
      .update({ status: "Ativa" })
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
        status: "Ativa",
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
    if (!confirm("Tem certeza que deseja recusar esta promoção?")) return;

    const promocao =
      promoSelecionada || promocoesPendentes.find((p) => p.id === id);

    const { error } = await supabase
      .from("promotions")
      .update({ status: "Recusada" })
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
        status: "Recusada",
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

  return (
    <main className="min-h-screen bg-[#F7F7F7] px-5 py-6 pb-10">
      <header className="relative bg-[#1C1C1C] text-white rounded-[32px] p-6 shadow-xl">
        <button
          onClick={() => setMenuAberto(!menuAberto)}
          className="absolute top-5 right-5 bg-white/10 w-11 h-11 rounded-2xl flex items-center justify-center"
        >
          <MoreVertical size={22} />
        </button>

        {menuAberto && (
          <div className="absolute top-20 right-5 bg-white text-[#1C1C1C] rounded-2xl shadow-xl p-2 w-40 z-20">
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
          className="h-20 object-contain mx-auto mb-4"
        />

        <p className="text-sm text-zinc-300">Admin PromoJá</p>
        <h1 className="text-3xl font-black mt-1">Painel de Controle</h1>
        <p className="text-sm text-zinc-300 mt-2">
          Aprove restaurantes, ofertas e acompanhe a operação.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-4 mt-6">
        <Card icon={<Users />} number={totalUsuarios} label="Usuários" />
        <Card icon={<Store />} number={totalRestaurantes} label="Restaurantes" />
        <Card icon={<Ticket />} number={totalPromocoes} label="Promoções" />
        <Card icon={<CheckCircle />} number={totalResgates} label="Resgates" />
      </section>

      <section className="mt-8">
        <Titulo icon={<Store />} texto="Restaurantes aguardando aprovação" />

        {carregando && <Box texto="Carregando..." />}
        {!carregando && restaurantesPendentes.length === 0 && (
          <Box texto="Nenhum restaurante pendente." />
        )}

        <div className="space-y-5">
          {restaurantesPendentes.map((restaurante) => (
            <div
              key={restaurante.id}
              className="bg-white rounded-[28px] p-5 shadow-sm border border-zinc-100"
            >
              <span className="text-xs font-black bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                Em análise
              </span>

              <h3 className="text-xl font-black mt-3">{restaurante.nome}</h3>

              <p className="text-sm text-zinc-500 mt-1">
                Responsável: {restaurante.responsavel}
              </p>

              <p className="text-sm text-zinc-500 mt-1">
                WhatsApp: {restaurante.whatsapp_comercial}
              </p>

              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setRestauranteSelecionado(restaurante)}
                  className="flex-1 bg-[#1C1C1C] text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2"
                >
                  <Eye size={20} />
                  Ver detalhes
                </button>

                <button
                  onClick={() => aprovarRestaurante(restaurante)}
                  className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2"
                >
                  <MessageCircle size={20} />
                  Aprovar
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <Titulo icon={<Clock />} texto="Ofertas aguardando aprovação" />

        {!carregando && promocoesPendentes.length === 0 && (
          <Box texto="Nenhuma oferta pendente." />
        )}

        <div className="space-y-5">
          {promocoesPendentes.map((promo) => (
            <div
              key={promo.id}
              className="bg-white rounded-[28px] overflow-hidden shadow-sm border border-zinc-100"
            >
              <img
                src={promo.imagem_url || "/logo-promoja.png"}
                alt={promo.titulo}
                className="h-48 w-full object-cover bg-zinc-100"
              />

              <div className="p-5">
                <span className="text-xs font-black bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                  Pendente
                </span>

                <h3 className="text-xl font-black mt-3">{promo.titulo}</h3>

                <p className="text-zinc-600 mt-2 line-clamp-2">
                  {promo.descricao || "Sem descrição"}
                </p>

                <div className="mt-4 bg-[#F7F7F7] rounded-2xl p-4">
                  <p className="text-sm line-through text-zinc-400">
                    R$ {promo.preco_antigo || "0,00"}
                  </p>

                  <p className="text-3xl font-black text-[#FF5A1F]">
                    R$ {promo.preco_promocional || "0,00"}
                  </p>
                </div>

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => setPromoSelecionada(promo)}
                    className="flex-1 bg-[#1C1C1C] text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2"
                  >
                    <Eye size={20} />
                    Ver detalhes
                  </button>

                  <button
                    onClick={() => aprovarPromocao(promo.id)}
                    className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={20} />
                    Aprovar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {restauranteSelecionado && (
        <Modal onClose={() => setRestauranteSelecionado(null)}>
          <h2 className="text-2xl font-black mb-4">Detalhes do restaurante</h2>

          <Detalhe label="Nome" valor={restauranteSelecionado.nome} />
          <Detalhe label="Responsável" valor={restauranteSelecionado.responsavel} />
          <Detalhe label="WhatsApp" valor={restauranteSelecionado.whatsapp_comercial} />
          <Detalhe label="Cidade" valor={restauranteSelecionado.cidade} />
          <Detalhe label="Bairro" valor={restauranteSelecionado.bairro} />
          <Detalhe label="Categoria" valor={restauranteSelecionado.categoria} />
          <Detalhe label="Instagram" valor={restauranteSelecionado.instagram} />
          <Detalhe label="Endereço" valor={restauranteSelecionado.endereco} />
          <Detalhe label="Email" valor={restauranteSelecionado.email} />

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => aprovarRestaurante(restauranteSelecionado)}
              className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-black"
            >
              Aprovar
            </button>

            <button
              onClick={() => recusarRestaurante(restauranteSelecionado.id)}
              className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black"
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
            <Detalhe
              label="Validade"
              valor={promoSelecionada.validade || promoSelecionada.data_validade}
            />
            <Detalhe
              label="Cupons disponíveis"
              valor={
                promoSelecionada.quantidade ||
                promoSelecionada.cupons_disponiveis
              }
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => aprovarPromocao(promoSelecionada.id)}
              className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-black"
            >
              Aprovar
            </button>

            <button
              onClick={() => recusarPromocao(promoSelecionada.id)}
              className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black"
            >
              Recusar
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}

function Card({ icon, number, label }) {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm">
      <div className="text-[#FF5A1F]">{icon}</div>
      <p className="text-3xl font-black mt-3">{number}</p>
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