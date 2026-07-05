// Base fallback for typechecking. At runtime Metro resolves AdBanner.native.tsx
// (real BannerAd) or AdBanner.web.tsx (null) via platform extensions.
export function AdBanner() {
  return null;
}
