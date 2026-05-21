// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mockMarkAsRead = vi.fn();
const mockMarkAllAsRead = vi.fn();

let mockData: unknown = undefined;
let mockIsLoading = false;
let mockIsError = false;

vi.mock("../hooks/useNotifications", () => ({
  useNotifications: () => ({
    data: mockData,
    isLoading: mockIsLoading,
    isError: mockIsError,
  }),
  useMarkAsRead: () => ({
    mutate: mockMarkAsRead,
    isPending: false,
  }),
  useMarkAllAsRead: () => ({
    mutate: mockMarkAllAsRead,
    isPending: false,
  }),
}));

import NotificationList from "./NotificationList";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  mockData = undefined;
  mockIsLoading = false;
  mockIsError = false;
});

describe("NotificationList - loading", () => {
  it("shows loading text when isLoading is true", () => {
    mockIsLoading = true;

    render(<NotificationList />);

    expect(screen.getByText(/memuat notifikasi/i)).toBeInTheDocument();
  });
});

describe("NotificationList - error", () => {
  it("shows error message when isError is true", () => {
    mockIsError = true;

    render(<NotificationList />);

    expect(screen.getByText(/gagal memuat notifikasi/i)).toBeInTheDocument();
  });
});

describe("NotificationList - empty", () => {
  it("shows empty message when data is empty array", () => {
    mockData = [];

    render(<NotificationList />);

    expect(screen.getByText(/belum ada notifikasi/i)).toBeInTheDocument();
  });

  it("shows empty message when data is null", () => {
    mockData = null;

    render(<NotificationList />);

    expect(screen.getByText(/belum ada notifikasi/i)).toBeInTheDocument();
  });
});

describe("NotificationList - with data", () => {
  const fixtures = [
    {
      notificationId: "n1",
      title: "Panen Baru",
      description: "Laporan panen baru tersedia",
      timestamp: "2026-05-21T10:00:00.000Z",
      isRead: false,
    },
    {
      notificationId: "n2",
      title: "Pembayaran",
      description: "Gaji bulan ini sudah dibayar",
      timestamp: "2026-05-20T08:00:00.000Z",
      isRead: true,
    },
  ];

  it("renders notification titles", () => {
    mockData = fixtures;

    render(<NotificationList />);

    expect(screen.getByText("Panen Baru")).toBeInTheDocument();
    expect(screen.getByText("Pembayaran")).toBeInTheDocument();
  });

  it("shows unread count badge", () => {
    mockData = fixtures;

    render(<NotificationList />);

    expect(screen.getByText(/1 belum dibaca/i)).toBeInTheDocument();
  });

  it("shows all-read message when no unread", () => {
    mockData = [
      {
        notificationId: "n1",
        title: "Panen Baru",
        description: "Laporan panen",
        timestamp: "2026-05-21T10:00:00.000Z",
        isRead: true,
      },
    ];

    render(<NotificationList />);

    expect(
      screen.getByText(/semua notifikasi telah dibaca/i),
    ).toBeInTheDocument();
  });

  it("shows 'Tandai semua dibaca' button when unread exist", () => {
    mockData = fixtures;

    render(<NotificationList />);

    expect(
      screen.getByRole("button", { name: /tandai semua dibaca/i }),
    ).toBeInTheDocument();
  });
});
