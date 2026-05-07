import Link from "next/link";
import { FaInstagram, FaFacebookF, FaYoutube, FaTelegramPlane } from "react-icons/fa";
import styles from "./page.module.css";
import Header from "./components/Header";
import HomeHero from "./components/HomeHero";
import { searchNews } from "@/lib/directus";
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

export default async function Home() {
  const [newsRaw, heroRaw, topNewsRaw, featuredRaw, categoriesRaw] = await Promise.all([
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
  const categories: Category[] = Array.isArray(categoriesRaw) ? categoriesRaw : [];

  return (
    <div className={styles.page}>

      {/* IMPORTANT: не передаємо functions в Client Component */}
      <HomeHero hero={hero} topList={topList} />

      <main className={styles.main}>
        <section className={styles.feed} aria-label="Останні новини">
          <h1 className={styles.sectionTitle}>Останнє</h1>

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
                    <div className={styles.meta}>{formatDate(item.published_at)}</div>

                    <h2 className={styles.title}>
                      <Link href={`/news/${item.slug}`} className={styles.titleLink}>
                        {item.title}
                      </Link>
                    </h2>

                    {item.excerpt ? <p className={styles.excerpt}>{item.excerpt}</p> : null}
                  </div>

                  {cover ? (
                    <div className={styles.cardMedia} aria-hidden="true">
                      <img src={cover} alt="" className={styles.cardImg} loading="lazy" />
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>

        <aside className={styles.sidebar} aria-label="Важливо">
          <h2 className={styles.sidebarTitle}>Важливо</h2>

          <div className={styles.featuredList}>
            {featured.map((item) => {
            const cover = item.cover_image
              ? assetUrl(item.cover_image, {
                  width: 420,
                  quality: 70,
                  fit: "cover",
                })
              : null;
              return (
                <Link key={item.id} href={`/news/${item.slug}`} className={styles.featuredItem}>
                  <div className={styles.featuredMedia}>
                    {cover ? (
                      <img src={cover} alt="" className={styles.featuredImg} loading="lazy" />
                    ) : null}

                    <div className={styles.featuredOverlay}>
                      <div className={styles.featuredTime}>{formatDate(item.published_at)}</div>
                      <div className={styles.featuredTitle}>{item.title}</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </aside>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div>
            <div className={styles.footerBrand}>Express News Україна</div>
            <div className={styles.footerNote}>
              © {new Date().getFullYear()} — всі права захищено
            </div>
          </div>

          <div className={styles.footerRight}>
            <div className={styles.footerLabel}>Ми в соцмережах</div>
            <div className={styles.socials}>
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
                href="https://t.me/espressnews"
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
      </footer>
    </div>
  );
}