import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

const config: NextConfig = {
  async redirects() {
    return [{ source: "/", destination: "/docs", permanent: false }];
  },
};

export default createMDX()(config);
