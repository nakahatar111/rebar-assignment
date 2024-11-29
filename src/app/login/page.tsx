"use client";
import dynamic from "next/dynamic";

const AuthForm = dynamic(() => import("@/components/AuthForm"), { ssr: false });

export default function LoginPage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh', width:'100vw' }}>
        <AuthForm />
    </div>
  );
}