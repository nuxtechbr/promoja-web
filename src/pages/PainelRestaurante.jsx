import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Ticket,
  LogOut,
  Store,
  BarChart3,
  Camera,
  Save,
  Copy,
  Pencil,
  Power,
  PowerOff,
} from "lucide-react";
import { supabase } from "../services/supabase";

export default function PainelRestaurante() {
  const [restaurante, setRestaurante] = useState(null);
  const [nomeRestaurante, setNomeRestaurante] = useState("");
  const [logoPreview, setLogoPreview] = useState("");
  const [logoArquivo, setLogoArquivo] = useState(null);
  const [promocoes, setPromocoes] = useState([]);
  const [cupons, setCupons] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  function criarSlug(texto) {
    return String(texto || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function promocaoEsgotada(promo) {
    const total = Number(promo.quantidade_total || 0);
    const resgatada = Number(promo.quantidade_resgatada || 0);
    return total > 0 && resgatada >= total;
  }

  function dentroDe24h(data) {
    if (!data) return true;
    return Date.now() - new Date(data).getTime() <= 24 * 60 * 60 * 1000;
  }

  function promocaoVisivel(promo) {
    const esgotada = promocaoEsgotada(promo);

    if (esgotada) {
      return dentroDe24h(promo.esgotada_em);
    }

    if (promo.validade) {
      const venceu = new Date(promo.validade).getTime() <= Date.now();

      if (venceu) {
        return dentroDe24h(promo.validade);
      }
    }

    return true;
  }

  async function carregarPainel() {
    setCarregando(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/parceiro/login";
      return;
    }

    const { data: restauranteData, error: restauranteError } = await supabase
      .from("restaurants")
      .select("*")
      .eq("auth_id", user.id)
      .single();

    if (restauranteError || !restauranteData) {
      alert("Este login não pertence a um restaurante parceiro.");
      window.location.href = "/parceiro/login";
      return;
    }

    setRestaurante(restauranteData);
    setNomeRestaurante(restauranteData.nome || "");
    setLogoPreview(restauranteData.logo_url || "");

    const { data: promocoesData } = await supabase
      .from("promotions")
      .select("*")
      .eq("restaurant_id", restauranteData.id)
      .order("id", { ascending: false });

    setPromocoes((promocoesData || []).filter(promocaoVisivel));

    const { data: todasRedemptions } = await supabase
      .from("redemptions")
      .select("*")
      .order("id", { ascending: false });

    const cuponsDoRestaurante = [];

    for (const cupom of todasRedemptions || []) {
      const { data: promocao } = await supabase
        .from("promotions")
        .select("*")
        .eq("id", cupom.promotion_id)
        .single();

      if (promocao?.restaurant_id === restauranteData.id) {
        cuponsDoRestaurante.push({
          ...cupom,
          promocao,
        });
      }
    }

    setCupons(cuponsDoRestaurante);
    setCarregando(false);
  }

  function selecionarLogo(event) {
    const arquivo = event.target.files[0];

    if (!arquivo) return;

    setLogoArquivo(arquivo);
    setLogoPreview(URL.createObjectURL(arquivo));
  }

  async function enviarLogoParaStorage() {
    if (!logoArquivo) return logoPreview;

    const nomeArquivo = `${Date.now()}-${logoArquivo.name}`;
    const caminho = `logos/${nomeArquivo}`;

    const { error } = await supabase.storage
      .from("restaurants")
      .upload(caminho, logoArquivo);

    if (error) {
      throw error;
    }

    const { data } = supabase.storage
      .from("restaurants")
      .getPublicUrl(caminho);

    return data.publicUrl;
  }

  async function salvarPerfilRestaurante() {
    setSalvando(true);

    try {
      const logoUrl = await enviarLogoParaStorage();

      const { error } = await supabase
        .from("restaurants")
        .update({
          nome: nomeRestaurante,
          logo_url: logoUrl,
        })
        .eq("id", restaurante.id);

      if (error) {
        throw error;
      }

      alert("Perfil do restaurante atualizado!");
      carregarPainel();
    } catch (error) {
      console.log(error);
      alert(error.message);
    }

    setSalvando(false);
  }

  async function alternarPromocao(promo) {
    const novoStatus = promo.status === "Ativa" ? "desativada" : "Ativa";

    const { error } = await supabase
      .from("promotions")
      .update({
        status: novoStatus,
      })
      .eq("id", promo.id);

    if (error) {
      alert(error.message);
      return;
    }

    alert(novoStatus === "Ativa" ? "Promoção ativada!" : "Promoção desativada!");
    carregarPainel();
  }

  function copiarLinkLoja() {
    const slug = criarSlug(nomeRestaurante || restaurante?.nome);

    if (!slug) {
      alert("Salve o nome do restaurante antes de copiar o link.");
      return;
    }

    const link = `https://usepromoja.com.br/loja/${slug}`;

    navigator.clipboard.writeText(link);
    alert("Link da loja copiado!");
  }

  async function sair() {
    await supabase.auth.signOut();
    window.location.href = "/parceiro/login";
  }

  useEffect(() => {
    carregarPainel();
  }, []);

  if (carregando) {
    return (
      <main className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <p className="font-black text-[#FF5A1F]">Carregando painel...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F7F7] px-5 py-6 pb-10">
      <header className="bg-[#1C1C1C] text-white rounded-[32px] p-6 shadow-xl">
        <img
          src="/logo-promoja.png"
          alt="PromoJá"
          className="h-20 object-contain mx-auto mb-4"
        />

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-300">Painel do parceiro</p>

            <h1 className="text-3xl font-black mt-1">{restaurante?.nome}</h1>

            <p className="text-sm text-zinc-300 mt-2">
              Gerencie promoções, perfil e cupons do seu restaurante.
            </p>
          </div>

          <button
            onClick={sair}
            className="bg-white/10 w-11 h-11 rounded-2xl flex items-center justify-center"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <section className="mt-6 bg-white rounded-[32px] p-5 shadow-sm">
        <h2 className="text-xl font-black">Perfil do restaurante</h2>

        <p className="text-sm text-zinc-500 mt-1">
          Essa foto e nome aparecem para o cliente na promoção.
        </p>

        <div className="mt-5 flex items-center gap-4">
          <label className="relative cursor-pointer">
            <div className="w-24 h-24 rounded-3xl bg-[#F7F7F7] overflow-hidden flex items-center justify-center border border-zinc-200">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Logo do restaurante"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Store className="text-[#FF5A1F]" size={34} />
              )}
            </div>

            <div className="absolute -bottom-2 -right-2 bg-[#FF5A1F] text-white w-9 h-9 rounded-2xl flex items-center justify-center shadow-lg">
              <Camera size={18} />
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={selecionarLogo}
              className="hidden"
            />
          </label>

          <div className="flex-1">
            <label className="text-sm font-black text-zinc-600">
              Nome do restaurante
            </label>

            <input
              type="text"
              value={nomeRestaurante}
              onChange={(e) => setNomeRestaurante(e.target.value)}
              className="mt-2 w-full bg-[#F7F7F7] rounded-2xl px-4 py-4 outline-none"
            />

            <button
              onClick={copiarLinkLoja}
              className="mt-3 bg-[#1C1C1C] text-white px-4 py-3 rounded-2xl text-sm font-black flex items-center gap-2"
            >
              <Copy size={16} />
              Copiar meu link
            </button>
          </div>
        </div>

        <button
          onClick={salvarPerfilRestaurante}
          disabled={salvando}
          className="mt-5 w-full bg-[#FF5A1F] text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2"
        >
          <Save size={20} />
          {salvando ? "Salvando..." : "Salvar perfil"}
        </button>
      </section>

      <section className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <BarChart3 className="text-[#FF5A1F]" />
          <p className="text-3xl font-black mt-3">{promocoes.length}</p>
          <p className="text-sm text-zinc-500">Promoções</p>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <Ticket className="text-[#FF5A1F]" />
          <p className="text-3xl font-black mt-3">{cupons.length}</p>
          <p className="text-sm text-zinc-500">Cupons recebidos</p>
        </div>
      </section>

      <section className="grid gap-4 mt-6">
        <Link
          to="/parceiro/nova-promocao"
          className="w-full bg-[#FF5A1F] text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg"
        >
          <Plus size={22} />
          Criar nova promoção
        </Link>

        <Link
          to="/parceiro/cupons"
          className="w-full bg-[#1C1C1C] text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg"
        >
          <Ticket size={22} />
          Validar cupons recebidos
        </Link>
      </section>

      <section className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <Store className="text-[#FF5A1F]" />
          <h2 className="text-xl font-black">Minhas promoções</h2>
        </div>

        <div className="space-y-4">
          {promocoes.length === 0 && (
            <div className="bg-white rounded-3xl p-6 text-center shadow-sm">
              <p className="font-black">Nenhuma promoção encontrada.</p>
            </div>
          )}

          {promocoes.map((promo) => {
            const total = Number(promo.quantidade_total || 0);
            const resgatada = Number(promo.quantidade_resgatada || 0);
            const restantes = total > 0 ? total - resgatada : null;
            const esgotada = promocaoEsgotada(promo);

            return (
              <div
                key={promo.id}
                className={`bg-white rounded-3xl p-4 shadow-sm ${
                  esgotada ? "opacity-70" : ""
                }`}
              >
                <div className="flex gap-4">
                  <img
                    src={promo.imagem_url}
                    alt={promo.titulo}
                    className="w-24 h-24 rounded-2xl object-cover"
                  />

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-black leading-tight">
                          {promo.titulo}
                        </h3>

                        <p className="text-sm text-zinc-500 mt-1">
                          R$ {promo.preco_promocional}
                        </p>

                        {restantes !== null && (
                          <p className="text-xs text-zinc-500 mt-1">
                            {restantes <= 0
                              ? "Promoção esgotada"
                              : `${restantes} cupons restantes`}
                          </p>
                        )}
                      </div>

                      <span
                        className={`text-xs font-black px-3 py-1 rounded-full ${
                          promo.status === "Ativa"
                            ? "bg-green-100 text-green-700"
                            : promo.status === "desativada"
                            ? "bg-zinc-200 text-zinc-600"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {promo.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <button
                        onClick={() => alternarPromocao(promo)}
                        className={`py-3 rounded-2xl text-sm font-black flex items-center justify-center gap-2 ${
                          promo.status === "Ativa"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {promo.status === "Ativa" ? (
                          <>
                            <PowerOff size={16} />
                            Desativar
                          </>
                        ) : (
                          <>
                            <Power size={16} />
                            Ativar
                          </>
                        )}
                      </button>

                      <Link
                        to={`/parceiro/editar-promocao/${promo.id}`}
                        className="bg-[#1C1C1C] text-white py-3 rounded-2xl text-sm font-black flex items-center justify-center gap-2"
                      >
                        <Pencil size={16} />
                        Editar
                      </Link>
                    </div>

                    <p className="text-[11px] text-zinc-400 mt-3">
                      Você pode editar valores e escrita sem criar outra promoção.
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}