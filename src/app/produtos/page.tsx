"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "../../components/Sidebar";

type Produto = {
  id: number;
  nome: string;
  categoria: string;
  preco: number;
  estoque: number;
};

const iniciais: Produto[] = [
  { id: 1, nome: "Bolo Red Velvet", categoria: "Bolos", preco: 89.9, estoque: 12 },
  { id: 2, nome: "Cupcake de Baunilha", categoria: "Cupcakes", preco: 12.9, estoque: 25 },
  { id: 3, nome: "Brownie de Chocolate", categoria: "Doces", preco: 9.9, estoque: 20 },
  { id: 4, nome: "Torta de Limão", categoria: "Tortas", preco: 69.9, estoque: 6 },
];

const moeda = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>(iniciais);
  const [busca, setBusca] = useState("");
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("Bolos");
  const [preco, setPreco] = useState("");
  const [estoque, setEstoque] = useState("");

  const filtrados = produtos.filter((p) =>
    `${p.nome} ${p.categoria}`.toLowerCase().includes(busca.toLowerCase().trim())
  );

  function adicionar() {
    const valor = Number(preco);
    const qtd = Number(estoque);

    if (!nome.trim() || valor <= 0 || qtd < 0 || estoque === "") {
      alert("Confira nome, preço e estoque.");
      return;
    }

    setProdutos([
      ...produtos,
      { id: Date.now(), nome: nome.trim(), categoria, preco: valor, estoque: qtd },
    ]);
    setNome("");
    setPreco("");
    setEstoque("");
  }

  function excluir(id: number) {
    setProdutos(produtos.filter((p) => p.id !== id));
  }

  return (
    <div className="app-layout">
      <Sidebar ativo="produtos" />

      <main className="main-area">
        <div className="page-heading">
          <div>
            <h1>Produtos </h1>
            <p>Os doces da nossa confeitaria.</p>
          </div>
        </div>

        <section className="panel">
          <h2>Adicionar produto</h2>

          <div className="field">
            <label htmlFor="nome">Nome do produto</label>
            <input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>

          <div className="field">
            <label htmlFor="categoria">Categoria</label>
            <select
              id="categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              <option>Bolos</option>
              <option>Cupcakes</option>
              <option>Doces</option>
              <option>Tortas</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="preco">Preço (R$)</label>
            <input
              id="preco"
              type="number"
              min="0.01"
              step="0.01"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="estoque">Estoque</label>
            <input
              id="estoque"
              type="number"
              min="0"
              value={estoque}
              onChange={(e) => setEstoque(e.target.value)}
            />
          </div>

          <button type="button" className="primary-button" onClick={adicionar}>
            + Adicionar produto
          </button>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <h2>Lista de produtos</h2>
            <span>{filtrados.length} produto(s)</span>
          </div>

          <input
            className="search-input"
            type="search"
            placeholder="Buscar por nome ou categoria..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Categoria</th>
                  <th>Preço</th>
                  <th>Estoque</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((p) => (
                  <tr key={p.id}>
                    <td className="product-name">{p.nome}</td>
                    <td>{p.categoria}</td>
                    <td>{moeda(p.preco)}</td>
                    <td>
                      <span className={`status ${p.estoque < 8 ? "low" : ""}`}>
                        {p.estoque}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="small-button"
                        onClick={() => excluir(p.id)}
                        title="Excluir"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtrados.length === 0 && (
              <p className="empty-state">Nenhum produto encontrado.</p>
            )}
          </div>
        </section>

        <Link href="/dashboard" className="secondary-button">
          ← Voltar ao dashboard
        </Link>
      </main>
    </div>
  );
}