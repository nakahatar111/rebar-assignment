"use client";
import dynamic from "next/dynamic";

const AuthForm = dynamic(() => import("@/components/AuthForm"), { ssr: false });

export default function LoginPage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div>
        <h1>Login</h1>
        <AuthForm />
      </div>
    </div>
  );
}