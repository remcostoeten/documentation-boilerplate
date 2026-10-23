import { redirect } from "next/navigation";
import { SiteFooter } from "@/modules/footer";
import { LandingFeatures, LandingFooter, LandingHeader, LandingHero } from "@/modules/landing";
import { site } from "@/shared/config/site";

export default function Page() {
  if (!site.landing) redirect("/docs");

  return (
    <>
      <LandingHeader />
      <main>
        <LandingHero />
        <LandingFeatures />
      </main>
      {site.footer ? <SiteFooter /> : <LandingFooter />}
    </>
  );
}
