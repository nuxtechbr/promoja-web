import { Home, Heart, Ticket, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function BottomNav() {
  const location = useLocation();

  const links = [
    { nome: "Início", rota: "/", icone: Home },
    { nome: "Favoritos", rota: "/favoritos", icone: Heart },
    { nome: "Resgates", rota: "/meus-resgates", icone: Ticket },
    { nome: "Perfil", rota: "/perfil", icone: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 px-4 py-3 z-40">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {links.map((item) => {
          const ativo = location.pathname === item.rota;
          const Icone = item.icone;

          return (
            <Link
              key={item.rota}
              to={item.rota}
              className={`flex flex-col items-center gap-1 text-xs font-bold ${
                ativo ? "text-[#FF5A1F]" : "text-zinc-500"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  ativo ? "bg-[#FF5A1F] text-white" : "bg-zinc-100"
                }`}
              >
                <Icone size={20} />
              </div>
              {item.nome}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}