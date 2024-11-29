import { useState } from "react";
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
        <button onClick={handleExport} disabled={isDownloading}
            style={{
                padding: "5px 15px",
                borderRadius: "20px",
                border: "1px solid #007bff",
                backgroundColor: "#dbe9f9",
                color: "#007bff",
                cursor: "pointer",
                fontWeight: "bold",
                width:'140px'
            }}
          >
            {isDownloading ? "Downloading..." : "Download PDF"}
        </button>
    );
};

export default ExportPDFButton;
