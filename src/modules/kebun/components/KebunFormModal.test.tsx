
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import KebunFormModal from "./KebunFormModal";

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.restoreAllMocks();
});

function fillBaseForm() {
    const textboxes = screen.getAllByRole("textbox");
    fireEvent.change(textboxes[0], { target: { value: "  Kebun A  " } });
    fireEvent.change(textboxes[1], { target: { value: "  KB-01  " } });
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "20" } });
}

function fillCoordinates(values: string[]) {
    const coordinateInputs = screen.getAllByPlaceholderText("0");
    values.forEach((value, index) => {
        fireEvent.change(coordinateInputs[index], { target: { value } });
    });
}

describe("KebunFormModal", () => {
    it("falls back to empty coordinates when edit value is incomplete", () => {
        render(
            <KebunFormModal
                mode="edit"
                title="Edit Kebun"
                submitLabel="Simpan Perubahan"
                initialValue={{
                    nama: "Kebun Lama",
                    kode: "KB-OLD",
                    luas: 20,
                    coordinates: [{ lat: 0, lng: 0 }],
                }}
                onClose={vi.fn()}
                onSubmit={vi.fn()}
            />,
        );

        expect(screen.getByText(/preview muncul setelah semua koordinat terisi angka/i)).toBeInTheDocument();
        expect(screen.getAllByPlaceholderText("0")).toHaveLength(8);
    });

    it("renders edit mode with disabled kebun code and initial coordinates", () => {
        render(
            <KebunFormModal
                mode="edit"
                title="Edit Kebun"
                submitLabel="Simpan Perubahan"
                initialValue={{
                    nama: "Kebun Lama",
                    kode: "KB-OLD",
                    luas: 20,
                    coordinates: [
                        { lat: 0, lng: 0 },
                        { lat: 0, lng: 10 },
                        { lat: 10, lng: 0 },
                        { lat: 10, lng: 10 },
                    ],
                }}
                onClose={vi.fn()}
                onSubmit={vi.fn()}
            />,
        );

        expect(screen.getByDisplayValue("Kebun Lama")).toBeInTheDocument();
        expect(screen.getByDisplayValue("KB-OLD")).toBeDisabled();
        expect(screen.getByDisplayValue("20")).toBeInTheDocument();
        expect(screen.getByText("Valid")).toBeInTheDocument();
    });

    it("asks for confirmation before closing a dirty form", () => {
        const onClose = vi.fn();
        const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);

        render(
            <KebunFormModal
                mode="create"
                title="Tambah Kebun"
                submitLabel="Simpan Kebun"
                onClose={onClose}
                onSubmit={vi.fn()}
            />,
        );

        fireEvent.change(screen.getAllByRole("textbox")[0], { target: { value: "Kebun Draft" } });
        fireEvent.click(screen.getByRole("button", { name: /batal/i }));

        expect(confirmSpy).toHaveBeenCalledWith("Tutup form dan buang perubahan yang belum disimpan?");
        expect(onClose).not.toHaveBeenCalled();

        confirmSpy.mockReturnValue(true);
        fireEvent.click(screen.getByRole("button", { name: /batal/i }));

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("closes immediately when the form is clean", () => {
        const onClose = vi.fn();
        const confirmSpy = vi.spyOn(window, "confirm");

        render(
            <KebunFormModal
                mode="create"
                title="Tambah Kebun"
                submitLabel="Simpan Kebun"
                onClose={onClose}
                onSubmit={vi.fn()}
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: /batal/i }));

        expect(confirmSpy).not.toHaveBeenCalled();
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("shows validation errors for empty and non-integer fields", async () => {
        const onSubmit = vi.fn();

        render(
            <KebunFormModal
                mode="create"
                title="Tambah Kebun"
                submitLabel="Simpan Kebun"
                onClose={vi.fn()}
                onSubmit={onSubmit}
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: /simpan kebun/i }));

        expect(await screen.findByText(/nama kebun wajib diisi/i)).toBeInTheDocument();
        expect(screen.getByText(/kode kebun wajib diisi/i)).toBeInTheDocument();
        expect(screen.getByText(/luas kebun harus berupa angka bulat lebih dari 0/i)).toBeInTheDocument();
        expect(screen.getByText(/semua latitude dan longitude harus berupa bilangan bulat/i)).toBeInTheDocument();
        expect(onSubmit).not.toHaveBeenCalled();

        fillBaseForm();
        fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "-1" } });
        fillCoordinates(["0", "0", "0", "10", "10", "0", "x", "10"]);
        fireEvent.click(screen.getByRole("button", { name: /simpan kebun/i }));

        expect(await screen.findByText(/luas kebun harus berupa angka bulat lebih dari 0/i)).toBeInTheDocument();
        expect(screen.getByText(/semua latitude dan longitude harus berupa bilangan bulat/i)).toBeInTheDocument();
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it("fills example square and clears coordinate validation error", async () => {
        render(
            <KebunFormModal
                mode="create"
                title="Tambah Kebun"
                submitLabel="Simpan Kebun"
                onClose={vi.fn()}
                onSubmit={vi.fn()}
            />,
        );

        fillBaseForm();
        fillCoordinates(["0", "0", "0", "20", "10", "0", "10", "20"]);
        fireEvent.click(screen.getByRole("button", { name: /simpan kebun/i }));

        expect(await screen.findByText(/koordinat harus membentuk 4 sudut persegi/i)).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: /isi contoh/i }));

        expect(screen.queryByText(/koordinat harus membentuk 4 sudut persegi/i)).not.toBeInTheDocument();
        expect(screen.getByText("Valid")).toBeInTheDocument();
    });

    it("rejects rectangle coordinates", async () => {
        const onSubmit = vi.fn().mockResolvedValue(undefined);

        render(
            <KebunFormModal
                mode="create"
                title="Tambah Kebun"
                submitLabel="Simpan Kebun"
                onClose={vi.fn()}
                onSubmit={onSubmit}
            />,
        );

        fillBaseForm();
        fillCoordinates(["0", "0", "0", "20", "10", "0", "10", "20"]);

        fireEvent.click(screen.getByRole("button", { name: /simpan kebun/i }));

        await waitFor(() => {
            expect(screen.getByText(/koordinat harus membentuk 4 sudut persegi/i)).toBeInTheDocument();
        });

        expect(onSubmit).not.toHaveBeenCalled();
    });

    it("rejects coordinates that do not match the square corner set", async () => {
        const onSubmit = vi.fn().mockResolvedValue(undefined);

        render(
            <KebunFormModal
                mode="create"
                title="Tambah Kebun"
                submitLabel="Simpan Kebun"
                onClose={vi.fn()}
                onSubmit={onSubmit}
            />,
        );

        fillBaseForm();
        fillCoordinates(["0", "0", "0", "10", "5", "5", "10", "10"]);

        fireEvent.click(screen.getByRole("button", { name: /simpan kebun/i }));

        await waitFor(() => {
            expect(screen.getByText(/koordinat harus membentuk 4 sudut persegi/i)).toBeInTheDocument();
        });

        expect(onSubmit).not.toHaveBeenCalled();
    });

    it("rejects duplicate coordinate points", async () => {
        const onSubmit = vi.fn().mockResolvedValue(undefined);

        render(
            <KebunFormModal
                mode="create"
                title="Tambah Kebun"
                submitLabel="Simpan Kebun"
                onClose={vi.fn()}
                onSubmit={onSubmit}
            />,
        );

        fillBaseForm();
        fillCoordinates(["0", "0", "0", "0", "10", "0", "10", "10"]);

        fireEvent.click(screen.getByRole("button", { name: /simpan kebun/i }));

        await waitFor(() => {
            expect(screen.getByText(/koordinat harus membentuk 4 sudut persegi/i)).toBeInTheDocument();
        });

        expect(onSubmit).not.toHaveBeenCalled();
    });

    it("submits trimmed values for valid square coordinates", async () => {
        const onSubmit = vi.fn().mockResolvedValue(undefined);

        render(
            <KebunFormModal
                mode="create"
                title="Tambah Kebun"
                submitLabel="Simpan Kebun"
                onClose={vi.fn()}
                onSubmit={onSubmit}
            />,
        );

        fillBaseForm();
        fillCoordinates(["0", "0", "0", "10", "10", "0", "10", "10"]);

        fireEvent.click(screen.getByRole("button", { name: /simpan kebun/i }));

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith({
                nama: "Kebun A",
                kode: "KB-01",
                luas: 20,
                coordinates: [
                    { lat: 0, lng: 0 },
                    { lat: 0, lng: 10 },
                    { lat: 10, lng: 0 },
                    { lat: 10, lng: 10 },
                ],
            });
        });
    });

    it("keeps the modal open when submit handler rejects", async () => {
        const onSubmit = vi.fn().mockRejectedValue(new Error("Backend error"));

        render(
            <KebunFormModal
                mode="create"
                title="Tambah Kebun"
                submitLabel="Simpan Kebun"
                errorMessage="Backend error"
                onClose={vi.fn()}
                onSubmit={onSubmit}
            />,
        );

        fillBaseForm();
        fillCoordinates(["0", "0", "0", "10", "10", "0", "10", "10"]);

        expect(screen.getByText(/backend error/i)).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: /simpan kebun/i }));

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledTimes(1);
        });
        expect(screen.getByRole("heading", { name: /tambah kebun/i })).toBeInTheDocument();
    });
});
