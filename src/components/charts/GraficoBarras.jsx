// Barras horizontais: total de não conformidades e quantas ainda estão abertas, por setor.
export default function GraficoBarras({ dados }) {
    if (!dados.length) return <p className="grafico-vazio">Sem dados suficientes.</p>
    const maior = Math.max(1, ...dados.map((d) => d.total))

    return (
        <div className="barras" role="list">
            {dados.map((d) => (
                <div className="barras-linha" role="listitem" key={d.rotulo}
                    aria-label={`${d.rotulo}: ${d.total} não conformidades, ${d.abertas} em aberto`}>
                    <span className="barras-rotulo">{d.rotulo}</span>
                    <div className="barras-trilho" aria-hidden="true">
                        <div className="barras-total" style={{ width: `${(d.total / maior) * 100}%` }} />
                        <div className="barras-abertas" style={{ width: `${(d.abertas / maior) * 100}%` }} />
                    </div>
                    <span className="barras-numero">{d.total}<small> / {d.abertas} {d.abertas === 1 ? 'aberta' : 'abertas'}</small></span>
                </div>
            ))}
            <div className="barras-legenda" aria-hidden="true">
                <span><i className="leg-total" /> Total no período</span>
                <span><i className="leg-abertas" /> Ainda abertas</span>
            </div>
        </div>
    )
}
