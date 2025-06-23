export function GET(): Response {
  const manifest = {
    name: 'AI Market Watch - AI Startups Intelligence Platform',
    short_name: 'AI Market Watch',
    description: 'Comprehensive intelligence platform tracking global AI startups, funding rounds, and market trends.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'en',
    categories: ['business', 'finance', 'productivity'],
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    shortcuts: [
      {
        name: 'Latest Startups',
        short_name: 'Latest',
        description: 'View the latest AI startups',
        url: '/?filter=latest',
        icons: [
          {
            src: '/icon-96x96.png',
            sizes: '96x96',
          },
        ],
      },
      {
        name: 'Analytics',
        short_name: 'Analytics',
        description: 'View market analytics',
        url: '/analytics',
        icons: [
          {
            src: '/icon-96x96.png',
            sizes: '96x96',
          },
        ],
      },
    ],
  }

  return new Response(JSON.stringify(manifest, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  })
} 