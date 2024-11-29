
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, fetchAuthSession } from "aws-amplify/auth";
import dynamic from "next/dynamic";

const PDFUploadPage = dynamic(() => import("@/components/PDFUploadPage"), { ssr: false });

const UploadPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        // try to refresh the session first
        await fetchAuthSession({ forceRefresh: true }); 
        // Check if the user is authenticated
        await getCurrentUser();
        setLoading(false);
      } catch (error) {
        console.error("User not authenticated:", error);
        router.push("/login");
      } 
    };

    checkUser();
  }, [router]);

  if (loading) {
    return <p style={{marginLeft:'auto', marginRight:'auto', fontFamily: 'Arial, sans-serif' }}>Loading...</p>;
  }
  else{
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh', width:'100vw' }}>
      <PDFUploadPage />
    </div>
    
    
  }
};

export default UploadPage;
