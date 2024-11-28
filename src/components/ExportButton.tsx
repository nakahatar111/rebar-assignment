import React, { useState } from "react";
import { exportPDF } from "./ExportPDF";

const ExportPDFButton = ({
    pdfUrl,
    droppedIcons,
}: {
    pdfUrl: string;
    droppedIcons: any[];
}) => {
    const [isDownloading, setIsDownloading] = useState(false); // Track download state

    const handleExport = async () => {
        setIsDownloading(true); // Set downloading state to true
        try {
            await exportPDF({ pdfUrl, droppedIcons });
        } catch (error) {
            console.error("Error exporting PDF:", error);
        } finally {
            setIsDownloading(false); // Reset downloading state
        }
    };

    return (
        <button onClick={handleExport} disabled={isDownloading}>
            {isDownloading ? "Downloading..." : "Download PDF"}
        </button>
    );
};

export default ExportPDFButton;
