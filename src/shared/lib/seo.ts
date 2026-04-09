import type { Listing, Pricing, Certification } from "../types";

interface LocalBusinessJsonLd {
  "@context": "https://schema.org";
  "@type": "LocalBusiness";
  name: string;
  address: {
    "@type": "PostalAddress";
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    addressCountry: string;
  };
  geo?: {
    "@type": "GeoCoordinates";
    latitude: number;
    longitude: number;
  };
  telephone?: string;
  url?: string;
  aggregateRating?: {
    "@type": "AggregateRating";
    ratingValue: number;
    reviewCount: number;
  };
  priceRange?: string;
  hasCredential?: {
    "@type": "EducationalOccupationalCredential";
    credentialCategory: string;
    name: string;
  }[];
}

export function generateJsonLd(
  listing: Listing,
  country: string,
  currency: string,
  pricing?: Pricing[],
  certifications?: Certification[]
): LocalBusinessJsonLd {
  const jsonLd: LocalBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: listing.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: listing.address,
      addressLocality: listing.city,
      addressRegion: listing.region,
      addressCountry: country,
    },
  };

  if (listing.lat && listing.lng) {
    jsonLd.geo = {
      "@type": "GeoCoordinates",
      latitude: listing.lat,
      longitude: listing.lng,
    };
  }

  if (listing.phone) {
    jsonLd.telephone = listing.phone;
  }

  if (listing.website) {
    jsonLd.url = listing.website;
  }

  if (listing.google_rating && listing.google_review_count) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: listing.google_rating,
      reviewCount: listing.google_review_count,
    };
  }

  if (pricing && pricing.length > 0) {
    const min = Math.min(
      ...pricing.filter((p) => p.price_min).map((p) => p.price_min!)
    );
    const max = Math.max(
      ...pricing.filter((p) => p.price_max).map((p) => p.price_max!)
    );
    if (min && max && isFinite(min) && isFinite(max)) {
      jsonLd.priceRange = `${min}-${max} ${currency}`;
    }
  }

  if (certifications && certifications.length > 0) {
    jsonLd.hasCredential = certifications.map((cert) => ({
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "Professional Certification",
      name: `${cert.cert_name} (${cert.cert_body})`,
    }));
  }

  return jsonLd;
}

export function generateBreadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateFaqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function generateCityItemListJsonLd(
  cityName: string,
  region: string,
  country: string,
  listings: { name: string; address: string; google_rating?: number | null; google_review_count?: number | null }[],
  baseUrl: string,
  citySlug: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Instaladores de energía renovable en ${cityName}`,
    description: `Directorio de ${listings.length} instaladores de energía renovable en ${cityName}, ${region}`,
    numberOfItems: listings.length,
    itemListElement: listings.slice(0, 20).map((listing, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "LocalBusiness",
        name: listing.name,
        address: {
          "@type": "PostalAddress",
          addressLocality: cityName,
          addressRegion: region,
          addressCountry: country,
        },
        ...(listing.google_rating && listing.google_review_count
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: listing.google_rating,
                reviewCount: listing.google_review_count,
              },
            }
          : {}),
      },
    })),
  };
}

export function generateArticleJsonLd(
  content: {
    title: string;
    meta_description: string;
    published_at: string | null;
    updated_at: string;
    slug: string;
  },
  baseUrl: string,
  guidesPath: string,
  siteName: string,
  language: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: content.title,
    description: content.meta_description,
    datePublished: content.published_at || content.updated_at,
    dateModified: content.updated_at,
    url: `${baseUrl}/${guidesPath}/${content.slug}`,
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: baseUrl,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}/${guidesPath}/${content.slug}`,
    },
    inLanguage: language,
  };
}
