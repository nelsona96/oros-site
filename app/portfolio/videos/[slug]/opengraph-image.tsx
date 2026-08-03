import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getFilmBySlug } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import { categoryLabel } from "@/lib/film";

export const alt = "Oros Productions — film";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SAND_1 = "#111110";
const SAND_12 = "#eeeeec";
const GOLD_11 = "#cbb99f";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [fraunces, film] = await Promise.all([
    readFile(join(process.cwd(), "app/fonts/fraunces-og-600.ttf")),
    getFilmBySlug(slug),
  ]);

  const thumbnailUrl = film?.thumbnail ? urlFor(film.thumbnail).width(1200).quality(80).url() : undefined;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          background: SAND_1,
          position: "relative",
        }}
      >
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt=""
            width={1200}
            height={630}
            style={{ position: "absolute", inset: 0, objectFit: "cover" }}
          />
        ) : null}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(0deg, #111110 15%, rgba(17,17,16,0.15) 65%)",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "80px" }}>
          <div
            style={{
              fontFamily: "Fraunces",
              fontSize: 20,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: GOLD_11,
            }}
          >
            {film ? categoryLabel(film.category) : "Oros Productions"}
          </div>
          <div style={{ fontFamily: "Fraunces", fontSize: 72, color: SAND_12, lineHeight: 1.1 }}>
            {film?.title ?? "Oros Productions"}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Fraunces", data: fraunces, style: "normal", weight: 600 }],
    },
  );
}
