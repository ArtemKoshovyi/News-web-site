export type Category = {
  id: number;
  slug: string;
  name: string;
  description?: string | null;
  status?: string | null;
};

export type NewsItem = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  published_at?: string | null;
  cover_image?: string | null;
  is_featured?: boolean | null;
  is_hero?: boolean | null;
  is_top?: boolean | null;
  status?: "draft" | "published" | "archived" | string | null;
  category?: Category | null;
};

export type PageItem = {
  id: number | string;
  title: string;
  slug: string;
  content?: string | null;
  status?: string | null;
};

const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL ?? "";
const NEWS_COLLECTION = process.env.NEXT_PUBLIC_NEWS_COLLECTION ?? "News";

function buildUrl(path: string, params: Record<string, string> = {}) {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_DIRECTUS_URL is not set");
  }

  const url = new URL(`${BASE_URL}${path}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  return url.toString();
}

function normalizeText(value?: string | null) {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase("uk-UA")
    .replace(/[’']/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

const DIRECTUS_TIMEOUT_MS = 12_000;
const DIRECTUS_RETRIES = 3;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function safeJson<T>(url: string): Promise<T | null> {
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= DIRECTUS_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DIRECTUS_TIMEOUT_MS);

    try {
      const res = await fetch(url, {
        cache: "no-store",
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      });

      clearTimeout(timeout);

      if (!res.ok) {
        lastError = new Error(`${res.status} ${res.statusText}`);
        console.error(
          `Directus request failed, attempt ${attempt}/${DIRECTUS_RETRIES}: ${res.status} ${res.statusText} — ${url}`
        );

        // 4xx usually means bad query/permissions, so retrying will not help.
        if (res.status >= 400 && res.status < 500 && res.status !== 429) {
          return null;
        }
      } else {
        return (await res.json()) as T;
      }
    } catch (error) {
      clearTimeout(timeout);
      lastError = error;
      console.error(
        `Directus fetch failed, attempt ${attempt}/${DIRECTUS_RETRIES} — ${url}`,
        error
      );
    }

    if (attempt < DIRECTUS_RETRIES) {
      await sleep(700 * attempt);
    }
  }

  console.error(`Directus failed after ${DIRECTUS_RETRIES} attempts — ${url}`, lastError);
  return null;
}

async function fetchItems<T>(
  collection: string,
  params: Record<string, string>
): Promise<T[]> {
  let url = "";

  try {
    url = buildUrl(`/items/${collection}`, params);
  } catch (error) {
    console.error(error);
    return [];
  }

  const json = await safeJson<{ data?: T[] }>(url);
  return Array.isArray(json?.data) ? json.data : [];
}

export function assetUrl(
  fileId?: string | null,
  options?: { width?: number; height?: number; quality?: number; fit?: string }
) {
  if (!fileId) return "/placeholder.jpg";
  if (!BASE_URL) return "/placeholder.jpg";

  const url = new URL(`/assets/${fileId}`, BASE_URL);

  if (options?.width) url.searchParams.set("width", String(options.width));
  if (options?.height) url.searchParams.set("height", String(options.height));
  if (options?.quality) url.searchParams.set("quality", String(options.quality));
  if (options?.fit) url.searchParams.set("fit", options.fit);

  return url.toString();
}

export async function getHeroNews(): Promise<NewsItem | null> {
  const items = await fetchItems<NewsItem>(NEWS_COLLECTION, {
    fields: "id,title,slug,excerpt,published_at,cover_image,status,category.id,category.slug,category.name",
    "filter[is_hero][_eq]": "true",
    "filter[status][_eq]": "published",
    limit: "1",
  });

  return items[0] ?? null;
}

export async function getTopNews(): Promise<NewsItem[]> {
  return fetchItems<NewsItem>(NEWS_COLLECTION, {
    fields: "id,title,slug,published_at,cover_image,status,category.id,category.slug,category.name",
    "filter[is_top][_eq]": "true",
    "filter[status][_eq]": "published",
    sort: "-published_at",
    limit: "6",
  });
}

// -------------------- МЕТОДЫ --------------------

export async function getNewsList(): Promise<NewsItem[]> {
  const items = await fetchItems<NewsItem>(NEWS_COLLECTION, {
    fields: "id,title,slug,excerpt,published_at,cover_image,status,category.id,category.slug,category.name",
    "filter[status][_eq]": "published",
    sort: "-published_at",
    limit: "20",
  });

  // Fallback, щоб головна не ставала порожньою, якщо Directus має проблему зі status-фільтром.
  if (items.length) return items;

  return fetchItems<NewsItem>(NEWS_COLLECTION, {
    fields: "id,title,slug,excerpt,published_at,cover_image,status,category.id,category.slug,category.name",
    sort: "-published_at",
    limit: "20",
  });
}

export async function getFeaturedNews(): Promise<NewsItem[]> {
  return fetchItems<NewsItem>(NEWS_COLLECTION, {
    fields: "id,title,slug,published_at,cover_image,status,category.id,category.slug,category.name",
    "filter[is_featured][_eq]": "true",
    "filter[status][_eq]": "published",
    sort: "-published_at",
    limit: "5",
  });
}

export async function getNewsBySlug(slug: string): Promise<NewsItem | null> {
  const clean = decodeURIComponent(slug).trim();

  const items = await fetchItems<NewsItem>(NEWS_COLLECTION, {
    fields: "id,title,slug,excerpt,content,published_at,cover_image,status,category.id,category.slug,category.name",
    "filter[slug][_eq]": clean,
    "filter[status][_eq]": "published",
    limit: "1",
  });

  return items[0] ?? null;
}

export async function getCategories(): Promise<Category[]> {
  // Важливо: не використовуємо поле sort, бо якщо його немає або Directus тимчасово падає,
  // хедер залишається тільки з "Головна / Про нас". Беремо мінімальні стабільні поля.
  let categories = await fetchItems<Category>("categories", {
    fields: "id,slug,name,description,status",
    sort: "id",
    limit: "100",
  });

  // Додатковий fallback: якщо розширений запит не спрацював, пробуємо максимально простий.
  if (!categories.length) {
    categories = await fetchItems<Category>("categories", {
      fields: "id,slug,name",
      limit: "100",
    });
  }

  return categories.filter((cat) => cat.status !== "archived" && cat.status !== "draft");
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const clean = decodeURIComponent(slug).trim();
  const normalizedClean = normalizeText(clean);

  const categories = await getCategories();

  return (
    categories.find((cat) => normalizeText(cat.slug) === normalizedClean) ??
    categories.find((cat) => normalizeText(cat.name) === normalizedClean) ??
    null
  );
}

export async function getNewsByCategory(categorySlug: string): Promise<NewsItem[]> {
  const clean = decodeURIComponent(categorySlug).trim();
  const category = await getCategoryBySlug(clean);

  if (category) {
    const byId = await fetchItems<NewsItem>(NEWS_COLLECTION, {
      fields: "id,title,slug,excerpt,content,published_at,cover_image,status,category.id,category.slug,category.name",
      "filter[category][_eq]": String(category.id),
      "filter[status][_eq]": "published",
      sort: "-published_at",
      limit: "50",
    });

    if (byId.length) return byId;
  }

  // Fallback для старих/інших slug, наприклад Economic/Finanse тощо.
  return fetchItems<NewsItem>(NEWS_COLLECTION, {
    fields: "id,title,slug,excerpt,content,published_at,cover_image,status,category.id,category.slug,category.name",
    "filter[category][slug][_eq]": clean,
    "filter[status][_eq]": "published",
    sort: "-published_at",
    limit: "50",
  });
}

export async function getPageBySlug(slug: string): Promise<PageItem | null> {
  const items = await fetchItems<PageItem>("pages", {
    fields: "id,title,slug,content,status",
    "filter[slug][_eq]": slug,
    "filter[status][_eq]": "published",
    limit: "1",
  });

  return items[0] ?? null;
}

export async function searchNews(query: string): Promise<NewsItem[]> {
  const q = query
    .trim()
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("uk-UA");

  if (!q) return [];

  const items = await fetchItems<NewsItem>(NEWS_COLLECTION, {
    fields: "id,title,slug,excerpt,content,published_at,cover_image,status,category.id,category.slug,category.name",
    "filter[status][_eq]": "published",
    sort: "-published_at",
    limit: "200",
  });

  const filtered = items.filter((n) => {
    const hay = `${n.title ?? ""} ${n.excerpt ?? ""} ${(n as any).content ?? ""}`
      .replace(/<[^>]*>/g, " ")
      .replace(/[^\p{L}\p{N}\s]+/gu, " ")
      .replace(/\s+/g, " ")
      .toLocaleLowerCase("uk-UA");

    return hay.includes(q);
  });

  return filtered.slice(0, 50);
}

export async function getPage(): Promise<PageItem | null> {
  const items = await fetchItems<PageItem>("pages", {
    fields: "id,title,slug,content,status",
    limit: "1",
  });

  return items[0] ?? null;
}

export type EventItem = {
  id: number;
  title: string;
  slug: string;
  content?: string | null;
  starts_at?: string | null;
  status?: "draft" | "published" | string;
  cover_image?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export async function getEvents(): Promise<EventItem[]> {
  return fetchItems<EventItem>("Events", {
    "filter[status][_eq]": "published",
    sort: "-starts_at",
    fields: "id,title,slug,starts_at,status,cover_image,latitude,longitude",
    limit: "100",
  });
}

export async function getEventBySlug(slug: string): Promise<EventItem | null> {
  const clean = decodeURIComponent(slug).trim();

  const items = await fetchItems<EventItem>("Events", {
    "filter[status][_eq]": "published",
    "filter[slug][_eq]": clean,
    limit: "1",
    fields: "id,title,slug,content,starts_at,status,cover_image,latitude,longitude",
  });

  return items[0] ?? null;
}

export function getAssetUrl(file: any): string | null {
  if (!file) return null;
  const id = typeof file === "string" ? file : file.id;
  if (!id || !BASE_URL) return null;
  return `${BASE_URL}/assets/${id}`;
}
