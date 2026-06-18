import { ImageResponse } from "next/og";

export const runtime = "edge";

/** Dynamic OG image: page title + subtitle + wikipie mark (§6). */
export function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") ?? "wikipie").slice(0, 80);
  const subtitle = (searchParams.get("subtitle") ?? "").slice(0, 120);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "#0A0A0A",
          color: "#FAFAFA",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "#4F46E5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            W
          </div>
          <div style={{ fontSize: 28, fontWeight: 600 }}>wikipie</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.02em" }}>{title}</div>
          {subtitle && (
            <div style={{ marginTop: 20, fontSize: 30, color: "#A3A3A3", lineHeight: 1.4 }}>{subtitle}</div>
          )}
        </div>

        <div style={{ height: 6, width: 120, borderRadius: 3, background: "#4F46E5" }} />
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
