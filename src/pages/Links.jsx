import { useEffect, useState } from "react";
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
  Apple,
  Trophy,
} from "lucide-react";

export default function Links() {
  const [modalInstalar, setModalInstalar] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);

  const whatsappPromoja = "558699560330";

  useEffect(() => {
    function capturarPrompt(event) {
      event.preventDefault();
      setInstallPrompt(event);
    }

    window.addEventListener("beforeinstallprompt", capturarPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        capturarPrompt
      );
    };
  }, []);

  async function instalarAndroid() {
    if (!installPrompt) {
      alert(
        "Abra no Chrome, toque nos 3 pontinhos e escolha 'Adicionar à tela inicial'."
      );
      return;
    }

    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  const links = [
    {
      title: "Promoções do Dia",
      subtitle: "Veja ofertas disponíveis agora",
      icon: <Tag size={23} />,
      href: "/",
      type: "primary",
    },

    {
      title: "Ranking PromoJá",
      subtitle: "Restaurantes mais bem avaliados",
      icon: <Trophy size={23} />,
      href: "/ranking",
    },

    {
      title: "Instalar PromoJá Grátis",
      subtitle: "Tenha o PromoJá na tela do celular",
      icon: <Download size={23} />,
      action: () => setModalInstalar(true),
    },

    {
      title: "Instagram",
      subtitle: "@usepromoja",
      icon: <Camera size={23} />,
      href: "https://instagram.com/usepromoja",
      external: true,
    },

    {
      title: "Cadastrar Restaurante",
      subtitle: "Seja parceiro do PromoJá",
      icon: <Store size={23} />,
      href: "/restaurantes",
    },

    {
      title: "Falar no WhatsApp",
      subtitle: "Atendimento oficial PromoJá",
      icon: <MessageCircle size={23} />,
      href: `https://wa.me/${whatsappPromoja}`,
      external: true,
    },
  ];

  return (
    <main className="min-h-screen bg-[#0F0F10] text-white px-5 py-10 relative overflow-hidden">
      
      <div className="absolute top-[-160px] right-[-120px] w-80 h-80 bg-[#FF5A1F] rounded-full blur-[120px] opacity-25" />

      <div className="absolute bottom-[-180px] left-[-120px] w-80 h-80 bg-[#FF5A1F] rounded-full blur-[130px] opacity-20" />

      <section className="relative max-w-[390px] mx-auto">
        
        <div className="text-center mb-8">
          <img
            src="/logo-promoja.png"
            alt="PromoJá"
            className="h-20 object-contain mx-auto"
          />

          <h1 className="text-3xl font-black mt-4 tracking-tight">
            PromoJá
          </h1>

          <p className="text-zinc-400 text-sm mt-2">
            Achou. Clicou. Economizou.
          </p>
        </div>

        <section className="space-y-3">
          {links.map((item, index) => {
            const content = (
              <>
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    item.type === "primary"
                      ? "bg-white/15 text-white"
                      : "bg-[#FF5A1F]/15 text-[#FF5A1F]"
                  }`}
                >
                  {item.icon}
                </div>

                <div className="text-left">
                  <p className="font-black text-[16px] leading-tight">
                    {item.title}
                  </p>

                  <p
                    className={`text-[12px] mt-1 ${
                      item.type === "primary"
                        ? "text-white/80"
                        : "text-zinc-400"
                    }`}
                  >
                    {item.subtitle}
                  </p>
                </div>
              </>
            );

            const className = `
              w-full
              min-h-[76px]
              rounded-[22px]
              px-4
              flex
              items-center
              gap-4
              shadow-lg
              active:scale-[0.98]
              transition-all
              border
              ${
                item.type === "primary"
                  ? "bg-[#FF5A1F] border-[#FF5A1F] text-white"
                  : "bg-[#18181A] border-white/10 text-white hover:border-[#FF5A1F]/60"
              }
            `;

            if (item.action) {
              return (
                <button
                  key={index}
                  onClick={item.action}
                  className={className}
                >
                  {content}
                </button>
              );
            }

            return (
              <a
                key={index}
                href={item.href}
                target={item.external ? "_blank" : "_self"}
                rel={item.external ? "noreferrer" : ""}
                className={className}
              >
                {content}
              </a>
            );
          })}
        </section>

        <p className="text-center text-xs text-zinc-600 mt-8">
          usepromoja.com.br
        </p>
      </section>

      {modalInstalar && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center p-4">
          
          <div className="bg-[#111112] text-white w-full max-w-md rounded-[32px] p-6 shadow-2xl border border-white/10">
            
            <div className="flex items-start justify-between">
              
              <div>
                <img
                  src="/logo-promoja.png"
                  alt="PromoJá"
                  className="h-14 object-contain mb-3"
                />

                <h2 className="text-2xl font-black">
                  Instalar PromoJá
                </h2>
              </div>

              <button
                onClick={() => setModalInstalar(false)}
                className="bg-white/10 text-white w-10 h-10 rounded-2xl flex items-center justify-center"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-zinc-400 mt-3 text-sm">
              Instale o PromoJá na tela inicial e acesse como aplicativo.
            </p>

            <div className="mt-6 space-y-4">
              
              <button
                onClick={instalarAndroid}
                className="w-full bg-[#FF5A1F] text-white rounded-3xl p-4 flex gap-4 items-center text-left"
              >
                <div className="bg-white/15 w-12 h-12 rounded-2xl flex items-center justify-center">
                  <Smartphone size={24} />
                </div>

                <div>
                  <p className="font-black">
                    Instalar no Android
                  </p>

                  <p className="text-sm text-white/80">
                    Toque aqui ou use o Chrome:
                    3 pontinhos → Adicionar à tela inicial.
                  </p>
                </div>
              </button>

              <div className="bg-[#18181A] border border-white/10 rounded-3xl p-4 flex gap-4">
                
                <div className="bg-[#FF5A1F]/15 text-[#FF5A1F] w-12 h-12 rounded-2xl flex items-center justify-center">
                  <Apple size={24} />
                </div>

                <div>
                  <p className="font-black">
                    Instalar no iPhone
                  </p>

                  <p className="text-sm text-zinc-400 mt-1">
                    Abra no Safari, toque em compartilhar
                    e escolha “Adicionar à Tela de Início”.
                  </p>
                </div>
              </div>

              <div className="bg-[#18181A] border border-white/10 rounded-3xl p-4 flex gap-4">
                
                <div className="bg-[#FF5A1F]/15 text-[#FF5A1F] w-12 h-12 rounded-2xl flex items-center justify-center">
                  <Share size={24} />
                </div>

                <div>
                  <p className="font-black">
                    Dica rápida
                  </p>

                  <p className="text-sm text-zinc-400 mt-1">
                    Depois de instalar, o PromoJá aparece
                    como app na tela do seu celular.
                  </p>
                </div>
              </div>

              <a
                href="/"
                className="w-full bg-white text-[#111112] py-4 rounded-2xl font-black flex items-center justify-center gap-2"
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