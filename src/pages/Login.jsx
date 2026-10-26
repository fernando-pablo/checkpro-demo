import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { users } from "../auth/users";
import { companyConfig } from "../config/companyConfig";

const perfis = {
    gestor: {
        titulo: "Gestor",
        texto: "Indicadores, gráficos, limites técnicos e relatórios.",
    },
    pcm: {
        titulo: "PCM",
        texto: "Não conformidades, prioridades, tratativas e fotos.",
    },
    eletricista: {
        titulo: "Eletricista",
        texto: "Checklist em campo, medições automáticas e foto.",
    },
};

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    function entrar(usuario, senha) {
        const result = login(usuario, senha);
        if (!result.success) {
            setError(result.message);
            return;
        }
        navigate(`/${result.user.role}`);
    }

    function handleSubmit(event) {
        event.preventDefault();
        entrar(username, password);
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-brand">
                    <span>CheckPro 2.0</span>
                    <small>Plataforma de inspeções industriais</small>
                </div>

                {companyConfig.demo && (
                    <section className="demo-login" aria-labelledby="demo-titulo">
                        <h1 id="demo-titulo">Explore a demonstração</h1>
                        <p>Escolha um perfil para entrar. Os dados são fictícios e ficam salvos só no seu navegador.</p>
                        <div className="demo-perfis">
                            {users.map((u) => (
                                <button
                                    key={u.username}
                                    type="button"
                                    className="demo-perfil"
                                    onClick={() => entrar(u.username, u.password)}
                                >
                                    <strong>Entrar como {perfis[u.role]?.titulo ?? u.name}</strong>
                                    <span>{perfis[u.role]?.texto}</span>
                                </button>
                            ))}
                        </div>
                        <p className="demo-ou"><span>ou entre com usuário e senha</span></p>
                    </section>
                )}

                {!companyConfig.demo && (
                    <>
                        <h1>Acesse sua conta</h1>
                        <p>Entre conforme seu perfil operacional.</p>
                    </>
                )}

                <form onSubmit={handleSubmit}>
                    <label htmlFor="login-usuario">Usuário</label>
                    <input
                        id="login-usuario"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        autoComplete="username"
                    />

                    <label htmlFor="login-senha">Senha</label>
                    <input
                        id="login-senha"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete="current-password"
                    />

                    {error && <div className="error-message" role="alert">{error}</div>}

                    <button type="submit">Entrar</button>
                </form>
            </div>
        </div>
    );
}
