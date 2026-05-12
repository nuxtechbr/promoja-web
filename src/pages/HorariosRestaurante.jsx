import { useEffect, useState } from "react";
import { Clock3, Save, Copy } from "lucide-react";
import { supabase } from "../services/supabase";

const diasSemana = [
  { id: 0, nome: "Domingo" },
  { id: 1, nome: "Segunda-feira" },
  { id: 2, nome: "Terça-feira" },
  { id: 3, nome: "Quarta-feira" },
  { id: 4, nome: "Quinta-feira" },
  { id: 5, nome: "Sexta-feira" },
  { id: 6, nome: "Sábado" },
];

function limparHora(valor) {
  const numeros = String(valor || "")
    .replace(/\D/g, "")
    .slice(0, 4);

  if (numeros.length === 0) return "";
  if (numeros.length === 1) return numeros;
  if (numeros.length === 2) return numeros;
  if (numeros.length === 3)
    return `${numeros.slice(0, 1)}:${numeros.slice(1)}`;

  return `${numeros.slice(0, 2)}:${numeros.slice(2)}`;
}

function horaValida(valor) {
  if (!/^\d{2}:\d{2}$/.test(valor)) return false;

  const [hora, minuto] = valor.split(":").map(Number);

  return hora >= 0 && hora <= 23 && minuto >= 0 && minuto <= 59;
}

function horarioPadrao(diaId) {
  return {
    dia_semana: diaId,
    ativo: false,
    abre_em: "18:00",
    fecha_em: "23:00",
  };
}

export default function HorariosRestaurante() {
  const [restaurantId, setRestaurantId] = useState(null);
  const [horarios, setHorarios] = useState(
    diasSemana.map((dia) => horarioPadrao(dia.id))
  );
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  async function carregarDados() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    let { data: restaurante } = await supabase
      .from("restaurants")
      .select("*")
      .eq("auth_id", user.id)
      .maybeSingle();

    if (!restaurante) {
      const { data: restauranteFallback } = await supabase
        .from("restaurants")
        .select("*")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      restaurante = restauranteFallback;
    }

    if (!restaurante) {
      alert("Restaurante não encontrado.");
      setLoading(false);
      return;
    }

    setRestaurantId(restaurante.id);

    const { data: horariosBanco, error } = await supabase
      .from("restaurant_hours")
      .select("*")
      .eq("restaurant_id", restaurante.id)
      .order("dia_semana", { ascending: true });

    if (error) {
      console.log(error);
      alert(error.message);
      setLoading(false);
      return;
    }

    const horariosFormatados = diasSemana.map((dia) => {
      const horarioExistente = (horariosBanco || []).find(
        (item) => Number(item.dia_semana) === Number(dia.id)
      );

      if (!horarioExistente) {
        return horarioPadrao(dia.id);
      }

      return {
        dia_semana: dia.id,
        ativo: horarioExistente.ativo === true,
        abre_em: String(horarioExistente.abre_em || "18:00").slice(0, 5),
        fecha_em: String(horarioExistente.fecha_em || "23:00").slice(0, 5),
      };
    });

    setHorarios(horariosFormatados);
    setLoading(false);
  }

  useEffect(() => {
    carregarDados();
  }, []);

  function alterarHorario(index, campo, valor) {
    setHorarios((listaAtual) =>
      listaAtual.map((item, i) => {
        if (i !== index) return item;

        return {
          ...item,
          [campo]:
            campo === "abre_em" || campo === "fecha_em"
              ? limparHora(valor)
              : valor,
        };
      })
    );
  }

  function selecionarDia(index) {
    setHorarios((listaAtual) =>
      listaAtual.map((item, i) => {
        if (i !== index) return item;

        return {
          ...item,
          ativo: !item.ativo,
        };
      })
    );
  }

  function copiarHorarioParaBaixo(index) {
    const horarioBase = horarios[index];

    setHorarios((listaAtual) =>
      listaAtual.map((item, i) => {
        if (i <= index) return item;

        return {
          ...item,
          ativo: horarioBase.ativo,
          abre_em: horarioBase.abre_em,
          fecha_em: horarioBase.fecha_em,
        };
      })
    );
  }

  async function salvarHorarios() {
    if (!restaurantId) {
      alert("Restaurante não encontrado.");
      return;
    }

    for (const horario of horarios) {
      if (horario.ativo) {
        if (
          !horaValida(horario.abre_em) ||
          !horaValida(horario.fecha_em)
        ) {
          alert(
            "Confira os horários. Use o formato HH:mm. Exemplo: 18:00."
          );
          return;
        }
      }
    }

    setSalvando(true);

    try {
      for (const horario of horarios) {
        const payload = {
          restaurant_id: restaurantId,
          dia_semana: horario.dia_semana,
          ativo: horario.ativo,
          abre_em: horario.ativo ? horario.abre_em : "00:00",
          fecha_em: horario.ativo ? horario.fecha_em : "00:00",
        };

        const { data: existente } = await supabase
          .from("restaurant_hours")
          .select("*")
          .eq("restaurant_id", restaurantId)
          .eq("dia_semana", horario.dia_semana)
          .maybeSingle();

        if (existente) {
          const { error } = await supabase
            .from("restaurant_hours")
            .update(payload)
            .eq("id", existente.id);

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("restaurant_hours")
            .insert([payload]);

          if (error) throw error;
        }
      }

      alert("Horários salvos com sucesso.");
window.location.href = "/parceiro/painel";
    } catch (error) {
      console.log(error);
      alert("Erro ao salvar horários: " + error.message);
    }

    setSalvando(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F2] flex items-center justify-center">
        <p className="font-black text-zinc-600">
          Carregando horários...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5F2] px-4 py-6 pb-24">
      <div className="max-w-xl mx-auto">
        <div className="bg-gradient-to-br from-[#FF5A1F] to-[#ff7a3d] rounded-[2rem] p-6 text-white shadow-xl mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Clock3 size={26} />
            </div>

            <div>
              <h1 className="text-2xl font-black">
                Horários de funcionamento
              </h1>

              <p className="text-sm text-white/90">
                Selecione os dias que sua loja funciona.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {diasSemana.map((dia, index) => {
            const ativo = horarios[index]?.ativo === true;

            return (
              <div
                key={dia.id}
                className={`rounded-[1.8rem] p-5 shadow-sm border transition-all ${
                  ativo
                    ? "bg-white border-orange-100"
                    : "bg-zinc-100 border-zinc-200"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-black text-[#1C1C1C]">
                      {dia.nome}
                    </h2>

                    <p className="text-xs text-zinc-500 font-bold mt-1">
                      {ativo
                        ? "Este dia está selecionado para funcionar"
                        : "Toque para selecionar este dia"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => selecionarDia(index)}
                    className={`px-4 py-2 rounded-full text-xs font-black transition-all ${
                      ativo
                        ? "bg-green-100 text-green-700"
                        : "bg-zinc-300 text-zinc-700"
                    }`}
                  >
                    {ativo
                      ? "Dia selecionado"
                      : "Selecionar dia"}
                  </button>
                </div>

                {ativo && (
                  <>
                    <div className="grid grid-cols-2 gap-3 mt-5">
                      <div>
                        <label className="text-xs font-black text-zinc-500 mb-2 block">
                          Horário de abertura
                        </label>

                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="18:00"
                          value={horarios[index]?.abre_em || ""}
                          onChange={(e) =>
                            alterarHorario(
                              index,
                              "abre_em",
                              e.target.value
                            )
                          }
                          className="w-full bg-[#F7F5F2] rounded-2xl px-4 py-4 outline-none font-black text-lg"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-black text-zinc-500 mb-2 block">
                          Horário de fechamento
                        </label>

                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="23:00"
                          value={horarios[index]?.fecha_em || ""}
                          onChange={(e) =>
                            alterarHorario(
                              index,
                              "fecha_em",
                              e.target.value
                            )
                          }
                          className="w-full bg-[#F7F5F2] rounded-2xl px-4 py-4 outline-none font-black text-lg"
                        />
                      </div>
                    </div>

                    {index < diasSemana.length - 1 && (
                      <button
                        type="button"
                        onClick={() => copiarHorarioParaBaixo(index)}
                        className="mt-4 w-full bg-[#FFF0E8] text-[#FF5A1F] rounded-2xl py-3 font-black text-sm flex items-center justify-center gap-2"
                      >
                        <Copy size={16} />
                        Copiar este horário para os dias abaixo
                      </button>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-3xl p-4 mt-5 border border-orange-100">
          <p className="text-sm font-black text-[#1C1C1C]">
            Regra importante
          </p>

          <p className="text-xs text-zinc-500 mt-1">
            Se um dia estiver fechado, as promoções da loja não aparecem para os clientes nesse dia. Horários como 23:00 até 03:00 funcionam normalmente.
          </p>
        </div>

        <button
          onClick={salvarHorarios}
          disabled={salvando}
          className="w-full mt-6 bg-[#FF5A1F] text-white rounded-[1.8rem] py-5 font-black flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70"
        >
          <Save size={20} />

          {salvando ? "Salvando..." : "Salvar horários"}
        </button>
      </div>
    </div>
  );
}