import { useEffect, useState } from "react";
import {
  Search,
  Flame,
  MapPin,
  MoreVertical,
  X,
  Ticket,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../services/supabase";
import BottomNav from "../components/BottomNav";
import { calcularTempoRestante } from "../utils/tempo";

export default function Home() {
  const [promocoes, setPromocoes] = useState([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");
  const [menuAberto, setMenuAberto] = useState(false);
  const [usuarioEmail, setUsuarioEmail] = useState("Visitante");
  const [economiaMes, setEconomiaMes] = useState(0);
  const [busca, setBusca] = useState("");

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

    return Number(
      String(valor)
        .replace("R$", "")
        .replace(".", "")
        .replace(",", ".")
        .trim()
    );
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

        totalEconomizado += antigo - novo;
      }
    }

    setEconomiaMes(totalEconomizado);
  }

  async function carregarPromocoes() {
    const agora = new Date().toISOString();

    const { data, error } = await supabase
      .from("promotions")
      .select("*")
      .eq("status", "Ativa")
      .gte("validade", agora)
      .order("id", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setPromocoes(data || []);
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
      promo.categoria?.toLowerCase().includes(textoBusca);

    return mesmaCategoria && bateBusca;
  });

  useEffect(() => {
    carregarUsuario();
    carregarPromocoes();
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
              Economize hoje com ofertas relâmpago.
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

      <section className="px-5 mt-6">
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

          {promocoesFiltradas.map((promo) => (
            <div
              key={promo.id}
              className="bg-white rounded-[28px] overflow-hidden shadow-sm hover:shadow-xl transition-all"
            >
              <img
                src={promo.imagem_url}
                className="h-44 w-full object-cover"
                alt={promo.titulo}
              />

              <div className="p-4">
               <span className="text-xs font-black bg-[#FF5A1F] text-white px-3 py-1 rounded-full">
  🔥{" "}
  {Math.round(
    ((Number(promo.preco_antigo) -
      Number(promo.preco_promocional)) /
      Number(promo.preco_antigo)) *
      100
  )}
  % OFF
</span>

                <h3 className="text-lg font-black mt-3">{promo.titulo}</h3>

                <p className="text-sm text-zinc-500 flex items-center gap-1 mt-1">
                  <MapPin size={14} />
                  PromoJá
                </p>

                <div className="flex items-end justify-between mt-4">
                  <div>
                    <p className="text-sm line-through text-zinc-400">
                      R$ {promo.preco_antigo}
                    </p>

                    <p className="text-2xl font-black text-[#FF5A1F]">
                      R$ {promo.preco_promocional}
                    </p>
                  </div>

                  <a
                    href={`/promocao/${promo.id}`}
                    className="bg-[#1C1C1C] hover:bg-[#FF5A1F] transition-all text-white px-5 py-3 rounded-2xl font-black text-sm"
                  >
                    Pegar agora
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <BottomNav />
    </main>
  );
}