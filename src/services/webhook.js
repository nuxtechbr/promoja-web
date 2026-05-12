export async function dispararWebhook(url, payload) {
  if (!url) return

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    })
  } catch (err) {
    console.warn('[Webhook] Falha ao disparar webhook (não crítico):', err?.message)
  }
}