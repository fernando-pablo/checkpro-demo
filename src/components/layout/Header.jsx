import { useAuth } from '../../auth/AuthContext';

export default function Header({ currentPage, setCurrentPage }) {
  const { user, logout } = useAuth();
  const menu = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'checklist', label: 'Novo Checklist' },
    { id: 'historico', label: 'Histórico' },
    { id: 'ncs', label: 'Não Conformidades' },
  ];

  return (
    <header className="app-header">
      <div>
        <strong>CheckPro 2.0</strong>
        <span>Inspeções técnicas e confiabilidade</span>
      </div>
      <nav>
        {menu.map((item) => (
          <button key={item.id} onClick={() => setCurrentPage(item.id)} className={currentPage === item.id ? 'active' : ''}>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="user-box">
        <small>{user?.name}</small>
        <small>{user?.role}</small>
        <button onClick={logout}>Sair</button>
      </div>
    </header>
  );
}
