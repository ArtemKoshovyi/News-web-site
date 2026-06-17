import "./globals.css";
import Header from "./components/Header";
import { getCategories } from "@/lib/directus";
import ThemeProvider from "./theme-provider";

export const dynamic = "force-dynamic";

export const metadata = {
  verification: {
    google: "4Eys10DTwJ3Xi2oLaLmQPpIvNFR46SJmYHFCRYXoeCE",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let categories: Awaited<ReturnType<typeof getCategories>> = [];

    try {
      categories = await getCategories();
    } catch (error) {
      console.error("Failed to load categories in layout:", error);
    }
  return (
    <html lang="uk">
      <body>
        <ThemeProvider>
          <Header categories={categories} />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
