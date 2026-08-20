import Link from "next/link";

export default function NotFound() {
  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">Page not found</h1>

      <Link href="/">Go home</Link>

    </main>

  );
}
