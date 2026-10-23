import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** `GITHUB_PAGES=true` (set in CI) serves the site from /<repo>/ as a project page. */
const isGithubPages = process.env.GITHUB_PAGES === 'true';
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'khod-ghofteha';
const basePath = isGithubPages ? `/${repo}` : '';

/** @type {import('next').NextConfig} */
const config = {
  output: 'export',
  trailingSlash: true,
  reactStrictMode: true,
  images: { unoptimized: true },
  basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_REPO_URL: process.env.GITHUB_REPOSITORY ? `https://github.com/${process.env.GITHUB_REPOSITORY}` : '',
  },
};

export default withMDX(config);
