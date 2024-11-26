"use client";

import React, { useState, useEffect, useRef } from "react";

type Annotation = {
    id: number;
    type: "rectangle" | "text"; // Expandable for more annotation types
    x: number;
    y: number;
    width: number;
    height: number;
    content?: string; // For text annotations
};

const MarkupOverlay = ({
    zoomLevel,
    pageDimensions,
    currentPage,
    isPanning,
}: {
    zoomLevel: number;
    pageDimensions: { width: number; height: number } | null;
    currentPage: number;
    isPanning: boolean;
}) => {
    const [pageAnnotations, setPageAnnotations] = useState<{ [key: number]: Annotation[] }>({});
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    
    // Retrieve annotations for the current page
    const currentAnnotations = pageAnnotations[currentPage] || [];

    const handleMouseDown = (e: React.MouseEvent) => {
        console.log('clicked');
        if (isPanning || !overlayRef.current || !pageDimensions) return;

        setIsDrawing(true);
        const rect = overlayRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / zoomLevel;
        const y = (e.clientY - rect.top) / zoomLevel;

        setStartPos({ x, y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isPanning || !isDrawing || !startPos || !overlayRef.current || !pageDimensions) return;

        const rect = overlayRef.current.getBoundingClientRect();
        const currentX = (e.clientX - rect.left) / zoomLevel;
        const currentY = (e.clientY - rect.top) / zoomLevel;

        const width = Math.abs(currentX - startPos.x);
        const height = Math.abs(currentY - startPos.y);

        const newAnnotation: Annotation = {
            id: currentAnnotations.length + 1,
            type: "rectangle",
            x: Math.min(startPos.x, currentX),
            y: Math.min(startPos.y, currentY),
            width,
            height,
        };

        // Temporarily display the annotation while drawing
        setPageAnnotations((prev) => ({
            ...prev,
            [currentPage]: prev[currentPage]
                ? prev[currentPage].filter((ann) => ann.id !== -1).concat({ ...newAnnotation, id: -1 })
                : [{ ...newAnnotation, id: -1 }],
        }));
    };

    const handleMouseUp = () => {
        if (isPanning || !isDrawing || !startPos) return;

        setIsDrawing(false);
        setPageAnnotations((prev) => {
            const annotationsForCurrentPage = prev[currentPage] || [];
            return {
                ...prev,
                [currentPage]: annotationsForCurrentPage.filter((ann) => ann.id !== -1).concat({
                    ...annotationsForCurrentPage.find((ann) => ann.id === -1)!,
                    id: annotationsForCurrentPage.length + 1,
                }),
            };
        });
        setStartPos(null);
    };

    const handleDeleteAnnotation = (id: number) => {
        setPageAnnotations((prev) => ({
            ...prev,
            [currentPage]: prev[currentPage]?.filter((ann) => ann.id !== id) || [],
        }));
    };

    return (
        <div
            ref={overlayRef}
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: pageDimensions?.width ?? "100%",
                height: pageDimensions?.height ?? "100%",
                zIndex: 10,
                pointerEvents: isPanning ? "none" : "auto",
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            {currentAnnotations.map((ann) =>
                ann.type === "rectangle" ? (
                    <div
                        key={ann.id}
                        style={{
                            position: "absolute",
                            left: ann.x * zoomLevel,
                            top: ann.y * zoomLevel,
                            width: ann.width * zoomLevel,
                            height: ann.height * zoomLevel,
                            border: "2px solid red",
                            backgroundColor: "rgba(255, 0, 0, 0.2)",
                            pointerEvents: "auto",
                        }}
                        onClick={() => handleDeleteAnnotation(ann.id)}
                    />
                ) : null
            )}
        </div>
    );
};

export default MarkupOverlay;
