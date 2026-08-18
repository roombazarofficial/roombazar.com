import type { Listing } from "@/types/listing";
import type { Locality } from "@/types/locality";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://roombazar.com";

export function ListingStructuredData({ listing }: { listing: Listing }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Accommodation",
    name: listing.title,
    description: listing.description,
    url: `${siteUrl}/room/${listing.slug}`,
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
      addressLocality: listing.locality.name,
      addressRegion: listing.city.state,
      addressCountry: "IN",
    },
    amenityFeature: listing.amenities.map((amenity) => ({
      "@type": "LocationFeatureSpecification",
      name: amenity.label,
      value: true,
    })),
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
    name: `Rooms for rent in ${locality.name}, ${cityName}`,
    url: `${siteUrl}/rooms/${locality.citySlug}/${locality.slug}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: listingCount,
    },
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

export function SiteStructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "RoomBazar",
        url: siteUrl,
        description:
          "A peer-to-peer room marketplace with no commission and no broker fees.",
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "RoomBazar",
        publisher: { "@id": `${siteUrl}/#organization` },
        inLanguage: "en-IN",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteUrl}/rooms/bengaluru?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
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
