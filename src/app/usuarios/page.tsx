"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "../../components/Sidebar";
import { excluirUsuario, listarUsuarios } from "../../lib/api";
import type { Usuario } from "../../lib/api";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [busca, setBusca] = useState("");
  const [paraExcluir, setParaExcluir] = useState<Usuario | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    let ativo = true;

    listarUsuarios()
      .then((lista) => {
        if (!ativo) return;
        setUsuarios(lista);

        // Mensagem deixada pelo formulário após cadastrar/editar
        try {
          const salva = sessionStorage.getItem("usuarios:mensagem");
          if (salva) {
            setMensagem(salva);
            sessionStorage.removeItem("usuarios:mensagem");
          }
        } catch {
          // sessionStorage indisponível: ignora
        }
      })
      .catch((e: unknown) => {
        if (!ativo) return;
        setErro(e instanceof Error ? e.message : "Erro ao carregar usuários.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  const termo = busca.toLowerCase().trim();
  const filtrados = usuarios.filter((u) =>
    `${u.nome} ${u.email} ${u.cpf} ${u.cidade}`.toLowerCase().includes(termo)
  );

  async function confirmarExclusao() {
    if (!paraExcluir || excluindo) return;

    setExcluindo(true);
    setErro("");
    try {
      await excluirUsuario(paraExcluir.id);
      setUsuarios((atual) => atual.filter((u) => u.id !== paraExcluir.id));
      setMensagem(`Usuário "${paraExcluir.nome}" excluído com sucesso.`);
      setParaExcluir(null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao excluir o usuário.");
      setParaExcluir(null);
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <div className="app-layout">
      <Sidebar ativo="usuarios" />

      <main className="main-area">
        <div className="page-heading">
          <div>
            <h1>Usuários</h1>
            <p>Gerencie as pessoas cadastradas no sistema.</p>
          </div>
          <Link href="/usuarios/novo" className="primary-button">
            + Novo usuário
          </Link>
        </div>

        {mensagem && (
          <div className="alert alert-success" role="status">
            {mensagem}
          </div>
        )}
        {erro && (
          <div className="alert alert-error" role="alert">
            {erro}
          </div>
        )}

        <section className="panel">
          <div className="panel-heading">
            <h2>Lista de usuários</h2>
            <span>{filtrados.length} usuário(s)</span>
          </div>

          <input
            className="search-input"
            type="search"
            placeholder="Buscar por nome, e-mail, CPF ou cidade..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />

          {carregando ? (
            <p className="empty-state" role="status"><span className="loading-spinner" aria-hidden="true" /> Carregando usuários...</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>CPF</th>
                    <th>Telefone</th>
                    <th>Nascimento</th>
                    <th>Cidade/UF</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((u) => (
                    <tr key={u.id}>
                      <td className="product-name">{u.nome}</td>
                      <td>{u.email}</td>
                      <td>{u.cpf}</td>
                      <td>{u.telefone}</td>
                      <td>{u.dataNascimento}</td>
                      <td>
                        {u.cidade}/{u.estado}
                      </td>
                      <td>
                        <div className="table-actions">
                          <Link
                            href={`/usuarios/${u.id}/editar`}
                            className="small-button"
                            title="Editar"
                            aria-label={`Editar ${u.nome}`}
                          >
                            ✎
                          </Link>
                          <button
                            type="button"
                            className="small-button"
                            title="Excluir"
                            aria-label={`Excluir ${u.nome}`}
                            onClick={() => setParaExcluir(u)}
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filtrados.length === 0 && (
                <p className="empty-state">
                  {usuarios.length === 0
                    ? "Nenhum usuário cadastrado ainda."
                    : "Nenhum usuário encontrado para essa busca."}
                </p>
              )}
            </div>
          )}
        </section>

        <Link href="/dashboard" className="secondary-button">
          ← Voltar ao dashboard
        </Link>
      </main>

      {paraExcluir && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <h2>Excluir usuário?</h2>
            <p>
              Você está prestes a excluir <strong>{paraExcluir.nome}</strong>. Essa ação
              não pode ser desfeita.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setParaExcluir(null)}
                disabled={excluindo}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="danger-button"
                onClick={confirmarExclusao}
                disabled={excluindo}
              >
                {excluindo ? <><span className="loading-spinner" aria-hidden="true" /> Excluindo...</> : "Sim, excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
