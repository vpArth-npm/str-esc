export function regQuote(expression: string): string {
  return expression.replace(new RegExp('[|^$+*?.\\\\{}()[\\]-]', 'ug'), '\\$&');
}
