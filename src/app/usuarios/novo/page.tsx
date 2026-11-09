import Sidebar from "../../../components/Sidebar";
import UsuarioForm from "../../../components/UsuarioForm";

export default function NovoUsuario() {
  return (
    <div className="app-layout">
      <Sidebar ativo="usuarios" />

      <main className="main-area">
        <div className="page-heading">
          <div>
            <h1>Novo usuário</h1>
            <p>Preencha os dados para cadastrar uma nova pessoa.</p>
          </div>
        </div>

        <UsuarioForm />
      </main>
    </div>
  );
}
