import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/page";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageActions } from "@/modules/docs/components/page-actions";
import { PageMeta } from "@/modules/docs/components/page-meta";
import { mdxComponents } from "@/modules/docs/mdx-components";
import { Feedback } from "@/modules/feedback/components/feedback";
import { pageImage, pageJsonLd } from "@/modules/docs/server/seo";
import { source } from "@/modules/docs/server/source";
import { repositoryFileUrl } from "@/shared/config/repository";
import { site } from "@/shared/config/site";

type Props = {
  params: Promise<{ slug?: string[] }>;
};

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const { tocDepth } = page.data;
  const toc = tocDepth ? page.data.toc.filter((item) => item.depth <= tocDepth) : page.data.toc;

  return (
    <DocsPage toc={toc} tableOfContent={{ style: "clerk" }} breadcrumb={{ enabled: false }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: pageJsonLd(page) }} />
      <DocsTitle>{page.data.title}</DocsTitle>
      {page.data.description ? <DocsDescription>{page.data.description}</DocsDescription> : null}
      <PageActions markdownUrl={`${page.url}.mdx`} />
      <DocsBody>
        <MDX components={mdxComponents} />
      </DocsBody>
      <Feedback url={page.url} />
      <PageMeta
        editUrl={
          site.pageFooter.editLink &&
          (page.data.editUrl ?? repositoryFileUrl(`${site.contentDir}/${page.path}`))
        }
        lastModified={site.pageFooter.lastUpdated ? page.data.lastModified : undefined}
      />
    </DocsPage>
  );
}

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();
  const image = pageImage(page).url;
  return {
    title: page.data.title,
    description: page.data.description,
    alternates: { canonical: page.url },
    openGraph: {
      title: page.data.title,
      description: page.data.description,
      url: page.url,
      images: image,
    },
    twitter: { card: "summary_large_image", title: page.data.title, images: image },
  };
}
