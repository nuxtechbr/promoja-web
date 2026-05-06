import { Heart } from "lucide-react";
import BottomNav from "../components/BottomNav";

export default function Favoritos() {
  return (
    <main className="min-h-screen bg-[#F7F7F7] px-5 py-6 pb-28">
      <section className="bg-[#1C1C1C] text-white rounded-[32px] p-6 shadow-xl">
        

        <h1 className="text-3xl font-black">Favoritos</h1>

        <p className="text-sm text-zinc-300 mt-2">
          Suas promoções salvas aparecerão aqui.
        </p>
      </section>

      <section className="mt-6 bg-white rounded-3xl p-6 text-center shadow-sm">
        <div className="bg-[#FFE5DB] w-16 h-16 rounded-3xl flex items-center justify-center mx-auto">
          <Heart className="text-[#FF5A1F]" size={30} />
        </div>

        <h2 className="font-black text-xl mt-4">
          Nenhum favorito ainda
        </h2>

        <p className="text-sm text-zinc-500 mt-2">
          Quando você salvar uma promoção, ela ficará guardada aqui.
        </p>
      </section>

      <BottomNav />
    </main>
  );
}