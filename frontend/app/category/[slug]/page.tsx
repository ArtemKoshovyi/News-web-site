import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "./category.module.css";
import {
  assetUrl,
  getNewsByCategory,
  getCategoryBySlug,
  type NewsItem,
} from "@/lib/directus";

function formatUkDate(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getReadTime(content?: string | null) {
  if (!content) return "2 хв читання";

  const cleanText = content.replace(/<[^>]*>/g, " ").trim();
  const words = cleanText.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 220));

  return `${minutes} хв читання`;
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const slug = decodeURIComponent(resolvedParams.slug);

  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const news = await getNewsByCategory(slug);

  const sidebarItems =
    news.filter((item) => !!item.cover_image).slice(0, 5).length > 0
      ? news.filter((item) => !!item.cover_image).slice(0, 5)
      : news.slice(0, 5);

  return (
    <main className={styles.page}>
      {/* ── CATEGORY HERO ── */}
      <section className={styles.categoryHero}>
        <div className={styles.categoryHeroInner}>
          <Link href="/" className={styles.backLink}>
            ← На головну
          </Link>

          
          <h1 className={styles.categoryTitle}>{category.name}</h1>

          {category.description ? (
            <p className={styles.categoryDesc}>{category.description}</p>
          ) : (
            <p className={styles.categoryDesc}>
              Останні матеріали, аналітика та головні події в розділі “{category.name}”.
            </p>
          )}

          <div className={styles.categoryMeta}>
            <span>{news.length} матеріалів</span>
            <span className={styles.metaDivider} aria-hidden="true" />
            <span>Express News Україна</span>
          </div>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <section className={styles.contentShell}>
        <div className={styles.sectionHead}>
          <div className={styles.sectionHeadLeft}>
            <span className={styles.sectionLabel}>Новини</span>
            <h2 className={styles.sectionTitle}>Останнє в категорії</h2>
          </div>
        </div>

        <div className={styles.contentGrid}>
          <section className={styles.feed} aria-label={`Новини категорії ${category.name}`}>
            {news.length === 0 ? (
              <div className={styles.emptyState}>
                <h2>У цій категорії поки немає новин</h2>
                <p className={styles.emptyHint}>
                  Перевір у Directus: у новин має бути вибрана ця категорія і статус published.
                </p>
              </div>
            ) : (
              <div className={styles.list}>
                {news.map((item: NewsItem) => {
                  const dateLabel = formatUkDate(item.published_at);
                  const cover = item.cover_image ? assetUrl(item.cover_image) : "";

                  return (
                    <article key={item.id} className={styles.card}>
                      <div className={styles.cardBody}>
                        <div className={styles.cardTopline}>
                          {dateLabel ? (
                            <time className={styles.meta}>{dateLabel}</time>
                          ) : null}
                          <span className={styles.cardReadTime}>
                            {getReadTime(item.content)}
                          </span>
                        </div>

                        <h3 className={styles.title}>
                          <Link className={styles.titleLink} href={`/news/${item.slug}`}>
                            {item.title}
                          </Link>
                        </h3>

                        {item.excerpt ? (
                          <p className={styles.excerpt}>{item.excerpt}</p>
                        ) : null}

                        <Link className={styles.readMore} href={`/news/${item.slug}`}>
                          Читати матеріал
                          <svg
                            viewBox="0 0 12 12"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            aria-hidden="true"
                          >
                            <path d="M2 6h8M6 2l4 4-4 4" />
                          </svg>
                        </Link>
                      </div>

                      {cover ? (
                        <Link
                          href={`/news/${item.slug}`}
                          className={styles.cardMedia}
                          aria-label={item.title}
                        >
                          <img
                            className={styles.cardImg}
                            src={cover}
                            alt=""
                            loading="lazy"
                          />
                        </Link>
                      ) : (
                        <div className={styles.cardMedia} aria-hidden="true" />
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <aside className={styles.sidebar} aria-label="Важливо">
            <div className={styles.sidebarSection}>
              <h3 className={styles.sidebarTitle}>Важливо</h3>

              <div className={styles.featuredList}>
                {sidebarItems.map((item: NewsItem, index) => {
                  const dateLabel = formatUkDate(item.published_at);

                  return (
                    <Link
                      key={item.id}
                      className={styles.featuredItem}
                      href={`/news/${item.slug}`}
                    >
                      <span className={styles.featuredNum}>
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <div className={styles.featuredInfo}>
                        <span className={styles.featuredCat}>{category.name}</span>
                        <span className={styles.featuredTitle}>{item.title}</span>
                        {dateLabel ? (
                          <span className={styles.featuredDate}>{dateLabel}</span>
                        ) : null}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className={styles.newsletter}>
              <div className={styles.newsletterTitle}>Підпишіться на розсилку</div>
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
        </div>
      </section>
    </main>
  );
}
