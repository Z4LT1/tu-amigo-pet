import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Overlays } from "@/components/layout/Overlays";
import { BottomNav } from "@/components/layout/BottomNav";
import { PromoPopup } from "@/components/layout/PromoPopup";
import { JsonLd } from "@/components/seo/JsonLd";
import { site } from "@/config/site";
import { getCategories } from "@/lib/catalog";

const localBusiness = {
  "@context": "https://schema.org",
  "@type": ["PetStore", "VeterinaryCare"],
  "@id": `${site.url}/#negocio`,
  name: site.name,
  legalName: site.legalName,
  description: site.description,
  url: site.url,
  telephone: site.contact.phone,
  email: site.contact.email,
  image: `${site.url}/opengraph-image`,
  priceRange: "$$",
  currenciesAccepted: "CLP",
  paymentAccepted: "Tarjeta de débito, tarjeta de crédito, transferencia",
  address: {
    "@type": "PostalAddress",
    streetAddress: site.contact.address,
    addressLocality: site.contact.city,
    addressRegion: site.contact.region,
    addressCountry: site.contact.country,
  },
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "10:00", closes: "19:30" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "10:00", closes: "14:00" },
  ],
  sameAs: Object.values(site.social),
};

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories();
  return (
    <>
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>
      <SiteHeader />
      <main id="contenido">{children}</main>
      <SiteFooter />
      <Overlays categories={categories.map((c) => ({ slug: c.slug, name: c.name }))} />
      <BottomNav />
      <PromoPopup />
      <JsonLd data={localBusiness} />
    </>
  );
}
