import { Plus, BarChart3, Ticket, Eye } from "lucide-react";

export default function PainelRestaurante() {
  const promocoes = [
    {
      id: 1,
      titulo: "X-Burguer por R$ 9,90",
      status: "Pendente",
      resgates: 0,
      visualizacoes: 0,
    },
    {
      id: 2,
      titulo: "Combo casal por R$ 39,90",
      status: "Ativa",
      resgates: 18,
      visualizacoes: 142,
    },
  ];

  return (
    <main className="min-h-screen bg-[#F7F7F7] px-5 py-6">
      <header className="bg-[#1C1C1C] text-white rounded-[32px] p-6">
        <p className="text-sm text-zinc-300">Painel do parceiro</p>
        <h1 className="text-3xl font-black mt-1">Dum Burguer</h1>
        <p className="text-sm text-zinc-300 mt-2">
          Gerencie suas promoções no PromoJá.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <Eye className="text-[#FF5A1F]" />
          <p className="text-2xl font-black mt-3">142</p>
          <p className="text-sm text-zinc-500">Visualizações</p>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <Ticket className="text-[#FF5A1F]" />
          <p className="text-2xl font-black mt-3">18</p>
          <p className="text-sm text-zinc-500">Resgates</p>
        </div>
      </section>

      <a
  href="/parceiro/nova-promocao"
  className="mt-6 w-full bg-[#FF5A1F] text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2"
>
  <Plus size={22} />
  Nova promoção
</a>

      <section className="mt-7">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="text-[#FF5A1F]" />
          <h2 className="text-xl font-black">Minhas promoções</h2>
        </div>

        <div className="space-y-4">
          {promocoes.map((promo) => (
            <div key={promo.id} className="bg-white rounded-3xl p-5 shadow-sm">
              <div className="flex justify-between gap-3">
                <div>
                  <h3 className="font-black">{promo.titulo}</h3>
                  <p className="text-sm text-zinc-500 mt-1">
                    {promo.visualizacoes} visualizações • {promo.resgates} resgates
                  </p>
                </div>

                <span
                  className={`h-fit text-xs font-black px-3 py-1 rounded-full ${
                    promo.status === "Ativa"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {promo.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}