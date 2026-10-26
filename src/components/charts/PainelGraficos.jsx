import GraficoLinha from './GraficoLinha'
import GraficoBarras from './GraficoBarras'
import {
    conformidadePorSemana,
    temperaturaMaximaPorSemana,
    naoConformidadesPorSetor,
    limiteTemperatura,
} from '../../services/analytics'

export default function PainelGraficos({ inspecoes }) {
    const conformidade = conformidadePorSemana(inspecoes)
    const temperaturas = temperaturaMaximaPorSemana(inspecoes)
    const maiorTemp = Math.max(limiteTemperatura + 10, ...temperaturas.map((t) => t.valor))

    return (
        <div className="graficos">
            <div className="panel grafico-card">
                <h2>Conformidade por semana</h2>
                <p>Percentual de inspeções sem nenhuma não conformidade.</p>
                <GraficoLinha dados={conformidade} min={0} max={100} unidade="%" cor="#16a34a" />
            </div>
            <div className="panel grafico-card">
                <h2>Temperatura máxima da chave de alimentação</h2>
                <p>Pico registrado em cada semana, comparado ao limite técnico.</p>
                <GraficoLinha dados={temperaturas} min={30} max={30 + Math.ceil((maiorTemp - 30) / 20) * 20} unidade="°"
                    referencia={limiteTemperatura} rotuloReferencia={`Limite ${limiteTemperatura} °C`} cor="#ea580c" />
            </div>
            <div className="panel grafico-card grafico-card--largo">
                <h2>Não conformidades por setor</h2>
                <p>Total registrado e quantas ainda aguardam tratativa.</p>
                <GraficoBarras dados={naoConformidadesPorSetor(inspecoes)} />
            </div>
        </div>
    )
}
