import {
  validateName,
  sanitizeNameInput,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from "@/lib/validation";

describe("validateName", () => {
  it("accepts a simple name", () => {
    expect(validateName("Testimony", true)).toBeNull();
  });

  it("accepts a hyphenated name", () => {
    expect(validateName("El-rufai", true)).toBeNull();
  });

  it("rejects a name with a space", () => {
    expect(validateName("El rufai", true)).not.toBeNull();
  });

  it("rejects a leading hyphen", () => {
    expect(validateName("-Elrufai", true)).not.toBeNull();
  });

  it("rejects a trailing hyphen", () => {
    expect(validateName("Elrufai-", true)).not.toBeNull();
  });

  it("rejects numbers", () => {
    expect(validateName("Test1", true)).not.toBeNull();
  });

  it("allows an empty optional field", () => {
    expect(validateName("", false)).toBeNull();
  });

  it("requires a required field", () => {
    expect(validateName("", true)).not.toBeNull();
  });
});

describe("sanitizeNameInput", () => {
  it("strips numbers and symbols", () => {
    expect(sanitizeNameInput("Te$t1 Name")).toBe("TetName");
  });

  it("capitalizes the first letter", () => {
    expect(sanitizeNameInput("testimony")).toBe("Testimony");
  });

  it("preserves hyphens", () => {
    expect(sanitizeNameInput("el-rufai")).toBe("El-rufai");
  });
});

describe("validateEmail", () => {
  it("accepts a valid email", () => {
    expect(validateEmail("test@example.com")).toBeNull();
  });

  it("rejects a missing @", () => {
    expect(validateEmail("testexample.com")).not.toBeNull();
  });

  it("rejects an empty string", () => {
    expect(validateEmail("")).not.toBeNull();
  });
});

describe("validatePassword", () => {
  it("accepts a strong password", () => {
    expect(validatePassword("TestPass123!")).toBeNull();
  });

  it("rejects a password with no special character", () => {
    expect(validatePassword("TestPass123")).not.toBeNull();
  });

  it("rejects a short password", () => {
    expect(validatePassword("Ab1!")).not.toBeNull();
  });

  it("rejects a password with no uppercase letter", () => {
    expect(validatePassword("testpass123!")).not.toBeNull();
  });
});

describe("validateConfirmPassword", () => {
  it("accepts matching passwords", () => {
    expect(validateConfirmPassword("TestPass123!", "TestPass123!")).toBeNull();
  });

  it("rejects mismatched passwords", () => {
    expect(validateConfirmPassword("TestPass123!", "Different123!")).not.toBeNull();
  });
});
