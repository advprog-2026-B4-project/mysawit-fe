// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { KebunDTO } from "../api/kebunApi";
import KebunListPage from "./KebunListPage";

const mockUseKebunList = vi.fn();
const mockUseCreateKebun = vi.fn();
const mockUseEditKebun = vi.fn();
const mockUseDeleteKebun = vi.fn();

const modalPayload = {
    nama: "Kebun Baru",
    kode: "KB-NEW",
    luas: 30,
    coordinates: [
        { lat: 0, lng: 0 },
        { lat: 0, lng: 10 },
        { lat: 10, lng: 0 },
        { lat: 10, lng: 10 },
    ],
};

vi.mock("../hooks/useKebun", () => ({
    useKebunList: (...args: unknown[]) => mockUseKebunList(...args),
    useCreateKebun: () => mockUseCreateKebun(),
    useEditKebun: () => mockUseEditKebun(),
    useDeleteKebun: () => mockUseDeleteKebun(),
}));

vi.mock("../components/KebunFormModal", () => ({
    default: ({
        title,
        errorMessage,
        loading,
        onClose,
        onSubmit,
    }: {
        title: string;
        errorMessage?: string;
        loading?: boolean;
        onClose: () => void;
        onSubmit: (value: typeof modalPayload) => Promise<void> | void;
    }) => (
        <div role="dialog" aria-label={title}>
            <h2>{title}</h2>
            {errorMessage && <div>{errorMessage}</div>}
            {loading && <div>Memproses modal</div>}
            <button type="button" onClick={() => onSubmit(modalPayload)}>
                Submit Modal
            </button>
            <button type="button" onClick={onClose}>
                Close Modal
            </button>
        </div>
    ),
}));

function buildMutationStub() {
    return {
        mutateAsync: vi.fn().mockResolvedValue(undefined),
        isPending: false,
        error: null as Error | null,
        reset: vi.fn(),
    };
}

const kebunList: KebunDTO[] = [
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
];

let createMutation: ReturnType<typeof buildMutationStub>;
let editMutation: ReturnType<typeof buildMutationStub>;
let deleteMutation: ReturnType<typeof buildMutationStub>;

beforeEach(() => {
    createMutation = buildMutationStub();
    editMutation = buildMutationStub();
    deleteMutation = buildMutationStub();

    mockUseKebunList.mockReturnValue({
        data: kebunList,
        isLoading: false,
        error: null,
    });
    mockUseCreateKebun.mockReturnValue(createMutation);
    mockUseEditKebun.mockReturnValue(editMutation);
    mockUseDeleteKebun.mockReturnValue(deleteMutation);
});

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe("KebunListPage", () => {
    it("renders kebun list and sends active filters to the list hook", () => {
        render(<KebunListPage />);

        expect(screen.getAllByText("Kebun Sei Lestari").length).toBeGreaterThan(0);
        expect(screen.getAllByText("KB-01").length).toBeGreaterThan(0);
        expect(screen.getAllByText("20 Ha").length).toBeGreaterThan(0);
        expect(screen.getAllByText("(0, 0), (0, 10), (10, 0), (10, 10)").length).toBeGreaterThan(0);

        fireEvent.change(screen.getByPlaceholderText(/sei lestari/i), { target: { value: "Sei" } });
        fireEvent.change(screen.getByPlaceholderText(/kbn-sl-01/i), { target: { value: "KB-01" } });

        expect(mockUseKebunList).toHaveBeenLastCalledWith("Sei", "KB-01");

        fireEvent.click(screen.getByRole("button", { name: /reset filter/i }));

        expect(mockUseKebunList).toHaveBeenLastCalledWith(undefined, undefined);
    });

    it("opens create and edit modals and submits the expected payloads", async () => {
        render(<KebunListPage />);

        fireEvent.click(screen.getByRole("button", { name: /tambah kebun/i }));

        expect(screen.getByRole("dialog", { name: /tambah kebun sawit/i })).toBeInTheDocument();
        expect(createMutation.reset).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByRole("button", { name: /submit modal/i }));

        await waitFor(() => {
            expect(createMutation.mutateAsync).toHaveBeenCalledWith(modalPayload);
        });

        fireEvent.click(screen.getAllByRole("button", { name: /^edit$/i })[0]);

        expect(screen.getByRole("dialog", { name: /edit kebun sei lestari/i })).toBeInTheDocument();
        expect(editMutation.reset).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByRole("button", { name: /submit modal/i }));

        await waitFor(() => {
            expect(editMutation.mutateAsync).toHaveBeenCalledWith({
                kebunId: "kebun-1",
                payload: {
                    nama: modalPayload.nama,
                    luas: modalPayload.luas,
                    coordinates: modalPayload.coordinates,
                },
            });
        });
    });

    it("opens delete confirmation and deletes selected kebun", async () => {
        render(<KebunListPage />);

        fireEvent.click(screen.getAllByRole("button", { name: /^hapus$/i })[0]);

        expect(screen.getByRole("heading", { name: /hapus kebun/i })).toBeInTheDocument();
        expect(screen.getByText(/akan gagal jika kebun masih memiliki mandor/i)).toBeInTheDocument();
        expect(deleteMutation.reset).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByRole("button", { name: /hapus kebun/i }));

        await waitFor(() => {
            expect(deleteMutation.mutateAsync).toHaveBeenCalledWith("kebun-1");
        });
    });

    it("handles mobile card edit and delete actions", async () => {
        render(<KebunListPage />);

        fireEvent.click(screen.getAllByRole("button", { name: /^edit$/i })[1]);

        expect(screen.getByRole("dialog", { name: /edit kebun sei lestari/i })).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: /close modal/i }));
        fireEvent.click(screen.getAllByRole("button", { name: /^hapus$/i })[1]);

        expect(screen.getByRole("heading", { name: /hapus kebun/i })).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: /batal/i }));

        expect(screen.queryByRole("heading", { name: /hapus kebun/i })).not.toBeInTheDocument();
    });

    it("keeps create, edit, and delete dialogs open when mutations fail", async () => {
        createMutation.mutateAsync.mockRejectedValueOnce(new Error("Nama kebun duplikat"));
        createMutation.error = new Error("Nama kebun duplikat");
        editMutation.mutateAsync.mockRejectedValueOnce(new Error("Overlap kebun"));
        editMutation.error = new Error("Overlap kebun");
        deleteMutation.mutateAsync.mockRejectedValueOnce(new Error("Masih ada mandor"));
        deleteMutation.error = new Error("Masih ada mandor");

        render(<KebunListPage />);

        fireEvent.click(screen.getByRole("button", { name: /tambah kebun/i }));
        expect(screen.getByText(/nama kebun duplikat/i)).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: /submit modal/i }));

        await waitFor(() => {
            expect(createMutation.mutateAsync).toHaveBeenCalledTimes(1);
        });
        expect(screen.getByRole("dialog", { name: /tambah kebun sawit/i })).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: /close modal/i }));
        fireEvent.click(screen.getAllByRole("button", { name: /^edit$/i })[0]);
        expect(screen.getByText(/overlap kebun/i)).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: /submit modal/i }));

        await waitFor(() => {
            expect(editMutation.mutateAsync).toHaveBeenCalledTimes(1);
        });
        expect(screen.getByRole("dialog", { name: /edit kebun sei lestari/i })).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: /close modal/i }));
        fireEvent.click(screen.getAllByRole("button", { name: /^hapus$/i })[0]);
        expect(screen.getByText(/masih ada mandor/i)).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: /hapus kebun/i }));

        await waitFor(() => {
            expect(deleteMutation.mutateAsync).toHaveBeenCalledTimes(1);
        });
        expect(screen.getByRole("heading", { name: /hapus kebun/i })).toBeInTheDocument();
    });

    it("shows loading, empty, and error states", () => {
        const { rerender } = render(<KebunListPage />);

        mockUseKebunList.mockReturnValue({
            data: [],
            isLoading: true,
            error: null,
        });
        rerender(<KebunListPage />);

        expect(screen.getAllByText(/memuat data kebun/i).length).toBeGreaterThan(0);

        mockUseKebunList.mockReturnValue({
            data: [],
            isLoading: false,
            error: null,
        });
        rerender(<KebunListPage />);

        expect(screen.getByText(/belum ada kebun yang cocok dengan filter/i)).toBeInTheDocument();

        mockUseKebunList.mockReturnValue({
            data: [],
            isLoading: false,
            error: new Error("Gagal memuat kebun"),
        });
        rerender(<KebunListPage />);

        expect(screen.getByText(/gagal memuat kebun/i)).toBeInTheDocument();
    });
});
