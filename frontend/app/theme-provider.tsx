"use client";

import { useEffect } from "react";

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const theme = savedTheme === "dark" ? "dark" : "light";

    document.documentElement.dataset.theme = theme;

    if (savedTheme !== "dark" && savedTheme !== "light") {
      localStorage.setItem("theme", "light");
    }
  }, []);

  return <>{children}</>;
}
