import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus } from "lucide-react";
import { supabase } from "../services/supabase";

export default function CadastroUsuario() {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function cadastrarUsuario(event) {
    event.preventDefault();
    setCarregando(true);

    const emailFormatado = email.toLowerCase().trim();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: emailFormatado,
      password: senha,
    });

    if (authError) {
      setCarregando(false);
      alert(authError.message);
      return;
    }

    const authId = authData.user?.id;

    const { error } = await supabase.from("clientes").insert([
      {
        auth_id: authId,
        nome,
        data_nascimento: dataNascimento,
        email: emailFormatado,
        whatsapp,
        cidade,
        bairro,
        created_at: new Date(),
      },
    ]);

    setCarregando(false);

    if (error) {
      console.log(error);
      alert(error.message);
      return;
    }

    alert("Conta criada com sucesso!");
    navigate("/login");
  }

  return (
    <main className="min-h-screen bg-[#F7F7F7] px-5 py-6">
      <Link
        to="/"
        className="bg-white w-11 h-11 rounded-full flex items-center justify-center shadow-sm"
      >
        <ArrowLeft size={22} />
      </Link>

      <section className="mt-8">
        <div className="bg-[#1C1C1C] text-white rounded-[32px] p-6">
          <div className="bg-[#FF5A1F] w-14 h-14 rounded-2xl flex items-center justify-center mb-5">
            <UserPlus size={28} />
          </div>

          <h1 className="text-3xl font-black">Crie sua conta</h1>

          <p className="text-zinc-300 mt-2">
            Entre no PromoJá e resgate as melhores promoções.
          </p>
        </div>

        <form onSubmit={cadastrarUsuario} className="mt-6 space-y-4">
          <input
            type="text"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome completo"
            className="w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm"
          />

          <div>
            <label className="text-sm font-black text-zinc-600 mb-2 block">
              Data de nascimento
            </label>

            <input
              type="date"
              required
              value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value)}
              className="w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm"
            />
          </div>

          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value.toLowerCase())}
            placeholder="E-mail"
            className="w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm"
          />

          <input
            type="tel"
            required
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="WhatsApp"
            className="w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm"
          />

          <input
            type="text"
            required
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            placeholder="Cidade"
            className="w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm"
          />

          <input
            type="text"
            required
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
            placeholder="Bairro"
            className="w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm"
          />

          <input
            type="password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Crie uma senha"
            className="w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm"
          />

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-[#FF5A1F] text-white py-4 rounded-2xl font-black text-lg"
          >
            {carregando ? "Criando conta..." : "Criar minha conta"}
          </button>

          <p className="text-center text-sm text-zinc-500">
            Já tem conta?{" "}
            <Link to="/login" className="font-black text-[#FF5A1F]">
              Entrar
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}