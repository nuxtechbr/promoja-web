import { useEffect, useState } from "react";
import {
  Search,
  Flame,
  MoreVertical,
  X,
  Ticket,
  Heart,
  AlertCircle,
  Trophy,
  Star,
  Clock3,
  Zap,
  MapPin,
  LocateFixed,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../services/supabase";
import BottomNav from "../components/BottomNav";
import BotaoNotificacao from "../components/BotaoNotificacao";

export default function Home() {
  const [promocoes, setPromocoes] = useState([]);
  const [rankingRestaurantes, setRankingRestaurantes] = useState([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");
  const [filtroDisponibilidade, setFiltroDisponibilidade] = useState("todos");
  const [menuAberto, setMenuAberto] = useState(false);
  const [usuarioEmail, setUsuarioEmail] = useState("Visitante");
  const [economiaMes, setEconomiaMes] = useState(0);
  const [busca, setBusca] = useState("");
  const [favoritos, setFavoritos] = useState([]);

  const [latitudeUsuario, setLatitudeUsuario] = useState(null);
  const [longitudeUsuario, setLongitudeUsuario] = useState(null);
  const [localizacaoAtiva, setLocalizacaoAtiva] = useState(false);
  const [buscandoLocalizacao, setBuscandoLocalizacao] = useState(false);

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

  function statusNormalizado(valor) {
    return String(valor || "").toLowerCase();
  }

  function promocaoAtiva(promo) {
    return ["ativa", "ativo", "aprovada", "aprovado", "Ativa"].includes(
      promo.status
    ) || ["ativa", "ativo", "aprovada", "aprovado"].includes(statusNormalizado(promo.status));
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

  function horaParaMinutos(hora) {
    if (!hora) return null;

    const partes = String(hora).slice(0, 5).split(":");

    return Number(partes[0]) * 60 + Number(partes[1]);
  }

  function restauranteAbertoAgora(horarios = []) {
    if (!horarios || horarios.length === 0) return false;

    const agora = new Date();
    const diaAtual = agora.getDay();
    const diaAnterior = diaAtual === 0 ? 6 : diaAtual - 1;
    const minutoAtual = agora.getHours() * 60 + agora.getMinutes();

    const horarioHoje = horarios.find(
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

    const horarioOntem = horarios.find(
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

    if (!horario) return "⚡ DROP EM BREVE";

    if (dropLiberado(promo)) {
      return "⚡ DROP AO VIVO";
    }

    const hora = horario.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return `⚡ DROP às ${hora}`;
  }

  function promocaoDisponivel(promo) {
    return (
      promocaoAtiva(promo) &&
      promo.restaurante_aberto === true &&
      !promocaoVencida(promo) &&
      !promocaoEsgotada(promo) &&
      dropLiberado(promo)
    );
  }

  function getRestaurantId(item) {
    return item.restaurant_id || item.id;
  }

  function calcularDistancia(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;

    const R = 6371;
    const dLat = ((Number(lat2) - Number(lat1)) * Math.PI) / 180;
    const dLon = ((Number(lon2) - Number(lon1)) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((Number(lat1) * Math.PI) / 180) *
        Math.cos((Number(lat2) * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  function formatarDistancia(distancia) {
    if (distancia === null || distancia === undefined) return null;

    if (distancia < 1) {
      return `${Math.round(distancia * 1000)}m`;
    }

    return `${distancia.toFixed(1)}km`;
  }

  function pegarLocalizacaoUsuario() {
    if (!navigator.geolocation) {
      setLocalizacaoAtiva(false);
      return;
    }

    setBuscandoLocalizacao(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitudeUsuario(position.coords.latitude);
        setLongitudeUsuario(position.coords.longitude);
        setLocalizacaoAtiva(true);
        setBuscandoLocalizacao(false);
      },
      (error) => {
        console.log(error);
        setLatitudeUsuario(null);
        setLongitudeUsuario(null);
        setLocalizacaoAtiva(false);
        setBuscandoLocalizacao(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }

  function fraseUrgencia(promo) {
    const restantes = quantidadeRestante(promo);

    if (promocaoEsgotada(promo)) {
      return "Essa acabou rápido. Fique atento às próximas.";
    }

    if (promo.tipo_promocao === "drop") {
      return dropLiberado(promo)
        ? "DROP relâmpago disponível agora."
        : "Esse drop será liberado no horário marcado.";
    }

    if (restantes !== null && restantes >= 6 && restantes <= 10) {
      return "Alta procura nesta oferta.";
    }

    if (restantes !== null && restantes >= 3 && restantes <= 5) {
      return "Últimos cupons disponíveis.";
    }

    if (restantes !== null && restantes >= 1 && restantes <= 2) {
      return "Acabando agora. Pode sumir a qualquer momento.";
    }

    return "Oferta limitada por tempo determinado.";
  }

  function calcularDesconto(promo) {
    const antigo = converterPreco(promo.preco_antigo);
    const novo = converterPreco(promo.preco_promocional);

    if (!antigo || !novo || antigo <= novo) return 0;

    return Math.round(((antigo - novo) / antigo) * 100);
  }

  function statusUrgenciaCard(promo) {
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
    const agora = new Date();

    const { data, error } = await supabase
      .from("promotions")
      .select("*")
      .in("status", ["ativa", "Ativa", "ativo", "aprovada", "aprovado"])
      .order("id", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    const { data: restaurantesData } = await supabase
      .from("restaurants")
      .select("id,nome,cidade,bairro,latitude,longitude,status");

    const { data: horariosData } = await supabase
      .from("restaurant_hours")
      .select("*");

    const promocoesTratadas = [];

    for (const promo of data || []) {
      if (promo.ocultar === true) continue;

      const esgotada = promocaoEsgotada(promo);
      const vencida = promocaoVencida(promo);

      if (vencida) continue;

      if (esgotada && !promo.esgotou_em) {
        await supabase
          .from("promotions")
          .update({ esgotou_em: new Date() })
          .eq("id", promo.id);

        promo.esgotou_em = new Date().toISOString();
      }

      if (esgotada && promo.esgotou_em) {
        const esgotouEm = new Date(promo.esgotou_em);
        const horas = (agora - esgotouEm) / (1000 * 60 * 60);

        if (horas >= 24) {
          await supabase
            .from("promotions")
            .update({ ocultar: true })
            .eq("id", promo.id);

          continue;
        }
      }

      const restaurante = (restaurantesData || []).find(
        (item) => Number(item.id) === Number(promo.restaurant_id)
      );

      const horariosRestaurante = (horariosData || []).filter(
        (item) => Number(item.restaurant_id) === Number(promo.restaurant_id)
      );

      const aberto = restauranteAbertoAgora(horariosRestaurante);

      const distancia =
        latitudeUsuario &&
        longitudeUsuario &&
        restaurante?.latitude &&
        restaurante?.longitude
          ? calcularDistancia(
              latitudeUsuario,
              longitudeUsuario,
              restaurante.latitude,
              restaurante.longitude
            )
          : null;

      promocoesTratadas.push({
        ...promo,
        restaurante_nome: restaurante?.nome || "Restaurante",
        restaurante_cidade: restaurante?.cidade || "",
        restaurante_bairro: restaurante?.bairro || "",
        restaurante_latitude: restaurante?.latitude || null,
        restaurante_longitude: restaurante?.longitude || null,
        restaurante_aberto: aberto,
        distancia_km: distancia,
      });
    }

    const ordenadas = promocoesTratadas.sort((a, b) => {
      if (a.distancia_km === null && b.distancia_km === null) {
        return Number(b.quantidade_resgatada || 0) - Number(a.quantidade_resgatada || 0);
      }

      if (a.distancia_km === null) return 1;
      if (b.distancia_km === null) return -1;

      return a.distancia_km - b.distancia_km;
    });

    setPromocoes(ordenadas);
  }

  async function carregarRankingRestaurantes() {
    const { data, error } = await supabase
      .from("restaurant_ranking")
      .select("*")
      .order("average_rating", { ascending: false })
      .limit(5);

    if (error) {
      console.log("Erro ao carregar ranking:", error);
      return;
    }

    const { data: horariosData } = await supabase
      .from("restaurant_hours")
      .select("*");

    const rankingComStatus = (data || []).map((item) => {
      const restaurantId = getRestaurantId(item);

      const horariosRestaurante = (horariosData || []).filter(
        (horario) => Number(horario.restaurant_id) === Number(restaurantId)
      );

      return {
        ...item,
        aberto_agora: restauranteAbertoAgora(horariosRestaurante),
      };
    });

    setRankingRestaurantes(rankingComStatus);
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
      alert(error.message);
      return;
    }

    await carregarFavoritos();
  }

  async function sair() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const promocoesFiltradas = promocoes.filter((promo) => {
    const mesmaCategoria =
      categoriaAtiva === "Todos" || promo.categoria === categoriaAtiva;

    const textoBusca = busca.toLowerCase();

    const bateBusca =
      promo.titulo?.toLowerCase().includes(textoBusca) ||
      promo.descricao?.toLowerCase().includes(textoBusca) ||
      promo.categoria?.toLowerCase().includes(textoBusca) ||
      promo.restaurante_nome?.toLowerCase().includes(textoBusca) ||
      promo.restaurante_cidade?.toLowerCase().includes(textoBusca) ||
      promo.restaurante_bairro?.toLowerCase().includes(textoBusca);

    const passaDisponibilidade =
      filtroDisponibilidade === "todos" || promocaoDisponivel(promo);

    return mesmaCategoria && bateBusca && passaDisponibilidade;
  });

  const dropsDestaque = promocoesFiltradas.filter(
    (promo) => promo.tipo_promocao === "drop"
  );

  const promocoesSemDrop = promocoesFiltradas.filter(
    (promo) => promo.tipo_promocao !== "drop"
  );

  const ultimosCupons = promocoesSemDrop.filter((promo) => {
    const restantes = quantidadeRestante(promo);

    return restantes !== null && restantes >= 1 && restantes <= 5;
  });

  const promocoesPrincipais = promocoesSemDrop.filter((promo) => {
    const restantes = quantidadeRestante(promo);

    return !(restantes !== null && restantes >= 1 && restantes <= 5);
  });

  const bombandoAgora = promocoesSemDrop
    .filter((promo) => Number(promo.quantidade_resgatada || 0) > 0)
    .sort(
      (a, b) =>
        Number(b.quantidade_resgatada || 0) -
        Number(a.quantidade_resgatada || 0)
    )
    .slice(0, 6);

  useEffect(() => {
    pegarLocalizacaoUsuario();
    carregarUsuario();
    carregarFavoritos();
    carregarRankingRestaurantes();
  }, []);

  useEffect(() => {
    carregarPromocoes();
  }, [latitudeUsuario, longitudeUsuario]);

  return (
    <div className="min-h-screen bg-[#F7F5F2] pb-24 overflow-x-hidden">
      {menuAberto && (
        <div className="fixed inset-0 z-50 bg-black/40">
          <div className="absolute right-0 top-0 h-full w-[82%] max-w-sm bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <img
                src="/logo-promoja.png"
                alt="PromoJá"
                className="h-14 object-contain"
              />

              <button
                onClick={() => setMenuAberto(false)}
                className="bg-[#1C1C1C] text-white w-10 h-10 rounded-2xl flex items-center justify-center"
              >
                <X size={20} />
              </button>
            </div>

            <h2 className="text-xl font-black text-[#1C1C1C]">
              {usuarioEmail.split("@")[0]}
            </h2>

            <p className="text-sm text-zinc-500 mb-5">{usuarioEmail}</p>

            <div className="bg-[#FFF0E8] rounded-3xl p-4 mb-4">
              <p className="text-sm font-bold text-zinc-500">
                Economia no mês
              </p>

              <p className="text-2xl font-black text-[#FF5A1F]">
                R$ {economiaMes.toFixed(2).replace(".", ",")}
              </p>
            </div>

            <Link
              to="/meus-resgates"
              className="block bg-[#1C1C1C] text-white rounded-2xl p-4 font-black mb-3"
            >
              Meus resgates
            </Link>

            <button
              onClick={sair}
              className="w-full bg-red-50 text-red-600 rounded-2xl p-4 font-black text-left"
            >
              Sair da conta
            </button>
          </div>
        </div>
      )}

      <header className="px-4 pt-5 pb-4 bg-[#F7F5F2] sticky top-0 z-30">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between gap-3 mb-4">
            <button
              onClick={() => setMenuAberto(true)}
              className="bg-[#1C1C1C] text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shrink-0 active:scale-95 transition-all"
            >
              <MoreVertical size={22} />
            </button>

            <img
              src="/logo-promoja.png"
              alt="PromoJá"
              className="h-14 object-contain"
            />

            <div className="shrink-0">
              <BotaoNotificacao />
            </div>
          </div>

          <div className="bg-[#1C1C1C] rounded-[2rem] p-4 text-white shadow-xl mb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#FFB08A] font-black">
                  PromoJá ao vivo
                </p>

                <h1 className="text-2xl font-black leading-tight mt-1">
                  Cupons perto de você
                </h1>

                <p className="text-xs text-zinc-300 mt-1">
                  O app mostra ofertas de acordo com sua localização.
                </p>
              </div>

              <div className="bg-[#FF5A1F] w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg">
                <Zap size={20} />
              </div>
            </div>

            <div className="mt-4 bg-white/10 border border-white/10 rounded-2xl px-3 py-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black text-white flex items-center gap-1">
                  <MapPin size={14} />
                  {localizacaoAtiva
                    ? "Localização ativada"
                    : buscandoLocalizacao
                   ? "Buscando sua localização..."
                    : "Ative sua localização"}
                </p>

                <p className="text-[11px] text-zinc-300 mt-1">
                  {localizacaoAtiva
                    ? "Mostrando promoções mais próximas primeiro."
                    : "Assim você encontra ofertas da sua região."}
                </p>
              </div>

              <button
                onClick={pegarLocalizacaoUsuario}
                className="bg-[#FF5A1F] text-white text-xs font-black px-3 py-2 rounded-full flex items-center gap-1"
              >
                <LocateFixed size={14} />
                {localizacaoAtiva ? "OK" : "Ativar"}
              </button>
            </div>
          </div>

          <div className="mt-4 bg-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">
            <Search size={20} className="text-zinc-400 shrink-0" />

            <input
              type="text"
              placeholder="Buscar cupom, cidade, bairro ou restaurante..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="outline-none w-full text-sm bg-transparent"
            />
          </div>

          <div className="mt-3 bg-white rounded-2xl p-1 flex shadow-sm">
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
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4">
        <div className="flex gap-2 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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

        {dropsDestaque.length > 0 && (
          <section className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-lg font-black text-[#1C1C1C] flex items-center gap-2">
                  <Zap size={20} className="text-[#FF5A1F]" />
                  Drops perto de você
                </h2>

                <p className="text-xs text-zinc-500 font-bold">
                  Ofertas rápidas com horário marcado.
                </p>
              </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {dropsDestaque.map((promo) => {
                const liberado = dropLiberado(promo);
                const distanciaTexto = formatarDistancia(promo.distancia_km);

                return (
                  <Link
                    key={promo.id}
                    to={`/promocao/${promo.id}`}
                    className={`min-w-[260px] rounded-[2rem] overflow-hidden shadow-xl text-white active:scale-95 transition-all ${
                      liberado
                        ? "bg-gradient-to-br from-[#FF5A1F] to-[#ff7a3d]"
                        : "bg-gradient-to-br from-purple-700 to-[#1C1C1C]"
                    }`}
                  >
                    {promo.imagem_url ? (
                      <img
                        src={promo.imagem_url}
                        alt={promo.titulo}
                        className="w-full h-40 object-cover"
                      />
                    ) : (
                      <div className="w-full h-40 bg-white/20 flex items-center justify-center">
                        <Ticket size={40} />
                      </div>
                    )}

                    <div className="p-4">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <div className="bg-white/20 w-fit px-3 py-1 rounded-full text-xs font-black">
                          {textoDrop(promo)}
                        </div>

                        {distanciaTexto && (
                          <div className="bg-black/20 w-fit px-3 py-1 rounded-full text-xs font-black flex items-center gap-1">
                            <MapPin size={12} />
                            {distanciaTexto}
                          </div>
                        )}
                      </div>

                      <h3 className="text-xl font-black leading-tight">
                        {promo.titulo}
                      </h3>

                      <p className="text-sm text-white/90 mt-2">
                        {fraseUrgencia(promo)}
                      </p>

                      <div className="mt-4 flex items-end gap-2">
                        <p className="line-through text-white/70 text-sm">
                          R$ {promo.preco_antigo}
                        </p>

                        <p className="text-3xl font-black">
                          R$ {promo.preco_promocional}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {ultimosCupons.length > 0 && (
          <section className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock3 size={20} className="text-[#FF5A1F]" />

              <h2 className="text-lg font-black text-[#1C1C1C]">
                Acabando agora
              </h2>
            </div>

            <div className="space-y-3">
              {ultimosCupons.map((promo) => {
                const restantes = quantidadeRestante(promo);
                const status = statusUrgenciaCard(promo);
                const distanciaTexto = formatarDistancia(promo.distancia_km);

                return (
                  <Link
                    key={promo.id}
                    to={`/promocao/${promo.id}`}
                    className="bg-white rounded-3xl p-4 shadow-sm border border-orange-100 flex gap-4 active:scale-95 transition-all"
                  >
                    {promo.imagem_url ? (
                      <img
                        src={promo.imagem_url}
                        alt={promo.titulo}
                        className="w-24 h-24 rounded-2xl object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-2xl bg-[#FFF0E8] flex items-center justify-center shrink-0">
                        <Ticket size={30} className="text-[#FF5A1F]" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {status && (
                          <div
                            className={`w-fit px-3 py-1.5 rounded-full text-[10px] font-black ${status.classe}`}
                          >
                            {status.texto}
                          </div>
                        )}

                        {distanciaTexto && (
                          <div className="w-fit px-3 py-1.5 rounded-full text-[10px] font-black bg-zinc-100 text-zinc-600 flex items-center gap-1">
                            <MapPin size={11} />
                            {distanciaTexto}
                          </div>
                        )}
                      </div>

                      <h3 className="font-black leading-tight line-clamp-2">
                        {promo.titulo}
                      </h3>

                      <p className="text-sm text-zinc-500 mt-1">
                        {restantes <= 2
                          ? "Pode acabar a qualquer momento"
                          : "Poucos cupons disponíveis"}
                      </p>

                      <p className="text-2xl font-black text-[#FF5A1F] mt-3">
                        R$ {promo.preco_promocional}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-black text-[#1C1C1C] flex items-center gap-2">
                <Flame size={20} className="text-[#FF5A1F]" />
                {localizacaoAtiva
                  ? "Promoções perto de você"
                  : "Pegar cupom agora"}
              </h2>

              <p className="text-xs text-zinc-500 font-bold">
                {promocoesSemDrop.length} promoções disponíveis
              </p>
            </div>
          </div>

          {promocoesSemDrop.length === 0 && (
            <div className="bg-white rounded-3xl p-6 text-center shadow-sm">
              <AlertCircle className="mx-auto text-zinc-400 mb-3" size={32} />

              <p className="font-black text-zinc-700">
                Nenhuma promoção disponível agora.
              </p>

              <p className="text-sm text-zinc-500">
                Algumas lojas podem estar fechadas ou aguardando novas ofertas.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {promocoesPrincipais.map((promo) => {
              const favoritoAtivo = favoritos.find(
                (item) => Number(item.promotion_id) === Number(promo.id)
              );

              const esgotada = promocaoEsgotada(promo);
              const vencida = promocaoVencida(promo);
              const indisponivel = esgotada || vencida;
              const status = statusUrgenciaCard(promo);
              const distanciaTexto = formatarDistancia(promo.distancia_km);

              return (
                <div
                  key={promo.id}
                  className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-orange-50"
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
                        className={`w-full h-44 object-cover ${
                          indisponivel ? "grayscale opacity-70" : ""
                        }`}
                      />
                    ) : (
                      <div className="w-full h-44 bg-[#FFF0E8] flex items-center justify-center">
                        <Ticket size={42} className="text-[#FF5A1F]" />
                      </div>
                    )}

                    {indisponivel && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-white text-[#1C1C1C] px-4 py-2 rounded-full font-black text-sm">
                          {esgotada
                            ? "PROMOÇÃO ESGOTADA"
                            : "PROMOÇÃO ENCERRADA"}
                        </span>
                      </div>
                    )}

                    <button
                      onClick={() => favoritarPromocao(promo.id)}
                      className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm hover:bg-[#FFE5DB] transition-all w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg"
                    >
                      <Heart
                        size={21}
                        className={
                          favoritoAtivo
                            ? "text-[#FF5A1F] fill-[#FF5A1F]"
                            : "text-zinc-500"
                        }
                      />
                    </button>

                    {calcularDesconto(promo) > 0 && !status && (
                      <div className="absolute top-3 left-3 bg-[#FF5A1F] text-white px-3 py-2 rounded-full text-xs font-black">
                        {calcularDesconto(promo)}% OFF
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-xl font-black text-[#1C1C1C] line-clamp-2">
                          {promo.titulo}
                        </h3>

                        <p className="text-sm text-zinc-500 font-bold mt-1">
                          {promo.restaurante_nome} •{" "}
                          {promo.restaurante_bairro || promo.categoria}
                        </p>

                        {distanciaTexto && (
                          <p className="text-xs text-[#FF5A1F] font-black mt-1 flex items-center gap-1">
                            <MapPin size={12} />
                            {distanciaTexto} de você
                          </p>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-xs text-zinc-400 line-through font-bold">
                          R$ {promo.preco_antigo}
                        </p>

                        <p className="text-2xl font-black text-[#FF5A1F] leading-none">
                          R$ {promo.preco_promocional}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-zinc-500 mt-3">
                      {fraseUrgencia(promo)}
                    </p>

                    {indisponivel ? (
                      <button
                        disabled
                        className="mt-4 w-full bg-zinc-200 text-zinc-500 rounded-2xl py-4 font-black"
                      >
                        Encerrada
                      </button>
                    ) : (
                      <Link
                        to={`/promocao/${promo.id}`}
                        className="mt-4 block w-full bg-[#FF5A1F] text-white rounded-2xl py-4 font-black text-center active:scale-95 transition-all"
                      >
                        Pegar cupom
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {bombandoAgora.length >= 2 && (
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Flame size={20} className="text-[#FF5A1F]" />

              <h2 className="text-lg font-black text-[#1C1C1C]">
                Bombando agora
              </h2>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {bombandoAgora.map((promo) => {
                const distanciaTexto = formatarDistancia(promo.distancia_km);

                return (
                  <Link
                    key={promo.id}
                    to={`/promocao/${promo.id}`}
                    className="min-w-[180px] bg-white rounded-3xl overflow-hidden shadow-sm border border-orange-100 active:scale-95 transition-all"
                  >
                    {promo.imagem_url ? (
                      <img
                        src={promo.imagem_url}
                        alt={promo.titulo}
                        className="w-full h-28 object-cover"
                      />
                    ) : (
                      <div className="w-full h-28 bg-[#FFF0E8] flex items-center justify-center">
                        <Ticket size={30} className="text-[#FF5A1F]" />
                      </div>
                    )}

                    <div className="p-3">
                      <h3 className="font-black line-clamp-2 leading-tight">
                        {promo.titulo}
                      </h3>

                      <p className="text-xs text-zinc-500 mt-1">
                        {Number(promo.quantidade_resgatada || 0)} resgates
                      </p>

                      {distanciaTexto && (
                        <p className="text-xs text-[#FF5A1F] font-black mt-1">
                          {distanciaTexto} de você
                        </p>
                      )}

                      <p className="text-lg font-black text-[#FF5A1F] mt-3">
                        R$ {promo.preco_promocional}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {rankingRestaurantes.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-lg font-black text-[#1C1C1C] flex items-center gap-2">
                  <Trophy size={20} className="text-[#FF5A1F]" />
                  Restaurantes em alta
                </h2>

                <p className="text-xs text-zinc-500 font-bold">
                  Toque na loja e veja as promoções dela
                </p>
              </div>

              <Link
                to="/ranking"
                className="text-xs font-black text-[#FF5A1F] shrink-0"
              >
                Ver ranking
              </Link>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {rankingRestaurantes.map((item, index) => (
                <Link
                  key={`${getRestaurantId(item)}-${index}`}
                  to={`/loja/${getRestaurantId(item)}`}
                  className="min-w-[170px] bg-white rounded-3xl p-4 shadow-sm border border-orange-100 active:scale-95 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#FFF0E8] text-[#FF5A1F] flex items-center justify-center font-black">
                      #{index + 1}
                    </div>

                    <div
                      className={`flex items-center gap-1 text-[11px] font-black px-2 py-1 rounded-full ${
                        item.aberto_agora
                          ? "bg-green-100 text-green-700"
                          : "bg-zinc-200 text-zinc-600"
                      }`}
                    >
                      <Clock3 size={12} />
                      {item.aberto_agora ? "Aberto" : "Fechado"}
                    </div>
                  </div>

                  <h3 className="font-black text-[#1C1C1C] leading-tight line-clamp-2">
                    {item.restaurant_name || "Restaurante"}
                  </h3>

                  <div className="flex items-center gap-1 text-yellow-500 font-black text-sm mt-2">
                    <Star size={15} fill="currentColor" />
                    {Number(item.average_rating || 0).toFixed(1)}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <BottomNav />
    </div>
  );
}