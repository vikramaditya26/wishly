import type { MetadataRoute } from "next";

// Home page is indexable; individual lists and dashboards are private-by-link.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/manage/", "/b/"],
    },
  };
}
