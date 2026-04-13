import Image from "next/image";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { tokenizedFetch } from "@/app/lib/fetcher/tokenizedFetch";
import { rawFetch } from "@/app/lib/fetcher/rawFetch";
import { extractData } from "@/app/lib/extractData";
import { authOptions } from "@/app/utils/authOptions";
import circleWithStarShape from "@/public/shapes/circle-with-star.svg";
import ProductContents from "@/app/components/product/ProductContents";
import ProductRelatedContents from "@/app/components/product/ProductRelatedContents";
import { getImage } from "@/app/lib/cloudinaryUtils";
import { FRONTEND_URL } from "@/app/config/site";
import { COMPANY_NAME } from "@/app/config/company";
import { calculateFinalPrice } from "@/app/utils/orderCalculations";

export async function generateMetadata({ params: { slug } }) {
  let product = null;

  try {
    const result = await rawFetch(`/api/products/slug/${slug}`, {
      next: {
        revalidate: 3600,
        tags: ["all-products", `product-${slug}`],
      },
    });
    product = result.data || null;
  } catch (error) {
    // silent
  }

  if (!product || product.status !== "active") {
    return {
      title: "Product Not Found",
      robots: { index: false, follow: false },
    };
  }

  // Strip HTML from productDetails for clean description
  const stripHtml = (html) => html?.replace(/<[^>]*>/g, "").trim() ?? "";
  const description = product.productDetails
    ? stripHtml(product.productDetails).slice(0, 155)
    : `Shop ${product.productTitle} at ${COMPANY_NAME}. Best price, fast delivery across Bangladesh.`;

  // Getting image from thumbnail or variants
  const firstVariantImage = product.productVariants?.[0]?.imageUrls?.[0];
  const productImage = product.thumbnailImageUrl
    ? getImage(product.thumbnailImageUrl, 1200)
    : product.productVariants?.[0]?.imageUrls?.[0]
      ? getImage(firstVariantImage, 1200)
      : `${FRONTEND_URL}/home/home.webp`;

  return {
    title: product.productTitle,
    description,
    keywords: [
      product.productTitle,
      product.category,
      ...(product.tags ?? []),
      "buy online",
      "men's fashion",
      COMPANY_NAME,
      "Bangladesh",
    ],
    robots: { index: true, follow: true },
    alternates: { canonical: `${FRONTEND_URL}/product/${slug}` },
    openGraph: {
      title: `${product.productTitle} | ${COMPANY_NAME}`,
      description,
      url: `${FRONTEND_URL}/product/${slug}`,
      siteName: COMPANY_NAME,
      type: "website",
      images: [
        {
          url: productImage,
          width: 1200,
          height: 630,
          alt: product.productTitle,
        },
      ],
    },
  };
}

export default async function Product({ params: { slug } }) {
  let product = null;
  try {
    const result = await rawFetch(`/api/products/slug/${slug}`, {
      next: {
        revalidate: 3600,
        tags: ['all-products', `product-${slug}`]
      }
    });
    product = result.data || null;
  } catch (error) {
    console.error("FetchError (productDetails/products):", error.message);
  }

  if (!product || product.status !== "active") redirect("/shop");

  const session = await getServerSession(authOptions);

  const promises = [
    session?.user?.email
      ? tokenizedFetch(`/api/customer/single/${session?.user?.email}`)
      : Promise.resolve(null),
    rawFetch("/api/products/all", {
      next: {
        revalidate: 7200,
        tags: ['all-products']
      }
    }),
    rawFetch("/api/special-offer/all", {
      next: {
        revalidate: 3600, // 1 hour
        tags: ['special-offers']
      }
    }),
    rawFetch("/api/location/primary", {
      next: {
        revalidate: 7200,           // 2 hours fallback
        tags: ['primary-location']  // cleared when location changes
      }
    }),
    rawFetch("/api/notifications/all", {
      next: {
        revalidate: 3600, // 1 hour
        tags: ['notifications']
      }
    }),
  ];

  const [userDataRes, productsRes, offersRes, primaryLocationRes, notifyVariantsRes] =
    await Promise.allSettled(promises);

  const [userData, products, specialOffers, primaryLocation, notifyVariants] = [
    extractData(userDataRes, null, "productDetails/userData"),
    extractData(productsRes, [], "productDetails/products"),
    extractData(offersRes, [], "productDetails/specialOffers"),
    extractData(
      primaryLocationRes,
      null,
      "productDetails/primaryLocation",
      "primaryLocation",
    ),
    extractData(notifyVariantsRes, [], "productDetails/notifyVariants"),
  ];

  const randomViewers = Math.floor(Math.random() * (99 - 10 + 1)) + 10;

  // Striping HTML tags from productDetails for clean description
  const stripHtml = (html) => html?.replace(/<[^>]*>/g, "").trim() ?? "";

  // Getting image from thumbnail or variants
  const firstVariantImage = product.productVariants?.[0]?.imageUrls?.[0];
  const productImage = product.thumbnailImageUrl
    ? getImage(product.thumbnailImageUrl, 1200)
    : product.productVariants?.[0]?.imageUrls?.[0]
      ? getImage(firstVariantImage, 1200)
      : `${FRONTEND_URL}/og-shop.jpg`;

  // Calculating actual price
  const finalPrice = calculateFinalPrice(product, specialOffers);
  const displayPrice = finalPrice ?? product.regularPrice;

  // Checking if any variant has stock across all locations
  const isInStock = product.productVariants?.some((v) => v.sku > 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.productTitle,
    image: productImage,
    description: stripHtml(product.productDetails).slice(0, 300),
    sku: product.productId,
    brand: {
      "@type": "Brand",
      name: COMPANY_NAME,
    },
    offers: {
      "@type": "Offer",
      url: `${FRONTEND_URL}/product/${slug}`,
      priceCurrency: "BDT",
      price: displayPrice,
      availability: isInStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: COMPANY_NAME,
      },
    },
  };

  const safeJsonLd = JSON.stringify(jsonLd).replace(/</g, "\\u003c");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd }}
      />
      <main className="relative overflow-hidden [&_img]:select-none">
        {/* Mesh Gradient */}
        <div className="relative h-full w-full">
          <div className="fixed left-[2.5%] top-1/2 animate-blob bg-[var(--color-moving-bubble-primary)] sm:top-1/2 sm:bg-[var(--color-moving-bubble-secondary)]" />
          <div className="fixed left-[42.5%] top-[5%] animate-blob bg-[var(--color-moving-bubble-secondary)] [animation-delay:1s] sm:top-2/3 sm:bg-[var(--color-moving-bubble-primary)]" />
          <div className="fixed left-[80%] top-[15%] animate-blob bg-[var(--color-moving-bubble-secondary)] [animation-delay:2s] max-sm:hidden" />
        </div>
        {/* Shape/SVG (circle with star) */}
        <div className="absolute right-3 top-36 z-[-1] aspect-square w-56 translate-x-1/2 opacity-85 max-[1200px]:hidden">
          <Image
            src={circleWithStarShape}
            alt="circle with star shape"
            className="object-contain"
            height={0}
            width={0}
            sizes="25vw"
          />
        </div>
        <div className="pt-header-h-full-section-pb relative overflow-hidden text-sm [&_img]:pointer-events-none">
          <ProductContents
            userData={userData}
            product={product}
            specialOffers={specialOffers}
            primaryLocation={primaryLocation}
            notifyVariants={notifyVariants}
            randomViewers={randomViewers}
          />
          <ProductRelatedContents
            userData={userData}
            products={products}
            product={product}
            specialOffers={specialOffers}
            primaryLocation={primaryLocation}
            notifyVariants={notifyVariants}
          />
        </div>
      </main>
    </>
  );
}
