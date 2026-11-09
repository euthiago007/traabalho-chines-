"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  atualizarUsuario,
  buscarPorCampo,
  criarUsuario,
} from "../lib/api";
import type { Usuario, UsuarioInput } from "../lib/api";
import {
  mascaraCEP,
  mascaraCPF,
  mascaraData,
  mascaraTelefone,
  soDigitos,
  validarCEP,
  validarCPF,
  validarData,
  validarEmail,
  validarNome,
  validarObrigatorio,
  validarSenha,
  validarTelefone,
} from "../lib/mascaras";

type Campo =
  | "nome"
  | "email"
  | "cpf"
  | "telefone"
  | "dataNascimento"
  | "cep"
  | "logradouro"
  | "numero"
  | "complemento"
  | "bairro"
  | "cidade"
  | "estado"
  | "senha"
  | "confirmarSenha";

type Valores = Record<Campo, string>;
type Erros = Partial<Record<Campo, string>>;

const ESTADOS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

// Valida um campo isoladamente. "editando" torna a senha opcional.
function validarCampo(campo: Campo, v: Valores, editando: boolean): string {
  switch (campo) {
    case "nome":
      return validarNome(v.nome);
    case "email":
      return validarEmail(v.email);
    case "cpf":
      return validarCPF(v.cpf);
    case "telefone":
      return validarTelefone(v.telefone);
    case "dataNascimento":
      return validarData(v.dataNascimento);
    case "cep":
      return validarCEP(v.cep);
    case "logradouro":
      return validarObrigatorio(v.logradouro, "o logradouro");
    case "numero":
      return validarObrigatorio(v.numero, "o número");
    case "bairro":
      return validarObrigatorio(v.bairro, "o bairro");
    case "cidade":
      return validarObrigatorio(v.cidade, "a cidade");
    case "estado":
      return validarObrigatorio(v.estado, "o estado");
    case "senha":
      // Na edição, senha em branco = manter a senha atual
      if (editando && !v.senha && !v.confirmarSenha) return "";
      return validarSenha(v.senha);
    case "confirmarSenha":
      if (editando && !v.senha && !v.confirmarSenha) return "";
      if (!v.confirmarSenha) return "Confirme a senha.";
      return v.senha === v.confirmarSenha ? "" : "As senhas não conferem.";
    default:
      return "";
  }
}

const TODOS_OS_CAMPOS: Campo[] = [
  "nome", "email", "cpf", "telefone", "dataNascimento",
  "cep", "logradouro", "numero", "bairro", "cidade", "estado",
  "senha", "confirmarSenha",
];

function valoresIniciais(usuario?: Usuario): Valores {
  return {
    nome: usuario?.nome ?? "",
    email: usuario?.email ?? "",
    cpf: usuario?.cpf ?? "",
    telefone: usuario?.telefone ?? "",
    dataNascimento: usuario?.dataNascimento ?? "",
    cep: usuario?.cep ?? "",
    logradouro: usuario?.logradouro ?? "",
    numero: usuario?.numero ?? "",
    complemento: usuario?.complemento ?? "",
    bairro: usuario?.bairro ?? "",
    cidade: usuario?.cidade ?? "",
    estado: usuario?.estado ?? "",
    senha: "",
    confirmarSenha: "",
  };
}

type Props = {
  // Se vier um usuário, o formulário funciona como EDIÇÃO; senão, CADASTRO.
  usuario?: Usuario;
};

export default function UsuarioForm({ usuario }: Props) {
  const router = useRouter();
  const editando = Boolean(usuario);

  const [valores, setValores] = useState<Valores>(() => valoresIniciais(usuario));
  const [erros, setErros] = useState<Erros>({});
  const [erroGeral, setErroGeral] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);

  function aplicarMascara(campo: Campo, valor: string): string {
    switch (campo) {
      case "cpf":
        return mascaraCPF(valor);
      case "telefone":
        return mascaraTelefone(valor);
      case "cep":
        return mascaraCEP(valor);
      case "dataNascimento":
        return mascaraData(valor);
      default:
        return valor;
    }
  }

  function alterar(campo: Campo, valor: string) {
    setValores((atual) => ({ ...atual, [campo]: aplicarMascara(campo, valor) }));
    // Some com a mensagem de erro assim que a pessoa volta a digitar
    setErros((atual) => ({ ...atual, [campo]: undefined }));
  }

  function aoDigitar(campo: Campo) {
    return (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      alterar(campo, e.target.value);
  }

  function aoSair(campo: Campo) {
    setErros((atual) => ({ ...atual, [campo]: validarCampo(campo, valores, editando) || undefined }));
  }

  // Preenche o endereço automaticamente a partir do CEP (API pública ViaCEP).
  // Se falhar, a pessoa simplesmente preenche à mão.
  async function buscarEndereco() {
    const cep = soDigitos(valores.cep);
    aoSair("cep");
    if (cep.length !== 8) return;

    setBuscandoCep(true);
    try {
      const resp = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const dados = await resp.json();
      if (!dados.erro) {
        setValores((atual) => ({
          ...atual,
          logradouro: dados.logradouro || atual.logradouro,
          bairro: dados.bairro || atual.bairro,
          cidade: dados.localidade || atual.cidade,
          estado: dados.uf || atual.estado,
        }));
        setErros((atual) => ({
          ...atual,
          logradouro: undefined,
          bairro: undefined,
          cidade: undefined,
          estado: undefined,
        }));
      }
    } catch {
      // sem internet ou ViaCEP fora do ar: ignora
    } finally {
      setBuscandoCep(false);
    }
  }

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (enviando) return;
    setErroGeral("");

    const novosErros: Erros = {};
    for (const campo of TODOS_OS_CAMPOS) {
      const msg = validarCampo(campo, valores, editando);
      if (msg) novosErros[campo] = msg;
    }
    setErros(novosErros);

    const primeiroComErro = TODOS_OS_CAMPOS.find((c) => novosErros[c]);
    if (primeiroComErro) {
      document.getElementById(primeiroComErro)?.focus();
      return;
    }

    setEnviando(true);
    try {
      const email = valores.email.trim().toLowerCase();

      // Impede CPF e e-mail repetidos (ignorando o próprio usuário na edição)
      const [mesmoCpf, mesmoEmail] = await Promise.all([
        buscarPorCampo("cpf", valores.cpf),
        buscarPorCampo("email", email),
      ]);
      const outro = (u: Usuario) => String(u.id) !== String(usuario?.id);
      const duplicados: Erros = {};
      if (mesmoCpf.some(outro)) duplicados.cpf = "Já existe um usuário com este CPF.";
      if (mesmoEmail.some(outro)) duplicados.email = "Já existe um usuário com este e-mail.";
      if (duplicados.cpf || duplicados.email) {
        setErros(duplicados);
        document.getElementById(duplicados.cpf ? "cpf" : "email")?.focus();
        return;
      }

      const dados: UsuarioInput = {
        nome: valores.nome.trim().replace(/\s+/g, " "),
        email,
        cpf: valores.cpf,
        telefone: valores.telefone,
        dataNascimento: valores.dataNascimento,
        // Na edição, senha em branco mantém a senha atual
        senha: valores.senha || usuario?.senha || "",
        cep: valores.cep,
        logradouro: valores.logradouro.trim(),
        numero: valores.numero.trim(),
        complemento: valores.complemento.trim(),
        bairro: valores.bairro.trim(),
        cidade: valores.cidade.trim(),
        estado: valores.estado,
      };

      if (usuario) {
        await atualizarUsuario(usuario.id, dados);
      } else {
        await criarUsuario(dados);
      }

      // Mensagem de sucesso exibida na listagem
      try {
        sessionStorage.setItem(
          "usuarios:mensagem",
          editando ? "Usuário atualizado com sucesso!" : "Usuário cadastrado com sucesso!"
        );
      } catch {
        // sessionStorage indisponível: tudo bem, só não mostra a mensagem
      }
      router.push("/usuarios");
    } catch (err) {
      setErroGeral(err instanceof Error ? err.message : "Erro ao salvar o usuário.");
    } finally {
      setEnviando(false);
    }
  }

  // Pequeno helper para não repetir o bloco label + input + erro
  function campoTexto(
    campo: Campo,
    rotulo: string,
    opcoes: {
      placeholder?: string;
      tipo?: string;
      inputMode?: "numeric" | "tel" | "text" | "email";
      autoComplete?: string;
      aoSair?: () => void;
      largura?: "inteira";
    } = {}
  ) {
    const erro = erros[campo];
    return (
      <div className={`field ${opcoes.largura === "inteira" ? "field-full" : ""}`}>
        <label htmlFor={campo}>{rotulo}</label>
        <input
          id={campo}
          name={campo}
          type={opcoes.tipo ?? "text"}
          inputMode={opcoes.inputMode}
          autoComplete={opcoes.autoComplete}
          placeholder={opcoes.placeholder}
          value={valores[campo]}
          onChange={aoDigitar(campo)}
          onBlur={opcoes.aoSair ?? (() => aoSair(campo))}
          className={erro ? "invalid" : ""}
          aria-invalid={erro ? true : undefined}
          aria-describedby={erro ? `${campo}-erro` : undefined}
        />
        {erro && (
          <span id={`${campo}-erro`} className="field-error">
            {erro}
          </span>
        )}
      </div>
    );
  }

  const tipoSenha = mostrarSenha ? "text" : "password";

  return (
    <form onSubmit={enviar} noValidate aria-busy={enviando}>
      <fieldset className="form-fieldset" disabled={enviando}>
      <legend className="sr-only">Dados do usuário</legend>
      {erroGeral && (
        <div className="alert alert-error" role="alert">
          {erroGeral}
        </div>
      )}

      <section className="panel">
        <h2 className="form-section-title">Dados pessoais</h2>
        <div className="form-grid">
          {campoTexto("nome", "Nome completo", {
            placeholder: "Ex.: Maria da Silva",
            autoComplete: "name",
            largura: "inteira",
          })}
          {campoTexto("email", "E-mail", {
            placeholder: "voce@exemplo.com",
            tipo: "email",
            inputMode: "email",
            autoComplete: "email",
          })}
          {campoTexto("cpf", "CPF", {
            placeholder: "000.000.000-00",
            inputMode: "numeric",
          })}
          {campoTexto("telefone", "Telefone", {
            placeholder: "(00) 00000-0000",
            tipo: "tel",
            inputMode: "tel",
            autoComplete: "tel",
          })}
          {campoTexto("dataNascimento", "Data de nascimento", {
            placeholder: "dd/mm/aaaa",
            inputMode: "numeric",
          })}
        </div>
      </section>

      <section className="panel">
        <h2 className="form-section-title">Endereço</h2>
        <div className="form-grid">
          {campoTexto("cep", "CEP", {
            placeholder: "00000-000",
            inputMode: "numeric",
            aoSair: buscarEndereco,
          })}
          <p className="form-hint">
            {buscandoCep
              ? "Buscando endereço..."
              : "Ao informar o CEP, o endereço é preenchido automaticamente."}
          </p>
          {campoTexto("logradouro", "Logradouro", {
            placeholder: "Rua, avenida...",
            autoComplete: "address-line1",
            largura: "inteira",
          })}
          {campoTexto("numero", "Número", { placeholder: "Ex.: 123" })}
          {campoTexto("complemento", "Complemento (opcional)", {
            placeholder: "Apto, bloco...",
          })}
          {campoTexto("bairro", "Bairro")}
          {campoTexto("cidade", "Cidade")}

          <div className="field">
            <label htmlFor="estado">Estado</label>
            <select
              id="estado"
              name="estado"
              value={valores.estado}
              onChange={aoDigitar("estado")}
              onBlur={() => aoSair("estado")}
              className={erros.estado ? "invalid" : ""}
              aria-invalid={erros.estado ? true : undefined}
            >
              <option value="">Selecione</option>
              {ESTADOS.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
            {erros.estado && <span className="field-error">{erros.estado}</span>}
          </div>
        </div>
      </section>

      <section className="panel">
        <h2 className="form-section-title">Acesso</h2>
        {editando && (
          <p className="form-hint">
            Deixe os campos de senha em branco para manter a senha atual.
          </p>
        )}
        <div className="form-grid">
          {campoTexto("senha", editando ? "Nova senha" : "Senha", {
            placeholder: "Mínimo de 8 caracteres, com letras e números",
            tipo: tipoSenha,
            autoComplete: "new-password",
          })}
          {campoTexto("confirmarSenha", "Confirmar senha", {
            placeholder: "Repita a senha",
            tipo: tipoSenha,
            autoComplete: "new-password",
          })}
        </div>

        <label className="checkbox-line">
          <input
            type="checkbox"
            checked={mostrarSenha}
            onChange={(e) => setMostrarSenha(e.target.checked)}
          />
          Mostrar senha
        </label>
      </section>

      <div className="form-actions">
        <Link href="/usuarios" className="secondary-button">
          Cancelar
        </Link>
        <button type="submit" className="primary-button" disabled={enviando}>
          {enviando ? <><span className="loading-spinner" aria-hidden="true" /> Salvando...</> : editando ? "Salvar alterações" : "Cadastrar usuário"}
        </button>
      </div>
      </fieldset>
      <span className="sr-only" role="status">{enviando ? "Salvando usuário. Aguarde." : ""}</span>
    </form>
  );
}
