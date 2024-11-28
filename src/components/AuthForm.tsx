"use client";

import React, { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { SignUpInput, SignUpOutput, signUp, signIn, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import awsconfig from '../aws-exports';
import { useRouter } from 'next/navigation';

Amplify.configure(awsconfig);

export default function AuthForm() {
  const router = useRouter(); // Initialize the router for redirection
  const [username, setUsername] = useState<string>(''); // For email or username
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check if a user is already signed in and redirect to /upload
  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        await fetchAuthSession({ forceRefresh: true }); // try to refresh the session first
        // Check if the user is authenticated
        const currentUser = await getCurrentUser();
        if (currentUser) {
          console.log("User already signed in:", currentUser);
          router.push("/upload"); // Redirect if the user is signed in
        }
      } catch (err) {
        console.log("No signed-in user:", err); // No action needed if not signed in
      }
    };

    checkCurrentUser();
  }, [router]);

  // Sign-Up Function
  const handleSignUp = async () => {

    setError(null);
    setSuccessMessage(null);

    const signUpInput: SignUpInput = {
      username, // Use "username" for email or username as the identifier
      password,
    };

    try {
      const response: SignUpOutput = await signUp(signUpInput);
      setSuccessMessage('Sign-up successful! Please check your email for verification link');
      console.log('Sign-up success:', response);
    } catch (err: any) {
      setError(err.message || 'Error during sign-up. Please try again.');
      console.error('Sign-up error:', err);
    }
  };

  // Sign-In Function
  const handleSignIn = async () => {
    setError(null);
    setSuccessMessage(null);

    try {
      const user = await signIn({ username, password });
      setSuccessMessage('Sign-in successful!');
      console.log('Sign-in success:', user);
      router.push('/upload');
    } catch (err: any) {
      setError(err.message || 'Error during sign-in. Please check your credentials.');
      console.error('Sign-in error:', err);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
      <h2>Authentication</h2>
      {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
      {successMessage && <p style={{ color: 'green', marginBottom: '10px' }}>{successMessage}</p>}
      <input
        type="text"
        placeholder="Email or Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ marginBottom: '10px', width: '100%', padding: '8px', fontSize: '16px' }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ marginBottom: '10px', width: '100%', padding: '8px', fontSize: '16px' }}
      />
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={handleSignUp}
          style={{
            marginRight: '10px',
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            backgroundColor: '#007BFF',
            color: '#FFF',
            border: 'none',
            borderRadius: '5px',
          }}
        >
          Sign Up
        </button>
        <button
          onClick={handleSignIn}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            backgroundColor: '#28A745',
            color: '#FFF',
            border: 'none',
            borderRadius: '5px',
          }}
        >
          Sign In
        </button>
      </div>
    </div>
  );
}
