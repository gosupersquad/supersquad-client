import Link from "next/link";

export const metadata = {
  title: "SuperSquad",
  description:
    "Create and share experiences. SuperSquad helps hosts run events and get bookings.",
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 font-sans dark:bg-black">
      <main className="flex w-full max-w-md flex-col items-center gap-10 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          SuperSquad
        </h1>

        <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          Create and share experiences. Run events and get bookings.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/host/login"
            className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Host login
          </Link>
        </div>

        <footer className="mt-12 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/contact-us" className="hover:underline">
            Contact
          </Link>

          <Link href="/terms-and-conditions" className="hover:underline">
            Terms
          </Link>

          <Link href="/privacy-policy" className="hover:underline">
            Privacy
          </Link>
        </footer>
      </main>
    </div>
  );
}
