import { useEffect, useState } from 'react'
import AppLayout from '../../components/AppLayout'
import {
    getNonConformities,
    updateNonConformity,
    getWeekCollections
} from '../../services/checklistService'
import { getWeekKey } from '../../utils/checklist'
import { getWeekRange } from '../../utils/date'
import { exportWeekChecklistToExcel } from '../../services/exportService'
import { Link } from 'react-router-dom'

export default function PCMDashboard() {
    const [naoConformidades, setNaoConformidades] = useState([])
    const [fotoAberta, setFotoAberta] = useState(null)

    const weekKey = getWeekKey()
    const weekRange = getWeekRange()

    function carregarDados() {
        setNaoConformidades(getNonConformities())
    }

    useEffect(() => {
        carregarDados()
    }, [])

    // Fecha a foto ampliada com a tecla Esc.
    useEffect(() => {
        if (!fotoAberta) return
        const fechar = (event) => event.key === 'Escape' && setFotoAberta(null)
        window.addEventListener('keydown', fechar)
        return () => window.removeEventListener('keydown', fechar)
    }, [fotoAberta])

    function alterarStatus(id, statusTratativa) {
        updateNonConformity(id, { statusTratativa })
        carregarDados()
    }

    function alterarPrioridade(id, prioridade) {
        updateNonConformity(id, { prioridade })
        carregarDados()
    }

    function handleExport() {
        const weekRecords = getWeekCollections(weekKey)
        exportWeekChecklistToExcel(weekRange.label, weekRecords)
    }

    const abertas = naoConformidades.filter(
        (item) => item.statusTratativa !== 'Finalizada'
    )

    return (
        <AppLayout
            title="Painel PCM"
            subtitle="Acompanhamento das não conformidades, prioridades e tratativas."
        >
            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h3>Não conformidades abertas</h3>
                    <strong>{abertas.length}</strong>
                    <p>Pendências aguardando ação</p>
                </div>

                <div className="dashboard-card">
                    <h3>Prioridade alta</h3>
                    <strong>
                        {naoConformidades.filter((item) => item.prioridade === 'Alta').length}
                    </strong>
                    <p>Ocorrências críticas para tratativa</p>
                </div>

                <div className="dashboard-card">
                    <h3>Finalizadas</h3>
                    <strong>
                        {
                            naoConformidades.filter(
                                (item) => item.statusTratativa === 'Finalizada'
                            ).length
                        }
                    </strong>
                    <p>Não conformidades encerradas</p>
                </div>
            </div>

            <div className="panel">
                <div className="section-header">
                    <div>
                        <h2>Relatórios</h2>
                        <p>Relatório em PDF com as não conformidades e fotos, e planilha semanal dos checklists.</p>
                    </div>

                    <div className="botoes-relatorio">
                        <Link to="/relatorio" className="button button--primary">
                            Gerar relatório PDF
                        </Link>
                        <button
                            type="button"
                            className="button button--secondary"
                            onClick={handleExport}
                        >
                            Exportar planilha semanal
                        </button>
                    </div>
                </div>
            </div>

            <div className="panel">
                <h2>Lista de não conformidades</h2>

                {naoConformidades.length === 0 ? (
                    <p>Nenhuma não conformidade registrada ainda.</p>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Equipamento</th>
                                    <th>Setor</th>
                                    <th>Técnico</th>
                                    <th>Turno</th>
                                    <th>Prioridade</th>
                                    <th>Status</th>
                                    <th>Observação</th>
                                    <th>Foto</th>
                                </tr>
                            </thead>

                            <tbody>
                                {naoConformidades.map((item) => (
                                    <tr key={item.id}>
                                        <td>{new Date(item.criadoEm).toLocaleString('pt-BR')}</td>
                                        <td>{item.equipamentoNome}</td>
                                        <td>{item.setor}</td>
                                        <td>{item.collectorName}</td>
                                        <td>{item.shift}</td>
                                        <td>
                                            <select
                                                value={item.prioridade}
                                                onChange={(event) =>
                                                    alterarPrioridade(item.id, event.target.value)
                                                }
                                            >
                                                <option>Baixa</option>
                                                <option>Média</option>
                                                <option>Alta</option>
                                                <option>Crítica</option>
                                            </select>
                                        </td>
                                        <td>
                                            <select
                                                value={item.statusTratativa}
                                                onChange={(event) =>
                                                    alterarStatus(item.id, event.target.value)
                                                }
                                            >
                                                <option>Aberta</option>
                                                <option>Em análise</option>
                                                <option>Em execução</option>
                                                <option>Finalizada</option>
                                            </select>
                                        </td>
                                        <td>{item.observacao || 'Sem observação'}</td>
                                        <td>
                                            {item.foto ? (
                                                <button type="button" className="miniatura" onClick={() => setFotoAberta(item)}
                                                    aria-label={`Ver foto da não conformidade em ${item.equipamentoNome}`}>
                                                    <img src={item.foto} alt="" />
                                                </button>
                                            ) : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {fotoAberta && (
                <div className="foto-modal" role="dialog" aria-modal="true" aria-label="Foto da não conformidade"
                    onClick={() => setFotoAberta(null)}>
                    <figure onClick={(event) => event.stopPropagation()}>
                        <img src={fotoAberta.foto} alt={`Não conformidade em ${fotoAberta.equipamentoNome}`} />
                        <figcaption>
                            <strong>{fotoAberta.equipamentoNome}</strong> · {fotoAberta.setor} ·{' '}
                            {new Date(fotoAberta.criadoEm).toLocaleString('pt-BR')}
                        </figcaption>
                        <button type="button" className="button button--secondary" onClick={() => setFotoAberta(null)} autoFocus>
                            Fechar
                        </button>
                    </figure>
                </div>
            )}
        </AppLayout>
    )
}