import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Store,
  CheckCircle,
  MessageCircle,
} from "lucide-react";
import { supabase } from "../services/supabase";

export default function CadastroRestaurante() {
  const [nome, setNome] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [categoria, setCategoria] = useState("");
  const [endereco, setEndereco] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [instagram, setInstagram] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function cadastrarRestaurante(event) {
    event.preventDefault();
    setCarregando(true);

    const token = crypto.randomUUID();

    const { error } = await supabase.from("restaurants").insert([
      {
        nome,
        responsavel,
        email,
        whatsapp_comercial: whatsapp,
        categoria,
        endereco,
        cidade,
        bairro,
        instagram,
        setup_token: token,
        status: "pendente",
        created_at: new Date(),
      },
    ]);

    setCarregando(false);

    if (error) {
      console.log(error);
      alert(error.message);
      return;
    }

    const linkCriarSenha = `https://usepromoja.netlify.app/parceiro/criar-senha?token=${token}`;

    const mensagem = encodeURIComponent(
      `Olá! 🚀

Seu restaurante foi cadastrado no PromoJá com sucesso.

Agora finalize seu acesso criando sua senha no painel do parceiro:

${linkCriarSenha}

Depois disso você poderá:
• Criar promoções
• Validar cupons
• Gerenciar seu restaurante

Equipe PromoJá`
    );

    window.open(
      `https://wa.me/55${whatsapp}?text=${mensagem}`,
      "_blank"
    );

    alert(
      "Cadastro enviado! Agora finalize seu acesso pelo WhatsApp."
    );

    setNome("");
    setResponsavel("");
    setEmail("");
    setWhatsapp("");
    setCategoria("");
    setEndereco("");
    setCidade("");
    setBairro("");
    setInstagram("");
  }

  return (
    <main className="min-h-screen bg-[#F7F7F7] px-5 py-6">
      <Link
        to="/"
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
          <Store size={32} />
        </div>

        <h1 className="text-3xl font-black">
          Coloque seu restaurante no PromoJá
        </h1>

        <p className="text-zinc-300 mt-3 leading-relaxed">
          Cadastre seu negócio, publique promoções e receba clientes direto no WhatsApp.
        </p>
      </section>

      <section className="mt-5 grid gap-3">
        <div className="bg-white rounded-2xl p-4 flex gap-3 shadow-sm">
          <CheckCircle className="text-[#FF5A1F]" />
          <p className="text-sm font-bold">
            Mais visibilidade para suas promoções.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 flex gap-3 shadow-sm">
          <MessageCircle className="text-[#FF5A1F]" />
          <p className="text-sm font-bold">
            Clientes chamando direto no WhatsApp.
          </p>
        </div>
      </section>

      <form
        onSubmit={cadastrarRestaurante}
        className="mt-6 space-y-4"
      >
        <input
          type="text"
          required
          placeholder="Nome do restaurante"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm"
        />

        <input
          type="text"
          required
          placeholder="Nome do responsável"
          value={responsavel}
          onChange={(e) => setResponsavel(e.target.value)}
          className="w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm"
        />

        <input
          type="email"
          required
          placeholder="E-mail do restaurante"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm"
        />

        <input
          type="tel"
          required
          placeholder="WhatsApp comercial. Ex: 22999999999"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          className="w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm"
        />

        <select
          required
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm"
        >
          <option value="">Categoria do negócio</option>
          <option value="Lanches">Lanches</option>
          <option value="Pizza">Pizza</option>
          <option value="Açaí">Açaí</option>
          <option value="Restaurante">Restaurante</option>
          <option value="Bebidas">Bebidas</option>
          <option value="Doces">Doces</option>
          <option value="Outros">Outros</option>
        </select>

        <input
          type="text"
          required
          placeholder="Endereço"
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
          className="w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm"
        />

        <input
          type="text"
          required
          placeholder="Cidade"
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
          className="w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm"
        />

        <input
          type="text"
          required
          placeholder="Bairro"
          value={bairro}
          onChange={(e) => setBairro(e.target.value)}
          className="w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm"
        />

        <input
          type="text"
          placeholder="Instagram. Ex: @restaurante"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          className="w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm"
        />

        <button
          type="submit"
          disabled={carregando}
          className="w-full bg-[#FF5A1F] text-white py-4 rounded-2xl font-black text-lg shadow-lg"
        >
          {carregando ? "Enviando..." : "Enviar cadastro"}
        </button>

        <p className="text-center text-xs text-zinc-500 pb-6">
          Seu cadastro será analisado antes de liberar promoções no app.
        </p>
      </form>
    </main>
  );
}