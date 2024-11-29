"use client";

import { useState, useEffect, SetStateAction, Dispatch, ChangeEvent} from "react";

const shapes = ["square", "circle", "diamond", "checkmark"];

const ToolChest = ({
        iconSize,
        setIconSize,
        setDeleteTrigger,
        selectedIcons, // Pass selected icons from DraggableIconsLayer
        setEditInputs,
        tools,
        setTools,
    }: {
        iconSize: number;
        setIconSize: (size: number) => void;
        setDeleteTrigger: (trigger: boolean) => void;
        selectedIcons: { id: number; page: number }[];
        setEditInputs: Dispatch<SetStateAction<{ name: string; category: string }>>;
        tools: any[]; // Replace `any` with a defined type for better safety
        setTools: Dispatch<SetStateAction<any[]>>; // Replace `any[]` with the defined type
    }) => {
    // move this to pdfviewer
    const [newTool, setNewTool] = useState({
        name: "",
        category: "",
        color: "#FF2400",
        shape: "square", // Default shape
    });
    const [addToolVisible, setaddToolVisible] = useState(true); // Track Tool Chest visibility
    const [showEditPopup, setShowEditPopup] = useState(false); // Edit popup visibility
    const [localEditInputs, setLocalEditInputs] = useState({ name: "", category: "" }); // Temporary state

    const handleEditConfirm = () => {
        if (!localEditInputs.name && !localEditInputs.category) {
            alert("Please enter a name or category.");
            return;
        }
        setEditInputs(localEditInputs);
        setLocalEditInputs({ name: "", category: "" }); // Clear local state
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewTool((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddTool = () => {
        if (!newTool.name || !newTool.category) {
            alert("Name and Category are required.");
            return;
        }

        setTools((prev) => [...prev, newTool]);
        setNewTool((prev) => ({
            ...prev,
            name: "",
            category: "",
        }));    
    };

    useEffect(() => {
        if (selectedIcons.length > 0) {
            setShowEditPopup(true);
        }
        else{
            setShowEditPopup(false);
        }
    }, [selectedIcons]);

    return (
        <div style={{ flex: 0.2, backgroundColor: "#f0f0f0", width: "20%", padding: "10px", border: "1px solid gray", height:'calc(100%-20px)', transition: "flex 0.3s ease"}}>
            <h3>Tool Chest</h3>
            {/* Slider for size */}
            <div style={{ margin: "10px 0" }}>
                <label htmlFor="icon-size-slider" style={{ display: "block" }}>
                    Icon Size:
                </label>
                <input
                    id="icon-size-slider"
                    type="range"
                    min="10"
                    max="100"
                    value={iconSize}
                    onChange={(e) => setIconSize(Number(e.target.value))}
                    style={{ width: "100%" }}
                />
                <p style={{ margin: "0", fontSize: "14px", textAlign: "center" }}>Size: {iconSize}px</p>
            </div>

            {/* Edit Popup */}
            {showEditPopup && (
                <div style={{ padding: "10px", border: "1px solid gray", backgroundColor: "#fff", marginTop: "10px" }}>
                    <h4>Edit/Delete Selected Icons</h4>
                    <input
                        type="text"
                        name="name"
                        placeholder="New Name"
                        value={localEditInputs.name}
                        onChange={(e) => setLocalEditInputs({ ...localEditInputs, name: e.target.value })}
                        style={{ marginBottom: "5px", display: "block", width: "100%" }}
                    />
                    <input
                        type="text"
                        name="category"
                        placeholder="New Category"
                        value={localEditInputs.category}
                        onChange={(e) => setLocalEditInputs({ ...localEditInputs, category: e.target.value })}
                        style={{ marginBottom: "5px", display: "block", width: "100%" }}
                    />
                    <button
                        onClick={handleEditConfirm}
                        style={{
                            backgroundColor: "#007bff",
                            color: "#fff",
                            border: "none",
                            borderRadius: "5px",
                            padding: "5px 10px",
                            cursor: "pointer",
                        }}
                    >
                        Confirm
                    </button>
                    {/* Delete Button */}
                    <button
                        onClick={() => setDeleteTrigger(true)} // Trigger delete
                        style={{
                            backgroundColor: "#007bff",
                            color: "#fff",
                            border: "none",
                            borderRadius: "5px",
                            padding: "5px 10px",
                            cursor: "pointer",
                        }}
                    >
                        Delete
                    </button>
                </div>
            )}

            <button
                onClick={() => setaddToolVisible(!addToolVisible)}
                style={{ backgroundColor: "#007bff",color: "#fff",cursor: "pointer"}} >
                {addToolVisible ? "Add Tools" : "Hide Menu"}
            </button>
            {!addToolVisible && (
                <div style={{ marginBottom: "10px", border: "green solid 2px", padding: "10px", height:"130px"}}>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "40% 55%", // Set the widths for the columns
                            rowGap: "5px",
                            columnGap: "10px",
                        }}
                    >
                        {/* First Column - Labels */}
                        <label>Name:</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Tool Name"
                            value={newTool.name}
                            onChange={handleInputChange}
                        />

                        <label>Category:</label>
                        <input
                            type="text"
                            name="category"
                            placeholder="Category"
                            value={newTool.category}
                            onChange={handleInputChange}
                        />

                        <label>Color:</label>
                        <input
                            type="color"
                            name="color"
                            value={newTool.color}
                            onChange={handleInputChange}
                            style={{ width: "100%", height: "100%", padding: "0", margin: "0" }}
                        />

                        <label>Shape:</label>
                        <select
                            name="shape"
                            value={newTool.shape}
                            onChange={handleInputChange}
                            style={{ width: "100%" }}
                        >
                            {shapes.map((shape) => (
                                <option key={shape} value={shape}>
                                    {shape.charAt(0).toUpperCase() + shape.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={handleAddTool}
                        style={{
                            marginTop: "10px",
                            padding: "5px 10px",
                            backgroundColor: "#007bff",
                            color: "white",
                            border: "none",
                            cursor: "pointer",
                        }}
                    >
                        Add Tool
                    </button>
                </div>
            )}


<div style={{height: addToolVisible ? "calc(100% - 225px - 20px)" : "calc(100% - 380px - 20px)"}}>
    <h4>Available Tools</h4>
    {tools.length === 0 ? (
        <p>No tools added yet.</p>
    ) : (
        <div
            style={{
                borderCollapse: "collapse", // Ensures borders collapse like in a traditional table
                width: "100%", // Full width
                tableLayout: "fixed", // Distribute space evenly for all columns
                height: "100%", // Default height when "Add Tool" is hidden
                overflowY: "auto", // Enable vertical scrolling
                border: "1px solid #ccc", // Table border
                backgroundColor: "#f9f9f9", // Light background
            }}
        >
            {/* Header Row */}
            <div
                style={{
                    display: "table-row",
                    fontWeight: "bold",
                    backgroundColor: "#eaeaea", // Light gray header background
                    borderBottom: "2px solid #ccc", // Bottom border for the header
                }}
            >
                <div
                    style={{
                        display: "table-cell",
                        textAlign: "center",
                        padding: "5px 10px",
                        border: "1px solid #ccc",
                        width: "10%", // Fixed width for the icon column
                    }}
                >
                    Icon
                </div>
                <div
                    style={{
                        display: "table-cell",
                        textAlign: "left",
                        padding: "5px 10px",
                        border: "1px solid #ccc",
                    }}
                >
                    Name
                </div>
                <div
                    style={{
                        display: "table-cell",
                        textAlign: "left",
                        border: "1px solid #ccc",
                        padding: "5px 10px",
                    }}
                >
                    Category
                </div>
            </div>

            {/* Tool Rows */}
            {tools
                .sort((a, b) => a.category.localeCompare(b.category)) // Sort tools alphabetically by category
                .map((tool, index) => (
                    <div
                        key={index}
                        style={{
                            display: "table-row",
                            border: "1px solid #ccc",
                        }}
                        draggable // Enable dragging
                        onDragStart={(e) => {
                            e.dataTransfer.setData(
                                "tool",
                                JSON.stringify({ ...tool, id: index, size: iconSize }) // Pass tool info as drag data
                            );
                        
                            // Create a custom drag image using an SVG element
                            const svgNamespace = "http://www.w3.org/2000/svg";
                            const svg = document.createElementNS(svgNamespace, "svg");
                            svg.setAttribute("width", "40");
                            svg.setAttribute("height", "40");
                            svg.setAttribute("xmlns", svgNamespace);
                            svg.style.position = "absolute"; // Ensure it's not visible as a floating element
                            svg.style.top = "-1000px"; // Move it far off-screen
                        
                            // Create the shape based on the tool's shape
                            const shape = document.createElementNS(svgNamespace, "path");
                            shape.setAttribute(
                                "d",
                                tool.shape === "circle"
                                    ? "M20 20 m -15, 0 a 15,15 0 1,0 30,0 a 15,15 0 1,0 -30,0" // Circle
                                    : tool.shape === "square"
                                    ? "M5 5 H35 V35 H5 Z" // Square
                                    : tool.shape === "diamond"
                                    ? "M20 5 L35 20 L20 35 L5 20 Z" // Diamond
                                    : "M40 12.4 L17.2 40 L1.6 25.2 L6.4 21.2 L17.2 31.2 L35.2 6.4 Z" // Checkmark
                            );
                            shape.setAttribute("fill", tool.color);
                            shape.setAttribute("opacity", "0.5");
                            svg.appendChild(shape);
                        
                            document.body.appendChild(svg); // Temporarily add the SVG to the DOM
                            e.dataTransfer.setDragImage(svg, 20, 20); // Center the drag image
                            setTimeout(() => document.body.removeChild(svg), 0); // Clean up immediately
                        }}
                        
                    >
                        <div
                            style={{
                                display: "table-cell",
                                textAlign: "center",
                                padding: "5px 10px",
                                borderRight: "1px solid #ccc",
                            }}
                        >
                            <span
                                style={{
                                    display: "inline-block",
                                    width: '20px',
                                    height: '20px',
                                    backgroundColor: tool.color,
                                    opacity: 0.5, // See-through effect
                                    clipPath: getClipPath(tool.shape),
                                }}
                            ></span>
                        </div>
                        <div
                            style={{
                                display: "table-cell",
                                textAlign: "left",
                                padding: "5px 10px",
                                borderRight: "1px solid #ccc",
                            }}
                        >
                            {tool.name}
                        </div>
                        <div
                            style={{
                                display: "table-cell",
                                textAlign: "left",
                                padding: "5px 10px",
                            }}
                        >
                            {tool.category}
                        </div>
                    </div>
                ))}
        </div>
    )}
</div>


        </div>
    );
};

// Function to return CSS clip-paths for predefined shapes
const getClipPath = (shape: string): string => {
    switch (shape) {
        case "circle":
            return "circle(50% at 50% 50%)";
        case "square":
            return "none"; // Default square
        case "diamond":
            return "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)";
        case "checkmark":
            return "polygon(100% 31%, 43% 100%, 4% 63%, 16% 53%, 43% 78%, 88% 22%)";
        default:
            return "none";
    }
};

export default ToolChest;
