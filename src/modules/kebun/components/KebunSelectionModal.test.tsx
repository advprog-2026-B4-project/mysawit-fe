// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import KebunSelectionModal, { type SelectionOption } from "./KebunSelectionModal";

const options: SelectionOption[] = [
    {
        value: "mandor-1",
        label: "Mandor Satu",
        description: "mandor1@test.com | @mandor1",
    },
    {
        value: "mandor-2",
        label: "Mandor Dua",
        description: "mandor2@test.com | @mandor2",
    },
];

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

function ControlledSelectionModal({ onConfirm = vi.fn() }: { onConfirm?: () => void }) {
    const [selectedValue, setSelectedValue] = useState("");

    return (
        <KebunSelectionModal
            title="Pilih Mandor"
            description="Pilih mandor untuk kebun ini."
            selectedValue={selectedValue}
            placeholder="Cari mandor..."
            confirmLabel="Pilih"
            options={options}
            emptyMessage="Belum ada mandor."
            onClose={vi.fn()}
            onChange={setSelectedValue}
            onConfirm={onConfirm}
        />
    );
}

describe("KebunSelectionModal", () => {
    it("filters options by search text", () => {
        render(<ControlledSelectionModal />);

        expect(screen.getByRole("button", { name: /mandor satu/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /mandor dua/i })).toBeInTheDocument();

        fireEvent.change(screen.getByRole("textbox"), { target: { value: "dua" } });

        expect(screen.queryByRole("button", { name: /mandor satu/i })).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: /mandor dua/i })).toBeInTheDocument();
    });

    it("selects an option and enables confirm", () => {
        const onConfirm = vi.fn();
        render(<ControlledSelectionModal onConfirm={onConfirm} />);

        const confirmButton = screen.getByRole("button", { name: "Pilih" });
        expect(confirmButton).toBeDisabled();

        fireEvent.click(screen.getByRole("button", { name: /mandor dua/i }));

        expect(screen.getByText("Dipilih")).toBeInTheDocument();
        expect(confirmButton).not.toBeDisabled();

        fireEvent.click(confirmButton);

        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it("shows empty messages for no options and no matching search result", () => {
        const { rerender } = render(
            <KebunSelectionModal
                title="Pilih Supir"
                description="Pilih supir untuk kebun ini."
                selectedValue=""
                placeholder="Cari supir..."
                confirmLabel="Pilih"
                options={[]}
                emptyMessage="Belum ada supir."
                onClose={vi.fn()}
                onChange={vi.fn()}
                onConfirm={vi.fn()}
            />,
        );

        expect(screen.getByText(/belum ada supir/i)).toBeInTheDocument();

        rerender(
            <KebunSelectionModal
                title="Pilih Supir"
                description="Pilih supir untuk kebun ini."
                selectedValue=""
                placeholder="Cari supir..."
                confirmLabel="Pilih"
                options={options}
                emptyMessage="Belum ada supir."
                onClose={vi.fn()}
                onChange={vi.fn()}
                onConfirm={vi.fn()}
            />,
        );

        fireEvent.change(screen.getByRole("textbox"), { target: { value: "tidak ada" } });

        expect(screen.getByText(/tidak ada pilihan yang cocok/i)).toBeInTheDocument();
    });
});
