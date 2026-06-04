"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  FaInstagram,
  FaFacebookF,
  FaYoutube,
  FaTelegramPlane,
} from "react-icons/fa";
import { FiSearch, FiX, FiMoon, FiSun } from "react-icons/fi";
import styles from "./Header.module.css";
import type { Category } from "../../lib/directus";

function categoryHref(cat: Category) {
  const rawSlug = cat.slug ? String(cat.slug).trim() : String(cat.id);
  return `/category/${encodeURIComponent(rawSlug.toLocaleLowerCase("uk-UA"))}`;
}

type Props = {
  categories?: Category[];
};

export default function Header({ categories = [] }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const currentTheme = savedTheme === "dark" ? "dark" : "light";

    setTheme(currentTheme);
    document.documentElement.dataset.theme = currentTheme;

    if (savedTheme !== "dark" && savedTheme !== "light") {
      localStorage.setItem("theme", "light");
    }
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
  }

  const categoriesForNav = useMemo(
    () => (Array.isArray(categories) ? categories : []),
    [categories]
  );

  return (
    <>
      <header className={styles.header}>
        {/* ── TOP BAR ── */}
        <div className={styles.headerTop}>
          {/* Left: burger + search */}
          <div className={styles.leftGroup}>
            <button
              type="button"
              className={styles.menuBtn}
              aria-label="Відкрити меню"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <span />
              <span />
              <span />
            </button>

            <Link href="/search" className={styles.iconButton} aria-label="Пошук">
              <FiSearch />
              Пошук
            </Link>
          </div>

          {/* Center: logo */}
          <div className={styles.centerGroup}>
            <span className={styles.logoEyebrow}>Незалежне видання</span>
            <Link href="/" className={styles.logo} aria-label="Головна">
              Express News
            </Link>
            <div className={styles.logoRule}>
              <span className={styles.logoRuleText}>Україна</span>
            </div>
          </div>

          {/* Right: theme + socials */}
          <div className={styles.rightGroup}>
            <button
              type="button"
              aria-label="Змінити тему"
              className={styles.themeBtn}
              onClick={toggleTheme}
            >
              {theme === "dark" ? <FiSun /> : <FiMoon />}
            </button>

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
              href="https://www.instagram.com/espress_news_che/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className={styles.socialLink}
            >
              <FaInstagram />
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

            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              className={styles.socialLink}
            >
              <FaYoutube />
            </a>
          </div>
        </div>

        {/* ── NAV STRIP ── */}
        <nav className={styles.navStrip} aria-label="Категорії">
          <Link href="/" className={`${styles.navLink} ${styles.active}`}>
            Головна
          </Link>

          {categoriesForNav.map((cat) => (
            <Link
              key={cat.id}
              href={categoryHref(cat)}
              className={styles.navLink}
            >
              {cat.name}
            </Link>
          ))}

          <Link href="/about" className={styles.navLink}>
            Про нас
          </Link>
        </nav>
      </header>

      {/* ── OVERLAY ── */}
      <div
        className={`${styles.overlay} ${menuOpen ? styles.overlayOpen : ""}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* ── SIDE MENU ── */}
      <aside
        className={`${styles.sideMenu} ${menuOpen ? styles.sideMenuOpen : ""}`}
        aria-label="Головне меню"
      >
        <div className={styles.sideMenuHeader}>
          <span className={styles.menuLogo}>Express News</span>

          <button
            type="button"
            className={styles.closeButton}
            aria-label="Закрити меню"
            onClick={() => setMenuOpen(false)}
          >
            <FiX />
          </button>
        </div>

        <nav className={styles.sideNav} aria-label="Навігація">
          <Link
            href="/"
            className={styles.sideNavLink}
            onClick={() => setMenuOpen(false)}
          >
            Головна
          </Link>

          {categoriesForNav.map((cat) => (
            <Link
              key={cat.id}
              href={categoryHref(cat)}
              className={styles.sideNavLink}
              onClick={() => setMenuOpen(false)}
            >
              {cat.name}
            </Link>
          ))}

          <Link
            href="/about"
            className={styles.sideNavLink}
            onClick={() => setMenuOpen(false)}
          >
            Про нас
          </Link>
        </nav>
      </aside>
    </>
  );
}
