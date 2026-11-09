import { NextRequest, NextResponse } from "next/server";
import { COOKIE, validarToken } from "../../../../lib/auth";
export const runtime = "nodejs";
async function encaminhar(request: NextRequest) {
  if (!validarToken(request.cookies.get(COOKIE)?.value)) return NextResponse.json({ erro: "Sessão expirada. Entre novamente." }, { status: 401 });
  if (request.method !== "GET" && request.headers.get("origin") !== `${request.nextUrl.protocol}//${request.headers.get("host")}`) return NextResponse.json({ erro: "Origem inválida." }, { status: 403 });
  const caminho = request.nextUrl.pathname.replace(/^\/api\/dados/, "");
  if (!/^\/usuarios(?:\/[a-zA-Z0-9_-]+)?$/.test(caminho)) return NextResponse.json({ erro: "Rota inválida." }, { status: 404 });
  try {
    const api = process.env.API_URL || "http://127.0.0.1:3001";
    const resposta = await fetch(`${api}${caminho}${request.nextUrl.search}`, {
      method: request.method, headers: { "Content-Type": "application/json" },
      body: ["POST", "PUT", "PATCH"].includes(request.method) ? await request.text() : undefined,
      cache: "no-store",
    });
    return new NextResponse(await resposta.text(), { status: resposta.status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ erro: "API indisponível. Verifique o JSON Server." }, { status: 503 }); }
}
export { encaminhar as GET, encaminhar as POST, encaminhar as PUT, encaminhar as PATCH, encaminhar as DELETE };
