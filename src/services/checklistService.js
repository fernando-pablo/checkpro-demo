const WEEK_COLLECTIONS_PREFIX = 'checkpro_week_collections_'
const INSPECTIONS_KEY = 'checkpro_inspections'

function safeParse(value, fallback) {
    try {
        return value ? JSON.parse(value) : fallback
    } catch {
        return fallback
    }
}

function createId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID()
    }

    return `${Date.now()}-${Math.random()}`
}

export function getWeekCollections(weekKey) {
    const storageKey = `${WEEK_COLLECTIONS_PREFIX}${weekKey}`
    return safeParse(localStorage.getItem(storageKey), [])
}

export function saveWeekCollection(weekKey, payload) {
    const storageKey = `${WEEK_COLLECTIONS_PREFIX}${weekKey}`
    const currentCollections = getWeekCollections(weekKey)

    const newCollection = {
        id: createId(),
        ...payload
    }

    const updatedCollections = [newCollection, ...currentCollections]

    localStorage.setItem(storageKey, JSON.stringify(updatedCollections))

    return updatedCollections
}

export function getCollectedEquipmentIds(weekKey) {
    return getWeekCollections(weekKey).map((collection) => collection.equipmentId)
}

export function getInspections() {
    return safeParse(localStorage.getItem(INSPECTIONS_KEY), [])
}

export function saveInspection(data) {
    const currentInspections = getInspections()

    const newInspection = {
        id: createId(),
        ...data,
        statusTratativa: data.status === 'Não conforme' ? 'Aberta' : 'Conforme',
        prioridade: data.status === 'Não conforme' ? 'Média' : 'Normal',
        criadoEm: new Date().toISOString()
    }

    const updatedInspections = [newInspection, ...currentInspections]

    localStorage.setItem(INSPECTIONS_KEY, JSON.stringify(updatedInspections))

    return {
        success: true,
        message: 'Checklist salvo com sucesso.',
        data: newInspection
    }
}

export function getNonConformities() {
    return getInspections().filter(
        (inspection) => inspection.status === 'Não conforme'
    )
}

export function updateNonConformity(id, updates) {
    const updatedInspections = getInspections().map((inspection) =>
        inspection.id === id ? { ...inspection, ...updates } : inspection
    )

    localStorage.setItem(INSPECTIONS_KEY, JSON.stringify(updatedInspections))

    return {
        success: true,
        message: 'Não conformidade atualizada com sucesso.'
    }
}

export function clearInspections() {
    localStorage.removeItem(INSPECTIONS_KEY)
}