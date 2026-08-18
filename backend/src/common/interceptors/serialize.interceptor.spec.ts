import { of } from "rxjs";
import { SerializeInterceptor } from "./serialize.interceptor";
import type { CallHandler, ExecutionContext } from "@nestjs/common";

function run(payload: unknown): Promise<unknown> {
  const interceptor = new SerializeInterceptor();
  const handler: CallHandler = { handle: () => of(payload) };

  return new Promise((resolve) => {
    interceptor
      .intercept({} as ExecutionContext, handler)
      .subscribe((value) => resolve(value));
  });
}

describe("SerializeInterceptor", () => {
  it("strips private keys from a flat object", async () => {
    const result = (await run({
      id: "u1",
      name: "Priya",
      phone: "9876543210",
      passwordHash: "scrypt$secret",
    })) as Record<string, unknown>;

    expect(result.name).toBe("Priya");
    expect(result).not.toHaveProperty("phone");
    expect(result).not.toHaveProperty("passwordHash");
  });

  it("strips them at depth, not just at the top level", async () => {
    const result = (await run({
      listing: {
        title: "A room",
        addressLine: "12 Main Road",
        lat: 12.9,
        lng: 77.6,
        lister: { name: "Priya", phone: "9876543210" },
      },
    })) as { listing: Record<string, unknown> };

    expect(result.listing).not.toHaveProperty("addressLine");
    expect(result.listing).not.toHaveProperty("lat");
    expect(
      (result.listing.lister as Record<string, unknown>),
    ).not.toHaveProperty("phone");
  });

  it("strips through arrays", async () => {
    const result = (await run([
      { id: "1", phone: "9876543210" },
      { id: "2", phone: "9876543211" },
    ])) as Record<string, unknown>[];

    for (const row of result) {
      expect(row).not.toHaveProperty("phone");
    }
  });

  it("unwraps an explicitly public field", async () => {
    const result = (await run({ publicPhone: "9876543210" })) as Record<
      string,
      unknown
    >;

    expect(result.phone).toBe("9876543210");
    expect(result).not.toHaveProperty("publicPhone");
  });

  it("unwraps a multi-word public field", async () => {
    const result = (await run({ publicApproximateLat: 12.935 })) as Record<
      string,
      unknown
    >;

    expect(result.approximateLat).toBe(12.935);
  });

  it("replaces the raw message body with the public one", async () => {
    const result = (await run({
      id: "m1",
      body: "call me on 9876543210",
      publicBody: "call me on [contact hidden]",
    })) as Record<string, unknown>;

    expect(result.body).toBe("call me on [contact hidden]");
    expect(result.body).not.toContain("9876543210");
    expect(result).not.toHaveProperty("publicBody");
  });

  it("drops the body entirely when no public version is supplied", async () => {
    const result = (await run({
      id: "m1",
      body: "call me on 9876543210",
    })) as Record<string, unknown>;

    expect(result).not.toHaveProperty("body");
  });

  it("leaves primitives and nulls alone", async () => {
    await expect(run(null)).resolves.toBeNull();
    await expect(run(42)).resolves.toBe(42);
    await expect(run("ok")).resolves.toBe("ok");
  });

  it("does not mangle a Date", async () => {
    const date = new Date("2026-08-17T00:00:00.000Z");
    const result = (await run({ createdAt: date })) as { createdAt: Date };

    expect(result.createdAt).toBeInstanceOf(Date);
  });
});
