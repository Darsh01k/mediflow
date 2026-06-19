import { describe, it, expect } from "vitest";
import { loginSchema, signupSchema } from "../src/lib/validations/auth";

describe("Authentication", () => {
  it("should validate login schema - valid input", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("should validate login schema - invalid email", () => {
    const result = loginSchema.safeParse({
      email: "invalid",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("should validate signup schema - valid input", () => {
    const result = signupSchema.safeParse({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("should validate signup schema - short password", () => {
    const result = signupSchema.safeParse({
      name: "Test User",
      email: "test@example.com",
      password: "12345",
    });
    expect(result.success).toBe(false);
  });

  it("should validate signup schema - missing name", () => {
    const result = signupSchema.safeParse({
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });
});
