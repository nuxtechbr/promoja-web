import { CheckCircle, Store, Ticket, Users, XCircle } from "lucide-react";

export default function AdminDashboard() {
  const restaurantesPendentes = [
    {
      id: 1,
      nome: "Dum Burguer",
      responsavel: "Samuel",
      cidade: "Rio das Ostras",
      bairro: "Centro",
    },
    {
      id: 2,
      nome: "Açaí do Bairro",
      responsavel: "Matheus",
      cidade: "Cabo Frio",
      bairro: "Unamar",
    },
  ];

  const promocoesPendentes = [
    {
      id: 1,
      titulo: "X-Burguer por R$ 9,90",
      restaurante: "Dum Burguer",
    },
    {
      id: 2,
      titulo: "Açaí 300ml por R$ 7,99",
      restaurante: "Açaí do Bairro",
    },
  ];

  return (
    <main className="min-h-screen bg-[#F7F7F7] px-5 py-6">
      <header className="bg-[#1C1C1C] text-white rounded-[32px] p-6">
        <p className="text-sm text-zinc-300">Admin PromoJá</p>
        <h1 className="text-3xl font-black mt-1">Painel Geral</h1>
        <p className="text-sm text-zinc-300 mt-2">
          Controle restaurantes, promoções e usuários.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <Users className="text-[#FF5A1F]" />
          <p className="text-2xl font-black mt-3">0</p>
          <p className="text-sm text-zinc-500">Usuários</p>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <Store className="text-[#FF5A1F]" />
          <p className="text-2xl font-black mt-3">0</p>
          <p className="text-sm text-zinc-500">Restaurantes</p>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <Ticket className="text-[#FF5A1F]" />
          <p className="text-2xl font-black mt-3">0</p>
          <p className="text-sm text-zinc-500">Promoções</p>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <CheckCircle className="text-[#FF5A1F]" />
          <p className="text-2xl font-black mt-3">0</p>
          <p className="text-sm text-zinc-500">Resgates</p>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-black mb-4">Restaurantes pendentes</h2>

        <div className="space-y-4">
          {restaurantesPendentes.map((restaurante) => (
            <div key={restaurante.id} className="bg-white rounded-3xl p-5 shadow-sm">
              <h3 className="font-black">{restaurante.nome}</h3>
              <p className="text-sm text-zinc-500">
                Responsável: {restaurante.responsavel}
              </p>
              <p className="text-sm text-zinc-500">
                {restaurante.bairro} • {restaurante.cidade}
              </p>

              <div className="flex gap-3 mt-4">
                <button className="flex-1 bg-green-600 text-white py-3 rounded-2xl font-black flex items-center justify-center gap-2">
                  <CheckCircle size={18} />
                  Aprovar
                </button>

                <button className="flex-1 bg-red-600 text-white py-3 rounded-2xl font-black flex items-center justify-center gap-2">
                  <XCircle size={18} />
                  Recusar
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-black mb-4">Promoções pendentes</h2>

        <div className="space-y-4">
          {promocoesPendentes.map((promocao) => (
            <div key={promocao.id} className="bg-white rounded-3xl p-5 shadow-sm">
              <h3 className="font-black">{promocao.titulo}</h3>
              <p className="text-sm text-zinc-500">
                Restaurante: {promocao.restaurante}
              </p>

              <div className="flex gap-3 mt-4">
                <button className="flex-1 bg-green-600 text-white py-3 rounded-2xl font-black flex items-center justify-center gap-2">
                  <CheckCircle size={18} />
                  Aprovar
                </button>

                <button className="flex-1 bg-red-600 text-white py-3 rounded-2xl font-black flex items-center justify-center gap-2">
                  <XCircle size={18} />
                  Recusar
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}