"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Sidebar from "../../../../components/Sidebar";
import UsuarioForm from "../../../../components/UsuarioForm";
import { buscarUsuario } from "../../../../lib/api";
import type { Usuario } from "../../../../lib/api";

export default function EditarUsuario() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    buscarUsuario(id)
      .then((u) => {
        if (ativo) setUsuario(u);
      })
      .catch((e: unknown) => {
        if (ativo) setErro(e instanceof Error ? e.message : "Erro ao carregar o usuário.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [id]);

  return (
    <div className="app-layout">
      <Sidebar ativo="usuarios" />

      <main className="main-area">
        <div className="page-heading">
          <div>
            <h1>Editar usuário</h1>
            <p>Altere os dados e salve para atualizar o cadastro.</p>
          </div>
        </div>

        {carregando && <p className="empty-state">Carregando usuário...</p>}

        {erro && (
          <>
            <div className="alert alert-error" role="alert">
              {erro}
            </div>
            <Link href="/usuarios" className="secondary-button">
              ← Voltar para a lista
            </Link>
          </>
        )}

        {usuario && <UsuarioForm usuario={usuario} />}
      </main>
    </div>
  );
}
