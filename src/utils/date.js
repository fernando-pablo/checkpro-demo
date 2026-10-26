export function getCurrentDate() {
    const now = new Date()
    return formatDate(now)
}

export function formatDate(date) {
    return new Date(date).toLocaleDateString('pt-BR')
}

export function getWeekRange(date = new Date()) {
    const current = new Date(date)
    const day = current.getDay()

    const diffToMonday = day === 0 ? -6 : 1 - day
    const monday = new Date(current)
    monday.setDate(current.getDate() + diffToMonday)

    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)

    return {
        start: monday,
        end: sunday,
        label: `${formatDate(monday)} até ${formatDate(sunday)}`
    }
}