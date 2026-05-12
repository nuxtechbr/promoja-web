import { useState } from "react";
import {
  ArrowLeft,
  ImagePlus,
  X,
  CalendarClock,
  Zap,
  Flame,
  Clock3,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { supabase } from "../services/supabase";
import { dispararWebhook } from "../services/webhook";

const WEBHOOK_ADMIN =
  "https://nuxtechbr.app.n8n.cloud/webhook/fce175b7-c032-41b2-b49c-92f03735e095";

export default function NovaPromocao() {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [precoAntigo, setPrecoAntigo] = useState("");
  const [precoPromocional, setPrecoPromocional] = useState("");
  const [categoria, setCategoria] = useState("");
  const [validade, setValidade] = useState("");
  const [tipoPromocao, setTipoPromocao] = useState("normal");
  const [horarioDrop, setHorarioDrop] = useState("");
  const [imagens, setImagens] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    maxFiles: 2,
    onDrop: (arquivosAceitos) => {
      const novasImagens = arquivosAceitos.map((arquivo) => ({
        arquivo,
        preview: URL.createObjectURL(arquivo),
      }));

      setImagens([...imagens, ...novasImagens].slice(0, 2));
    },
  });

  function removerImagem(index) {
    setImagens(imagens.filter((_, i) => i !== index));
  }

  async function enviarImagemParaStorage(imagem) {
    const nomeArquivo = `${Date.now()}-${imagem.arquivo.name}`;
    const caminho = `images/${nomeArquivo}`;

    const { error } = await supabase.storage
      .from("promotions")
      .upload(caminho, imagem.arquivo);

    if (error) throw error;

    const { data } = supabase.storage.from("promotions").getPublicUrl(caminho);

    return data.publicUrl;
  }

  async function buscarRestaurante(user) {
    const emailUsuario = String(user?.email || "").trim().toLowerCase();

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

  async function criarPromocao(event) {
  if (carregando) return;

  event.preventDefault();

    if (imagens.length === 0) {
      alert("Adicione pelo menos 1 foto da promoção.");
      return;
    }

    if (tipoPromocao === "drop" && !horarioDrop) {
      alert("Escolha o horário em que o drop começa.");
      return;
    }

    setCarregando(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Faça login novamente.");
        setCarregando(false);
        return;
      }

      const restaurante = await buscarRestaurante(user);

      if (!restaurante) {
        alert(
          "Não encontramos sua loja vinculada a este login. Confira se o e-mail do cadastro é o mesmo usado no painel parceiro."
        );
        setCarregando(false);
        return;
      }

      const inicioDoDia = new Date();
      inicioDoDia.setHours(0, 0, 0, 0);

      const fimDoDia = new Date();
      fimDoDia.setHours(23, 59, 59, 999);

      const { data: promocoesHoje, error: erroPromocoesHoje } =
        await supabase
          .from("promotions")
          .select("*")
          .eq("restaurant_id", restaurante.id)
          .in("status", ["Ativa", "ativa", "aprovada", "Aprovada"])
          .gte("created_at", inicioDoDia.toISOString())
          .lte("created_at", fimDoDia.toISOString());

      if (erroPromocoesHoje) {
        throw erroPromocoesHoje;
      }

      if ((promocoesHoje || []).length >= 2) {
        alert(
          "Sua loja já possui 2 promoções ativas hoje. Para publicar uma nova, aguarde amanhã ou encerre uma promoção atual."
        );

        setCarregando(false);
        return;
      }

      const urlsDasImagens = [];

      for (const imagem of imagens) {
        const url = await enviarImagemParaStorage(imagem);
        urlsDasImagens.push(url);
      }

      const dropAtivoAgora =
        tipoPromocao === "drop" &&
        new Date(horarioDrop).getTime() <= Date.now();

      const { data: promocaoCriada, error } = await supabase
        .from("promotions")
        .insert([
          {
            titulo,
            descricao,
            preco_antigo: precoAntigo,
            preco_promocional: precoPromocional,
            imagem_url: urlsDasImagens[0],
            categoria,
            validade,
            restaurant_id: restaurante.id,
            quantidade_total: tipoPromocao === "drop" ? 15 : 30,
            quantidade_resgatada: 0,
            status: "pendente",
            tipo_promocao: tipoPromocao,
            horario_drop: tipoPromocao === "drop" ? horarioDrop : null,
            drop_ativo: dropAtivoAgora,
            visualizacoes: 0,
            compartilhamentos: 0,
            created_at: new Date(),
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

     await dispararWebhook(WEBHOOK_ADMIN, {
        tipo: "Nova promoção para análise",
        restaurante: restaurante.nome,
        responsavel: restaurante.responsavel || "Não informado",
        whatsapp: String(restaurante.whatsapp_comercial || "").replace(
          /\D/g,
          ""
        ),
        mensagem: `A loja enviou uma nova promoção para análise: ${titulo}`,
        promocao_id: promocaoCriada.id,
        titulo,
        descricao,
        preco_antigo: precoAntigo,
        preco_promocional: precoPromocional,
        categoria,
        validade,
        tipo_promocao: tipoPromocao,
        horario_drop: tipoPromocao === "drop" ? horarioDrop : "",
        imagem: urlsDasImagens[0],
        status: "pendente",
      });

      alert("Promoção enviada para análise!");
      window.location.href = "/parceiro/painel";
    } catch (error) {
      console.log(error);
      alert(error.message || "Erro ao criar promoção.");
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F7F7] px-5 py-6 pb-10">
      <Link
        to="/parceiro/painel"
        className="bg-white w-11 h-11 rounded-full flex items-center justify-center shadow-sm"
      >
        <ArrowLeft size={22} />
      </Link>

      <section className="mt-6 bg-[#1C1C1C] text-white rounded-[32px] p-6 shadow-xl">
        <img
          src="/logo-promoja.png"
          alt="PromoJá"
          className="h-20 object-contain mx-auto mb-4"
        />

        <div className="bg-[#FF5A1F] w-16 h-16 rounded-3xl flex items-center justify-center mb-5">
          <ImagePlus size={32} />
        </div>

        <h1 className="text-3xl font-black">Nova promoção</h1>

        <p className="text-sm text-zinc-300 mt-2">
          Cada restaurante pode criar até 2 promoções por dia.
        </p>
      </section>

      <form onSubmit={criarPromocao} className="mt-6 space-y-4">
        <div className="bg-white rounded-3xl p-4 shadow-sm">
          <label className="font-black text-[#1C1C1C]">Tipo da promoção</label>

          <p className="text-sm text-zinc-500 mt-1">
            Drops aparecem com mais destaque e senso de urgência.
          </p>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              type="button"
              onClick={() => {
                setTipoPromocao("normal");
                setHorarioDrop("");
              }}
              className={`rounded-2xl p-4 border-2 transition-all text-left ${
                tipoPromocao === "normal"
                  ? "border-[#FF5A1F] bg-[#FFF3EE]"
                  : "border-zinc-200 bg-white"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Flame size={20} className="text-[#FF5A1F]" />
                <span className="font-black">Normal</span>
              </div>

              <p className="text-xs text-zinc-500">Promoção comum da loja.</p>
            </button>

            <button
              type="button"
              onClick={() => setTipoPromocao("drop")}
              className={`rounded-2xl p-4 border-2 transition-all text-left ${
                tipoPromocao === "drop"
                  ? "border-[#FF5A1F] bg-[#FFF3EE]"
                  : "border-zinc-200 bg-white"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Zap size={20} className="text-[#FF5A1F]" />
                <span className="font-black">Drop</span>
              </div>

              <p className="text-xs text-zinc-500">
                Oferta rápida com horário marcado.
              </p>
            </button>
          </div>
        </div>

        <input
          type="text"
          required
          placeholder="Título da promoção"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm"
        />

        <textarea
          required
          placeholder="Descrição da promoção"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm min-h-[120px]"
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-black text-zinc-600 mb-2 block">
              Preço original
            </label>

            <div className="bg-white rounded-2xl px-4 py-4 shadow-sm flex items-center gap-2 border border-zinc-100">
              <span className="font-black text-[#FF5A1F] text-lg">R$</span>

              <input
                type="number"
                step="0.01"
                required
                placeholder="0,00"
                value={precoAntigo}
                onChange={(e) => setPrecoAntigo(e.target.value)}
                className="w-full outline-none bg-transparent text-lg font-black"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-black text-zinc-600 mb-2 block">
              Preço promocional
            </label>

            <div className="bg-white rounded-2xl px-4 py-4 shadow-sm flex items-center gap-2 border border-zinc-100">
              <span className="font-black text-[#FF5A1F] text-lg">R$</span>

              <input
                type="number"
                step="0.01"
                required
                placeholder="0,00"
                value={precoPromocional}
                onChange={(e) => setPrecoPromocional(e.target.value)}
                className="w-full outline-none bg-transparent text-lg font-black"
              />
            </div>
          </div>
        </div>

        <select
          required
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm"
        >
          <option value="">Categoria</option>
          <option value="Hambúrguer">Hambúrguer</option>
          <option value="Pizza">Pizza</option>
          <option value="Açaí">Açaí</option>
          <option value="Marmita">Marmita</option>
          <option value="Sushi/Japonês">Sushi/Japonês</option>
          <option value="Churrasco">Churrasco</option>
          <option value="Frango">Frango</option>
          <option value="Pastel">Pastel</option>
          <option value="Esfiha">Esfiha</option>
          <option value="Hot Dog">Hot Dog</option>
          <option value="Doces">Doces</option>
          <option value="Sorvete">Sorvete</option>
          <option value="Bebidas">Bebidas</option>
          <option value="Padaria">Padaria</option>
          <option value="Lanchonete">Lanchonete</option>
          <option value="Restaurante">Restaurante</option>
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
            value={validade}
            onChange={(e) => setValidade(e.target.value)}
            className="mt-4 w-full bg-[#F7F7F7] rounded-2xl px-4 py-4 outline-none"
          />
        </div>

        {tipoPromocao === "drop" && (
          <div className="bg-white rounded-3xl p-4 shadow-sm border-2 border-[#FF5A1F]">
            <label className="font-black flex items-center gap-2">
              <Clock3 className="text-[#FF5A1F]" />
              Horário do Drop
            </label>

            <p className="text-sm text-zinc-500 mt-1">
              O drop só aparece para os clientes a partir desse horário.
            </p>

            <input
              type="datetime-local"
              required={tipoPromocao === "drop"}
              value={horarioDrop}
              onChange={(e) => setHorarioDrop(e.target.value)}
              className="mt-4 w-full bg-[#F7F7F7] rounded-2xl px-4 py-4 outline-none"
            />
          </div>
        )}

        <div className="bg-white rounded-3xl p-4 shadow-sm">
          <label className="font-black">Fotos do produto</label>

          <div
            {...getRootProps()}
            className="mt-4 border-2 border-dashed border-[#FF5A1F] bg-[#FFF3EE] rounded-3xl p-6 text-center cursor-pointer"
          >
            <input {...getInputProps()} />

            <div className="bg-[#FF5A1F] w-14 h-14 rounded-2xl flex items-center justify-center mx-auto text-white mb-3">
              <ImagePlus size={28} />
            </div>

            <p className="font-black">Clique ou arraste as fotos aqui</p>
            <p className="text-sm text-zinc-500 mt-1">Máximo 2 imagens</p>
          </div>

          {imagens.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              {imagens.map((imagem, index) => (
                <div
                  key={index}
                  className="relative rounded-3xl overflow-hidden bg-[#F7F7F7]"
                >
                  <img
                    src={imagem.preview}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-40 object-cover"
                  />

                  <button
                    type="button"
                    onClick={() => removerImagem(index)}
                    className="absolute top-2 right-2 bg-[#1C1C1C] text-white w-8 h-8 rounded-full flex items-center justify-center"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={carregando}
          className="w-full bg-[#FF5A1F] text-white py-4 rounded-2xl font-black text-lg shadow-lg"
        >
          {carregando ? "Enviando para análise..." : "Enviar para análise"}
        </button>
      </form>
    </main>
  );
}