import { notFound } from "next/navigation";
import { VideoModal } from "@/components/video-modal";
import { getFilmBySlug } from "@/lib/sanity/queries";

export default async function VideoModalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const film = await getFilmBySlug(slug);
  if (!film) notFound();

  return <VideoModal film={film} />;
}
