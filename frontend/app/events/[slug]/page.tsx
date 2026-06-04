import { notFound } from "next/navigation";
import styles from "./event.module.css";
import { getEventBySlug, getAssetUrl } from "@/lib/directus";

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const cover = getAssetUrl(event.cover_image);

  const mapSrc =
    event.latitude != null && event.longitude != null
      ? `https://maps.google.com/maps?q=${event.latitude},${event.longitude}&z=15&output=embed`
      : null;

  return (
    <main className={styles.container}>
      <div className={styles.meta}>
        {event.starts_at ? new Date(event.starts_at).toLocaleString("uk-UA") : ""}
      </div>

      <h1 className={styles.h1}>{event.title}</h1>

      {cover ? <img src={cover} alt="" className={styles.cover} /> : null}

      <div
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: event.content ?? "" }}
      />

      {mapSrc ? (
        <div className={styles.mapWrap}>
          <iframe
            src={mapSrc}
            width="100%"
            height="320"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
          />
        </div>
      ) : null}
    </main>
  );
}