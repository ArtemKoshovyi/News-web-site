import Link from "next/link";
import {
  FaInstagram,
  FaFacebookF,
  FaYoutube,
  FaTelegramPlane,
} from "react-icons/fa";
import styles from "./page.module.css";
import HomeHero from "./components/HomeHero";
import {
  getNewsList,
  getFeaturedNews,
  getCategories,
  getHeroNews,
  getTopNews,
  assetUrl,
  type NewsItem,
  type Category,
} from "../lib/directus";

const DATE_LOCALE = "uk-UA";

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(DATE_LOCALE, { day: "numeric", month: "long" });
}

function categoryHref(cat: Category) {
  return cat.slug ? `/category/${cat.slug}` : `/category/${cat.id}`;
}

// Ticker headlines — can be replaced with a real API call later
const TICKER_ITEMS = [
  "Верховна Рада проголосувала за новий закон",
  "НБУ підвищив облікову ставку",
  "Ситуація на фронті залишається напруженою",
  "Президент підписав указ про нагороди",
  "Економіка зросла на 3.2% у першому кварталі",
];

export default async function Home() {
  const [newsRaw, heroRaw, topNewsRaw, featuredRaw, categoriesRaw] =
    await Promise.all([
      getNewsList(),
      getHeroNews(),
      getTopNews(),
      getFeaturedNews(),
      getCategories(),
    ]);

  const news: NewsItem[] = Array.isArray(newsRaw) ? newsRaw : [];
  const hero = heroRaw ?? null;
  const topList: NewsItem[] = Array.isArray(topNewsRaw) ? topNewsRaw : [];
  const featured: NewsItem[] = Array.isArray(featuredRaw) ? featuredRaw : [];
  const categories: Category[] = Array.isArray(categoriesRaw)
    ? categoriesRaw
    : [];

  // Duplicate ticker items for seamless loop
  const tickerItems = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className={styles.page}>

      {/* Hero */}
      <HomeHero hero={hero} topList={topList} />

      {/* Ticker */}
      <div className={styles.ticker} aria-label="Стрічка новин" aria-live="off">
        <div className={styles.tickerLabel}>
          <span className={styles.tickerDot} aria-hidden="true" />
          Останнє
        </div>
        <div className={styles.tickerTrack}>
          <div className={styles.tickerContent}>
            {tickerItems.map((item, i) => (
              <span key={i} className={styles.tickerItem}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className={styles.main}>
        {/* Section header */}
        <div className={styles.sectionHead}>
          <div className={styles.sectionHeadLeft}>
            <span className={styles.sectionLabel}>Новини</span>
            <h1 className={styles.sectionTitle}>Останнє</h1>
          </div>
          <Link href="/archive" className={styles.sectionLink}>
            Всі матеріали
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M2 6h8M6 2l4 4-4 4" />
            </svg>
          </Link>
        </div>

        <div className={styles.contentGrid}>
          {/* ── ARTICLES FEED ── */}
          <section className={styles.feed} aria-label="Список новин">
            <div className={styles.list}>
              {news.map((item) => {
                const cover = item.cover_image
                  ? assetUrl(item.cover_image, {
                      width: 500,
                      quality: 70,
                      fit: "cover",
                    })
                  : null;

                return (
                  <article key={item.id} className={styles.card}>
                    <div className={styles.cardBody}>
                      {/* Category */}
                      {item.category?.name && (
                        <Link
                          href={item.category ? categoryHref(item.category) : "#"}
                          className={styles.meta}
                        >
                          {item.category.name}
                        </Link>
                      )}

                      {/* Title */}
                      <h2 className={styles.title}>
                        <Link
                          href={`/news/${item.slug}`}
                          className={styles.titleLink}
                        >
                          {item.title}
                        </Link>
                      </h2>

                      {/* Excerpt */}
                      {item.excerpt && (
                        <p className={styles.excerpt}>{item.excerpt}</p>
                      )}

                      {/* Meta */}
                      <div className={styles.cardFooter}>
                        <span className={styles.cardDate}>
                          {formatDate(item.published_at)}
                        </span>
                      </div>
                    </div>

                    {/* Image */}
                    {cover && (
                      <div className={styles.cardMedia} aria-hidden="true">
                        <img
                          src={cover}
                          alt=""
                          className={styles.cardImg}
                          loading="lazy"
                        />
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>

          {/* ── SIDEBAR ── */}
          <aside className={styles.sidebar} aria-label="Важливо">
            {/* Featured numbered list */}
            <div className={styles.sidebarSection}>
              <h2 className={styles.sidebarTitle}>Важливо</h2>
              <div className={styles.featuredList}>
                {featured.map((item, i) => (
                  <Link
                    key={item.id}
                    href={`/news/${item.slug}`}
                    className={styles.featuredItem}
                  >
                    <span className={styles.featuredNum}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className={styles.featuredInfo}>
                      {item.category?.name && (
                        <span className={styles.featuredCat}>
                          {item.category.name}
                        </span>
                      )}
                      <div className={styles.featuredTitle}>{item.title}</div>
                      <span className={styles.featuredDate}>
                        {formatDate(item.published_at)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className={styles.sidebarSection}>
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
            </div>
          </aside>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <span className={styles.footerBrandName}>Express News</span>
            <span className={styles.footerNote}>
              © {new Date().getFullYear()} — всі права захищено
            </span>
          </div>

          <div className={styles.footerCenter}>
            <Link href="/about" className={styles.footerLink}>Про нас</Link>
            <Link href="/team" className={styles.footerLink}>Редакція</Link>
            <Link href="/ads" className={styles.footerLink}>Реклама</Link>
            <Link href="/contacts" className={styles.footerLink}>Контакти</Link>
            <Link href="/privacy" className={styles.footerLink}>Правила</Link>
          </div>

          <div className={styles.footerRight}>
            <div className={styles.footerSocials}>
              <a
                href="https://www.instagram.com/espress_news_che/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className={styles.socialLink}
              >
                <FaInstagram />
              </a>
              <a
                href="https://www.facebook.com/share/1J5z7rhvJu/"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className={styles.socialLink}
              >
                <FaFacebookF />
              </a>
              <a
                href="https://youtube.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className={styles.socialLink}
              >
                <FaYoutube />
              </a>
              <a
                href="https://t.me/exspress_news"
                target="_blank"
                rel="noreferrer"
                aria-label="Telegram"
                className={styles.socialLink}
              >
                <FaTelegramPlane />
              </a>
            </div>
          </div>
        </div>

        <div className={styles.footerDivider} />

        <div className={styles.footerBottom}>
          <span>Express News Україна — незалежне медіа</span>
          <span>Розроблено з ♥ в Черкасах</span>
        </div>
      </footer>
    </div>
  );
}
