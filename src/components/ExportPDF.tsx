import { PDFDocument, rgb, degrees  } from "pdf-lib";

const hexToRgb = (hex: string) => {
    hex = hex.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return { r, g, b };
};

export const exportPDF = async ({
    pdfUrl,
    droppedIcons,
}: {
    pdfUrl: string;
    droppedIcons: any[];
}) => {
    try {
        // Fetch and load the original PDF
        const existingPdfBytes = await fetch(pdfUrl).then((res) => res.arrayBuffer());
        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        // Add overlays to each page
        droppedIcons.forEach((icon, index) => {
            console.log(`Icon at index ${index}:`, icon);

            // Validate the icon structure
            if (!icon || !icon.page || !icon.color || !icon.shape || !icon.size) {
                console.error(`Invalid icon at index ${index}:`, icon);
                return; // Skip this icon
            }

            const page = pdfDoc.getPage(icon.page - 1);
            if (!page) {
                console.error(`Page ${icon.page} does not exist in the PDF.`);
                return; // Skip this icon
            }

            console.log("Page retrieved successfully:", page);

            const pageHeight = page.getHeight(); // Get page height for flipping coordinates
            const flippedY = pageHeight - icon.y;

            const color = hexToRgb(icon.color);
            const overlayColor = rgb(color.r / 255, color.g / 255, color.b / 255);

            try {
                if (icon.shape === "circle") {
                    page.drawEllipse({
                        x: icon.x,
                        y: flippedY,
                        xScale: icon.size / 2,
                        yScale: icon.size / 2,
                        color: overlayColor,
                        opacity: 0.5,
                    });
                } else if (icon.shape === "square") {
                    page.drawRectangle({
                        x: icon.x - icon.size / 2,
                        y: flippedY - icon.size / 2,
                        width: icon.size,
                        height: icon.size,
                        color: overlayColor,
                        opacity: 0.5,
                    });
                } else if (icon.shape === "diamond") {
                    const halfSize = icon.size / 2;
                
                    page.drawRectangle({
                        x: icon.x,
                        y: flippedY - halfSize,
                        width: icon.size / 1.5,
                        height: icon.size / 1.5,
                        color: overlayColor,
                        opacity: 0.5,
                        rotate: degrees(45), // Rotate by 45 degrees
                    });
                } else if (icon.shape === "checkmark") {
                    const scaleFactor = icon.size / 100; // Base scaling factor
                    const checkmarkPath = `
                        M ${scaleFactor * 100} ${scaleFactor * 31} 
                        L ${scaleFactor * 43} ${scaleFactor * 100} 
                        L ${scaleFactor * 4} ${scaleFactor * 63} 
                        L ${scaleFactor * 16} ${scaleFactor * 53} 
                        L ${scaleFactor * 43} ${scaleFactor * 78} 
                        L ${scaleFactor * 88} ${scaleFactor * 22} Z
                    `.trim().replace(/\s+/g, ' ');
                    console.log("Scaled Checkmark Path:", checkmarkPath);
                    const halfSize = icon.size / 2;
                
                    page.drawSvgPath(checkmarkPath, {
                        x: icon.x - halfSize,
                        y: flippedY + halfSize,
                        color: overlayColor,
                        opacity: 0.5,
                    });
                }
                
            } catch (drawError) {
                console.error(
                    `Error drawing shape '${icon.shape}' at index ${index}:`,
                    drawError
                );
            }
        });

        // Save the modified PDF
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "output_with_overlays.pdf";
        link.click();
    } catch (error) {
        console.error("Error exporting PDF:", error);
    }
};
