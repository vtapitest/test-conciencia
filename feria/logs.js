// functions/api/log.js

// Maneja POST en /api/log
export const onRequestPost = async ({ request, env }) => {
  // Si no está configurado el KV
  if (!env.LOGS_KV) {
    return new Response(JSON.stringify({ ok:false, error:"kv_not_configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  // Parsear el cuerpo de la petición
  const { email, token, gavePassword, ts, ua, ref } = await request.json().catch(() => ({}));

  // Validar datos mínimos
  if (!email || !token) {
    return new Response(JSON.stringify({ ok:false, error:"missing_fields" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  // Crear registro
  const item = {
    ts: ts || new Date().toISOString(),
    email,
    token,
    gavePassword: !!gavePassword,
    ua: ua || "",
    ref: ref || "",
    ip: request.headers.get("CF-Connecting-IP") || ""
  };

  // Generar clave única
  const key = `log:${Date.now()}:${Math.random().toString(36).slice(2)}`;

  // Guardar en KV
  await env.LOGS_KV.put(key, JSON.stringify(item));

  // Responder OK
  return new Response(JSON.stringify({ ok:true }), {
    headers: { "Content-Type": "application/json" }
  });
};

// Opcional: soportar OPTIONS para CORS si llamas desde otro dominio
export const onRequestOptions = () =>
  new Response("", {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "POST, OPTIONS"
    }
  });
