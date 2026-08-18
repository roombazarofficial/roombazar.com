"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">Something went wrong</h1>

      <button onClick={reset}>Try again</button>

    </main>

  );
}
