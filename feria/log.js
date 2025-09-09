// functions/api/log.js

// Maneja POST en /api/log
export const onRequestPost = async ({ request, env }) => {
  // Verifica que el KV esté configurado
  if (!env.LOGS_KV) {
    return new Response(JSON.stringify({ ok: false, error: "kv_not_configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  // Parsear cuerpo de la petición
  const { email, token, gavePassword, ts, ua, ref } = await request.json().catch(() => ({}));

  // Validar campos mínimos
  if (!email || !token) {
    return new Response(JSON.stringify({ ok: false, error: "missing_fields" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  // Construir el log
  const item = {
    ts: ts || new Date().toISOString(),
    email,
    token,
    gavePassword: !!gavePassword,
    ua: ua || "",
    ref: ref || "",
    ip: request.headers.get("CF-Connecting-IP") || ""
  };

  // Clave única para cada entrada
  const key = `log:${Date.now()}:${Math.random().toString(36).slice(2)}`;

  // Guardar en KV
  await env.LOGS_KV.put(key, JSON.stringify(item));

  // Respuesta OK
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" }
  });
};

// (Opcional) CORS si llamas desde otro dominio
export const onRequestOptions = () =>
  new Response("", {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "POST, OPTIONS"
    }
  });
