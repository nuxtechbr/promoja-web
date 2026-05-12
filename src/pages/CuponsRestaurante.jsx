import { useEffect, useMemo, useState } from "react";
import {
  Ticket,
  CheckCircle,
  Clock,
  User,
  Store,
  LogOut,
  ShieldCheck,
  Search,
  Filter,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../services/supabase";

export default function CuponsRestaurante() {
  const [restaurante, setRestaurante] = useState(null);
  const [cupons, setCupons] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todos");

  async function carregarCupons() {
    setCarregando(true);

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
      const { data: restaurantePorEmail } = await supabase
        .from("restaurants")
        .select("*")
        .ilike("email", user.email)
        .maybeSingle();

      restauranteData = restaurantePorEmail;
    }

    if (!restauranteData) {
      alert("Este acesso não pertence a um restaurante parceiro.");
      window.location.href = "/parceiro/login";
      return;
    }

    setRestaurante(restauranteData);

    const { data: promocoesData, error: promocoesError } = await supabase
      .from("promotions")
      .select("*")
      .eq("restaurant_id", restauranteData.id);

    if (promocoesError) {
      alert(promocoesError.message);
      setCarregando(false);
      return;
    }

    const idsPromocoes = (promocoesData || []).map((promo) => promo.id);

    if (idsPromocoes.length === 0) {
      setCupons([]);
      setCarregando(false);
      return;
    }

    const { data: redemptionsData, error: redemptionsError } =
      await supabase
        .from("redemptions")
        .select("*")
        .in("promotion_id", idsPromocoes)
        .order("id", { ascending: false });

    if (redemptionsError) {
      alert(redemptionsError.message);
      setCarregando(false);
      return;
    }

    const cuponsCompletos = (redemptionsData || []).map((cupom) => {
      const promocao = promocoesData.find(
        (promo) => Number(promo.id) === Number(cupom.promotion_id)
      );

      return {
        ...cupom,
        promocao,
      };
    });

    setCupons(cuponsCompletos);
    setCarregando(false);
  }

  async function confirmarCupom(cupom) {
    if (
      cupom.status === "confirmado" ||
      cupom.status === "utilizado"
    ) {
      alert("Esse cupom já foi validado.");
      return;
    }

    const confirmar = window.confirm(
      `Confirmar utilização do cupom ${cupom.codigo}?`
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("redemptions")
      .update({
        status: "confirmado",
        validated_at: new Date().toISOString(),
      })
      .eq("id", cupom.id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Cupom validado com sucesso.");

    carregarCupons();
  }

  async function cancelarCupom(cupom) {
    const confirmar = window.confirm(
      `Cancelar o cupom ${cupom.codigo}?`
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("redemptions")
      .update({
        status: "cancelado",
      })
      .eq("id", cupom.id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Cupom cancelado.");

    carregarCupons();
  }

  async function sair() {
    await supabase.auth.signOut();
    window.location.href = "/parceiro/login";
  }

  useEffect(() => {
    carregarCupons();
  }, []);

  function statusBadge(status) {
    const s = String(status || "").toLowerCase();

    if (s === "confirmado") {
      return {
        texto: "✅ Confirmado",
        classe: "bg-green-100 text-green-700",
      };
    }

    if (s === "cancelado") {
      return {
        texto: "❌ Cancelado",
        classe: "bg-red-100 text-red-700",
      };
    }

    return {
      texto: "⏳ Pendente",
      classe: "bg-yellow-100 text-yellow-700",
    };
  }

  const cuponsFiltrados = useMemo(() => {
    let lista = [...cupons];

    if (filtro === "pendentes") {
      lista = lista.filter(
        (c) =>
          c.status !== "confirmado" &&
          c.status !== "cancelado"
      );
    }

    if (filtro === "confirmados") {
      lista = lista.filter(
        (c) => c.status === "confirmado"
      );
    }

    if (filtro === "cancelados") {
      lista = lista.filter(
        (c) => c.status === "cancelado"
      );
    }

    if (busca.trim()) {
      const termo = busca.toLowerCase();

      lista = lista.filter((cupom) => {
        return (
          String(cupom.codigo || "")
            .toLowerCase()
            .includes(termo) ||
          String(cupom.promocao?.titulo || "")
            .toLowerCase()
            .includes(termo)
        );
      });
    }

    return lista;
  }, [cupons, busca, filtro]);

  const confirmados = cupons.filter(
    (cupom) => cupom.status === "confirmado"
  ).length;

  const pendentes = cupons.filter(
    (cupom) =>
      cupom.status !== "confirmado" &&
      cupom.status !== "cancelado"
  ).length;

  if (carregando) {
    return (
      <main className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <p className="font-black text-[#FF5A1F]">
          Carregando cupons...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F7F7] px-5 py-6 pb-10">
      <section className="bg-[#1C1C1C] text-white rounded-[32px] p-6 shadow-xl">
        <img
          src="/logo-promoja.png"
          alt="PromoJá"
          className="h-20 object-contain mx-auto mb-4"
        />

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-300">
              Área do parceiro
            </p>

            <h1 className="text-3xl font-black mt-1">
              Validar cupons
            </h1>

            <p className="text-sm text-zinc-300 mt-2">
              {restaurante?.nome}
            </p>
          </div>

          <button
            onClick={sair}
            className="bg-white/10 w-11 h-11 rounded-2xl flex items-center justify-center"
          >
            <LogOut size={20} />
          </button>
        </div>
      </section>

      {/* CARDS */}
      <section className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <Ticket className="text-[#FF5A1F]" />

          <p className="text-3xl font-black mt-3">
            {cupons.length}
          </p>

          <p className="text-sm text-zinc-500">
            Total
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <ShieldCheck className="text-green-600" />

          <p className="text-3xl font-black mt-3">
            {confirmados}
          </p>

          <p className="text-sm text-zinc-500">
            Confirmados
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <Clock className="text-yellow-600" />

          <p className="text-3xl font-black mt-3">
            {pendentes}
          </p>

          <p className="text-sm text-zinc-500">
            Pendentes
          </p>
        </div>
      </section>

      {/* FILTROS */}
      <section className="mt-6 bg-white rounded-3xl p-4 shadow-sm">
        <div className="flex items-center gap-2 bg-[#F7F7F7] rounded-2xl px-4 py-4">
          <Search size={18} className="text-zinc-400" />

          <input
            type="text"
            placeholder="Buscar cupom..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="bg-transparent w-full outline-none font-bold"
          />
        </div>

        <div className="grid grid-cols-4 gap-2 mt-4">
          <FiltroBotao
            ativo={filtro === "todos"}
            onClick={() => setFiltro("todos")}
          >
            Todos
          </FiltroBotao>

          <FiltroBotao
            ativo={filtro === "pendentes"}
            onClick={() => setFiltro("pendentes")}
          >
            Pendentes
          </FiltroBotao>

          <FiltroBotao
            ativo={filtro === "confirmados"}
            onClick={() => setFiltro("confirmados")}
          >
            Confirmados
          </FiltroBotao>

          <FiltroBotao
            ativo={filtro === "cancelados"}
            onClick={() => setFiltro("cancelados")}
          >
            Cancelados
          </FiltroBotao>
        </div>
      </section>

      <Link
        to="/parceiro/painel"
        className="mt-6 w-full bg-[#1C1C1C] text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2"
      >
        <Store size={20} />
        Voltar ao painel
      </Link>

      {/* LISTA */}
      <section className="mt-6 space-y-5">
        {cuponsFiltrados.length === 0 && (
          <div className="bg-white rounded-3xl p-6 text-center shadow-sm">
            <div className="bg-[#FFF3EE] w-16 h-16 rounded-3xl flex items-center justify-center mx-auto">
              <Ticket
                className="text-[#FF5A1F]"
                size={30}
              />
            </div>

            <h2 className="font-black text-xl mt-4">
              Nenhum cupom encontrado
            </h2>
          </div>
        )}

        {cuponsFiltrados.map((cupom) => {
          const badge = statusBadge(cupom.status);

          return (
            <div
              key={cupom.id}
              className="bg-white rounded-[28px] p-5 shadow-sm border border-zinc-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span
                    className={`text-xs font-black px-3 py-1 rounded-full ${badge.classe}`}
                  >
                    {badge.texto}
                  </span>

                  <h2 className="text-2xl font-black mt-3">
                    {cupom.codigo}
                  </h2>
                </div>

                <div className="bg-[#FFF3EE] w-14 h-14 rounded-3xl flex items-center justify-center">
                  <Ticket className="text-[#FF5A1F]" />
                </div>
              </div>

              <div className="mt-5 bg-[#F7F7F7] rounded-2xl p-4 space-y-3">
                <p className="font-black">
                  {cupom.promocao?.titulo ||
                    "Promoção"}
                </p>

                <p className="text-sm text-zinc-500 flex items-center gap-2">
                  <User size={16} />
                  Cliente autenticado
                </p>

                <p className="text-sm text-zinc-500 flex items-center gap-2">
                  <Clock size={16} />
                  {new Date(
                    cupom.created_at
                  ).toLocaleString("pt-BR")}
                </p>

                {cupom.validated_at && (
                  <p className="text-sm text-green-700 flex items-center gap-2 font-bold">
                    <CheckCircle size={16} />
                    Validado em{" "}
                    {new Date(
                      cupom.validated_at
                    ).toLocaleString("pt-BR")}
                  </p>
                )}
              </div>

              {cupom.status !== "confirmado" &&
                cupom.status !== "cancelado" && (
                  <div className="grid grid-cols-2 gap-3 mt-5">
                    <button
                      onClick={() =>
                        confirmarCupom(cupom)
                      }
                      className="bg-green-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={20} />
                      Confirmar
                    </button>

                    <button
                      onClick={() =>
                        cancelarCupom(cupom)
                      }
                      className="bg-red-50 text-red-600 py-4 rounded-2xl font-black flex items-center justify-center gap-2"
                    >
                      <XCircle size={20} />
                      Cancelar
                    </button>
                  </div>
                )}

              {cupom.status === "confirmado" && (
                <div className="mt-5 bg-[#E8FFF0] text-green-700 py-4 rounded-2xl font-black text-center">
                  Cupom confirmado
                </div>
              )}

              {cupom.status === "cancelado" && (
                <div className="mt-5 bg-red-50 text-red-600 py-4 rounded-2xl font-black text-center">
                  Cupom cancelado
                </div>
              )}
            </div>
          );
        })}
      </section>
    </main>
  );
}

function FiltroBotao({
  children,
  ativo,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`py-3 rounded-2xl font-black text-sm ${
        ativo
          ? "bg-[#FF5A1F] text-white"
          : "bg-[#F7F7F7] text-zinc-700"
      }`}
    >
      {children}
    </button>
  );
}