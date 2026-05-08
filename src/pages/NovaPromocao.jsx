import { useState } from "react";
import {
  ArrowLeft,
  ImagePlus,
  X,
  CalendarClock,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { supabase } from "../services/supabase";

export default function NovaPromocao() {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [precoAntigo, setPrecoAntigo] = useState("");
  const [precoPromocional, setPrecoPromocional] = useState("");
  const [categoria, setCategoria] = useState("");
  const [validade, setValidade] = useState("");
  const [imagens, setImagens] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [],
    },
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

    if (error) {
      throw error;
    }

    const { data } = supabase.storage
      .from("promotions")
      .getPublicUrl(caminho);

    return data.publicUrl;
  }

  async function criarPromocao(event) {
  event.preventDefault();

  if (imagens.length === 0) {
    alert("Adicione pelo menos 1 foto da promoção.");
    return;
  }

  setCarregando(true);

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Faça login novamente.");
      return;
    }

    const { data: restaurante } = await supabase
      .from("restaurants")
      .select("*")
      .eq("auth_id", user.id)
      .maybeSingle();

    if (!restaurante) {
      alert("Restaurante não encontrado.");
      return;
    }

    const inicioDoDia = new Date();
    inicioDoDia.setHours(0, 0, 0, 0);

    const fimDoDia = new Date();
    fimDoDia.setHours(23, 59, 59, 999);

    const {
      data: promocoesHoje,
      error: erroPromocoesHoje,
    } = await supabase
      .from("promotions")
      .select("*")
      .eq("restaurant_id", restaurante.id)
      .gte("created_at", inicioDoDia.toISOString())
      .lte("created_at", fimDoDia.toISOString());

    if (erroPromocoesHoje) {
      throw erroPromocoesHoje;
    }

    if (promocoesHoje.length >= 2) {
      alert(
        "Este restaurante já criou 2 promoções hoje."
      );

      setCarregando(false);

      return;
    }

    const urlsDasImagens = [];

    for (const imagem of imagens) {
      const url =
        await enviarImagemParaStorage(imagem);

      urlsDasImagens.push(url);
    }

    const { data: promocaoCriada, error } =
      await supabase
        .from("promotions")
        .insert([
          {
            titulo,
            descricao,
            preco_antigo: precoAntigo,
            preco_promocional:
              precoPromocional,
            imagem_url: urlsDasImagens[0],
            categoria,
            validade,
            restaurant_id: restaurante.id,
            quantidade_total: 30,
            quantidade_resgatada: 0,
            status: "pendente",
            created_at: new Date(),
          },
        ])
        .select()
        .single();

    if (error) {
      throw error;
    }

    try {
      await fetch(
        "https://nuxtechbr.app.n8n.cloud/webhook/promoja-promocao-analise",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            restaurante:
              restaurante.nome,
            responsavel:
              restaurante.responsavel,
            whatsapp: String(
              restaurante.whatsapp_comercial ||
                ""
            ).replace(/\D/g, ""),
            email: restaurante.email,

            promocao_id:
              promocaoCriada.id,

            titulo,
            descricao,
            preco_antigo:
              precoAntigo,
            preco_promocional:
              precoPromocional,
            categoria,
            validade,

            imagem:
              urlsDasImagens[0],

            status: "pendente",
          }),
        }
      );
    } catch (webhookError) {
      console.log(
        "Erro webhook promoção:",
        webhookError
      );
    }

    alert(
      "Promoção enviada para análise!"
    );

    window.location.href =
      "/parceiro/painel";
  } catch (error) {
    console.log(error);

    alert(error.message);
  }

  setCarregando(false);
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
          Cada restaurante pode criar até 2 promoções por dia. Todas passam por
          aprovação antes de aparecer no app.
        </p>
      </section>

      <form onSubmit={criarPromocao} className="mt-6 space-y-4">
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
            Escolha o dia e horário em que a promoção termina.
          </p>

          <input
            type="datetime-local"
            required
            value={validade}
            onChange={(e) => setValidade(e.target.value)}
            className="mt-4 w-full bg-[#F7F7F7] rounded-2xl px-4 py-4 outline-none"
          />
        </div>

        <div className="bg-white rounded-3xl p-4 shadow-sm">
          <label className="font-black">Fotos do produto</label>

          <p className="text-sm text-zinc-500 mt-1">
            Adicione até 2 fotos. A primeira será a imagem principal.
          </p>

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

                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs font-black px-3 py-1 rounded-full">
                    Foto {index + 1}
                  </div>
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