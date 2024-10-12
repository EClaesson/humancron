export interface ParsedRange {
    from: number;
    to?: number;
    step?: number;
}

export interface ParsedField {
    ranges: ParsedRange[];
}

export interface ParsedExpression {
    second: ParsedField;
    minute: ParsedField;
    hour: ParsedField;
    dayOfMonth: ParsedField;
    month: ParsedField;
    dayOfWeek: ParsedField;
}

const STRING_VALUE_MAPPING = {
    "jan": 1,
    "feb": 2,
    "mar": 3,
    "apr": 4,
    "may": 5,
    "jun": 6,
    "jul": 7,
    "aug": 8,
    "sep": 9,
    "oct": 10,
    "nov": 11,
    "dec": 12,
    "mon": 1,
    "tue": 2,
    "wed": 3,
    "thu": 4,
    "fri": 5,
    "sat": 6,
    "sun": 7,
}

export const SECOND_RANGE = [0, 59];
export const MINUTE_RANGE = [0, 59];
export const HOUR_RANGE = [0, 23];
export const DAYOFMONTH_RANGE = [1, 31];
export const MONTH_RANGE = [1, 12];
export const DAYOFWEEK_RANGE = [1, 7];

function parseField(field: string, numericRange: number[]): ParsedField {
    const fieldParts = field.split(",").filter(part => part.length > 0);

    const ranges = fieldParts.map(fieldPart => {
        const fieldSubParts = fieldPart.split("/");
        const step = fieldSubParts.length > 1 ? Number(fieldSubParts[1]) : 1;
        const rangeParts = fieldSubParts[0].split("-");
        let fromRaw = rangeParts[0].length > 0 ? rangeParts[0].toLowerCase() : null;
        let toRaw = (rangeParts.length > 1 && rangeParts[1].length > 0) ? rangeParts[1].toLowerCase() : null;
        let from = -1;
        let to = -1;

        if (isNaN(step) || (fieldSubParts[0].includes("-") && [fromRaw, toRaw].includes(null))) {
            throw new Error(`Failed to parse field: ${field}`);
        }

        if (["*", "?"].includes(fromRaw)) {
            from = numericRange[0];
            to = numericRange[1];
        }

        if (Object.keys(STRING_VALUE_MAPPING).includes(fromRaw)) {
            from = STRING_VALUE_MAPPING[fromRaw];
        }

        if (toRaw != null && Object.keys(STRING_VALUE_MAPPING).includes(toRaw)) {
            to = STRING_VALUE_MAPPING[toRaw];
        }

        if (from < 0) {
            from = Number(fromRaw);
        }

        if (toRaw != null && to < 0) {
            to = Number(toRaw);
        }

        if (to < 0) {
            to = from;
        }

        if ([from, to, step].includes(NaN)) {
            throw new Error(`Failed to parse field: ${field}`);
        }

        return {
            from,
            to,
            step
        }
    });

    return {ranges}
}

export function parseExpression(expression: string): ParsedExpression {
    const parts = expression
        .trim()
        .split(/\s+/g)
        .filter(part => part);

    if (parts.length < 5 || parts.length > 6) {
        throw new Error(`Invalid number of fields: ${parts.length}`);
    }

    const hasSeconds = parts.length == 6;

    return {
        second: hasSeconds ? parseField(parts[0], SECOND_RANGE) : null,
        minute: parseField(parts[hasSeconds ? 1 : 0], MINUTE_RANGE),
        hour: parseField(parts[hasSeconds ? 2 : 1], HOUR_RANGE),
        dayOfMonth: parseField(parts[hasSeconds ? 3 : 2], DAYOFMONTH_RANGE),
        month: parseField(parts[hasSeconds ? 4 : 3], MONTH_RANGE),
        dayOfWeek: parseField(parts[hasSeconds ? 5 : 4], DAYOFWEEK_RANGE),
    };
}
