"use client"
import './globals.css'; 
import Link from 'next/link';
import { Amplify } from 'aws-amplify';
import awsconfig from '../aws-exports';
import { signOut } from 'aws-amplify/auth';
import { useRouter, usePathname  } from 'next/navigation';
import { ReactNode } from 'react';

Amplify.configure(awsconfig);


export default function RootLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    try {
      await signOut();
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
            width:'60%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 20px',
            backgroundColor: '#E7E7E7',
            borderBottom: '1px solid #ddd',
            borderRadius: '50px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', 
            margin: '10px', 
            marginRight:'auto',
            marginLeft:'auto'
          }}
        >
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontFamily: 'Arial, sans-serif',
              width:"100%"
            }}
          >
            {/* Rebar text */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1
                style={{
                  marginLeft:'20px',
                  fontSize: '30px',
                  fontWeight: 'bold',
                }}
              >
                Rebar
              </h1>
              {pathname !== '/login' && <Link
                href="/upload"
                style={{
                  textDecoration: 'none',
                  color: '#379EA9',
                  fontSize: '20px',
                  fontWeight: 'normal',
                  cursor: 'pointer',
                  paddingLeft:'20px'
                }}
              >
                Projects
              </Link>}
            </div>

            {/* Upload Link and Sign Out Button */}
            {pathname !== '/login' && <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <button
                onClick={handleSignOut}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid #379EA9',
                  borderRadius: '20px',
                  color: '#379EA9',
                  padding: '5px 15px',
                  cursor: 'pointer',
                  fontSize: '16px', 
                  fontWeight: 'bold',
                  transition: 'background-color 0.3s, color 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#379EA9';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#379EA9';
                }}
              >
                Sign Out
              </button>
            </div>}
          </nav>
        </header>
        <main style={{ padding: '20px' }}>{children}</main>
      </body>
    </html>
  );
}