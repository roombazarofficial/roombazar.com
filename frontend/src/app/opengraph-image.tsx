import { ImageResponse } from "next/og";

export const alt = "RoomBazar — Rooms & Flats for Rent Direct From Owners";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          padding: "64px 72px",
          fontFamily: "sans-serif",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              backgroundColor: "#d13421",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            RB
          </div>
          <span style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.03em" }}>
            Room<span style={{ color: "#f87171" }}>Bazar</span>
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 900 }}>
          <div
            style={{
              fontSize: 54,
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              color: "#ffffff",
            }}
          >
            Find Rooms & Flats Direct From Owners
          </div>
          <div
            style={{
              fontSize: 26,
              color: "#94a3b8",
              lineHeight: 1.4,
              fontWeight: 400,
            }}
          >
            0% Brokerage · Verified Owners · Bengaluru, Noida, Delhi NCR & Top Cities
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(148, 163, 184, 0.2)",
            paddingTop: 24,
          }}
        >
          <div style={{ display: "flex", gap: 32 }}>
            <span style={{ fontSize: 20, color: "#cbd5e1" }}>✓ No Broker Fees</span>
            <span style={{ fontSize: 20, color: "#cbd5e1" }}>✓ Direct In-App Chat</span>
            <span style={{ fontSize: 20, color: "#cbd5e1" }}>✓ Verified Listings</span>
          </div>
          <span style={{ fontSize: 22, color: "#f87171", fontWeight: 600 }}>
            roombazar.com
          </span>
        </div>
      </div>
    ),
    size,
  );
}
