// Máscaras e validações usadas no cadastro de usuários.
// São funções puras (sem React), então podem ser testadas isoladamente.

export const soDigitos = (valor: string): string => valor.replace(/\D/g, "");

/* ------------------------------ MÁSCARAS ------------------------------ */

// 000.000.000-00
export function mascaraCPF(valor: string): string {
  const d = soDigitos(valor).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

// (00) 0000-0000  ou  (00) 00000-0000
export function mascaraTelefone(valor: string): string {
  const d = soDigitos(valor).slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

// 00000-000
export function mascaraCEP(valor: string): string {
  const d = soDigitos(valor).slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

// dd/mm/aaaa
export function mascaraData(valor: string): string {
  const d = soDigitos(valor).slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

/* ----------------------------- VALIDAÇÕES ----------------------------- */
// Todas retornam "" quando o valor é válido ou a mensagem de erro.

export function validarNome(valor: string): string {
  const nome = valor.trim().replace(/\s+/g, " ");
  if (!nome) return "Informe o nome completo.";
  if (nome.length < 3) return "O nome deve ter pelo menos 3 caracteres.";
  if (!nome.includes(" ")) return "Informe nome e sobrenome.";
  if (/\d/.test(nome)) return "O nome não pode conter números.";
  return "";
}

export function validarEmail(valor: string): string {
  const email = valor.trim();
  if (!email) return "Informe o e-mail.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return "E-mail inválido.";
  return "";
}

export function cpfEhValido(valor: string): boolean {
  const d = soDigitos(valor);
  if (d.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(d)) return false; // 111.111.111-11 etc.

  const digito = (base: string, pesoInicial: number): number => {
    let soma = 0;
    for (let i = 0; i < base.length; i++) {
      soma += Number(base[i]) * (pesoInicial - i);
    }
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  const d1 = digito(d.slice(0, 9), 10);
  const d2 = digito(d.slice(0, 10), 11);
  return d1 === Number(d[9]) && d2 === Number(d[10]);
}

export function validarCPF(valor: string): string {
  if (!soDigitos(valor)) return "Informe o CPF.";
  if (soDigitos(valor).length < 11) return "CPF incompleto.";
  if (!cpfEhValido(valor)) return "CPF inválido.";
  return "";
}

export function validarTelefone(valor: string): string {
  const d = soDigitos(valor);
  if (!d) return "Informe o telefone.";
  if (d.length < 10) return "Telefone incompleto.";
  const ddd = Number(d.slice(0, 2));
  if (ddd < 11 || ddd > 99) return "DDD inválido.";
  if (d.length === 11 && d[2] !== "9") return "Celular deve começar com 9.";
  return "";
}

export function validarCEP(valor: string): string {
  const d = soDigitos(valor);
  if (!d) return "Informe o CEP.";
  if (d.length !== 8) return "CEP incompleto.";
  return "";
}

export function validarData(valor: string, hoje: Date = new Date()): string {
  if (!valor) return "Informe a data de nascimento.";
  const partes = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!partes) return "Use o formato dd/mm/aaaa.";

  const dia = Number(partes[1]);
  const mes = Number(partes[2]);
  const ano = Number(partes[3]);

  const data = new Date(ano, mes - 1, dia);
  const existe =
    data.getFullYear() === ano &&
    data.getMonth() === mes - 1 &&
    data.getDate() === dia;
  if (!existe) return "Data inexistente.";
  if (ano < 1900) return "Ano inválido.";

  const limite = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  if (data > limite) return "A data não pode estar no futuro.";
  return "";
}

export function validarSenha(valor: string): string {
  if (!valor) return "Informe a senha.";
  if (valor.length < 8) return "A senha deve ter pelo menos 8 caracteres.";
  if (!/[A-Za-z]/.test(valor) || !/\d/.test(valor)) {
    return "A senha deve ter letras e números.";
  }
  return "";
}

export function validarObrigatorio(valor: string, nomeCampo: string): string {
  return valor.trim() ? "" : `Informe ${nomeCampo}.`;
}
