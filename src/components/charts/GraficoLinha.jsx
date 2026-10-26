// Gráfico de linha em SVG puro (sem bibliotecas), com linha de referência opcional.
export default function GraficoLinha({ dados, min = 0, max = 100, unidade = '', referencia, rotuloReferencia, cor = '#2563eb' }) {
    const L = 640, A = 250, m = { t: 30, r: 24, b: 34, l: 44 }
    const w = L - m.l - m.r, h = A - m.t - m.b
    if (!dados.length) return <p className="grafico-vazio">Sem dados suficientes.</p>

    const x = (i) => m.l + (dados.length === 1 ? w / 2 : (i * w) / (dados.length - 1))
    const y = (v) => m.t + h - ((Math.min(Math.max(v, min), max) - min) / (max - min)) * h
    const pontos = dados.map((d, i) => `${x(i)},${y(d.valor)}`).join(' ')
    const area = `${m.l},${m.t + h} ${pontos} ${x(dados.length - 1)},${m.t + h}`
    const marcas = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(min + f * (max - min)))

    return (
        <svg viewBox={`0 0 ${L} ${A}`} className="grafico" role="img"
            aria-label={dados.map((d) => `${d.rotulo}: ${d.valor}${unidade}`).join(', ')}>
            {marcas.map((v) => (
                <g key={v}>
                    <line x1={m.l} x2={L - m.r} y1={y(v)} y2={y(v)} className="grafico-grade" />
                    <text x={m.l - 8} y={y(v) + 4} textAnchor="end" className="grafico-eixo">{v}{unidade}</text>
                </g>
            ))}
            {referencia !== undefined && (
                <g>
                    <line x1={m.l} x2={L - m.r} y1={y(referencia)} y2={y(referencia)} className="grafico-referencia" />
                    <text x={m.l + 6} y={y(referencia) - 6} textAnchor="start" className="grafico-referencia-texto">{rotuloReferencia}</text>
                </g>
            )}
            <polygon points={area} fill={cor} opacity="0.1" />
            <polyline points={pontos} fill="none" stroke={cor} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
            {dados.map((d, i) => (
                <g key={d.rotulo + i}>
                    <circle cx={x(i)} cy={y(d.valor)} r="5" fill="#fff" stroke={cor} strokeWidth="2.5" />
                    <text x={x(i)} y={y(d.valor) - 12} className="grafico-valor"
                        textAnchor={dados.length > 1 && i === 0 ? "start" : dados.length > 1 && i === dados.length - 1 ? "end" : "middle"}>
                        {Number.isInteger(d.valor) ? d.valor : d.valor.toFixed(1).replace('.', ',')}{unidade}
                    </text>
                    <text x={x(i)} y={A - 10} textAnchor="middle" className="grafico-eixo">{d.rotulo}</text>
                </g>
            ))}
        </svg>
    )
}
