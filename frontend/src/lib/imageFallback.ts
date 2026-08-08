import { SyntheticEvent } from "react";

// A self-contained placeholder shown when a restaurant/menu image URL is broken
// or missing (some seed data has stale Cloudinary URLs).
export const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='100%25' height='100%25' fill='%23f1f0ec'/%3E%3Ctext x='50%25' y='50%25' font-size='64' text-anchor='middle' dominant-baseline='central'%3E%F0%9F%8D%BD%EF%B8%8F%3C/text%3E%3C/svg%3E";

// Swap a broken image out for the placeholder (guards against an error loop).
export const onImageError = (e: SyntheticEvent<HTMLImageElement>) => {
  const img = e.currentTarget;
  if (img.src !== FALLBACK_IMAGE) {
    img.src = FALLBACK_IMAGE;
  }
};
