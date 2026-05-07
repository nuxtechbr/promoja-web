import { useState } from "react";
import {
  ArrowRight,
  CheckCircle,
  MessageCircle,
  Store,
  Ticket,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "../services/supabase";

export default function LandingRestaurantes() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [formAberto, setFormAberto] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const whatsappPromoja = "558699560330";

  async function cadastrarLead(event) {
    event.preventDefault();
    setCarregando(true);

    const emailFormatado = email.toLowerCase().trim();

    const { error } = await supabase.from("partner_leads").insert([
      {
        nome_estabelecimento: nome,
        email: emailFormatado,
        whatsapp,
        created_at: new Date(),
      },
    ]);

    if (error) {
      console.log(error);
      alert(error.message);
      setCarregando(false);
      return;
    }

    try {
      await fetch("https://nuxtechbr.app.n8n.cloud/webhook/novorestaurante", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome,
          email: emailFormatado,
          whatsapp,
        }),
      });
    } catch (erro) {
      console.log("Erro n8n:", erro);
    }

    setNome("");
    setEmail("");
    setWhatsapp("");
    setCarregando(false);
    setSucesso(true);

    setTimeout(() => {
      setSucesso(false);
      setFormAberto(false);
    }, 2500);
  }

  return (
    <main className="min-h-screen bg-[#F7F7F7]">
      <section className="bg-[#1C1C1C] text-white px-5 pt-8 pb-10 rounded-b-[40px]">
        <div className="max-w-5xl mx-auto">
          <img
            src="/logo-promoja.png"
            alt="PromoJá"
            className="h-24 object-contain mb-8"
          />

          <div className="max-w-2xl">
            <span className="bg-[#FF5A1F] text-white px-4 py-2 rounded-full text-sm font-black">
              Para restaurantes e deliverys
            </span>

            <h1 className="text-4xl md:text-6xl font-black mt-6 leading-tight">
              Venda mais com promoções inteligentes.
            </h1>

            <p className="text-zinc-300 text-lg mt-5 leading-relaxed">
              O PromoJá conecta seu restaurante a clientes próximos através de
              ofertas limitadas, cupons validados e chamadas diretas no WhatsApp.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <button
                onClick={() => setFormAberto(true)}
                className="bg-[#FF5A1F] text-white px-6 py-4 rounded-2xl font-black flex items-center justify-center gap-2"
              >
                Quero ser parceiro
                <ArrowRight size={20} />
              </button>

              <a
                href={`https://wa.me/${whatsappPromoja}`}
                target="_blank"
                rel="noreferrer"
                className="bg-white text-[#1C1C1C] px-6 py-4 rounded-2xl font-black flex items-center justify-center gap-2"
              >
                <MessageCircle size={20} />
                Falar no WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-10">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-5">
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <TrendingUp className="text-[#FF5A1F]" size={34} />
            <h3 className="text-xl font-black mt-4">Mais movimento</h3>
            <p className="text-zinc-500 mt-2">
              Crie ofertas por tempo limitado e atraia clientes com intenção de compra.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <MessageCircle className="text-[#FF5A1F]" size={34} />
            <h3 className="text-xl font-black mt-4">Pedido direto no WhatsApp</h3>
            <p className="text-zinc-500 mt-2">
              O cliente resgata o cupom e chama seu estabelecimento imediatamente.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <ShieldCheck className="text-[#FF5A1F]" size={34} />
            <h3 className="text-xl font-black mt-4">Cupons validados</h3>
            <p className="text-zinc-500 mt-2">
              O parceiro confere os códigos no painel e evita cupons falsos.
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 pb-10">
        <div className="max-w-5xl mx-auto bg-white rounded-[36px] p-6 md:p-10 shadow-sm">
          <h2 className="text-3xl font-black">Como funciona</h2>

          <div className="grid md:grid-cols-4 gap-5 mt-8">
            {[
              "Cadastre seu restaurante",
              "Crie uma promoção",
              "Aguarde aprovação",
              "Receba clientes no WhatsApp",
            ].map((item, index) => (
              <div key={item} className="bg-[#F7F7F7] rounded-3xl p-5">
                <div className="bg-[#FF5A1F] text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black">
                  {index + 1}
                </div>
                <p className="font-black mt-4">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-12">
        <div className="max-w-5xl mx-auto bg-[#1C1C1C] text-white rounded-[36px] p-6 md:p-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <Store className="text-[#FF5A1F]" size={42} />
              <h2 className="text-3xl font-black mt-4">
                Pronto para colocar seu restaurante no PromoJá?
              </h2>
              <p className="text-zinc-300 mt-3">
                Entre agora na lista de parceiros e comece a divulgar ofertas para clientes da sua região.
              </p>
            </div>

            <button
              onClick={() => setFormAberto(true)}
              className="bg-[#FF5A1F] text-white px-6 py-4 rounded-2xl font-black flex items-center justify-center gap-2"
            >
              Quero ser parceiro
              <Ticket size={20} />
            </button>
          </div>
        </div>
      </section>

      {formAberto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[32px] p-6 shadow-2xl">
            {sucesso ? (
              <div className="text-center py-8">
                <div className="bg-[#E8FFF0] w-20 h-20 rounded-[28px] flex items-center justify-center mx-auto">
                  <CheckCircle className="text-green-600" size={42} />
                </div>

                <h2 className="text-2xl font-black mt-5">
                  Cadastro recebido!
                </h2>

                <p className="text-zinc-500 mt-2">
                  Nossa equipe entrará em contato pelo WhatsApp informado.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-black">Quero ser parceiro</h2>

                <p className="text-zinc-500 mt-2">
                  Preencha os dados abaixo. Nossa equipe entrará em contato.
                </p>

                <form onSubmit={cadastrarLead} className="mt-6 space-y-4">
                  <input
                    type="text"
                    required
                    placeholder="Nome do estabelecimento"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full bg-[#F7F7F7] rounded-2xl px-4 py-4 outline-none"
                  />

                  <input
                    type="email"
                    required
                    placeholder="E-mail do estabelecimento"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.toLowerCase())}
                    className="w-full bg-[#F7F7F7] rounded-2xl px-4 py-4 outline-none"
                  />

                  <input
                    type="tel"
                    required
                    placeholder="WhatsApp do responsável"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-[#F7F7F7] rounded-2xl px-4 py-4 outline-none"
                  />

                  <button
                    type="submit"
                    disabled={carregando}
                    className="w-full bg-[#FF5A1F] text-white py-4 rounded-2xl font-black"
                  >
                    {carregando ? "Enviando..." : "Enviar cadastro"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormAberto(false)}
                    className="w-full bg-[#F7F7F7] text-[#1C1C1C] py-4 rounded-2xl font-black"
                  >
                    Fechar
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <a
        href={`https://wa.me/${whatsappPromoja}`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-5 right-5 bg-green-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
      >
        <MessageCircle size={28} />
      </a>
    </main>
  );
}