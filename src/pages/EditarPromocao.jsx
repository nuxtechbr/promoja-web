import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  ShieldAlert,
  Lock,
  CalendarClock,
} from "lucide-react";
import { supabase } from "../services/supabase";

const categorias = [
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

export default function EditarPromocao() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [promocao, setPromocao] = useState(null);
  const [restaurante, setRestaurante] = useState(null);

  const [form, setForm] = useState({
    titulo: "",
    descricao: "",
    categoria: "",
    preco_antigo: "",
    preco_promocional: "",
    quantidade_total: "",
    validade: "",
    imagem_url: "",
  });

  useEffect(() => {
  let mounted = true;

  async function init() {
    if (!mounted) return;

    await carregarPromocao();
  }

  init();

  return () => {
    mounted = false;
  };
}, []);

  async function buscarRestaurante(user) {
    const emailUsuario = String(user?.email || "")
      .trim()
      .toLowerCase();

    const { data: porAuthId } = await supabase
      .from("restaurants")
      .select("*")
      .eq("auth_id", user.id)
      .maybeSingle();

    if (porAuthId) return porAuthId;

    const { data: porEmail } = await supabase
      .from("restaurants")
      .select("*")
      .ilike("email", emailUsuario)
      .maybeSingle();

    if (porEmail) return porEmail;

    return null;
  }

  async function carregarPromocao() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/parceiro/login");
      return;
    }

    const restauranteData = await buscarRestaurante(user);

    if (!restauranteData) {
      alert("Restaurante não encontrado.");
      navigate("/parceiro/login");
      return;
    }

    setRestaurante(restauranteData);

    const { data, error } = await supabase
      .from("promotions")
      .select("*")
      .eq("id", id)
      .eq("restaurant_id", restauranteData.id)
      .maybeSingle();

    if (error) {
      alert(error.message);
      navigate("/parceiro/painel");
      return;
    }

    if (!data) {
      alert("Promoção não encontrada.");
      navigate("/parceiro/painel");
      return;
    }

    setPromocao(data);

    setForm({
      titulo: data.titulo || "",
      descricao: data.descricao || "",
      categoria: data.categoria || "",
      preco_antigo: data.preco_antigo || "",
      preco_promocional: data.preco_promocional || "",
      quantidade_total: data.quantidade_total || "",
      validade: data.validade || "",
      imagem_url: data.imagem_url || "",
    });

    setLoading(false);
  }

  function alterarCampo(campo, valor) {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  }

  async function salvarEdicao(e) {
  if (salvando) return;

  e.preventDefault();

    if (!promocao || !restaurante) return;

    if (!form.titulo.trim()) {
      alert("Informe o título.");
      return;
    }

    if (!form.descricao.trim()) {
      alert("Informe a descrição.");
      return;
    }

    if (!form.categoria) {
      alert("Escolha uma categoria.");
      return;
    }

    if (!form.preco_antigo) {
      alert("Informe o preço original.");
      return;
    }

    if (!form.preco_promocional) {
      alert("Informe o preço promocional.");
      return;
    }

    if (!form.validade) {
      alert("Informe a validade.");
      return;
    }

    setSalvando(true);

    const { error } = await supabase
      .from("promotions")
      .update({
        titulo: form.titulo.trim(),
        descricao: form.descricao.trim(),
        categoria: form.categoria,
        preco_antigo: form.preco_antigo,
        preco_promocional: form.preco_promocional,
        quantidade_total: form.quantidade_total,
        validade: form.validade,
      })
      .eq("id", promocao.id)
      .eq("restaurant_id", restaurante.id);

    if (error) {
      alert(error.message);
      setSalvando(false);
      return;
    }

   setSalvando(false);

alert("Promoção atualizada com sucesso.");
navigate("/parceiro/painel");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <p className="font-black text-[#FF5A1F]">
          Carregando edição...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F7F7] px-5 py-6 pb-10">
      <button
        onClick={() => navigate("/parceiro/painel")}
        className="bg-white w-11 h-11 rounded-full flex items-center justify-center shadow-sm"
      >
        <ArrowLeft size={22} />
      </button>

      <section className="mt-6 bg-[#1C1C1C] text-white rounded-[32px] p-6 shadow-xl">
        <img
          src="/logo-promoja.png"
          alt="PromoJá"
          className="h-20 object-contain mx-auto mb-4"
        />

        <div className="bg-[#FF5A1F] w-16 h-16 rounded-3xl flex items-center justify-center mb-5">
          <ShieldAlert size={32} />
        </div>

        <h1 className="text-3xl font-black">
          Editar promoção
        </h1>

        <p className="text-sm text-zinc-300 mt-2">
          Corrija informações da promoção sem criar uma nova oferta.
        </p>
      </section>

      <section className="bg-orange-50 border border-orange-100 rounded-3xl p-5 mt-6">
        <div className="flex gap-3">
          <ShieldAlert className="text-[#FF5A1F]" size={24} />

          <div>
            <h2 className="font-black text-[#1C1C1C]">
              Regras da edição
            </h2>

            <p className="text-sm text-zinc-600 mt-1">
              Você pode corrigir texto, categoria, validade,
              preço e quantidade de cupons.
            </p>

            <p className="text-sm text-zinc-600 mt-2">
              A imagem e o tipo da promoção ficam bloqueados
              para evitar burla do limite diário.
            </p>

            <p className="text-sm font-black text-[#FF5A1F] mt-3">
              Tipo atual:{" "}
              {promocao?.tipo_promocao === "drop"
                ? "Drop"
                : "Promoção normal"}
            </p>
          </div>
        </div>
      </section>

      <form
        onSubmit={salvarEdicao}
        className="mt-6 space-y-4"
      >
        <div className="bg-white rounded-3xl p-4 shadow-sm">
          <label className="font-black text-[#1C1C1C]">
            Foto da promoção
          </label>

          <div className="relative mt-4">
            {form.imagem_url ? (
              <img
                src={form.imagem_url}
                alt="Promoção"
                className="w-full h-60 object-cover rounded-3xl border border-zinc-100"
              />
            ) : (
              <div className="w-full h-60 rounded-3xl bg-[#FFF3EE] flex items-center justify-center">
                <Lock
                  className="text-[#FF5A1F]"
                  size={42}
                />
              </div>
            )}

            <div className="absolute inset-0 bg-black/45 rounded-3xl flex items-center justify-center">
              <div className="bg-white text-[#1C1C1C] px-5 py-3 rounded-2xl font-black flex items-center gap-2">
                <Lock size={18} />
                Imagem bloqueada
              </div>
            </div>
          </div>

          <p className="text-xs text-zinc-500 mt-2">
            Para anunciar outro produto, crie uma nova promoção.
          </p>
        </div>

        <input
          type="text"
          required
          placeholder="Título da promoção"
          value={form.titulo}
          onChange={(e) =>
            alterarCampo("titulo", e.target.value)
          }
          className="w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm"
        />

        <textarea
          required
          placeholder="Descrição da promoção"
          value={form.descricao}
          onChange={(e) =>
            alterarCampo("descricao", e.target.value)
          }
          className="w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm min-h-[120px]"
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-black text-zinc-600 mb-2 block">
              Preço original
            </label>

            <div className="bg-white rounded-2xl px-4 py-4 shadow-sm flex items-center gap-2 border border-zinc-100">
              <span className="font-black text-[#FF5A1F] text-lg">
                R$
              </span>

              <input
                type="number"
                step="0.01"
                required
                placeholder="0,00"
                value={form.preco_antigo}
                onChange={(e) =>
                  alterarCampo(
                    "preco_antigo",
                    e.target.value
                  )
                }
                className="w-full outline-none bg-transparent text-lg font-black"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-black text-zinc-600 mb-2 block">
              Preço promocional
            </label>

            <div className="bg-white rounded-2xl px-4 py-4 shadow-sm flex items-center gap-2 border border-zinc-100">
              <span className="font-black text-[#FF5A1F] text-lg">
                R$
              </span>

              <input
                type="number"
                step="0.01"
                required
                placeholder="0,00"
                value={form.preco_promocional}
                onChange={(e) =>
                  alterarCampo(
                    "preco_promocional",
                    e.target.value
                  )
                }
                className="w-full outline-none bg-transparent text-lg font-black"
              />
            </div>
          </div>
        </div>

        <select
          required
          value={form.categoria}
          onChange={(e) =>
            alterarCampo("categoria", e.target.value)
          }
          className="w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm"
        >
          <option value="">Categoria</option>

          {categorias.map((categoria) => (
            <option
              key={categoria}
              value={categoria}
            >
              {categoria}
            </option>
          ))}
        </select>

        <div className="bg-white rounded-3xl p-4 shadow-sm">
          <label className="font-black flex items-center gap-2">
            <CalendarClock className="text-[#FF5A1F]" />
            Validade da promoção
          </label>

          <p className="text-sm text-zinc-500 mt-1">
            Depois dessa data, a promoção encerra automaticamente.
          </p>

          <input
            type="datetime-local"
            required
            value={form.validade}
            onChange={(e) =>
              alterarCampo("validade", e.target.value)
            }
            className="mt-4 w-full bg-[#F7F7F7] rounded-2xl px-4 py-4 outline-none"
          />
        </div>

        <div className="bg-white rounded-3xl p-4 shadow-sm">
          <label className="font-black text-[#1C1C1C]">
            Quantidade de cupons
          </label>

          <p className="text-sm text-zinc-500 mt-1">
            Normalmente: promoção normal 30 cupons e
            drops 15 cupons.
          </p>

          <input
            type="number"
            value={form.quantidade_total}
            onChange={(e) =>
              alterarCampo(
                "quantidade_total",
                e.target.value
              )
            }
            className="mt-4 w-full bg-[#F7F7F7] rounded-2xl px-4 py-4 outline-none"
            placeholder="Ex: 30"
          />
        </div>

        <button
          type="submit"
          disabled={salvando}
          className="w-full bg-[#FF5A1F] text-white py-4 rounded-2xl font-black text-lg shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Save size={20} />

          {salvando
            ? "Salvando edição..."
            : "Salvar edição"}
        </button>
      </form>
    </main>
  );
}