import { afterEach, describe, expect, it, vi } from "vitest";
import apiClient from "@/lib/api/client";
import { kebunApi, type CreateKebunRequest, type EditKebunRequest } from "./kebunApi";

const mockApiClient = vi.hoisted(() => ({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
}));

vi.mock("@/lib/api/client", () => ({
    default: mockApiClient,
}));

const kebun = {
    kebunId: "kebun-1",
    nama: "Kebun Sei Lestari",
    kode: "KB-01",
    luas: 20,
    coordinates: [
        { lat: 0, lng: 0 },
        { lat: 0, lng: 10 },
        { lat: 10, lng: 0 },
        { lat: 10, lng: 10 },
    ],
};

afterEach(() => {
    vi.clearAllMocks();
});

describe("kebunApi", () => {
    it("calls kebun CRUD endpoints with expected payloads and params", async () => {
        const createPayload: CreateKebunRequest = {
            nama: "Kebun Baru",
            kode: "KB-NEW",
            luas: 30,
            coordinates: kebun.coordinates,
        };
        const editPayload: EditKebunRequest = {
            nama: "Kebun Edit",
            luas: 35,
            coordinates: kebun.coordinates,
        };

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: [kebun] });
        await expect(kebunApi.listKebun("Sei", "KB-01")).resolves.toEqual([kebun]);
        expect(apiClient.get).toHaveBeenCalledWith("/api/kebun", {
            params: { nama: "Sei", kode: "KB-01" },
        });

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: kebun });
        await expect(kebunApi.getKebunById("kebun-1")).resolves.toEqual(kebun);
        expect(apiClient.get).toHaveBeenCalledWith("/api/kebun/kebun-1");

        vi.mocked(apiClient.post).mockResolvedValueOnce({ data: kebun });
        await expect(kebunApi.createKebun(createPayload)).resolves.toEqual(kebun);
        expect(apiClient.post).toHaveBeenCalledWith("/api/kebun", createPayload);

        vi.mocked(apiClient.put).mockResolvedValueOnce({ data: kebun });
        await expect(kebunApi.editKebun("kebun-1", editPayload)).resolves.toEqual(kebun);
        expect(apiClient.put).toHaveBeenCalledWith("/api/kebun/kebun-1", editPayload);

        vi.mocked(apiClient.delete).mockResolvedValueOnce({});
        await expect(kebunApi.deleteKebun("kebun-1")).resolves.toBeUndefined();
        expect(apiClient.delete).toHaveBeenCalledWith("/api/kebun/kebun-1");
    });

    it("calls kebun relation endpoints with expected payloads and params", async () => {
        const user = {
            userId: "mandor-1",
            username: "mandor1",
            name: "Mandor Satu",
            role: "MANDOR",
            email: "mandor@test.com",
        };

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { mandorId: "mandor-1" } });
        await expect(kebunApi.getMandorByKebun("kebun-1")).resolves.toEqual({ mandorId: "mandor-1" });
        expect(apiClient.get).toHaveBeenCalledWith("/api/kebun/kebun-1/mandor");

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: [user] });
        await expect(kebunApi.getSupirList("kebun-1", "Supir")).resolves.toEqual([user]);
        expect(apiClient.get).toHaveBeenCalledWith("/api/kebun/kebun-1/supir", {
            params: { nama: "Supir" },
        });

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: [user] });
        await expect(kebunApi.getBuruhList("kebun-1", "Buruh")).resolves.toEqual([user]);
        expect(apiClient.get).toHaveBeenCalledWith("/api/kebun/kebun-1/buruh", {
            params: { nama: "Buruh" },
        });

        vi.mocked(apiClient.post).mockResolvedValueOnce({});
        await expect(kebunApi.assignMandorToKebun("mandor-1", "kebun-1")).resolves.toBeUndefined();
        expect(apiClient.post).toHaveBeenCalledWith("/api/kebun/kebun-1/assign/mandor", {
            personId: "mandor-1",
        });

        vi.mocked(apiClient.post).mockResolvedValueOnce({});
        await expect(kebunApi.moveMandorToKebun("mandor-1", "kebun-2")).resolves.toBeUndefined();
        expect(apiClient.post).toHaveBeenCalledWith("/api/kebun/kebun-2/move/mandor", {
            personId: "mandor-1",
        });

        vi.mocked(apiClient.post).mockResolvedValueOnce({});
        await expect(kebunApi.assignSupirToKebun("supir-1", "kebun-1")).resolves.toBeUndefined();
        expect(apiClient.post).toHaveBeenCalledWith("/api/kebun/kebun-1/assign/supir", {
            personId: "supir-1",
        });

        vi.mocked(apiClient.post).mockResolvedValueOnce({});
        await expect(kebunApi.moveSupirToKebun("supir-1", "kebun-2")).resolves.toBeUndefined();
        expect(apiClient.post).toHaveBeenCalledWith("/api/kebun/kebun-2/move/supir", {
            personId: "supir-1",
        });
    });

    it("calls user directory endpoints", async () => {
        const user = {
            userId: "mandor-1",
            username: "mandor1",
            name: "Mandor Satu",
            role: "MANDOR",
            email: "mandor@test.com",
        };

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: [user] });
        await expect(kebunApi.listUsersByRole("MANDOR")).resolves.toEqual([user]);
        expect(apiClient.get).toHaveBeenCalledWith("/api/users", {
            params: { role: "MANDOR" },
        });

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: user });
        await expect(kebunApi.getUserById("mandor-1")).resolves.toEqual(user);
        expect(apiClient.get).toHaveBeenCalledWith("/api/users/mandor-1");
    });
});
