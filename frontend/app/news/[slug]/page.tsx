import Link from "next/link";
import Image from "next/image";
import styles from "./news.module.css";
import { assetUrl, getNewsBySlug } from "../../../lib/directus";

function formatDate(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug
    ? decodeURIComponent(resolvedParams.slug)
    : null;

  if (!slug) {
    return (
      <main className={styles.page}>
        <section className={styles.stateBox}>
          <Link href="/" className={styles.backLink}>
            ← На головну
          </Link>
          <h1 className={styles.stateTitle}>Адресу новини не вказано</h1>
          <p className={styles.stateText}>
            Сторінку неможливо відкрити, тому що в URL немає slug новини.
          </p>
        </section>
      </main>
    );
  }

  const item = await getNewsBySlug(slug);

  if (!item) {
    return (
      <main className={styles.page}>
        <section className={styles.stateBox}>
          <Link href="/" className={styles.backLink}>
            ← На головну
          </Link>
          <h1 className={styles.stateTitle}>Новину не знайдено</h1>
          <p className={styles.stateText}>
            Запитувана сторінка “{slug}” відсутня або була видалена.
          </p>
        </section>
      </main>
    );
  }

  const heroImg = item.cover_image
    ? assetUrl(item.cover_image, { width: 1800, quality: 72, fit: "cover" })
    : "";
  const coverImg = item.cover_image
    ? assetUrl(item.cover_image, { width: 1200, quality: 75, fit: "cover" })
    : "";
  const categoryName = item.category?.name ?? "Новини";
  const date = formatDate(item.published_at);

  return (
    <main className={styles.page}>
      {/* ── ARTICLE HERO ── */}
      <section className={styles.hero}>
        {heroImg && (
          <div className={styles.heroBg} aria-hidden="true">
            <Image
              src={heroImg}
              alt=""
              fill
              priority
              className={styles.heroBgImg}
              sizes="100vw"
            />
          </div>
        )}

        <div className={styles.heroShade} aria-hidden="true" />
        <div className={styles.heroShadeBottom} aria-hidden="true" />

        <div className={styles.heroInner}>
          <Link href="/" className={styles.backLinkHero}>
            ← На головну
          </Link>

          
          <h1 className={styles.title}>{item.title}</h1>

          <div className={styles.metaRow}>
            {date && <time className={styles.date}>{date}</time>}
            <span className={styles.metaDivider} aria-hidden="true" />
            <span className={styles.source}>Express News Україна</span>
          </div>
        </div>
      </section>

      {/* ── ARTICLE BODY ── */}
      <section className={styles.articleShell}>
        <article className={styles.article}>
          {coverImg && (
            <figure className={styles.coverWrap}>
              <Image
                className={styles.cover}
                src={coverImg}
                alt={item.title ?? ""}
                width={1200}
                height={720}
                sizes="(max-width: 900px) 100vw, 760px"
                priority
              />
            </figure>
          )}

          {item.excerpt && (
            <p className={styles.excerpt}>{item.excerpt}</p>
          )}

          <div className={styles.divider} />

          <div
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: item.content ?? "" }}
          />
        </article>

        <aside className={styles.sidebar} aria-label="Інформація про матеріал">
          <div className={styles.sideCard}>
            <div className={styles.sideLabel}>Матеріал</div>

            <dl className={styles.infoList}>
              <div className={styles.infoItem}>
                <dt>Категорія</dt>
                <dd>{categoryName}</dd>
              </div>

              {date && (
                <div className={styles.infoItem}>
                  <dt>Опубліковано</dt>
                  <dd>{date}</dd>
                </div>
              )}

              <div className={styles.infoItem}>
                <dt>Видання</dt>
                <dd>Express News</dd>
              </div>
            </dl>
          </div>

          <div className={styles.facebookBox}>
            <div className={styles.facebookTitle}>
              Підпишіться на нас у Facebook
            </div>
            <p className={styles.facebookText}>
              Слідкуйте за новинами, оновленнями та важливими матеріалами на нашій сторінці.
            </p>
            <a
              href="https://www.facebook.com/share/1J5z7rhvJu/"
              target="_blank"
              rel="noreferrer"
              className={styles.facebookBtn}
            >
              Перейти у Facebook →
            </a>
          </div>
        </aside>
      </section>
    </main>
  );
}
