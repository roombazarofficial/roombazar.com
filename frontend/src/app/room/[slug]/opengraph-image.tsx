import { ImageResponse } from "next/og";
import { getListingBySlug } from "@/lib/api/listings";
import { roomTypeLabels } from "@/lib/constants/roomtypes";

export const alt = "Room listing on RoomBazar";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: { slug: string };
}) {
  const listing = await getListingBySlug(params.slug);

  if (!listing) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#ffffff",
            fontSize: 56,
            fontWeight: 600,
            color: "#101828",
          }}
        >
          RoomBazar
        </div>

      ),
      size,
    );
  }

  const rent = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(listing.rentPaise / 100);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          padding: 64,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", gap: 12 }}>
            <span
              style={{
                background: "#ecfdf3",
                color: "#067647",
                padding: "8px 18px",
                borderRadius: 999,
                fontSize: 24,
                fontWeight: 600,
              }}
            >
              {listing.postedBy === "agent" ? "Agent" : "Owner"}
            </span>

            <span
              style={{
                background: "#eef0f4",
                color: "#667085",
                padding: "8px 18px",
                borderRadius: 999,
                fontSize: 24,
                fontWeight: 600,
              }}
            >
              {roomTypeLabels[listing.roomType]}
            </span>

          </div>

          <div
            style={{
              fontSize: 84,
              fontWeight: 700,
              color: "#101828",
              lineHeight: 1.05,
            }}
          >
            {rent}
            <span style={{ fontSize: 40, fontWeight: 400, color: "#667085" }}>
              /month

            </span>

          </div>

          <div style={{ fontSize: 38, color: "#344054", lineHeight: 1.25 }}>
            {listing.title.slice(0, 70)}
          </div>

          <div style={{ fontSize: 32, color: "#667085" }}>
            {listing.locality.name}, {listing.city.name}
          </div>

        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "2px solid #e4e7ec",
            paddingTop: 28,
          }}
        >
          <div style={{ fontSize: 34, fontWeight: 700, color: "#101828" }}>
            Room<span style={{ color: "#2551eb" }}>Bazar</span>

          </div>

          <div style={{ fontSize: 26, color: "#667085" }}>
            No broker fees · No commission
          </div>

        </div>

      </div>

    ),
    size,
  );
}
