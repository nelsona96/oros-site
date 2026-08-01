export type Category = "weddings" | "commercial" | "portrait" | "ministry";

/**
 * Every queried image resolves to this shape — asset dimensions and an LQIP
 * are always selected (see docs/SPEC.md §3) so next/image never causes
 * layout shift, and urlFor() builds the actual src at whatever size the
 * consuming component needs.
 */
export interface SanityImage {
  asset: {
    url: string;
    metadata: {
      dimensions: { width: number; height: number; aspectRatio: number };
      lqip: string;
    };
  };
  alt?: string;
  hotspot?: { x: number; y: number };
}

export interface Photo {
  _id: string;
  image: SanityImage;
  category: Category;
  caption?: string;
  capture?: {
    camera?: string;
    lens?: string;
    aperture?: string;
    shutter?: string;
  };
  featured: boolean;
  order?: number;
}

export interface Film {
  _id: string;
  title: string;
  slug: string;
  category: Category;
  playbackId: string;
  duration?: number;
  thumbnail?: SanityImage;
  description?: string;
  client?: string;
  date?: string;
  featured: boolean;
  order?: number;
}

export interface Testimonial {
  _id: string;
  quote: string;
  attribution: string;
  role?: string;
  category?: Category;
  order?: number;
}

export interface Service {
  _id: string;
  title: string;
  slug: string;
  blurb: string;
  order?: number;
  coverImage?: SanityImage;
}

export interface SiteSettings {
  name: string;
  tagline?: string;
  heroVideoUrl?: string;
  heroPoster?: SanityImage;
  aboutHeading?: string;
  aboutBody?: string;
  portrait?: SanityImage;
  contactEmail?: string;
  contactPhone?: string;
  instagramHandle?: string;
  ogImage?: SanityImage;
  metaDescription?: string;
}
