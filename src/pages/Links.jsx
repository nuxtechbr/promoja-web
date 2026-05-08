import { useState } from "react";
import {
  Tag,
  Download,
  Camera,
  Store,
  MessageCircle,
  X,
  Smartphone,
  Share,
  PlusCircle,
} from "lucide-react";

export default function Links() {
  const [modalInstalar, setModalInstalar] = useState(false);

  const whatsappPromoja = "558699560330";

  return (
    <main className="min-h-screen bg-[#1C1C1C] text-white px-5 py-8 relative overflow-hidden">
      <div className="absolute top-[-120px] right-[-120px] w-80 h-80 bg-[#FF5A1F] rounded-full blur-[100px] opacity-40" />
      <div className="absolute bottom-[-140px] left-[-140px] w-80 h-80 bg-[#FF5A1F] rounded-full blur-[120px] opacity-20" />

      <section className="relative max-w-md mx-auto">
        <div className="text-center">
          <img
            src="/logo-promoja.png"
            alt="PromoJá"
            className="h-28 object-contain mx-auto"
          />

          <h1 className="text-3xl font-black mt-4">PromoJá</h1>

          <p className="text-zinc-300 text-sm mt-2">
            Promoções exclusivas em restaurantes e deliverys.
          </p>
        </div>

        <section className="mt-8 space-y-4">
          <a
            href="/"
            className="bg-[#FF5A1F] text-white rounded-3xl p-5 flex items-center gap-4 shadow-xl active:scale-[0.98] transition-all"
          >
            <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center">
              <Tag size={24} />
            </div>

            <div>
              <p className="font-black text-lg">Promoções do Dia</p>
              <p className="text-sm text-white/80">
                Veja ofertas disponíveis agora
              </p>
            </div>
          </a>

          <button
            onClick={() => setModalInstalar(true)}
            className="w-full bg-white text-[#1C1C1C] rounded-3xl p-5 flex items-center gap-4 shadow-xl active:scale-[0.98] transition-all"
          >
            <div className="bg-[#FFF3EE] text-[#FF5A1F] w-12 h-12 rounded-2xl flex items-center justify-center">
              <Download size={24} />
            </div>

            <div className="text-left">
              <p className="font-black text-lg">Instalar PromoJá Grátis</p>
              <p className="text-sm text-zinc-500">
                Tenha o app na tela do celular
              </p>
            </div>
          </button>

          <a
            href="https://instagram.com/usepromoja"
            target="_blank"
            rel="noreferrer"
            className="bg-white/10 border border-white/10 text-white rounded-3xl p-5 flex items-center gap-4 shadow-xl active:scale-[0.98] transition-all"
          >
            <div className="bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center">
              <Camera size={24} />
            </div>

            <div>
              <p className="font-black text-lg">Instagram</p>
              <p className="text-sm text-zinc-300">@usepromoja</p>
            </div>
          </a>

          <a
            href="/restaurantes"
            className="bg-white/10 border border-white/10 text-white rounded-3xl p-5 flex items-center gap-4 shadow-xl active:scale-[0.98] transition-all"
          >
            <div className="bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center">
              <Store size={24} />
            </div>

            <div>
              <p className="font-black text-lg">Cadastrar Restaurante</p>
              <p className="text-sm text-zinc-300">
                Seja parceiro do PromoJá
              </p>
            </div>
          </a>

          <a
            href={`https://wa.me/${whatsappPromoja}`}
            target="_blank"
            rel="noreferrer"
            className="bg-green-500 text-white rounded-3xl p-5 flex items-center gap-4 shadow-xl active:scale-[0.98] transition-all"
          >
            <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center">
              <MessageCircle size={24} />
            </div>

            <div>
              <p className="font-black text-lg">Falar no WhatsApp</p>
              <p className="text-sm text-white/80">
                Atendimento oficial PromoJá
              </p>
            </div>
          </a>
        </section>

        <p className="text-center text-xs text-zinc-500 mt-8">
          usepromoja.com.br
        </p>
      </section>

      {modalInstalar && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center p-4">
          <div className="bg-white text-[#1C1C1C] w-full max-w-md rounded-[32px] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black">Instalar PromoJá</h2>

              <button
                onClick={() => setModalInstalar(false)}
                className="bg-[#1C1C1C] text-white w-10 h-10 rounded-2xl flex items-center justify-center"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-zinc-500 mt-2">
              Instale o PromoJá na tela inicial do seu celular e acesse como um app, sem precisar abrir o Google.
            </p>

            <div className="mt-6 space-y-4">
              <div className="bg-[#F7F7F7] rounded-3xl p-4 flex gap-4">
                <div className="bg-[#FF5A1F] text-white w-12 h-12 rounded-2xl flex items-center justify-center">
                  <Smartphone size={24} />
                </div>

                <div>
                  <p className="font-black">Android / Chrome</p>
                  <p className="text-sm text-zinc-500 mt-1">
                    Abra o site, toque nos 3 pontinhos do navegador e escolha “Adicionar à tela inicial”.
                  </p>
                </div>
              </div>

              <div className="bg-[#F7F7F7] rounded-3xl p-4 flex gap-4">
                <div className="bg-[#FF5A1F] text-white w-12 h-12 rounded-2xl flex items-center justify-center">
                  <Share size={24} />
                </div>

                <div>
                  <p className="font-black">iPhone / Safari</p>
                  <p className="text-sm text-zinc-500 mt-1">
                    Abra o site no Safari, toque no botão de compartilhar e selecione “Adicionar à Tela de Início”.
                  </p>
                </div>
              </div>

              <a
                href="/"
                className="w-full bg-[#FF5A1F] text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2"
              >
                <PlusCircle size={20} />
                Abrir PromoJá agora
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}