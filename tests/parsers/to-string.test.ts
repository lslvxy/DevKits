import { describe, expect, it } from "vitest";
import {
  ToStringParser,
  parseToStringValue,
} from "../../src/tools/log-parser/parsers/to-string.ts";

describe("ToStringParser", () => {
  it("detects ClassName[...] pattern", () => {
    expect(ToStringParser.detect("Person[name=Alice, age=30]")).toBe(0.8);
  });

  it("detects ClassName@hash[...] pattern", () => {
    expect(ToStringParser.detect("Order@1a2b3c[id=1]")).toBe(0.8);
  });

  it("detects ClassName{...} pattern", () => {
    expect(ToStringParser.detect("Config{host=localhost, port=8080}")).toBe(0.8);
  });

  it("returns 0 for non-toString input", () => {
    expect(ToStringParser.detect("hello world")).toBe(0);
    expect(ToStringParser.detect('{"key":"value"}')).toBe(0);
  });

  it("parses simple ClassName[key=value] pattern", () => {
    const result = ToStringParser.parse("Person[name=Alice, age=30]");
    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      _class: "Person",
      name: "Alice",
      age: 30,
    });
  });

  it("parses ClassName@hash[key=value] pattern", () => {
    const result = ToStringParser.parse("Order@1a2b3c[id=123, status=ACTIVE]");
    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      _class: "Order",
      _hash: "1a2b3c",
      id: 123,
      status: "ACTIVE",
    });
  });

  it("handles null values (<null>)", () => {
    const result = ToStringParser.parse("Item[id=1, description=<null>]");
    expect(result.success).toBe(true);
    expect(result.data?.description).toBeNull();
  });

  it("handles null keyword", () => {
    const result = ToStringParser.parse("Item[id=1, description=null]");
    expect(result.success).toBe(true);
    expect(result.data?.description).toBeNull();
  });

  it("handles boolean values", () => {
    const result = ToStringParser.parse("Config[enabled=true, debug=false]");
    expect(result.success).toBe(true);
    expect(result.data?.enabled).toBe(true);
    expect(result.data?.debug).toBe(false);
  });

  it("handles semicolon separator", () => {
    const result = ToStringParser.parse("Item[id=1;name=Widget;active=true;]");
    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      _class: "Item",
      id: 1,
      name: "Widget",
      active: true,
    });
  });

  it("parses nested objects", () => {
    const result = ToStringParser.parse("Order[id=1, customer=Customer[name=Bob, age=25]]");
    expect(result.success).toBe(true);
    expect(result.data?.id).toBe(1);
    const customer = result.data?.customer as Record<string, unknown>;
    expect(customer._class).toBe("Customer");
    expect(customer.name).toBe("Bob");
    expect(customer.age).toBe(25);
  });

  it("parses package-qualified class names", () => {
    const result = ToStringParser.parse("com.example.service.OrderService[id=1, status=ACTIVE]");
    expect(result.success).toBe(true);
    expect(result.data?._class).toBe("com.example.service.OrderService");
  });
});

describe("parseToStringValue", () => {
  it("parses null", () => {
    expect(parseToStringValue("null")).toBeNull();
    expect(parseToStringValue("<null>")).toBeNull();
  });

  it("parses booleans", () => {
    expect(parseToStringValue("true")).toBe(true);
    expect(parseToStringValue("false")).toBe(false);
  });

  it("parses numbers", () => {
    expect(parseToStringValue("42")).toBe(42);
    expect(parseToStringValue("3.14")).toBe(3.14);
    expect(parseToStringValue("-7")).toBe(-7);
  });

  it("parses JSON objects embedded in toString", () => {
    const result = parseToStringValue('{"key":"value","n":1}');
    expect(result).toEqual({ key: "value", n: 1 });
  });

  it("preserves Java Date strings", () => {
    const javaDate = "Mon Jan 01 00:00:00 CST 2024";
    expect(parseToStringValue(javaDate)).toBe(javaDate);
  });

  it("returns plain string for unrecognized values", () => {
    expect(parseToStringValue("hello world")).toBe("hello world");
  });
});
