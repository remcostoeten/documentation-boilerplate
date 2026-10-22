import Image from "next/image";
import { site } from "@/shared/config/site";

export function Logo() {
  const { logo } = site;
  if (!logo) return null;
  const alt = logo.hideName ? (logo.alt ?? site.name) : "";
  const common = { alt, width: logo.width, height: logo.height, unoptimized: true };

  return (
    <>
      <Image src={logo.src} {...common} className={logo.darkSrc ? "dark:hidden" : undefined} />
      {logo.darkSrc ? <Image src={logo.darkSrc} {...common} className="hidden dark:block" /> : null}
    </>
  );
}
