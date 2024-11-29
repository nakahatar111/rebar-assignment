"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "aws-amplify/auth"; // Correct import for getCurrentUser
// import PDFViewer from "../../components/PDFViewer";
import dynamic from "next/dynamic";

const PDFViewer = dynamic(() => import("@/components/PDFViewer"), { ssr: false });

const PDFViewerPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        // Check if the user is authenticated
        await getCurrentUser();
        setLoading(false);
      } catch (error) {
        console.error("User not authenticated:", error);
        // Redirect to the sign-up page if not logged in
        router.push("/login");
      } 
    };

    checkUser();
  }, [router]);

  if (loading) {
    return <p style={{marginLeft:'auto', marginRight:'auto', fontFamily: 'Arial, sans-serif' }}>Loading...</p>;
  }
  else{
    return <PDFViewer />;
  }
};

export default PDFViewerPage;
