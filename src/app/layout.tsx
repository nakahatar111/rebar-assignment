import './globals.css'; // Ensure this imports your global CSS

export const metadata = {
  title: 'Rebar Assignment', // Set your app title
  description: 'Simplified HVAC Takeoff Tool', // Add a brief description
  icons: {
    icon: '/favicon.ico', // Ensure your favicon is set
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <header>
          <h1 style={{margin: '0px'}}>Rebar Assignment</h1>
        </header>
        <main>{children}</main>
        <footer>© 2024 Rebar Assignment</footer>
      </body>
    </html>
  );
}
