import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { companyConfig } from "../config/companyConfig";
import { resetDemoData } from "../services/demoData";

const nomesPerfil = { gestor: "Gestor", pcm: "PCM", eletricista: "Eletricista" };

export default function AppLayout({ title, subtitle, children, actions }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate("/login");
    }

    function handleReset() {
        if (window.confirm("Restaurar os dados de exemplo? As inspeções feitas por você nesta demonstração serão apagadas.")) {
            resetDemoData();
            window.location.reload();
        }
    }

    return (
        <div className="app-layout">
            {companyConfig.demo && (
                <div className="demo-bar no-print">
                    <span>Demonstração com dados fictícios, salvos só neste navegador.</span>
                    <button type="button" onClick={handleReset}>Restaurar dados de exemplo</button>
                </div>
            )}

            <header className="topbar no-print">
                <div>
                    <strong>CheckPro 2.0</strong>
                    <span>{user?.name} | Perfil: {nomesPerfil[user?.role] ?? user?.role}</span>
                </div>

                <nav className="topbar-nav">
                    {(user?.role === "gestor" || user?.role === "pcm") && (
                        <Link to="/relatorio">Relatório PDF</Link>
                    )}
                    <button onClick={handleLogout}>Sair</button>
                </nav>
            </header>

            <main className="content">
                <section className="page-header">
                    <div>
                        <h1>{title}</h1>
                        {subtitle && <p>{subtitle}</p>}
                    </div>
                    {actions && <div className="page-header-actions no-print">{actions}</div>}
                </section>

                {children}
            </main>
        </div>
    );
}
