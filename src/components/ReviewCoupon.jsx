import { useState } from "react";
import { supabase } from "../services/supabase";

export default function ReviewCoupon({ redemption }) {
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function avaliar() {
    if (!rating) {
      alert("Escolha uma nota.");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("promotion_reviews")
      .insert({
        redemption_id: redemption.id,
        promotion_id: redemption.promotion_id,
        restaurant_id: redemption.restaurant_id,
        auth_user_id: user.id,
        rating,
      });

    setLoading(false);

    if (error) {
      console.error(error);
      alert("Você já avaliou esse cupom.");
      return;
    }

    setEnviado(true);
  }

  if (enviado) {
    return (
      <div className="mt-4 bg-green-500/10 border border-green-500/20 rounded-2xl p-4 text-green-400 text-sm font-bold">
        Obrigado pela avaliação 🔥
      </div>
    );
  }

  return (
    <div className="mt-4 bg-[#18181A] border border-white/10 rounded-2xl p-4">
      <p className="font-black text-white mb-3">
        Essa promoção valeu a pena?
      </p>

      <div className="flex gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            className={`text-3xl transition ${
              star <= rating
                ? "text-[#FF5A1F]"
                : "text-zinc-600"
            }`}
          >
            ★
          </button>
        ))}
      </div>

      <button
        onClick={avaliar}
        disabled={loading}
        className="w-full bg-[#FF5A1F] text-white rounded-xl py-3 font-black"
      >
        {loading ? "Enviando..." : "Enviar avaliação"}
      </button>
    </div>
  );
}