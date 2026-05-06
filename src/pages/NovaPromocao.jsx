import { useState } from "react";
import { ArrowLeft, ImagePlus } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../services/supabase";

export default function NovaPromocao() {

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [precoAntigo, setPrecoAntigo] = useState("");
  const [precoPromocional, setPrecoPromocional] = useState("");
  const [validade, setValidade] = useState("");
  const [quantidade, setQuantidade] = useState("");

  async function cadastrarPromocao(event) {
    event.preventDefault();

    const { error } = await supabase
      .from("promotions")
      .insert([
        {
  restaurant_id: 1,
  titulo,
  descricao,
  preco_antigo: precoAntigo,
  preco_promocional: precoPromocional,
  imagem_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
  validade,
  quantidade_total: Number(quantidade),
  quantidade_resgatada: 0,
  status: "pendente",
  created_at: new Date(),
}
      ]);

    if (error) {
      console.log(error);
      alert(error.message);
      return;
    }

    alert("Promoção cadastrada com sucesso!");

    setTitulo("");
    setDescricao("");
    setPrecoAntigo("");
    setPrecoPromocional("");
    setValidade("");
    setQuantidade("");
  }

  return (
    <main className="min-h-screen bg-[#F7F7F7] px-5 py-6">

      <Link
        to="/parceiro/painel"
        className="bg-white w-11 h-11 rounded-full flex items-center justify-center shadow-sm"
      >
        <ArrowLeft size={22} />
      </Link>

      <section className="mt-8">

        <div className="bg-[#1C1C1C] text-white rounded-[32px] p-6">

          <div className="bg-[#FF5A1F] w-14 h-14 rounded-2xl flex items-center justify-center mb-5">
            <ImagePlus size={28} />
          </div>

          <h1 className="text-3xl font-black">
            Nova promoção
          </h1>

          <p className="text-zinc-300 mt-2">
            Cadastre uma oferta no PromoJá.
          </p>

        </div>

        <form
          onSubmit={cadastrarPromocao}
          className="mt-6 space-y-4"
        >

          <input
            type="text"
            placeholder="Título da promoção"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm"
          />

          <textarea
            placeholder="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm min-h-28"
          />

          <input
            type="text"
            placeholder="Preço antigo"
            value={precoAntigo}
            onChange={(e) => setPrecoAntigo(e.target.value)}
            className="w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm"
          />

          <input
            type="text"
            placeholder="Preço promocional"
            value={precoPromocional}
            onChange={(e) => setPrecoPromocional(e.target.value)}
            className="w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm"
          />

          <input
            type="date"
            value={validade}
            onChange={(e) => setValidade(e.target.value)}
            className="w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm"
          />

          <input
            type="number"
            placeholder="Quantidade de cupons"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            className="w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm"
          />

          <button
            type="submit"
            className="w-full bg-[#FF5A1F] text-white py-4 rounded-2xl font-black text-lg"
          >
            Cadastrar promoção
          </button>

        </form>

      </section>

    </main>
  );
}