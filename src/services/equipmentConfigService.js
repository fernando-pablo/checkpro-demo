import { sectors, checklistTemplate } from '../data/equipments'

const EQUIPMENT_CONFIG_KEY = 'checkpro_equipment_config'

function safeParse(value, fallback) {
    try {
        return value ? JSON.parse(value) : fallback
    } catch {
        return fallback
    }
}

export function getEquipmentConfig() {
    return safeParse(localStorage.getItem(EQUIPMENT_CONFIG_KEY), {})
}

export function saveEquipmentConfig(config) {
    localStorage.setItem(EQUIPMENT_CONFIG_KEY, JSON.stringify(config))
}

export function getEquipmentTechnicalLimits(equipmentId) {
    const config = getEquipmentConfig()
    return config[equipmentId]?.technicalLimits || {}
}

export function updateEquipmentTechnicalLimits(equipmentId, technicalLimits) {
    const config = getEquipmentConfig()

    const updatedConfig = {
        ...config,
        [equipmentId]: {
            ...config[equipmentId],
            technicalLimits
        }
    }

    saveEquipmentConfig(updatedConfig)

    return {
        success: true,
        message: 'Parâmetros técnicos atualizados com sucesso.'
    }
}

export function getMeasurementItems() {
    return checklistTemplate.filter(
        (item) => item.kind === 'measurement-auto-status'
    )
}

export function getSectorsWithEquipmentConfig() {
    const config = getEquipmentConfig()

    return sectors.map((sector) => ({
        ...sector,
        equipments: sector.equipments.map((equipment) => ({
            ...equipment,
            technicalLimits: config[equipment.id]?.technicalLimits || {}
        }))
    }))
}

export function getEffectiveItemForEquipment(item, equipment) {
    const configuredLimit = equipment?.technicalLimits?.[item.id]

    if (
        item.kind === 'measurement-auto-status' &&
        configuredLimit !== undefined &&
        configuredLimit !== null &&
        configuredLimit !== ''
    ) {
        return {
            ...item,
            rule: {
                ...item.rule,
                limit: Number(String(configuredLimit).replace(',', '.'))
            }
        }
    }

    return item
}

export function getDefaultTechnicalLimitsForEquipment(equipment) {
    const savedLimits = equipment?.technicalLimits || {}

    const limits = {}

    getMeasurementItems().forEach((item) => {
        limits[item.id] =
            savedLimits[item.id] ??
            item.rule?.limit ??
            ''
    })

    return limits
}