// functions/api/log.js  (versión diagnóstico)
export const onRequest = async ({ request }) => {
  // Acepta GET/POST/etc para aislar problemas de ruta/método
  const method = request.method;
  let body = {};
  try { body = await request.json(); } catch {}
  return new Response(JSON.stringify({ ok: true, method, received: body }), {
    headers: { "Content-Type": "application/json" }
  });
};
