import Link from "next/link";
import Sidebar from "../../components/Sidebar";

export default function Dashboard() {
  return (
    <div className="app-layout">
      <Sidebar ativo="dashboard" />

      <main className="main-area">
        <header className="topbar">
          <span className="admin-label">♥ Administrador</span>
        </header>

        <div className="page-heading">
          <div>
            <h1>Bem-vinda à Velvet Dreams!</h1>
            <p>Seu cantinho doce de gerenciamento.</p>
          </div>
        </div>

        <section className="stats-grid">
          <article className="stat-card">
            <div className="stat-icon">🧁</div>
            <p className="stat-label">Total de produtos</p>
            <p className="stat-value">6</p>
            <Link href="/produtos" className="stat-link">
              Ver produtos →
            </Link>
          </article>

          <article className="stat-card">
            <div className="stat-icon">♡</div>
            <p className="stat-label">Total de pedidos</p>
            <p className="stat-value">18</p>
            <span className="stat-label">Dados demonstrativos</span>
          </article>

          <article className="stat-card">
            <div className="stat-icon">R$</div>
            <p className="stat-label">Total de vendas</p>
            <p className="stat-value">R$ 2.345,00</p>
            <span className="stat-label">Dados demonstrativos</span>
          </article>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <h2>Seus doces, suas conquistas ♥</h2>
          </div>
          <p>Organize seus produtos e acompanhe sua confeitaria com charme.</p>
          <Link href="/produtos" className="primary-button">
            Abrir lista de produtos →
          </Link>
        </section>

        <section className="footer-note">
          <div className="footer-note-inner">
            Feito com amor e uma pitada de Red Velvet ♥
          </div>
        </section>
      </main>
    </div>
  );
}