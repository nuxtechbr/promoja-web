import { Bell, Zap } from "lucide-react";
import { supabase } from "../services/supabase";

export default function BotaoNotificacao() {
  async function ativarNotificacoes() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Faça login para ativar notificações.");
        window.location.href = "/login";
        return;
      }

      const permissao = await Notification.requestPermission();

      if (permissao !== "granted") {
        alert("Você precisa permitir as notificações para receber ofertas.");
        return;
      }

      const { error } = await supabase.from("notification_tokens").upsert(
        [
          {
            auth_user_id: user.id,
            token: `browser-${user.id}`,
            tipo: "browser_permission",
            ativo: true,
            created_at: new Date().toISOString(),
          },
        ],
        {
          onConflict: "auth_user_id",
        }
      );

      if (error) {
        console.log(error);
        alert(error.message);
        return;
      }

      alert("Notificações ativadas! Agora você poderá receber avisos sobre novas ofertas.");
    } catch (error) {
      console.log(error);
      alert("Erro ao ativar notificações.");
    }
  }

  return (
    <button
      onClick={ativarNotificacoes}
      className="w-full bg-white rounded-[28px] p-4 shadow-sm border border-zinc-100 flex items-center gap-4 active:scale-[0.98] transition-all"
    >
      <div className="bg-[#FF5A1F] text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg">
        <Bell size={24} />
      </div>

      <div className="text-left flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-black text-[#1C1C1C]">
            Receber alertas de ofertas
          </h3>

          <Zap size={16} className="text-[#FF5A1F]" />
        </div>

        <p className="text-sm text-zinc-500 mt-1">
          Seja avisado quando novas promoções entrarem no PromoJá.
        </p>
      </div>
    </button>
  );
}