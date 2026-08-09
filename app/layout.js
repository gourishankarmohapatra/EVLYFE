export const metadata = {
  title: 'EVLYFE - Electric Vehicles India',
  description: 'EVLYFE lists 200+ electric vehicles across all categories.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
