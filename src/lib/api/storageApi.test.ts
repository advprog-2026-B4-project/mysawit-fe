// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";

const { mockDelete } = vi.hoisted(() => ({
  mockDelete: vi.fn(),
}));

vi.mock("@/lib/api/client", () => ({
  default: {
    delete: mockDelete,
  },
}));

import { storageApi } from "./storageApi";

afterEach(() => {
  vi.clearAllMocks();
});

describe("storageApi.getPublicUrl", () => {
  it("constructs URL from base URL and fileKey", () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";
    const url = storageApi.getPublicUrl("uploads/image.jpg");
    expect(url).toBe("https://api.example.com/api/storage/uploads/image.jpg");
  });

  it("handles fileKey with special characters", () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";
    const url = storageApi.getPublicUrl("folder/file name.jpg");
    expect(url).toContain("/api/storage/folder/file name.jpg");
  });
});

describe("storageApi.deleteFile", () => {
  it("calls apiClient.delete with encoded fileKey", async () => {
    mockDelete.mockResolvedValue({});

    await storageApi.deleteFile("uploads/image.jpg");

    expect(mockDelete).toHaveBeenCalledWith(
      "/api/storage/file?fileKey=uploads%2Fimage.jpg",
    );
  });

  it("encodes fileKey with special characters", async () => {
    mockDelete.mockResolvedValue({});

    await storageApi.deleteFile("path/with spaces & symbols");

    expect(mockDelete).toHaveBeenCalledWith(
      "/api/storage/file?fileKey=path%2Fwith%20spaces%20%26%20symbols",
    );
  });
});
