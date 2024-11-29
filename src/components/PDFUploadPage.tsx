"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

type PDFFile = {
    id: string;
    name: string;
    url: string; // Local or remote URL
};

type Organization = {
    id: string; // Unique ID (for eventual backend use)
    name: string;
    pdfs: PDFFile[];
};


const getUserId = async () => {
    try {
        await fetchAuthSession({ forceRefresh: true }); // try to refresh the session first
        // Check if the user is authenticated
        const user = await getCurrentUser();
        return user.signInDetails?.loginId; // Cognito `sub` is the unique user ID
    } catch (error) {
        console.error("Error getting user ID:", error);
        return null; // Handle error if user is not signed in
    }
};


const PDFUploadPage = () => {
    const [personalFiles, setPersonalFiles] = useState<PDFFile[]>([]);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [selectedOrgId, setSelectedOrgId] = useState<string | null>("");
    const [newOrgName, setNewOrgName] = useState("");
    const router = useRouter();

    const fetchOrganizationsAndProjects = async () => {
        try {
            const userId = await getUserId(); // Get the logged-in user's ID
            if (!userId) {
                alert("User is not authenticated. Please log in.");
                return;
            }
    
            // Fetch user organizations and projects
            const response = await fetch("https://nrkqvh55re.execute-api.us-east-1.amazonaws.com/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    action: "getOrganizationsAndProjects",
                    userId: userId,
                }),
            });
    
            if (!response.ok) {
                throw new Error("Failed to fetch organizations and projects.");
            }
    
            const data = await response.json();
            console.log("Organizations and Projects loaded:", data);
    
            // Extract organizations
            const userOrganizations = data.userOrganizations || [];
    
            // Extract personal project list
            const personalProjects = data.personalFiles || []; // Assuming backend returns personal projects
    
            // Set personal files
            const personal_files: PDFFile[] = personalProjects.map((project: any) => ({
                id: project.id,
                name: project.name,
                url: `${project.url}`,
            }));
            console.log(personal_files);
            setPersonalFiles(personal_files);
    
            // Map organizations and projects
            const orgList: Organization[] = userOrganizations.map((org: any) => {
                return {
                    id: org.id,
                    name: org.name,
                    pdfs: org.pdfs.map((project: any) => ({
                        id: project.id,
                        name: project.name,
                        url: `${project.url}`,
                    })),
                };
            });
    
            setOrganizations(orgList);
        } catch (error) {
            console.error("Error fetching organizations and projects:", error);
        }
    };
    
    useEffect(() => {
        fetchOrganizationsAndProjects();
    }, []);


    // Handle file uploads for personal files or selected organization
    const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
    
        const userId = await getUserId();
        if (!userId) {
            alert("User is not authenticated. Please log in.");
            return;
        }
    
        try {
            for (const file of files) {
                // Convert file to base64
                const fileBase64 = await convertFileToBase64(file);
                console.log("Userid:", userId);
                console.log("org id:", selectedOrgId);
                console.log("chosen:", selectedOrgId !== "" ? selectedOrgId : userId);

                // Construct JSON request body
                const body = JSON.stringify({
                    action: "uploadPDF",
                    userId: selectedOrgId !== "" ? selectedOrgId : userId,
                    pdfName: file.name,
                    pdf: fileBase64,
                });
    
                const response = await fetch(
                    "https://nrkqvh55re.execute-api.us-east-1.amazonaws.com/",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: body,
                    }
                );
    
                if (!response.ok) {
                    throw new Error("Failed to upload PDF.");
                }
    
                const data = await response.json();
                console.log("PDF Upload Response:", data);
    
                const uploadedFile: PDFFile = {
                    id: data.id,
                    name: file.name,
                    url: data.pdfUrl, // Use the S3 pre-signed URL
                };
    
                if (selectedOrgId) {
                    setOrganizations((prev) =>
                        prev.map((org) =>
                            org.id === selectedOrgId
                                ? { ...org, pdfs: [...org.pdfs, uploadedFile] }
                                : org
                        )
                    );
                } else {
                    setPersonalFiles((prev) => [...prev, uploadedFile]);
                }
            }
        } catch (error) {
            console.error("Error uploading PDF:", error);
        }
    };
    
    // Helper function to convert file to base64
    const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    // Select a PDF to view
    const handlePDFSelect = (url: string, projectId: string) => {
        router.push(`/pdf-viewer?pdfUrl=${encodeURIComponent(url)}&projectId=${encodeURIComponent(projectId)}`);
    };
    

    // Create a new organization
    const handleCreateOrganization = async () => {
        if (!newOrgName.trim()) {
            alert("Organization name cannot be empty!");
            return;
        }
    
        try {
            const userId = await getUserId(); // Get the logged-in user's ID
            console.log(userId);
            if (!userId) {
                alert("User is not authenticated. Please log in.");
                return;
            }
            const response = await fetch("https://nrkqvh55re.execute-api.us-east-1.amazonaws.com/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    action: "createOrJoinOrg",
                    userId: userId,
                    orgName: newOrgName.trim(),
                }),
            });
    
            if (!response.ok) {
                throw new Error("Failed to create or join organization.");
            }
    
            const data = await response.json();
            console.log("Organization Response:", data);
    
            if (data.userOrganizations) {
                // Set all organizations the user is part of into the local state
                const orgList = data.userOrganizations.map((org: any) => ({
                    id: org.id, // Use the organization name as the ID for now
                    name: org.name,
                    pdfs: org.pdfs || [],
                }));
                setOrganizations(orgList); // Update the organizations state with the list
            }
    
            setNewOrgName("");
        } catch (error) {
            console.error("Error creating or joining organization:", error);
        }
    };

    return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: "#f4f4f4",
            padding: "20px",
            maxHeight: "70vh",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <div
            style={{
              width: "100%",
              backgroundColor: "#ffffff",
              borderRadius: "15px",
              padding: "20px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h1 style={{ fontSize: "24px", textAlign: "center", marginBottom: "20px" }}>Upload Project</h1>
    
            <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                <label style={{ fontWeight: "bold", flex: "0 0 150px" }}>Choose Target</label>
                <select
                    value={selectedOrgId || ""}
                    onChange={(e) => setSelectedOrgId(e.target.value || null)}
                    style={{
                    flex: "1",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "1px solid #ddd",
                    }}
                >
                    <option value="">Personal</option>
                    {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                        {org.name}
                    </option>
                    ))}
                </select>
            </div>

            <div style={{ marginBottom: "30px", display: "flex", alignItems: "center", gap: "10px" }}>
                <label style={{ fontWeight: "bold", flex: "0 0 150px" }}>Upload PDF</label>
                <input
                    type="file"
                    accept="application/pdf"
                    multiple
                    onChange={handleFileUpload}
                    style={{
                    flex: "1",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "1px solid #ddd",
                    }}
                />
            </div>

    
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "20px",
              }}
            >
            {/* Personal Files */}
            <div
            style={{
                flex: 1,
                backgroundColor: "#f9f9f9",
                borderRadius: "10px",
                padding: "20px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                maxHeight: "400px", // Set the maximum height
                overflowY: "auto", // Enable scrolling when content exceeds max height
            }}
            >
            <h2 style={{ fontSize: "20px", marginBottom: "10px" }}>Personal Files</h2>
            {personalFiles.length > 0 ? (
                personalFiles.map((file, index) => (
                <div
                    key={file.id}
                    style={{
                    padding: "9px",
                    borderTop: index === 0 ? "1px solid #999999" : "none",
                    borderBottom: "#999999 solid 1px",
                    cursor: "pointer",
                    }}
                    onClick={() => handlePDFSelect(file.url, file.id)}
                >
                    {file.name}
                </div>
                ))
            ) : (
                <p>No personal files uploaded yet.</p>
            )}
            </div>
              {/* Organizations */}
              <div
                style={{
                  flex: 1,
                  backgroundColor: "#f9f9f9",
                  borderRadius: "10px",
                  padding: "20px",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  maxHeight: "400px", // Set maximum height
                  overflowY: "auto", // Enable scrolling when content exceeds max height
                }}
              >
            <h2 style={{ fontSize: "20px", marginBottom: "10px" }}>Organization</h2>
            <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                <input
                    type="text"
                    placeholder="Enter Organization Name"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    style={{
                    flex: "1", // Allow the input to take the remaining space
                    padding: "10px",
                    borderRadius: "10px",
                    border: "1px solid #ddd",
                    }}
                />
                <button
                    onClick={handleCreateOrganization}
                    style={{
                    padding: "10px 20px", // Adjust padding for better button size
                    borderRadius: "10px",
                    border: "1px solid #379EA9",
                    backgroundColor: "#379EA9",
                    color: "#fff",
                    cursor: "pointer",
                    flexShrink: 0, // Prevent the button from shrinking
                    }}
                >
                    Create/Join
                </button>
                </div>

                {organizations.map((org) => (
                  <div key={org.id}>
                    <h3 style={{ fontSize: "18px", marginBottom: "10px" }}>{org.name}</h3>
                    {org.pdfs.length > 0 ? (
                      org.pdfs.map((file, index) => (
                        <div
                          key={file.id}
                          style={{
                            padding: "9px",
                            borderTop: index === 0 ? "1px solid #999999" : "none",
                            borderBottom: "#999999 solid 1px",
                            cursor: "pointer",
                          }}
                          onClick={() => handlePDFSelect(file.url, file.id)}
                        >
                          {file.name}
                        </div>
                      ))
                    ) : (
                      <p>No files uploaded for this organization yet.</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    };
    
    export default PDFUploadPage;