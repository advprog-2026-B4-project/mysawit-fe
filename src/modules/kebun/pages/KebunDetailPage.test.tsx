// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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
        mutateAsync: vi.fn(),
        isPending: false,
        error: null,
        reset: vi.fn(),
    };
}

beforeEach(() => {
    mockUseAssignMandorToKebun.mockReturnValue(buildMutationStub());
    mockUseMoveMandorToKebun.mockReturnValue(buildMutationStub());
    mockUseAssignSupirToKebun.mockReturnValue(buildMutationStub());
    mockUseMoveSupirToKebun.mockReturnValue(buildMutationStub());

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
        expect(screen.getByText(/luas 20 ha \| 4 titik koordinat/i)).toBeInTheDocument();

        expect(screen.getByRole("heading", { name: /mandor kebun/i })).toBeInTheDocument();
        expect(screen.getByText("Mandor Satu")).toBeInTheDocument();

        expect(screen.getByRole("heading", { name: /daftar supir truk/i })).toBeInTheDocument();
        expect(screen.getByText("Supir Satu")).toBeInTheDocument();

        expect(screen.getByRole("heading", { name: /daftar buruh/i })).toBeInTheDocument();
        expect(screen.getByText("Buruh Satu")).toBeInTheDocument();

        expect(screen.getByRole("button", { name: /pindahkan mandor/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /tugaskan supir/i })).toBeInTheDocument();
    });

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

        expect(screen.getByText(/belum ada mandor yang ditugaskan/i)).toBeInTheDocument();
        expect(screen.getByText(/belum ada supir yang terdaftar/i)).toBeInTheDocument();
        expect(screen.getByText(/belum ada buruh yang tampil/i)).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: /tugaskan mandor/i }));

        expect(screen.getByRole("heading", { name: /tugaskan mandor/i })).toBeInTheDocument();
        expect(screen.getByRole("option", { name: "Mandor Dua" })).toBeInTheDocument();
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