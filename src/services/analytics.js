// Cálculos dos gráficos e do relatório, a partir das inspeções salvas.
import { checklistTemplate } from '../data/equipments'
import { getWeekRange } from '../utils/date'

// O gráfico de temperatura acompanha a chave de alimentação, o ponto mais sensível do painel.
const campoTemperatura = checklistTemplate.find((i) => i.id === 'temp-chave-alimentacao')

function numero(valor) {
    const n = Number(String(valor ?? '').replace(',', '.'))
    return Number.isFinite(n) ? n : null
}

function inicioDaSemana(dataISO) {
    return getWeekRange(new Date(dataISO)).start
}

function rotuloSemana(inicio) {
    return inicio.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

// Agrupa as inspeções por semana (segunda-feira), da mais antiga para a mais recente.
export function agruparPorSemana(inspecoes, quantidade = 6) {
    const grupos = new Map()
    for (const insp of inspecoes) {
        const inicio = inicioDaSemana(insp.criadoEm)
        const chave = inicio.toDateString()
        if (!grupos.has(chave)) grupos.set(chave, { inicio, itens: [] })
        grupos.get(chave).itens.push(insp)
    }
    // Semanas com menos de 3 inspeções (ex.: cortadas pelo filtro de período) distorceriam o gráfico.
    return [...grupos.values()]
        .filter((g) => g.itens.length >= 3)
        .sort((a, b) => a.inicio - b.inicio)
        .slice(-quantidade)
}

export function conformidadePorSemana(inspecoes) {
    return agruparPorSemana(inspecoes).map(({ inicio, itens }) => ({
        rotulo: rotuloSemana(inicio),
        valor: Math.round((itens.filter((i) => i.status === 'Conforme').length / itens.length) * 100),
    }))
}

// Maior temperatura da chave de alimentação registrada em cada semana.
export function temperaturaMaximaPorSemana(inspecoes) {
    return agruparPorSemana(inspecoes).map(({ inicio, itens }) => {
        let maior = null
        for (const insp of itens) {
            const respostas = insp.originalPayload?.responses || {}
            const v = numero(respostas[campoTemperatura.id]?.value)
            if (v !== null && (maior === null || v > maior)) maior = v
        }
        return { rotulo: rotuloSemana(inicio), valor: maior ?? 0 }
    })
}

export function naoConformidadesPorSetor(inspecoes) {
    const setores = new Map()
    for (const insp of inspecoes) {
        if (!setores.has(insp.setor)) setores.set(insp.setor, { rotulo: insp.setor, total: 0, abertas: 0 })
        if (insp.status === 'Não conforme') {
            const s = setores.get(insp.setor)
            s.total += 1
            if (insp.statusTratativa !== 'Finalizada') s.abertas += 1
        }
    }
    return [...setores.values()]
}

export const limiteTemperatura = campoTemperatura.rule.limit
