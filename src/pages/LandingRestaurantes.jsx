import { useState } from "react";
import {
  ArrowRight,
  CheckCircle,
  MessageCircle,
  Store,
  Ticket,
  TrendingUp,
  ShieldCheck,
  Smartphone,
  Clock,
  BarChart3,
  Star,
  Zap,
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
    <main className="min-h-screen bg-[#F7F7F7] text-[#1C1C1C]">
      <section className="relative overflow-hidden bg-[#1C1C1C] text-white px-5 pt-8 pb-14 rounded-b-[44px]">
        <div className="absolute top-[-120px] right-[-120px] w-80 h-80 bg-[#FF5A1F] rounded-full blur-[100px] opacity-40" />
        <div className="absolute bottom-[-120px] left-[-120px] w-80 h-80 bg-[#FF5A1F] rounded-full blur-[120px] opacity-20" />

        <div className="relative max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <img
              src="/logo-promoja.png"
              alt="PromoJá"
              className="h-20 object-contain"
            />

            <a
              href={`https://wa.me/${whatsappPromoja}`}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex bg-white/10 border border-white/10 text-white px-5 py-3 rounded-2xl font-black items-center gap-2"
            >
              <MessageCircle size={18} />
              Falar no WhatsApp
            </a>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 items-center mt-14">
            <div>
              <span className="inline-flex items-center gap-2 bg-[#FF5A1F] text-white px-4 py-2 rounded-full text-sm font-black">
                <Zap size={16} />
                Plataforma para restaurantes e deliverys
              </span>

              <h1 className="text-4xl md:text-6xl font-black mt-6 leading-tight">
                Transforme promoções em pedidos reais.
              </h1>

              <p className="text-zinc-300 text-lg mt-5 leading-relaxed">
                O PromoJá conecta restaurantes a clientes próximos através de ofertas limitadas, cupons validados e atendimento direto pelo WhatsApp.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <button
                  onClick={() => setFormAberto(true)}
                  className="bg-[#FF5A1F] text-white px-7 py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl"
                >
                  Quero ser parceiro
                  <ArrowRight size={20} />
                </button>

                <a
                  href="https://usepromoja.com.br"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white text-[#1C1C1C] px-7 py-4 rounded-2xl font-black flex items-center justify-center gap-2"
                >
                  Ver aplicativo
                  <Smartphone size={20} />
                </a>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-8">
                <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                  <p className="text-2xl font-black text-[#FF5A1F]">24h</p>
                  <p className="text-xs text-zinc-300">Ofertas limitadas</p>
                </div>

                <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                  <p className="text-2xl font-black text-[#FF5A1F]">1</p>
                  <p className="text-xs text-zinc-300">Cupom por dia</p>
                </div>

                <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                  <p className="text-2xl font-black text-[#FF5A1F]">100%</p>
                  <p className="text-xs text-zinc-300">Validação digital</p>
                </div>
              </div>
            </div>

            <div className="bg-white text-[#1C1C1C] rounded-[36px] p-5 shadow-2xl">
              <div className="rounded-[28px] overflow-hidden bg-[#F7F7F7]">
                <div className="h-48 bg-[#1C1C1C] relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="bg-[#FF5A1F] text-white text-xs font-black px-3 py-1 rounded-full">
                      🔥 42% OFF
                    </span>
                    <h3 className="text-white text-2xl font-black mt-3">
                      Combo especial do dia
                    </h3>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#FF5A1F] w-14 h-14 rounded-2xl flex items-center justify-center text-white">
                      <Store size={26} />
                    </div>

                    <div>
                      <p className="font-black">Restaurante parceiro</p>
                      <p className="text-sm text-zinc-500">Cupom validado no painel</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-5">
                    <div className="bg-white rounded-2xl p-4">
                      <Clock className="text-[#FF5A1F]" />
                      <p className="text-xs text-zinc-500 mt-2">Tempo</p>
                      <p className="font-black">Hoje</p>
                    </div>

                    <div className="bg-white rounded-2xl p-4">
                      <Ticket className="text-[#FF5A1F]" />
                      <p className="text-xs text-zinc-500 mt-2">Cupom</p>
                      <p className="font-black">Seguro</p>
                    </div>
                  </div>

                  <button className="mt-5 w-full bg-[#FF5A1F] text-white py-4 rounded-2xl font-black">
                    Resgatar promoção
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-black">
              Criado para gerar movimento, não apenas visualização.
            </h2>

            <p className="text-zinc-500 mt-3">
              O PromoJá transforma ofertas em ação: o cliente vê, resgata e chama no WhatsApp.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 mt-8">
            <div className="bg-white rounded-[32px] p-6 shadow-sm">
              <TrendingUp className="text-[#FF5A1F]" size={34} />
              <h3 className="text-xl font-black mt-4">Mais pedidos</h3>
              <p className="text-zinc-500 mt-2">
                Divulgue ofertas estratégicas para atrair clientes em horários de menor movimento.
              </p>
            </div>

            <div className="bg-white rounded-[32px] p-6 shadow-sm">
              <MessageCircle className="text-[#FF5A1F]" size={34} />
              <h3 className="text-xl font-black mt-4">WhatsApp direto</h3>
              <p className="text-zinc-500 mt-2">
                O cliente resgata o cupom e já inicia o atendimento com a mensagem pronta.
              </p>
            </div>

            <div className="bg-white rounded-[32px] p-6 shadow-sm">
              <ShieldCheck className="text-[#FF5A1F]" size={34} />
              <h3 className="text-xl font-black mt-4">Cupom real</h3>
              <p className="text-zinc-500 mt-2">
                Cada código fica salvo no sistema e pode ser validado pelo restaurante.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-12">
        <div className="max-w-6xl mx-auto bg-white rounded-[40px] p-6 md:p-10 shadow-sm">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-[#FF5A1F] font-black">DINÂMICA</span>

              <h2 className="text-3xl md:text-4xl font-black mt-3">
                Simples para o restaurante. Atraente para o cliente.
              </h2>

              <p className="text-zinc-500 mt-4">
                O parceiro cria a promoção, o PromoJá organiza a oferta, o cliente resgata e o restaurante valida o cupom no painel.
              </p>
            </div>

            <div className="grid gap-4">
              {[
                "Restaurante cria uma oferta limitada",
                "Promoção passa por aprovação",
                "Cliente resgata um cupom exclusivo",
                "Pedido começa direto no WhatsApp",
                "Restaurante valida o código no painel",
              ].map((item, index) => (
                <div
                  key={item}
                  className="bg-[#F7F7F7] rounded-3xl p-4 flex items-center gap-4"
                >
                  <div className="bg-[#FF5A1F] text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black">
                    {index + 1}
                  </div>

                  <p className="font-black">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-12">
        <div className="max-w-6xl mx-auto bg-[#1C1C1C] text-white rounded-[40px] p-6 md:p-10 relative overflow-hidden">
          <div className="absolute right-[-100px] top-[-100px] w-72 h-72 rounded-full bg-[#FF5A1F] blur-[100px] opacity-40" />

          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <Star className="text-[#FF5A1F]" size={42} />

              <h2 className="text-3xl md:text-4xl font-black mt-4">
                Entre para a primeira base de parceiros do PromoJá.
              </h2>

              <p className="text-zinc-300 mt-3">
                Estamos selecionando restaurantes para o lançamento oficial. Cadastre seu estabelecimento e receba nosso contato.
              </p>
            </div>

            <button
              onClick={() => setFormAberto(true)}
              className="bg-[#FF5A1F] text-white px-7 py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl"
            >
              Quero ser parceiro
              <ArrowRight size={20} />
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
                  Preencha seus dados para entrarmos em contato.
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