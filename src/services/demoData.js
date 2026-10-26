// Dados de exemplo da demonstração: seis semanas de inspeções fictícias,
// geradas sempre iguais (gerador pseudoaleatório com semente fixa).
import { sectors, checklistTemplate } from '../data/equipments'
import { companyConfig } from '../config/companyConfig'
import { getWeekKey } from '../utils/checklist'
import { getWeekRange, formatDate } from '../utils/date'

const DEMO_FLAG = 'checkpro_demo_v1'
const INSPECTIONS_KEY = 'checkpro_inspections'
const WEEK_PREFIX = 'checkpro_week_collections_'

const tecnicos = ['Carlos Souza', 'Marcos Lima', 'João Pereira', 'Rafael Alves']
const turnos = ['06:00 às 14:00', '14:00 às 22:00', '22:00 às 06:00']

const observacoesPorItem = {
    'temp-chave-alimentacao': ['Aquecimento na conexão da fase R. Reaperto recomendado.', 'Ponto quente identificado no terminal de entrada.'],
    'temp-chave-partida': ['Contator com aquecimento acima do normal.', 'Possível mau contato na chave de partida.'],
    'temp-cabo-saida': ['Cabo de saída aquecido próximo ao borne.', 'Isolação do cabo com sinais de ressecamento.'],
    'temp-ambiente-sala': ['Sala elétrica sem ventilação adequada.', 'Ar-condicionado da sala desligado.'],
    'corrente-saida': ['Corrente acima da nominal do motor.', 'Desbalanceamento de corrente entre fases.'],
    'filtros-porta-painel': ['Filtros saturados de poeira de bagaço.', 'Filtro danificado, necessária substituição.'],
    'ruidos-anormais': ['Ruído de vibração no contator.', 'Zumbido anormal no transformador de comando.'],
    'fixacao-componentes-partida': ['Parafuso de fixação do relé solto.', 'Canaleta solta no interior do painel.'],
    'aterramento-painel': ['Cabo de aterramento desconectado da porta.', 'Barramento de terra oxidado.'],
    'sinaleiros-botoes-painel': ['Sinaleiro de falha queimado.', 'Botão de emergência emperrado.'],
}

const paradas = [
    'Equipamento em manutenção preventiva programada.',
    'Parado aguardando liberação da operação.',
    'Em standby por baixa demanda de bagaço.',
]

// Gerador pseudoaleatório (mulberry32): mesmos dados a cada restauração.
function criarAleatorio(semente) {
    let a = semente
    return () => {
        a |= 0
        a = (a + 0x6d2b79f5) | 0
        let t = Math.imul(a ^ (a >>> 15), 1 | a)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

const medidas = {
    'temp-chave-alimentacao': { base: 54, variacao: 10 },
    'temp-chave-partida': { base: 52, variacao: 10 },
    'temp-cabo-saida': { base: 47, variacao: 8 },
    'temp-ambiente-sala': { base: 27, variacao: 3 },
}

function gerarRespostas(rnd, chanceNC) {
    const respostas = {}
    let maiorExcesso = 0

    for (const item of checklistTemplate) {
        const ehNC = rnd() < chanceNC
        const obs = () => {
            const lista = observacoesPorItem[item.id] || ['Não conformidade identificada.']
            return lista[Math.floor(rnd() * lista.length)]
        }

        if (item.kind === 'measurement-auto-status') {
            const { base, variacao } = medidas[item.id] || { base: 40, variacao: 8 }
            const limite = item.rule.limit
            let valor = base + (rnd() * 2 - 1) * variacao
            if (ehNC) {
                const excesso = 1 + rnd() * 12
                valor = limite + excesso
                maiorExcesso = Math.max(maiorExcesso, excesso)
            } else {
                valor = Math.min(valor, limite - 1)
            }
            respostas[item.id] = {
                value: valor.toFixed(1).replace('.', ','),
                status: ehNC ? 'NC' : 'C',
                observation: ehNC ? obs() : '',
            }
        } else if (item.kind === 'measurement-manual-status') {
            const valor = 40 + rnd() * 140
            respostas[item.id] = {
                value: valor.toFixed(1).replace('.', ','),
                status: ehNC ? 'NC' : 'C',
                observation: ehNC ? obs() : '',
            }
        } else {
            respostas[item.id] = { status: ehNC ? 'NC' : 'C', observation: ehNC ? obs() : '' }
        }
    }

    return { respostas, maiorExcesso }
}

function gerarDados() {
    const rnd = criarAleatorio(2026)
    const hoje = new Date()
    const inspecoes = []
    const coletasPorSemana = {}
    const equipamentos = sectors.flatMap((setor) => setor.equipments.map((eq) => ({ setor, eq })))

    // semana 5 = mais antiga; semana 0 = semana atual (parcial)
    for (let semana = 5; semana >= 0; semana--) {
        const referencia = new Date(hoje)
        referencia.setDate(hoje.getDate() - semana * 7)
        const { start, label } = getWeekRange(referencia)
        const weekKey = getWeekKey(referencia)
        coletasPorSemana[weekKey] = []

        // A conformidade melhora ao longo das semanas: conta uma história no painel.
        // Chance de cada item sair NC: cerca de 32% das inspeções com falha há 6 semanas e 8% agora.
        const chanceNC = 0.008 + semana * 0.006
        const lista = semana === 0 ? equipamentos.filter((_, i) => i % 2 === 0) : equipamentos

        for (const { setor, eq } of lista) {
            const diasPossiveis = semana === 0 ? Math.max(1, ((hoje.getDay() + 6) % 7) + 1) : 6
            const data = new Date(start)
            data.setDate(start.getDate() + Math.floor(rnd() * diasPossiveis))
            const turnoIdx = Math.floor(rnd() * 3)
            data.setHours([8, 16, 23][turnoIdx], Math.floor(rnd() * 60), 0, 0)
            if (data > hoje) data.setTime(hoje.getTime() - Math.floor(rnd() * 3600000))

            const parado = rnd() < 0.04
            const { respostas, maiorExcesso } = parado ? { respostas: {}, maiorExcesso: 0 } : gerarRespostas(rnd, chanceNC)
            const itensNC = Object.entries(respostas).filter(([, r]) => r.status === 'NC')
            const naoConforme = parado || itensNC.length > 0
            const tecnico = tecnicos[Math.floor(rnd() * tecnicos.length)]

            const payload = {
                weekKey,
                weekLabel: label,
                collectedAt: data.toISOString(),
                collectedDate: formatDate(data),
                collectorName: tecnico,
                shift: turnos[turnoIdx],
                equipmentOperationStatus: parado ? 'Parado' : 'Em funcionamento',
                sectorId: setor.id,
                sectorName: setor.name,
                equipmentId: eq.id,
                equipmentName: eq.name,
                responses: respostas,
                stoppedEquipmentObservation: parado ? paradas[Math.floor(rnd() * paradas.length)] : '',
                hasPhoto: false,
            }

            coletasPorSemana[weekKey].push({ id: `demo-c-${weekKey}-${eq.id}`, ...payload })

            const observacao = parado
                ? payload.stoppedEquipmentObservation
                : itensNC
                      .map(([id, r]) => `${checklistTemplate.find((i) => i.id === id)?.label}: ${r.observation}`)
                      .join(' | ')

            let statusTratativa = 'Conforme'
            let prioridade = 'Normal'
            if (naoConforme) {
                const s = rnd()
                statusTratativa =
                    semana >= 3 ? 'Finalizada'
                        : semana >= 1 ? (s < 0.5 ? 'Finalizada' : s < 0.8 ? 'Em execução' : 'Em análise')
                            : s < 0.6 ? 'Aberta' : 'Em análise'
                prioridade = parado ? 'Baixa' : maiorExcesso > 8 ? 'Crítica' : maiorExcesso > 4 ? 'Alta' : 'Média'
            }

            inspecoes.push({
                id: `demo-i-${weekKey}-${eq.id}`,
                equipamentoId: eq.id,
                equipamentoNome: eq.name,
                setor: setor.name,
                collectorName: tecnico,
                shift: payload.shift,
                equipmentOperationStatus: payload.equipmentOperationStatus,
                temperatura: respostas['temp-chave-alimentacao']?.value || null,
                corrente: respostas['corrente-saida']?.value || null,
                status: naoConforme ? 'Não conforme' : 'Conforme',
                observacao,
                statusTratativa,
                prioridade,
                foto: null,
                criadoEm: data.toISOString(),
                originalPayload: payload,
            })
        }
    }

    inspecoes.sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
    return { inspecoes, coletasPorSemana }
}

function gravar() {
    const { inspecoes, coletasPorSemana } = gerarDados()
    localStorage.setItem(INSPECTIONS_KEY, JSON.stringify(inspecoes))
    for (const [weekKey, coletas] of Object.entries(coletasPorSemana)) {
        coletas.sort((a, b) => b.collectedAt.localeCompare(a.collectedAt))
        localStorage.setItem(`${WEEK_PREFIX}${weekKey}`, JSON.stringify(coletas))
    }
    localStorage.setItem(DEMO_FLAG, new Date().toISOString())
}

// Chamado ao abrir o sistema: carrega os exemplos só na primeira visita.
export function ensureDemoData() {
    if (!companyConfig.demo) return
    try {
        if (!localStorage.getItem(DEMO_FLAG)) gravar()
    } catch (error) {
        console.error('Não foi possível carregar os dados de exemplo.', error)
    }
}

// Apaga inspeções, coletas, fotos e limites alterados e recarrega os exemplos.
export function resetDemoData() {
    Object.keys(localStorage)
        .filter((key) => key.startsWith('checkpro_') && key !== 'checkpro_user')
        .forEach((key) => localStorage.removeItem(key))
    gravar()
}
