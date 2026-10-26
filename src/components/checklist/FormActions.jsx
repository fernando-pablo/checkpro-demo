export default function FormActions({ onExport }) {
    return (
        <div className="form-actions">
            <button type="button" className="secondary-button" onClick={onExport}>
                Exportar planilha semanal
            </button>

            <button type="submit" className="primary-button">
                Salvar checklist
            </button>
        </div>
    )
}