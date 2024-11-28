import React, { useState, useEffect, ReactNode  } from "react";

const DraggableIconsLayer = ({
    zoomLevel,
    currentPage,
    containerRef,
    iconSize,
    deleteTrigger,
    resetDeleteTrigger,
    selectedIcons,
    setSelectedIcons,
    editInputs,
    droppedIcons, // Access dropped icons from parent
    setDroppedIcons, // Update dropped icons in parent
}: {
    zoomLevel: number;
    currentPage: number;
    containerRef: React.RefObject<HTMLDivElement>;
    iconSize: number;
    deleteTrigger: boolean;
    resetDeleteTrigger: () => void;
    selectedIcons: { id: number; page: number }[];
    setSelectedIcons: React.Dispatch<React.SetStateAction<{ id: number; page: number }[]>>;    
    editInputs: { name: string; category: string };
    droppedIcons: any[];
    setDroppedIcons: React.Dispatch<React.SetStateAction<any[]>>;
}) => {
    // const [droppedIcons, setDroppedIcons] = useState<any[]>([]);
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null); // Track the index of the dragging icon

    const [tooltip, setTooltip] = useState<{
        visible: boolean;
        x: number;
        y: number;
        content: ReactNode; // Allow React elements
    }>({
        visible: false,
        x: 0,
        y: 0,
        content: "",
    });
    useEffect(() => {
        console.log(droppedIcons);
    }, [droppedIcons]);
    // Handle Delete Trigger
    
    useEffect(() => {
        if (deleteTrigger) {
            setDroppedIcons((prev) =>
                prev.filter(
                    (icon) =>
                        !selectedIcons.some((selected) => selected.id === icon.id && selected.page === currentPage)
                )
            );
            setSelectedIcons([]); // Reset selection
            resetDeleteTrigger(); // Reset delete trigger
        }
    }, [deleteTrigger, selectedIcons, resetDeleteTrigger, currentPage]);
    
    


    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); // Allow drop
        e.stopPropagation(); // Prevent the event from propagating to the PDF viewer
    
        if (!containerRef.current) return;
    
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / zoomLevel; // Compute x-coordinate
        const y = (e.clientY - rect.top) / zoomLevel;
    
        if (draggingIndex !== null) {
            // Rearrange existing icon
            setDroppedIcons((prev) =>
                prev.map((icon, index) =>
                    index === draggingIndex ? { ...icon, x, y } : icon // Update position
                )
            );
            setDraggingIndex(null); // Reset dragging index
        } else {
            // Drop new icon from ToolChest
            const toolData = JSON.parse(e.dataTransfer.getData("tool"));
    
            // Add the new icon with a unique id
            setDroppedIcons((prev) => [
                ...prev,
                {
                    ...toolData,
                    x,
                    y,
                    size: iconSize,
                    page: currentPage,
                    id: Date.now() + Math.random(), // Generate unique id
                },
            ]);
        }
    };
    
    
    const handleDragStart = (e: React.DragEvent, index: number) => {
        e.stopPropagation();
        setDraggingIndex(index); // Store the index of the dragging icon
    
        const draggedIcon = droppedIcons[index]; // Get the dragged icon details
    
        // Create a custom drag image using an SVG element
        const svgNamespace = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNamespace, "svg");
        const size = draggedIcon.size * zoomLevel; // Scale the size
        svg.setAttribute("width", "40");
        svg.setAttribute("height", "40");
        svg.setAttribute("xmlns", svgNamespace);
        svg.style.position = "absolute"; // Ensure it's not visible as a floating element
        svg.style.top = "-1000px"; // Move it far off-screen
    
        // Create the shape based on the icon's shape
        const shape = document.createElementNS(svgNamespace, "path");
        shape.setAttribute(
            "d",
            draggedIcon.shape === "circle"
                ? "M20 20 m -15, 0 a 15,15 0 1,0 30,0 a 15,15 0 1,0 -30,0" // Circle
                : draggedIcon.shape === "square"
                ? "M5 5 H35 V35 H5 Z" // Square
                : draggedIcon.shape === "diamond"
                ? "M20 5 L35 20 L20 35 L5 20 Z" // Diamond
                : "M40 12.4 L17.2 40 L1.6 25.2 L6.4 21.2 L17.2 31.2 L35.2 6.4 Z" // Checkmark
        );
        shape.setAttribute("fill", draggedIcon.color);
        shape.setAttribute("opacity", "0.5");
        svg.appendChild(shape);
    
        document.body.appendChild(svg); // Temporarily add the SVG to the DOM
        e.dataTransfer.setDragImage(svg, 20, 20); // Center the drag image
        setTimeout(() => document.body.removeChild(svg), 0); // Clean up immediately
    };
    

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent the event from propagating
    };

    const toggleSelectIcon = (id: number) => {
        setSelectedIcons((prev) =>
            prev.some((icon) => icon.id === id && icon.page === currentPage)
                ? prev.filter((icon) => !(icon.id === id && icon.page === currentPage)) // Deselect if already selected
                : [...prev, { id, page: currentPage }] // Select with page context
        );
    };
    
    
    const updateSelectedIconSizes = (newSize: number) => {
        setDroppedIcons((prev) =>
            prev.map((icon) =>
                selectedIcons.some((selected) => selected.id === icon.id && selected.page === currentPage)
                    ? { ...icon, size: newSize }
                    : icon
            )
        );
    };
    
    
    useEffect(() => {
        // Update sizes of selected icons whenever iconSize changes
        if (selectedIcons.length > 0) {
            updateSelectedIconSizes(iconSize);
        }
    }, [iconSize]);
    

    // Handle editing selected icons
    const handleEditSelectedIcons = () => {
        setDroppedIcons((prev) =>
            prev.map((icon) =>
                selectedIcons.some((selected) => selected.id === icon.id && selected.page === currentPage)
                    ? {
                          ...icon,
                          name: editInputs.name || icon.name,
                          category: editInputs.category || icon.category,
                      }
                    : icon
            )
        );
    };
    

    useEffect(() => {
        // Update icons when edit is triggered
        if (editInputs.name || editInputs.category) {
            handleEditSelectedIcons();
        }
    }, [editInputs]);

    // const handleResize = (index: number, newSize: number) => {
    //     setDroppedIcons((prev) =>
    //         prev.map((icon, i) =>
    //             i === index ? { ...icon, size: newSize } : icon
    //         )
    //     );
    // };

    const handleRearrange = (index: number, newX: number, newY: number) => {
        setDroppedIcons((prev) =>
            prev.map((icon, i) =>
                i === index ? { ...icon, x: newX, y: newY } : icon
            )
        );
    };

    return (
        <div
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
            {droppedIcons
                .filter((icon) => icon.page === currentPage)
                .map((icon, index) => (
                    <div
                        key={index}
                        style={{
                            position: "absolute",
                            left: icon.x * zoomLevel,
                            top: icon.y * zoomLevel,
                            width: icon.size * zoomLevel,
                            height: icon.size * zoomLevel,
                            // backgroundColor: icon.color,
                            backgroundColor: "transparent", // Ensure the background is transparent
                            // opacity: 0.5,
                            // clipPath: getClipPath(icon.shape),
                            transform: `translate(-50%, -50%)`, // Center the icon at the drop point
                            cursor: "pointer", // Indicate draggable element
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            border: selectedIcons.some((selected) => selected.id === icon.id && selected.page === currentPage)
                            ? "1px solid blue" // Highlight selected icons
                            : "none",
                            boxShadow: selectedIcons.some((selected) => selected.id === icon.id && selected.page === currentPage)
                                ? "0px 4px 6px rgba(0, 0, 0, 0.7)"
                                : "none",                     
                        }}
                        draggable
                        onClick={() => toggleSelectIcon(icon.id)} // Toggle selection
                        onDragStart={(e) => handleDragStart(e, index)}
                        onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setTooltip({
                                visible: true,
                                x: rect.right + 10, // Position slightly to the right of the icon
                                y: rect.top + rect.height / 2, // Vertically center it relative to the icon
                                content: (
                                    <div>
                                        <span style={{ fontWeight: "bold" }}>{icon.category}</span>
                                        <br />
                                        <span style={{ fontWeight: "normal" }}>{icon.name}</span>
                                    </div>
                                ),                            });
                        }}
                        onMouseLeave={() => setTooltip({ visible: false, x: 0, y: 0, content: "" })}
                    
                    >
                        <div
                            style={{
                                width: "100%",
                                height: "100%",
                                backgroundColor: icon.color, // Icon color
                                clipPath: getClipPath(icon.shape), // Shape-specific clip path
                                opacity: 0.5, // Icon transparency
                            }}
                            draggable
                        ></div>
                    </div>
                ))}
                {tooltip.visible && (
                    <div
                    style={{
                        position: "fixed",
                        top: tooltip.y,
                        left: tooltip.x,
                        transform: "translate(0, -50%)", // Center vertically relative to the trigger point
                        backgroundColor: "#feff9c",
                        color: "black",
                        padding: "5px 10px",
                        borderRadius: "5px",
                        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                        whiteSpace: "pre-line", // Enable new line for text
                        fontSize: "12px",
                        zIndex: 10,
                    }}
                >
                        {tooltip.content}
                    </div>
                )}
        </div>
    );
};

const getClipPath = (shape: string): string => {
    switch (shape) {
        case "circle":
            return "circle(50% at 50% 50%)";
        case "square":
            return "none";
        case "diamond":
            return "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)";
        case "checkmark":
            return "polygon(100% 31%, 43% 100%, 4% 63%, 16% 53%, 43% 78%, 88% 22%)";
        default:
            return "none";
    }
};

export default DraggableIconsLayer;
