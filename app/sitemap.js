import { vehicles, blogs, companies } from '../lib/data';

export default function sitemap() {
  const baseUrl = 'https://www.evlyfe.com';
  const now = new Date();

  const staticPages = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/electric-vehicles.html`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/electric-cars.html`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/electric-scooters.html`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/electric-bikes.html`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/compare.html`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/companies.html`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/dealer-showrooms.html`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/blog.html`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/contact.html`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/careers.html`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/privacy.html`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${baseUrl}/terms.html`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${baseUrl}/sitemap-page.html`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
  ];

  const vehiclePages = vehicles.map((v) => ({
    url: `${baseUrl}/vehicle.html?slug=${v.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const blogPages = blogs.map((b) => ({
    url: `${baseUrl}/blog-article.html?slug=${b.slug}`,
    lastModified: new Date(b.date),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const companyPages = companies.map((c) => ({
    url: `${baseUrl}/companies.html?slug=${c.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticPages, ...vehiclePages, ...blogPages, ...companyPages];
}
