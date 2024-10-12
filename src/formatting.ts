import {
    DAYOFMONTH_RANGE,
    DAYOFWEEK_RANGE,
    HOUR_RANGE,
    MINUTE_RANGE,
    MONTH_RANGE,
    ParsedExpression,
    ParsedField,
    parseExpression,
    SECOND_RANGE
} from "./parsing";

export interface FormattedExpression {
    second: string;
    minute: string;
    hour: string;
    dayOfMonth: string;
    month: string;
    dayOfWeek: string;
    timeAsClock: boolean;
    clockHasSeconds: boolean;
}

const DAY_NAMES = {
    0: "Sunday",
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
    7: "Sunday",
}

const MONTH_NAMES = {
    1: "January",
    2: "February",
    3: "March",
    4: "April",
    5: "May",
    6: "June",
    7: "July",
    8: "August",
    9: "September",
    10: "October",
    11: "November",
    12: "December",
}

const AND = "and";
const THROUGH = "through";
const BETWEEN = "between";
const EVERY = "every";
const ON = "on";
const OF = "of";
const DAY_OF_WEEK = "day-of-week";
const MONTH = "month";
const IN = "in";
const THE = "the";
const DAY_OF_MONTH = "day";
const MINUTE = "minute";
const HOUR = "hour";
const SECOND = "second";
const AT = "At";

function cleanString(str: string): string {
    let clean = str.trim();

    while (clean.indexOf("  ") > 0) {
        clean = clean.replace("  ", " ");
    }

    return clean;
}

function formatNth(num: number): string {
    const str = num.toString();
    const end = str[str.length - 1];
    let postfix = "th";

    if (num < 10 || num > 20) {
        if (end == "1") postfix = "st";
        else if (end == "2") postfix = "nd";
        else if (end == "3") postfix = "rd";
    }

    return `${num}${postfix}`;
}

function formatSimpleTime(secondField: ParsedField, minuteField: ParsedField, hourField: ParsedField): string[] | null {
    if (minuteField.ranges.length > 1 || (minuteField.ranges[0].to != minuteField.ranges[0].from) || minuteField.ranges[0].step != 1 || hourField.ranges.length > 1 || (hourField.ranges[0].to != hourField.ranges[0].from) || hourField.ranges[0].step != 1) {
        return null;
    }

    let strings = [`${hourField.ranges[0].from}`.padStart(2, "0") + ":", `${minuteField.ranges[0].from}`.padStart(2, "0")];

    if (secondField && secondField.ranges.length == 1 && (secondField.ranges[0].to == secondField.ranges[0].from) && secondField.ranges[0].step == 1) {
        strings.push(":" + `${secondField.ranges[0].from}`.padStart(2, "0"));
    }

    return strings;
}

function formatParsedFieldString(from: string, to: string, step: number, unitName: string, namedUnits: boolean): string {
    let str = "";

    if (to && to != from) {
        str += `${EVERY} ${step != 1 ? formatNth(step) : ""} ${unitName} ${BETWEEN} `;
    }

    if (from) {
        if (!namedUnits) {
            str += `${THE}`;
        }

        str += ` ${from}`;

        if (!namedUnits && !(to && to != from)) {
            str += ` ${unitName}`;
        }
    }

    if (to && to != from) {
        str += ` ${THROUGH} ${namedUnits ? "" : THE} ${to} ${namedUnits ? "" : unitName}`;
    }

    return cleanString(str);
}

function formatNumericParsedField(field: ParsedField, numericRange: number[], unitName: string): string {
    if (!field) {
        return null;
    }

    const formattedRanges = field.ranges.map(range => {
        let from = "";
        let to = "";

        if ((range.to - range.from) == (numericRange[1] - numericRange[0])) {
            return `${EVERY} ${range.step != 1 ? formatNth(range.step) : ""} ${unitName}`;
        }

        from = formatNth(range.from);
        to = (range.to && range.to != range.from) ? formatNth(range.to) : null;

        return formatParsedFieldString(from, to, range.step, unitName, false);
    });

    let str = formattedRanges.join(` ${AND} `);

    return cleanString(str);
}

function formatNamedParsedField(field: ParsedField, numericRange: number[], unitName: string, nameMapping: {
    [key: number]: string
}): string {
    const formattedRanges = field.ranges.map(range => {
        let from = "";
        let to = "";

        if ((range.to - range.from) == (numericRange[1] - numericRange[0])) {
            return `${EVERY} ${range.step != 1 ? formatNth(range.step) : ""} ${unitName}`;
        }

        from = nameMapping[range.from];
        to = (range.to && range.to != range.from) ? nameMapping[range.to] : null;

        return formatParsedFieldString(from, to, range.step, unitName, true);
    });

    let str = formattedRanges.join(` ${AND} `);

    return cleanString(str);
}

function formatParsedExpressionAsObject(expression: ParsedExpression): FormattedExpression {
    const formattedSimpleTime = formatSimpleTime(expression.second, expression.minute, expression.hour);

    let formattedSecond = formattedSimpleTime && formattedSimpleTime.length == 3 ? formattedSimpleTime[2] : formatNumericParsedField(expression.second, SECOND_RANGE, SECOND);
    let formattedMinute = formattedSimpleTime ? formattedSimpleTime[1] : "";
    let formattedHour = formattedSimpleTime ? formattedSimpleTime[0] : "";

    if (!formattedSimpleTime) {
        formattedMinute = formatNumericParsedField(expression.minute, MINUTE_RANGE, MINUTE);
        formattedHour = formatNumericParsedField(expression.hour, HOUR_RANGE, HOUR);
    }

    let formattedDayOfMonth = formatNumericParsedField(expression.dayOfMonth, DAYOFMONTH_RANGE, DAY_OF_MONTH);
    let formattedDayOfWeek = formatNamedParsedField(expression.dayOfWeek, DAYOFWEEK_RANGE, DAY_OF_WEEK, DAY_NAMES);
    let formattedMonth = formatNamedParsedField(expression.month, MONTH_RANGE, MONTH, MONTH_NAMES);

    if (formattedDayOfWeek.includes(EVERY) && !formattedDayOfWeek.includes(THROUGH)) {
        formattedDayOfWeek = "";
    }

    if (formattedDayOfMonth.includes(EVERY) && !formattedDayOfMonth.includes(THROUGH) && formattedMonth.includes(EVERY) && !formattedMonth.includes(THROUGH)) {
        if (!formattedSimpleTime) {
            formattedDayOfMonth = "";
        }

        formattedMonth = "";
    }

    if (formattedDayOfMonth && formattedDayOfWeek && !formattedDayOfMonth.includes(EVERY)) {
        formattedDayOfWeek = `${AND} ${EVERY} ${formattedDayOfWeek}`;
    }

    if ((formattedDayOfMonth.includes(EVERY) || !formattedDayOfMonth) && formattedDayOfWeek && !formattedDayOfWeek.includes(EVERY)) {
        formattedDayOfMonth = "";
        formattedDayOfWeek = `${EVERY} ${formattedDayOfWeek}`;
    }

    if (formattedDayOfMonth.includes(EVERY) && !formattedDayOfMonth.includes(THROUGH) && formattedDayOfWeek.includes(THROUGH)) {
        formattedDayOfWeek = formattedDayOfWeek.replace(new RegExp(`^${EVERY} ${DAY_OF_WEEK}`), "");
    }

    return {
        second: formattedSecond,
        minute: formattedMinute,
        hour: formattedHour,
        dayOfMonth: formattedDayOfMonth,
        month: formattedMonth,
        dayOfWeek: formattedDayOfWeek,
        timeAsClock: formattedSimpleTime?.length > 0,
        clockHasSeconds: formattedSimpleTime?.length === 3
    }
}

function formatParsedExpressionAsString(expression: ParsedExpression): string {
    const obj = formatParsedExpressionAsObject(expression);
    let timeStr = "";

    if (obj.timeAsClock) {
        if (obj.second && !obj.clockHasSeconds) {
            timeStr += `${obj.second} ${OF} `;
        }

        timeStr += `${obj.hour}${obj.minute}`;

        if (obj.second && obj.clockHasSeconds) {
            timeStr += obj.second;
        }
    } else {
        timeStr = [obj.second, obj.minute, obj.hour]
            .map(part => part?.trim())
            .filter(part => part?.length > 0)
            .join(` ${OF} `)
            .trim();
    }

    return [timeStr, obj.dayOfMonth, obj.dayOfWeek, obj.month]
        .map(part => part?.trim())
        .filter(part => part?.length > 0)
        .map((part, idx) => (part.startsWith(AND) || idx == 0 || part.startsWith(BETWEEN)) ? part : `${OF} ${part}`)
        .join(" ")
        .trim();
}

export function formatCronAsObject(expression: string): FormattedExpression {
    return formatParsedExpressionAsObject(parseExpression(expression));
}

export function formatCronAsString(expression: string): string {
    return `${AT} ${formatParsedExpressionAsString(parseExpression(expression))}`;
}
