import { Smartphone, MoreVertical, PlusCircle, ArrowLeft } from "lucide-react";

export default function Instalar() {
  return (
    <main className="min-h-screen bg-[#0f0f10] text-white px-5 py-8 flex justify-center">
      <section className="w-full max-w-md">
        
        <a
          href="/links"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 mb-6"
        >
          <ArrowLeft size={18} />
          Voltar
        </a>

        <div className="text-center mb-8">
          <img
            src="/logo-promoja.png"
            alt="PromoJá"
            className="h-20 mx-auto object-contain mb-4"
          />

          <h1 className="text-3xl font-black">
            Instalar PromoJá Grátis
          </h1>

          <p className="text-zinc-400 text-sm mt-3">
            Coloque o PromoJá na tela inicial do seu celular e acesse como se fosse um app.
          </p>
        </div>

        <div className="bg-[#1c1c1f] border border-white/10 rounded-3xl p-5 mb-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#ff5a1f] flex items-center justify-center">
              <Smartphone size={25} />
            </div>

            <div>
              <h2 className="font-black">Android</h2>
              <p className="text-xs text-zinc-400">Google Chrome</p>
            </div>
          </div>

          <ol className="space-y-3 text-sm text-zinc-300">
            <li>1. Abra o site da PromoJá no navegador.</li>
            <li className="flex items-center gap-2">
              2. Toque nos três pontinhos <MoreVertical size={17} />.
            </li>
            <li>3. Clique em “Adicionar à tela inicial”.</li>
            <li>4. Confirme em “Instalar”.</li>
          </ol>
        </div>

        <div className="bg-[#1c1c1f] border border-white/10 rounded-3xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white text-black flex items-center justify-center">
              <PlusCircle size={25} />
            </div>

            <div>
              <h2 className="font-black">iPhone</h2>
              <p className="text-xs text-zinc-400">Safari</p>
            </div>
          </div>

          <ol className="space-y-3 text-sm text-zinc-300">
            <li>1. Abra o site da PromoJá pelo Safari.</li>
            <li>2. Toque no botão de compartilhar.</li>
            <li>3. Clique em “Adicionar à Tela de Início”.</li>
            <li>4. Confirme em “Adicionar”.</li>
          </ol>
        </div>

        <a
          href="/promocoes"
          className="mt-6 flex justify-center bg-[#ff5a1f] text-white font-black rounded-2xl py-4"
        >
          Ver Promoções do Dia
        </a>
      </section>
    </main>
  );
}