
export type NewsItem = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  published_at?: string | null;
  cover_image?: string | null;
  is_featured?: boolean | null;
  status?: "draft" | "published" | "archived" | string | null;

};

export type Category = {
  description: any;
  id: number;
  slug: string;
  name: string;
};
export type PageItem = {
  id: number | string;
  title: string;
  slug: string;
  content?: string | null;
  status?: string | null;
};
const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;
const NEWS_COLLECTION = process.env.NEXT_PUBLIC_NEWS_COLLECTION ?? "News";

function buildUrl(path: string, params: Record<string, string> = {}) {
  const url = new URL(`${BASE_URL}${path}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  return url.toString();
}

export function assetUrl(
  fileId?: string | null,
  options?: { width?: number; height?: number; quality?: number; fit?: string }
) {
  if (!fileId) return "/placeholder.jpg";

  const url = new URL(`/assets/${fileId}`, BASE_URL);

  if (options?.width) url.searchParams.set("width", String(options.width));
  if (options?.height) url.searchParams.set("height", String(options.height));
  if (options?.quality) url.searchParams.set("quality", String(options.quality));
  if (options?.fit) url.searchParams.set("fit", options.fit);

  return url.toString();
}

export async function getHeroNews() {
  const res = await fetch(
    `${BASE_URL}/items/News?filter[is_hero][_eq]=true&filter[status][_eq]=published&limit=1`,
    {next: { revalidate: 60 }}
  );

  const json = await res.json();
  return json.data?.[0] ?? null;
}
export async function getTopNews() {
  const res = await fetch(
    `${BASE_URL}/items/News?filter[is_top][_eq]=true&filter[status][_eq]=published&sort=-published_at&limit=6`,
    { next: { revalidate: 60 }}
  );

  const json = await res.json();
  return json.data ?? [];
}

async function fetchItems<T>(
  collection: string,
  params: Record<string, string>
): Promise<T[]> {
  const url = buildUrl(`/items/${collection}`, params);

  const res = await fetch(url, {
    next: { revalidate: 60 },
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Directus request failed for [${collection}]: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as { data?: T[] };
  return json.data ?? [];
}

// -------------------- МЕТОДЫ --------------------

export async function getNewsList(): Promise<NewsItem[]> {
  return fetchItems<NewsItem>(NEWS_COLLECTION, {
    fields: "id,title,slug,excerpt,published_at,cover_image,status",
    "filter[status][_eq]": "published",
    sort: "-published_at",
    limit: "20",
  });
}
export async function getFeaturedNews(): Promise<NewsItem[]> {
  return fetchItems<NewsItem>(NEWS_COLLECTION, {
    fields: "id,title,slug,published_at,cover_image,status",
    "filter[is_featured][_eq]": "true",
    "filter[status][_eq]": "published",
    sort: "-published_at",
    limit: "5",
  });
}
export async function getNewsBySlug(slug: string): Promise<NewsItem | null> {
  const items = await fetchItems<NewsItem>(NEWS_COLLECTION, {
    fields: "id,title,slug,excerpt,content,published_at,cover_image,status",
    "filter[slug][_eq]": slug,
    "filter[status][_eq]": "published",
    limit: "1",
  });
  return items[0] ?? null;
}

export async function getCategories(): Promise<Category[]> {
  // Используем маленькие буквы, как в вашей админке
  return fetchItems<Category>("categories", {
    fields: "id,slug,name",
    sort: "id",
    limit: "100",
  });
}
export async function getNewsByCategory(categorySlug: string): Promise<NewsItem[]> {
  return fetchItems<NewsItem>(NEWS_COLLECTION, {
    fields: "id,title,slug,excerpt,published_at,cover_image,status",
    "filter[category][slug][_eq]": categorySlug,
    "filter[status][_eq]": "published",
    sort: "-published_at",
    limit: "50",
  });
}
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const items = await fetchItems<Category>("categories", {
    fields: "id,slug,name",
    "filter[slug][_eq]": slug,
    limit: "1",
  });
  return items[0] ?? null;
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

  // беремо пачку новин без фільтра з бази
  const items = await fetchItems<NewsItem>(NEWS_COLLECTION, {
  fields: "id,title,slug,excerpt,content,published_at,cover_image,status",
  "filter[status][_eq]": "published",
  sort: "-published_at",
  limit: "200",
  });

  // фільтруємо в js (працює з укр/кирилицею нормально)
  const filtered = items.filter((n) => {
    const hay = `${n.title ?? ""} ${n.excerpt ?? ""} ${(n as any).content ?? ""}`
      .replace(/<[^>]*>/g, " ")
      .replace(/[^\p{L}\p{N}\s]+/gu, " ")
      .replace(/\s+/g, " ")
      .toLocaleLowerCase("uk-UA");

    return hay.includes(q);
  });

  // повертаємо перші 50 результатів
  return filtered.slice(0, 50);
}


export async function getPage(): Promise<PageItem | null> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/items/pages`,
    {  next: { revalidate: 60 }  }
  );

  if (!res.ok) return null;

  const json = await res.json();
  return json.data ?? null;
}

type DirectusFile = {
  id: string;
  filename_disk?: string;
  title?: string;
};

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
  const res = await fetch(
    `${BASE_URL}/items/Events?` +
      new URLSearchParams({
        "filter[status][_eq]": "published",
        sort: "-starts_at",
        fields: "id,title,slug,starts_at,status,cover_image,latitude,longitude",
      }),
    {  next: { revalidate: 60 }  }
  );

  if (!res.ok) return [];
  const json = await res.json();
  return json.data ?? [];
}

export async function getEventBySlug(slug: string): Promise<EventItem | null> {
  const clean = decodeURIComponent(slug).trim();

  const url =
    `${BASE_URL}/items/Events?` +
    new URLSearchParams({
      "filter[status][_eq]": "published",
      "filter[slug][_eq]": clean,
      limit: "1",
      fields: "id,title,slug,content,starts_at,status,cover_image,latitude,longitude",
    });

  console.log("raw slug:", JSON.stringify(slug));
  console.log("clean slug:", JSON.stringify(clean));
  console.log("directus url:", url);

  const res = await fetch(url, { next: { revalidate: 60 } });

  console.log("directus status:", res.status);

  const text = await res.text();
  console.log("directus body:", text.slice(0, 500)); // перші 500 символів

  if (!res.ok) return null;

  const json = JSON.parse(text);
  return json.data?.[0] ?? null;
}

export function getAssetUrl(file: any): string | null {
  if (!file) return null;
  const id = typeof file === "string" ? file : file.id;
  if (!id) return null;
  return `${BASE_URL}/assets/${id}`;
}