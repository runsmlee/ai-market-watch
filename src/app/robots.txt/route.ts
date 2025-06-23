export function GET(): Response {
  const robots = {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/private/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/private/'],
      },
    ],
    sitemap: 'https://ai-market-watch.com/sitemap.xml',
    host: 'https://ai-market-watch.com',
  }

  const robotsText = `# robots.txt for AI Market Watch
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /private/

User-agent: Googlebot
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /private/

Sitemap: https://ai-market-watch.com/sitemap.xml
Host: https://ai-market-watch.com

# AI Market Watch - AI Startups Intelligence Platform
# Visit us at: https://ai-market-watch.com
# For questions about crawling: contact@ai-market-watch.com`

  return new Response(robotsText, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
} 