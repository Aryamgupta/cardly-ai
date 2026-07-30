import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cardly - Smart Business Card Scanner',
    short_name: 'Cardly',
    description: 'Scan, store, and manage your network with AI.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#0B1020',
    theme_color: '#0B1020',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
