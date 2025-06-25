'use client';

import Head from 'next/head';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

export default function SEOHead({
  title = 'AI Market Watch - AI Startups Intelligence Platform',
  description = 'Lively insights into the global AI startup ecosystem. Real-time intelligence, market analysis, and startup tracking.',
  keywords = 'AI startups, artificial intelligence, startup funding, VC analysis, tech investment, AI companies, startup intelligence, market research, funding rounds, AI ecosystem, venture capital, technology trends',
  image = '/main-og-image.png',
  url = 'https://ai-market-watch.com',
  type = 'website',
  publishedTime,
  modifiedTime,
  author = 'AI Market Watch Team',
  section,
  tags = [],
}: SEOHeadProps) {
  const fullImageUrl = image.startsWith('http') ? image : `https://ai-market-watch.com${image}`;

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:site_name" content="AI Market Watch" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullImageUrl} />
      <meta property="twitter:creator" content="@aimarketwatch" />
      <meta property="twitter:site" content="@aimarketwatch" />

      {/* Article specific meta tags */}
      {type === 'article' && (
        <>
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {author && <meta property="article:author" content={author} />}
          {section && <meta property="article:section" content={section} />}
          {tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Additional SEO Tags */}
      <meta name="theme-color" content="#000000" />
      <meta name="msapplication-TileColor" content="#000000" />
      <meta name="application-name" content="AI Market Watch" />
      <meta name="apple-mobile-web-app-title" content="AI Market Watch" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* Preconnect for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': type === 'article' ? 'Article' : 'WebSite',
            name: title,
            description: description,
            url: url,
            image: fullImageUrl,
            author: {
              '@type': 'Organization',
              name: author,
            },
            publisher: {
              '@type': 'Organization',
              name: 'AI Market Watch',
              logo: {
                '@type': 'ImageObject',
                url: 'https://ai-market-watch.com/logo.png',
              },
            },
            ...(type === 'article' && {
              headline: title,
              datePublished: publishedTime,
              dateModified: modifiedTime || publishedTime,
              mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': url,
              },
            }),
            ...(type === 'website' && {
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://ai-market-watch.com/search?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }),
        }}
      />
    </Head>
  );
} 