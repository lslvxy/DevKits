import { toolResult } from "../../../core/toolResult.ts";

export function convertBase(input: string, from: number, to: number) {
  return toolResult(() => {
    if (
      !Number.isInteger(from) ||
      !Number.isInteger(to) ||
      from < 2 ||
      from > 36 ||
      to < 2 ||
      to > 36
    ) {
      throw new Error("进制必须在 2–36 之间 / Bases must be between 2 and 36");
    }
    let digits = input.trim().toLowerCase();
    if (!digits) return "";
    const negative = digits.startsWith("-");
    if (/^[+-]/.test(digits)) digits = digits.slice(1);
    const prefix = { 2: "0b", 8: "0o", 16: "0x" } as Record<number, string>;
    if (prefix[from] && digits.startsWith(prefix[from])) digits = digits.slice(2);
    if (!digits || digits.length > 4096)
      throw new Error("请输入 1–4096 位整数 / Enter an integer with 1–4096 digits");
    const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
    let value = BigInt(0);
    for (const character of digits) {
      const digit = alphabet.indexOf(character);
      if (digit < 0 || digit >= from)
        throw new Error(`非法数字 / Invalid digit for base ${from}: ${character}`);
      value = value * BigInt(from) + BigInt(digit);
    }
    return (negative ? -value : value).toString(to).toUpperCase();
  });
}
