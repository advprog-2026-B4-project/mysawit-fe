// @vitest-environment node

import { afterEach, describe, expect, it } from "vitest";

let cookieStore: Record<string, string> = {};
let windowToken: string | undefined;

global.document = {
  get cookie() {
    return Object.entries(cookieStore)
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");
  },
  set cookie(value: string) {
    const eq = value.indexOf("=");
    const semi = value.indexOf(";");
    const name = value.slice(0, eq);
    const val = value.slice(eq + 1, semi === -1 ? undefined : semi);
    if (val === "" || val === "0") {
      delete cookieStore[name];
    } else {
      cookieStore[name] = val;
    }
  },
} as unknown as Document;

global.window = {
  get __mysawit_access_token() {
    return windowToken;
  },
  set __mysawit_access_token(value: string | undefined) {
    windowToken = value;
  },
  atob: (str: string) => Buffer.from(str, "base64").toString("binary"),
} as unknown as Window & typeof globalThis;

import {
  saveAuth,
  getToken,
  getRole,
  getUserIdFromToken,
  clearAuth,
} from "./tokenStorage";

afterEach(() => {
  cookieStore = {};
  windowToken = undefined;
});

describe("saveAuth", () => {
  it("sets token and role cookies", () => {
    saveAuth("my-token-123", "ADMIN");

    expect(cookieStore["mysawit_token"]).toBe("my-token-123");
    expect(cookieStore["mysawit_role"]).toBe("ADMIN");
    expect(windowToken).toBe("my-token-123");
  });

  it("URI-encodes special characters", () => {
    saveAuth("token/with=spaces", "ROLE WITH SPACES");

    expect(cookieStore["mysawit_token"]).toBe("token%2Fwith%3Dspaces");
    expect(cookieStore["mysawit_role"]).toBe("ROLE%20WITH%20SPACES");
  });
});

describe("getToken", () => {
  it("returns token from cookie", () => {
    saveAuth("abc123", "ADMIN");
    expect(getToken()).toBe("abc123");
  });

  it("returns undefined when no token cookie", () => {
    expect(getToken()).toBeUndefined();
  });
});

describe("getRole", () => {
  it("returns role from cookie", () => {
    saveAuth("abc123", "BURUH");
    expect(getRole()).toBe("BURUH");
  });

  it("returns undefined when no role cookie", () => {
    expect(getRole()).toBeUndefined();
  });
});

describe("getUserIdFromToken", () => {
  it("returns undefined when no token", () => {
    expect(getUserIdFromToken()).toBeUndefined();
  });

  it("returns undefined for non-JWT token", () => {
    saveAuth("not-a-jwt", "ADMIN");
    expect(getUserIdFromToken()).toBeUndefined();
  });

  it("returns sub from JWT payload", () => {
    const header = btoa(JSON.stringify({ alg: "HS256" }));
    const payload = btoa(JSON.stringify({ sub: "user-123", role: "ADMIN" }));
    const token = `${header}.${payload}.signature`;

    saveAuth(token, "ADMIN");
    expect(getUserIdFromToken()).toBe("user-123");
  });

  it("returns undefined when sub is number", () => {
    const header = btoa(JSON.stringify({ alg: "HS256" }));
    const payload = btoa(JSON.stringify({ sub: 12345 }));
    const token = `${header}.${payload}.signature`;

    saveAuth(token, "ADMIN");
    expect(getUserIdFromToken()).toBeUndefined();
  });

  it("returns undefined when sub missing", () => {
    const header = btoa(JSON.stringify({ alg: "HS256" }));
    const payload = btoa(JSON.stringify({ role: "ADMIN" }));
    const token = `${header}.${payload}.signature`;

    saveAuth(token, "ADMIN");
    expect(getUserIdFromToken()).toBeUndefined();
  });

  it("handles base64url encoded JWT", () => {
    const header = "eyJhbGciOiJIUzI1NiJ9";
    const payload = "eyJzdWIiOiJ1c2VyLTQ1NiJ9";
    const token = `${header}.${payload}.sig`;

    saveAuth(token, "ADMIN");
    expect(getUserIdFromToken()).toBe("user-456");
  });

  it("returns undefined for malformed JSON payload", () => {
    saveAuth("header.!invalid!.signature", "ADMIN");
    expect(getUserIdFromToken()).toBeUndefined();
  });
});

describe("clearAuth", () => {
  it("removes token and role cookies", () => {
    saveAuth("abc123", "ADMIN");
    clearAuth();

    expect(getToken()).toBeUndefined();
    expect(getRole()).toBeUndefined();
  });
});
