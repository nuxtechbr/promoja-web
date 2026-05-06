import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, UserPlus } from "lucide-react";
import { supabase } from "../services/supabase";

export default function CadastroUsuario() {
  const [nome, setNome] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function cadastrarUsuario(event) {
    event.preventDefault();
    setCarregando(true);

const { data, error } = await supabase.from("clientes").insert([
  {
    nome,
    email,
    whatsapp,
    cidade,
    bairro,
  },
]);

if (error) {
  console.log("ERRO SUPABASE:", error);
  alert(error.message);
  return;
}

    alert("Usuário cadastrado com sucesso!");

    setNome("");
    setDataNascimento("");
    setEmail("");
    setWhatsapp("");
    setCidade("");
    setBairro("");
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
            Entre no PromoJá e resgate as melhores promoções da sua cidade.
          </p>
        </div>

        <form onSubmit={cadastrarUsuario} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-bold">Nome completo</label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Samuel"
              className="mt-2 w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm"
            />
          </div>

          <div>
            <label className="text-sm font-bold">Data de nascimento</label>
            <input
              type="date"
              required
              value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value)}
              className="mt-2 w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm"
            />
          </div>

          <div>
            <label className="text-sm font-bold">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@gmail.com"
              className="mt-2 w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm"
            />
          </div>

          <div>
            <label className="text-sm font-bold">WhatsApp</label>
            <input
              type="tel"
              required
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="Ex: 22999999999"
              className="mt-2 w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm"
            />
          </div>

          <div>
            <label className="text-sm font-bold">Cidade</label>
            <input
              type="text"
              required
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              placeholder="Ex: Rio das Ostras"
              className="mt-2 w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm"
            />
          </div>

          <div>
            <label className="text-sm font-bold">Bairro</label>
            <input
              type="text"
              required
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              placeholder="Ex: Centro"
              className="mt-2 w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm"
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-[#FF5A1F] text-white py-4 rounded-2xl font-black text-lg"
          >
            {carregando ? "Cadastrando..." : "Criar minha conta"}
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