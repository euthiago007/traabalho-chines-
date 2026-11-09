import { NextRequest, NextResponse } from "next/server";
import { COOKIE, cookieOpcoes } from "../../../../lib/auth";
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== `${request.nextUrl.protocol}//${request.headers.get("host")}`) return NextResponse.json({ erro: "Origem inválida." }, { status: 403 });
  const resposta = NextResponse.redirect(new URL("/", request.url), 303);
  resposta.cookies.set(COOKIE, "", { ...cookieOpcoes, maxAge: 0 });
  return resposta;
}
