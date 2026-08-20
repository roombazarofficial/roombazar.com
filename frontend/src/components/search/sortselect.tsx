"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/select";
import type { SortOption } from "@/types/searchfilters";

const options: { value: SortOption; label: string }[] = [
  { value: "relevance", label: "Most relevant" },
  { value: "newest", label: "Newest first" },
  { value: "rentlow", label: "Rent: low to high" },
  { value: "renthigh", label: "Rent: high to low" },
];

export function SortSelect({ current }: { current: SortOption }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function change(value: string) {
    const next = new URLSearchParams(searchParams.toString());

    if (value === "relevance") {
      next.delete("sort");
    } else {
      next.set("sort", value);
    }
    next.delete("page");

    const query = next.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
  }

  return (
    <Select
      aria-label="Sort results"
      options={options}
      value={current}
      onChange={(event) => change(event.target.value)}
      className="h-10 w-48"
    />

  );
}
