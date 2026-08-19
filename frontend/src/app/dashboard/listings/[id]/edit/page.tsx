import { notFound } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { mockListings } from "@/lib/api/mockdata";

type Params = Promise<{ id: string }>;

/**
 * Editing is a single form rather than the eight-step wizard. The wizard
 * exists to get a first listing finished quickly; someone correcting a rent
 * figure should not have to walk through eight screens to do it.
 */
export default async function Page({ params }: { params: Params }) {
  const { id } = await params;
  const listing = mockListings.find((item) => item.id === id);
  if (!listing) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        Edit listing
      </h1>

      <form className="mt-6 space-y-5">
        <Input label="Title" defaultValue={listing.title} />

        <Textarea
          label="Description"
          defaultValue={listing.description}
          maxLength={1500}
          showCount
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Monthly rent"
            type="number"
            prefix="₹"
            defaultValue={listing.rentPaise / 100}
          />
          <Input
            label="Deposit"
            type="number"
            prefix="₹"
            defaultValue={listing.depositPaise / 100}
          />
        </div>

        <Input
          label="Available from"
          type="date"
          defaultValue={listing.availableFrom.slice(0, 10)}
        />

        <div className="flex gap-2">
          <Button>Save changes</Button>
          <Button variant="ghost">Cancel</Button>
        </div>
      </form>
    </div>
  );
}
