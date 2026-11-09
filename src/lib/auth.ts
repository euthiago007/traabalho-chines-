import { createHmac, timingSafeEqual } from "node:crypto";

export const COOKIE = "velvet_session";
export const DURACAO = 60 * 60;
// O segredo fica somente no servidor e deve ser igual na emissão e verificação.
function segredo() {
  const valor = process.env.AUTH_SECRET;
  if (!valor || valor.length < 32) throw new Error("Configure AUTH_SECRET com pelo menos 32 caracteres.");
  return valor;
}
function assinar(texto: string) {
  return createHmac("sha256", segredo()).update(texto).digest("base64url");
}
export function gerarToken(id: string | number) {
  const agora = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ sub: String(id), iat: agora, exp: agora + DURACAO, iss: "velvet-dreams" })).toString("base64url");
  const dados = `${header}.${payload}`;
  return `${dados}.${assinar(dados)}`;
}
export function validarToken(token?: string): boolean {
  if (!token) return false;
  try {
    const partes = token.split(".");
    if (partes.length !== 3) return false;
    const [header, payload, assinatura] = partes;
    const esperado = Buffer.from(assinar(`${header}.${payload}`));
    const recebido = Buffer.from(assinatura);
    if (esperado.length !== recebido.length || !timingSafeEqual(esperado, recebido)) return false;
    const h = JSON.parse(Buffer.from(header, "base64url").toString());
    const d = JSON.parse(Buffer.from(payload, "base64url").toString());
    const agora = Math.floor(Date.now() / 1000);
    return h.alg === "HS256" && h.typ === "JWT" && d.iss === "velvet-dreams" &&
      typeof d.sub === "string" && d.sub.length > 0 && Number.isInteger(d.exp) &&
      Number.isInteger(d.iat) && d.iat <= agora && d.exp > agora;
  } catch { return false; }
}
export const cookieOpcoes = {
  httpOnly: true, secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const, path: "/",
};
