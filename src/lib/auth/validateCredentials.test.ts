import { describe, expect, it } from "vitest";
import { validateSignIn, validateSignUp } from "./validateCredentials";

const ok = { role: "student", name: "Alex P.", email: "alex@school.edu", password: "longenough" };

describe("validateSignUp", () => {
  it("accepts a complete form", () => {
    expect(validateSignUp(ok)).toEqual({});
  });

  it("names every missing field, so one submit shows them all", () => {
    expect(validateSignUp({ role: null, name: "  ", email: "", password: "" })).toEqual({
      role: "Choose whether you're a student or a club leader or teacher.",
      name: "Enter your name.",
      email: "Enter your email address.",
      password: "Use at least 8 characters.",
    });
  });

  it("explains a malformed email rather than just refusing it", () => {
    expect(validateSignUp({ ...ok, email: "nope" }).email).toMatch(/you@school\.edu/);
    expect(validateSignUp({ ...ok, email: "a@b" }).email).toBeDefined();
    expect(validateSignUp({ ...ok, email: " alex@school.edu " })).toEqual({});
  });

  it("requires eight characters, counting what was typed", () => {
    expect(validateSignUp({ ...ok, password: "1234567" }).password).toBeDefined();
    expect(validateSignUp({ ...ok, password: "12345678" })).toEqual({});
  });
});

describe("validateSignIn", () => {
  it("only asks for what sign-in needs", () => {
    expect(validateSignIn({ email: "alex@school.edu", password: "x" })).toEqual({});
    expect(validateSignIn({ email: "", password: "" })).toEqual({
      email: "Enter your email address.",
      password: "Enter your password.",
    });
  });
});
