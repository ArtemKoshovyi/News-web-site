import Link from "next/link";
import styles from "./search.module.css";
import { searchNews } from "@/lib/directus";

type Props = {
  searchParams?: { q?: string } | Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const sp = await Promise.resolve(searchParams);
  const q = (sp?.q ?? "").trim();
  const results = q ? await searchNews(q) : [];

  return (
    <main className={styles.page}>
      <section className={styles.searchHero}>
        <div className={styles.heroInner}>
          <Link href="/" className={styles.backLink}>
            ← На головну
          </Link>

      
          <h1 className={styles.title}>Пошук новин</h1>

          <p className={styles.description}>
            Знайдіть матеріали за ключовими словами, темами або подіями.
          </p>

          <form action="/search" method="GET" className={styles.form}>
            <input
              name="q"
              defaultValue={q}
              placeholder="Введи запит, наприклад: Одеса"
              className={styles.input}
            />

            <button type="submit" className={styles.button}>
              Шукати
            </button>
          </form>
        </div>
      </section>

      <section className={styles.resultsShell}>
        <div className={styles.sectionHead}>
          <div className={styles.sectionHeadLeft}>
            <span className={styles.sectionLabel}>Результати</span>
            <h2 className={styles.sectionTitle}>
              {q ? `За запитом “${q}”` : "Введіть запит"}
            </h2>
          </div>

          {q && (
            <span className={styles.count}>
              {results.length} матеріалів
            </span>
          )}
        </div>

        {!q && (
          <div className={styles.emptyState}>
            <h2>Почніть пошук</h2>
            <p>Введіть слово або фразу у поле вище, щоб знайти новини.</p>
          </div>
        )}

        {q && results.length === 0 && (
          <div className={styles.emptyState}>
            <h2>Нічого не знайдено</h2>
            <p>За запитом “{q}” немає результатів. Спробуйте інші слова.</p>
          </div>
        )}

        {results.length > 0 && (
          <div className={styles.list}>
            {results.map((item) => (
              <article key={item.id} className={styles.card}>
                <div className={styles.cardBody}>
                  <span className={styles.meta}>Express News</span>

                  <h3 className={styles.cardTitle}>
                    <Link href={`/news/${item.slug}`} className={styles.cardLink}>
                      {item.title}
                    </Link>
                  </h3>

                  {item.excerpt && (
                    <p className={styles.excerpt}>{item.excerpt}</p>
                  )}

                  <Link href={`/news/${item.slug}`} className={styles.readMore}>
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
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
