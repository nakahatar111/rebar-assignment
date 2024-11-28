"use client"
import './globals.css'; // Ensure this imports your global CSS
import Link from 'next/link'; // Import Next.js Link component
import { Amplify } from 'aws-amplify';
import awsconfig from '../aws-exports'; // Ensure this path is correct
import { signOut } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';
import React from 'react';

Amplify.configure(awsconfig);


export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(); // Signs out the user
      console.log('User signed out successfully.');
      router.push('/login'); // Redirect to the login page
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 20px',
            backgroundColor: '#f4f4f4',
            borderBottom: '1px solid #ddd',
          }}
        >
          <h1 style={{ margin: '0px' }}>Rebar Assignment</h1>
          <nav>
            <Link href="/upload" style={{ textDecoration: 'none', color: '#007bff' }}>
              Upload Page
            </Link>
            <button
              onClick={handleSignOut}
              style={{
                background: 'none',
                border: 'none',
                color: '#007bff',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: '16px',
              }}
            >
              Sign Out
            </button>
          </nav>
        </header>
        <main style={{ padding: '20px' }}>{children}</main>
        <footer
          style={{
            marginTop: '20px',
            textAlign: 'center',
            padding: '10px',
            borderTop: '1px solid #ddd',
            backgroundColor: '#f4f4f4',
          }}
        >
          © 2024 Rebar Assignment
        </footer>
      </body>
    </html>
  );
}
