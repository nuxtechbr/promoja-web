import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { supabase } from "../services/supabase";

export default function Header() {

  const [usuario, setUsuario] = useState(null);

  async function carregarUsuario() {

    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUsuario(user);
  }

  async function sair() {

    await supabase.auth.signOut();

    window.location.href = "/login";
  }

  useEffect(() => {
    carregarUsuario();
  }, []);

  return (
    <header className="flex items-center justify-between mb-6">

      <div>
        <h1 className="text-2xl font-black">
          Promo<span className="text-[#FF5A1F]">Já</span>
        </h1>

        <p className="text-sm text-zinc-500">
          {usuario?.email || "Visitante"}
        </p>
      </div>

      {usuario && (

        <button
          onClick={sair}
          className="bg-white w-11 h-11 rounded-full flex items-center justify-center shadow-sm"
        >
          <LogOut size={20} />
        </button>

      )}

    </header>
  );
}