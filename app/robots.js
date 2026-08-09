export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/lib/'],
      },
    ],
    sitemap: 'https://www.evlyfe.com/sitemap.xml',
  };
}
