
function inFullHours(hours) {
    hours = parseFloat(hours).toFixed(2);

    let result = Math.trunc(hours) + " horas";

    let decimal_part = hours % 1;

    if (decimal_part > 0) {
        decimal_part *= 60;
        result += ` e ${Math.round(decimal_part)} minutos`;
    }

    return result;
}

export { inFullHours }