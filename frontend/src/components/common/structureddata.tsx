import type { Listing } from "@/types/listing";
import type { Locality } from "@/types/locality";
import { siteUrl, socialProfiles, founders, siteEmail } from "@/lib/seo/site";

/**
 * JSON-LD for listing detail pages.
 * Maps real room data into Schema.org Accommodation and RealEstateListing schemas.
 */
export function ListingStructuredData({ listing }: { listing: Listing }) {
  const photos = listing.photos?.map((p) => p.url) ?? [];

  const data = {
    "@context": "https://schema.org",
    "@type": ["Accommodation", "RealEstateListing"],
    name: listing.title,
    description: listing.description,
    url: `${siteUrl}/room/${listing.slug}`,
    image: photos.length > 0 ? photos : undefined,
    numberOfRooms: roomCount(listing.roomType),
    floorSize: listing.areaSqft
      ? {
          "@type": "QuantitativeValue",
          value: listing.areaSqft,
          unitCode: "FTK",
        }
      : undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: listing.locality.name,
      addressLocality: listing.locality.name,
      addressRegion: listing.city.state,
      addressCountry: "IN",
    },
    geo:
      listing.approximateLat && listing.approximateLng
        ? {
            "@type": "GeoCoordinates",
            latitude: listing.approximateLat,
            longitude: listing.approximateLng,
          }
        : undefined,
    amenityFeature: listing.amenities?.map((amenity) => ({
      "@type": "LocationFeatureSpecification",
      name: amenity.label,
      value: true,
    })),
    provider: {
      "@type": "Person",
      name: listing.lister?.name ?? "Property Owner",
    },
    potentialAction: {
      "@type": "RentAction",
      target: `${siteUrl}/room/${listing.slug}`,
    },
    offers: {
      "@type": "Offer",
      price: listing.rentPaise / 100,
      priceCurrency: "INR",
      availability:
        listing.status === "active"
          ? "https://schema.org/InStock"
          : "https://schema.org/SoldOut",
      availabilityStarts: listing.availableFrom,
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: listing.rentPaise / 100,
        priceCurrency: "INR",
        unitCode: "MON",
      },
    },
  };

  return <JsonLd data={data} />;
}

export function CityStructuredData({
  cityName,
  citySlug,
  listingCount,
}: {
  cityName: string;
  citySlug: string;
  listingCount: number;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Rooms for rent in ${cityName} — Direct from Owners | RoomBazar`,
    description: `Browse verified rooms, 1 BHK, 2 BHK, and flats for rent in ${cityName} with zero broker fees.`,
    url: `${siteUrl}/rooms/${citySlug}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: listingCount,
    },
  };

  return <JsonLd data={data} />;
}

export function LocalityStructuredData({
  locality,
  cityName,
  listingCount,
}: {
  locality: Locality;
  cityName: string;
  listingCount: number;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Rooms for rent in ${locality.name}, ${cityName} | RoomBazar`,
    description: `Discover verified rooms, flats and shared accommodation for rent in ${locality.name}, ${cityName} directly from property owners.`,
    url: `${siteUrl}/rooms/${locality.citySlug}/${locality.slug}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: listingCount,
    },
  };

  return <JsonLd data={data} />;
}

export function FAQStructuredData({
  items,
}: {
  items: { question: string; answer: string }[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return <JsonLd data={data} />;
}

export function SiteStructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "RoomBazar",
        url: siteUrl,
        logo: `${siteUrl}/icon.png`,
        description:
          "RoomBazar is a peer-to-peer room rental marketplace in India connecting room seekers directly with property owners with 0% brokerage.",
        email: siteEmail,
        sameAs: socialProfiles.map((p) => p.url),
        founder: founders.map((f) => ({
          "@type": "Person",
          "@id": `${siteUrl}/#founder-${f.name.toLowerCase().replace(/\s+/g, "-")}`,
          name: f.name,
          jobTitle: f.role,
        })),
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "Customer Support",
          email: siteEmail,
          availableLanguage: ["English", "Hindi"],
        },
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "RoomBazar",
        publisher: { "@id": `${siteUrl}/#organization` },
        inLanguage: "en-IN",
        // No SearchAction: the site has structured browse pages (city / locality)
        // but no public free-text search URL, and Google requires the target URL
        // template to actually resolve to a results page.
      },
    ],
  };

  return <JsonLd data={data} />;
}

/**
 * JSON-LD for the About page — declares an AboutPage entity that is
 * explicitly `about` the RoomBazar Organization, strengthening the
 * entity connection for knowledge-graph extraction.
 */
export function AboutPageStructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${siteUrl}/about/#webpage`,
    url: `${siteUrl}/about`,
    name: "About RoomBazar",
    description:
      "Learn about RoomBazar, what it does, how it works, and the people behind it.",
    isPartOf: { "@id": `${siteUrl}/#website` },
    about: { "@id": `${siteUrl}/#organization` },
    inLanguage: "en-IN",
  };

  return <JsonLd data={data} />;
}


export function BreadcrumbStructuredData({
  trail,
}: {
  trail: { name: string; path: string }[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${siteUrl}${crumb.path}`,
    })),
  };

  return <JsonLd data={data} />;
}

function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

function roomCount(roomType: Listing["roomType"]): number {
  switch (roomType) {
    case "bhk3plus":
      return 3;
    case "bhk2":
      return 2;
    default:
      return 1;
  }
}
