/** @type {import("next").NextConfig} */
const nextConfig = {
  // The MySQL Lab page reads this file at run time. Tell Vercel to ship it with the page.
  outputFileTracingIncludes: { "/mysql-lab": ["./src/data/lab-results.json"] },
};
export default nextConfig;