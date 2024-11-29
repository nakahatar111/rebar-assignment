"use client";

import { useRef, useEffect, useState, MouseEvent } from "react";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
const ToolChest = dynamic(() => import("./ToolChest"), { ssr: false });
const DraggableIconsLayer = dynamic(() => import("./DraggableIconsLayer"), { ssr: false });
const InventoryList = dynamic(() => import("./InventoryList"), { ssr: false });
const ExportPDFButton = dynamic(() => import("./ExportButton"), { ssr: false });

// Lazy load PDF.js to reduce the bundle size
const loadPdfjs = async () => {
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf"); 
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.js"; 
    return pdfjsLib;
};


type Tool = {
    category: string;
    color: string;
    name: string;
    shape: string;
};

type DroppedIcon = {
    category: string;
    color: string;
    id: number; 
    name: string;
    page: number; 
    shape: string;
    size: number;
    x: number;
    y: number;
};

type ProjectState = {
    tools: Tool[];
    overlay: DroppedIcon[];
};

const PDFViewer = () => {
    const [pdf, setPdf] = useState<any>(null);
    const searchParams = useSearchParams(); 
    const pdfUrl = searchParams.get("pdfUrl"); 
    const pdfUrlString = pdfUrl || ""; 
    const projectId = searchParams.get("projectId");
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [zoomLevel, setZoomLevel] = useState(0.35); 
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null); 
    const canvasWrapperRef = useRef<HTMLDivElement>(null);
    const renderTaskRef = useRef<any>(null);
    const [iconSize, setIconSize] = useState(20);
    const [deleteTrigger, setDeleteTrigger] = useState(false);
    const [selectedIcons, setSelectedIcons] = useState<{ id: number; page: number }[]>([]);
    const [editInputs, setEditInputs] = useState({ name: "", category: "" });
    const [droppedIcons, setDroppedIcons] = useState<DroppedIcon[]>([]);
    const [tools, setTools] = useState<Tool[]>([]);

    // Track dragging state
    const isDragging = useRef(false);
    const startPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const scrollPosition = useRef<{ left: number; top: number }>({ left: 0, top: 0 });
    const [toolChestVisible, setToolChestVisible] = useState(true); 
    const [showTable, setShowTable] = useState(false);

    // Fetch project state from the backend
    const fetchProjectState = async () => {
        if (!projectId) {
            console.log("Project ID not found.");
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

            // Update the state with fetched data, or leave as is if no data is returned
            if (data.tools) setTools(data.tools);
            if (data.overlay) setDroppedIcons(data.overlay);
        } catch (error) {
            console.log("Error fetching project state:", error);
        }
    };

    // Fetch project state on component mount
    useEffect(() => {
        fetchProjectState();
    }, [projectId]);


    const handleSaveState = async () => {
        if (!projectId) {
            console.log("Project ID not found.");
            return;
        }
    
        const stateToSave: ProjectState = { tools, overlay: droppedIcons };
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
            console.log("Error saving state to DynamoDB:", error);
        }
    };
    

    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            e.preventDefault(); 
    
            const container = containerRef.current;
            if (!container) return;
    
            // Get the container's dimensions and current scroll positions
            const rect = container.getBoundingClientRect();
            const scrollLeft = container.scrollLeft;
            const scrollTop = container.scrollTop;
    
            // Calculate the current mouse position relative to the container
            const mouseX = e.clientX - rect.left + scrollLeft;
            const mouseY = e.clientY - rect.top + scrollTop;

            const prevZoom = zoomLevel;
            const newZoom = e.deltaY < 0
                ? Math.min(prevZoom + 0.1, 5) 
                : Math.max(prevZoom - 0.1, 0.35);
    
            setZoomLevel(newZoom);
    
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
        const loadPdf = async () => {
            try {
                const pdfjsLib = await loadPdfjs();
                const loadedPdf = await pdfjsLib.getDocument(pdfUrl).promise;
                setPdf(loadedPdf);
                setTotalPages(loadedPdf.numPages);
                setError(null);
            } catch (error) {
                console.log("Error loading PDF:", error);
                setError("Failed to load the PDF. Please try again or check the file.");
            }
        };

        loadPdf();
    }, [pdfUrl]);


    // Render the current page with the current zoom level

    const renderPage = async () => {
        if (!pdf || !canvasRef.current || !canvasWrapperRef.current || !containerRef.current) return;
    
        if (renderTaskRef.current) {
            renderTaskRef.current.cancel();
            renderTaskRef.current = null;
        }
    
        const page = await pdf.getPage(currentPage);
    
        const viewport = page.getViewport({ scale: zoomLevel });
    
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
    
        if (canvas && context) {
            const scaledWidth = Math.round(viewport.width);
            const scaledHeight = Math.round(viewport.height);
            
            canvas.width = scaledWidth;
            canvas.height = scaledHeight;
    
            const container = containerRef.current;
            const containerWidth = container.offsetWidth;
            const containerHeight = container.offsetHeight;
    
            const extraMarginTop = Math.max((scaledHeight - containerHeight), 0);
            const extraMarginLeft = Math.max((scaledWidth - containerWidth), 0);
    
            // Adjust wrapper size and dynamic margins
            const wrapper = canvasWrapperRef.current;
            wrapper.style.width = `${scaledWidth}px`;
            wrapper.style.height = `${scaledHeight}px`;
            wrapper.style.marginTop = `${extraMarginTop}px`; 
            wrapper.style.marginLeft = `${extraMarginLeft}px`;

            context.resetTransform();
            context.clearRect(0, 0, canvas.width, canvas.height);
    
            const renderTask = page.render({
                canvasContext: context,
                viewport: page.getViewport({ scale: zoomLevel }),
            });
    
            renderTaskRef.current = renderTask;
    
            try {
                await renderTask.promise;
            } catch (err) {
                if (err instanceof Error && err.name === "RenderingCancelledException") {
                    console.log("Rendering cancelled");
                } else if (err instanceof Error) {
                    console.log("Error rendering page:", err.message);
                } else {
                    console.log("An unknown error occurred:", err);
                }
            } finally {
                renderTaskRef.current = null;
            }
        }
    };    
    
    const handleZoomIn = () => {
        setZoomLevel((prev) => {
            const newZoom = Math.min(prev + 0.2, 5); 
            return newZoom;
        });
    };
    
    const handleZoomOut = () => {
        setZoomLevel((prev) => {
            const newZoom = Math.max(prev - 0.2, 0.35); 
            return newZoom;
        });
    };
    
    const handleResetZoom = () => {
        setZoomLevel(0.35); 
    };
    
    useEffect(() => {
        renderPage();
    }, [zoomLevel]);

    useEffect(() => {
        renderPage();
        handleResetZoom();
        setSelectedIcons([]);
    }, [pdf, currentPage]);

    const handleMouseDown = (e: MouseEvent) => {
        if ((e.target as HTMLElement).draggable) {
            console.log("Dragging detected, skipping PDF panning");
            return;
        }

        if (!containerRef.current) return;

        isDragging.current = true;
        startPosition.current = { x: e.clientX, y: e.clientY };
        scrollPosition.current = {
            left: containerRef.current.scrollLeft,
            top: containerRef.current.scrollTop,
        };
    };

    const handleMouseMove = (e: MouseEvent) => {
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
                        borderRadius: "10px", 
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", 
                        border: "1px solid #f5c6cb",
                    }}
                >
                    <h2 style={{ margin: "0", fontSize: "1.5rem" }}>Error</h2>
                    <p style={{ margin: "10px 0 0", fontSize: "1rem" }}>{error}</p>
                </div>
            </div>
        );
    }
    

    return (
        <div style={{height: "95%", width: "90vw", marginLeft:'auto', marginRight:'auto', background:'#FFF', borderRadius: '30px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'}}>
            {/* Toolbar for zoom and page selection */}
            <div
            style={{
                textAlign: "center",
                height: "6%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                backgroundColor:'#E9F6F8',
                width:'70%',
                marginLeft:'auto',
                marginRight:'auto',
                borderRadius: '40px'
            }}
            >
            {/* Page Selection */}
            <select
                value={currentPage}
                onChange={(e) => setCurrentPage(Number(e.target.value))}
                style={{
                padding: "5px 10px",
                borderRadius: "20px",
                border: "1px solid #379EA9",
                backgroundColor: "transparent",
                cursor: "pointer",
                color:'#379EA9',
                width:'100px'
                }}
            >
                {Array.from({ length: totalPages }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                    Page {i + 1}
                </option>
                ))}
            </select>

            {/* Open Tool */}
            <button
                onClick={() => setToolChestVisible(!toolChestVisible)}
                style={{
                padding: "5px 15px",
                borderRadius: "20px",
                border: "1px solid #379EA9",
                backgroundColor: toolChestVisible ? "#379EA9" : "transparent",
                color: toolChestVisible ? "#fff" : "#379EA9",
                cursor: "pointer",
                fontWeight: "bold",
                width:'100px'
                }}
            >
                Open Tool
            </button>

            {/* Open Inventory */}
            <button
                onClick={() => setShowTable(!showTable)}
                style={{
                padding: "5px 15px",
                borderRadius: "20px",
                border: "1px solid #379EA9",
                backgroundColor: showTable ? "#379EA9" : "transparent",
                color: showTable ? "#fff" : "#379EA9",
                cursor: "pointer",
                fontWeight: "bold",
                marginRight:'50px',
                width:'130px'

                }}
            >
                Open Inventory
            </button>

            {/* Zoom In */}
            <button
                onClick={() => handleZoomIn()}
                style={{
                padding: "5px 15px",
                borderRadius: "20px",
                border: "1px solid #5e5d5d",
                backgroundColor: "transparent",
                cursor: "pointer",
                width:'100px'

                }}
            >
                Zoom In
            </button>

            {/* Zoom Out */}
            <button
                onClick={() => handleZoomOut()}
                style={{
                padding: "5px 15px",
                borderRadius: "20px",
                border: "1px solid #5e5d5d",
                backgroundColor: "transparent",
                cursor: "pointer",
                width:'100px'

                }}
            >
                Zoom Out
            </button>

            {/* Reset */}
            <button
                onClick={() => handleResetZoom()}
                style={{
                padding: "5px 15px",
                borderRadius: "20px",
                border: "1px solid #5e5d5d",
                backgroundColor: "transparent",
                cursor: "pointer",
                marginRight:'50px',
                width:'70px'

                }}
            >
                Reset
            </button>

            {/* Download */}
            <ExportPDFButton pdfUrl={pdfUrlString} droppedIcons={droppedIcons}/>
            {/* Save */}
            <button
                onClick={handleSaveState}
                style={{
                padding: "5px 15px",
                borderRadius: "20px",
                border: "1px solid #28a745",
                backgroundColor: "#c9f6cd",
                color: "#28a745",
                cursor: "pointer",
                fontWeight: "bold",
                width:'60px'
                }}
            >
                Save
            </button>
            </div>

            

            {/* Scrollable Viewer Area */}
            <div style={{display:'flex', flexDirection: "row", height: "94%", width: "100%",}}>
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
                            flex: showTable  ? 0.6 : 1,
                            overflow: "auto",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            border: "solid 1px #ccc",
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
                                deleteTrigger={deleteTrigger}
                                resetDeleteTrigger={() => setDeleteTrigger(false)}
                                selectedIcons={selectedIcons}
                                setSelectedIcons={setSelectedIcons}
                                editInputs={editInputs} 
                                droppedIcons={droppedIcons} 
                                setDroppedIcons={setDroppedIcons} 
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
                    setDeleteTrigger={setDeleteTrigger} 
                    iconSize={iconSize}
                    setIconSize={setIconSize}
                    selectedIcons={selectedIcons} 
                    setEditInputs={setEditInputs}
                    tools={tools}
                    setTools={setTools}
                    />
                }
            </div>
        </div>
    );
};

export default PDFViewer;
