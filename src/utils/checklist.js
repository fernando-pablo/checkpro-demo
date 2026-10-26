import { getWeekRange } from './date'

export function evaluateRule(value, rule) {
    const numericValue = Number(value)

    if (Number.isNaN(numericValue)) return ''

    switch (rule.operator) {
        case '<=':
            return numericValue <= rule.limit ? rule.okLabel : rule.notOkLabel
        case '<':
            return numericValue < rule.limit ? rule.okLabel : rule.notOkLabel
        case '>=':
            return numericValue >= rule.limit ? rule.okLabel : rule.notOkLabel
        case '>':
            return numericValue > rule.limit ? rule.okLabel : rule.notOkLabel
        default:
            return ''
    }
}

export function getWeekKey(date = new Date()) {
    const { start, end } = getWeekRange(date)
    const startKey = start.toISOString().slice(0, 10)
    const endKey = end.toISOString().slice(0, 10)
    return `${startKey}_${endKey}`
}

export function getStorageKey(weekKey) {
    return `checkpro-collections-${weekKey}`
}