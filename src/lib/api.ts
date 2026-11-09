// O navegador usa a API protegida do Next.js; o JSON Server fica interno.
export const API_URL = "/api/dados";

export type Usuario = {
  id: number | string;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  dataNascimento: string;
  senha: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
};

export type UsuarioInput = Omit<Usuario, "id">;

async function requisicao<T>(caminho: string, opcoes?: RequestInit): Promise<T> {
  let resposta: Response;

  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      ...opcoes,
      headers: { "Content-Type": "application/json", ...opcoes?.headers },
      cache: "no-store",
    });
  } catch {
    throw new Error(
      "Não foi possível conectar à API. Verifique se o JSON Server está rodando (npm run api)."
    );
  }

  if (resposta.status === 401) {
    window.location.assign("/?motivo=sessao");
    throw new Error("Sessão expirada. Entre novamente.");
  }
  if (resposta.status === 404) {
    throw new Error("Registro não encontrado.");
  }
  if (!resposta.ok) {
    throw new Error(`Erro na API (${resposta.status}).`);
  }

  // DELETE devolve corpo vazio ({}), então tratamos com cuidado
  const texto = await resposta.text();
  return (texto ? JSON.parse(texto) : {}) as T;
}

export function listarUsuarios(): Promise<Usuario[]> {
  return requisicao<Usuario[]>("/usuarios?_sort=nome&_order=asc");
}

export function buscarUsuario(id: number | string): Promise<Usuario> {
  return requisicao<Usuario>(`/usuarios/${id}`);
}

export function criarUsuario(dados: UsuarioInput): Promise<Usuario> {
  return requisicao<Usuario>("/usuarios", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export function atualizarUsuario(id: number | string, dados: UsuarioInput): Promise<Usuario> {
  return requisicao<Usuario>(`/usuarios/${id}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });
}

export async function excluirUsuario(id: number | string): Promise<void> {
  await requisicao<unknown>(`/usuarios/${id}`, { method: "DELETE" });
}

// Usado para impedir CPF/e-mail duplicados
export function buscarPorCampo(
  campo: "cpf" | "email",
  valor: string
): Promise<Usuario[]> {
  return requisicao<Usuario[]>(`/usuarios?${campo}=${encodeURIComponent(valor)}`);
}
