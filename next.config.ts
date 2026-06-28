import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";

function resolveBasePath(): string {
  const raw = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  if (!raw) return "";
  const normalized = raw.replace(/\/+$/, "");
  if (isStaticExport && (!/^\/[a-zA-Z0-9._~:@!$&'()*+,;=-][a-zA-Z0-9._~:@!$&'()*+,;=/-]*$/.test(normalized))) {
    throw new Error(`NEXT_PUBLIC_BASE_PATH must be a valid path starting with / (got "${raw}")`);
  }
  return normalized;
}

const basePath = resolveBasePath();

const nextConfig: NextConfig = {
  output: isStaticExport ? "export" : "standalone",
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  turbopack: {
    root: process.cwd(),
  },
  ...(isStaticExport && {
    images: { unoptimized: true },
    trailingSlash: true,
  }),
  ...(basePath && { basePath }),
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

export default withMDX(nextConfig);
