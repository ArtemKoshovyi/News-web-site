import Link from "next/link";
import styles from "./events.module.css";
import { getEvents, getAssetUrl } from "@/lib/directus";

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <main className={styles.container}>
      <h1 className={styles.h1}>Заходи</h1>

      {events.length === 0 ? (
        <div className={styles.empty}>Поки що немає опублікованих заходів</div>
      ) : (
        <div className={styles.list}>
          {events.map((e) => {
            const cover = getAssetUrl(e.cover_image);
            return (
              <Link key={e.id} href={`/events/${e.slug}`} className={styles.card}>
                <div className={styles.cardBody}>
                  <div className={styles.meta}>
                    {e.starts_at ? new Date(e.starts_at).toLocaleDateString("uk-UA") : ""}
                  </div>
                  <div className={styles.title}>{e.title}</div>
                </div>

                {cover ? (
                  <div className={styles.media}>
                    {/* звичайний img ок для початку */}
                    <img src={cover} alt="" className={styles.img} />
                  </div>
                ) : null}
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}