/**
 * ONE place where every image path lives. Components never hardcode a path —
 * they import from here, so swapping a placeholder for your own render is a
 * single-line change.
 *
 * All assets below are local files in /public/images (generated for this build)
 * except the ones explicitly marked PLACEHOLDER_STOCK, which still point at
 * temporary Pexels photography and must be replaced with your own unique
 * concept renders before launch.
 */

const img = (name: string) => `/images/${name}`;

export const images = {
  hero: img("hero-dusk.jpg"),
  heroNight: img("hero-night.jpg"),
  lobby: img("room-lobby.jpg"),
  living: img("room-living.jpg"),
  kitchen: img("room-kitchen.jpg"),
  bedroom: img("room-bedroom.jpg"),
  marbleWall: img("room-marble.jpg"),
  terrace: img("room-terrace.jpg"),
  aerial: img("aerial-islamabad.jpg"),
  spa: img("room-marble.jpg"), // TODO_ADD_SPA_IMAGE → /public/images/room-spa.jpg
  pineWaterVilla: img("property-pine-water-villa.jpg"),
  owner: "/images/owner/bilal.jpg", // TODO_ADD_OWNER_PHOTO (silhouette until supplied)
} as const;

/** Walk-through sequence, in scroll order. */
export const roomSequence = [
  { key: "lobby", src: images.lobby, nightSrc: images.lobby },
  { key: "living", src: images.living, nightSrc: images.living },
  { key: "kitchen", src: images.kitchen, nightSrc: images.kitchen },
  { key: "marble", src: images.marbleWall, nightSrc: images.marbleWall },
  { key: "bedroom", src: images.bedroom, nightSrc: images.bedroom },
  { key: "terrace", src: images.terrace, nightSrc: images.heroNight },
] as const;

/**
 * PLACEHOLDER_STOCK — temporary photography for listings whose unique concept
 * render has not been produced yet. Listed in the README so you can replace
 * each one.
 */
export const placeholderStock = {
  p2: "https://images.pexels.com/photos/24805054/pexels-photo-24805054.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1200&h=1500",
  p3: "https://images.pexels.com/photos/19075392/pexels-photo-19075392.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1200&h=1500",
  p4: "https://images.pexels.com/photos/8134745/pexels-photo-8134745.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1200&h=1500",
  p5: "https://images.pexels.com/photos/6301181/pexels-photo-6301181.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1200&h=1500",
  p6: "https://images.pexels.com/photos/7005270/pexels-photo-7005270.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1200&h=1500",
  p7: "https://images.pexels.com/photos/38418609/pexels-photo-38418609.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1200&h=1500",
  p8: "https://images.pexels.com/photos/7607331/pexels-photo-7607331.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1200&h=1500",
  p9: "https://images.pexels.com/photos/27626185/pexels-photo-27626185.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1200&h=1500",
  p10: "https://images.pexels.com/photos/6899354/pexels-photo-6899354.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1200&h=1500",
  p11: "https://images.pexels.com/photos/38019283/pexels-photo-38019283.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1200&h=1500",
  p12: "https://images.pexels.com/photos/38459967/pexels-photo-38459967.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1200&h=1500",
  office: "https://images.pexels.com/photos/7031879/pexels-photo-7031879.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1400&h=900",
  blog1: "https://images.pexels.com/photos/38517653/pexels-photo-38517653.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1400&h=900",
  blog2: "https://images.pexels.com/photos/19084143/pexels-photo-19084143.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1400&h=900",
  blog3: "https://images.pexels.com/photos/16959786/pexels-photo-16959786.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1400&h=900",
} as const;

/** Dark gradient shown behind/instead of any image that fails to load. */
export const imageFallback =
  "linear-gradient(140deg,#0E3B30 0%,#121917 45%,#0A0D0C 100%)";

export type ImageKey = keyof typeof images;
