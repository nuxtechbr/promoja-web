export async function dispararWebhook(url, payload) {
  if (!url) return false;

  try {
    const resposta = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!resposta.ok) {
      const erroTexto = await resposta.text();

      console.warn(
        "[Webhook] Erro HTTP:",
        resposta.status,
        erroTexto
      );

      return false;
    }

    return true;
  } catch (err) {
    console.warn(
      "[Webhook] Falha ao disparar webhook:",
      err?.message
    );

    return false;
  }
}