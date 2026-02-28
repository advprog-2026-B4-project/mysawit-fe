# MySawit Frontend - Agent Rulebook

## Architecture: Module-Sliced Design

```
src/
  app/              -- Next.js App Router pages (thin route shells only)
    providers.tsx   -- Global QueryClientProvider + auth context
  modules/
    [module]/
      api/          -- [module]Api.ts: TypeScript interfaces/types + Axios stub functions
      hooks/        -- TanStack Query hooks (useQuery / useMutation wrappers)
      components/   -- UI components scoped to this module
      types/        -- Additional complex types if needed
  lib/
    api/
      client.ts     -- Singleton Axios instance with JWT interceptors
  components/       -- Truly shared/global components only
```

## Mandatory Rules

### API Layer (3-Layer Strict)
1. **`src/lib/api/client.ts`** - Base Axios instance: sets `baseURL`, attaches `Authorization: Bearer <token>` header via request interceptor, handles 401 refresh/logout via response interceptor.
2. **`src/modules/[module]/api/[module]Api.ts`** - Module API: raw Axios calls using the base client. Exports a plain object (NOT a hook). No React/TanStack Query imports here.
3. **`src/modules/[module]/hooks/use[Module].ts`** - TanStack Query hook: wraps module API in `useQuery` / `useMutation`. This is the ONLY layer components may call.
4. **Component** - Calls the hook. Zero direct Axios usage.

### State Management
- ALL async server state: **`@tanstack/react-query`** (`useQuery`, `useMutation`, `useInfiniteQuery`).
- NO `useEffect` + `useState` for data fetching.
- Client-only global state (e.g., auth token): React Context or Zustand.

### RBAC + JWT
- Role extracted from JWT payload (`role` claim: `ADMIN | MANDOR | BURUH | SUPIR`).
- `src/components/guards/` contains route guard components (`<AdminGuard>`, `<BuruhGuard>`, etc.).
- Redirect unauthorized users to `/` from guards.

### Testing
- **MSW (Mock Service Worker)** for all API mocking in tests.
- Target **75% line coverage** (enforced by Vitest coverage config).
- Test hooks with `@testing-library/react`'s `renderHook` + a `QueryClient` wrapper.
- NEVER mock `axios` directly; always mock via MSW handlers.

### API Response Wrapper
- Backend returns all responses wrapped in `ApiResponse<T>` with fields: `success`, `message`, `data`, `error`, `timestamp`.
- The Axios response interceptor in `src/lib/api/client.ts` automatically unwraps successful responses.
- Module API functions receive unwrapped `data` directly; no manual unwrapping needed.
- Failed responses (success: false) are automatically rejected as errors with the message from the wrapper.
- TypeScript interface available at `src/lib/api/types.ts` for type-safe wrapper handling.

### SOLID Principles (MANDATORY)
ALL code must strictly adhere to SOLID principles:

- **S - Single Responsibility Principle**: Each module/component has ONE reason to change. API layer only handles HTTP; hooks only manage React Query state; components only render UI.
- **O - Open/Closed Principle**: Extend behavior via composition and custom hooks, NOT modification. Use compound components and render props for flexibility.
- **L - Liskov Substitution Principle**: Component props and hook interfaces must be consistent. Polymorphic components (e.g., `<Button as="a">`) must maintain the same behavioral contract.
- **I - Interface Segregation Principle**: Component props should be minimal and focused. Split large prop interfaces into smaller, cohesive ones. Use TypeScript discriminated unions for variant props.
- **D - Dependency Inversion Principle**: Components depend on hook abstractions, NOT direct API calls. Hooks depend on API layer abstractions, NOT Axios directly. Always inject dependencies via props or context, not hard imports.

### Code Style
- All new code in **TypeScript** (strict mode, no `any` unless explicitly justified with a comment).
- DTOs from backend map 1-to-1 to TypeScript interfaces in the module's `api/` file.
- Dates from API are `string` (ISO 8601); parse to `Date` objects only when rendering.

### Strictly Forbidden
- Direct `axios.get(...)` calls inside components or pages.
- `useEffect` for data fetching.
- Importing from another module's `api/` or `hooks/` directory (cross-module: go through a shared service or event bus pattern).
- Storing JWT in `localStorage`; use `httpOnly` cookies or in-memory + refresh token rotation.
- Violating any SOLID principle (will be caught in code review).
