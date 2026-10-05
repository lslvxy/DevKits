import { paths, query } from "jsonpath-rfc9535";
import { toolResult } from "../../../core/toolResult.ts";

export function queryJson(input: string, expression: string, outputPaths = false) {
  return toolResult(() => {
    const document = JSON.parse(input);
    const matches = outputPaths ? paths(document, expression) : query(document, expression);
    return JSON.stringify(matches, null, 2);
  });
}
