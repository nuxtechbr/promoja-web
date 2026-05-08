import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Store,
  CheckCircle,
  MessageCircle,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import { supabase } from "../services/supabase";

export default function CadastroRestaurante() {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [categoria, setCategoria] = useState("");
  const [endereco, setEndereco] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [instagram, setInstagram] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function cadastrarRestaurante(event) {
    event.preventDefault();
    setCarregando(true);

    const emailFormatado = email.toLowerCase().trim();

    if (senha.length < 6) {
      alert("A senha precisa ter pelo menos 6 caracteres.");
      setCarregando(false);
      return;
    }

    if (senha !== confirmarSenha) {
      alert("As senhas não conferem.");
      setCarregando(false);
      return;
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: emailFormatado,
      password: senha,
    });

    if (authError) {
      console.log(authError);
      alert(authError.message);
      setCarregando(false);
      return;
    }

    const authId = authData.user?.id;

    const { error } = await supabase.from("restaurants").insert([
      {
        nome,
        responsavel,
        email: emailFormatado,
        whatsapp_comercial: whatsapp,
        categoria,
        endereco,
        cidade,
        bairro,
        instagram,
        auth_id: authId,
        status: "ativo",
        created_at: new Date(),
      },
    ]);

    setCarregando(false);

    if (error) {
      console.log(error);
      alert(error.message);
      return;
    }

    alert("Cadastro criado com sucesso! Agora entre no painel do parceiro.");
    navigate("/parceiro/login");
  }

  return (
    <main className="min-h-screen bg-[#F7F7F7] px-5 py-6">
      <Link
        to="/"
        className="bg-white w-11 h-11 rounded-full flex items-center justify-center shadow-sm"
      >
        <ArrowLeft size={22} />
      </Link>

      <section className="mt-6 bg-[#1C1C1C] text-white rounded-[32px] p-6 shadow-xl">
        <img
          src="/logo-promoja.png"
          alt="PromoJá"
          className="h-20 object-contain mx-auto mb-4"
        />

        <div className="bg-[#FF5A1F] w-16 h-16 rounded-3xl flex items-center justify-center mb-5">
          <Store size={32} />
        </div>

        <h1 className="text-3xl font-black">
          Cadastre seu restaurante
        </h1>

        <p className="text-zinc-300 mt-3 leading-relaxed">
          Crie seu acesso, publique promoções e acompanhe seus cupons no painel do parceiro.
        </p>
      </section>

      <section className="mt-5 grid gap-3">
        <div className="bg-white rounded-2xl p-4 flex gap-3 shadow-sm">
          <CheckCircle className="text-[#FF5A1F]" />
          <p className="text-sm font-bold">
            Cadastro com acesso direto ao painel.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 flex gap-3 shadow-sm">
          <MessageCircle className="text-[#FF5A1F]" />
          <p className="text-sm font-bold">
            Clientes chamando direto no WhatsApp.
          </p>
        </div>
      </section>

      <form onSubmit={cadastrarRestaurante} className="mt-6 space-y-4">
        <input
          type="text"
          required
          placeholder="Nome do restaurante"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm"
        />

        <input
          type="text"
          required
          placeholder="Nome do responsável"
          value={responsavel}
          onChange={(e) => setResponsavel(e.target.value)}
          className="w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm"
        />

        <input
          type="email"
          required
          placeholder="E-mail de acesso ao painel"
          value={email}
          onChange={(e) => setEmail(e.target.value.toLowerCase())}
          className="w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm"
        />

        <input
          type="tel"
          required
          placeholder="WhatsApp comercial. Ex: 22999999999"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          className="w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm"
        />

        <select
          required
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm"
        >
          <option value="">Categoria do negócio</option>
          <option value="Hambúrguer">Hambúrguer</option>
          <option value="Pizza">Pizza</option>
          <option value="Açaí">Açaí</option>
          <option value="Marmita">Marmita</option>
          <option value="Sushi/Japonês">Sushi/Japonês</option>
          <option value="Churrasco">Churrasco</option>
          <option value="Frango">Frango</option>
          <option value="Pastel">Pastel</option>
          <option value="Esfiha">Esfiha</option>
          <option value="Hot Dog">Hot Dog</option>
          <option value="Doces">Doces</option>
          <option value="Sorvete">Sorvete</option>
          <option value="Bebidas">Bebidas</option>
          <option value="Padaria">Padaria</option>
          <option value="Lanchonete">Lanchonete</option>
          <option value="Restaurante">Restaurante</option>
          <option value="Outros">Outros</option>
        </select>

        <input
          type="text"
          required
          placeholder="Endereço"
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
          className="w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm"
        />

        <input
          type="text"
          required
          placeholder="Cidade"
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
          className="w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm"
        />

        <input
          type="text"
          required
          placeholder="Bairro"
          value={bairro}
          onChange={(e) => setBairro(e.target.value)}
          className="w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm"
        />

        <input
          type="text"
          placeholder="Instagram. Ex: @restaurante"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          className="w-full bg-white rounded-2xl px-4 py-4 outline-none shadow-sm"
        />

        <section className="bg-white rounded-[28px] p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="text-[#FF5A1F]" />
            <h2 className="font-black text-lg">
              Crie sua senha de acesso
            </h2>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input
                type={mostrarSenha ? "text" : "password"}
                required
                placeholder="Crie uma senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full bg-[#F7F7F7] rounded-2xl px-4 py-4 pr-12 outline-none"
              />

              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500"
              >
                {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="relative">
              <input
                type={mostrarConfirmarSenha ? "text" : "password"}
                required
                placeholder="Repita a senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className="w-full bg-[#F7F7F7] rounded-2xl px-4 py-4 pr-12 outline-none"
              />

              <button
                type="button"
                onClick={() =>
                  setMostrarConfirmarSenha(!mostrarConfirmarSenha)
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500"
              >
                {mostrarConfirmarSenha ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>

            <p className="text-xs text-zinc-500">
              Use essa senha para entrar no painel do parceiro.
            </p>
          </div>
        </section>

        <button
          type="submit"
          disabled={carregando}
          className="w-full bg-[#FF5A1F] text-white py-4 rounded-2xl font-black text-lg shadow-lg"
        >
          {carregando ? "Criando cadastro..." : "Criar cadastro e acesso"}
        </button>

        <p className="text-center text-xs text-zinc-500 pb-6">
          Seu restaurante poderá publicar promoções após aprovação da equipe PromoJá.
        </p>
      </form>
    </main>
  );
}