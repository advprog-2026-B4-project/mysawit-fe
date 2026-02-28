# MySawit Frontend

Next.js web client for the MySawit palm oil estate management system. Provides role-specific dashboards for **Admin**, **Mandor**, **Buruh**, and **Supir**.

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI | React 19, Tailwind CSS 4 |
| Data Fetching | TanStack React Query v5 |
| HTTP Client | Axios |
| Testing | Vitest + Testing Library |
| Package Manager | pnpm |

---

## Project Structure

```
mysawit-fe/
└── src/
    ├── app/                        # Next.js App Router pages
    │   ├── layout.tsx              # Root layout (providers)
    │   ├── page.tsx                # Landing / login page
    │   ├── providers.tsx           # QueryClientProvider, etc.
    │   ├── admin/                  # Admin role pages
    │   │   ├── kebun/              # Plantation management
    │   │   ├── panen/              # Harvest approval
    │   │   ├── pembayaran/         # Payroll processing
    │   │   └── pengiriman/         # Delivery management
    │   ├── mandor/                 # Mandor role pages
    │   │   ├── panen/              # Record & manage harvests
    │   │   └── pengiriman/         # View delivery status
    │   ├── buruh/                  # Buruh (worker) role pages
    │   │   └── panen/              # View own harvest records
    │   └── supir/                  # Supir (driver) role pages
    │       └── pengiriman/         # Update delivery status
    ├── components/
    │   └── guards/                 # Route protection components
    ├── lib/
    │   └── api/
    │       ├── client.ts           # Axios singleton with interceptors
    │       ├── types.ts            # ApiResponse<T> + unwrapResponse()
    │       └── storageApi.ts       # File upload / storage API
    └── test/                       # Shared test utilities & setup
```

---

## Modules (by role)

### Admin
Full access to all management features:
- **Kebun** — create, edit, assign mandor to plantations
- **Panen** — approve or reject harvest records submitted by mandors
- **Pembayaran** — configure wage rates, trigger payroll, view payment history
- **Pengiriman** — create delivery orders, assign drivers, monitor status

### Mandor
Manages day-to-day field operations for assigned kebun:
- **Panen** — record new harvests, attach photos, view harvest history
- **Pengiriman** — view delivery orders linked to their kebun

### Buruh (Worker)
Read-only view of their personal records:
- **Panen** — view own assigned harvest sessions and earnings

### Supir (Driver)
Handles delivery logistics:
- **Pengiriman** — update delivery status, upload proof-of-delivery photos

---

## API Layer

### `lib/api/client.ts`
Singleton Axios instance. Automatically:
1. Attaches `Authorization: Bearer <token>` from `localStorage`.
2. Detects `ApiResponse<T>` shaped responses and **unwraps the `data` field** — individual API modules receive the inner payload directly.
3. Rejects the promise when `success: false`, so React Query's `onError` handlers work transparently.

### `lib/api/types.ts`
```ts
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: Record<string, string>;
  timestamp: string;
}

function unwrapResponse<T>(response: ApiResponse<T>): T
```

### `lib/api/storageApi.ts`
Uploads files via `multipart/form-data` to the backend `/api/storage/upload` endpoint. Returns `FileUploadResponse` containing `fileKey`, `publicUrl`, `fileName`, and `fileSize`.

---

## Environment Variables

Create `.env.local` in `mysawit-fe/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the MySawit backend API |

---

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm 9+

### Install Dependencies

```bash
# from mysawit-fe/
pnpm install
```

### Development Server

```bash
pnpm dev
```

Opens at **http://localhost:3000**.

### Production Build

```bash
pnpm build
pnpm start
```

---

## Testing

```bash
# Run all tests once
pnpm test

# Watch mode
pnpm test:watch

# With coverage report
pnpm test:coverage
```

Coverage report is generated at `coverage/lcov-report/index.html`.

Tests use **Vitest** with **@testing-library/react** and **jsdom** as the DOM environment.

---

## Linting

```bash
pnpm lint
```

Uses ESLint with `eslint-config-next`. Configuration is in `eslint.config.mjs`.

---

## Routing Conventions

Routes follow the Next.js App Router file convention:

```
app/<role>/<feature>/page.tsx      # List / dashboard page
app/<role>/<feature>/[id]/page.tsx # Detail page
app/<role>/<feature>/new/page.tsx  # Create form
```

Route protection is handled by guard components in `components/guards/`. Unauthenticated users are redirected to the login page; users accessing a route outside their role are redirected to their own dashboard.
