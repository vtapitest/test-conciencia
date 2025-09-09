// functions/api/export.js

export const onRequestGet = async ({ env, request }) => {
  // Verifica que el KV está disponible
  if (!env.LOGS_KV) {
    return new Response("KV not configured", { status: 500 });
  }

  // Autenticación con token en la cabecera Authorization
  const auth = request.headers.get("Authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";

  if (!env.EXPORT_TOKEN || token !== env.EXPORT_TOKEN) {
    return new Response("Unauthorized", { status: 401 });
  }

  let cursor = null;
  const rows = ["timestamp,email,token,gavePassword,ua,ref,ip"];

  do {
    // Listado de claves en KV con prefijo log:
    const list = await env.LOGS_KV.list({ prefix: "log:", cursor });
    cursor = list.cursor;

    for (const k of list.keys) {
      const s = await env.LOGS_KV.get(k.name);
      if (!s) continue;

      const { ts, email, token, gavePassword, ua, ref, ip } = JSON.parse(s);
      rows.push([
        ts || "",
        email || "",
        token || "",
        gavePassword ? "1" : "0",
        (ua || "").replaceAll(",", " "),
        (ref || "").replaceAll(",", " "),
        ip || ""
      ].join(","));
    }
  } while (cursor);

  return new Response(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=\"logs.csv\""
    }
  });
};
