export interface MetadataProps {
  title: string;
  description: string;
  url: string;
  image?: string;
  type?: 'article' | 'website';
  date?: string;
  authorName?: string;
}

export function constructMetadata({
  title,
  description,
  url,
  image = 'https://ohadleshno.com/hero-cover.webp',
  type = 'website',
}: MetadataProps) {
  return {
    title: `${title} | Ohad Leshno`,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'Ohad Leshno Blog',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export function generateJsonLdArticle({
  title,
  description,
  url,
  image,
  date,
  authorName = 'Ohad Leshno',
}: MetadataProps) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: description,
    image: image ? [image] : [],
    datePublished: date,
    dateModified: date,
    author: {
      '@type': 'Person',
      name: authorName,
      url: 'https://ohadleshno.com',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  });
}
