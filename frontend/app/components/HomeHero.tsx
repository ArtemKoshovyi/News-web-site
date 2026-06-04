"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { assetUrl, type NewsItem } from "../../lib/directus";
import styles from "./HomeHero.module.css";

const DATE_LOCALE = "uk-UA";

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(DATE_LOCALE, { day: "numeric", month: "long" });
}

type Props = {
  hero: NewsItem | null;
  topList: NewsItem[];
};

export default function HomeHero({ hero, topList }: Props) {
  const candidates = useMemo(() => {
    const list: NewsItem[] = [];
    if (hero) list.push(hero);
    for (const item of topList) {
      if (!list.some((x) => x.slug === item.slug)) list.push(item);
    }
    return list.filter((x) => !!x.cover_image);
  }, [hero, topList]);

  const [selectedSlug, setSelectedSlug] = useState(() => candidates[0]?.slug ?? "");

  const selected = useMemo(
    () => candidates.find((x) => x.slug === selectedSlug) ?? candidates[0] ?? null,
    [candidates, selectedSlug]
  );

  if (!selected) return null;

  const bg = selected.cover_image
    ? assetUrl(String(selected.cover_image), {
        width: 1800,
        quality: 72,
        fit: "cover",
      })
    : "";

  return (
    <section className={styles.hero} aria-label="Головна новина">
      {/* Background image */}
      <div className={styles.heroBg}>
        {bg && (
          <Image
            src={bg}
            alt={selected.title}
            fill
            priority
            className={styles.heroBgImg}
            sizes="100vw"
          />
        )}
      </div>

      {/* Overlays */}
      <div className={styles.heroShade} aria-hidden="true" />
      <div className={styles.heroShadeBottom} aria-hidden="true" />

      <div className={styles.heroInner}>
        {/* Left: main headline */}
        <div className={styles.heroMain}>
          <div className={styles.heroLabel}>
            <span className={styles.heroLabelDot} aria-hidden="true" />
            <span className={styles.heroLabelText}>
              Актуально зараз · {formatDate(selected.published_at)}
            </span>
          </div>

          <Link href={`/news/${selected.slug}`} className={styles.heroTitle}>
            {selected.title}
          </Link>

          <div className={styles.heroMeta}>
            <span className={styles.heroDate}>{formatDate(selected.published_at)}</span>
            <Link href={`/news/${selected.slug}`} className={styles.heroReadBtn}>
              Читати
              <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M2 6h8M6 2l4 4-4 4" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Right: news picker */}
        <div className={styles.heroPicker} aria-label="Топ новини">
          <div className={styles.pickerHeader}>
            <span className={styles.pickerTitle}>Топ новини</span>
            <span className={styles.pickerCount}>{Math.min(candidates.length, 6)} матеріалів</span>
          </div>

          <div className={styles.pickerList}>
            {candidates.slice(0, 6).map((item, i) => (
              <button
                key={item.id}
                type="button"
                className={`${styles.pickerItem} ${
                  item.slug === selected.slug ? styles.pickerItemActive : ""
                }`}
                onClick={() => setSelectedSlug(item.slug)}
              >
                <span className={styles.pickerNum}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className={styles.pickerInfo}>
                  <span className={styles.pickerItemTitle}>{item.title}</span>
                  <span className={styles.pickerItemDate}>
                    {formatDate(item.published_at)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
