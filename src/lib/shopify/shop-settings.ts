import { shopifyFetch } from "./client";

export type ShopContact = { email?: string; phone?: string; whatsapp?: string };
export type ShopSocial = {
  instagram?: string;
  facebook?: string;
  pinterest?: string;
};
export type NavItem = { title: string; url: string };

export type ShopSettings = {
  marquee: string[];
  contact: ShopContact;
  social: ShopSocial;
  headerMenu: NavItem[];
  footerMenu: NavItem[];
};

const SHOP_SETTINGS_QUERY = /* GraphQL */ `
  query ShopSettings {
    shop {
      marquee: metafield(namespace: "custom", key: "marquee_messages") {
        value
      }
      contact: metafield(namespace: "custom", key: "contact") {
        value
      }
      social: metafield(namespace: "custom", key: "social") {
        value
      }
    }
    headerMenu: menu(handle: "header-menu") {
      items {
        title
        url
      }
    }
    footerMenu: menu(handle: "footer-menu") {
      items {
        title
        url
      }
    }
  }
`;

function parseJson<T>(value: string | null | undefined): T | null {
  if (!value?.trim()) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

/** Shopify hostnames (myshopify.com / thekashmirweaver.shop) whose menu URLs should resolve to this site instead. */
function toLocalPath(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.pathname + parsed.search || "/";
  } catch {
    return url;
  }
}

/** Mirrors Hydrogen's shop-settings.ts — same Shop metafields + header-menu/footer-menu, same fallback-on-empty behavior. */
export async function getShopSettings(): Promise<ShopSettings> {
  try {
    const data = await shopifyFetch<{
      shop: {
        marquee: { value: string } | null;
        contact: { value: string } | null;
        social: { value: string } | null;
      };
      headerMenu: { items: NavItem[] } | null;
      footerMenu: { items: NavItem[] } | null;
    }>({ query: SHOP_SETTINGS_QUERY, revalidate: 3600 });

    return {
      marquee: parseJson<string[]>(data.shop.marquee?.value) ?? [],
      contact: parseJson<ShopContact>(data.shop.contact?.value) ?? {},
      social: parseJson<ShopSocial>(data.shop.social?.value) ?? {},
      headerMenu: (data.headerMenu?.items ?? []).map((i) => ({
        title: i.title,
        url: toLocalPath(i.url),
      })),
      footerMenu: (data.footerMenu?.items ?? []).map((i) => ({
        title: i.title,
        url: toLocalPath(i.url),
      })),
    };
  } catch {
    return {
      marquee: [],
      contact: {},
      social: {},
      headerMenu: [],
      footerMenu: [],
    };
  }
}
