import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Store } from "lucide-react";
import { supabase } from "../services/supabase";

export default function CriarSenhaParceiro() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function criarSenha(event) {
    event.preventDefault();
    setCarregando(true);

    const { data: restaurante, error: restauranteError } = await supabase
      .from("restaurants")
      .select("*")
      .eq("setup_token", token)
      .single();

    if (restauranteError || !restaurante) {
      alert("Link inválido ou expirado.");
      setCarregando(false);
      return;
    }

    if (
  restaurante.email.toLowerCase() !==
  email.toLowerCase().trim()
) {
      alert("Este e-mail não corresponde ao cadastro do restaurante.");
      setCarregando(false);
      return;
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
password: senha,
    });

    if (authError) {
      alert(authError.message);
      setCarregando(false);
      return;
    }

    const authId = authData.user?.id;

    const { error: updateError } = await supabase
      .from("restaurants")
      .update({
        auth_id: authId,
        status: "ativo",
      })
      .eq("id", restaurante.id);

    setCarregando(false);

    if (updateError) {
      alert(updateError.message);
      return;
    }

    alert("Senha criada com sucesso!");
    navigate("/parceiro/login");
  }

  return (
    <main className="min-h-screen bg-[#F7F7F7] px-5 py-6 flex items-center">
      <section className="w-full">
        <div className="bg-[#1C1C1C] text-white rounded-[32px] p-6 shadow-xl">
          <img
            src="/logo-promoja.png"
            alt="PromoJá"
            className="h-20 object-contain mx-auto mb-4"
          />

          <div className="bg-[#FF5A1F] w-16 h-16 rounded-3xl flex items-center justify-center mb-5">
            <Store size={32} />
          </div>

          <h1 className="text-3xl font-black">Criar acesso do parceiro</h1>

          <p className="text-sm text-zinc-300 mt-2">
            Crie sua senha para acessar o painel do restaurante.
          </p>
        </div>

        <form onSubmit={criarSenha} className="mt-6 space-y-4">
          <input
            type="email"
            required
            placeholder="E-mail usado no cadastro"
            value={email}
            onChange={(e) =>
  setEmail(e.target.value.toLowerCase())
}

            className="w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm"
          />

          <input
            type="password"
            required
            placeholder="Crie uma senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm"
          />

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-[#FF5A1F] text-white py-4 rounded-2xl font-black text-lg shadow-lg flex items-center justify-center gap-2"
          >
            <Lock size={20} />
            {carregando ? "Criando..." : "Criar senha"}
          </button>
        </form>
      </section>
    </main>
  );
}