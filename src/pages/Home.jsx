import { useEffect, useState } from "react";
import {
  Search,
  Flame,
  MapPin,
  MoreVertical,
  X,
  Ticket,
  Heart,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../services/supabase";
import BottomNav from "../components/BottomNav";
import BotaoNotificacao from "../components/BotaoNotificacao";

export default function Home() {
  const [promocoes, setPromocoes] = useState([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");
  const [filtroDisponibilidade, setFiltroDisponibilidade] = useState("todos");
  const [menuAberto, setMenuAberto] = useState(false);
  const [usuarioEmail, setUsuarioEmail] = useState("Visitante");
  const [economiaMes, setEconomiaMes] = useState(0);
  const [busca, setBusca] = useState("");
  const [favoritos, setFavoritos] = useState([]);

  const categorias = [
    "Todos",
    "Hambúrguer",
    "Pizza",
    "Açaí",
    "Marmita",
    "Sushi/Japonês",
    "Churrasco",
    "Frango",
    "Pastel",
    "Esfiha",
    "Hot Dog",
    "Doces",
    "Sorvete",
    "Bebidas",
    "Padaria",
    "Lanchonete",
    "Restaurante",
  ];

  function converterPreco(valor) {
    if (!valor) return 0;

    const texto = String(valor).replace("R$", "").trim();

    if (texto.includes(",")) {
      return Number(texto.replace(/\./g, "").replace(",", "."));
    }

    return Number(texto);
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

  function promocaoDisponivel(promo) {
    return (
      promo.status === "Ativa" &&
      !promocaoVencida(promo) &&
      !promocaoEsgotada(promo)
    );
  }

  function fraseUrgencia(promo) {
    const total = Number(promo.quantidade_total || 0);
    const resgatada = Number(promo.quantidade_resgatada || 0);
    const restantes = total > 0 ? total - resgatada : null;

    if (promocaoEsgotada(promo)) {
      return "Essa acabou rápido. Fique atento às próximas.";
    }

    if (restantes !== null && restantes <= 3) {
      return "Últimas unidades. Pode acabar a qualquer momento.";
    }

    if (restantes !== null && restantes <= 10) {
      return "Alta procura nesta oferta.";
    }

    return "Oferta limitada por tempo determinado.";
  }

  async function carregarUsuario() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    setUsuarioEmail(user.email);

    const { data: resgates } = await supabase
      .from("redemptions")
      .select("*")
      .eq("auth_user_id", user.id);

    if (!resgates || resgates.length === 0) return;

    const mesAtual = new Date().getMonth();
    const anoAtual = new Date().getFullYear();

    const resgatesDoMes = resgates.filter((item) => {
      const data = new Date(item.created_at);
      return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
    });

    let totalEconomizado = 0;

    for (const resgate of resgatesDoMes) {
      const { data: promocao } = await supabase
        .from("promotions")
        .select("*")
        .eq("id", resgate.promotion_id)
        .single();

      if (promocao) {
        const antigo = converterPreco(promocao.preco_antigo);
        const novo = converterPreco(promocao.preco_promocional);

        if (antigo > novo) {
          totalEconomizado += antigo - novo;
        }
      }
    }

    setEconomiaMes(totalEconomizado);
  }

  async function carregarPromocoes() {
    const { data, error } = await supabase
      .from("promotions")
      .select("*")
      .eq("status", "Ativa")
      .order("id", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setPromocoes(data || []);
  }

  async function carregarFavoritos() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("favorites")
      .select("*")
      .eq("auth_user_id", user.id);

    if (error) {
      console.log(error);
      return;
    }

    setFavoritos(data || []);
  }

  async function favoritarPromocao(promotionId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Faça login para favoritar.");
      return;
    }

    const jaExiste = favoritos.find(
      (item) => Number(item.promotion_id) === Number(promotionId)
    );

    if (jaExiste) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("id", jaExiste.id);

      if (error) {
        console.log(error);
        alert(error.message);
        return;
      }

      await carregarFavoritos();
      return;
    }

    const { error } = await supabase.from("favorites").insert([
      {
        auth_user_id: user.id,
        promotion_id: promotionId,
        created_at: new Date(),
      },
    ]);

    if (error) {
      console.log(error);
      alert(error.message);
      return;
    }

    await carregarFavoritos();
  }

  async function sair() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  function calcularDesconto(promo) {
    const antigo = converterPreco(promo.preco_antigo);
    const novo = converterPreco(promo.preco_promocional);

    if (!antigo || !novo || antigo <= novo) return 0;

    return Math.round(((antigo - novo) / antigo) * 100);
  }

  const promocoesFiltradas = promocoes.filter((promo) => {
    const mesmaCategoria =
      categoriaAtiva === "Todos" || promo.categoria === categoriaAtiva;

    const textoBusca = busca.toLowerCase();

    const bateBusca =
      promo.titulo?.toLowerCase().includes(textoBusca) ||
      promo.descricao?.toLowerCase().includes(textoBusca) ||
      promo.categoria?.toLowerCase().includes(textoBusca);

    const passaDisponibilidade =
      filtroDisponibilidade === "todos" || promocaoDisponivel(promo);

    return mesmaCategoria && bateBusca && passaDisponibilidade;
  });

  useEffect(() => {
    carregarUsuario();
    carregarPromocoes();
    carregarFavoritos();
  }, []);

  return (
    <main className="min-h-screen bg-[#F7F7F7] pb-28 relative">
      {menuAberto && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-72 h-full p-5 rounded-r-[32px] shadow-2xl">
            <div className="flex items-center justify-between">
              <img
                src="/logo-promoja.png"
                alt="PromoJá"
                className="h-22 object-contain"
              />

              <button
                onClick={() => setMenuAberto(false)}
                className="bg-[#1C1C1C] text-white w-10 h-10 rounded-2xl flex items-center justify-center"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-4">
              <h2 className="text-xl font-black text-[#1C1C1C] capitalize">
                {usuarioEmail.split("@")[0]}
              </h2>

              <p className="text-sm text-zinc-500 mt-1">{usuarioEmail}</p>
            </div>

            <div className="mt-6 bg-[#1C1C1C] text-white rounded-3xl p-5 shadow-lg">
              <p className="text-sm text-zinc-300">Economia no mês</p>

              <p className="text-4xl font-black text-[#FF5A1F] mt-2">
                R$ {economiaMes.toFixed(2).replace(".", ",")}
              </p>
            </div>

            <Link
              to="/meus-resgates"
              className="mt-5 flex items-center gap-3 bg-[#F7F7F7] hover:bg-[#FFE5DB] transition-all rounded-2xl p-4 font-black"
            >
              <Ticket className="text-[#FF5A1F]" />
              Meus resgates
            </Link>

            <button
              onClick={sair}
              className="mt-4 w-full bg-[#FF5A1F] hover:bg-[#e74d15] transition-all text-white py-4 rounded-2xl font-black shadow-lg"
            >
              Sair da conta
            </button>
          </div>
        </div>
      )}

      <section className="px-5 pt-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setMenuAberto(true)}
            className="bg-[#1C1C1C] text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all"
          >
            <MoreVertical size={22} />
          </button>

          <img
            src="/logo-promoja.png"
            alt="PromoJá"
            className="h-22 object-contain"
          />

          <div className="w-12 h-12" />
        </div>
      </section>

      <section className="bg-[#1C1C1C] text-white mx-5 mt-5 px-5 py-6 rounded-[32px] shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black">Promoções da sua cidade</h2>

            <p className="text-sm text-zinc-300 mt-1">
              Ofertas limitadas. Quando acabar, acabou.
            </p>
          </div>

          <div className="bg-[#FF5A1F] w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">
            %
          </div>
        </div>

        <div className="mt-5 bg-white rounded-2xl px-4 py-3 flex items-center gap-2 text-zinc-700 shadow-sm">
          <Search size={18} />

          <input
            placeholder="Buscar promoção..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="outline-none w-full text-sm bg-transparent"
          />
        </div>
      </section>

      <section className="px-5 mt-5">
  <BotaoNotificacao />
</section>

      <section className="px-5 mt-6">
        <div className="bg-white rounded-2xl p-1 flex gap-1 shadow-sm">
          <button
            onClick={() => setFiltroDisponibilidade("todos")}
            className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${
              filtroDisponibilidade === "todos"
                ? "bg-[#1C1C1C] text-white"
                : "text-zinc-500"
            }`}
          >
            Todos
          </button>

          <button
            onClick={() => setFiltroDisponibilidade("disponiveis")}
            className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${
              filtroDisponibilidade === "disponiveis"
                ? "bg-[#FF5A1F] text-white"
                : "text-zinc-500"
            }`}
          >
            Disponíveis
          </button>
        </div>
      </section>

      <section className="px-5 mt-5">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {categorias.map((item) => (
            <button
              key={item}
              onClick={() => setCategoriaAtiva(item)}
              className={`px-5 py-2 rounded-full text-sm font-black shadow-sm whitespace-nowrap transition-all ${
                categoriaAtiva === item
                  ? "bg-[#FF5A1F] text-white scale-105"
                  : "bg-white text-[#1C1C1C]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="px-5 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="text-[#FF5A1F]" />

          <h2 className="font-black text-xl">
            Promoções em alta ({promocoesFiltradas.length})
          </h2>
        </div>

        <div className="space-y-5">
          {promocoesFiltradas.length === 0 && (
            <div className="bg-white rounded-3xl p-6 text-center shadow-sm">
              <p className="font-black">Nenhuma promoção encontrada.</p>

              <p className="text-sm text-zinc-500 mt-1">
                Tente outra categoria ou busca.
              </p>
            </div>
          )}

          {promocoesFiltradas.map((promo) => {
            const favoritoAtivo = favoritos.find(
              (item) => Number(item.promotion_id) === Number(promo.id)
            );

            const total = Number(promo.quantidade_total || 0);
            const resgatada = Number(promo.quantidade_resgatada || 0);
            const restantes = total > 0 ? Math.max(total - resgatada, 0) : null;
            const esgotada = promocaoEsgotada(promo);
            const vencida = promocaoVencida(promo);
            const indisponivel = esgotada || vencida;

            return (
              <div
                key={promo.id}
                className={`bg-white rounded-[28px] overflow-hidden shadow-sm transition-all relative ${
                  indisponivel ? "opacity-60 grayscale" : "hover:shadow-xl"
                }`}
              >
                <div className="relative">
                  <img
                    src={promo.imagem_url}
                    className="h-44 w-full object-cover"
                    alt={promo.titulo}
                  />

                  {indisponivel && (
                    <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                      <div className="bg-red-600 text-white px-5 py-3 rounded-2xl font-black flex items-center gap-2 shadow-xl">
                        <X size={22} />
                        {esgotada ? "PROMOÇÃO ESGOTADA" : "PROMOÇÃO ENCERRADA"}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => favoritarPromocao(promo.id)}
                    className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm hover:bg-[#FFE5DB] transition-all w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg"
                  >
                    <Heart
                      size={22}
                      className={
                        favoritoAtivo
                          ? "fill-[#FF5A1F] text-[#FF5A1F]"
                          : "text-[#FF5A1F]"
                      }
                    />
                  </button>
                </div>

                <div className="p-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs font-black bg-[#FF5A1F] text-white px-3 py-1 rounded-full">
                      🔥 {calcularDesconto(promo)}% OFF
                    </span>

                    {restantes !== null && !indisponivel && (
                      <span
                        className={`text-xs font-black px-3 py-1 rounded-full ${
                          restantes <= 3
                            ? "bg-red-100 text-red-700"
                            : "bg-[#1C1C1C] text-white"
                        }`}
                      >
                        {restantes <= 3
                          ? `Últimos ${restantes} cupons`
                          : `${restantes} cupons restantes`}
                      </span>
                    )}

                    {indisponivel && (
                      <span className="text-xs font-black bg-red-100 text-red-700 px-3 py-1 rounded-full">
                        Esgotada
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-black mt-3">{promo.titulo}</h3>

                  <p className="text-sm text-zinc-500 flex items-center gap-1 mt-1">
                    <MapPin size={14} />
                    {promo.categoria || "Promoção"}
                  </p>

                  <div className="mt-3 bg-[#FFF3EE] border border-[#FFD5C7] rounded-2xl p-3 flex gap-2">
                    <AlertCircle className="text-[#FF5A1F] min-w-5" size={18} />
                    <p className="text-xs font-bold text-zinc-700">
                      {fraseUrgencia(promo)}
                    </p>
                  </div>

                  <div className="flex items-end justify-between mt-4">
                    <div>
                      <p className="text-sm line-through text-zinc-400">
                        R$ {promo.preco_antigo}
                      </p>

                      <p className="text-2xl font-black text-[#FF5A1F]">
                        R$ {promo.preco_promocional}
                      </p>
                    </div>

                    {indisponivel ? (
                      <button
                        disabled
                        className="bg-zinc-200 text-zinc-500 px-5 py-3 rounded-2xl font-black text-sm"
                      >
                        Encerrada
                      </button>
                    ) : (
                      <Link
                        to={`/promocao/${promo.id}`}
                        className="bg-[#1C1C1C] hover:bg-[#FF5A1F] transition-all text-white px-5 py-3 rounded-2xl font-black text-sm"
                      >
                        Pegar agora
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <BottomNav />
    </main>
  );
}