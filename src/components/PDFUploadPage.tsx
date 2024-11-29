"use client";

import React, { useState, useEffect } from "react";
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
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
            <h1>Manage PDFs</h1>
            {/* Select Organization */}
            <div style={{ marginBottom: "20px" }}>
                <h2>Choose Target</h2>
                <select
                    value={selectedOrgId || ""}
                    onChange={(e) => setSelectedOrgId(e.target.value || null)}
                    style={{ padding: "5px", width: "300px" }}
                >
                    <option value="">Personal</option>
                    {organizations.map((org, index) => (
                        <option key={`${org.name}-${index}`} value={org.name}>
                            {org.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* File Upload */}
            <div style={{ marginBottom: "20px" }}>
                <h2>Upload Files</h2>
                <input
                    type="file"
                    accept="application/pdf"
                    multiple
                    onChange={handleFileUpload}
                />
            </div>

            {/* Personal Files */}
            <div style={{ marginBottom: "20px" }}>
                <h2>Personal Files</h2>
                {personalFiles.length > 0 ? (
                    <ul style={{ listStyleType: "none", padding: "0" }}>
                        {personalFiles.map((file, index) => (
                            <li
                                key={`personal-${file.name}-${index}`}
                                style={{
                                    cursor: "pointer",
                                    padding: "10px",
                                    border: "1px solid #ddd",
                                    marginBottom: "5px",
                                    borderRadius: "4px",
                                }}
                                onClick={() => handlePDFSelect(file.url, file.id)}
                            >
                                {file.name}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No personal files uploaded yet.</p>
                )}
            </div>

            {/* Organization Files */}
            <div>
                <h2>Organizations</h2>
                         {/* Create Organization */}
                <div style={{ marginBottom: "20px" }}>
                     <input
                        type="text"
                        placeholder="Enter organization name"
                        value={newOrgName}
                        onChange={(e) => setNewOrgName(e.target.value)}
                        style={{
                            padding: "5px",
                            marginRight: "10px",
                            width: "300px",
                        }}
                    />
                    <button onClick={handleCreateOrganization} style={{ padding: "5px 10px" }}>
                        Create/Join Organization
                    </button>
                </div>
                {organizations.map((org) => (
                    <div key={org.name} style={{ marginBottom: "20px" }}>
                        <h3>{org.name}</h3>
                        {org.pdfs.length > 0 ? (
                            <ul style={{ listStyleType: "none", padding: "0" }}>
                                {org.pdfs.map((file, index) => (
                                    <li
                                        key={`${org.name}-${file.name}-${index}`}
                                        style={{
                                            cursor: "pointer",
                                            padding: "10px",
                                            border: "1px solid #ddd",
                                            marginBottom: "5px",
                                            borderRadius: "4px",
                                        }}
                                        onClick={() => handlePDFSelect(file.url, file.id)}
                                    >
                                        {file.name}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No files uploaded for this organization yet.</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PDFUploadPage;
