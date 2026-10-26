import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { companyConfig } from '../config/companyConfig'
import { getInspections } from '../services/checklistService'
import PainelGraficos from '../components/charts/PainelGraficos'

const periodos = [
    { id: '7', rotulo: 'Últimos 7 dias', dias: 7 },
    { id: '30', rotulo: 'Últimos 30 dias', dias: 30 },
    { id: 'tudo', rotulo: 'Todo o histórico', dias: null },
]

// Relatório pronto para imprimir: o botão abre a impressão do navegador,
// onde é possível escolher "Salvar como PDF".
export default function Relatorio() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [periodo, setPeriodo] = useState('30')
    const [todas, setTodas] = useState([])

    useEffect(() => {
        setTodas(getInspections())
    }, [])

    const inspecoes = useMemo(() => {
        const p = periodos.find((x) => x.id === periodo)
        if (!p.dias) return todas
        const limite = Date.now() - p.dias * 86400000
        return todas.filter((i) => new Date(i.criadoEm).getTime() >= limite)
    }, [todas, periodo])

    const ncs = inspecoes.filter((i) => i.status === 'Não conforme')
    const abertas = ncs.filter((i) => i.statusTratativa !== 'Finalizada')
    const conformidade = inspecoes.length ? Math.round(((inspecoes.length - ncs.length) / inspecoes.length) * 100) : 0
    const datas = inspecoes.map((i) => new Date(i.criadoEm))
    const inicio = datas.length ? new Date(Math.min(...datas)) : null
    const fim = datas.length ? new Date(Math.max(...datas)) : null
    const rotuloPeriodo = periodos.find((x) => x.id === periodo).rotulo

    return (
        <div className="relatorio">
            <div className="relatorio-acoes no-print">
                <button type="button" className="button button--secondary" onClick={() => navigate(`/${user?.role ?? 'login'}`)}>
                    Voltar ao painel
                </button>
                <label>
                    Período
                    <select value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
                        {periodos.map((p) => <option key={p.id} value={p.id}>{p.rotulo}</option>)}
                    </select>
                </label>
                <button type="button" className="button button--primary" onClick={() => window.print()}>
                    Imprimir ou salvar em PDF
                </button>
                <p>Na janela de impressão, escolha <strong>Salvar como PDF</strong> no campo de destino.</p>
            </div>

            <article className="relatorio-folha">
                <header className="relatorio-cabecalho">
                    <div>
                        <span className="relatorio-marca">{companyConfig.appName}</span>
                        <h1>Relatório de inspeções elétricas</h1>
                        <p>{companyConfig.companyName}</p>
                    </div>
                    <dl>
                        <div><dt>Período</dt><dd>{rotuloPeriodo}{inicio && ` (${inicio.toLocaleDateString('pt-BR')} a ${fim.toLocaleDateString('pt-BR')})`}</dd></div>
                        <div><dt>Emitido em</dt><dd>{new Date().toLocaleString('pt-BR')}</dd></div>
                        <div><dt>Emitido por</dt><dd>{user?.name}</dd></div>
                    </dl>
                </header>

                <section className="relatorio-indicadores">
                    <div><strong>{inspecoes.length}</strong><span>Inspeções</span></div>
                    <div><strong>{conformidade}%</strong><span>Conformidade</span></div>
                    <div><strong>{ncs.length}</strong><span>Não conformidades</span></div>
                    <div><strong>{abertas.length}</strong><span>Em aberto</span></div>
                </section>

                <section className="relatorio-secao">
                    <h2>Indicadores</h2>
                    <PainelGraficos inspecoes={inspecoes} />
                </section>

                <section className="relatorio-secao">
                    <h2>Não conformidades do período</h2>
                    {ncs.length === 0 ? (
                        <p>Nenhuma não conformidade no período.</p>
                    ) : (
                        <table className="relatorio-ncs">
                            <thead>
                                <tr><th>Data</th><th>Equipamento</th><th>Prioridade</th><th>Status</th><th>Ocorrência</th><th>Foto</th></tr>
                            </thead>
                            <tbody>
                                {ncs.map((i) => (
                                    <tr key={i.id}>
                                        <td>{new Date(i.criadoEm).toLocaleDateString('pt-BR')}<br /><small>{i.collectorName}</small></td>
                                        <td>{i.equipamentoNome}<br /><small>{i.setor}</small></td>
                                        <td>{i.prioridade}</td>
                                        <td>{i.statusTratativa}</td>
                                        <td>{i.observacao || '—'}</td>
                                        <td>{i.foto ? <img src={i.foto} alt={`Foto da ocorrência em ${i.equipamentoNome}`} /> : '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </section>

                <footer className="relatorio-rodape">
                    {companyConfig.appName} · {companyConfig.companyName}
                    {companyConfig.demo && ' · Relatório gerado com dados fictícios de demonstração'}
                </footer>
            </article>
        </div>
    )
}
