export default function NonConformitySection({
    note,
    onNoteChange,
    onImageChange
}) {
    return (
        <div className="card card--warning">
            <h2>Tratativa da não conformidade</h2>

            <div className="form-group">
                <label htmlFor="note">Observação obrigatória</label>
                <textarea
                    id="note"
                    rows="4"
                    value={note}
                    onChange={(e) => onNoteChange(e.target.value)}
                    placeholder="Descreva a não conformidade encontrada"
                />
            </div>

            <div className="form-group">
                <label htmlFor="image">Foto opcional</label>
                <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => onImageChange(e.target.files?.[0] || null)}
                />
            </div>
        </div>
    )
}