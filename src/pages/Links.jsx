import {
  Instagram,
  MessageCircle,
  Store,
  UtensilsCrossed,
} from "lucide-react";

export default function Links() {
  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center px-6">
      <div className="w-full max-w-md">

        {/* LOGO */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-yellow-400">
            PromoJá
          </h1>

          <p className="text-gray-300 mt-3 text-sm">
            As melhores promoções gastronômicas da sua cidade 🍔
          </p>
        </div>

        {/* BOTÕES */}
        <div className="flex flex-col gap-4">

          <a
            href="https://usepromoja.com.br"
            target="_blank"
            className="bg-yellow-400 hover:bg-yellow-300 transition-all duration-300 text-black font-semibold rounded-2xl p-4 flex items-center justify-center gap-3 shadow-lg"
          >
            <UtensilsCrossed size={22} />
            Ver Promoções
          </a>

          <a
            href="https://usepromoja.com.br/parceiro/cadastro"
            target="_blank"
            className="bg-[#1d1d1d] hover:bg-[#2a2a2a] transition-all duration-300 text-white font-semibold rounded-2xl p-4 flex items-center justify-center gap-3 border border-yellow-400"
          >
            <Store size={22} />
            Cadastrar Restaurante
          </a>

          <a
            href="https://instagram.com/usepromoja"
            target="_blank"
            className="bg-[#1d1d1d] hover:bg-[#2a2a2a] transition-all duration-300 text-white font-semibold rounded-2xl p-4 flex items-center justify-center gap-3"
          >
            <Instagram size={22} />
            Instagram Oficial
          </a>

          <a
            href="https://wa.me/558699560330"
            target="_blank"
            className="bg-green-500 hover:bg-green-400 transition-all duration-300 text-white font-semibold rounded-2xl p-4 flex items-center justify-center gap-3"
          >
            <MessageCircle size={22} />
            WhatsApp Comercial
          </a>

        </div>

        {/* FOOTER */}
        <div className="text-center mt-10">
          <p className="text-gray-500 text-xs">
            © 2026 PromoJá
          </p>
        </div>

      </div>
    </div>
  );
}