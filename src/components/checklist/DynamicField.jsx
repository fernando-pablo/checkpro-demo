export default function DynamicField({ field, value, onChange }) {
    return (
        <div className="form-group">
            <label htmlFor={field.id}>{field.label}</label>

            {field.type === 'select' ? (
                <select
                    id={field.id}
                    value={value || ''}
                    onChange={(e) => onChange(field.id, e.target.value)}
                >
                    <option value="">Selecione</option>
                    {field.options.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            ) : (
                <input
                    id={field.id}
                    type={field.type}
                    value={value || ''}
                    onChange={(e) => onChange(field.id, e.target.value)}
                />
            )}
        </div>
    )
}