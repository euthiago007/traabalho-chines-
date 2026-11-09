import Link from "next/link";

type Props = {
  ativo: "dashboard" | "produtos" | "usuarios";
};

export default function Sidebar({ ativo }: Props) {
  return (
    <aside className="sidebar">
      <h2 className="brand">Velvet Dreams</h2>
      <span className="brand-subtitle">♥ Confeitaria artesanal ♥</span>

      <nav className="sidebar-nav">
        <Link
          href="/dashboard"
          className={`nav-button ${ativo === "dashboard" ? "active" : ""}`}
        >
          ⌂ Dashboard
        </Link>
        <Link
          href="/produtos"
          className={`nav-button ${ativo === "produtos" ? "active" : ""}`}
        >
          ♧ Produtos
        </Link>
        <Link
          href="/usuarios"
          className={`nav-button ${ativo === "usuarios" ? "active" : ""}`}
        >
          ☺ Usuários
        </Link>
      </nav>

      <div className="sidebar-bottom">
        <form action="/api/auth/logout" method="post">
          <button type="submit" className="nav-button">↪ Sair</button>
        </form>
      </div>
    </aside>
  );
}
