import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-16 font-sans dark:bg-zinc-950">
      <main className="w-full max-w-xl rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm sm:p-10 dark:border-emerald-900 dark:bg-zinc-900">
        <div className="mx-auto flex flex-col items-center">
          <span className="inline-flex items-center rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
            MySawit
          </span>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-100">
            In Development
          </h1>

          <p className="mt-4 text-base leading-7 text-zinc-600 dark:text-zinc-300">
            We are still building this space with care.
          </p>

          <p className="mt-3 max-w-md text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            A simpler way to manage plantation work, track progress, and stay
            connected with your team is coming soon.
          </p>

          <p className="mt-7 inline-flex items-center rounded-full border border-emerald-300 px-4 py-2 text-sm font-medium text-emerald-700 dark:border-emerald-800 dark:text-emerald-300">
            Thank you for waiting with us.
          </p>

          <Link
            href="/health"
            className="mt-8 text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 underline"
          >
            System Status
          </Link>
        </div>
      </main>
    </div>
  );
}
