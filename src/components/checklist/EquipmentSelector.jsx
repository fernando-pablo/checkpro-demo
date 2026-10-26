export default function EquipmentSelector({ equipments, value, onChange }) {
    return (
        <div className="form-group">
            <label htmlFor="equipment">Equipamento</label>
            <select id="equipment" value={value} onChange={onChange}>
                <option value="">Selecione</option>
                {equipments.map((equipment) => (
                    <option key={equipment.id} value={equipment.id}>
                        {equipment.name}
                    </option>
                ))}
            </select>
        </div>
    )
}