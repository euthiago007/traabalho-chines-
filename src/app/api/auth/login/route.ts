import { NextRequest, NextResponse } from "next/server";
import { COOKIE, DURACAO, cookieOpcoes, gerarToken } from "../../../../lib/auth";
export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== `${request.nextUrl.protocol}//${request.headers.get("host")}`) return NextResponse.json({ erro: "Origem inválida." }, { status: 403 });
  let dados;
  try { dados = await request.json(); } catch { return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 }); }
  const email = typeof dados.email === "string" ? dados.email.trim().toLowerCase() : "";
  const senha = typeof dados.senha === "string" ? dados.senha : "";
  if (!email || !senha) return NextResponse.json({ erro: "Informe e-mail e senha." }, { status: 400 });
  try {
    const api = process.env.API_URL || "http://127.0.0.1:3001";
    const resposta = await fetch(`${api}/usuarios?email=${encodeURIComponent(email)}`, { cache: "no-store" });
    if (!resposta.ok) throw new Error("API indisponível");
    const usuarios = await resposta.json();
    const usuario = usuarios.find((u: { senha: string }) => u.senha === senha);
    if (!usuario) return NextResponse.json({ erro: "E-mail ou senha incorretos." }, { status: 401 });
    const resultado = NextResponse.json({ sucesso: true });
    
    resultado.headers.set("Cache-Control", "no-store");
    return resultado;
  } catch {
    return NextResponse.json({ erro: "Não foi possível entrar. Inicie a API com npm run dev:all." }, { status: 503 });
  }
}
