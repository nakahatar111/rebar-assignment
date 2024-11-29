import { useState, useEffect, ReactNode, RefObject, SetStateAction, Dispatch, DragEvent  } from "react";

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
    droppedIcons,
    setDroppedIcons, 
}: {
    zoomLevel: number;
    currentPage: number;
    containerRef: RefObject<HTMLDivElement>;
    iconSize: number;
    deleteTrigger: boolean;
    resetDeleteTrigger: () => void;
    selectedIcons: { id: number; page: number }[];
    setSelectedIcons: Dispatch<SetStateAction<{ id: number; page: number }[]>>;    
    editInputs: { name: string; category: string };
    droppedIcons: DroppedIcon[];
    setDroppedIcons: Dispatch<SetStateAction<DroppedIcon[]>>;
}) => {
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

    const [tooltip, setTooltip] = useState<{
        visible: boolean;
        x: number;
        y: number;
        content: ReactNode;
    }>({
        visible: false,
        x: 0,
        y: 0,
        content: "",
    });

    
    useEffect(() => {
        if (deleteTrigger) {
            setDroppedIcons((prev) =>
                prev.filter(
                    (icon) =>
                        !selectedIcons.some((selected) => selected.id === icon.id && selected.page === currentPage)
                )
            );
            setSelectedIcons([]); 
            resetDeleteTrigger();
        }
    }, [deleteTrigger, selectedIcons, resetDeleteTrigger, currentPage]);
    
    


    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    
        if (!containerRef.current) return;
    
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / zoomLevel;
        const y = (e.clientY - rect.top) / zoomLevel;
    
        if (draggingIndex !== null) {
            setDroppedIcons((prev) =>
                prev.map((icon) => icon.id === draggingIndex ? { ...icon, x, y } : icon)
            );
            setDraggingIndex(null);
        } else {
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
    
    
    const handleDragStart = (e: DragEvent, id: number) => {
        e.stopPropagation();
        setDraggingIndex(id); 
        const draggedIcon = droppedIcons.find(icon => icon.id === id);
        if(!draggedIcon){
            console.log("undefined icon");
            return
        }

        // Create custom SVG element
        const svgNamespace = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNamespace, "svg");
        svg.setAttribute("width", "40");
        svg.setAttribute("height", "40");
        svg.setAttribute("xmlns", svgNamespace);
        svg.style.position = "absolute";
        svg.style.top = "-1000px";
    
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
    
        document.body.appendChild(svg);
        e.dataTransfer.setDragImage(svg, 20, 20);
        setTimeout(() => document.body.removeChild(svg), 0);
    };
    

    const handleDragOver = (e: DragEvent) => {
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
    
    // Update sizes of selected icons
    useEffect(() => {
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


    // Update icons when edit is triggered
    useEffect(() => {
        if (editInputs.name || editInputs.category) {
            handleEditSelectedIcons();
        }
    }, [editInputs]);

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
                            backgroundColor: "transparent", 
                            transform: `translate(-50%, -50%)`, 
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            border: selectedIcons.some((selected) => selected.id === icon.id && selected.page === currentPage)
                            ? "1px solid blue" 
                            : "none",
                            boxShadow: selectedIcons.some((selected) => selected.id === icon.id && selected.page === currentPage)
                                ? "0px 4px 6px rgba(0, 0, 0, 0.7)"
                                : "none",                     
                        }}
                        draggable
                        onClick={() => toggleSelectIcon(icon.id)} 
                        onDragStart={(e) => handleDragStart(e, icon.id)}
                        onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setTooltip({
                                visible: true,
                                x: rect.right + 10, 
                                y: rect.top + rect.height / 2, 
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
                                backgroundColor: icon.color, 
                                clipPath: getClipPath(icon.shape), 
                                opacity: 0.5, 
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
                        transform: "translate(0, -50%)", 
                        backgroundColor: "#feff9c",
                        color: "black",
                        padding: "5px 10px",
                        borderRadius: "5px",
                        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                        whiteSpace: "pre-line", 
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
