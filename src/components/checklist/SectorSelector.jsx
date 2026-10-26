export default function SectorSelector({ sectors, value, onChange }) {
    return (
        <div className="form-group">
            <label htmlFor="sector">Setor</label>
            <select id="sector" value={value} onChange={onChange}>
                <option value="">Selecione</option>
                {sectors.map((sector) => (
                    <option key={sector.id} value={sector.id}>
                        {sector.name}
                    </option>
                ))}
            </select>
        </div>
    )
}