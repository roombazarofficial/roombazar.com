"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/emptystate";
import {
  createAmenity,
  createCity,
  createLocality,
  deleteAmenity,
  deleteCity,
  deleteLocality,
  getAmenities,
  getCities,
  getLocalities,
  updateAmenity,
  updateCity,
  updateLocality,
  type AdminAmenity,
  type AdminCity,
  type AdminLocality,
} from "@/lib/api/superadmin";

type Kind = "cities" | "localities" | "amenities";
type Row = AdminCity | AdminLocality | AdminAmenity;

const emptyCity = {
  name: "",
  slug: "",
  state: "",
  isActive: true,
  centroidLat: 0,
  centroidLng: 0,
};

const emptyLocality = {
  cityId: "",
  name: "",
  slug: "",
  aliases: [] as string[],
  centroidLat: 0,
  centroidLng: 0,
};

const emptyAmenity = {
  slug: "",
  label: "",
  category: "convenience" as AdminAmenity["category"],
};

/**
 * Reference data: cities, localities, amenities.
 *
 * These tables are read by search filters, the post wizard typeahead and every
 * locality landing page. Renaming a locality renames a place for everybody and
 * deleting one can orphan listings, which is why the delete confirmations here
 * say what will break rather than just asking twice.
 */
export function ReferenceDataTable({ kind }: { kind: Kind }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [cities, setCities] = useState<AdminCity[]>([]);
  const [cityId, setCityId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (kind === "cities") {
        const list = await getCities();
        setRows(list);
        setCities(list);
      } else if (kind === "amenities") {
        setRows(await getAmenities());
      } else {
        const list = await getCities();
        setCities(list);

        const active = cityId || list[0]?.id || "";
        setCityId(active);
        setRows(active ? await getLocalities(active) : []);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load");
    } finally {
      setLoading(false);
    }
  }, [cityId, kind]);

  useEffect(() => {
    void load();
  }, [load]);

  function openNew() {
    setForm(
      kind === "cities"
        ? { ...emptyCity }
        : kind === "localities"
          ? { ...emptyLocality, cityId }
          : { ...emptyAmenity },
    );
    setEditing("new");
  }

  function openEdit(row: Row) {
    setForm({ ...row });
    setEditing(row);
  }

  async function save() {
    setBusy(true);

    try {
      const isNew = editing === "new";
      const id = isNew ? null : (editing as Row).id;

      if (kind === "cities") {
        const body = form as unknown as AdminCity;
        await (isNew ? createCity(body) : updateCity(id!, body));
      } else if (kind === "localities") {
        const body = form as unknown as AdminLocality;
        await (isNew ? createLocality(body) : updateLocality(id!, body));
      } else {
        const body = form as unknown as AdminAmenity;
        await (isNew ? createAmenity(body) : updateAmenity(id!, body));
      }

      setEditing(null);
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!deleting) return;
    setBusy(true);

    try {
      if (kind === "cities") await deleteCity(deleting.id);
      else if (kind === "localities") await deleteLocality(deleting.id);
      else await deleteAmenity(deleting.id);

      setDeleting(null);
      await load();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? `${caught.message}. It may still be in use by listings.`
          : "Could not delete",
      );
      setBusy(false);
    } finally {
      setBusy(false);
    }
  }

  const label =
    kind === "cities" ? "city" : kind === "localities" ? "locality" : "amenity";

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        {kind === "localities" && cities.length > 0 && (
          <Select
            label="City"
            options={cities.map((c) => ({ value: c.id, label: c.name }))}
            value={cityId}
            onChange={(event) => setCityId(event.target.value)}
            className="w-56"
          />
        )}

        <Button className="ml-auto" onClick={openNew}>
          Add {label}
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-card border border-danger/20 bg-danger-soft p-3">
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : rows.length === 0 ? (
        <EmptyState
          title={`No ${label} records yet`}
          description={`Add the first ${label} to get started.`}
          action={<Button onClick={openNew}>Add {label}</Button>}
        />
      ) : (
        <div className="overflow-x-auto rounded-card border border-line bg-surface">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="border-b border-line text-left text-xs text-ink-muted">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Name</th>
                <th scope="col" className="px-4 py-3 font-medium">Slug</th>
                <th scope="col" className="px-4 py-3 font-medium">
                  {kind === "amenities" ? "Category" : kind === "cities" ? "State" : "Aliases"}
                </th>
                <th scope="col" className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-surface-muted">
                  <td className="px-4 py-3 font-medium text-ink">
                    {"label" in row ? row.label : row.name}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{row.slug}</td>
                  <td className="px-4 py-3 text-ink-muted">
                    {"category" in row
                      ? row.category
                      : "state" in row
                        ? row.state
                        : "aliases" in row && row.aliases.length > 0
                          ? row.aliases.join(", ")
                          : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(row)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-danger"
                        onClick={() => setDeleting(row)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? `Add ${label}` : `Edit ${label}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button loading={busy} onClick={() => void save()}>
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {kind === "amenities" ? (
            <>
              <Input
                label="Label"
                value={String(form.label ?? "")}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
              />
              <Input
                label="Slug"
                hint="Lowercase letters and numbers only."
                value={String(form.slug ?? "")}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
              <Select
                label="Category"
                options={[
                  { value: "utilities", label: "Utilities" },
                  { value: "convenience", label: "Convenience" },
                  { value: "safety", label: "Safety" },
                  { value: "rules", label: "House rules" },
                ]}
                value={String(form.category ?? "convenience")}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </>
          ) : (
            <>
              <Input
                label="Name"
                value={String(form.name ?? "")}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                label="Slug"
                hint="Lowercase letters, numbers and hyphens. Appears in the URL."
                value={String(form.slug ?? "")}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />

              {kind === "cities" ? (
                <Input
                  label="State"
                  value={String(form.state ?? "")}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                />
              ) : (
                <Input
                  label="Aliases"
                  hint="Comma separated. Without these, alternate spellings fragment search."
                  value={
                    Array.isArray(form.aliases)
                      ? (form.aliases as string[]).join(", ")
                      : ""
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      aliases: e.target.value
                        .split(",")
                        .map((a) => a.trim())
                        .filter(Boolean),
                    })
                  }
                />
              )}

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Latitude"
                  type="number"
                  value={String(form.centroidLat ?? 0)}
                  onChange={(e) =>
                    setForm({ ...form, centroidLat: Number(e.target.value) })
                  }
                />
                <Input
                  label="Longitude"
                  type="number"
                  value={String(form.centroidLng ?? 0)}
                  onChange={(e) =>
                    setForm({ ...form, centroidLng: Number(e.target.value) })
                  }
                />
              </div>
            </>
          )}
        </div>
      </Modal>

      <Modal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title={`Delete this ${label}?`}
        description={
          kind === "cities"
            ? "This fails if any localities or listings still reference the city — which is the safe outcome. Deactivate it instead if it has content."
            : kind === "localities"
              ? "Listings in this locality would lose their location. Move them first."
              : "Listings using this amenity lose it from their details."
        }
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button variant="danger" loading={busy} onClick={() => void remove()}>
              Delete
            </Button>
          </>
        }
      >
        {deleting && (
          <Badge tone="neutral">
            {"label" in deleting ? deleting.label : deleting.name}
          </Badge>
        )}
      </Modal>
    </div>
  );
}
