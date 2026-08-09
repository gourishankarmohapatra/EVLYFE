export default function Home() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>EVLYFE API Server</h1>
      <p>The API is running. Access data through the API routes:</p>
      <ul>
        <li><a href="/api/vehicles">/api/vehicles</a> - All vehicles</li>
        <li><a href="/api/brands">/api/brands</a> - All brands</li>
        <li><a href="/api/dealers">/api/dealers</a> - All dealers</li>
        <li><a href="/api/blogs">/api/blogs</a> - All blogs</li>
        <li><a href="/api/companies">/api/companies</a> - All companies</li>
        <li><a href="/api/faqs">/api/faqs</a> - FAQs</li>
        <li><a href="/api/upcoming">/api/upcoming</a> - Upcoming vehicles</li>
        <li><a href="/api/news">/api/news</a> - News feed</li>
      </ul>
      <p><a href="/index.html">Go to the main website</a></p>
    </div>
  );
}
