/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@taskhub/shared", "@taskhub/data"],
  images: {
    remotePatterns: [
      // Wildcarded: task/completion/portfolio photos can come from Firebase
      // Storage (any project bucket) or from older records that still hold
      // an arbitrary pasted URL. Without this, any hostname not explicitly
      // listed here throws a hard runtime error every time that image renders.
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
