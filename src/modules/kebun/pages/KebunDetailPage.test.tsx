
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import KebunDetailPage from "./KebunDetailPage";

const mockUseKebunDetail = vi.fn();
const mockUseKebunMandor = vi.fn();
const mockUseKebunUser = vi.fn();
const mockUseKebunSupirList = vi.fn();
const mockUseKebunBuruhList = vi.fn();
const mockUseKebunDirectoryUsers = vi.fn();
const mockUseKebunList = vi.fn();
const mockUseAssignMandorToKebun = vi.fn();
const mockUseMoveMandorToKebun = vi.fn();
const mockUseAssignSupirToKebun = vi.fn();
const mockUseMoveSupirToKebun = vi.fn();

vi.mock("next/navigation", () => ({
    useParams: () => ({ kebunId: "kebun-1" }),
}));

vi.mock("../hooks/useKebun", () => ({
    useKebunDetail: (...args: unknown[]) => mockUseKebunDetail(...args),
    useKebunMandor: (...args: unknown[]) => mockUseKebunMandor(...args),
    useKebunUser: (...args: unknown[]) => mockUseKebunUser(...args),
    useKebunSupirList: (...args: unknown[]) => mockUseKebunSupirList(...args),
    useKebunBuruhList: (...args: unknown[]) => mockUseKebunBuruhList(...args),
    useKebunDirectoryUsers: (...args: unknown[]) => mockUseKebunDirectoryUsers(...args),
    useKebunList: (...args: unknown[]) => mockUseKebunList(...args),
    useAssignMandorToKebun: () => mockUseAssignMandorToKebun(),
    useMoveMandorToKebun: () => mockUseMoveMandorToKebun(),
    useAssignSupirToKebun: () => mockUseAssignSupirToKebun(),
    useMoveSupirToKebun: () => mockUseMoveSupirToKebun(),
}));

function buildMutationStub() {
    return {
        mutateAsync: vi.fn().mockResolvedValue(undefined),
        isPending: false,
        error: null as Error | null,
        reset: vi.fn(),
    };
}

let assignMandorMutation: ReturnType<typeof buildMutationStub>;
let moveMandorMutation: ReturnType<typeof buildMutationStub>;
let assignSupirMutation: ReturnType<typeof buildMutationStub>;
let moveSupirMutation: ReturnType<typeof buildMutationStub>;

beforeEach(() => {
    assignMandorMutation = buildMutationStub();
    moveMandorMutation = buildMutationStub();
    assignSupirMutation = buildMutationStub();
    moveSupirMutation = buildMutationStub();

    mockUseAssignMandorToKebun.mockReturnValue(assignMandorMutation);
    mockUseMoveMandorToKebun.mockReturnValue(moveMandorMutation);
    mockUseAssignSupirToKebun.mockReturnValue(assignSupirMutation);
    mockUseMoveSupirToKebun.mockReturnValue(moveSupirMutation);

    mockUseKebunDetail.mockReturnValue({
        data: {
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
        },
        isLoading: false,
        error: null,
    });

    mockUseKebunMandor.mockReturnValue({
        data: { mandorId: "mandor-1" },
    });

    mockUseKebunUser.mockReturnValue({
        data: {
            userId: "mandor-1",
            username: "mandor1",
            name: "Mandor Satu",
            role: "MANDOR",
            email: "mandor@test.com",
        },
    });

    mockUseKebunSupirList.mockReturnValue({
        data: [
            {
                userId: "supir-1",
                username: "supir1",
                name: "Supir Satu",
                role: "SUPIR",
                email: "supir@test.com",
            },
        ],
        error: null,
    });

    mockUseKebunBuruhList.mockReturnValue({
        data: [
            {
                userId: "buruh-1",
                username: "buruh1",
                name: "Buruh Satu",
                role: "BURUH",
                email: "buruh@test.com",
            },
        ],
        error: null,
    });

    mockUseKebunDirectoryUsers.mockImplementation((role: string) => {
        if (role === "MANDOR") {
            return {
                data: [
                    {
                        userId: "mandor-2",
                        username: "mandor2",
                        name: "Mandor Dua",
                        role: "MANDOR",
                        email: "mandor2@test.com",
                    },
                ],
            };
        }

        return {
            data: [
                {
                    userId: "supir-2",
                    username: "supir2",
                    name: "Supir Dua",
                    role: "SUPIR",
                    email: "supir2@test.com",
                },
            ],
        };
    });

    mockUseKebunList.mockReturnValue({
        data: [
            {
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
            },
            {
                kebunId: "kebun-2",
                nama: "Kebun Sungai Baru",
                kode: "KB-02",
                luas: 25,
                coordinates: [
                    { lat: 20, lng: 20 },
                    { lat: 20, lng: 30 },
                    { lat: 30, lng: 20 },
                    { lat: 30, lng: 30 },
                ],
            },
        ],
    });
});

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe("KebunDetailPage", () => {
    it("renders kebun detail, mandor, supir, and buruh sections", () => {
        render(<KebunDetailPage />);

        expect(screen.getByRole("heading", { name: /kebun sei lestari/i })).toBeInTheDocument();
        expect(screen.getByText(/luas 20 ha/i)).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: /^mandor$/i }));
        expect(screen.getByRole("heading", { name: /mandor kebun/i })).toBeInTheDocument();
        expect(screen.getByText("Mandor Satu")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /pindahkan mandor/i })).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: /^supir$/i }));
        expect(screen.getByRole("heading", { name: /daftar supir truk/i })).toBeInTheDocument();
        expect(screen.getByText("Supir Satu")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /tugaskan supir/i })).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: /^buruh$/i }));
        expect(screen.getByRole("heading", { name: /daftar buruh/i })).toBeInTheDocument();
        expect(screen.getByText("Buruh Satu")).toBeInTheDocument();
    }, 15000);

    it("shows empty states and opens assign mandor modal when no mandor is assigned", () => {
        mockUseKebunMandor.mockReturnValue({
            data: { mandorId: null },
        });

        mockUseKebunUser.mockReturnValue({
            data: undefined,
        });

        mockUseKebunSupirList.mockReturnValue({
            data: [],
            error: null,
        });

        mockUseKebunBuruhList.mockReturnValue({
            data: [],
            error: null,
        });

        render(<KebunDetailPage />);

        fireEvent.click(screen.getByRole("button", { name: /^mandor$/i }));
        expect(screen.getByText(/belum ada mandor yang ditugaskan/i)).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: /^supir$/i }));
        expect(screen.getByText(/belum ada supir yang terdaftar/i)).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: /^buruh$/i }));
        expect(screen.getByText(/belum ada buruh yang tampil/i)).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: /^mandor$/i }));
        fireEvent.click(screen.getByRole("button", { name: /tugaskan mandor/i }));

        expect(screen.getByRole("heading", { name: /tugaskan mandor/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /mandor dua/i })).toBeInTheDocument();
    });

    it("assigns and moves mandor through the selection modals", async () => {
        render(<KebunDetailPage />);

        fireEvent.click(screen.getByRole("button", { name: /^mandor$/i }));
        fireEvent.click(screen.getByRole("button", { name: /pindahkan mandor/i }));

        expect(moveMandorMutation.reset).toHaveBeenCalledTimes(1);
        expect(screen.getByRole("heading", { name: /pindahkan mandor/i })).toBeInTheDocument();
        expect(screen.getByText(/tidak lagi memiliki mandor/i)).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: /kebun sungai baru/i }));
        fireEvent.click(screen.getAllByRole("button", { name: /^pindahkan$/i }).at(-1)!);

        await waitFor(() => {
            expect(moveMandorMutation.mutateAsync).toHaveBeenCalledWith({
                mandorId: "mandor-1",
                newKebunId: "kebun-2",
            });
        });
        expect(screen.queryByRole("heading", { name: /pindahkan mandor/i })).not.toBeInTheDocument();

        mockUseKebunMandor.mockReturnValue({ data: { mandorId: null } });
        mockUseKebunUser.mockReturnValue({ data: undefined });

        render(<KebunDetailPage />);

        fireEvent.click(screen.getAllByRole("button", { name: /^mandor$/i })[1]);
        fireEvent.click(screen.getByRole("button", { name: /tugaskan mandor/i }));

        expect(assignMandorMutation.reset).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByRole("button", { name: /mandor dua/i }));
        fireEvent.click(screen.getByRole("button", { name: /^tugaskan$/i }));

        await waitFor(() => {
            expect(assignMandorMutation.mutateAsync).toHaveBeenCalledWith({
                mandorId: "mandor-2",
                kebunId: "kebun-1",
            });
        });
    }, 15000);

    it("assigns and moves supir through the selection modals", async () => {
        render(<KebunDetailPage />);

        fireEvent.click(screen.getByRole("button", { name: /^supir$/i }));
        fireEvent.change(screen.getByPlaceholderText(/contoh: dedi/i), { target: { value: "Supir" } });

        await waitFor(() => {
            expect(mockUseKebunSupirList).toHaveBeenCalledWith("kebun-1", "Supir");
        });

        fireEvent.click(screen.getByRole("button", { name: /tugaskan supir/i }));

        expect(assignSupirMutation.reset).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByRole("button", { name: /supir dua/i }));
        fireEvent.click(screen.getByRole("button", { name: /^tugaskan$/i }));

        await waitFor(() => {
            expect(assignSupirMutation.mutateAsync).toHaveBeenCalledWith({
                supirId: "supir-2",
                kebunId: "kebun-1",
            });
        });

        fireEvent.click(screen.getByRole("button", { name: /tugaskan supir/i }));
        fireEvent.click(screen.getByRole("button", { name: /batal/i }));
        expect(screen.queryByRole("heading", { name: /tugaskan supir/i })).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: /^supir$/i }));
        fireEvent.click(screen.getByRole("button", { name: /pindahkan/i }));

        expect(moveSupirMutation.reset).toHaveBeenCalledTimes(1);
        expect(screen.getByRole("heading", { name: /pindahkan supir satu/i })).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: /kebun sungai baru/i }));
        fireEvent.click(screen.getAllByRole("button", { name: /^pindahkan$/i }).at(-1)!);

        await waitFor(() => {
            expect(moveSupirMutation.mutateAsync).toHaveBeenCalledWith({
                supirId: "supir-1",
                newKebunId: "kebun-2",
            });
        });

        fireEvent.click(screen.getByRole("button", { name: /pindahkan/i }));
        fireEvent.click(screen.getByRole("button", { name: /batal/i }));
        expect(screen.queryByRole("heading", { name: /pindahkan supir satu/i })).not.toBeInTheDocument();
    }, 15000);

    it("keeps assignment modals open and shows mutation errors when submit fails", async () => {
        assignMandorMutation.mutateAsync.mockRejectedValueOnce(new Error("Mandor sudah bertugas"));
        assignMandorMutation.error = new Error("Mandor sudah bertugas");
        assignSupirMutation.mutateAsync.mockRejectedValueOnce(new Error("Supir sudah bertugas"));
        assignSupirMutation.error = new Error("Supir sudah bertugas");
        moveMandorMutation.mutateAsync.mockRejectedValueOnce(new Error("Kebun tujuan invalid"));
        moveMandorMutation.error = new Error("Kebun tujuan invalid");
        moveSupirMutation.mutateAsync.mockRejectedValueOnce(new Error("Supir tidak bisa dipindah"));
        moveSupirMutation.error = new Error("Supir tidak bisa dipindah");

        mockUseKebunMandor.mockReturnValue({ data: { mandorId: null } });
        mockUseKebunUser.mockReturnValue({ data: undefined });

        render(<KebunDetailPage />);

        fireEvent.click(screen.getByRole("button", { name: /^mandor$/i }));
        fireEvent.click(screen.getByRole("button", { name: /tugaskan mandor/i }));
        expect(screen.getAllByText(/mandor sudah bertugas/i).length).toBeGreaterThan(0);
        fireEvent.click(screen.getByRole("button", { name: /mandor dua/i }));
        fireEvent.click(screen.getByRole("button", { name: /^tugaskan$/i }));

        await waitFor(() => {
            expect(assignMandorMutation.mutateAsync).toHaveBeenCalledTimes(1);
        });
        expect(screen.getByRole("heading", { name: /tugaskan mandor/i })).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: /batal/i }));
        fireEvent.click(screen.getByRole("button", { name: /^supir$/i }));
        fireEvent.click(screen.getByRole("button", { name: /tugaskan supir/i }));
        expect(screen.getByText(/supir sudah bertugas/i)).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: /supir dua/i }));
        fireEvent.click(screen.getByRole("button", { name: /^tugaskan$/i }));

        await waitFor(() => {
            expect(assignSupirMutation.mutateAsync).toHaveBeenCalledTimes(1);
        });

        cleanup();
        mockUseKebunMandor.mockReturnValue({ data: { mandorId: "mandor-1" } });
        mockUseKebunUser.mockReturnValue({
            data: {
                userId: "mandor-1",
                username: "mandor1",
                name: "Mandor Satu",
                role: "MANDOR",
                email: "mandor@test.com",
            },
        });

        render(<KebunDetailPage />);

        fireEvent.click(screen.getByRole("button", { name: /^mandor$/i }));
        fireEvent.click(screen.getByRole("button", { name: /pindahkan mandor/i }));
        expect(screen.getByText(/kebun tujuan invalid/i)).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: /kebun sungai baru/i }));
        fireEvent.click(screen.getAllByRole("button", { name: /^pindahkan$/i }).at(-1)!);

        await waitFor(() => {
            expect(moveMandorMutation.mutateAsync).toHaveBeenCalledTimes(1);
        });

        fireEvent.click(screen.getByRole("button", { name: /batal/i }));
        fireEvent.click(screen.getByRole("button", { name: /^supir$/i }));
        fireEvent.click(screen.getByRole("button", { name: /pindahkan/i }));
        expect(screen.getByText(/supir tidak bisa dipindah/i)).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: /kebun sungai baru/i }));
        fireEvent.click(screen.getAllByRole("button", { name: /^pindahkan$/i }).at(-1)!);

        await waitFor(() => {
            expect(moveSupirMutation.mutateAsync).toHaveBeenCalledTimes(1);
        });
    }, 15000);

    it("shows filtered empty states and list errors for supir and buruh", () => {
        mockUseKebunSupirList.mockReturnValue({
            data: [],
            error: new Error("Gagal memuat supir"),
        });
        mockUseKebunBuruhList.mockReturnValue({
            data: [],
            error: new Error("Gagal memuat buruh"),
        });

        render(<KebunDetailPage />);

        fireEvent.click(screen.getByRole("button", { name: /^supir$/i }));
        fireEvent.change(screen.getByPlaceholderText(/contoh: dedi/i), { target: { value: "Dedi" } });

        expect(screen.getByText(/gagal memuat supir/i)).toBeInTheDocument();
        expect(screen.getByText(/tidak ada supir yang cocok/i)).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: /^buruh$/i }));
        fireEvent.change(screen.getByPlaceholderText(/contoh: budi/i), { target: { value: "Budi" } });

        expect(mockUseKebunBuruhList).toHaveBeenLastCalledWith("kebun-1", "Budi", "mandor-1");
        expect(screen.getByText(/gagal memuat buruh/i)).toBeInTheDocument();
        expect(screen.getByText(/tidak ada buruh yang cocok/i)).toBeInTheDocument();
    });

    it("shows loading and not found states", () => {
        mockUseKebunDetail.mockReturnValue({
            data: undefined,
            isLoading: true,
            error: null,
        });

        const { rerender } = render(<KebunDetailPage />);

        expect(screen.getByText(/memuat detail kebun/i)).toBeInTheDocument();

        mockUseKebunDetail.mockReturnValue({
            data: undefined,
            isLoading: false,
            error: null,
        });
        rerender(<KebunDetailPage />);

        expect(screen.getByText(/detail kebun tidak ditemukan/i)).toBeInTheDocument();
    });

    it("shows error state when kebun detail fails to load", () => {
        mockUseKebunDetail.mockReturnValue({
            data: undefined,
            isLoading: false,
            error: new Error("Gagal memuat detail"),
        });

        render(<KebunDetailPage />);

        expect(screen.getByText(/gagal memuat detail/i)).toBeInTheDocument();
    });
});
