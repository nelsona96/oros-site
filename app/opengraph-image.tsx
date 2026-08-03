import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getSiteSettings } from "@/lib/sanity/queries";
import { DEFAULT_DESCRIPTION } from "@/lib/metadata";

export const alt = "Oros Productions";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SAND_1 = "#111110";
const SAND_11 = "#b5b3ad";
const SAND_12 = "#eeeeec";
const GOLD_11 = "#cbb99f";
const AMBER_9 = "#ffc53d";

export default async function Image() {
  const [fraunces, settings] = await Promise.all([
    readFile(join(process.cwd(), "app/fonts/fraunces-og-600.ttf")),
    getSiteSettings(),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: SAND_1,
          padding: "80px",
        }}
      >
        <div
          style={{
            fontFamily: "Fraunces",
            fontSize: 20,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: GOLD_11,
          }}
        >
          Photography &amp; Film
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 760 }}>
            <div style={{ fontFamily: "Fraunces", fontSize: 92, color: SAND_12, lineHeight: 1.05 }}>
              Oros Productions
            </div>
            <div style={{ fontFamily: "Fraunces", fontSize: 28, color: SAND_11 }}>
              {settings?.tagline ?? DEFAULT_DESCRIPTION}
            </div>
          </div>

          <svg
            viewBox="0 0 48 32"
            width={260}
            height={173}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 28 L14 10 L20 18 L34 4 L46 28"
              stroke={AMBER_9}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Fraunces", data: fraunces, style: "normal", weight: 600 }],
    },
  );
}
