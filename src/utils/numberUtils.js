export function parseDecimal(value) {
    if (!value) return null;

    const normalizedValue = String(value).replace(",", ".");
    const numberValue = Number(normalizedValue);

    return Number.isNaN(numberValue) ? null : numberValue;
}

export function formatDecimalBR(value) {
    if (value === null || value === undefined) return "";

    return String(value).replace(".", ",");
}