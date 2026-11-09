import { NextRequest, NextResponse } from "next/server";
import { COOKIE, validarToken } from "./lib/auth";

export function proxy(request: NextRequest) {
  if (validarToken(request.cookies.get(COOKIE)?.value)) return NextResponse.next();
  const destino = new URL("/", request.url);
  destino.searchParams.set("retorno", request.nextUrl.pathname);
  if (request.cookies.get(COOKIE)?.value) destino.searchParams.set("motivo", "sessao");
  const resposta = NextResponse.redirect(destino);
  resposta.cookies.delete(COOKIE);
  return resposta;
}
export const config = {
  matcher: ["/dashboard/:path*", "/produtos/:path*", "/usuarios/:path*"],
};
