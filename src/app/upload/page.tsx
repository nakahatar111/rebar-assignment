
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, fetchAuthSession } from "aws-amplify/auth"; // Correct import for getCurrentUser
import dynamic from "next/dynamic";

const PDFUploadPage = dynamic(() => import("@/components/PDFUploadPage"), { ssr: false });

const UploadPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        await fetchAuthSession({ forceRefresh: true }); // try to refresh the session first
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
    return <p>Loading...</p>; // Display a loading message or spinner while checking authentication
  }
  else{
    return <PDFUploadPage />;
  }
};

export default UploadPage;
