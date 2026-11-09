import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { gerarToken, validarToken } from "../src/lib/auth.ts";
process.env.AUTH_SECRET = "segredo-de-teste-com-mais-de-32-caracteres";
test("aceita token assinado e recusa ausente, adulterado e expirado", () => {
  const token = gerarToken(1);
  assert.equal(validarToken(token), true);
  assert.equal(validarToken(), false);
  const partes = token.split(".");
  const payload = Buffer.from(JSON.stringify({ sub: "99", iat: 1, exp: 9999999999, iss: "velvet-dreams" })).toString("base64url");
  assert.equal(validarToken(`${partes[0]}.${payload}.${partes[2]}`), false);
  const vencido = Buffer.from(JSON.stringify({ sub: "1", iat: 1, exp: 2, iss: "velvet-dreams" })).toString("base64url");
  const dados = `${partes[0]}.${vencido}`;
  const assinatura = createHmac("sha256", process.env.AUTH_SECRET!).update(dados).digest("base64url");
  assert.equal(validarToken(`${dados}.${assinatura}`), false);
});
