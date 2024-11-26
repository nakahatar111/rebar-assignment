"use client";

import React, { useRef, useEffect, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
import "@react-pdf-viewer/core/lib/styles/index.css";
import MarkupOverlay from "./MarkupOverlay";
import ToolChest from "./ToolChest";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const PDFViewer = () => {
    const [pdf, setPdf] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(1); // Default to the first page
    const [totalPages, setTotalPages] = useState(0);
    const [zoomLevel, setZoomLevel] = useState(0.35); // Default zoom level
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null); // Reference to the scrollable container
    const canvasWrapperRef = useRef<HTMLDivElement>(null); // Reference to the canvas wrapper
    const renderTaskRef = useRef<any>(null);
    const [isCtrlPressed, setIsCtrlPressed] = useState(false); // Track if Ctrl is pressed
    // Track dragging state
    const isDragging = useRef(false);
    const startPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const scrollPosition = useRef<{ left: number; top: number }>({ left: 0, top: 0 });
    const [pageDimensions, setPageDimensions] = useState<{ width: number; height: number } | null>(null);
    const [toolChestVisible, setToolChestVisible] = useState(true); // Track Tool Chest visibility

    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            e.preventDefault(); // Prevent default scrolling behavior
    
            if (e.deltaY < 0) {
                // Scrolling up, zoom in
                setZoomLevel((prev) => Math.min(prev + 0.1, 5)); // Max zoom level: 5
            } else {
                // Scrolling down, zoom out
                setZoomLevel((prev) => Math.max(prev - 0.1, 0.35)); // Min zoom level: 0.35
            }
        };
    
        const container = containerRef.current;
        if (container) {
            container.addEventListener("wheel", handleWheel);
        }
    
        return () => {
            if (container) {
                container.removeEventListener("wheel", handleWheel);
            }
        };
    }, []);
    

    // Ensure pageDimensions is set when the PDF is rendered
    useEffect(() => {
        const updatePageDimensions = () => {
            if (canvasRef.current?.width && canvasRef.current?.height) {
                setPageDimensions({
                    width: canvasRef.current.width,
                    height: canvasRef.current.height,
                });
            }
        };
    
        updatePageDimensions(); // Update on initial render
    
        const observer = new ResizeObserver(() => updatePageDimensions());
        if (canvasRef.current) observer.observe(canvasRef.current);
    
        return () => observer.disconnect();
    }, [canvasRef, zoomLevel, currentPage]);
    // Listen for Ctrl key press
    useEffect(() => {
    
        window.addEventListener("keydown", (e) => {
            if (e.key === "Control") setIsCtrlPressed(true);
        });
    
        window.addEventListener("keyup", (e) => {
            if (e.key === "Control") setIsCtrlPressed(false);
        });
    
        return () => {
            window.removeEventListener("keydown", (e) => {
                if (e.key === "Control") setIsCtrlPressed(true);
            });
            window.removeEventListener("keyup", (e) => {
                if (e.key === "Control") setIsCtrlPressed(false);
            });
        };
    }, []);
    
    // Load the PDF document
    useEffect(() => {
        const loadPdf = async () => {
            try {
                const loadedPdf = await pdfjsLib.getDocument("/blueprint.pdf").promise;
                console.log("PDF Loaded", loadedPdf);
                setPdf(loadedPdf);
                setTotalPages(loadedPdf.numPages); // Set the total number of pages
            } catch (error) {
                console.error("Error loading PDF:", error);
            }
        };

        loadPdf();
    }, []);

    // Render the current page with the current zoom level

    const renderPage = async () => {
        if (!pdf || !canvasRef.current || !canvasWrapperRef.current || !containerRef.current) return;
    
        // Cancel the previous render task if it's still ongoing
        if (renderTaskRef.current) {
            renderTaskRef.current.cancel();
            renderTaskRef.current = null;
        }
    
        const page = await pdf.getPage(currentPage);
    
        // Get the full PDF dimensions at scale = 1
        const viewport = page.getViewport({ scale: zoomLevel });
    
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
    
        if (canvas && context) {
            // Set the canvas size to match the scaled PDF dimensions
            const scaledWidth = Math.round(viewport.width);
            const scaledHeight = Math.round(viewport.height);
            
            canvas.width = scaledWidth;
            canvas.height = scaledHeight;
    
            // Get container dimensions to calculate the visible region
            const container = containerRef.current;
            const containerWidth = container.offsetWidth;
            const containerHeight = container.offsetHeight;
    
            // Compute margins to ensure the entire PDF is scrollable
            const extraMarginTop = Math.max((scaledHeight - containerHeight), 0);
            const extraMarginLeft = Math.max((scaledWidth - containerWidth), 0);
    
            // Adjust wrapper size and dynamic margins
            const wrapper = canvasWrapperRef.current;
            wrapper.style.width = `${scaledWidth}px`;
            wrapper.style.height = `${scaledHeight}px`;
            wrapper.style.marginTop = `${extraMarginTop}px`; // Dynamically computed top margin
            wrapper.style.marginLeft = `${extraMarginLeft}px`; // Dynamically computed left margin
            console.log(scaledWidth, scaledHeight, extraMarginTop, extraMarginLeft);
            // Clear the canvas and reset transformations
            context.resetTransform();
            context.clearRect(0, 0, canvas.width, canvas.height);
    
            // Render the PDF page with the scaled viewport
            const renderTask = page.render({
                canvasContext: context,
                viewport: page.getViewport({ scale: zoomLevel }),
            });
    
            // Track the render task
            renderTaskRef.current = renderTask;
    
            try {
                await renderTask.promise;
            } catch (err) {
                if (err instanceof Error && err.name === "RenderingCancelledException") {
                    console.log("Rendering cancelled");
                } else if (err instanceof Error) {
                    console.error("Error rendering page:", err.message);
                } else {
                    console.error("An unknown error occurred:", err);
                }
            }
        }
    };    
    
    const handleZoomIn = () => {
        setZoomLevel((prev) => {
            const newZoom = Math.min(prev + 0.2, 5); // Max zoom level: 2
            return newZoom;
        });
    };
    
    const handleZoomOut = () => {
        setZoomLevel((prev) => {
            const newZoom = Math.max(prev - 0.2, 0.35); // Min zoom level: 0.2
            return newZoom;
        });
    };
    
    const handleResetZoom = () => {
        setZoomLevel(0.35); // Reset to the initial zoom
    };
    
    // Re-render the page when `currentPage` or `zoomLevel` changes
    useEffect(() => {
        renderPage();
    }, [zoomLevel]);

    useEffect(() => {
        renderPage();
        handleResetZoom();
    }, [pdf, currentPage]);

    // Mouse event handlers for drag scrolling
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!containerRef.current || !isCtrlPressed) return;

        isDragging.current = true;
        startPosition.current = { x: e.clientX, y: e.clientY };
        scrollPosition.current = {
            left: containerRef.current.scrollLeft,
            top: containerRef.current.scrollTop,
        };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current || !containerRef.current|| !isCtrlPressed) return;

        const deltaX = e.clientX - startPosition.current.x;
        const deltaY = e.clientY - startPosition.current.y;

        containerRef.current.scrollLeft = scrollPosition.current.left - deltaX;
        containerRef.current.scrollTop = scrollPosition.current.top - deltaY;
    };

    const handleMouseUp = () => {
        isDragging.current = false;
    };

    return (
        <div style={{height: "100%", width: "100%", border: "blue solid 4px"}}>
            {/* Toolbar for zoom and page selection */}
            <div style={{textAlign: "center", height: "5%", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", }}>
                <button onClick={() => handleZoomIn()}>
                    Zoom In
                </button>
                <button onClick={() => handleZoomOut()}>
                    Zoom Out
                </button>
                <button onClick={() => handleResetZoom()}>Reset</button>

                <select
                    value={currentPage}
                    onChange={(e) => setCurrentPage(Number(e.target.value))}
                    style={{ padding: "5px" }}
                >
                    {Array.from({ length: totalPages }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                            Page {i + 1}
                        </option>
                    ))}
                </select>

                {/* Toggle Button */}
                <button
                    onClick={() => setToolChestVisible(!toolChestVisible)}
                    style={{ backgroundColor: "#007bff",color: "#fff",cursor: "pointer"}} >
                    {toolChestVisible ? "Hide Tools" : "Show Tools"}
                </button>

            </div>
            

            {/* Scrollable Viewer Area */}
            <div style={{display:'flex', flexDirection: "row", height: "95%", width: "100%",}}>
                <div
                    ref={containerRef}
                    style={{
                        flex: toolChestVisible ? 0.8 : 1, // Adjust width based on Tool Chest visibility
                        overflow: "auto",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        border: "green solid 4px",
                        cursor: isDragging.current ? "grabbing" : "grab",
                        position: "relative", 
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp} // Stop dragging if the mouse leaves the container
                >
                    <div
                        ref={canvasWrapperRef}
                        style={{position: "relative"}}>
                        <canvas ref={canvasRef}></canvas>
                        <MarkupOverlay
                            zoomLevel={zoomLevel}
                            pageDimensions={pageDimensions}
                            currentPage={currentPage}
                            isPanning={isCtrlPressed}
                        />
                    </div>
                </div>
                {/* Tool Chest */}
                {toolChestVisible && <ToolChest/>}
            </div>
        </div>
    );
};

export default PDFViewer;
