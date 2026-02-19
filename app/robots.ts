import type { MetadataRoute } from "next";

const robots = (): MetadataRoute.Robots => {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ['/', "/host/login", "/hosts/"],
        disallow: ["/admin/master", '/host/'],
      },
    ],
  };
}

export default robots;