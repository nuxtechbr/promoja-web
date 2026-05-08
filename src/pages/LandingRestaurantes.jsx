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
                O PromoJá conecta restaurantes a clientes próximos através de
                ofertas limitadas, cupons validados e atendimento direto pelo
                WhatsApp.
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

            <div className="relative">
              <div className="absolute inset-0 bg-[#FF5A1F] blur-[120px] opacity-20 rounded-full" />

              <div className="relative bg-white rounded-[40px] p-4 shadow-2xl border border-white/20 max-w-[430px] mx-auto">
                <div className="bg-[#F4F4F5] rounded-[34px] overflow-hidden">
                  <div className="relative h-64">
                    <img
                      src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1200&auto=format&fit=crop"
                      alt="Promoção restaurante"
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                    <div className="absolute top-4 left-4">
                      <span className="bg-[#FF5A1F] text-white text-xs font-black px-4 py-2 rounded-full shadow-lg">
                        🔥 38% OFF
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white text-3xl font-black leading-tight">
                        Combo Burger Especial
                      </h3>

                      <p className="text-zinc-200 mt-1 text-sm">
                        Hambúrguer artesanal + fritas + refrigerante
                      </p>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src="/logo-ticket.png"
                          alt="Parceiro"
                          className="w-14 h-14 rounded-2xl object-contain bg-white p-2 shadow-sm"
                        />

                        <div>
                          <p className="font-black text-lg">Monster Burger</p>

                          <div className="flex items-center gap-1 text-[#FFB800]">
                            ⭐⭐⭐⭐⭐
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#E8FFF0] text-green-700 text-xs font-black px-3 py-2 rounded-full">
                        Disponível
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-5">
                      <div className="bg-white rounded-2xl p-4 shadow-sm border border-zinc-100">
                        <Clock className="text-[#FF5A1F]" size={22} />

                        <p className="text-xs text-zinc-500 mt-2">
                          Válido até
                        </p>

                        <p className="font-black">Hoje • 23:59</p>
                      </div>

                      <div className="bg-white rounded-2xl p-4 shadow-sm border border-zinc-100">
                        <Ticket className="text-[#FF5A1F]" size={22} />

                        <p className="text-xs text-zinc-500 mt-2">
                          Cupons restantes
                        </p>

                        <p className="font-black">Apenas 12</p>
                      </div>
                    </div>

                    <div className="bg-[#FFF4EF] rounded-3xl p-5 mt-5 border border-[#FFD6C7]">
                      <p className="text-sm line-through text-zinc-400">
                        De R$ 39,90
                      </p>

                      <div className="flex items-end justify-between mt-1">
                        <div>
                          <p className="text-4xl font-black text-[#FF5A1F]">
                            R$ 24,90
                          </p>

                          <p className="text-xs text-zinc-500 mt-1">
                            Promoção limitada
                          </p>
                        </div>

                        <div className="bg-[#FF5A1F] text-white px-3 py-2 rounded-2xl font-black text-sm shadow-lg">
                          ECONOMIZE R$15
                        </div>
                      </div>
                    </div>

                    <button className="mt-5 w-full bg-[#FF5A1F] text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:scale-[1.01] transition-all">
                      Resgatar promoção
                    </button>

                    <div className="mt-4 flex items-center justify-center gap-2 text-sm text-zinc-500">
                      <ShieldCheck size={16} />
                      Cupom validado digitalmente
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* resto da página mantido igual */}

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