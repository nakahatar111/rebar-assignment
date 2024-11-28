"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

type PDFFile = {
    name: string;
    url: string; // Local or remote URL
};

type Organization = {
    id: string; // Unique ID (for eventual backend use)
    name: string;
    pdfs: PDFFile[];
};

const PDFUploadPage = () => {
    const [personalFiles, setPersonalFiles] = useState<PDFFile[]>([]);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
    const [newOrgName, setNewOrgName] = useState("");
    const router = useRouter();

    // Handle file uploads for personal files or selected organization
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newFiles: PDFFile[] = Array.from(files).map((file) => ({
            name: file.name,
            url: URL.createObjectURL(file), // Temporary URL for local preview
        }));

        if (selectedOrgId) {
            // Add to selected organization's PDFs
            setOrganizations((prev) =>
                prev.map((org) =>
                    org.id === selectedOrgId
                        ? { ...org, pdfs: [...org.pdfs, ...newFiles] }
                        : org
                )
            );
        } else {
            // Add to personal files
            setPersonalFiles((prev) => [...prev, ...newFiles]);
        }
        // Send file info to Lambda
        try {
            const response = await fetch("https://nrkqvh55re.execute-api.us-east-1.amazonaws.com/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: "12345", // Replace with actual user ID from context or state
                    organizationId: selectedOrgId || "personal", // Indicate if it's personal or associated with an organization
                    files: newFiles.map((file) => ({ name: file.name, url: file.url })), // Send file metadata
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to send data to Lambda.");
            }

            const data = await response.json();
            console.log("Lambda Response:", data);
        } catch (error) {
            console.error("Error sending data to Lambda:", error);
        }
    };

    // Create a new organization
    const handleCreateOrganization = () => {
        if (!newOrgName.trim()) {
            alert("Organization name cannot be empty!");
            return;
        }

        const newOrg: Organization = {
            id: `org-${Date.now()}`, // Unique ID (for eventual backend use)
            name: newOrgName.trim(),
            pdfs: [],
        };

        setOrganizations((prev) => [...prev, newOrg]);
        setNewOrgName("");
    };

    // Select a PDF to view
    const handlePDFSelect = (url: string) => {
        router.push(`/pdf-viewer?pdfUrl=${encodeURIComponent(url)}`);
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
                    {organizations.map((org) => (
                        <option key={org.id} value={org.id}>
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
                                key={index}
                                style={{
                                    cursor: "pointer",
                                    padding: "10px",
                                    border: "1px solid #ddd",
                                    marginBottom: "5px",
                                    borderRadius: "4px",
                                }}
                                onClick={() => handlePDFSelect(file.url)}
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
                    <div key={org.id} style={{ marginBottom: "20px" }}>
                        <h3>{org.name}</h3>
                        {org.pdfs.length > 0 ? (
                            <ul style={{ listStyleType: "none", padding: "0" }}>
                                {org.pdfs.map((file, index) => (
                                    <li
                                        key={index}
                                        style={{
                                            cursor: "pointer",
                                            padding: "10px",
                                            border: "1px solid #ddd",
                                            marginBottom: "5px",
                                            borderRadius: "4px",
                                        }}
                                        onClick={() => handlePDFSelect(file.url)}
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
