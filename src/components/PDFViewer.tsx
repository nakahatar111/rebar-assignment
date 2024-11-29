"use client";

import React, { useRef, useEffect, useState } from "react";
// import * as pdfjsLib from "pdfjs-dist";
// import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
import "@react-pdf-viewer/core/lib/styles/index.css";
// import MarkupOverlay from "./MarkupOverlay";
import { useSearchParams } from "next/navigation"; // App Router query parameter handling

import ToolChest from "./ToolChest";
import DraggableIconsLayer from "./DraggableIconsLayer";
import InventoryList from "./InventoryList";
// import ExportPDF from "./ExportPDF";
import ExportPDFButton from "./ExportButton";
// pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// Lazy load PDF.js to reduce the bundle size
const loadPdfjs = async () => {
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf"); // Legacy build ensures compatibility
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.js"; // Use worker from public directory
    return pdfjsLib;
};


type Tool = {
    category: string;
    color: string;
    name: string;
    shape: string;
};

// Define the type for a dropped icon (overlay item)
type DroppedIcon = {
    category: string;
    color: string;
    id: string; // Unique ID for each icon
    name: string;
    page: number; // Page number where the icon is placed
    shape: string;
    size: number;
    x: number; // X-coordinate on the page
    y: number; // Y-coordinate on the page
};

// Define the state for tools and dropped icons
type ProjectState = {
    tools: Tool[];
    overlay: DroppedIcon[];
};

const PDFViewer = () => {
    const [pdf, setPdf] = useState<any>(null);
    const searchParams = useSearchParams(); // Call the hook
    const pdfUrl = searchParams.get("pdfUrl"); // Now correctly retrieve "pdfUrl"
    const projectId = searchParams.get("projectId");
    const [error, setError] = useState<string | null>(null); // Track PDF loading errors
    const [currentPage, setCurrentPage] = useState(1); // Default to the first page
    const [totalPages, setTotalPages] = useState(0);
    const [zoomLevel, setZoomLevel] = useState(0.35); // Default zoom level
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null); // Reference to the scrollable container
    const canvasWrapperRef = useRef<HTMLDivElement>(null); // Reference to the canvas wrapper
    const renderTaskRef = useRef<any>(null);
    const [iconSize, setIconSize] = useState(20);
    const [deleteTrigger, setDeleteTrigger] = useState(false); // Tracks delete button clicks
    const [selectedIcons, setSelectedIcons] = useState<{ id: string; page: number }[]>([]);
    const [editInputs, setEditInputs] = useState({ name: "", category: "" }); // Edit inputs
    const [droppedIcons, setDroppedIcons] = useState<DroppedIcon[]>([]); // Manage the list of dropped icons
    const [tools, setTools] = useState<Tool[]>([]); // Manage the list of tools

    // Track dragging state
    const isDragging = useRef(false);
    const startPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const scrollPosition = useRef<{ left: number; top: number }>({ left: 0, top: 0 });
    const [toolChestVisible, setToolChestVisible] = useState(true); // Track Tool Chest visibility
    const [showTable, setShowTable] = useState(false);

    useEffect(() => {
        console.log("Tool Chest: ", tools);
        console.log("Overlay: ", droppedIcons);
        console.log("selectedIcons:", selectedIcons);
    }, [tools, droppedIcons,selectedIcons]);

    // Fetch project state from the backend
    const fetchProjectState = async () => {
        if (!projectId) {
            console.error("Project ID not found.");
            return;
        }

        try {
            const response = await fetch("https://nrkqvh55re.execute-api.us-east-1.amazonaws.com/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    action: "getProjectState",
                    projectId,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to fetch project state.");
            }

            const data: { tools?: Tool[]; overlay?: DroppedIcon[] } = await response.json();
            console.log("Fetched Project State:", data);

            // Update the state with fetched data, or leave as is if no data is returned
            if (data.tools) setTools(data.tools);
            if (data.overlay) setDroppedIcons(data.overlay);
        } catch (error) {
            console.error("Error fetching project state:", error);
        }
    };

    // Fetch project state on component mount
    useEffect(() => {
        fetchProjectState();
    }, [projectId]);


    const handleSaveState = async () => {
        if (!projectId) {
            console.error("Project ID not found.");
            return;
        }
    
        const stateToSave: ProjectState = { tools, overlay: droppedIcons }; // Use defined types
        console.log("State Saved:", { tools, overlay: droppedIcons });
    
        try {
            const response = await fetch("https://nrkqvh55re.execute-api.us-east-1.amazonaws.com/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    action: "saveProjectState",
                    projectId: projectId,
                    state: stateToSave,
                }),
            });
    
            if (!response.ok) {
                throw new Error("Failed to save state to the backend.");
            }
    
            const data = await response.json();
            console.log("State saved to DynamoDB:", data);
        } catch (error) {
            console.error("Error saving state to DynamoDB:", error);
        }
    };
    

    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            e.preventDefault(); // Prevent default scrolling behavior
    
            const container = containerRef.current;
            if (!container) return;
    
            // Get the container's dimensions and current scroll positions
            const rect = container.getBoundingClientRect();
            const scrollLeft = container.scrollLeft;
            const scrollTop = container.scrollTop;
    
            // Calculate the current mouse position relative to the container
            const mouseX = e.clientX - rect.left + scrollLeft;
            const mouseY = e.clientY - rect.top + scrollTop;
    
            // Current zoom level
            const prevZoom = zoomLevel;
    
            // Update the zoom level
            const newZoom = e.deltaY < 0
                ? Math.min(prevZoom + 0.1, 5) // Zoom in (max zoom level: 5)
                : Math.max(prevZoom - 0.1, 0.35); // Zoom out (min zoom level: 0.35)
    
            setZoomLevel(newZoom);
    
            // Calculate the scaling factor
            const scaleFactor = newZoom / prevZoom;
    
            // Adjust the scroll position to zoom toward the mouse pointer
            const newScrollLeft = mouseX * scaleFactor - (e.clientX - rect.left);
            const newScrollTop = mouseY * scaleFactor - (e.clientY - rect.top);
    
            // Update the container's scroll position
            container.scrollLeft = newScrollLeft;
            container.scrollTop = newScrollTop;
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
    }, [zoomLevel]);
    
    
    // Load the PDF document
    useEffect(() => {
        if (!pdfUrl) {
            setError("No PDF URL provided. Please select a valid PDF.");
            return;
        }
        console.log("PDF Link:", pdfUrl);
        const loadPdf = async () => {
            try {
                const pdfjsLib = await loadPdfjs();
                const loadedPdf = await pdfjsLib.getDocument(pdfUrl).promise;
                console.log("PDF Loaded", loadedPdf);
                setPdf(loadedPdf);
                setTotalPages(loadedPdf.numPages); // Set the total number of pages
                setError(null); // Clear any previous errors
            } catch (error) {
                console.error("Error loading PDF:", error);
                setError("Failed to load the PDF. Please try again or check the file.");
            }
        };

        loadPdf();
    }, [pdfUrl]);


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
            } finally {
                // Clear the render task reference when done
                renderTaskRef.current = null;
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
        setSelectedIcons([]);
    }, [pdf, currentPage]);

    // Mouse event handlers for drag scrolling
    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).draggable) {
            console.log("Dragging detected, skipping PDF panning");
            return; // Exit to prevent panning logic
        }

        if (!containerRef.current) return;

        isDragging.current = true;
        startPosition.current = { x: e.clientX, y: e.clientY };
        scrollPosition.current = {
            left: containerRef.current.scrollLeft,
            top: containerRef.current.scrollTop,
        };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current || !containerRef.current) return;

        const deltaX = e.clientX - startPosition.current.x;
        const deltaY = e.clientY - startPosition.current.y;

        containerRef.current.scrollLeft = scrollPosition.current.left - deltaX;
        containerRef.current.scrollTop = scrollPosition.current.top - deltaY;
    };

    const handleMouseUp = () => {
        isDragging.current = false;
    };


    if (error) {
        return (
            <div style={{ height: "95%", width: "90vw", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <div
                    style={{
                        padding: "20px",
                        textAlign: "center",
                        color: "red",
                        backgroundColor: "#f8d7da",
                        width: "30vw",
                        borderRadius: "10px", // Rounded edges
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", // Subtle shadow
                        border: "1px solid #f5c6cb", // Matching border color
                    }}
                >
                    <h2 style={{ margin: "0", fontSize: "1.5rem" }}>Error</h2>
                    <p style={{ margin: "10px 0 0", fontSize: "1rem" }}>{error}</p>
                </div>
            </div>
        );
    }
    

    return (
        <div style={{height: "95%", width: "90vw", border: "blue solid 4px"}}>
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

                {/* Tool Chest Button */}
                <button
                    onClick={() => setToolChestVisible(!toolChestVisible)}
                    style={{ backgroundColor: "#007bff",color: "#fff",cursor: "pointer"}} >
                    {toolChestVisible ? "Hide Tools" : "Show Tools"}
                </button>
                {/* Table Button */}
                <button 
                    onClick={() => setShowTable(!showTable)}
                    style={{ backgroundColor: "#007bff",color: "#fff",cursor: "pointer"}}>
                    {showTable ? 'Hide Table' : 'Show Table'}
                </button>

                <ExportPDFButton pdfUrl="/blueprint.pdf" droppedIcons={droppedIcons} />

                <button onClick={handleSaveState} style={{ backgroundColor: "#28a745", color: "#fff", cursor: "pointer" }}>
                    Save State
                </button>


            </div>
            

            {/* Scrollable Viewer Area */}
            <div style={{display:'flex', flexDirection: "row", height: "95%", width: "100%",}}>
                {/* Main Content Area */}
                <div
                    style={{
                        flex: toolChestVisible ? 0.8 : 1,
                        overflow: "auto",
                        display: "flex",
                        flexDirection: "column",
                        transition: "flex 0.3s ease", // Smooth resizing
                        position: "relative",
                    }}
                >
                    <div
                        ref={containerRef}
                        style={{
                            flex: showTable  ? 0.8 : 1,
                            overflow: "auto",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            border: "green solid 4px",
                            cursor: isDragging.current ? "grab" : "point",
                            position: "relative", 
                            transition: "flex 0.3s ease"
                        }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        <div
                            ref={canvasWrapperRef}
                            style={{position: "relative"}}>
                            <canvas ref={canvasRef}></canvas>
                            <DraggableIconsLayer
                                zoomLevel={zoomLevel}
                                currentPage={currentPage}
                                containerRef={canvasWrapperRef}
                                iconSize={iconSize}
                                deleteTrigger={deleteTrigger} // Pass delete trigger to layer
                                resetDeleteTrigger={() => setDeleteTrigger(false)} // Reset trigger
                                selectedIcons={selectedIcons}
                                setSelectedIcons={setSelectedIcons}
                                editInputs={editInputs} // Pass edit inputs
                                droppedIcons={droppedIcons} // Pass state
                                setDroppedIcons={setDroppedIcons} // Pass state setter
                            />
                        </div>
                    </div>

                    {/* Table Container */}
                    {showTable && <InventoryList
                        droppedIcons={droppedIcons}
                        setDroppedIcons={setDroppedIcons}
                        />
                    }
                </div>
                {/* Tool Chest */}
                {toolChestVisible && <ToolChest
                    setDeleteTrigger={setDeleteTrigger} // Pass delete trigger setter
                    iconSize={iconSize}
                    setIconSize={setIconSize}
                    selectedIcons={selectedIcons} // Pass selected icons
                    setEditInputs={setEditInputs} // Pass edit inputs setter
                    tools={tools}
                    setTools={setTools}
                    />
                }
            </div>
        </div>
    );
};

export default PDFViewer;
