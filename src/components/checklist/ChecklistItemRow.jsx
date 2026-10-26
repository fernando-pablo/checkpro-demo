function formatLimitValue(value) {
    if (value === null || value === undefined || value === '') return ''
    return String(value).replace('.', ',')
}

function getMeasurementPlaceholder(item) {
    if (item.rule?.limit !== undefined && item.rule?.limit !== null) {
        return `Limite: até ${formatLimitValue(item.rule.limit)} ${item.unit || ''}`.trim()
    }

    if (item.placeholder) return item.placeholder

    if (item.unit) return `Digite o valor em ${item.unit}`

    return 'Digite o valor'
}

export default function ChecklistItemRow({
    item,
    response,
    disabled,
    onValueChange,
    onStatusChange,
    onObservationChange
}) {
    const currentStatus = response?.status || ''
    const currentValue = response?.value || ''
    const currentObservation = response?.observation || ''

    const shouldShowValueInput =
        item.kind === 'measurement-auto-status' ||
        item.kind === 'measurement-manual-status'

    const shouldShowStatusButtons =
        item.kind === 'measurement-manual-status' ||
        item.kind === 'status-only'

    const shouldShowAutoStatus = item.kind === 'measurement-auto-status'

    const shouldShowObservation = currentStatus === 'NC'

    return (
        <div className={`checklist-item ${disabled ? 'checklist-item--disabled' : ''}`}>
            <div className="checklist-item__header">
                <div>
                    <h3>{item.label}</h3>

                    {item.description && (
                        <p className="checklist-item__description">
                            {item.description}
                        </p>
                    )}
                </div>

                {shouldShowAutoStatus && currentStatus && (
                    <span
                        className={`status-badge ${currentStatus === 'NC' ? 'danger' : 'ok'
                            }`}
                    >
                        {currentStatus}
                    </span>
                )}
            </div>

            {shouldShowValueInput && (
                <div className="form-group">
                    <label htmlFor={`value-${item.id}`}>
                        Valor coletado {item.unit ? `(${item.unit})` : ''}
                    </label>

                    <input
                        id={`value-${item.id}`}
                        type="text"
                        inputMode="decimal"
                        value={currentValue}
                        disabled={disabled}
                        onChange={(event) =>
                            onValueChange(item.id, event.target.value)
                        }
                        placeholder={getMeasurementPlaceholder(item)}
                    />
                </div>
            )}

            {shouldShowStatusButtons && (
                <div className="status-toggle">
                    <button
                        type="button"
                        disabled={disabled}
                        className={`status-toggle__button ${currentStatus === 'C'
                                ? 'status-toggle__button--active-c'
                                : ''
                            }`}
                        onClick={() => onStatusChange(item.id, 'C')}
                    >
                        <span className="status-toggle__marker" />
                        Conforme
                    </button>

                    <button
                        type="button"
                        disabled={disabled}
                        className={`status-toggle__button ${currentStatus === 'NC'
                                ? 'status-toggle__button--active-nc'
                                : ''
                            }`}
                        onClick={() => onStatusChange(item.id, 'NC')}
                    >
                        <span className="status-toggle__marker" />
                        Não conforme
                    </button>
                </div>
            )}

            {shouldShowObservation && (
                <div className="form-group">
                    <label htmlFor={`observation-${item.id}`}>
                        Observação obrigatória da não conformidade
                    </label>

                    <textarea
                        id={`observation-${item.id}`}
                        rows="3"
                        value={currentObservation}
                        disabled={disabled}
                        onChange={(event) =>
                            onObservationChange(item.id, event.target.value)
                        }
                        placeholder="Descreva a não conformidade encontrada, possível causa e ação recomendada."
                    />
                </div>
            )}
        </div>
    )
}