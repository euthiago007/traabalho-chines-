"use client";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [enviando, setEnviando] = useState(false);
  const trava = useRef(false);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("motivo") === "sessao") {
      setAviso("Sua sessão expirou ou é inválida. Entre novamente.");
    }
  }, []);
  async function entrar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (trava.current) return;
    trava.current = true;
    setErro(""); setAviso(""); setEnviando(true);
    let navegando = false;
    try {
      // Tempo mínimo de feedback visual; a resposta real continua obrigatória.
      const [resposta] = await Promise.all([
        fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, senha }) }),
        new Promise(resolve => setTimeout(resolve, 600)),
      ]);
      const dados = await resposta.json();
      if (!resposta.ok) { setErro(dados.erro || "Não foi possível entrar."); return; }
      const retorno = new URLSearchParams(window.location.search).get("retorno") || "/dashboard";
      navegando = true;
      window.location.assign(/^\/(dashboard|usuarios|produtos)(\/|$)/.test(retorno) ? retorno : "/dashboard");
    } catch { setErro("Não foi possível conectar ao sistema. Verifique a conexão e tente novamente."); }
    finally { if (!navegando) { setEnviando(false); trava.current = false; } }
  }
  return <main className="login-page"><section className="login-card">
    <div className="brand-icon" aria-hidden="true">♥</div><h1 className="brand">Velvet Dreams</h1>
    <p className="brand-subtitle">Confeitaria artesanal</p>
    <p className="login-description">Entre para cuidar dos seus melhores momentos.</p>
    {aviso && <div className="alert alert-info" role="status">{aviso}</div>}
    {erro && <div className="alert alert-error" role="alert">{erro}</div>}
    <form onSubmit={entrar} aria-busy={enviando}>
      <fieldset className="form-fieldset" disabled={enviando}>
        <legend className="sr-only">Entrar no sistema</legend>
        <div className="field"><label htmlFor="email">E-mail</label><input id="email" name="email" type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Seu e-mail" /></div>
        <div className="field"><label htmlFor="senha">Senha</label>
          <div className="password-control"><input id="senha" name="senha" type={mostrarSenha ? "text" : "password"} autoComplete="current-password" required value={senha} onChange={e => setSenha(e.target.value)} placeholder="Digite sua senha" />
          <button type="button" className="password-toggle" aria-controls="senha" aria-pressed={mostrarSenha} onClick={() => setMostrarSenha(!mostrarSenha)}>{mostrarSenha ? "Ocultar" : "Mostrar"}</button></div>
        </div>
        <button type="submit" className="primary-button login-button" disabled={enviando}>{enviando ? <><span className="loading-spinner" aria-hidden="true" /> Entrando...</> : "Entrar ♥"}</button>
      </fieldset>
      <span className="sr-only" role="status">{enviando ? "Validando suas credenciais. Aguarde." : ""}</span>
    </form><p className="login-note">Um toque de carinho em cada detalhe.</p>
  </section></main>;
}
