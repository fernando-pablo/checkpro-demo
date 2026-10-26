import { useEffect, useMemo, useState } from 'react'
import AppLayout from '../../components/AppLayout'
import {
    getInspections,
    getNonConformities,
    getWeekCollections
} from '../../services/checklistService'
import {
    getSectorsWithEquipmentConfig,
    getMeasurementItems,
    getDefaultTechnicalLimitsForEquipment,
    updateEquipmentTechnicalLimits
} from '../../services/equipmentConfigService'
import { getWeekKey } from '../../utils/checklist'
import { getWeekRange } from '../../utils/date'
import { exportWeekChecklistToExcel } from '../../services/exportService'
import PainelGraficos from '../../components/charts/PainelGraficos'
import { Link } from 'react-router-dom'

export default function GestorDashboard() {
    const [inspecoes, setInspecoes] = useState([])
    const [naoConformidades, setNaoConformidades] = useState([])
    const [sectors, setSectors] = useState([])
    const [selectedSectorId, setSelectedSectorId] = useState('')
    const [selectedEquipmentId, setSelectedEquipmentId] = useState('')
    const [technicalLimits, setTechnicalLimits] = useState({})
    const [message, setMessage] = useState('')

    const weekKey = getWeekKey()
    const weekRange = getWeekRange()
    const measurementItems = getMeasurementItems()

    function loadData() {
        setInspecoes(getInspections())
        setNaoConformidades(getNonConformities())
        setSectors(getSectorsWithEquipmentConfig())
    }

    useEffect(() => {
        loadData()
    }, [])

    const selectedSector = useMemo(() => {
        return sectors.find((sector) => sector.id === selectedSectorId) || null
    }, [sectors, selectedSectorId])

    const selectedEquipment = useMemo(() => {
        return (
            selectedSector?.equipments.find(
                (equipment) => equipment.id === selectedEquipmentId
            ) || null
        )
    }, [selectedSector, selectedEquipmentId])

    useEffect(() => {
        if (selectedEquipment) {
            setTechnicalLimits(getDefaultTechnicalLimitsForEquipment(selectedEquipment))
        } else {
            setTechnicalLimits({})
        }
    }, [selectedEquipment])

    const equipamentosCriticos = new Set(
        naoConformidades.map((item) => item.equipamentoNome)
    ).size

    const conformes = inspecoes.filter((item) => item.status === 'Conforme').length

    const conformidadeGeral =
        inspecoes.length > 0 ? Math.round((conformes / inspecoes.length) * 100) : 0

    const abertas = naoConformidades.filter(
        (item) => item.statusTratativa !== 'Finalizada'
    )

    function handleLimitChange(itemId, value) {
        setMessage('')

        setTechnicalLimits((prev) => ({
            ...prev,
            [itemId]: value
        }))
    }

    function handleSaveLimits(event) {
        event.preventDefault()

        if (!selectedEquipment) {
            setMessage('Selecione um equipamento.')
            return
        }

        updateEquipmentTechnicalLimits(selectedEquipment.id, technicalLimits)
        setMessage('Parâmetros técnicos salvos com sucesso.')
        loadData()
    }

    function handleExport() {
        const weekRecords = getWeekCollections(weekKey)
        exportWeekChecklistToExcel(weekRange.label, weekRecords)
    }

    const indicadores = [
        {
            titulo: 'Inspeções realizadas',
            valor: inspecoes.length,
            descricao: 'Total de inspeções registradas'
        },
        {
            titulo: 'Não conformidades abertas',
            valor: abertas.length,
            descricao: 'Pendências aguardando tratativa'
        },
        {
            titulo: 'Equipamentos críticos',
            valor: equipamentosCriticos,
            descricao: 'Equipamentos com registros não conformes'
        },
        {
            titulo: 'Conformidade geral',
            valor: `${conformidadeGeral}%`,
            descricao: 'Percentual de inspeções conformes'
        }
    ]

    return (
        <AppLayout
            title="Dashboard do Gestor"
            subtitle="Visão estratégica das inspeções, indicadores, histórico e parâmetros técnicos."
        >
            <div className="dashboard-grid">
                {indicadores.map((item) => (
                    <div className="dashboard-card" key={item.titulo}>
                        <h3>{item.titulo}</h3>
                        <strong>{item.valor}</strong>
                        <p>{item.descricao}</p>
                    </div>
                ))}
            </div>

            <PainelGraficos inspecoes={inspecoes} />

            <div className="panel">
                <div className="section-header">
                    <div>
                        <h2>Configurações técnicas dos equipamentos</h2>
                        <p>
                            Edite os limites usados no checklist do eletricista.
                            Exemplo: corrente nominal e temperaturas máximas.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSaveLimits}>
                    <div className="form-grid form-grid--top">
                        <div className="form-group">
                            <label>Setor</label>
                            <select
                                value={selectedSectorId}
                                onChange={(event) => {
                                    setSelectedSectorId(event.target.value)
                                    setSelectedEquipmentId('')
                                    setMessage('')
                                }}
                            >
                                <option value="">Selecione</option>
                                {sectors.map((sector) => (
                                    <option key={sector.id} value={sector.id}>
                                        {sector.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Equipamento</label>
                            <select
                                value={selectedEquipmentId}
                                onChange={(event) => {
                                    setSelectedEquipmentId(event.target.value)
                                    setMessage('')
                                }}
                                disabled={!selectedSector}
                            >
                                <option value="">Selecione</option>
                                {selectedSector?.equipments.map((equipment) => (
                                    <option key={equipment.id} value={equipment.id}>
                                        {equipment.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {selectedEquipment && (
                        <>
                            <div className="equipment-config-grid">
                                {measurementItems.map((item) => (
                                    <div className="form-group" key={item.id}>
                                        <label>
                                            {item.label} {item.unit ? `(${item.unit})` : ''}
                                        </label>

                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={technicalLimits[item.id] ?? ''}
                                            onChange={(event) =>
                                                handleLimitChange(item.id, event.target.value)
                                            }
                                            placeholder="Informe o limite permitido"
                                        />
                                    </div>
                                ))}
                            </div>

                            <button type="submit" className="button button--primary">
                                Salvar parâmetros técnicos
                            </button>
                        </>
                    )}

                    {message && (
                        <div className="success-message">
                            {message}
                        </div>
                    )}
                </form>
            </div>

            <div className="panel">
                <div className="section-header">
                    <div>
                        <h2>Relatórios</h2>
                        <p>Relatório em PDF com indicadores, gráficos e fotos, e planilha semanal dos checklists.</p>
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
                <h2>Últimas inspeções</h2>

                {inspecoes.length === 0 ? (
                    <p>Nenhuma inspeção registrada ainda.</p>
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
                                    <th>Status</th>
                                    <th>Observação</th>
                                </tr>
                            </thead>

                            <tbody>
                                {inspecoes.slice(0, 10).map((item) => (
                                    <tr key={item.id}>
                                        <td>{new Date(item.criadoEm).toLocaleString('pt-BR')}</td>
                                        <td>{item.equipamentoNome}</td>
                                        <td>{item.setor}</td>
                                        <td>{item.collectorName}</td>
                                        <td>{item.shift}</td>
                                        <td><span className={`etiqueta-status ${item.status === 'Conforme' ? 'ok' : 'nc'}`}>{item.status}</span></td>
                                        <td>{item.observacao || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AppLayout>
    )
}