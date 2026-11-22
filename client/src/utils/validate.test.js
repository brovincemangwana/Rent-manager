import { describe, it, expect } from "vitest";
import { validateRegister, validateLogin } from "./validate";
const valid = {
  name: "Amina",
  email: "amina@example.com",
  password: "secret123",
  confirmPassword: "secret123",
};

describe("validateRegister", () => {
  it("should return no errors for valid input", () => {
    expect(validateRegister(valid)).toEqual({});
  });

  it("requires a name", () => {
    expect(validateRegister({ ...valid, name: "" }).name).toBeDefined();
  });
  it("rejects an invalid email", () => {
    expect(validateRegister({ ...valid, email: "amina" }).email).toBeDefined();
  });
  it("rejects a short password", () => {
    const result = validateRegister({
      ...valid,
      password: "123",
      confirmPassword: "123",
    });
    expect(result.password).toBeDefined();
  });
  it("rejects mismatched passwords", () => {
    const result = validateRegister({ ...valid, confirmPassword: "other" });
    expect(result.confirmPassword).toBeDefined();
  });
});

describe("validateLogin", () => {
  it("returns no errors for valid input", () => {
    expect(
      validateLogin({ email: "amina@example.com", password: "secret123" }),
    ).toEqual({});
  });

  it("rejects an invalid email", () => {
    expect(
      validateLogin({ email: "amina", password: "secret123" }).email,
    ).toBeDefined();
  });
  it("requires a password", () => {
    expect(
      validateLogin({ email: "amina@example.com", password: "" }).password,
    ).toBeDefined();
  });
});
