export const onRequestOptions = () => new Response("", {
  headers: {
    "Access-Control-Allow-Origin":"*",
    "Access-Control-Allow-Headers":"Content-Type, Authorization",
    "Access-Control-Allow-Methods":"POST, OPTIONS"
  }
});

export const onRequestPost = async ({ request, env }) => {
  if (!env.LOGS_KV) return json({ ok:false, error:"kv_not_configured" }, 500);

  let body;
  try { body = await request.json(); }
  catch { return json({ ok:false, error:"invalid_json" }, 400); }

  // Solo aceptamos estos campos; cualquier otro (p.ej. 'password') se ignora
  const { email, token, gavePassword, ts, ua, ref } = body || {};
  if (!email || !token) return json({ ok:false, error:"missing_fields" }, 400);

  // Validación ligera del email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok:false, error:"invalid_email" }, 400);
  }

  const item = {
    ts: ts || new Date().toISOString(),
    email,
    token,
    gavePassword: !!gavePassword,
    ua: ua || "",
    ref: ref || "",
    ip: request.headers.get("CF-Connecting-IP") || ""
  };

  const key = `log:${Date.now()}:${Math.random().toString(36).slice(2)}`;
  await env.LOGS_KV.put(key, JSON.stringify(item));

  return json({ ok:true });
};

function json(obj, status=200){
  return new Response(JSON.stringify(obj), {
    status, headers: { "Content-Type":"application/json", "Access-Control-Allow-Origin":"*" }
  });
}
