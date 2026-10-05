import { decode, encode } from "he";
import { toolResult } from "../../../core/toolResult.ts";

export function processEntities(input: string, mode: "encode" | "decode") {
  return toolResult(() =>
    mode === "encode" ? encode(input, { useNamedReferences: true }) : decode(input)
  );
}
