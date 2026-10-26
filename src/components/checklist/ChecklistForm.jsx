import { useEffect, useMemo, useState } from 'react'
import { checklistTemplate } from '../../data/equipments'
import { getCurrentDate, getWeekRange } from '../../utils/date'
import { evaluateRule, getWeekKey } from '../../utils/checklist'
import {
    getCollectedEquipmentIds,
    getWeekCollections,
    saveWeekCollection,
    saveInspection
} from '../../services/checklistService'
import {
    getSectorsWithEquipmentConfig,
    getEffectiveItemForEquipment
} from '../../services/equipmentConfigService'
import SectorSelector from './SectorSelector'
import EquipmentSelector from './EquipmentSelector'
import ChecklistItemRow from './ChecklistItemRow'
import { compressImage } from '../../utils/image'

const shiftOptions = [
    '06:00 às 14:00',
    '14:00 às 22:00',
    '22:00 às 06:00'
]

const equipmentStatusOptions = ['Em funcionamento', 'Parado']

const initialFormState = {
    collectorName: '',
    shift: '',
    equipmentOperationStatus: '',
    sectorId: '',
    equipmentId: '',
    responses: {},
    stoppedEquipmentObservation: '',
    photo: null
}

function normalizeDecimalValue(value) {
    if (value === null || value === undefined) return ''
    return String(value).replace(',', '.')
}

function getResponseByPossibleLabels(responses, possibleWords) {
    const entries = Object.entries(responses)

    const foundEntry = entries.find(([itemId]) => {
        const id = String(itemId).toLowerCase()
        return possibleWords.some((word) => id.includes(word))
    })

    return foundEntry ? foundEntry[1] : null
}

export default function ChecklistForm() {
    const [form, setForm] = useState(initialFormState)
    const [weekKey] = useState(getWeekKey())
    const [weekRange] = useState(getWeekRange())
    const [collectedEquipmentIds, setCollectedEquipmentIds] = useState([])
    const [formMessage, setFormMessage] = useState(null)
    const [sectors, setSectors] = useState(getSectorsWithEquipmentConfig())

    useEffect(() => {
        setCollectedEquipmentIds(getCollectedEquipmentIds(weekKey))
        setSectors(getSectorsWithEquipmentConfig())
    }, [weekKey])

    const selectedSector = useMemo(() => {
        return sectors.find((sector) => sector.id === form.sectorId) || null
    }, [sectors, form.sectorId])

    const availableEquipments = useMemo(() => {
        if (!selectedSector) return []

        return selectedSector.equipments.filter(
            (equipment) => !collectedEquipmentIds.includes(equipment.id)
        )
    }, [selectedSector, collectedEquipmentIds])

    const selectedEquipment = useMemo(() => {
        return (
            availableEquipments.find(
                (equipment) => equipment.id === form.equipmentId
            ) || null
        )
    }, [availableEquipments, form.equipmentId])

    const effectiveChecklistTemplate = useMemo(() => {
        if (!selectedEquipment) return checklistTemplate

        return checklistTemplate.map((item) =>
            getEffectiveItemForEquipment(item, selectedEquipment)
        )
    }, [selectedEquipment])

    const isStopped = form.equipmentOperationStatus === 'Parado'

    const hasAnyNC = useMemo(() => {
        return Object.values(form.responses).some(
            (response) => response?.status === 'NC'
        )
    }, [form.responses])

    function showMessage(type, text) {
        setFormMessage({ type, text })
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    function clearMessage() {
        setFormMessage(null)
    }

    function resetFormKeepingTopData() {
        setForm((prev) => ({
            collectorName: prev.collectorName,
            shift: prev.shift,
            equipmentOperationStatus: '',
            sectorId: prev.sectorId,
            equipmentId: '',
            responses: {},
            stoppedEquipmentObservation: '',
            photo: null
        }))
    }

    function handleCollectorChange(event) {
        clearMessage()

        setForm((prev) => ({
            ...prev,
            collectorName: event.target.value
        }))
    }

    function handleShiftChange(event) {
        clearMessage()

        setForm((prev) => ({
            ...prev,
            shift: event.target.value
        }))
    }

    function handleEquipmentOperationStatusChange(event) {
        clearMessage()

        const status = event.target.value

        setForm((prev) => ({
            ...prev,
            equipmentOperationStatus: status,
            responses: status === 'Parado' ? {} : prev.responses
        }))
    }

    function handleSectorChange(event) {
        clearMessage()

        setForm((prev) => ({
            ...prev,
            sectorId: event.target.value,
            equipmentId: '',
            equipmentOperationStatus: '',
            responses: {},
            stoppedEquipmentObservation: '',
            photo: null
        }))
    }

    function handleEquipmentChange(event) {
        clearMessage()

        setForm((prev) => ({
            ...prev,
            equipmentId: event.target.value,
            equipmentOperationStatus: '',
            responses: {},
            stoppedEquipmentObservation: '',
            photo: null
        }))
    }

    function updateResponse(itemId, patch) {
        setForm((prev) => ({
            ...prev,
            responses: {
                ...prev.responses,
                [itemId]: {
                    ...prev.responses[itemId],
                    ...patch
                }
            }
        }))
    }

    function handleValueChange(itemId, value) {
        clearMessage()

        const templateItem = effectiveChecklistTemplate.find(
            (item) => item.id === itemId
        )

        if (!templateItem) return

        if (templateItem.kind === 'measurement-auto-status') {
            const normalizedValue = normalizeDecimalValue(value)
            const autoStatus = evaluateRule(normalizedValue, templateItem.rule)

            updateResponse(itemId, {
                value,
                status: autoStatus,
                observation:
                    autoStatus === 'NC'
                        ? 'Valor acima do limite permitido.'
                        : ''
            })

            return
        }

        updateResponse(itemId, { value })
    }

    function handleStatusChange(itemId, status) {
        clearMessage()

        updateResponse(itemId, {
            status,
            observation: status === 'NC' ? undefined : ''
        })
    }

    function handleObservationChange(itemId, observation) {
        clearMessage()

        updateResponse(itemId, { observation })
    }

    async function handlePhotoChange(event) {
        clearMessage()
        const file = event.target.files?.[0]
        event.target.value = ''
        if (!file) return

        try {
            const photo = await compressImage(file)
            setForm((prev) => ({ ...prev, photo }))
        } catch (error) {
            showMessage('error', error.message)
        }
    }

    function removePhoto() {
        setForm((prev) => ({ ...prev, photo: null }))
    }

    function handleStoppedEquipmentObservationChange(event) {
        clearMessage()

        setForm((prev) => ({
            ...prev,
            stoppedEquipmentObservation: event.target.value
        }))
    }

    function validateForm() {
        if (!form.collectorName.trim()) {
            showMessage('error', 'Informe o técnico responsável.')
            return false
        }

        if (!form.shift) {
            showMessage('error', 'Selecione o turno.')
            return false
        }

        if (!form.sectorId) {
            showMessage('error', 'Selecione um setor.')
            return false
        }

        if (!form.equipmentId) {
            showMessage('error', 'Selecione um equipamento.')
            return false
        }

        if (!selectedEquipment) {
            showMessage('error', 'Equipamento inválido ou já coletado nesta semana.')
            return false
        }

        if (!form.equipmentOperationStatus) {
            showMessage('error', 'Selecione o estado do equipamento.')
            return false
        }

        if (isStopped) {
            return true
        }

        for (const item of effectiveChecklistTemplate) {
            const response = form.responses[item.id]

            if (
                (item.kind === 'measurement-auto-status' ||
                    item.kind === 'measurement-manual-status') &&
                (!response?.value || String(response.value).trim() === '')
            ) {
                showMessage('error', `Preencha o valor de: ${item.label}`)
                return false
            }

            if (
                (item.kind === 'measurement-manual-status' ||
                    item.kind === 'status-only') &&
                (!response?.status || String(response.status).trim() === '')
            ) {
                showMessage('error', `Selecione C ou NC para: ${item.label}`)
                return false
            }

            if (
                item.kind === 'measurement-auto-status' &&
                (!response?.status || String(response.status).trim() === '')
            ) {
                showMessage('error', `O status automático de ${item.label} não foi calculado.`)
                return false
            }

            if (
                response?.status === 'NC' &&
                (!response?.observation || !response.observation.trim())
            ) {
                showMessage(
                    'error',
                    `Informe a observação obrigatória para: ${item.label}`
                )
                return false
            }
        }

        return true
    }

    function buildNonConformityObservation() {
        if (isStopped) {
            return form.stoppedEquipmentObservation || 'Equipamento parado.'
        }

        return effectiveChecklistTemplate
            .map((item) => {
                const response = form.responses[item.id]

                if (response?.status !== 'NC') return null

                return `${item.label}: ${response.observation || 'Sem observação'}`
            })
            .filter(Boolean)
            .join(' | ')
    }

    function handleSubmit(event) {
        event.preventDefault()

        if (!validateForm()) return

        const payload = {
            weekKey,
            weekLabel: weekRange.label,
            collectedAt: new Date().toISOString(),
            collectedDate: getCurrentDate(),
            collectorName: form.collectorName.trim(),
            shift: form.shift,
            equipmentOperationStatus: form.equipmentOperationStatus,
            sectorId: selectedSector.id,
            sectorName: selectedSector.name,
            equipmentId: selectedEquipment.id,
            equipmentName: selectedEquipment.name,
            responses: isStopped ? {} : form.responses,
            stoppedEquipmentObservation: form.stoppedEquipmentObservation,
            hasPhoto: Boolean(form.photo)
        }

        const temperatureResponse = getResponseByPossibleLabels(form.responses, [
            'temperatura',
            'temperature',
            'temp'
        ])

        const currentResponse = getResponseByPossibleLabels(form.responses, [
            'corrente',
            'current',
            'amperagem',
            'amperage'
        ])

        // A foto fica só na inspeção (não na coleta semanal), para não ocupar espaço duas vezes.
        let updatedCollections
        try {
            saveInspection({
                equipamentoId: selectedEquipment.id,
                equipamentoNome: selectedEquipment.name,
                setor: selectedSector.name,
                collectorName: form.collectorName.trim(),
                shift: form.shift,
                equipmentOperationStatus: form.equipmentOperationStatus,
                temperatura: temperatureResponse?.value || null,
                corrente: currentResponse?.value || null,
                status: isStopped || hasAnyNC ? 'Não conforme' : 'Conforme',
                observacao: buildNonConformityObservation(),
                foto: form.photo,
                originalPayload: payload
            })
            updatedCollections = saveWeekCollection(weekKey, payload)
        } catch (error) {
            console.error(error)
            showMessage(
                'error',
                'Não foi possível salvar: o armazenamento do navegador está cheio. Remova a foto ou restaure os dados de exemplo.'
            )
            return
        }

        setCollectedEquipmentIds(
            updatedCollections.map((item) => item.equipmentId)
        )

        showMessage('success', 'Checklist salvo com sucesso.')
        resetFormKeepingTopData()
    }

    return (
        <form className="checklist-form" onSubmit={handleSubmit}>
            {formMessage && (
                <div className={`form-message form-message--${formMessage.type}`}>
                    {formMessage.text}
                </div>
            )}

            <div className="card">
                <div className="section-header">
                    <h2>Dados da coleta</h2>
                </div>

                <div className="form-grid form-grid--top">
                    <div className="form-group">
                        <label>Data</label>
                        <input type="text" value={getCurrentDate()} disabled />
                    </div>

                    <div className="form-group">
                        <label>Período da semana</label>
                        <input type="text" value={weekRange.label} disabled />
                    </div>

                    <div className="form-group">
                        <label htmlFor="collectorName">Técnico responsável</label>
                        <input
                            id="collectorName"
                            type="text"
                            value={form.collectorName}
                            onChange={handleCollectorChange}
                            placeholder="Digite o nome do técnico responsável"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="shift">Turno</label>
                        <select
                            id="shift"
                            value={form.shift}
                            onChange={handleShiftChange}
                        >
                            <option value="">Selecione</option>
                            {shiftOptions.map((shift) => (
                                <option key={shift} value={shift}>
                                    {shift}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="section-header">
                    <h2>Seleção do equipamento</h2>
                </div>

                <div className="form-grid form-grid--top">
                    <SectorSelector
                        sectors={sectors}
                        value={form.sectorId}
                        onChange={handleSectorChange}
                    />

                    <EquipmentSelector
                        equipments={availableEquipments}
                        value={form.equipmentId}
                        onChange={handleEquipmentChange}
                    />

                    <div className="form-group">
                        <label htmlFor="equipmentOperationStatus">
                            Estado do equipamento
                        </label>

                        <select
                            id="equipmentOperationStatus"
                            value={form.equipmentOperationStatus}
                            onChange={handleEquipmentOperationStatusChange}
                            disabled={!selectedEquipment}
                        >
                            <option value="">Selecione</option>
                            {equipmentStatusOptions.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {selectedEquipment && form.equipmentOperationStatus && (
                <div className="card">
                    <div className="section-header">
                        <div>
                            <h2>Checklist do equipamento</h2>
                            <p className="section-subtitle">{selectedEquipment.name}</p>
                        </div>

                        <span className="badge">{selectedEquipment.type}</span>
                    </div>

                    {isStopped && (
                        <div className="stopped-equipment-box">
                            <strong>Equipamento parado</strong>
                            <p>
                                O checklist técnico foi dispensado porque o equipamento está
                                parado no momento da coleta.
                            </p>

                            <div className="form-group">
                                <label htmlFor="stoppedEquipmentObservation">
                                    Observação sobre a parada
                                </label>
                                <textarea
                                    id="stoppedEquipmentObservation"
                                    rows="3"
                                    value={form.stoppedEquipmentObservation}
                                    onChange={handleStoppedEquipmentObservationChange}
                                    placeholder="Ex.: equipamento em manutenção, standby, aguardando operação..."
                                />
                            </div>
                        </div>
                    )}

                    {!isStopped && (
                        <div className="checklist-content">
                            <div className="checklist-items">
                                {effectiveChecklistTemplate.map((item) => (
                                    <ChecklistItemRow
                                        key={item.id}
                                        item={item}
                                        response={form.responses[item.id]}
                                        disabled={false}
                                        onValueChange={handleValueChange}
                                        onStatusChange={handleStatusChange}
                                        onObservationChange={handleObservationChange}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {selectedEquipment && form.equipmentOperationStatus && (hasAnyNC || isStopped) && (
                <div className="card foto-card">
                    <div className="section-header">
                        <div>
                            <h2>Foto da ocorrência</h2>
                            <p className="section-subtitle">
                                Opcional. Registre a não conformidade para o PCM e para o relatório.
                            </p>
                        </div>
                    </div>

                    {form.photo ? (
                        <div className="foto-previa">
                            <img src={form.photo} alt="Prévia da foto da ocorrência" />
                            <button type="button" className="button button--secondary" onClick={removePhoto}>
                                Remover foto
                            </button>
                        </div>
                    ) : (
                        <label className="foto-botao">
                            <input type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} />
                            <span>Tirar ou escolher foto</span>
                        </label>
                    )}
                </div>
            )}

            <div className="form-actions">
                <button type="submit" className="button button--primary">
                    Salvar checklist
                </button>
            </div>
        </form>
    )
}