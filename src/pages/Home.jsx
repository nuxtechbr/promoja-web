import { useEffect, useState } from "react";
import {
  Search,
  Flame,
  MapPin,
  MoreVertical,
  X,
  Ticket,
  Heart,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../services/supabase";
import BottomNav from "../components/BottomNav";
import BotaoNotificacao from "../components/BotaoNotificacao";

export default function Home() {
  const [promocoes, setPromocoes] = useState([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");
  const [filtroDisponibilidade, setFiltroDisponibilidade] =
    useState("todos");

  const [menuAberto, setMenuAberto] =
    useState(false);

  const [usuarioEmail, setUsuarioEmail] =
    useState("Visitante");

  const [economiaMes, setEconomiaMes] =
    useState(0);

  const [busca, setBusca] = useState("");

  const [favoritos, setFavoritos] =
    useState([]);

  const categorias = [
    "Todos",
    "Hambúrguer",
    "Pizza",
    "Açaí",
    "Marmita",
    "Sushi/Japonês",
    "Churrasco",
    "Frango",
    "Pastel",
    "Esfiha",
    "Hot Dog",
    "Doces",
    "Sorvete",
    "Bebidas",
    "Padaria",
    "Lanchonete",
    "Restaurante",
  ];

  function converterPreco(valor) {
    if (!valor) return 0;

    const texto = String(valor)
      .replace("R$", "")
      .trim();

    if (texto.includes(",")) {
      return Number(
        texto
          .replace(/\./g, "")
          .replace(",", ".")
      );
    }

    return Number(texto);
  }

  function promocaoEsgotada(promo) {
    const total = Number(
      promo.quantidade_total || 0
    );

    const resgatada = Number(
      promo.quantidade_resgatada || 0
    );

    return (
      total > 0 &&
      resgatada >= total
    );
  }

  function promocaoVencida(promo) {
    if (!promo.validade) return false;

    return (
      new Date(
        promo.validade
      ).getTime() <= Date.now()
    );
  }

  function promocaoDisponivel(promo) {
    return (
      promo.status === "Ativa" &&
      !promocaoVencida(promo) &&
      !promocaoEsgotada(promo)
    );
  }

  function fraseUrgencia(promo) {
    const total = Number(
      promo.quantidade_total || 0
    );

    const resgatada = Number(
      promo.quantidade_resgatada || 0
    );

    const restantes =
      total > 0
        ? total - resgatada
        : null;

    if (promocaoEsgotada(promo)) {
      return "Essa acabou rápido. Fique atento às próximas.";
    }

    if (
      restantes !== null &&
      restantes <= 3
    ) {
      return "Últimas unidades. Pode acabar a qualquer momento.";
    }

    if (
      restantes !== null &&
      restantes <= 10
    ) {
      return "Alta procura nesta oferta.";
    }

    return "Oferta limitada por tempo determinado.";
  }

  async function carregarUsuario() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    setUsuarioEmail(user.email);

    const { data: resgates } =
      await supabase
        .from("redemptions")
        .select("*")
        .eq(
          "auth_user_id",
          user.id
        );

    if (
      !resgates ||
      resgates.length === 0
    )
      return;

    const mesAtual =
      new Date().getMonth();

    const anoAtual =
      new Date().getFullYear();

    const resgatesDoMes =
      resgates.filter((item) => {
        const data = new Date(
          item.created_at
        );

        return (
          data.getMonth() ===
            mesAtual &&
          data.getFullYear() ===
            anoAtual
        );
      });

    let totalEconomizado = 0;

    for (const resgate of resgatesDoMes) {
      const { data: promocao } =
        await supabase
          .from("promotions")
          .select("*")
          .eq(
            "id",
            resgate.promotion_id
          )
          .single();

      if (promocao) {
        const antigo =
          converterPreco(
            promocao.preco_antigo
          );

        const novo =
          converterPreco(
            promocao.preco_promocional
          );

        if (antigo > novo) {
          totalEconomizado +=
            antigo - novo;
        }
      }
    }

    setEconomiaMes(
      totalEconomizado
    );
  }

  async function carregarPromocoes() {
    const agora = new Date();

    const { data, error } =
      await supabase
        .from("promotions")
        .select("*")
        .eq("status", "Ativa")
        .eq("ocultar", false)
        .order("id", {
          ascending: false,
        });

    if (error) {
      console.log(error);
      return;
    }

    const promocoesTratadas = [];

    for (const promo of data || []) {
      const total = Number(
        promo.quantidade_total || 0
      );

      const resgatada = Number(
        promo.quantidade_resgatada || 0
      );

      const esgotada =
        total > 0 &&
        resgatada >= total;

      if (
        esgotada &&
        !promo.esgotou_em
      ) {
        await supabase
          .from("promotions")
          .update({
            esgotou_em:
              new Date(),
          })
          .eq("id", promo.id);

        promo.esgotou_em =
          new Date().toISOString();
      }

      if (
        esgotada &&
        promo.esgotou_em
      ) {
        const esgotouEm =
          new Date(
            promo.esgotou_em
          );

        const horas =
          (agora - esgotouEm) /
          (1000 * 60 * 60);

        if (horas >= 24) {
          await supabase
            .from("promotions")
            .update({
              ocultar: true,
            })
            .eq("id", promo.id);

          continue;
        }
      }

      promocoesTratadas.push(
        promo
      );
    }

    setPromocoes(
      promocoesTratadas
    );
  }

  async function carregarFavoritos() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } =
      await supabase
        .from("favorites")
        .select("*")
        .eq(
          "auth_user_id",
          user.id
        );

    if (error) {
      console.log(error);
      return;
    }

    setFavoritos(data || []);
  }

  async function favoritarPromocao(
    promotionId
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert(
        "Faça login para favoritar."
      );

      return;
    }

    const jaExiste =
      favoritos.find(
        (item) =>
          Number(
            item.promotion_id
          ) ===
          Number(promotionId)
      );

    if (jaExiste) {
      const { error } =
        await supabase
          .from("favorites")
          .delete()
          .eq("id", jaExiste.id);

      if (error) {
        console.log(error);

        alert(error.message);

        return;
      }

      await carregarFavoritos();

      return;
    }

    const { error } =
      await supabase
        .from("favorites")
        .insert([
          {
            auth_user_id: user.id,
            promotion_id:
              promotionId,
            created_at:
              new Date(),
          },
        ]);

    if (error) {
      console.log(error);

      alert(error.message);

      return;
    }

    await carregarFavoritos();
  }

  async function sair() {
    await supabase.auth.signOut();

    window.location.href =
      "/login";
  }

  function calcularDesconto(promo) {
    const antigo =
      converterPreco(
        promo.preco_antigo
      );

    const novo =
      converterPreco(
        promo.preco_promocional
      );

    if (
      !antigo ||
      !novo ||
      antigo <= novo
    )
      return 0;

    return Math.round(
      ((antigo - novo) /
        antigo) *
        100
    );
  }

  const promocoesFiltradas =
    promocoes.filter((promo) => {
      const mesmaCategoria =
        categoriaAtiva ===
          "Todos" ||
        promo.categoria ===
          categoriaAtiva;

      const textoBusca =
        busca.toLowerCase();

      const bateBusca =
        promo.titulo
          ?.toLowerCase()
          .includes(textoBusca) ||
        promo.descricao
          ?.toLowerCase()
          .includes(textoBusca) ||
        promo.categoria
          ?.toLowerCase()
          .includes(textoBusca);

      const passaDisponibilidade =
        filtroDisponibilidade ===
          "todos" ||
        promocaoDisponivel(
          promo
        );

      return (
        mesmaCategoria &&
        bateBusca &&
        passaDisponibilidade
      );
    });

  useEffect(() => {
    carregarUsuario();
    carregarPromocoes();
    carregarFavoritos();
  }, []);

  return (
    <main className="min-h-screen bg-[#F7F7F7] pb-28 relative">
      {/* resto do JSX continua igual */}
    </main>
  );
}