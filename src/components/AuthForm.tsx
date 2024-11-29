"use client";

import { useState, useEffect } from 'react';
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

  const createUserEntry = async (username: string) => {
    try {
      const response = await fetch("https://nrkqvh55re.execute-api.us-east-1.amazonaws.com/", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'createUser',
          username, // User's email or username
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to create user entry in DynamoDB');
      }

      const data = await response.json();
      console.log(data);

  
      console.log('DynamoDB user entry created successfully');
    } catch (err) {
      console.log('Error creating user entry in DynamoDB:', err);
    }
  };
  

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
      
      await createUserEntry(username);

      setSuccessMessage('Sign-up successful! Please check your email for the verification link');
      console.log('Sign-up success:', response);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Error during sign-up. Please try again.');
        console.log('Sign-up error:', err);
      } else {
        setError('Error during sign-up. Please try again.');
        console.log('Sign-up error:', err);
      }
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
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Error during sign-in. Please check your credentials.');
        console.log('Sign-in error:', err);
      } else {
        setError('Error during sign-in. Please check your credentials.');
        console.log('Sign-in error:', err);
      }
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f4f4f4',
        marginLeft:'auto',
        marginRight:'auto'
      }}
    >
      <div
        style={{
          width: '350px',
          padding: '30px',
          backgroundColor: '#fff',
          borderRadius: '15px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
        }}
      >
        <h2 style={{ fontSize: '24px', marginBottom: '20px', fontFamily: 'Arial, sans-serif' }}>Login</h2>
        {error && <p style={{ color: 'red', marginBottom: '10px' , fontFamily: 'Arial, sans-serif' }}>{error}</p>}
        {successMessage && <p style={{ color: 'green', marginBottom: '10px' , fontFamily: 'Arial, sans-serif' }}>{successMessage}</p>}
        <div style={{ marginBottom: '20px', textAlign: 'left' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '10px', fontSize:'20px', fontFamily: 'Arial, sans-serif' }}>Email</label>
          <input
            type="text"
            placeholder="Enter Email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '20px',
              border: '1px solid #ddd',
              marginBottom: '20px',
              fontSize: '16px',
            }}
          />
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '10px', fontSize:'20px', fontFamily: 'Arial, sans-serif'}}>Password</label>
          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '20px',
              border: '1px solid #ddd',
              marginBottom: '20px',
              fontSize: '16px',
            }}
          />
        </div>
        <div>
          <button
            onClick={handleSignUp}
            style={{
              marginRight: '10px',
              padding: '10px 20px',
              fontSize: '16px',
              cursor: 'pointer',
              backgroundColor: '#55A4FF',
              color: '#FFF',
              border: 'none',
              borderRadius: '20px',
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
              borderRadius: '20px',
            }}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}