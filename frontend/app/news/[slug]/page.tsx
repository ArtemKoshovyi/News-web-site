import Link from "next/link";
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

  const img = item.cover_image ? assetUrl(item.cover_image) : "";
  const categoryName = item.category?.name ?? "Новини";
  const date = formatDate(item.published_at);

  return (
    <main className={styles.page}>
      {/* ── ARTICLE HERO ── */}
      <section className={styles.hero}>
        {img && (
          <div className={styles.heroBg} aria-hidden="true">
            <img src={img} alt="" className={styles.heroBgImg} />
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
          {img && (
            <figure className={styles.coverWrap}>
              <img className={styles.cover} src={img} alt={item.title ?? ""} />
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

          <div className={styles.newsletter}>
            <div className={styles.newsletterTitle}>
              Підпишіться на розсилку
            </div>
            <p className={styles.newsletterText}>
              Найважливіше за день — прямо на вашу пошту. Без спаму.
            </p>
            <input
              className={styles.newsletterInput}
              type="email"
              placeholder="ваш@email.com"
              aria-label="Email для підписки"
            />
            <button type="button" className={styles.newsletterBtn}>
              Підписатись →
            </button>
          </div>
        </aside>
      </section>
    </main>
  );
}
