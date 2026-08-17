import Link from "next/link";

export default function NotFound() {
  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">This room is no longer listed</h1>
      <Link href="/rooms">Browse similar rooms</Link>
    </main>
  );
}
